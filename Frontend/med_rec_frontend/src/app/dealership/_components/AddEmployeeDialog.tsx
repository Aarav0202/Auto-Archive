"use client"
import React, { useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import { useAuth } from "@/app/context/AuthContext"
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
  Briefcase, 
  Building, 
  DollarSign, 
  Calendar, 
  MapPin, 
  Contact,
  Loader2
} from 'lucide-react'

interface AddEmployeeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onEmployeeAdded?: () => void // Callback to refresh employee list
}

export const AddEmployeeDialog = ({ open, onOpenChange, onEmployeeAdded }: AddEmployeeDialogProps) => {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    employeeId: '',
    position: '',
    department: '',
    salary: '',
    dateOfJoining: '',
    salesTarget: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'India'
    },
    emergencyContact: {
      name: '',
      phone: '',
      relationship: ''
    }
  })

  const validatePhone = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '')
    return cleanPhone.slice(0, 10)
  }

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validateJoiningDate = (date: string) => {
    if (!date) return true 
    const selectedDate = new Date(date)
    const today = new Date()
    today.setHours(23, 59, 59, 999) 
    return selectedDate <= today
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    
    // Special handling for phone numbers
    if (name === 'phone' || name === 'emergencyContact.phone') {
      const validatedPhone = validatePhone(value)
      if (name.includes('.')) {
        const [parent, child] = name.split('.')
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent as keyof typeof prev] as object,
            [child]: validatedPhone
          }
        }))
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: validatedPhone
        }))
      }
      return
    }

    // Handle nested object properties
    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev] as object,
          [child]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const generateEmployeeId = () => {
    const timestamp = Date.now().toString().slice(-4)
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    return `EMP${timestamp}${random}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation checks
    if (!validateEmail(formData.email)) {
      toast.error('Please enter a valid email address', {
        duration: 4000,
        position: 'top-center',
      })
      return
    }

    if (formData.phone.length !== 10) {
      toast.error('Phone number must be exactly 10 digits', {
        duration: 4000,
        position: 'top-center',
      })
      return
    }

    if (!validateJoiningDate(formData.dateOfJoining)) {
      toast.error('Joining date cannot be in the future', {
        duration: 4000,
        position: 'top-center',
      })
      return
    }

    // Validate emergency contact phone if provided
    if (formData.emergencyContact.phone && formData.emergencyContact.phone.length !== 10) {
      toast.error('Emergency contact phone must be exactly 10 digits', {
        duration: 4000,
        position: 'top-center',
      })
      return
    }

    setIsLoading(true)

    try {
      // Generate employee ID if not provided
      const employeeId = formData.employeeId || generateEmployeeId()
      
      // Prepare the data for API
      const employeeData = {
        name: formData.name,
        email: formData.email,
        password: formData.password || 'password123',
        phone: formData.phone,
        dealershipId: user?.dealershipId,
        employeeId: employeeId,
        department: formData.department,
        position: formData.position,
        salary: parseFloat(formData.salary) || 0,
        dateOfJoining: formData.dateOfJoining || new Date().toISOString().split('T')[0],
        salesTarget: formData.department === 'Sales' ? parseFloat(formData.salesTarget) || 0 : 0,
        address: formData.address,
        emergencyContact: formData.emergencyContact
      }


      const response = await fetch('http://localhost:8080/api/employees/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(employeeData),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Employee added successfully! 🎉', {
          duration: 4000,
          position: 'top-center',
        })
        
        // Reset form
        setFormData({
          name: '',
          email: '',
          password: '',
          phone: '',
          employeeId: '',
          position: '',
          department: '',
          salary: '',
          dateOfJoining: '',
          salesTarget: '',
          address: {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: 'India'
          },
          emergencyContact: {
            name: '',
            phone: '',
            relationship: ''
          }
        })
        
        // Close dialog and refresh employee list
        onOpenChange(false)
        if (onEmployeeAdded) {
          onEmployeeAdded()
        }
      } else {
        toast.error(data.message || 'Failed to add employee', {
          duration: 4000,
          position: 'top-center',
        })
      }
    } catch (error) {
      console.error('Error adding employee:', error)
      toast.error('Network error. Please try again.', {
        duration: 4000,
        position: 'top-center',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
              <UserPlus className="w-5 h-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold text-gray-900">Add New Employee</DialogTitle>
              <DialogDescription className="text-sm text-gray-600 mt-1">
                Enter the employee details to add them to the dealership.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information Section */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-4 h-4 text-blue-600" />
              <h3 className="font-medium text-blue-900">Personal Information</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <User className="w-3 h-3" />
                  Full Name *
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter full name"
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="employeeId" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <User className="w-3 h-3" />
                  Employee ID
                </Label>
                <Input
                  id="employeeId"
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleInputChange}
                  placeholder="Auto-generated if empty"
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Contact Information Section */}
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-4">
              <Contact className="w-4 h-4 text-green-600" />
              <h3 className="font-medium text-green-900">Contact Information</h3>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="email" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Mail className="w-3 h-3" />
                  Email *
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter valid email address"
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Phone className="w-3 h-3" />
                  Phone Number * (10 digits)
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter 10-digit phone number"
                  className="mt-1"
                  maxLength={10}
                  pattern="[0-9]{10}"
                  required
                />
              </div>
              <div>
                <Label htmlFor="password" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Mail className="w-3 h-3" />
                  Password (optional)
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Default: password123"
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Job Information Section */}
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <div className="flex items-center gap-2 mb-4">
              <Briefcase className="w-4 h-4 text-purple-600" />
              <h3 className="font-medium text-purple-900">Job Information</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="position" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Briefcase className="w-3 h-3" />
                  Position *
                </Label>
                <Input
                  id="position"
                  name="position"
                  value={formData.position}
                  onChange={handleInputChange}
                  placeholder="e.g., Sales Associate, Mechanic"
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="department" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Building className="w-3 h-3" />
                  Department *
                </Label>
                <select
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 mt-1"
                  required
                >
                  <option value="">Select Department</option>
                  <option value="Sales">Sales</option>
                  <option value="Service">Service</option>
                  <option value="Finance">Finance</option>
                  <option value="Administration">Administration</option>
                  <option value="HR">HR</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Inventory">Inventory</option>
                  <option value="Security">Security</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <Label htmlFor="salary" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <DollarSign className="w-3 h-3" />
                  Annual Salary *
                </Label>
                <Input
                  id="salary"
                  name="salary"
                  type="number"
                  value={formData.salary}
                  onChange={handleInputChange}
                  placeholder="Annual salary in INR"
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="dateOfJoining" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Calendar className="w-3 h-3" />
                  Date of Joining * (not future)
                </Label>
                <Input
                  id="dateOfJoining"
                  name="dateOfJoining"
                  type="date"
                  value={formData.dateOfJoining}
                  onChange={handleInputChange}
                  max={new Date().toISOString().split('T')[0]}
                  className="mt-1"
                  required
                />
              </div>
            </div>
            {formData.department === 'Sales' && (
              <div>
                <Label htmlFor="salesTarget" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <DollarSign className="w-3 h-3" />
                  Sales Target (cars/month)
                </Label>
                <Input
                  id="salesTarget"
                  name="salesTarget"
                  type="number"
                  value={formData.salesTarget}
                  onChange={handleInputChange}
                  placeholder="Monthly sales target"
                  className="mt-1"
                />
              </div>
            )}
          </div>

          {/* Additional Information Section */}
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-4 h-4 text-orange-600" />
              <h3 className="font-medium text-orange-900">Additional Information</h3>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="address.street" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <MapPin className="w-3 h-3" />
                  Street Address
                </Label>
                <Input
                  id="address.street"
                  name="address.street"
                  value={formData.address.street}
                  onChange={handleInputChange}
                  placeholder="Street address"
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="address.city" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <MapPin className="w-3 h-3" />
                    City
                  </Label>
                  <Input
                    id="address.city"
                    name="address.city"
                    value={formData.address.city}
                    onChange={handleInputChange}
                    placeholder="City"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="address.state" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <MapPin className="w-3 h-3" />
                    State
                  </Label>
                  <Input
                    id="address.state"
                    name="address.state"
                    value={formData.address.state}
                    onChange={handleInputChange}
                    placeholder="State"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="address.zipCode" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <MapPin className="w-3 h-3" />
                    ZIP Code
                  </Label>
                  <Input
                    id="address.zipCode"
                    name="address.zipCode"
                    value={formData.address.zipCode}
                    onChange={handleInputChange}
                    placeholder="ZIP Code"
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="emergencyContact.name" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Contact className="w-3 h-3" />
                    Emergency Contact Name
                  </Label>
                  <Input
                    id="emergencyContact.name"
                    name="emergencyContact.name"
                    value={formData.emergencyContact.name}
                    onChange={handleInputChange}
                    placeholder="Emergency contact name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="emergencyContact.phone" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Phone className="w-3 h-3" />
                    Emergency Contact Phone (10 digits)
                  </Label>
                  <Input
                    id="emergencyContact.phone"
                    name="emergencyContact.phone"
                    type="tel"
                    value={formData.emergencyContact.phone}
                    onChange={handleInputChange}
                    placeholder="10-digit phone number"
                    maxLength={10}
                    pattern="[0-9]{10}"
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="emergencyContact.relationship" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Contact className="w-3 h-3" />
                  Relationship
                </Label>
                <Input
                  id="emergencyContact.relationship"
                  name="emergencyContact.relationship"
                  value={formData.emergencyContact.relationship}
                  onChange={handleInputChange}
                  placeholder="e.g., Spouse, Parent, Sibling"
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="px-6"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="px-6 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding Employee...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Employee
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
      <Toaster />
    </Dialog>
  )
}