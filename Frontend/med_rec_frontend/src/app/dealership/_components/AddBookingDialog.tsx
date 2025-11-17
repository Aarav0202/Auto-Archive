"use client"

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

interface AddBookingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  dealershipId: string
  onBookingAdded?: () => void
}

export default function AddBookingDialog({
  open,
  onOpenChange,
  dealershipId,
  onBookingAdded
}: AddBookingDialogProps) {
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    carName: '',
    carModel: '',
    carEngine: '',
    carTransmission: '',
    carColour: '',
    carPrice: '',
    amountPaid: '',
    estimatedDeliveryDate: '',
    soldByEmployeeId: '',
    notes: ''
  })

  const [employees, setEmployees] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Validate phone to exactly 10 digits
  const validatePhone = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '')
    return cleanPhone.slice(0, 10)
  }

  // Fetch employees when dialog opens
  useEffect(() => {
    if (open && dealershipId) {
      fetchEmployees()
    }
  }, [open, dealershipId])

  const fetchEmployees = async () => {
    try {
      setLoading(true)
      const res = await fetch('http://localhost:8080/api/employees/', {
        credentials: 'include'
      })

      if (res.ok) {
        const data = await res.json()
        const salesEmployees = data.employees.filter((emp: any) => emp.department === 'Sales')
        setEmployees(salesEmployees)
      } else {
        console.error('Failed to fetch employees:', res.status, res.statusText)
        toast.error('Failed to fetch employees')
      }
    } catch (error) {
      console.error('Error fetching employees:', error)
      toast.error('Error fetching employees')
    } finally {
      setLoading(false)
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.customerName.trim()) newErrors.customerName = 'Customer name is required'
    if (!formData.customerPhone.trim()) newErrors.customerPhone = 'Customer phone is required'
    else if (formData.customerPhone.length !== 10) newErrors.customerPhone = 'Phone must be 10 digits'
    if (!formData.carName.trim()) newErrors.carName = 'Car name is required'
    if (!formData.carModel.trim()) newErrors.carModel = 'Car model is required'
    if (!formData.carEngine.trim()) newErrors.carEngine = 'Engine is required'
    if (!formData.carTransmission) newErrors.carTransmission = 'Transmission is required'
    if (!formData.carColour.trim()) newErrors.carColour = 'Car colour is required'
    if (!formData.carPrice) newErrors.carPrice = 'Car price is required'
    if (!formData.estimatedDeliveryDate) newErrors.estimatedDeliveryDate = 'Estimated delivery date is required'
    if (!formData.soldByEmployeeId) newErrors.soldByEmployeeId = 'Please select an employee'

    const carPrice = parseFloat(formData.carPrice)
    const amountPaid = parseFloat(formData.amountPaid || '0')
    if (carPrice <= 0) newErrors.carPrice = 'Car price must be greater than 0'
    if (amountPaid > carPrice) newErrors.amountPaid = 'Amount paid cannot exceed car price'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error('Please fix the errors in the form')
      return
    }

    try {
      setSubmitting(true)

      const payload = {
        ...formData,
        carPrice: parseFloat(formData.carPrice),
        amountPaid: formData.amountPaid ? parseFloat(formData.amountPaid) : 0
      }

      const res = await fetch('http://localhost:8080/api/bookings/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(payload)
      })

      const data = await res.json()

      if (res.ok) {
        toast.success('Booking created successfully!')
        setFormData({
          customerName: '',
          customerEmail: '',
          customerPhone: '',
          carName: '',
          carModel: '',
          carEngine: '',
          carTransmission: '',
          carColour: '',
          carPrice: '',
          amountPaid: '',
          estimatedDeliveryDate: '',
          soldByEmployeeId: '',
          notes: ''
        })
        onOpenChange(false)
        if (onBookingAdded) {
          onBookingAdded()
        }
      } else {
        toast.error(data.message || 'Failed to create booking')
      }
    } catch (error) {
      console.error('Error creating booking:', error)
      toast.error('Network error while creating booking')
    } finally {
      setSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    
    // Special handling for phone numbers
    if (name === 'customerPhone') {
      const validatedPhone = validatePhone(value)
      setFormData(prev => ({
        ...prev,
        [name]: validatedPhone
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Car Booking</DialogTitle>
          <DialogDescription>Fill in the details to create a new car booking</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Customer Information */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Customer Information</h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="customerName" className="text-sm">
                  Customer Name *
                </Label>
                <Input
                  id="customerName"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className={errors.customerName ? 'border-red-500' : ''}
                />
                {errors.customerName && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.customerName}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="customerPhone" className="text-sm">
                  Customer Phone * (10 digits)
                </Label>
                <Input
                  id="customerPhone"
                  name="customerPhone"
                  type="tel"
                  value={formData.customerPhone}
                  onChange={handleChange}
                  maxLength={10}
                  placeholder="9876543210"
                  className={errors.customerPhone ? 'border-red-500' : ''}
                />
                {errors.customerPhone && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.customerPhone}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="customerEmail" className="text-sm">
                Customer Email
              </Label>
              <Input
                id="customerEmail"
                name="customerEmail"
                type="email"
                value={formData.customerEmail}
                onChange={handleChange}
                placeholder="john@example.com"
              />
            </div>
          </div>

          {/* Car Information */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Car Information</h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="carName" className="text-sm">
                  Car Name *
                </Label>
                <Input
                  id="carName"
                  name="carName"
                  value={formData.carName}
                  onChange={handleChange}
                  placeholder="e.g., Maruti Swift"
                  className={errors.carName ? 'border-red-500' : ''}
                />
                {errors.carName && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.carName}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="carModel" className="text-sm">
                  Car Model *
                </Label>
                <Input
                  id="carModel"
                  name="carModel"
                  value={formData.carModel}
                  onChange={handleChange}
                  placeholder="e.g., Swift, Baleno"
                  className={errors.carModel ? 'border-red-500' : ''}
                />
                {errors.carModel && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.carModel}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="carEngine" className="text-sm">
                  Engine *
                </Label>
                <Input
                  id="carEngine"
                  name="carEngine"
                  value={formData.carEngine}
                  onChange={handleChange}
                  placeholder="e.g., 1.2L Petrol"
                  className={errors.carEngine ? 'border-red-500' : ''}
                />
                {errors.carEngine && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.carEngine}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="carTransmission" className="text-sm">
                  Transmission *
                </Label>
                <select
                  id="carTransmission"
                  name="carTransmission"
                  value={formData.carTransmission}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    errors.carTransmission ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Transmission</option>
                  <option value="Manual">Manual</option>
                  <option value="Automatic">Automatic</option>
                </select>
                {errors.carTransmission && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.carTransmission}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="carColour" className="text-sm">
                  Car Colour *
                </Label>
                <Input
                  id="carColour"
                  name="carColour"
                  value={formData.carColour}
                  onChange={handleChange}
                  placeholder="e.g., Red, Silver"
                  className={errors.carColour ? 'border-red-500' : ''}
                />
                {errors.carColour && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.carColour}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="carPrice" className="text-sm">
                  Car Price (On Road) *
                </Label>
                <Input
                  id="carPrice"
                  name="carPrice"
                  type="number"
                  value={formData.carPrice}
                  onChange={handleChange}
                  placeholder="1000000"
                  className={errors.carPrice ? 'border-red-500' : ''}
                />
                {errors.carPrice && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.carPrice}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="amountPaid" className="text-sm">
                  Amount Paid
                </Label>
                <Input
                  id="amountPaid"
                  name="amountPaid"
                  type="number"
                  value={formData.amountPaid}
                  onChange={handleChange}
                  placeholder="100000"
                  className={errors.amountPaid ? 'border-red-500' : ''}
                />
                {errors.amountPaid && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.amountPaid}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Booking Information */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Booking Details</h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="estimatedDeliveryDate" className="text-sm">
                  Estimated Delivery Date *
                </Label>
                <Input
                  id="estimatedDeliveryDate"
                  name="estimatedDeliveryDate"
                  type="date"
                  value={formData.estimatedDeliveryDate}
                  onChange={handleChange}
                  className={errors.estimatedDeliveryDate ? 'border-red-500' : ''}
                />
                {errors.estimatedDeliveryDate && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.estimatedDeliveryDate}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="soldByEmployeeId" className="text-sm">
                  Sold By (Sales Employee) *
                </Label>
                <select
                  id="soldByEmployeeId"
                  name="soldByEmployeeId"
                  value={formData.soldByEmployeeId}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white ${
                    errors.soldByEmployeeId ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={loading}
                >
                  <option value="">Select an employee</option>
                  {employees.map(emp => (
                    <option key={emp._id} value={emp._id}>
                      {emp.name}
                    </option>
                  ))}
                </select>
                {errors.soldByEmployeeId && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.soldByEmployeeId}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="notes" className="text-sm">
                Notes
              </Label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Any additional notes about the booking..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              onClick={() => onOpenChange(false)}
              variant="outline"
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting || loading}
              className="bg-purple-600 hover:bg-purple-700 text-white cursor-pointer"
            >
              {submitting ? 'Creating...' : 'Create Booking'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
