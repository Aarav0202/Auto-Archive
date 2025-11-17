"use client"

import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
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
  Edit, 
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

interface Employee {
  _id: string;
  name: string;
  email: string;
  phone: string;
  employeeId: string;
  department: string;
  position: string;
  salary: number;
  dateOfJoining: string;
  carsSold: number;
  salesTarget: number;
  isActive: boolean;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  emergencyContact?: {
    name?: string;
    phone?: string;
    relationship?: string;
  };
  dealershipId: {
    _id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface EditEmployeeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  employee: Employee | null
  onEmployeeUpdated?: () => void
}

export const EditEmployeeDialog = ({ open, onOpenChange, employee, onEmployeeUpdated }: EditEmployeeDialogProps) => {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
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
      country: ''
    },
    emergencyContact: {
      name: '',
      phone: '',
      relationship: ''
    }
  })

  // Validation functions (same as AddEmployeeDialog)
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

  // Populate form when employee changes
  useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name || '',
        email: employee.email || '',
        phone: employee.phone || '',
        employeeId: employee.employeeId || '',
        position: employee.position || '',
        department: employee.department || '',
        salary: employee.salary?.toString() || '',
        dateOfJoining: employee.dateOfJoining ? employee.dateOfJoining.split('T')[0] : '',
        salesTarget: employee.salesTarget?.toString() || '',
        address: {
          street: employee.address?.street || '',
          city: employee.address?.city || '',
          state: employee.address?.state || '',
          zipCode: employee.address?.zipCode || '',
          country: employee.address?.country || ''
        },
        emergencyContact: {
          name: employee.emergencyContact?.name || '',
          phone: employee.emergencyContact?.phone || '',
          relationship: employee.emergencyContact?.relationship || ''
        }
      })
    }
  }, [employee])

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!employee) return

    // Validation checks
    if (!validateEmail(formData.email)) {
      toast.error('Please enter a valid email address')
      return
    }

    if (formData.phone.length !== 10) {
      toast.error('Phone number must be exactly 10 digits')
      return
    }

    if (!validateJoiningDate(formData.dateOfJoining)) {
      toast.error('Joining date cannot be in the future')
      return
    }

    if (formData.emergencyContact.phone && formData.emergencyContact.phone.length !== 10) {
      toast.error('Emergency contact phone must be exactly 10 digits')
      return
    }

    setIsLoading(true)

    try {
      const updateData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        employeeId: formData.employeeId,
        department: formData.department,
        position: formData.position,
        salary: parseFloat(formData.salary) || 0,
        dateOfJoining: formData.dateOfJoining,
        salesTarget: formData.department === 'Sales' ? parseFloat(formData.salesTarget) || 0 : 0,
        address: formData.address,
        emergencyContact: formData.emergencyContact
      }

      const response = await fetch(`http://localhost:8080/api/employees/${employee._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(updateData),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Employee updated successfully! 🎉')
        onOpenChange(false)
        if (onEmployeeUpdated) {
          onEmployeeUpdated()
        }
      } else {
        toast.error(data.message || 'Failed to update employee')
      }
    } catch (error) {
      console.error('Error updating employee:', error)
      toast.error('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!employee) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg">
              <Edit className="w-5 h-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold text-gray-900">Edit Employee</DialogTitle>
              <DialogDescription className="text-sm text-gray-600 mt-1">
                Update employee information for {employee.name}
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
                  className="mt-1"
                  disabled
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
                  maxLength={10}
                  className="mt-1"
                  required
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
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="dateOfJoining" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Calendar className="w-3 h-3" />
                  Date of Joining *
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
              <div className="mt-4">
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
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="address.city" className="text-sm font-medium text-gray-700">City</Label>
                  <Input
                    id="address.city"
                    name="address.city"
                    value={formData.address.city}
                    onChange={handleInputChange}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="address.state" className="text-sm font-medium text-gray-700">State</Label>
                  <Input
                    id="address.state"
                    name="address.state"
                    value={formData.address.state}
                    onChange={handleInputChange}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="address.zipCode" className="text-sm font-medium text-gray-700">ZIP Code</Label>
                  <Input
                    id="address.zipCode"
                    name="address.zipCode"
                    value={formData.address.zipCode}
                    onChange={handleInputChange}
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="emergencyContact.name" className="text-sm font-medium text-gray-700">
                    Emergency Contact Name
                  </Label>
                  <Input
                    id="emergencyContact.name"
                    name="emergencyContact.name"
                    value={formData.emergencyContact.name}
                    onChange={handleInputChange}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="emergencyContact.phone" className="text-sm font-medium text-gray-700">
                    Emergency Contact Phone (10 digits)
                  </Label>
                  <Input
                    id="emergencyContact.phone"
                    name="emergencyContact.phone"
                    type="tel"
                    value={formData.emergencyContact.phone}
                    onChange={handleInputChange}
                    maxLength={10}
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="emergencyContact.relationship" className="text-sm font-medium text-gray-700">
                  Relationship
                </Label>
                <Input
                  id="emergencyContact.relationship"
                  name="emergencyContact.relationship"
                  value={formData.emergencyContact.relationship}
                  onChange={handleInputChange}
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
              disabled={isLoading}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 cursor-pointer"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Edit className="w-4 h-4 mr-2" />
                  Update Employee
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}