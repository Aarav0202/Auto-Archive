"use client"

import React, { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { AlertCircle, ChevronDown, Wrench, Calendar, Zap } from 'lucide-react'
import toast from 'react-hot-toast'

interface ServiceRecord {
  partsChanged?: string
  nextServiceDueKms?: number
  nextServiceDueDate?: string
  notes?: string
  completedDate?: string
  completedKms?: number
}

interface ServiceRequestData {
  _id: string
  requestId: string
  serviceType: string
  confirmedDate: string
  confirmedTime: string
  status: string
  serviceRecord?: ServiceRecord
}

interface CustomerServiceRecordsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customerId: string
  customerName: string
}

const CustomerServiceRecordsDialog = ({ 
  open, 
  onOpenChange, 
  customerId,
  customerName 
}: CustomerServiceRecordsDialogProps) => {
  const [vehicles, setVehicles] = useState<any[]>([])
  const [serviceRecords, setServiceRecords] = useState<any>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expandedVehicle, setExpandedVehicle] = useState<string | null>(null)
  const [selectedService, setSelectedService] = useState<any>(null)

  useEffect(() => {
    if (open && customerId) {
      fetchCustomerVehiclesAndRecords()
    }
  }, [open, customerId])

  const fetchCustomerVehiclesAndRecords = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch vehicles for this customer
      const vehiclesRes = await fetch(
        `http://localhost:8080/api/vehicles/customer/${customerId}`,
        { credentials: 'include' }
      )

      if (!vehiclesRes.ok) {
        throw new Error('Failed to fetch customer vehicles')
      }

      const vehiclesData = await vehiclesRes.json()
      const customerVehicles = vehiclesData.vehicles || []
      setVehicles(customerVehicles)

      // Fetch service records for each vehicle
      const records: any = {}
      for (const vehicle of customerVehicles) {
        try {
          const recordsRes = await fetch(
            `http://localhost:8080/api/service-requests/customer/vehicle/${vehicle._id}`,
            { credentials: 'include' }
          )

          if (recordsRes.ok) {
            const recordsData = await recordsRes.json()
            records[vehicle._id] = recordsData.requests || []
          } else {
            records[vehicle._id] = []
          }
        } catch (err) {
          console.error(`Error fetching records for vehicle ${vehicle._id}:`, err)
          records[vehicle._id] = []
        }
      }

      setServiceRecords(records)
    } catch (err) {
      console.error('Error fetching data:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch service records')
      toast.error('Failed to load service records')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-'
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    } catch {
      return dateStr
    }
  }

  const getVehicleDisplayName = (vehicle: any) => {
    return vehicle.companyName && vehicle.vehicleName
      ? `${vehicle.companyName} ${vehicle.vehicleName}`
      : `${vehicle.make || 'Vehicle'} ${vehicle.model || ''}`
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5 text-purple-600" />
            Service Records - {customerName}
          </DialogTitle>
          <DialogDescription>
            View all service records for this customer's vehicles
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-4">
          {loading && (
            <div className="flex justify-center items-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500 mx-auto mb-3"></div>
                <p className="text-gray-600">Loading service records...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <p className="font-medium text-red-800">Error</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {!loading && !error && vehicles.length === 0 && (
            <div className="text-center py-8">
              <div className="p-4 bg-gray-100 rounded-full inline-block mb-3">
                <Wrench className="h-8 w-8 text-gray-600" />
              </div>
              <p className="text-gray-700 font-medium">No vehicles found</p>
              <p className="text-sm text-gray-500 mt-2">
                This customer has no vehicles registered
              </p>
            </div>
          )}

          {!loading && !error && vehicles.length > 0 && (
            <div className="space-y-3">
              {vehicles.map((vehicle) => {
                const records = serviceRecords[vehicle._id] || []
                const completedRecords = records.filter(
                  (r: ServiceRequestData) =>
                    r.status === 'Completed' && r.serviceRecord
                )

                return (
                  <div key={vehicle._id} className="border border-gray-200 rounded-lg overflow-hidden">
                    {/* Vehicle Header */}
                    <button
                      onClick={() =>
                        setExpandedVehicle(
                          expandedVehicle === vehicle._id ? null : vehicle._id
                        )
                      }
                      className="w-full bg-gradient-to-r from-purple-50 to-blue-50 p-4 flex items-center justify-between hover:bg-purple-100 transition-colors"
                    >
                      <div className="flex items-center gap-3 text-left flex-1">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <Wrench className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {getVehicleDisplayName(vehicle)}
                          </p>
                          <p className="text-xs text-gray-600">
                            License: {vehicle.licensePlateNumber || '-'} • {completedRecords.length} service(s)
                          </p>
                        </div>
                      </div>
                      <ChevronDown
                        className={`h-5 w-5 text-gray-600 transition-transform ${
                          expandedVehicle === vehicle._id ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {/* Service Records */}
                    {expandedVehicle === vehicle._id && (
                      <div className="bg-white border-t border-gray-200 p-4 space-y-3">
                        {completedRecords.length === 0 ? (
                          <p className="text-sm text-gray-600 text-center py-4">
                            No service records for this vehicle
                          </p>
                        ) : (
                          completedRecords.map((service: ServiceRequestData) => (
                            <div
                              key={service._id}
                              onClick={() => setSelectedService(service)}
                              className="border border-purple-200 rounded-lg p-3 hover:bg-purple-50 cursor-pointer transition-colors"
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h4 className="font-semibold text-gray-900">
                                    {service.serviceType}
                                  </h4>
                                  <p className="text-xs text-gray-600">
                                    Completed: {formatDate(service.serviceRecord?.completedDate)}
                                  </p>
                                </div>
                                <span className="text-xs font-semibold px-2 py-1 rounded bg-green-100 text-green-700">
                                  Completed
                                </span>
                              </div>

                              {service.serviceRecord?.partsChanged && (
                                <p className="text-sm text-gray-700 truncate">
                                  <strong>Parts:</strong> {service.serviceRecord.partsChanged.substring(0, 60)}...
                                </p>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Service Details Modal */}
        {selectedService && (
          <div
            className="fixed inset-0 bg-purple-900/20 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedService(null)}
          >
            <div
              className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Wrench className="h-6 w-6" />
                  <h2 className="text-2xl font-bold">Service Details</h2>
                </div>
                <button
                  onClick={() => setSelectedService(null)}
                  className="text-2xl font-bold hover:opacity-80 transition cursor-pointer"
                >
                  ×
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="border-b pb-4">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-bold text-gray-900">
                      {selectedService.serviceType} Service
                    </h3>
                    <span className="text-xs font-semibold px-3 py-1 rounded bg-green-100 text-green-700">
                      Completed
                    </span>
                  </div>
                </div>

                {/* Service Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 font-medium mb-1">
                      Service Completed On
                    </p>
                    <p className="font-semibold text-gray-900 flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-purple-600" />
                      {formatDate(selectedService.serviceRecord?.completedDate)}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 font-medium mb-1">Service Type</p>
                    <p className="font-semibold text-gray-900">
                      {selectedService.serviceType}
                    </p>
                  </div>
                </div>

                {/* Parts Changed */}
                {selectedService.serviceRecord?.partsChanged && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Parts Changed</h4>
                    <ul className="space-y-1">
                      {selectedService.serviceRecord.partsChanged
                        .split(',')
                        .map((part: string, index: number) => (
                          <li
                            key={index}
                            className="text-sm text-gray-900 flex items-start gap-2"
                          >
                            <span className="text-blue-600 font-bold mt-0.5">•</span>
                            <span>{part.trim()}</span>
                          </li>
                        ))}
                    </ul>
                  </div>
                )}

                {/* Completion KMs */}
                {selectedService.serviceRecord?.completedKms && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-xs text-gray-600 font-medium mb-1">
                      Vehicle KMs at Completion
                    </p>
                    <p className="font-bold text-2xl text-gray-900 flex items-center gap-2">
                      <Zap className="h-5 w-5 text-yellow-600" />
                      {selectedService.serviceRecord.completedKms?.toLocaleString()} KMs
                    </p>
                  </div>
                )}

                {/* Next Service Schedule */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Next Service Schedule
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedService.serviceRecord?.nextServiceDueKms ? (
                      <div className="bg-white p-3 rounded border border-green-100">
                        <p className="text-xs text-gray-600 mb-1">Due at KMs</p>
                        <p className="font-bold text-lg text-gray-900">
                          {selectedService.serviceRecord.nextServiceDueKms?.toLocaleString()} KMs
                        </p>
                      </div>
                    ) : (
                      <div className="bg-white p-3 rounded border border-gray-200">
                        <p className="text-xs text-gray-500">KMs not set</p>
                      </div>
                    )}
                    {selectedService.serviceRecord?.nextServiceDueDate ? (
                      <div className="bg-white p-3 rounded border border-green-100">
                        <p className="text-xs text-gray-600 mb-1">Due on Date</p>
                        <p className="font-bold text-lg text-gray-900">
                          {formatDate(selectedService.serviceRecord?.nextServiceDueDate)}
                        </p>
                      </div>
                    ) : (
                      <div className="bg-white p-3 rounded border border-gray-200">
                        <p className="text-xs text-gray-500">Date not set</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Notes */}
                {selectedService.serviceRecord?.notes && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-600 font-medium mb-2">
                      Additional Notes
                    </p>
                    <p className="text-sm text-gray-700">
                      {selectedService.serviceRecord.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default CustomerServiceRecordsDialog
