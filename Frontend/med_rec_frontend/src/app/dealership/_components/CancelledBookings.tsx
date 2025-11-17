"use client"

import React, { useState, useEffect } from 'react'
import { AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

interface CancelledBooking {
  _id: string
  customerName: string
  customerPhone: string
  carName: string
  carModel: string
  carEngine: string
  carTransmission: string
  carColour: string
  carPrice: number
  amountPaid: number
  refundAmount: number
  cancellationReason: string
  cancelledAt: string
  soldByEmployeeId: {
    name: string
    email: string
  }
  notes: string
}

interface CancelledBookingsProps {
  dealershipId: string
}

export default function CancelledBookings({ dealershipId }: CancelledBookingsProps) {
  const [cancelledBookings, setCancelledBookings] = useState<CancelledBooking[]>([])
  const [filteredBookings, setFilteredBookings] = useState<CancelledBooking[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('cancelledAt')

  useEffect(() => {
    fetchCancelledBookings()
  }, [dealershipId])

  useEffect(() => {
    filterAndSortBookings()
  }, [cancelledBookings, searchQuery, sortBy])

  const fetchCancelledBookings = async () => {
    try {
      setLoading(true)
      const res = await fetch('http://localhost:8080/api/bookings/cancelled/all', {
        credentials: 'include'
      })

      if (res.ok) {
        const data = await res.json()
        setCancelledBookings(data.cancelledBookings || [])
      } else {
        toast.error('Failed to fetch cancelled bookings')
      }
    } catch (error) {
      console.error('Error fetching cancelled bookings:', error)
      toast.error('Network error while fetching cancelled bookings')
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortBookings = () => {
    let filtered = [...cancelledBookings]

    // Search by customer name, phone, or car model
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        b =>
          b.customerName.toLowerCase().includes(query) ||
          b.customerPhone.includes(query) ||
          b.carModel.toLowerCase().includes(query)
      )
    }

    // Sort
    if (sortBy === 'cancelledAt') {
      filtered.sort((a, b) => new Date(b.cancelledAt).getTime() - new Date(a.cancelledAt).getTime())
    } else if (sortBy === 'amount') {
      filtered.sort((a, b) => b.carPrice - a.carPrice)
    } else if (sortBy === 'refund') {
      filtered.sort((a, b) => b.refundAmount - a.refundAmount)
    }

    setFilteredBookings(filtered)
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-'
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch {
      return dateStr
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Cancelled Bookings</h2>
        <p className="text-sm text-gray-600 mt-1">View all cancelled car bookings and refunds</p>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Search */}
          <div>
            <label className="text-sm text-gray-600">Search</label>
            <input
              type="text"
              placeholder="Customer, phone, or car model..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Sort By */}
          <div>
            <label className="text-sm text-gray-600">Sort By</label>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
            >
              <option value="cancelledAt">Most Recent</option>
              <option value="amount">Price (High to Low)</option>
              <option value="refund">Refund Amount</option>
            </select>
          </div>

          {/* Results Count */}
          <div className="flex items-end">
            <div className="text-sm text-gray-600">
              Showing <span className="font-semibold">{filteredBookings.length}</span> of{' '}
              <span className="font-semibold">{cancelledBookings.length}</span> cancelled bookings
            </div>
          </div>
        </div>
      </div>

      {/* Cancelled Bookings Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">No cancelled bookings found</p>
            {searchQuery && <p className="text-sm text-gray-500 mt-1">Try adjusting your search</p>}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-red-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Customer</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Car Details</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Price Details</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Refund Amount</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Cancellation Reason</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Cancelled By</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Cancelled Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredBookings.map(booking => (
                  <tr key={booking._id} className="hover:bg-red-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{booking.customerName}</p>
                        <p className="text-sm text-gray-600">{booking.customerPhone}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{booking.carName}</p>
                        <p className="text-sm text-gray-600">{booking.carModel}</p>
                        <p className="text-xs text-gray-500">
                          {booking.carEngine} • {booking.carTransmission}
                        </p>
                        <p className="text-sm text-gray-600">{booking.carColour}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">₹{booking.carPrice.toLocaleString('en-IN')}</p>
                        <p className="text-sm text-gray-600">
                          Paid: ₹{booking.amountPaid.toLocaleString('en-IN')}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-orange-600">
                        ₹{booking.refundAmount.toLocaleString('en-IN')}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-700 max-w-xs">
                        {booking.cancellationReason}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{booking.soldByEmployeeId?.name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">{formatDate(booking.cancelledAt)}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {cancelledBookings.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-red-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Total Cancelled</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{cancelledBookings.length}</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Total Refunded</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">
                ₹{cancelledBookings.reduce((sum, b) => sum + b.refundAmount, 0).toLocaleString('en-IN')}
              </p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Total Car Price</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                ₹{cancelledBookings.reduce((sum, b) => sum + b.carPrice, 0).toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
