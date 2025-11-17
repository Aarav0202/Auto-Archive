"use client"
import React, { useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import { useAuth } from '@/app/context/AuthContext'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  UserPlus, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  CreditCard, 
  FileText,
  Settings,
  Heart,
  Car,
  Plus,
  Trash2
} from 'lucide-react'

interface AddCustomerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  // optional initial data for editing
  initialData?: any
  // callback after successful save
  onSaved?: (customer?: any) => void
}

interface Vehicle {
  companyName: string
  vehicleName: string
  model: string
  chassyNumber: string
  licensePlateNumber: string
  dateOfBuying: string
  color: string
  year: string
  lastServicedDate: string
  lastServicedKms: string
  dueServiceDate: string
  dueServiceKms: string
  fuelType: string
  transmission: string
  engineCapacity: string
  currentKms: string
  notes: string
}

export const AddCustomerDialog = ({ open, onOpenChange, initialData, onSaved }: AddCustomerDialogProps) => {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    dateOfBirth: '',
    licenseNumber: '',
    preferredContact: 'email',
    customerType: 'individual',
    notes: ''
  })

  // Validate phone to exactly 10 digits
  const validatePhone = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '')
    return cleanPhone.slice(0, 10)
  }

  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [showVehicleForm, setShowVehicleForm] = useState(false)
  const [currentVehicle, setCurrentVehicle] = useState<Vehicle>({
    companyName: '',
    vehicleName: '',
    model: '',
    chassyNumber: '',
    licensePlateNumber: '',
    dateOfBuying: '',
    color: '',
    year: '',
    lastServicedDate: '',
    lastServicedKms: '',
    dueServiceDate: '',
    dueServiceKms: '',
    fuelType: 'Petrol',
    transmission: 'Manual',
    engineCapacity: '',
    currentKms: '',
    notes: ''
  })

  // when initialData is provided (edit mode), prefill form
  React.useEffect(() => {
    if (initialData) {
      const c = initialData.customer || initialData
      setFormData({
        firstName: (c.name || '').split(' ')[0] || '',
        lastName: (c.name || '').split(' ').slice(1).join(' ') || '',
        email: c.email || '',
        phone: c.phone || '',
        address: c.address?.street || '',
        city: c.address?.city || '',
        state: c.address?.state || '',
        zipCode: c.address?.zipCode || '',
        dateOfBirth: c.dateOfBirth ? new Date(c.dateOfBirth).toISOString().slice(0,10) : '',
        licenseNumber: c.licenseNumber || '',
        preferredContact: c.preferredContact || 'email',
        customerType: c.customerType || 'individual',
        notes: c.notes || ''
      })
    }
  }, [initialData])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    
    // Special handling for phone numbers
    if (name === 'phone') {
      const validatedPhone = validatePhone(value)
      setFormData(prev => ({
        ...prev,
        [name]: validatedPhone
      }))
      return
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleVehicleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setCurrentVehicle(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleAddVehicle = () => {
    if (!currentVehicle.companyName || !currentVehicle.vehicleName || !currentVehicle.chassyNumber || !currentVehicle.licensePlateNumber) {
      toast.error('Please fill in required vehicle fields: Company name, Vehicle name, Chassy number, and License plate')
      return
    }

    // Check for duplicate chassy number
    if (vehicles.some(v => v.chassyNumber.toUpperCase() === currentVehicle.chassyNumber.toUpperCase())) {
      toast.error('A vehicle with this chassy number already exists')
      return
    }

    setVehicles([...vehicles, { ...currentVehicle }])
    setCurrentVehicle({
      companyName: '',
      vehicleName: '',
      model: '',
      chassyNumber: '',
      licensePlateNumber: '',
      dateOfBuying: '',
      color: '',
      year: '',
      lastServicedDate: '',
      lastServicedKms: '',
      dueServiceDate: '',
      dueServiceKms: '',
      fuelType: 'Petrol',
      transmission: 'Manual',
      engineCapacity: '',
      currentKms: '',
      notes: ''
    })
    setShowVehicleForm(false)
    toast.success('Vehicle added to list')
  }

  const handleRemoveVehicle = (index: number) => {
    setVehicles(vehicles.filter((_, i) => i !== index))
    toast.success('Vehicle removed from list')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate phone number
    if (!formData.phone || formData.phone.length !== 10) {
      toast.error('Phone number must be exactly 10 digits', {
        duration: 3000
      })
      return
    }
    
    // Prepare payload
    const customerData = {
      name: `${formData.firstName} ${formData.lastName}`.trim(),
      email: formData.email,
      password: 'password123',
      phone: formData.phone,
      dealershipId: user?.dealershipId || null,
      address: {
        street: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
      },
      dateOfBirth: formData.dateOfBirth || null,
      licenseNumber: formData.licenseNumber || null,
      preferredContact: formData.preferredContact,
      customerType: formData.customerType,
      notes: formData.notes,
      vehicles: vehicles // Include vehicles in the payload
    }
    // Determine if we're editing
    const isEdit = initialData && (initialData._id || (initialData.customer && initialData.customer._id))
    const url = isEdit ? `http://localhost:8080/api/customers/${initialData._id || initialData.customer._id}` : 'http://localhost:8080/api/customers/register'
    const method = isEdit ? 'PUT' : 'POST'

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(customerData),
    })
      .then(async (res) => {
        const data = await res.json()
        if (res.ok) {
          toast.success(isEdit ? 'Customer updated' : 'Customer added successfully')
          
          // Add vehicles if vehicles exist (both new and edit mode)
          if (vehicles.length > 0 && data.customer) {
            let successCount = 0
            const customerId = data.customer._id
            for (const vehicle of vehicles) {
              try {
                const vehicleRes = await fetch('http://localhost:8080/api/vehicles', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  credentials: 'include',
                  body: JSON.stringify({
                    ...vehicle,
                    ownerId: customerId,
                    dealershipId: user?.dealershipId
                  })
                })
                if (vehicleRes.ok) {
                  successCount++
                  console.log('Vehicle added successfully')
                } else {
                  const errorData = await vehicleRes.json()
                  console.error('Failed to add vehicle:', errorData.message)
                }
              } catch (error) {
                console.error('Error adding vehicle:', error)
              }
            }
            if (successCount > 0) {
              toast.success(`${successCount} vehicle(s) added successfully`)
              // Dispatch event to notify about vehicle addition
              try {
                window.dispatchEvent(new CustomEvent('vehicleAdded', { detail: { customerId, count: successCount } }))
              } catch (e) {
                console.error('Error dispatching event:', e)
              }
            }
          }

          // Reset form
          setFormData({
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            address: '',
            city: '',
            state: '',
            zipCode: '',
            dateOfBirth: '',
            licenseNumber: '',
            preferredContact: 'email',
            customerType: 'individual',
            notes: ''
          })
          setVehicles([])
          setShowVehicleForm(false)

          // notify other parts of the app (e.g., customers list) to refresh
          try {
            window.dispatchEvent(new CustomEvent('customerAdded', { detail: { id: data.customer?._id || data.customer?.id } }))
          } catch (e) {
            // ignore in non-browser environments
          }

          onOpenChange(false)
          if (onSaved) onSaved(data.customer)
        } else {
          toast.error(data.message || (isEdit ? 'Failed to update customer' : 'Failed to add customer'))
        }
      })
      .catch((err) => {
        console.error('Error saving customer:', err)
        toast.error('Network error. Please try again.')
      })

  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
              <UserPlus className="w-5 h-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold text-gray-900">Add New Customer</DialogTitle>
              <DialogDescription className="text-sm text-gray-600 mt-1">
                Enter the customer details and add vehicles to the system.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ===== CUSTOMER INFORMATION SECTION ===== */}
          <div className="border-b pb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-purple-500" />
              Customer Information
            </h3>

            {/* Personal Information */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  className="cursor-pointer"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  className="cursor-pointer"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="cursor-pointer"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number * (10 digits)</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  maxLength={10}
                  placeholder="10-digit phone number"
                  required
                  className="cursor-pointer"
                />
              </div>
            </div>

            <div className="mb-4">
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Street address"
                required
                className="cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                  className="cursor-pointer"
                />
              </div>
              <div>
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  required
                  className="cursor-pointer"
                />
              </div>
              <div>
                <Label htmlFor="zipCode">ZIP Code *</Label>
                <Input
                  id="zipCode"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                  required
                  className="cursor-pointer"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  className="cursor-pointer"
                />
              </div>
              <div>
                <Label htmlFor="licenseNumber">Driver's License Number</Label>
                <Input
                  id="licenseNumber"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleInputChange}
                  placeholder="License number"
                  className="cursor-pointer"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <Label htmlFor="preferredContact">Preferred Contact Method</Label>
                <select
                  id="preferredContact"
                  name="preferredContact"
                  value={formData.preferredContact}
                  onChange={handleInputChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer"
                >
                  <option value="email">Email</option>
                  <option value="phone">Phone</option>
                  <option value="text">Text Message</option>
                  <option value="mail">Mail</option>
                </select>
              </div>
              <div>
                <Label htmlFor="customerType">Customer Type</Label>
                <select
                  id="customerType"
                  name="customerType"
                  value={formData.customerType}
                  onChange={handleInputChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer"
                >
                  <option value="individual">Individual</option>
                  <option value="business">Business</option>
                  <option value="fleet">Fleet</option>
                  <option value="vip">VIP</option>
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer"
                placeholder="Additional notes about the customer..."
              />
            </div>
          </div>

          {/* ===== VEHICLE INFORMATION SECTION ===== */}
          <div className="border-b pb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Car className="w-5 h-5 text-blue-500" />
                Vehicle Details ({vehicles.length})
              </h3>
              <Button
                type="button"
                onClick={() => setShowVehicleForm(!showVehicleForm)}
                className="bg-blue-500 hover:bg-blue-600 cursor-pointer flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Vehicle
              </Button>
            </div>

            {/* Vehicle Form */}
            {showVehicleForm && (
              <div className="bg-blue-50 p-4 rounded-lg mb-4 border border-blue-200">
                <h4 className="font-semibold text-gray-900 mb-4">Add New Vehicle</h4>
                
                {/* Basic Information */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label htmlFor="companyName">Company Name/Brand *</Label>
                    <Input
                      id="companyName"
                      name="companyName"
                      value={currentVehicle.companyName}
                      onChange={handleVehicleInputChange}
                      placeholder="e.g., Toyota, Honda, BMW"
                      className="cursor-pointer"
                    />
                  </div>
                  <div>
                    <Label htmlFor="vehicleName">Vehicle Name *</Label>
                    <Input
                      id="vehicleName"
                      name="vehicleName"
                      value={currentVehicle.vehicleName}
                      onChange={handleVehicleInputChange}
                      placeholder="e.g., Fortuner, Civic, X5"
                      className="cursor-pointer"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label htmlFor="model">Model</Label>
                    <Input
                      id="model"
                      name="model"
                      value={currentVehicle.model}
                      onChange={handleVehicleInputChange}
                      placeholder="e.g., 2.8L Diesel AT"
                      className="cursor-pointer"
                    />
                  </div>
                  <div>
                    <Label htmlFor="year">Year</Label>
                    <Input
                      id="year"
                      name="year"
                      type="number"
                      value={currentVehicle.year}
                      onChange={handleVehicleInputChange}
                      placeholder="e.g., 2022"
                      className="cursor-pointer"
                    />
                  </div>
                </div>

                {/* Identification */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label htmlFor="chassyNumber">Chassy Number (VIN) *</Label>
                    <Input
                      id="chassyNumber"
                      name="chassyNumber"
                      value={currentVehicle.chassyNumber}
                      onChange={handleVehicleInputChange}
                      placeholder="Vehicle Identification Number"
                      className="cursor-pointer"
                    />
                  </div>
                  <div>
                    <Label htmlFor="licensePlateNumber">License Plate Number *</Label>
                    <Input
                      id="licensePlateNumber"
                      name="licensePlateNumber"
                      value={currentVehicle.licensePlateNumber}
                      onChange={handleVehicleInputChange}
                      placeholder="e.g., DL01AB1234"
                      className="cursor-pointer"
                    />
                  </div>
                </div>

                {/* Purchase Details */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label htmlFor="dateOfBuying">Date of Buying</Label>
                    <Input
                      id="dateOfBuying"
                      name="dateOfBuying"
                      type="date"
                      value={currentVehicle.dateOfBuying}
                      onChange={handleVehicleInputChange}
                      className="cursor-pointer"
                    />
                  </div>
                  <div>
                    <Label htmlFor="color">Color</Label>
                    <Input
                      id="color"
                      name="color"
                      value={currentVehicle.color}
                      onChange={handleVehicleInputChange}
                      placeholder="e.g., Silver, Black"
                      className="cursor-pointer"
                    />
                  </div>
                </div>

                {/* Engine & Transmission */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label htmlFor="fuelType">Fuel Type</Label>
                    <select
                      id="fuelType"
                      name="fuelType"
                      value={currentVehicle.fuelType}
                      onChange={handleVehicleInputChange}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer"
                    >
                      <option value="Petrol">Petrol</option>
                      <option value="Diesel">Diesel</option>
                      <option value="Electric">Electric</option>
                      <option value="Hybrid">Hybrid</option>
                      <option value="CNG">CNG</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="transmission">Transmission</Label>
                    <select
                      id="transmission"
                      name="transmission"
                      value={currentVehicle.transmission}
                      onChange={handleVehicleInputChange}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer"
                    >
                      <option value="Manual">Manual</option>
                      <option value="Automatic">Automatic</option>
                      <option value="CVT">CVT</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label htmlFor="engineCapacity">Engine Capacity</Label>
                    <Input
                      id="engineCapacity"
                      name="engineCapacity"
                      value={currentVehicle.engineCapacity}
                      onChange={handleVehicleInputChange}
                      placeholder="e.g., 2000cc"
                      className="cursor-pointer"
                    />
                  </div>
                  <div>
                    <Label htmlFor="currentKms">Current Kilometers</Label>
                    <Input
                      id="currentKms"
                      name="currentKms"
                      type="number"
                      value={currentVehicle.currentKms}
                      onChange={handleVehicleInputChange}
                      placeholder="0"
                      className="cursor-pointer"
                    />
                  </div>
                </div>

                {/* Service Information */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label htmlFor="lastServicedDate">Last Serviced Date</Label>
                    <Input
                      id="lastServicedDate"
                      name="lastServicedDate"
                      type="date"
                      value={currentVehicle.lastServicedDate}
                      onChange={handleVehicleInputChange}
                      className="cursor-pointer"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastServicedKms">Last Serviced KMs</Label>
                    <Input
                      id="lastServicedKms"
                      name="lastServicedKms"
                      type="number"
                      value={currentVehicle.lastServicedKms}
                      onChange={handleVehicleInputChange}
                      placeholder="0"
                      className="cursor-pointer"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label htmlFor="dueServiceDate">Due Service Date</Label>
                    <Input
                      id="dueServiceDate"
                      name="dueServiceDate"
                      type="date"
                      value={currentVehicle.dueServiceDate}
                      onChange={handleVehicleInputChange}
                      className="cursor-pointer"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dueServiceKms">Due Service KMs</Label>
                    <Input
                      id="dueServiceKms"
                      name="dueServiceKms"
                      type="number"
                      value={currentVehicle.dueServiceKms}
                      onChange={handleVehicleInputChange}
                      placeholder="0"
                      className="cursor-pointer"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="vehicleNotes">Vehicle Notes</Label>
                  <textarea
                    id="vehicleNotes"
                    name="notes"
                    value={currentVehicle.notes}
                    onChange={handleVehicleInputChange}
                    rows={2}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer"
                    placeholder="Any additional notes about the vehicle..."
                  />
                </div>

                <div className="flex gap-3 mt-4 pt-4 border-t">
                  <Button
                    type="button"
                    onClick={handleAddVehicle}
                    className="bg-green-500 hover:bg-green-600 cursor-pointer flex-1"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Vehicle
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      setShowVehicleForm(false)
                      setCurrentVehicle({
                        companyName: '',
                        vehicleName: '',
                        model: '',
                        chassyNumber: '',
                        licensePlateNumber: '',
                        dateOfBuying: '',
                        color: '',
                        year: '',
                        lastServicedDate: '',
                        lastServicedKms: '',
                        dueServiceDate: '',
                        dueServiceKms: '',
                        fuelType: 'Petrol',
                        transmission: 'Manual',
                        engineCapacity: '',
                        currentKms: '',
                        notes: ''
                      })
                    }}
                    variant="outline"
                    className="flex-1 cursor-pointer"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* Vehicle List */}
            {vehicles.length > 0 && (
              <div className="space-y-3">
                {vehicles.map((vehicle, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded-lg border border-gray-200 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{vehicle.companyName} {vehicle.vehicleName}</p>
                      <p className="text-sm text-gray-600">
                        License: {vehicle.licensePlateNumber} | Chassy: {vehicle.chassyNumber}
                      </p>
                      <p className="text-sm text-gray-600">
                        {vehicle.year && `Year: ${vehicle.year}`} | {vehicle.fuelType} | {vehicle.transmission}
                      </p>
                    </div>
                    <Button
                      type="button"
                      onClick={() => handleRemoveVehicle(index)}
                      variant="outline"
                      className="text-red-600 hover:text-red-700 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false)
                setVehicles([])
                setShowVehicleForm(false)
              }}
              className="px-6 cursor-pointer"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="px-6 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 cursor-pointer"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add Customer & Vehicles
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}