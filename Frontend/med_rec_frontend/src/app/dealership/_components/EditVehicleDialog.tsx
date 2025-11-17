"use client"

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

interface Vehicle {
  _id: string
  companyName: string
  vehicleName: string
  model: string
  color: string
  transmission: string
  engineCapacity: string
  licensePlateNumber?: string
  chassyNumber?: string
  dateOfBuying?: string
  currentKms?: number
  fuelType?: string
  lastServicedDate?: string
  lastServicedKms?: number
  dueServiceDate?: string
  dueServiceKms?: number
  notes?: string
}

interface EditVehicleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  vehicle: Vehicle | null
  onSuccess?: () => void
}

export default function EditVehicleDialog({
  open,
  onOpenChange,
  vehicle,
  onSuccess
}: EditVehicleDialogProps) {
  const [formData, setFormData] = useState<Partial<Vehicle>>({})
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (vehicle) {
      setFormData({
        companyName: vehicle.companyName,
        vehicleName: vehicle.vehicleName,
        model: vehicle.model,
        color: vehicle.color,
        transmission: vehicle.transmission,
        engineCapacity: vehicle.engineCapacity,
        licensePlateNumber: vehicle.licensePlateNumber || '',
        chassyNumber: vehicle.chassyNumber || '',
        dateOfBuying: vehicle.dateOfBuying ? vehicle.dateOfBuying.split('T')[0] : '',
        currentKms: vehicle.currentKms || 0,
        fuelType: vehicle.fuelType || 'Other',
        lastServicedDate: vehicle.lastServicedDate ? vehicle.lastServicedDate.split('T')[0] : '',
        lastServicedKms: vehicle.lastServicedKms || 0,
        dueServiceDate: vehicle.dueServiceDate ? vehicle.dueServiceDate.split('T')[0] : '',
        dueServiceKms: vehicle.dueServiceKms || 0,
        notes: vehicle.notes || ''
      })
      setErrors({})
    }
  }, [vehicle, open])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.companyName?.trim()) newErrors.companyName = 'Company name is required'
    if (!formData.vehicleName?.trim()) newErrors.vehicleName = 'Vehicle name is required'
    if (!formData.model?.trim()) newErrors.model = 'Model is required'
    if (!formData.color?.trim()) newErrors.color = 'Color is required'
    if (!formData.transmission) newErrors.transmission = 'Transmission is required'
    if (!formData.engineCapacity?.trim()) newErrors.engineCapacity = 'Engine capacity is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('Kms') || name === 'currentKms' ? (value ? parseInt(value) : 0) : value
    }))
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleSubmit = async () => {
    if (!validateForm() || !vehicle) return

    try {
      setLoading(true)
      const res = await fetch(`http://localhost:8080/api/vehicles/${vehicle._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        toast.success('Vehicle updated successfully')
        onOpenChange(false)
        if (onSuccess) {
          onSuccess()
        }
      } else {
        const errorData = await res.json()
        toast.error(errorData.message || 'Failed to update vehicle')
      }
    } catch (error) {
      console.error('Error updating vehicle:', error)
      toast.error('Network error while updating vehicle')
    } finally {
      setLoading(false)
    }
  }

  if (!vehicle) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Vehicle Details</DialogTitle>
          <DialogDescription>
            Update vehicle information for {vehicle.companyName} {vehicle.vehicleName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Basic Information */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Basic Information</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="companyName" className="text-sm">
                  Company Name *
                </Label>
                <Input
                  id="companyName"
                  name="companyName"
                  value={formData.companyName || ''}
                  onChange={handleChange}
                  placeholder="e.g., Maruti"
                  className={errors.companyName ? 'border-red-500' : ''}
                />
                {errors.companyName && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.companyName}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="vehicleName" className="text-sm">
                  Vehicle Name *
                </Label>
                <Input
                  id="vehicleName"
                  name="vehicleName"
                  value={formData.vehicleName || ''}
                  onChange={handleChange}
                  placeholder="e.g., Swift"
                  className={errors.vehicleName ? 'border-red-500' : ''}
                />
                {errors.vehicleName && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.vehicleName}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="model" className="text-sm">
                  Model *
                </Label>
                <Input
                  id="model"
                  name="model"
                  value={formData.model || ''}
                  onChange={handleChange}
                  placeholder="e.g., VXi, ZXi"
                  className={errors.model ? 'border-red-500' : ''}
                />
                {errors.model && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.model}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="color" className="text-sm">
                  Color *
                </Label>
                <Input
                  id="color"
                  name="color"
                  value={formData.color || ''}
                  onChange={handleChange}
                  placeholder="e.g., White, Black"
                  className={errors.color ? 'border-red-500' : ''}
                />
                {errors.color && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.color}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="transmission" className="text-sm">
                  Transmission *
                </Label>
                <select
                  id="transmission"
                  name="transmission"
                  value={formData.transmission || ''}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    errors.transmission ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Transmission</option>
                  <option value="Manual">Manual</option>
                  <option value="Automatic">Automatic</option>
                  <option value="CVT">CVT</option>
                  <option value="Other">Other</option>
                </select>
                {errors.transmission && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.transmission}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="engineCapacity" className="text-sm">
                  Engine Capacity *
                </Label>
                <Input
                  id="engineCapacity"
                  name="engineCapacity"
                  value={formData.engineCapacity || ''}
                  onChange={handleChange}
                  placeholder="e.g., 1.2L Petrol"
                  className={errors.engineCapacity ? 'border-red-500' : ''}
                />
                {errors.engineCapacity && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.engineCapacity}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="fuelType" className="text-sm">
                  Fuel Type
                </Label>
                <select
                  id="fuelType"
                  name="fuelType"
                  value={formData.fuelType || 'Other'}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="Petrol">Petrol</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Electric">Electric</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="CNG">CNG</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Identification */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Identification</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="licensePlateNumber" className="text-sm">
                  License Plate Number
                </Label>
                <Input
                  id="licensePlateNumber"
                  name="licensePlateNumber"
                  value={formData.licensePlateNumber || ''}
                  onChange={handleChange}
                  placeholder="e.g., MH-01-AB-1234"
                />
              </div>

              <div>
                <Label htmlFor="chassyNumber" className="text-sm">
                  Chassis Number
                </Label>
                <Input
                  id="chassyNumber"
                  name="chassyNumber"
                  value={formData.chassyNumber || ''}
                  onChange={handleChange}
                  placeholder="e.g., ABCD1234567890"
                />
              </div>
            </div>
          </div>

          {/* Purchase & Service Information */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Purchase & Service Information</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="dateOfBuying" className="text-sm">
                  Date of Buying
                </Label>
                <Input
                  id="dateOfBuying"
                  name="dateOfBuying"
                  type="date"
                  value={formData.dateOfBuying || ''}
                  onChange={handleChange}
                />
              </div>

              <div>
                <Label htmlFor="currentKms" className="text-sm">
                  Current Kilometers
                </Label>
                <Input
                  id="currentKms"
                  name="currentKms"
                  type="number"
                  value={formData.currentKms || 0}
                  onChange={handleChange}
                  placeholder="0"
                />
              </div>

              <div>
                <Label htmlFor="lastServicedDate" className="text-sm">
                  Last Serviced Date
                </Label>
                <Input
                  id="lastServicedDate"
                  name="lastServicedDate"
                  type="date"
                  value={formData.lastServicedDate || ''}
                  onChange={handleChange}
                />
              </div>

              <div>
                <Label htmlFor="lastServicedKms" className="text-sm">
                  Last Serviced Kilometers
                </Label>
                <Input
                  id="lastServicedKms"
                  name="lastServicedKms"
                  type="number"
                  value={formData.lastServicedKms || 0}
                  onChange={handleChange}
                  placeholder="0"
                />
              </div>

              <div>
                <Label htmlFor="dueServiceDate" className="text-sm">
                  Due Service Date
                </Label>
                <Input
                  id="dueServiceDate"
                  name="dueServiceDate"
                  type="date"
                  value={formData.dueServiceDate || ''}
                  onChange={handleChange}
                />
              </div>

              <div>
                <Label htmlFor="dueServiceKms" className="text-sm">
                  Due Service Kilometers
                </Label>
                <Input
                  id="dueServiceKms"
                  name="dueServiceKms"
                  type="number"
                  value={formData.dueServiceKms || 0}
                  onChange={handleChange}
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Additional Information</h3>
            <div>
              <Label htmlFor="notes" className="text-sm">
                Notes
              </Label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes || ''}
                onChange={handleChange}
                placeholder="Any additional notes about the vehicle..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
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
            className="bg-purple-600 hover:bg-purple-700 text-white cursor-pointer"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
