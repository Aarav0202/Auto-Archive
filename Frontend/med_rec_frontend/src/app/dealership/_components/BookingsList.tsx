"use client"

import React, { useState, useEffect } from 'react'
import { AlertCircle, Trash2, Edit2, Check, Clock, Truck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'
import AddBookingDialog from './AddBookingDialog'
import CancelBookingDialog from './CancelBookingDialog'
import CompleteDeliveryDialog from './CompleteDeliveryDialog'

interface Booking {
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

interface BookingsListProps {
  dealershipId: string
}

export default function BookingsList({ dealershipId }: BookingsListProps) {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(false)
  const [openAddDialog, setOpenAddDialog] = useState(false)
  const [openCancelDialog, setOpenCancelDialog] = useState(false)
  const [openCompleteDeliveryDialog, setOpenCompleteDeliveryDialog] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('createdAt')

  useEffect(() => {
    fetchBookings()
  }, [dealershipId])

  useEffect(() => {
    filterAndSortBookings()
  }, [bookings, filterStatus, searchQuery, sortBy])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const res = await fetch('http://localhost:8080/api/bookings/all', {
        credentials: 'include'
      })

      if (res.ok) {
        const data = await res.json()
        setBookings(data.bookings || [])
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

    // Exclude Delivered and Cancelled bookings
    filtered = filtered.filter(b => b.status !== 'Delivered' && b.status !== 'Cancelled')

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(b => b.status === filterStatus)
    }

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
    if (sortBy === 'createdAt') {
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    } else if (sortBy === 'deliveryDate') {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'In Progress':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'Delivered':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'Cancelled':
        return 'bg-red-100 text-red-800 border-red-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending':
        return <Clock className="w-4 h-4" />
      case 'In Progress':
        return <Truck className="w-4 h-4" />
      case 'Delivered':
        return <Check className="w-4 h-4" />
      default:
        return null
    }
  }

  const handleCancelClick = (booking: Booking) => {
    setSelectedBooking(booking)
    setOpenCancelDialog(true)
  }

  const handleCompleteDeliveryClick = (booking: Booking) => {
    setSelectedBooking(booking)
    setOpenCompleteDeliveryDialog(true)
  }

  const handleCancelConfirm = async () => {
    if (!selectedBooking) return

    try {
      const res = await fetch(`http://localhost:8080/api/bookings/${selectedBooking._id}/cancel`, {
        method: 'POST',
        credentials: 'include'
      })

      if (res.ok) {
        toast.success('Booking cancelled successfully')
        fetchBookings()
        setOpenCancelDialog(false)
        setSelectedBooking(null)
      } else {
        const data = await res.json()
        toast.error(data.message || 'Failed to cancel booking')
      }
    } catch (error) {
      console.error('Error cancelling booking:', error)
      toast.error('Network error while cancelling booking')
    }
  }

  return (
    <div className="space-y-4">
      {/* Header with Add Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Car Bookings</h2>
        <Button
          onClick={() => setOpenAddDialog(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white cursor-pointer"
        >
          + Add New Booking
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
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

          {/* Status Filter */}
          <div>
            <label className="text-sm text-gray-600">Status</label>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
            >
              <option value="all">All Bookings</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Delivered">Delivered</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="text-sm text-gray-600">Sort By</label>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
            >
              <option value="createdAt">Latest</option>
              <option value="deliveryDate">Delivery Date</option>
              <option value="amount">Price (High to Low)</option>
            </select>
          </div>

          {/* Results Count */}
          <div className="flex items-end">
            <div className="text-sm text-gray-600">
              Showing <span className="font-semibold">{filteredBookings.length}</span> of{' '}
              <span className="font-semibold">{bookings.length}</span> bookings
            </div>
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">No bookings found</p>
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
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Delivery</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Sold By</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
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
                        <p className="text-sm font-medium text-orange-600">
                          Pending: ₹{booking.remainingAmount.toLocaleString('en-IN')}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{formatDate(booking.estimatedDeliveryDate)}</p>
                        {booking.actualDeliveryDate && (
                          <p className="text-sm text-gray-600">Delivered: {formatDate(booking.actualDeliveryDate)}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{booking.soldByEmployeeId?.name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-medium ${getStatusColor(booking.status)}`}>
                        {getStatusIcon(booking.status)}
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleCompleteDeliveryClick(booking)}
                          disabled={booking.status === 'Cancelled' || booking.status === 'Delivered'}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                          title="Complete Delivery"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleCancelClick(booking)}
                          disabled={booking.status === 'Cancelled' || booking.status === 'Delivered'}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                          title="Cancel Booking"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Booking Dialog */}
      <AddBookingDialog
        open={openAddDialog}
        onOpenChange={setOpenAddDialog}
        dealershipId={dealershipId}
        onBookingAdded={fetchBookings}
      />

      {/* Cancel Booking Dialog */}
      <CancelBookingDialog
        open={openCancelDialog}
        onOpenChange={setOpenCancelDialog}
        booking={selectedBooking}
        onConfirm={handleCancelConfirm}
      />

      {/* Complete Delivery Dialog */}
      <CompleteDeliveryDialog
        open={openCompleteDeliveryDialog}
        onOpenChange={setOpenCompleteDeliveryDialog}
        booking={selectedBooking}
        onConfirm={fetchBookings}
      />
    </div>
  )
}
