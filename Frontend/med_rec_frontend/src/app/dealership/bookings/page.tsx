"use client"

import React, { useState } from 'react'
import BookingsList from '../_components/BookingsList'
import CancelledBookings from '../_components/CancelledBookings'
import CompletedBookings from '../_components/CompletedBookings'
import Navbar from '../_components/Navbar'
import { useAuth } from '@/app/context/AuthContext'

export default function BookingsPage() {
  const [activeTab, setActiveTab] = useState('active')
  const { user, isLoggedIn } = useAuth()

  if (!isLoggedIn || !user?.dealershipId) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-600">Loading dealership information...</p>
      </div>
    )
  }

  const dealershipId = user.dealershipId

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Bookings Management</h1>
            <p className="text-gray-600 mt-1">Manage car bookings and track deliveries</p>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="border-b border-gray-200 flex">
              <button
                onClick={() => setActiveTab('active')}
                className={`flex-1 px-6 py-4 font-medium text-center transition-colors ${
                  activeTab === 'active'
                    ? 'text-purple-600 border-b-2 border-purple-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Active Bookings
              </button>
              <button
                onClick={() => setActiveTab('completed')}
                className={`flex-1 px-6 py-4 font-medium text-center transition-colors ${
                  activeTab === 'completed'
                    ? 'text-green-600 border-b-2 border-green-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Completed Bookings
              </button>
              <button
                onClick={() => setActiveTab('cancelled')}
                className={`flex-1 px-6 py-4 font-medium text-center transition-colors ${
                  activeTab === 'cancelled'
                    ? 'text-red-600 border-b-2 border-red-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Cancelled Bookings
              </button>
            </div>

            <div className="p-6">
              {activeTab === 'active' && (
                <BookingsList dealershipId={dealershipId} />
              )}
              {activeTab === 'completed' && (
                <CompletedBookings dealershipId={dealershipId} />
              )}
              {activeTab === 'cancelled' && (
                <CancelledBookings dealershipId={dealershipId} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
