"use client"

import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { 
  Car,
  ChevronDown,
  ChevronUp,
  DollarSign,
  User,
  Phone,
  Calendar,
  AlertCircle,
  Loader2
} from 'lucide-react'
import toast from 'react-hot-toast'

interface SaleBooking {
  _id: string
  customerName: string
  customerPhone: string
  customerEmail: string
  carName: string
  carModel: string
  carEngine: string
  carTransmission: string
  carColour: string
  carPrice: number
  amountPaid: number
  remainingAmount: number
  estimatedDeliveryDate: string
  actualDeliveryDate: string
  status: string
  createdAt: string
}

interface Employee {
  _id: string
  name: string
  email: string
  phone: string
  position: string
  department: string
  carsSold: number
  salesTarget: number
}

interface EmployeeSalesHistoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  employee: Employee | null
}

export const EmployeeSalesHistoryDialog = ({ 
  open, 
  onOpenChange, 
  employee 
}: EmployeeSalesHistoryDialogProps) => {
  const [bookings, setBookings] = useState<SaleBooking[]>([])
  const [loading, setLoading] = useState(false)
  const [expandedBooking, setExpandedBooking] = useState<string | null>(null)
  const [totalRevenue, setTotalRevenue] = useState(0)

  useEffect(() => {
    if (open && employee) {
      fetchSalesHistory()
    }
  }, [open, employee])

  const fetchSalesHistory = async () => {
    if (!employee) return

    try {
      setLoading(true)
      const res = await fetch(
        `http://localhost:8080/api/bookings/employee/${employee._id}/completed`,
        {
          credentials: 'include'
        }
      )

      if (res.ok) {
        const data = await res.json()
        setBookings(data.bookings || [])
        setTotalRevenue(data.totalRevenue || 0)
      } else {
        toast.error('Failed to fetch sales history')
      }
    } catch (error) {
      console.error('Error fetching sales history:', error)
      toast.error('Network error while fetching sales history')
    } finally {
      setLoading(false)
    }
  }

  if (!employee) return null

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getDeliveryStatus = (estimated: string, actual: string) => {
    const estimatedDate = new Date(estimated)
    const actualDate = new Date(actual)
    
    if (actualDate <= estimatedDate) {
      return { text: 'On Time', color: 'text-green-600', bgColor: 'bg-green-100' }
    } else {
      const daysLate = Math.ceil((actualDate.getTime() - estimatedDate.getTime()) / (1000 * 60 * 60 * 24))
      return { text: `${daysLate} days late`, color: 'text-red-600', bgColor: 'bg-red-100' }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
              <Car className="w-5 h-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold text-gray-900">
                Sales History - {employee.name}
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-600 mt-1">
                All completed car deliveries by {employee.name}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-gray-500">
            <AlertCircle className="w-8 h-8 mb-2 text-gray-400" />
            <p className="text-sm">No completed sales yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Summary Card */}
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-200">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-600">Total Sales</p>
                  <p className="text-2xl font-bold text-gray-900">{bookings.length}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Total Revenue</p>
                  <p className="text-xl font-bold text-green-600">{formatCurrency(totalRevenue)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Avg Car Price</p>
                  <p className="text-xl font-bold text-blue-600">
                    {formatCurrency(totalRevenue / bookings.length)}
                  </p>
                </div>
              </div>
            </div>

            {/* Sales List */}
            <div className="space-y-2">
              {bookings.map((booking) => {
                const deliveryStatus = getDeliveryStatus(
                  booking.estimatedDeliveryDate,
                  booking.actualDeliveryDate
                )
                const isExpanded = expandedBooking === booking._id

                return (
                  <div
                    key={booking._id}
                    className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                  >
                    {/* Collapsed View */}
                    <div
                      className="p-4 bg-gray-50 hover:bg-gray-100 cursor-pointer flex items-center justify-between"
                      onClick={() => setExpandedBooking(isExpanded ? null : booking._id)}
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Car className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">
                            {booking.carName} {booking.carModel}
                          </h4>
                          <div className="flex items-center gap-3 mt-1">
                            <div className="flex items-center gap-1 text-xs text-gray-600">
                              <User className="w-3 h-3" />
                              {booking.customerName}
                            </div>
                            <div className={`text-xs px-2 py-1 rounded ${deliveryStatus.bgColor} ${deliveryStatus.color}`}>
                              {deliveryStatus.text}
                            </div>
                          </div>
                        </div>
                        <div className="text-right mr-4">
                          <p className="font-bold text-gray-900">
                            {formatCurrency(booking.carPrice)}
                          </p>
                          <p className="text-xs text-gray-600">
                            {formatDate(booking.actualDeliveryDate)}
                          </p>
                        </div>
                      </div>
                      <button className="p-1 hover:bg-gray-200 rounded">
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-gray-600" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-600" />
                        )}
                      </button>
                    </div>

                    {/* Expanded View */}
                    {isExpanded && (
                      <div className="border-t border-gray-200 p-4 bg-white space-y-3">
                        {/* Customer Info */}
                        <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                          <h5 className="font-semibold text-green-900 text-sm mb-2">Customer Information</h5>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-gray-500" />
                              <div>
                                <p className="text-xs text-gray-600">Name</p>
                                <p className="font-medium text-gray-900">{booking.customerName}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-gray-500" />
                              <div>
                                <p className="text-xs text-gray-600">Phone</p>
                                <p className="font-medium text-gray-900">{booking.customerPhone}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Vehicle Info */}
                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                          <h5 className="font-semibold text-blue-900 text-sm mb-2">Vehicle Details</h5>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <p className="text-xs text-gray-600">Engine</p>
                              <p className="font-medium text-gray-900">{booking.carEngine}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600">Transmission</p>
                              <p className="font-medium text-gray-900">{booking.carTransmission}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600">Colour</p>
                              <p className="font-medium text-gray-900">{booking.carColour}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-4 h-4 text-gray-500" />
                              <div>
                                <p className="text-xs text-gray-600">Sale Price</p>
                                <p className="font-bold text-green-600">{formatCurrency(booking.carPrice)}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Dates */}
                        <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                          <h5 className="font-semibold text-purple-900 text-sm mb-2">Timeline</h5>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-500" />
                              <div>
                                <p className="text-xs text-gray-600">Estimated Delivery</p>
                                <p className="font-medium text-gray-900">
                                  {formatDate(booking.estimatedDeliveryDate)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-500" />
                              <div>
                                <p className="text-xs text-gray-600">Actual Delivery</p>
                                <p className="font-medium text-gray-900">
                                  {formatDate(booking.actualDeliveryDate)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
