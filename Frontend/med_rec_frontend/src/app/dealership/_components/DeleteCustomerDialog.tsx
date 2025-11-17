"use client"

import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'
import { AlertCircle } from 'lucide-react'

interface DeleteCustomerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customer: any
  onCustomerDeleted: () => void
}

export const DeleteCustomerDialog = ({
  open,
  onOpenChange,
  customer,
  onCustomerDeleted,
}: DeleteCustomerDialogProps) => {
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (!customer?._id) return

    setLoading(true)
    try {
      const res = await fetch(`http://localhost:8080/api/customers/${customer._id}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (res.ok) {
        toast.success('Customer deleted successfully')
        onOpenChange(false)
        onCustomerDeleted()
      } else {
        const data = await res.json()
        toast.error(data.message || 'Failed to delete customer')
      }
    } catch (error) {
      console.error('Error deleting customer:', error)
      toast.error('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <DialogTitle className="text-red-600">Delete Customer</DialogTitle>
              <DialogDescription className="text-sm mt-1">
                This action cannot be undone.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm text-gray-700">
            Are you sure you want to delete <strong>{customer?.name}</strong>?
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Email: {customer?.email}
          </p>
          <p className="text-xs text-red-600 mt-3">
            Warning: This will also delete all vehicles associated with this customer.
          </p>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="bg-red-600 hover:bg-red-700 text-white cursor-pointer"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? 'Deleting...' : 'Delete Customer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
