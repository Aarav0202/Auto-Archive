'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { 
  joinChatRoom, 
  leaveChatRoom, 
  sendChatMessage, 
  onChatMessage,
  emitTypingIndicator,
  onUserTyping,
  onChatUserJoined
} from '@/lib/socket';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';

interface ChatMessage {
  socketId: string;
  message: string;
  issueType: string;
  carModel: { companyName: string; vehicleName: string };
  timestamp: string;
}

interface Props {
  companyName: string;
  vehicleName: string;
  displayName: string;
}

export function ChatRoom({ companyName, vehicleName, displayName }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [issueType, setIssueType] = useState('general');
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const listenersAttachedRef = useRef(false);

  // Load message history on mount
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const response = await fetch(
          `/api/chat/history/${companyName}/${vehicleName}?limit=50`
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
    listenersAttachedRef.current = true;

    joinChatRoom(companyName, vehicleName);

    const unsubscribeMessages = onChatMessage((messageData: any) => {
      setMessages(prev => [...prev, messageData]);
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

    return () => {
      listenersAttachedRef.current = false;
      unsubscribeMessages();
      unsubscribeJoined();
      unsubscribeTyping();
      leaveChatRoom(companyName, vehicleName);
    };
  }, [companyName, vehicleName]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputMessage.trim()) return;

    try {
      const response = await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName,
          vehicleName,
          message: inputMessage,
          issueType
        })
      });

      if (response.ok) {
        sendChatMessage(companyName, vehicleName, inputMessage, issueType);
        setInputMessage('');
        setIsTyping(false);
        emitTypingIndicator(companyName, vehicleName, false);
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
    <div className="flex flex-col h-screen bg-white rounded-lg shadow overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4">
        <h2 className="text-xl font-bold">{displayName} Chat Room</h2>
        <p className="text-sm text-blue-100">Real-time discussions & support</p>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-400 text-center">
              No messages yet. Start the conversation!
            </p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} className="flex justify-start">
              <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-lg bg-white shadow border border-gray-200">
                <p className="font-semibold text-sm text-gray-900">
                  User {msg.socketId.substring(0, 8)}
                </p>
                <p className="text-sm text-gray-700 mt-1">{msg.message}</p>
                {msg.issueType !== 'general' && (
                  <span className="inline-block mt-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                    {msg.issueType}
                  </span>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))
        )}

        {typingUsers.size > 0 && (
          <div className="text-sm text-gray-500 italic">
            {typingUsers.size} user(s) typing...
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSendMessage} className="border-t bg-white p-4 space-y-3">
        <div className="flex gap-2">
          <select
            value={issueType}
            onChange={(e) => setIssueType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded text-sm bg-white"
          >
            <option value="general">General</option>
            <option value="problem">Problem</option>
            <option value="question">Question</option>
            <option value="solution">Solution</option>
            <option value="update">Update</option>
          </select>

          <Input
            type="text"
            placeholder="Type your message..."
            value={inputMessage}
            onChange={handleTyping}
            className="flex-1"
          />

          <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-700">
            <Send size={16} />
          </Button>
        </div>
      </form>
    </div>
  );
}
