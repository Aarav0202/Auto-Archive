"use client"

import React, { useState } from 'react'
import toast from 'react-hot-toast'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Loader2, Trash2 } from 'lucide-react'

interface DeleteEmployeeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  employee: {
    _id: string
    name: string
    employeeId: string
    position: string
    department: string
  } | null
  onEmployeeDeleted: () => void
}

export const DeleteEmployeeDialog = ({ 
  open, 
  onOpenChange, 
  employee, 
  onEmployeeDeleted 
}: DeleteEmployeeDialogProps) => {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!employee) return

    try {
      setIsDeleting(true)
      
      const response = await fetch(`http://localhost:8080/api/employees/${employee._id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        toast.success(`${employee.name} has been deleted successfully`)
        onEmployeeDeleted()
        onOpenChange(false)
      } else {
        const errorData = await response.json()
        toast.error(errorData.message || 'Failed to delete employee')
      }
    } catch (error) {
      console.error('Error deleting employee:', error)
      toast.error('An error occurred while deleting the employee')
    } finally {
      setIsDeleting(false)
    }
  }

  if (!employee) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-full">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold text-gray-900">
                Delete Employee
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-500 mt-1">
                This action cannot be undone.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Trash2 className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-red-800 mb-1">
                  You are about to delete:
                </h4>
                <div className="text-sm text-red-700">
                  <p><strong>Name:</strong> {employee.name}</p>
                  <p><strong>Employee ID:</strong> {employee.employeeId}</p>
                  <p><strong>Position:</strong> {employee.position}</p>
                  <p><strong>Department:</strong> {employee.department}</p>
                </div>
                <p className="text-xs text-red-600 mt-2">
                  This will permanently remove all employee data from the system.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
            className="px-4 py-2"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-4 py-2 bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Employee
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}