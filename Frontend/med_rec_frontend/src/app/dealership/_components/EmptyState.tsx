"use client"

import React from 'react'
import { Users, UserPlus } from 'lucide-react'

interface EmptyStateProps {
  onAddEmployee: () => void
}

export const EmptyState = ({ onAddEmployee }: EmptyStateProps) => {
  return (
    <div className="text-center py-12">
      <div className="flex flex-col items-center text-gray-500">
        <div className="p-4 bg-green-100 rounded-full mb-4">
          <Users className="w-8 h-8 text-green-500" />
        </div>
        <p className="text-lg font-medium text-gray-700">
          No employees found
        </p>
        <p className="text-sm mt-2 text-gray-500">
          Get started by adding your first employee
        </p>
        <button 
          onClick={onAddEmployee}
          className="mt-4 px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          Add Employee
        </button>
      </div>
    </div>
  )
}