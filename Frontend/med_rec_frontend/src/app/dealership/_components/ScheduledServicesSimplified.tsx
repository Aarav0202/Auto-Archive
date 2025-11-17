"use client"

import React, { useState, useEffect } from "react"
import {
  Calendar,
  Clock,
  Phone,
  AlertCircle,
  CheckCircle,
  Edit2,
  Wrench,
  ChevronDown,
  X,
  Plus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import toast from "react-hot-toast"

interface Vehicle {
  _id: string
  companyName: string
  vehicleName: string
  licensePlateNumber: string
  currentKms: number
}

interface Customer {
  _id: string
  name: string
  email: string
  phone?: string
}

interface ServiceRecord {
  partsChanged?: string
  nextServiceDueKms?: number
  nextServiceDueDate?: string
  notes?: string
  completedDate?: string
  completedKms?: number
}

interface ScheduledService {
  _id: string
  requestId: string
  vehicleId: Vehicle
  customerId: Customer
  serviceType: string
  confirmedDate: string
  confirmedTime: string
  customerPhone: string
  status: string
  serviceRecord?: ServiceRecord
}

interface ScheduledServicesSimplifiedProps {
  onServiceUpdated?: () => void
}

const ScheduledServicesSimplified = ({ onServiceUpdated }: ScheduledServicesSimplifiedProps) => {
  const [services, setServices] = useState<ScheduledService[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedService, setExpandedService] = useState<string | null>(null)
  const [showRecordDialog, setShowRecordDialog] = useState<string | null>(null)
  const [recordFormData, setRecordFormData] = useState({
    parts: [] as string[],
    currentPartInput: "",
    nextServiceDueKms: "",
    nextServiceDueDate: "",
    notes: "",
    completedDate: new Date().toISOString().split("T")[0],
    completedKms: "",
  })

  useEffect(() => {
    fetchScheduledServices()
  }, [])

  const fetchScheduledServices = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch("http://localhost:8080/api/service-requests/dealership/scheduled-services", {
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to fetch scheduled services")
      }

      const data = await response.json()
      setServices(data.requests || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error fetching services")
    } finally {
      setLoading(false)
    }
  }

  const handleAddServiceRecord = async (serviceId: string) => {
    if (recordFormData.parts.length === 0 && !recordFormData.notes) {
      toast.error("Please add at least one part or add notes")
      return
    }

    try {
      const response = await fetch(
        `http://localhost:8080/api/service-requests/dealership/add-record/${serviceId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            partsChanged: recordFormData.parts.join(", "),
            nextServiceDueKms: recordFormData.nextServiceDueKms ? parseInt(recordFormData.nextServiceDueKms) : null,
            nextServiceDueDate: recordFormData.nextServiceDueDate,
            notes: recordFormData.notes,
            completedDate: recordFormData.completedDate,
            completedKms: recordFormData.completedKms ? parseInt(recordFormData.completedKms) : null,
          }),
        }
      )

      if (!response.ok) {
        throw new Error("Failed to add service record")
      }

      toast.success("Service record added successfully!")
      setShowRecordDialog(null)
      setRecordFormData({
        parts: [],
        currentPartInput: "",
        nextServiceDueKms: "",
        nextServiceDueDate: "",
        notes: "",
        completedDate: new Date().toISOString().split("T")[0],
        completedKms: "",
      })
      fetchScheduledServices()
      onServiceUpdated?.()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add service record")
    }
  }

  const handleAddPart = () => {
    if (recordFormData.currentPartInput.trim()) {
      setRecordFormData({
        ...recordFormData,
        parts: [...recordFormData.parts, recordFormData.currentPartInput.trim()],
        currentPartInput: "",
      })
    }
  }

  const handleRemovePart = (index: number) => {
    setRecordFormData({
      ...recordFormData,
      parts: recordFormData.parts.filter((_, i) => i !== index),
    })
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-"
    try {
      return new Date(dateStr).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
        weekday: "short",
      })
    } catch {
      return dateStr
    }
  }

  const getDateColor = (dateStr?: string) => {
    if (!dateStr) return "gray"
    const date = new Date(dateStr)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const nextWeek = new Date(today)
    nextWeek.setDate(nextWeek.getDate() + 7)

    if (date.toDateString() === today.toDateString()) {
      return "border-l-4 border-l-red-500 bg-red-50"
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "border-l-4 border-l-orange-500 bg-orange-50"
    } else if (date < nextWeek) {
      return "border-l-4 border-l-yellow-500 bg-yellow-50"
    }
    return "border-l-4 border-l-blue-500 bg-blue-50"
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading scheduled services...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
        <div>
          <p className="font-medium text-red-800">Error</p>
          <p className="text-sm text-red-700">{error}</p>
        </div>
      </div>
    )
  }

  if (services.length === 0) {
    return (
      <div className="text-center py-12 bg-green-50 rounded-lg border border-green-200">
        <div className="p-4 bg-green-100 rounded-full inline-block mb-4">
          <Calendar className="h-8 w-8 text-green-600" />
        </div>
        <p className="text-gray-700 font-medium">No scheduled services</p>
        <p className="text-sm text-gray-500 mt-2">Accepted requests will appear here sorted by date</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <CheckCircle className="h-5 w-5 text-green-600" />
        <h2 className="text-xl font-bold text-gray-900">Scheduled Services ({services.length})</h2>
        <span className="text-sm text-gray-600 ml-auto">Sorted by date</span>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
        <div className="flex items-center gap-2">
          <div className="h-3 w-1 rounded-full bg-red-500"></div>
          <span className="text-xs text-gray-600">Today</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-1 rounded-full bg-orange-500"></div>
          <span className="text-xs text-gray-600">Tomorrow</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-1 rounded-full bg-yellow-500"></div>
          <span className="text-xs text-gray-600">This week</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-1 rounded-full bg-blue-500"></div>
          <span className="text-xs text-gray-600">Later</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {services.map((service) => (
          <div key={service._id} className={`border rounded-lg bg-white hover:shadow-md transition-all ${getDateColor(service.confirmedDate)}`}>
            {/* Collapsed View - Just Customer Name and Car Details */}
            {expandedService !== service._id ? (
              <button
                onClick={() => setExpandedService(service._id)}
                className="w-full text-left p-4 flex items-center justify-between hover:bg-opacity-75 transition-all"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900">{service.customerId?.name}</h3>
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full font-medium">
                      {service.serviceType}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {service.vehicleId?.companyName} {service.vehicleId?.vehicleName} • {service.vehicleId?.licensePlateNumber}
                  </p>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1 text-sm text-gray-700">
                      <Calendar className="h-4 w-4 text-gray-600" />
                      <span className="font-medium">{formatDate(service.confirmedDate)}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-700">
                      <Clock className="h-4 w-4 text-gray-600" />
                      <span className="font-medium">{service.confirmedTime}</span>
                    </div>
                  </div>
                </div>
                <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0 ml-2" />
              </button>
            ) : (
              // Expanded View - Full Details
              <div className="p-4 space-y-4">
                {/* Header with collapse button */}
                <div className="flex items-start justify-between pb-4 border-b">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg text-gray-900">{service.customerId?.name}</h3>
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full font-medium">
                        {service.serviceType}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {service.vehicleId?.companyName} {service.vehicleId?.vehicleName}
                    </p>
                  </div>
                  <button
                    onClick={() => setExpandedService(null)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <ChevronDown className="h-5 w-5 rotate-180" />
                  </button>
                </div>

                {/* Service Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 font-medium mb-1">Vehicle Details</p>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">License:</span> {service.vehicleId?.licensePlateNumber}
                      </p>
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">Current KMs:</span> {service.vehicleId?.currentKms?.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 font-medium mb-1">Contact</p>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">Phone:</span> {service.customerPhone}
                      </p>
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">Email:</span> {service.customerId?.email}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Scheduled Date/Time */}
                <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                  <p className="text-xs text-gray-600 font-medium mb-2">Scheduled Service</p>
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-gray-900">{formatDate(service.confirmedDate)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-gray-900">{service.confirmedTime}</span>
                    </div>
                  </div>
                </div>

                {/* Service Record Section */}
                {service.serviceRecord && Object.values(service.serviceRecord).some(v => v) ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Service Record
                    </h4>
                    <div className="space-y-2">
                      {service.serviceRecord.partsChanged && (
                        <div>
                          <p className="text-xs text-gray-600 font-medium">Parts Changed</p>
                          <p className="text-sm text-gray-900">{service.serviceRecord.partsChanged}</p>
                        </div>
                      )}
                      {service.serviceRecord.completedKms && (
                        <div>
                          <p className="text-xs text-gray-600 font-medium">Completed at KMs</p>
                          <p className="text-sm text-gray-900">{service.serviceRecord.completedKms?.toLocaleString()}</p>
                        </div>
                      )}
                      {service.serviceRecord.nextServiceDueKms && (
                        <div>
                          <p className="text-xs text-gray-600 font-medium">Next Service Due at KMs</p>
                          <p className="text-sm text-gray-900">{service.serviceRecord.nextServiceDueKms?.toLocaleString()}</p>
                        </div>
                      )}
                      {service.serviceRecord.nextServiceDueDate && (
                        <div>
                          <p className="text-xs text-gray-600 font-medium">Next Service Due Date</p>
                          <p className="text-sm text-gray-900">{formatDate(service.serviceRecord.nextServiceDueDate)}</p>
                        </div>
                      )}
                      {service.serviceRecord.notes && (
                        <div>
                          <p className="text-xs text-gray-600 font-medium">Notes</p>
                          <p className="text-sm text-gray-900">{service.serviceRecord.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <p className="text-sm text-amber-900 font-medium">No service record added yet</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 flex-wrap pt-4 border-t">
                  <Button
                    onClick={() => {
                      const parts = service.serviceRecord?.partsChanged 
                        ? service.serviceRecord.partsChanged.split(",").map(p => p.trim())
                        : []
                      setShowRecordDialog(service._id)
                      setRecordFormData({
                        parts: parts,
                        currentPartInput: "",
                        nextServiceDueKms: service.serviceRecord?.nextServiceDueKms?.toString() || "",
                        nextServiceDueDate: service.serviceRecord?.nextServiceDueDate
                          ? service.serviceRecord.nextServiceDueDate.split("T")[0]
                          : "",
                        notes: service.serviceRecord?.notes || "",
                        completedDate: service.serviceRecord?.completedDate
                          ? service.serviceRecord.completedDate.split("T")[0]
                          : new Date().toISOString().split("T")[0],
                        completedKms: service.serviceRecord?.completedKms?.toString() || "",
                      })
                    }}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2"
                  >
                    <Wrench className="h-4 w-4" />
                    {service.serviceRecord ? "Update" : "Add"} Service Record
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Service Record Dialog */}
      {showRecordDialog && (
        <div className="fixed inset-0 bg-purple-900/20 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Dialog Header */}
            <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4 flex items-center justify-between border-b border-purple-800">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                Service Record Details
              </h2>
              <button
                onClick={() => setShowRecordDialog(null)}
                className="text-white hover:bg-purple-800 rounded-full p-1 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Dialog Content */}
            <div className="p-6 space-y-5">
              {/* Parts Changed Section */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Parts Changed
                </label>
                
                {/* Current Parts List */}
                {recordFormData.parts.length > 0 && (
                  <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-xs font-medium text-gray-600 mb-2">Added Parts:</p>
                    <div className="space-y-2">
                      {recordFormData.parts.map((part, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-white p-3 rounded-lg border border-blue-100"
                        >
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                            <span className="text-sm text-gray-900">{part}</span>
                          </div>
                          <button
                            onClick={() => handleRemovePart(index)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add Part Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g., Oil filter, Air filter, Coolant..."
                    value={recordFormData.currentPartInput}
                    onChange={(e) =>
                      setRecordFormData({
                        ...recordFormData,
                        currentPartInput: e.target.value,
                      })
                    }
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        handleAddPart()
                      }
                    }}
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  />
                  <Button
                    onClick={handleAddPart}
                    className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 whitespace-nowrap"
                  >
                    <Plus className="h-4 w-4" />
                    Add Part
                  </Button>
                </div>
              </div>

              {/* Completion Details */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Completion Details
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-700">Completed Date</label>
                    <input
                      type="date"
                      value={recordFormData.completedDate}
                      onChange={(e) =>
                        setRecordFormData({
                          ...recordFormData,
                          completedDate: e.target.value,
                        })
                      }
                      className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700">
                      Completed KMs (Optional)
                    </label>
                    <input
                      type="number"
                      placeholder="0"
                      value={recordFormData.completedKms}
                      onChange={(e) =>
                        setRecordFormData({
                          ...recordFormData,
                          completedKms: e.target.value,
                        })
                      }
                      className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>

              {/* Next Service Details */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Next Service Schedule (Optional)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-700">
                      Next Service Due KMs
                    </label>
                    <input
                      type="number"
                      placeholder="0"
                      value={recordFormData.nextServiceDueKms}
                      onChange={(e) =>
                        setRecordFormData({
                          ...recordFormData,
                          nextServiceDueKms: e.target.value,
                        })
                      }
                      className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700">
                      Next Service Due Date
                    </label>
                    <input
                      type="date"
                      value={recordFormData.nextServiceDueDate}
                      onChange={(e) =>
                        setRecordFormData({
                          ...recordFormData,
                          nextServiceDueDate: e.target.value,
                        })
                      }
                      className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Additional Notes (Optional)
                </label>
                <textarea
                  placeholder="Any additional notes about the service..."
                  value={recordFormData.notes}
                  onChange={(e) =>
                    setRecordFormData({
                      ...recordFormData,
                      notes: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 resize-none"
                  rows={3}
                />
              </div>

              {/* Info Message */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-800">
                  <span className="font-medium">ℹ️ Note:</span> Parts will be shown as bullet points to the customer.
                </p>
              </div>
            </div>

            {/* Dialog Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex gap-3">
              <Button
                onClick={() => handleAddServiceRecord(showRecordDialog)}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
              >
                Save Service Record
              </Button>
              <Button
                onClick={() => setShowRecordDialog(null)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ScheduledServicesSimplified
