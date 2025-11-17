'use client'

import React, { useState } from 'react'
import Navbar from '../_components/Navbar'
import PendingServiceRequests from '../_components/PendingServiceRequests'
import ScheduledServicesSimplified from '../_components/ScheduledServicesSimplified'
import { Clock, Calendar, Wrench } from 'lucide-react'

const ServiceStationPage = () => {
  const [activeTab, setActiveTab] = useState<'pending' | 'scheduled'>('pending')
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  return (
    <>
      <Navbar />
      <div className="container mx-auto p-6 pt-24">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
              <Wrench className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Service Station
            </h1>
          </div>
          <p className="text-gray-600 ml-14">Manage vehicle services and appointments</p>
        </div>
        
        {/* Tab Navigation */}
        <div className="mb-8 border-b border-gray-200">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-4 py-3 font-semibold transition-all duration-200 border-b-2 ${
                activeTab === 'pending'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Pending Requests
              </div>
            </button>
            <button
              onClick={() => setActiveTab('scheduled')}
              className={`px-4 py-3 font-semibold transition-all duration-200 border-b-2 ${
                activeTab === 'scheduled'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Scheduled Services
              </div>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg">
          {activeTab === 'pending' && (
            <PendingServiceRequests onRequestUpdated={() => setRefreshTrigger(prev => prev + 1)} />
          )}
          {activeTab === 'scheduled' && (
            <ScheduledServicesSimplified onServiceUpdated={() => setRefreshTrigger(prev => prev + 1)} />
          )}
        </div>
      </div>
    </>
  )
}

export default ServiceStationPage