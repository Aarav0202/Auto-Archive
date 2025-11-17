"use client"

import React, { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Trash2, Wrench, Edit2 } from 'lucide-react'
import toast from 'react-hot-toast'
import CustomerServiceRecordsDialog from './CustomerServiceRecordsDialog'
import EditVehicleDialog from './EditVehicleDialog'

interface ViewCustomerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  data: any
}

export default function ViewCustomerDialog({ open, onOpenChange, data }: ViewCustomerDialogProps) {
  // Handle nested response structure from backend: { customer, vehicles }
  // or flat structure if customer data is passed directly
  const customer = data?.customer || data
  const [vehicles, setVehicles] = useState<any[]>(data?.vehicles || [])
  const [loading, setLoading] = useState(false)
  const [showServiceRecords, setShowServiceRecords] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState<any>(null)
  const [showEditVehicle, setShowEditVehicle] = useState(false)

  // Refresh vehicles when data changes or dialog opens
  useEffect(() => {
    if (open && customer?._id) {
      setLoading(true)
      fetch(`http://localhost:8080/api/vehicles/customer/${customer._id}`, { 
        credentials: 'include' 
      })
        .then(async res => {
          if (!res.ok) throw new Error('Failed to fetch vehicles')
          const response = await res.json()
          console.log('Vehicles refreshed:', response)
          setVehicles(response.vehicles || [])
        })
        .catch(err => {
          console.error('Error fetching vehicles:', err)
          setVehicles(data?.vehicles || [])
        })
        .finally(() => setLoading(false))
    } else if (data?.vehicles) {
      setVehicles(data.vehicles)
    }
  }, [open, customer?._id, data?.vehicles])

  // Listen for vehicle added/deleted events
  useEffect(() => {
    if (open && customer?._id) {
      const handleVehicleUpdate = () => {
        // Refetch vehicles
        fetch(`http://localhost:8080/api/vehicles/customer/${customer._id}`, { 
          credentials: 'include' 
        })
          .then(async res => {
            if (res.ok) {
              const response = await res.json()
              console.log('Vehicles updated after event:', response)
              setVehicles(response.vehicles || [])
            }
          })
          .catch(err => console.error('Error refetching vehicles:', err))
      }
      
      window.addEventListener('customerAdded', handleVehicleUpdate as EventListener)
      window.addEventListener('vehicleAdded', handleVehicleUpdate as EventListener)
      window.addEventListener('vehicleDeleted', handleVehicleUpdate as EventListener)
      
      return () => {
        window.removeEventListener('customerAdded', handleVehicleUpdate as EventListener)
        window.removeEventListener('vehicleAdded', handleVehicleUpdate as EventListener)
        window.removeEventListener('vehicleDeleted', handleVehicleUpdate as EventListener)
      }
    }
  }, [open, customer?._id])

  const formatDate = (d?: string) => {
    if (!d) return '-'
    try { return new Date(d).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) } catch { return d }
  }

  const handleDeleteVehicle = async (vehicleId: string) => {
    if (!confirm('Are you sure you want to delete this vehicle?')) {
      return
    }

    try {
      const res = await fetch(`http://localhost:8080/api/vehicles/${vehicleId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (!res.ok) {
        const errorData = await res.json()
        toast.error(errorData.message || 'Failed to delete vehicle')
        return
      }

      toast.success('Vehicle deleted successfully')
      
      // Refetch vehicles
      if (customer?._id) {
        const fetchRes = await fetch(`http://localhost:8080/api/vehicles/customer/${customer._id}`, {
          credentials: 'include'
        })
        if (fetchRes.ok) {
          const response = await fetchRes.json()
          setVehicles(response.vehicles || [])
          // Dispatch event to notify other components
          window.dispatchEvent(new CustomEvent('vehicleDeleted', { detail: { vehicleId } }))
        }
      }
    } catch (error) {
      console.error('Error deleting vehicle:', error)
      toast.error('Network error while deleting vehicle')
    }
  }

  const handleEditVehicle = (vehicle: any) => {
    setEditingVehicle(vehicle)
    setShowEditVehicle(true)
  }

  const handleVehicleEditSuccess = async () => {
    // Refetch vehicles after successful edit
    if (customer?._id) {
      const res = await fetch(`http://localhost:8080/api/vehicles/customer/${customer._id}`, {
        credentials: 'include'
      })
      if (res.ok) {
        const response = await res.json()
        setVehicles(response.vehicles || [])
        window.dispatchEvent(new CustomEvent('vehicleUpdated', { detail: { vehicleId: editingVehicle._id } }))
      }
    }
  }

  if (!customer || !customer._id) {
    return null // Don't render if no customer data
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
            <DialogDescription className="truncate">{customer?.name}</DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto pr-4 space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700">Contact</h4>
                <div className="text-sm mt-2"><strong>Email:</strong> {customer?.email || '-'}</div>
                <div className="text-sm"><strong>Phone:</strong> {customer?.phone || '-'}</div>
                <div className="text-sm"><strong>Joined:</strong> {formatDate(customer?.createdAt)}</div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700">Identifiers</h4>
                <div className="text-sm mt-2"><strong>License:</strong> {customer?.licenseNumber || '-'}</div>
                <div className="text-sm"><strong>DOB:</strong> {customer?.dateOfBirth ? formatDate(customer.dateOfBirth) : '-'}</div>
                <div className="text-sm"><strong>Type:</strong> {customer?.customerType || '-'}</div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700">Address</h4>
              {customer?.address ? (
                <div className="text-sm mt-2">
                  <div>{customer.address.street}</div>
                  <div>{customer.address.city}, {customer.address.state} {customer.address.zipCode}</div>
                  <div>{customer.address.country || ''}</div>
                </div>
              ) : (
                <div className="text-sm mt-2">-</div>
              )}
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700">Dealership</h4>
              <div className="text-sm mt-2">{customer?.dealershipId?.name || customer?.dealershipId || '-'}</div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700">Notes</h4>
              <div className="text-sm mt-2 text-gray-700">{customer?.notes || '-'}</div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700">Vehicles ({vehicles.length})</h4>
              {vehicles.length === 0 ? (
                <p className="text-sm text-muted-foreground mt-2">No vehicles yet</p>
              ) : (
                <div className="space-y-3 mt-2">
                  {vehicles.map((v: any) => (
                    <div key={v._id} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">
                            {v.companyName && v.vehicleName 
                              ? `${v.companyName} ${v.vehicleName}` 
                              : v.make && v.model 
                              ? `${v.make} ${v.model}` 
                              : 'Vehicle'}
                            {v.model && !v.vehicleName ? ` (${v.model})` : v.model ? ` (${v.model})` : ''}
                          </div>
                          <div className="text-xs text-gray-600 mt-1 space-y-1">
                            <div><strong>License Plate:</strong> {v.licensePlateNumber || v.plateNumber || '-'}</div>
                            <div><strong>Chassis Number:</strong> {v.chassyNumber || v.vin || '-'}</div>
                          </div>
                          {v.dateOfBuying && (
                            <div className="text-xs text-gray-600 mt-1">
                              <strong>Date of Buying:</strong> {formatDate(v.dateOfBuying)}
                            </div>
                          )}
                          {(v.lastServicedDate || v.dueServiceDate) && (
                            <div className="text-xs text-gray-600 mt-1 space-y-1">
                              {v.lastServicedDate && <div><strong>Last Serviced:</strong> {formatDate(v.lastServicedDate)}</div>}
                              {v.dueServiceDate && <div><strong>Due Service:</strong> {formatDate(v.dueServiceDate)}</div>}
                            </div>
                          )}
                        </div>
                        <div className="flex-shrink-0 flex gap-2">
                          <button
                            onClick={() => handleEditVehicle(v)}
                            className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors duration-200 cursor-pointer"
                            title="Edit Vehicle"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteVehicle(v._id)}
                            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200 cursor-pointer"
                            title="Delete Vehicle"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
            <Button 
              onClick={() => setShowServiceRecords(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2 cursor-pointer"
            >
              <Wrench className="h-4 w-4" />
              View Service Records
            </Button>
            <Button 
              onClick={() => onOpenChange(false)} 
              variant="outline"
              className="cursor-pointer"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Service Records Dialog */}
      <CustomerServiceRecordsDialog
        open={showServiceRecords}
        onOpenChange={setShowServiceRecords}
        customerId={customer?._id}
        customerName={customer?.name}
      />

      {/* Edit Vehicle Dialog */}
      <EditVehicleDialog
        open={showEditVehicle}
        onOpenChange={setShowEditVehicle}
        vehicle={editingVehicle}
        onSuccess={handleVehicleEditSuccess}
      />
    </>
  )
}
