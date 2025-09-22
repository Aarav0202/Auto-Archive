"use client"
import React, { useState } from 'react'
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
  Contact
} from 'lucide-react'

interface AddEmployeeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const AddEmployeeDialog = ({ open, onOpenChange }: AddEmployeeDialogProps) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    position: '',
    department: '',
    salary: '',
    startDate: '',
    address: '',
    emergencyContact: '',
    emergencyPhone: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement API call to save employee
    console.log('Employee data:', formData)
    
    // Reset form and close dialog
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      position: '',
      department: '',
      salary: '',
      startDate: '',
      address: '',
      emergencyContact: '',
      emergencyPhone: ''
    })
    onOpenChange(false)
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
                <Label htmlFor="firstName" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <User className="w-3 h-3" />
                  First Name *
                </Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <User className="w-3 h-3" />
                  Last Name *
                </Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="mt-1"
                  required
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
                  Phone Number *
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
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
                  <option value="Parts">Parts</option>
                  <option value="Finance">Finance</option>
                  <option value="Management">Management</option>
                  <option value="Administration">Administration</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <Label htmlFor="salary" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <DollarSign className="w-3 h-3" />
                  Salary
                </Label>
                <Input
                  id="salary"
                  name="salary"
                  type="number"
                  value={formData.salary}
                  onChange={handleInputChange}
                  placeholder="Annual salary"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="startDate" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Calendar className="w-3 h-3" />
                  Start Date *
                </Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className="mt-1"
                  required
                />
              </div>
            </div>
          </div>

          {/* Additional Information Section */}
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-4 h-4 text-orange-600" />
              <h3 className="font-medium text-orange-900">Additional Information</h3>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="address" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <MapPin className="w-3 h-3" />
                  Address
                </Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Full address"
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="emergencyContact" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Contact className="w-3 h-3" />
                    Emergency Contact
                  </Label>
                  <Input
                    id="emergencyContact"
                    name="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={handleInputChange}
                    placeholder="Emergency contact name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="emergencyPhone" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Phone className="w-3 h-3" />
                    Emergency Phone
                  </Label>
                  <Input
                    id="emergencyPhone"
                    name="emergencyPhone"
                    type="tel"
                    value={formData.emergencyPhone}
                    onChange={handleInputChange}
                    placeholder="Emergency contact phone"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="px-6"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="px-6 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add Employee
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}