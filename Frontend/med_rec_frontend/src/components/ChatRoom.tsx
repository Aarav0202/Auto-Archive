'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { 
  joinChatRoom, 
  leaveChatRoom, 
  sendChatMessage, 
  onChatMessage,
  emitTypingIndicator,
  onUserTyping,
  onChatUserJoined,
  onMessageDeleted,
  initializeSocket,
  isSocketConnected
} from '@/lib/socket';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Smile, Paperclip, Trash2 } from 'lucide-react';

interface ChatMessage {
  _id?: string;
  senderId: string;
  senderName: string;
  senderEmail: string;
  senderRole: 'customer' | 'carDealership' | 'employee';
  message: string;
  issueType: 'general' | 'problem' | 'question' | 'solution' | 'update';
  carModel: { companyName: string; vehicleName: string; model?: string; year?: number };
  timestamp?: string;
  createdAt?: string;
}

interface Props {
  companyName: string;
  vehicleName: string;
  displayName: string;
}

export function ChatRoom({ companyName, vehicleName, displayName }: Props) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [issueType, setIssueType] = useState('general');
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>();
  const listenersAttachedRef = useRef(false);

  // Load message history on mount
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const response = await fetch(
          `http://localhost:8080/api/chat/history/${companyName}/${vehicleName}?limit=50`,
          { credentials: 'include' }
        );
        const data = await response.json();
        if (data.success) {
          setMessages(data.messages || []);
        }
      } catch (error) {
        console.error('Error loading chat history:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadHistory();
  }, [companyName, vehicleName]);

  // Join room and setup listeners (only once)
  useEffect(() => {
    if (listenersAttachedRef.current) return;

    // Wait for socket to be initialized
    initializeSocket().then(() => {
      listenersAttachedRef.current = true;

      joinChatRoom(companyName, vehicleName);

      const unsubscribeMessages = onChatMessage((messageData: any) => {
        // Prevent duplicates by checking if message already exists
        setMessages(prev => {
          const exists = prev.some(msg => msg._id === messageData._id);
          if (exists) return prev;
          return [...prev, messageData];
        });
      });

      const unsubscribeJoined = onChatUserJoined((data: any) => {
        console.log(data.message);
      });

      const unsubscribeTyping = onUserTyping((data: any) => {
        if (data.isTyping) {
          setTypingUsers(prev => new Set([...prev, data.userId]));
        } else {
          setTypingUsers(prev => {
            const updated = new Set(prev);
            updated.delete(data.userId);
            return updated;
          });
        }
      });

      const unsubscribeDeleted = onMessageDeleted((data: any) => {
        console.log('🗑️ Message deleted event received:', data.messageId);
        setMessages(prev => prev.filter(msg => msg._id !== data.messageId));
      });

      return () => {
        listenersAttachedRef.current = false;
        unsubscribeMessages();
        unsubscribeJoined();
        unsubscribeTyping();
        unsubscribeDeleted();
        leaveChatRoom(companyName, vehicleName);
      };
    });
  }, [companyName, vehicleName]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputMessage.trim()) return;

    try {
      const response = await fetch('http://localhost:8080/api/chat/send', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName,
          vehicleName,
          message: inputMessage,
          issueType
        })
      });

      if (response.ok) {
        // Don't add message here - wait for Socket.IO broadcast
        setInputMessage('');
        setIsTyping(false);
        emitTypingIndicator(companyName, vehicleName, false);
      } else {
        console.error('Failed to send message:', response.statusText);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }, [companyName, vehicleName, inputMessage, issueType]);

  const handleTyping = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);

    if (!isTyping) {
      setIsTyping(true);
      emitTypingIndicator(companyName, vehicleName, true);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      emitTypingIndicator(companyName, vehicleName, false);
    }, 3000);
  }, [companyName, vehicleName, isTyping]);

  const handleDeleteMessage = useCallback(async (messageId: string | undefined) => {
    if (!messageId) {
      console.error('Message ID is required to delete');
      return;
    }

    if (!confirm('Are you sure you want to delete this message?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/chat/${messageId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        // Remove the message from the list
        setMessages(prev => prev.filter(msg => msg._id !== messageId));
      } else {
        console.error('Failed to delete message:', response.statusText);
        alert('Failed to delete message');
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      alert('Error deleting message');
    }
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 text-white px-6 py-4 shadow-lg border-b-4 border-blue-700">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex-1">
            <h2 className="text-2xl font-bold tracking-tight">{displayName}</h2>
            <p className="text-sm text-blue-100 mt-1">💬 Real-time conversation</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-3 w-3 bg-green-300 rounded-full animate-pulse" title="Connected"></div>
            <span className="text-sm font-medium">Online</span>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 scroll-smooth bg-gradient-to-b from-gray-50 to-white">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 font-medium">Loading messages...</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-5xl mb-4">💬</div>
              <p className="text-gray-500 text-lg font-medium">No messages yet</p>
              <p className="text-gray-400 text-sm mt-2">Be the first to start the conversation!</p>
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isOwnMessage = user?.id === msg.senderId;
            return (
              <div key={idx} className={`flex gap-3 animate-fadeIn group ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm ${
                    msg.senderRole === 'carDealership' 
                      ? 'bg-gradient-to-br from-purple-500 to-pink-500' 
                      : 'bg-gradient-to-br from-blue-500 to-cyan-500'
                  }`}>
                    {msg.senderName?.charAt(0).toUpperCase() || '?'}
                  </div>
                </div>

                {/* Message Content */}
                <div className={`flex-1 max-w-xl ${isOwnMessage ? 'text-right' : ''}`}>
                  {!isOwnMessage && (
                    <div className="flex items-baseline gap-2 mb-1 flex-wrap">
                      <span className="font-semibold text-gray-900">{msg.senderName || 'Anonymous'}</span>
                      <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                        {msg.carModel?.model} - {msg.carModel?.year}
                      </span>
                      {msg.senderRole === 'carDealership' && (
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-sm">
                          🏢 Official
                        </span>
                      )}
                      <span className="text-xs text-gray-500 ml-auto">
                        {new Date(msg.timestamp || msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  )}

                  {isOwnMessage && (
                    <div className="flex items-baseline gap-2 mb-1 justify-end">
                      <span className="text-xs text-gray-500">
                        {new Date(msg.timestamp || msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="font-semibold text-gray-900">You</span>
                    </div>
                  )}

                  {/* Message Bubble with Delete Button */}
                  <div className={`flex gap-2 items-start ${isOwnMessage ? 'flex-row-reverse justify-end' : ''}`}>
                    <div className={`rounded-xl px-4 py-3 shadow-sm transition-all duration-200 flex-1 ${
                      isOwnMessage
                        ? 'bg-gradient-to-br from-blue-500 to-cyan-600 text-white border border-blue-400'
                        : msg.senderRole === 'carDealership'
                          ? 'bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200'
                          : 'bg-white border border-gray-200'
                    }`}>
                      <p className={`text-sm leading-relaxed break-words ${isOwnMessage ? 'text-white' : 'text-gray-800'}`}>{msg.message}</p>
                      
                      {/* Issue Type Badge */}
                      {msg.issueType !== 'general' && (
                        <div className="mt-2 flex gap-2">
                          <span className={`inline-block px-2.5 py-1 text-xs font-medium rounded-full ${
                            isOwnMessage
                              ? 'bg-blue-400 text-white'
                              : {
                                'problem': 'bg-red-100 text-red-700',
                                'question': 'bg-yellow-100 text-yellow-700',
                                'solution': 'bg-green-100 text-green-700',
                                'update': 'bg-blue-100 text-blue-700'
                              }[msg.issueType] || 'bg-gray-100 text-gray-700'
                          }`}>
                            {msg.issueType.charAt(0).toUpperCase() + msg.issueType.slice(1)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Delete Button - Only for own messages, visible on Hover */}
                    {isOwnMessage && (
                      <button
                        onClick={() => handleDeleteMessage(msg._id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg flex-shrink-0 cursor-pointer"
                        title="Delete message"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Typing Indicator */}
        {typingUsers.size > 0 && (
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                <div className="text-xs text-gray-600">✎</div>
              </div>
            </div>
            <div className="flex items-center gap-1 bg-gray-200 rounded-full px-4 py-2">
              <div className="animate-bounce w-2 h-2 bg-gray-600 rounded-full" style={{ animationDelay: '0ms' }}></div>
              <div className="animate-bounce w-2 h-2 bg-gray-600 rounded-full" style={{ animationDelay: '150ms' }}></div>
              <div className="animate-bounce w-2 h-2 bg-gray-600 rounded-full" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Fixed Bottom Input */}
      <div className="sticky bottom-0 z-40 bg-white border-t-2 border-gray-200 p-4 shadow-2xl">
        <form onSubmit={handleSendMessage} className="max-w-7xl mx-auto space-y-3">
          {/* Issue Type Selector */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {['general', 'problem', 'question', 'solution', 'update'].map(type => (
              <button
                key={type}
                type="button"
                onClick={() => setIssueType(type)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  issueType === type
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>

          {/* Message Input */}
          <div className="flex gap-2 items-end bg-gray-50 p-3 rounded-xl border border-gray-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 transition-all">
            <button
              type="button"
              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-white rounded-lg transition-colors flex-shrink-0 cursor-pointer"
              title="Attach file"
            >
              <Paperclip size={20} />
            </button>

            <Input
              type="text"
              placeholder="Type your message... Press Enter to send"
              value={inputMessage}
              onChange={handleTyping}
              className="flex-1 bg-transparent border-0 focus:outline-none focus:ring-0 text-gray-800 placeholder:text-gray-500"
            />

            <button
              type="button"
              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-white rounded-lg transition-colors flex-shrink-0 cursor-pointer"
              title="Add emoji"
            >
              <Smile size={20} />
            </button>

            <Button 
              type="submit" 
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all px-6 py-2 flex-shrink-0 font-semibold cursor-pointer"
              title="Send message (Enter)"
            >
              <Send size={18} />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
