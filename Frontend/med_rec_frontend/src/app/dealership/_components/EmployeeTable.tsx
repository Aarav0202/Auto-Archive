"use client"

import React, { useState } from 'react'
import { 
  Eye, 
  Edit, 
  Trash2, 
  Phone, 
  Mail, 
  CheckCircle,
  XCircle,
  Car
} from 'lucide-react'
import { DeleteEmployeeDialog } from './DeleteEmployeeDialog'
import { EditEmployeeDialog } from './EditEmployeeDialog'
import { ViewEmployeeDialog } from './ViewEmployeeDialog'

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

interface EmployeeTableProps {
  employees: Employee[]
  onEmployeeUpdated: () => void
}

export const EmployeeTable = ({ employees, onEmployeeUpdated }: EmployeeTableProps) => {
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)

  // Helper functions
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
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

  const handleDeleteClick = (employee: Employee) => {
    setSelectedEmployee(employee)
    setShowDeleteDialog(true)
  }

  const handleEditClick = (employee: Employee) => {
    setSelectedEmployee(employee)
    setShowEditDialog(true)
  }

  const handleViewClick = (employee: Employee) => {
    setSelectedEmployee(employee)
    setShowViewDialog(true)
  }

  const handleEmployeeDeleted = () => {
    onEmployeeUpdated()
    setSelectedEmployee(null)
    setShowDeleteDialog(false)
  }

  const handleEmployeeUpdated = () => {
    onEmployeeUpdated() // This will refresh the employee list
    setSelectedEmployee(null)
    setShowEditDialog(false)
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Employee
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Department & Position
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Performance
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {employees.map((employee) => (
              <tr key={employee._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center">
                        <span className="text-sm font-medium text-white">
                          {employee.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                      <div className="text-sm text-gray-500">ID: {employee.employeeId}</div>
                      <div className="text-xs text-gray-400">
                        Joined: {formatDate(employee.dateOfJoining)}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{employee.position}</div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getDepartmentColor(employee.department)}`}>
                    {employee.department}
                  </span>
                  <div className="text-xs text-gray-500 mt-1">
                    {formatSalary(employee.salary)}/year
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-gray-400" />
                    {employee.phone}
                  </div>
                  <div className="text-sm text-gray-500 flex items-center gap-1">
                    <Mail className="w-3 h-3 text-gray-400" />
                    {employee.email}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {employee.department === 'Sales' ? (
                    <div className="text-sm">
                      <div className="flex items-center gap-1 text-gray-900">
                        <Car className="w-3 h-3 text-blue-500" />
                        {employee.carsSold} cars sold
                      </div>
                      <div className="text-xs text-gray-500">
                        Target: {employee.salesTarget}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                        <div 
                          className="bg-green-500 h-1.5 rounded-full" 
                          style={{ 
                            width: `${employee.salesTarget > 0 ? Math.min((employee.carsSold / employee.salesTarget) * 100, 100) : 0}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">
                      Non-sales role
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
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
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button 
                      className="text-blue-600 hover:text-blue-900 transition-colors"
                      title="View Details"
                      onClick={() => handleViewClick(employee)}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button 
                      className="text-yellow-600 hover:text-yellow-900 transition-colors"
                      title="Edit Employee"
                      onClick={() => handleEditClick(employee)}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      className="text-red-600 hover:text-red-900 transition-colors"
                      title="Delete Employee"
                      onClick={() => handleDeleteClick(employee)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Delete Employee Dialog */}
      <DeleteEmployeeDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        employee={selectedEmployee}
        onEmployeeDeleted={handleEmployeeDeleted}
      />

      {/* Edit Employee Dialog */}
      <EditEmployeeDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        employee={selectedEmployee}
        onEmployeeUpdated={handleEmployeeUpdated}
      />

      {/* View Employee Dialog */}
      <ViewEmployeeDialog
        open={showViewDialog}
        onOpenChange={setShowViewDialog}
        employee={selectedEmployee}
      />
    </>
  )
}