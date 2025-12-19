'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { initializeSocket } from '@/lib/socket';
import { ChatRoom } from '@/components/ChatRoom';

interface CarModel {
  companyName: string;
  vehicleName: string;
  displayName: string;
  roomId: string;
}

export default function ChatPage() {
  const [chatRooms, setChatRooms] = useState<CarModel[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<CarModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Initialize Socket.IO on mount
  useEffect(() => {
    const connect = async () => {
      try {
        await initializeSocket();
        console.log('Socket initialized successfully');
      } catch (error) {
        console.error('Failed to initialize socket:', error);
      }
    };
    connect();
  }, []);

  // Fetch available chat rooms
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/chat/models/available', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        console.log('Chat API Status:', response.status);
        
        if (!response.ok) {
          const text = await response.text();
          console.error('API Error:', response.status, text);
          setIsLoading(false);
          return;
        }

        const data = await response.json();
        console.log('Chat API Response:', data);
        
        if (data.success) {
          console.log('Setting chat rooms:', data.carModels);
          setChatRooms(data.carModels || []);
        } else {
          console.error('Failed to fetch chat rooms:', data.message);
        }
      } catch (error) {
        console.error('Error fetching chat rooms:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRooms();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading chat rooms...</p>
        </div>
      </div>
    );
  }

  if (selectedRoom) {
    return (
      <div className="flex flex-col h-screen bg-white">
        {/* Back Button Header with Title */}
        <div className="sticky top-0 z-50 bg-white border-b-2 border-gray-200 px-4 py-3 shadow-md">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSelectedRoom(null)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg transition-all shadow-md hover:shadow-lg font-semibold flex-shrink-0 cursor-pointer"
            >
              <span className="text-lg">←</span> Back
            </button>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{selectedRoom.displayName}</h2>
              <p className="text-xs text-gray-500">{selectedRoom.model} - {selectedRoom.year}</p>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          <ChatRoom
            companyName={selectedRoom.companyName}
            vehicleName={selectedRoom.vehicleName}
            displayName={selectedRoom.displayName}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
            💬 Chat Rooms
          </h1>
          <p className="text-gray-600 text-lg">
            Connect with other owners and dealerships about your vehicles
          </p>
        </div>

        {chatRooms.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
            <div className="text-5xl mb-4">🚗</div>
            <p className="text-gray-600 text-lg mb-4">
              No vehicles registered yet
            </p>
            <p className="text-gray-500 mb-6">
              Add a vehicle to your profile to join chat rooms and connect with other owners
            </p>
            <button
              onClick={() => router.push('/customer/home')}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg font-semibold transition-all shadow-md hover:shadow-lg cursor-pointer"
            >
              Go to Dashboard
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {chatRooms.map((room) => (
              <button
                key={`${room.companyName}-${room.vehicleName}`}
                onClick={() => setSelectedRoom(room)}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 text-left border border-gray-100 hover:border-blue-300 hover:-translate-y-1 group cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {room.displayName}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 font-mono">
                      {room.model} - {room.year || 'N/A'}
                    </p>
                  </div>
                  <div className="px-3 py-1 bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 rounded-full text-xs font-bold">
                    Active
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-4">
                  Join conversations with other {room.displayName} owners
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <div className="h-2 w-2 bg-green-500 rounded-full"></div> Active now
                  </span>
                  <span className="text-blue-600 font-semibold group-hover:gap-2 transition-all flex items-center gap-1">
                    Open <span>→</span>
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
