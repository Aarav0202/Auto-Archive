"use client"

import React, { useState, useEffect } from 'react'
import { AlertCircle, Clock, Truck, Check } from 'lucide-react'
import toast from 'react-hot-toast'

interface CompletedBooking {
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
  remainingAmount: number
  estimatedDeliveryDate: string
  actualDeliveryDate?: string
  status: string
  soldByEmployeeId: {
    name: string
    email: string
  }
  createdAt: string
}

interface CompletedBookingsProps {
  dealershipId: string
}

export default function CompletedBookings({ dealershipId }: CompletedBookingsProps) {
  const [bookings, setBookings] = useState<CompletedBooking[]>([])
  const [filteredBookings, setFilteredBookings] = useState<CompletedBooking[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('completedDate')

  useEffect(() => {
    fetchBookings()
  }, [dealershipId])

  useEffect(() => {
    filterAndSortBookings()
  }, [bookings, searchQuery, sortBy])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const res = await fetch('http://localhost:8080/api/bookings/all', {
        credentials: 'include'
      })

      if (res.ok) {
        const data = await res.json()
        // Filter only delivered bookings
        const deliveredBookings = (data.bookings || []).filter((b: any) => b.status === 'Delivered')
        setBookings(deliveredBookings)
      } else {
        toast.error('Failed to fetch bookings')
      }
    } catch (error) {
      console.error('Error fetching bookings:', error)
      toast.error('Network error while fetching bookings')
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortBookings = () => {
    let filtered = [...bookings]

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
    if (sortBy === 'completedDate') {
      filtered.sort((a, b) => new Date(b.actualDeliveryDate || b.createdAt).getTime() - new Date(a.actualDeliveryDate || a.createdAt).getTime())
    } else if (sortBy === 'estimatedDate') {
      filtered.sort((a, b) => new Date(a.estimatedDeliveryDate).getTime() - new Date(b.estimatedDeliveryDate).getTime())
    } else if (sortBy === 'amount') {
      filtered.sort((a, b) => b.carPrice - a.carPrice)
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

  const getDaysToDeliver = (estimatedDate: string, actualDate?: string) => {
    if (!estimatedDate) return '-'
    try {
      const estimated = new Date(estimatedDate).getTime()
      const actual = actualDate ? new Date(actualDate).getTime() : new Date().getTime()
      const days = Math.floor((actual - estimated) / (1000 * 60 * 60 * 24))
      if (days === 0) return 'On time'
      if (days < 0) return `${Math.abs(days)} days early`
      return `${days} days late`
    } catch {
      return '-'
    }
  }

  return (
    <div className="space-y-4">
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
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Sort By */}
          <div>
            <label className="text-sm text-gray-600">Sort By</label>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
            >
              <option value="completedDate">Latest Delivered</option>
              <option value="estimatedDate">Estimated Delivery</option>
              <option value="amount">Price (High to Low)</option>
            </select>
          </div>

          {/* Results Count */}
          <div className="flex items-end">
            <div className="text-sm text-gray-600">
              Showing <span className="font-semibold">{filteredBookings.length}</span> of{' '}
              <span className="font-semibold">{bookings.length}</span> completed bookings
            </div>
          </div>
        </div>
      </div>

      {/* Completed Bookings Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">No completed bookings found</p>
            {searchQuery && <p className="text-sm text-gray-500 mt-1">Try adjusting your search</p>}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Customer</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Car Details</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Price Details</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Delivery Timeline</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Sold By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredBookings.map(booking => (
                  <tr key={booking._id} className="hover:bg-gray-50 transition-colors">
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
                        <p className="text-sm font-medium text-green-600">
                          Collected: ₹{booking.amountPaid.toLocaleString('en-IN')}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Estimated: {formatDate(booking.estimatedDeliveryDate)}</p>
                        <p className="text-sm text-gray-600">Delivered: {formatDate(booking.actualDeliveryDate)}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          <span className={getDaysToDeliver(booking.estimatedDeliveryDate, booking.actualDeliveryDate).includes('late') ? 'text-orange-600 font-medium' : 'text-green-600'}>
                            {getDaysToDeliver(booking.estimatedDeliveryDate, booking.actualDeliveryDate)}
                          </span>
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{booking.soldByEmployeeId?.name}</p>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
