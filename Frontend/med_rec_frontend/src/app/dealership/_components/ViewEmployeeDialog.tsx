"use client"

import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { 
  Eye, 
  User, 
  Mail, 
  Phone, 
  Briefcase, 
  Building, 
  DollarSign, 
  Calendar, 
  MapPin, 
  Contact,
  Car,
  CheckCircle,
  XCircle
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

interface ViewEmployeeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  employee: Employee | null
}

export const ViewEmployeeDialog = ({ open, onOpenChange, employee }: ViewEmployeeDialogProps) => {
  if (!employee) return null

  // Helper functions
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatSalary = (salary: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(salary);
  };

  const getDepartmentColor = (department: string) => {
    const colors: { [key: string]: string } = {
      'Sales': 'bg-green-100 text-green-800',
      'Service': 'bg-blue-100 text-blue-800',
      'Finance': 'bg-yellow-100 text-yellow-800',
      'Administration': 'bg-purple-100 text-purple-800',
      'HR': 'bg-pink-100 text-pink-800',
      'Marketing': 'bg-orange-100 text-orange-800',
      'Inventory': 'bg-indigo-100 text-indigo-800',
      'Security': 'bg-red-100 text-red-800'
    };
    return colors[department] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
              <Eye className="w-5 h-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold text-gray-900">Employee Details</DialogTitle>
              <DialogDescription className="text-sm text-gray-600 mt-1">
                Complete information for {employee.name}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Header with Profile and Status */}
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center">
                  <span className="text-xl font-bold text-white">
                    {employee.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{employee.name}</h2>
                  <p className="text-sm text-gray-600">Employee ID: {employee.employeeId}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getDepartmentColor(employee.department)}`}>
                      {employee.department}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      employee.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {employee.isActive ? (
                        <>
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Active
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3 mr-1" />
                          Inactive
                        </>
                      )}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Dealership</p>
                <p className="font-semibold text-gray-900">{employee.dealershipId.name}</p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-3">
              <Contact className="w-4 h-4 text-green-600" />
              <h3 className="font-medium text-green-900">Contact Information</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-sm font-medium text-gray-900">{employee.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="text-sm font-medium text-gray-900">{employee.phone}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Job Information */}
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <div className="flex items-center gap-2 mb-3">
              <Briefcase className="w-4 h-4 text-purple-600" />
              <h3 className="font-medium text-purple-900">Job Information</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">Position</p>
                  <p className="text-sm font-medium text-gray-900">{employee.position}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">Department</p>
                  <p className="text-sm font-medium text-gray-900">{employee.department}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">Annual Salary</p>
                  <p className="text-sm font-medium text-gray-900">{formatSalary(employee.salary)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">Date of Joining</p>
                  <p className="text-sm font-medium text-gray-900">{formatDate(employee.dateOfJoining)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Performance (Sales only) */}
          {employee.department === 'Sales' && (
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <div className="flex items-center gap-2 mb-3">
                <Car className="w-4 h-4 text-orange-600" />
                <h3 className="font-medium text-orange-900">Sales Performance</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Cars Sold</p>
                  <p className="text-lg font-bold text-gray-900">{employee.carsSold}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Sales Target</p>
                  <p className="text-lg font-bold text-gray-900">{employee.salesTarget}</p>
                </div>
              </div>
              <div className="mt-3">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Progress</span>
                  <span>{employee.salesTarget > 0 ? Math.round((employee.carsSold / employee.salesTarget) * 100) : 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-300" 
                    style={{ 
                      width: `${employee.salesTarget > 0 ? Math.min((employee.carsSold / employee.salesTarget) * 100, 100) : 0}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          {/* Address Information */}
          {employee.address && (employee.address.street || employee.address.city || employee.address.state) && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4 text-blue-600" />
                <h3 className="font-medium text-blue-900">Address</h3>
              </div>
              <div className="text-sm text-gray-700">
                {employee.address.street && <p>{employee.address.street}</p>}
                <p>
                  {[employee.address.city, employee.address.state, employee.address.zipCode]
                    .filter(Boolean)
                    .join(', ')}
                </p>
                {employee.address.country && <p>{employee.address.country}</p>}
              </div>
            </div>
          )}

          {/* Emergency Contact */}
          {employee.emergencyContact && employee.emergencyContact.name && (
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <div className="flex items-center gap-2 mb-3">
                <Contact className="w-4 h-4 text-red-600" />
                <h3 className="font-medium text-red-900">Emergency Contact</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Name</p>
                  <p className="text-sm font-medium text-gray-900">{employee.emergencyContact.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Relationship</p>
                  <p className="text-sm font-medium text-gray-900">{employee.emergencyContact.relationship || 'N/A'}</p>
                </div>
                {employee.emergencyContact.phone && (
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="text-sm font-medium text-gray-900">{employee.emergencyContact.phone}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
              <div>
                <p>Created: {formatDate(employee.createdAt)}</p>
              </div>
              <div>
                <p>Last Updated: {formatDate(employee.updatedAt)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button
            onClick={() => onOpenChange(false)}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
          >
            <Eye className="w-4 h-4 mr-2" />
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}