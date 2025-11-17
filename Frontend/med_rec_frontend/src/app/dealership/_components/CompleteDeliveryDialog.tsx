"use client"

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

interface Booking {
  _id: string
  customerName: string
  customerEmail?: string
  customerPhone: string
  carName: string
  carModel: string
  carEngine: string
  carTransmission: string
  carColour: string
  estimatedDeliveryDate: string
}

interface CompleteDeliveryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  booking: Booking | null
  onConfirm?: () => void
}

export default function CompleteDeliveryDialog({
  open,
  onOpenChange,
  booking,
  onConfirm
}: CompleteDeliveryDialogProps) {
  const [actualDeliveryDate, setActualDeliveryDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Set today's date when dialog opens
  React.useEffect(() => {
    if (open && booking) {
      const today = new Date().toISOString().split('T')[0]
      setActualDeliveryDate(today)
    }
  }, [open, booking])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!actualDeliveryDate) {
      newErrors.actualDeliveryDate = 'Delivery date is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm() || !booking) return

    try {
      setLoading(true)
      const res = await fetch(`http://localhost:8080/api/bookings/${booking._id}/complete-delivery`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          actualDeliveryDate
        })
      })

      if (res.ok) {
        const data = await res.json()
        toast.success('Delivery completed successfully!')
        toast.success(`Customer '${data.customer.name}' created and vehicle added to their profile`)
        onOpenChange(false)
        setActualDeliveryDate('')
        setErrors({})
        if (onConfirm) {
          onConfirm()
        }
      } else {
        const errorData = await res.json()
        toast.error(errorData.message || 'Failed to complete delivery')
      }
    } catch (error) {
      console.error('Error completing delivery:', error)
      toast.error('Network error while completing delivery')
    } finally {
      setLoading(false)
    }
  }

  if (!booking) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Complete Delivery
          </DialogTitle>
          <DialogDescription>
            Mark this booking as delivered and create customer profile with vehicle details
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Booking Summary */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div>
              <p className="text-sm text-gray-600">Customer</p>
              <p className="font-semibold text-gray-900">{booking.customerName}</p>
              <p className="text-sm text-gray-600">{booking.customerPhone}</p>
            </div>

            <div className="border-t pt-2">
              <p className="text-sm text-gray-600">Vehicle Details</p>
              <p className="font-semibold text-gray-900">{booking.carName}</p>
              <p className="text-sm text-gray-600">
                {booking.carModel} • {booking.carEngine} • {booking.carTransmission}
              </p>
              <p className="text-sm text-gray-600">{booking.carColour}</p>
            </div>
          </div>

          {/* Delivery Date Input */}
          <div className="space-y-2">
            <Label htmlFor="actualDeliveryDate" className="text-sm font-medium">
              Actual Delivery Date *
            </Label>
            <Input
              id="actualDeliveryDate"
              type="date"
              value={actualDeliveryDate}
              onChange={(e) => {
                setActualDeliveryDate(e.target.value)
                if (errors.actualDeliveryDate) {
                  setErrors(prev => ({
                    ...prev,
                    actualDeliveryDate: ''
                  }))
                }
              }}
              className={errors.actualDeliveryDate ? 'border-red-500' : ''}
            />
            {errors.actualDeliveryDate && (
              <p className="text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.actualDeliveryDate}
              </p>
            )}
          </div>

          {/* Info Message */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>ℹ️ What happens next:</strong>
            </p>
            <ul className="text-sm text-blue-700 mt-2 space-y-1 ml-4 list-disc">
              <li>Customer profile will be created with provided details</li>
              <li>Vehicle will be added to the customer's profile</li>
              <li>Booking status will be updated to "Delivered"</li>
            </ul>
          </div>
        </div>

        {/* Dialog Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            onClick={() => onOpenChange(false)}
            variant="outline"
            className="cursor-pointer"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-green-600 hover:bg-green-700 text-white cursor-pointer"
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Complete Delivery'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
