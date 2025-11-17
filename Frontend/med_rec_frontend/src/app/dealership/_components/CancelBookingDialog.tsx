"use client"

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

interface Booking {
  _id: string
  customerName: string
  carModel: string
  carPrice: number
  amountPaid: number
}

interface CancelBookingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  booking: Booking | null
  onConfirm: () => void
}

export default function CancelBookingDialog({
  open,
  onOpenChange,
  booking,
  onConfirm
}: CancelBookingDialogProps) {
  const [reason, setReason] = useState('')
  const [refundAmount, setRefundAmount] = useState(booking?.amountPaid.toString() || '')
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!reason.trim()) {
      newErrors.reason = 'Cancellation reason is required'
    }

    if (!booking) {
      newErrors.booking = 'No booking selected'
    }

    if (refundAmount && parseFloat(refundAmount) > (booking?.amountPaid || 0)) {
      newErrors.refundAmount = 'Refund amount cannot exceed amount paid'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error('Please fix the errors')
      return
    }

    if (!booking) {
      toast.error('No booking selected')
      return
    }

    try {
      setSubmitting(true)

      const payload = {
        cancellationReason: reason,
        refundAmount: parseFloat(refundAmount || booking.amountPaid.toString())
      }

      const res = await fetch(`http://localhost:8080/api/bookings/${booking._id}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(payload)
      })

      const data = await res.json()

      if (res.ok) {
        toast.success('Booking cancelled successfully')
        setReason('')
        setRefundAmount(booking?.amountPaid.toString() || '')
        onOpenChange(false)
        onConfirm()
      } else {
        toast.error(data.message || 'Failed to cancel booking')
      }
    } catch (error) {
      console.error('Error cancelling booking:', error)
      toast.error('Network error while cancelling booking')
    } finally {
      setSubmitting(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen === false) {
      setReason('')
      setRefundAmount(booking?.amountPaid.toString() || '')
      setErrors({})
    }
    onOpenChange(newOpen)
  }

  if (!booking) return null

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-red-600">Cancel Booking</DialogTitle>
          <DialogDescription>
            You are about to cancel the booking for {booking.customerName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Booking Summary */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-700">Customer:</span>
              <span className="font-medium text-gray-900">{booking.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Car Model:</span>
              <span className="font-medium text-gray-900">{booking.carModel}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Amount Paid:</span>
              <span className="font-medium text-gray-900">₹{booking.amountPaid.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Car Price:</span>
              <span className="font-medium text-gray-900">₹{booking.carPrice.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-800">Warning</p>
              <p className="text-sm text-red-700">
                This action will permanently cancel the booking and move it to cancelled bookings history.
              </p>
            </div>
          </div>

          {/* Cancellation Reason */}
          <div>
            <label className="text-sm font-medium text-gray-900">
              Cancellation Reason *
            </label>
            <textarea
              value={reason}
              onChange={e => {
                setReason(e.target.value)
                if (errors.reason) {
                  setErrors(prev => ({ ...prev, reason: '' }))
                }
              }}
              placeholder="Please provide the reason for cancellation..."
              rows={3}
              className={`w-full mt-2 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                errors.reason ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.reason && (
              <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.reason}
              </p>
            )}
          </div>

          {/* Refund Amount */}
          <div>
            <label className="text-sm font-medium text-gray-900">
              Refund Amount
            </label>
            <input
              type="number"
              value={refundAmount}
              onChange={e => {
                setRefundAmount(e.target.value)
                if (errors.refundAmount) {
                  setErrors(prev => ({ ...prev, refundAmount: '' }))
                }
              }}
              placeholder="0"
              className={`w-full mt-2 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                errors.refundAmount ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.refundAmount && (
              <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.refundAmount}
              </p>
            )}
            <p className="text-xs text-gray-600 mt-1">
              Maximum refund: ₹{booking.amountPaid.toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            onClick={() => handleOpenChange(false)}
            variant="outline"
            className="cursor-pointer"
          >
            Keep Booking
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-red-600 hover:bg-red-700 text-white cursor-pointer"
          >
            {submitting ? 'Cancelling...' : 'Cancel Booking'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
