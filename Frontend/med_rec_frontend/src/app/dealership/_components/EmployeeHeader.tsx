"use client"

import React from 'react'
import { Users, UserPlus } from 'lucide-react'

interface EmployeeHeaderProps {
  employeeCount: number
  onAddEmployee: () => void
}

export const EmployeeHeader = ({ 
  employeeCount, 
  onAddEmployee 
}: EmployeeHeaderProps) => {
  return (
    <>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
            <Users className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Employees ({employeeCount})
          </h1>
        </div>
        <p className="text-gray-600 ml-14">Manage and view all dealership employees</p>
      </div>
      
      {/* Table Header with Add Button */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="p-6 border-b bg-gradient-to-r from-green-50 to-emerald-50">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500 rounded-lg">
                <Users className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Employee List</h2>
            </div>
            <div className="flex space-x-3">
              <button 
                onClick={onAddEmployee}
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Add Employee
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}