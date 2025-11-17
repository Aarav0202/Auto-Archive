"use client"

import React, { useEffect, useState } from "react"
import { Wrench, X, AlertCircle, Calendar, Zap } from "lucide-react"
import toast from "react-hot-toast"

interface ServiceRecord {
  partsChanged?: string
  nextServiceDueKms?: number
  nextServiceDueDate?: string
  notes?: string
  completedDate?: string
  completedKms?: number
}

interface CompletedService {
  _id: string
  requestId: string
  serviceType: string
  confirmedDate: string
  confirmedTime: string
  status: string
  serviceRecord?: ServiceRecord
}

interface ServiceRecordsFromDealershipProps {
  vehicleId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onServiceRecordFound?: (serviceRecord: any) => void
}

const ServiceRecordsFromDealership = ({
  vehicleId,
  open,
  onOpenChange,
  onServiceRecordFound,
}: ServiceRecordsFromDealershipProps) => {
  const [services, setServices] = useState<CompletedService[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedService, setSelectedService] = useState<CompletedService | null>(null)

  useEffect(() => {
    if (open && vehicleId) {
      fetchCompletedServices()
    }
  }, [open, vehicleId])

  const fetchCompletedServices = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(
        `http://localhost:8080/api/service-requests/customer/vehicle/${vehicleId}`,
        {
          credentials: "include",
        }
      )

      if (!response.ok) {
        throw new Error("Failed to fetch service records")
      }

      const data = await response.json()
      // Filter for completed services with service records
      const completedWithRecords = (data.requests || []).filter(
        (service: CompletedService) =>
          service.status === "Completed" && service.serviceRecord
      )
      setServices(completedWithRecords)
    } catch (err) {
      console.error("Error fetching service records:", err)
      setError(err instanceof Error ? err.message : "Error fetching service records")
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-"
    try {
      return new Date(dateStr).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    } catch {
      return dateStr
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 bg-purple-900/20 flex items-center justify-center z-50 p-4"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Wrench className="h-6 w-6" />
            <h2 className="text-2xl font-bold">Service Records</h2>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="text-2xl font-bold hover:opacity-80 transition cursor-pointer"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
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

          {!loading && !error && services.length === 0 && (
            <div className="text-center py-8">
              <div className="p-4 bg-purple-100 rounded-full inline-block mb-3">
                <Wrench className="h-8 w-8 text-purple-600" />
              </div>
              <p className="text-gray-700 font-medium">No service records yet</p>
              <p className="text-sm text-gray-500 mt-2">
                Service records from dealership will appear here
              </p>
            </div>
          )}

          {!loading && !error && services.length > 0 && !selectedService && (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 font-medium mb-4">
                Total {services.length} service record(s)
              </p>
              {services.map((service) => (
                <div
                  key={service._id}
                  onClick={() => setSelectedService(service)}
                  className="border border-purple-200 rounded-lg p-4 hover:bg-purple-50 cursor-pointer transition"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {service.serviceType}
                      </h3>
                      <p className="text-xs text-gray-500">
                        Completed: {formatDate(service.serviceRecord?.completedDate)}
                      </p>
                    </div>
                    <span className="text-xs font-semibold px-2 py-1 rounded bg-green-100 text-green-700">
                      Completed
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {service.serviceRecord?.partsChanged && (
                      <p className="truncate">
                        Parts: {service.serviceRecord.partsChanged.substring(0, 50)}...
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedService && selectedService.serviceRecord && (
            <div className="space-y-6">
              {/* Service Header */}
              <div className="border-b pb-4">
                <div className="flex items-start justify-between mb-3">
                  <button
                    onClick={() => setSelectedService(null)}
                    className="text-purple-600 hover:text-purple-800 text-sm font-medium flex items-center gap-1"
                  >
                    ← Back to List
                  </button>
                  <span className="text-xs font-semibold px-3 py-1 rounded bg-green-100 text-green-700">
                    Completed
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  {selectedService.serviceType} Service
                </h3>
              </div>

              {/* Service Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-600 font-medium mb-1">
                    Service Completed On
                  </p>
                  <p className="font-semibold text-gray-900 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-purple-600" />
                    {formatDate(selectedService.serviceRecord.completedDate)}
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
              {selectedService.serviceRecord.partsChanged && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Parts Changed</h4>
                  <ul className="space-y-1">
                    {selectedService.serviceRecord.partsChanged
                      .split(",")
                      .map((part, index) => (
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
              {selectedService.serviceRecord.completedKms && (
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
                  {selectedService.serviceRecord.nextServiceDueKms ? (
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
                  {selectedService.serviceRecord.nextServiceDueDate ? (
                    <div className="bg-white p-3 rounded border border-green-100">
                      <p className="text-xs text-gray-600 mb-1">Due on Date</p>
                      <p className="font-bold text-lg text-gray-900">
                        {formatDate(
                          selectedService.serviceRecord.nextServiceDueDate
                        )}
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
              {selectedService.serviceRecord.notes && (
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
          )}
        </div>
      </div>
    </div>
  )
}

export default ServiceRecordsFromDealership
