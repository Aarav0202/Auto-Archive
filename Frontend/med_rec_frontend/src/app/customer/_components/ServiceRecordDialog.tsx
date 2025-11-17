"use client"

import React, { useEffect, useState } from "react"
import { 
  Wrench, 
  Download, 
  X, 
  Calendar, 
  User, 
  DollarSign, 
  AlertCircle,
  FileText
} from "lucide-react"

interface Part {
  partName: string
  partNumber?: string
  quantity: number
  cost: number
  notes?: string
}

interface ServiceRecord {
  _id: string
  serviceId: string
  serviceDate: string
  serviceType: string
  description?: string
  serviceCenter?: string
  technician?: string
  partsChanged: Part[]
  laborCost: number
  partsTotal: number
  totalCost: number
  kmBefore?: number
  kmAfter?: number
  invoiceNumber?: string
  invoiceUrl?: string
  nextServiceDate?: string
  nextServiceKms?: number
  status: string
  notes?: string
}

interface ServiceRecordDialogProps {
  vehicleId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

const ServiceRecordDialog = ({ vehicleId, open, onOpenChange }: ServiceRecordDialogProps) => {
  const [services, setServices] = useState<ServiceRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedService, setSelectedService] = useState<ServiceRecord | null>(null)

  useEffect(() => {
    if (open) {
      fetchServiceRecords()
    }
  }, [open, vehicleId])

  const fetchServiceRecords = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`http://localhost:8080/api/services/vehicle/${vehicleId}`, {
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to fetch service records")
      }

      const data = await response.json()
      setServices(data.services || [])
    } catch (err) {
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount)
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
        <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-red-600 text-white p-6 flex justify-between items-center">
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
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500 mx-auto mb-3"></div>
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
              <div className="p-4 bg-orange-100 rounded-full inline-block mb-3">
                <Wrench className="h-8 w-8 text-orange-600" />
              </div>
              <p className="text-gray-700 font-medium">No service records yet</p>
              <p className="text-sm text-gray-500 mt-2">Service records will appear here</p>
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
                  className="border border-orange-200 rounded-lg p-4 hover:bg-orange-50 cursor-pointer transition"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">{service.serviceType}</h3>
                      <p className="text-xs text-gray-500">ID: {service.serviceId}</p>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${
                      service.status === 'Completed' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {service.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="h-4 w-4 text-orange-500" />
                      {formatDate(service.serviceDate)}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <DollarSign className="h-4 w-4 text-green-500" />
                      {formatCurrency(service.totalCost)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedService && (
            <div className="space-y-6">
              {/* Service Header */}
              <div className="border-b pb-4">
                <div className="flex items-start justify-between mb-3">
                  <button
                    onClick={() => setSelectedService(null)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                  >
                    ← Back to List
                  </button>
                  <span className={`text-xs font-semibold px-3 py-1 rounded ${
                    selectedService.status === 'Completed' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {selectedService.status}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  {selectedService.serviceType} Service
                </h3>
                <p className="text-xs text-gray-500">ID: {selectedService.serviceId}</p>
              </div>

              {/* Service Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-600 font-medium mb-1">Service Date</p>
                  <p className="font-semibold text-gray-900 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-orange-500" />
                    {formatDate(selectedService.serviceDate)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-medium mb-1">Service Center</p>
                  <p className="font-semibold text-gray-900">
                    {selectedService.serviceCenter || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-medium mb-1">Technician</p>
                  <p className="font-semibold text-gray-900 flex items-center gap-2">
                    <User className="h-4 w-4 text-blue-500" />
                    {selectedService.technician || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-medium mb-1">Invoice Number</p>
                  <p className="font-semibold text-gray-900">
                    {selectedService.invoiceNumber || "-"}
                  </p>
                </div>
              </div>

              {/* Odometer Information */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Odometer Reading</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">KM Before Service</p>
                    <p className="font-semibold text-gray-900">
                      {selectedService.kmBefore || "-"} km
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">KM After Service</p>
                    <p className="font-semibold text-gray-900">
                      {selectedService.kmAfter || "-"} km
                    </p>
                  </div>
                </div>
              </div>

              {/* Parts Changed */}
              {selectedService.partsChanged && selectedService.partsChanged.length > 0 && (
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Parts Changed</h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {selectedService.partsChanged.map((part, idx) => (
                      <div
                        key={idx}
                        className="bg-gray-50 rounded-lg p-3 border border-gray-200"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <p className="font-semibold text-gray-900">{part.partName}</p>
                          <p className="font-semibold text-green-600">
                            {formatCurrency(part.cost * part.quantity)}
                          </p>
                        </div>
                        <div className="grid grid-cols-2 text-sm text-gray-600">
                          <p>Part #: {part.partNumber || "-"}</p>
                          <p>Qty: {part.quantity}</p>
                        </div>
                        {part.notes && (
                          <p className="text-xs text-gray-600 mt-2">{part.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cost Summary */}
              <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4 border border-orange-200">
                <h4 className="font-semibold text-gray-900 mb-3">Cost Summary</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Labor Cost</span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(selectedService.laborCost)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Parts Total</span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(selectedService.partsTotal)}
                    </span>
                  </div>
                  <div className="border-t pt-2 flex justify-between">
                    <span className="font-semibold text-gray-900">Total Cost</span>
                    <span className="font-bold text-lg text-orange-600">
                      {formatCurrency(selectedService.totalCost)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Next Service */}
              {selectedService.nextServiceDate && (
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <h4 className="font-semibold text-gray-900 mb-3">Next Service Due</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Date</p>
                      <p className="font-semibold text-gray-900">
                        {formatDate(selectedService.nextServiceDate)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">KM</p>
                      <p className="font-semibold text-gray-900">
                        {selectedService.nextServiceKms || "-"} km
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Description and Notes */}
              {selectedService.description && (
                <div>
                  <p className="text-xs text-gray-600 font-medium mb-2">Description</p>
                  <p className="text-gray-700 text-sm">{selectedService.description}</p>
                </div>
              )}

              {selectedService.notes && (
                <div>
                  <p className="text-xs text-gray-600 font-medium mb-2">Additional Notes</p>
                  <p className="text-gray-700 text-sm">{selectedService.notes}</p>
                </div>
              )}

              {/* Download Invoice */}
              {selectedService.invoiceUrl && (
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg flex items-center justify-center gap-2 transition">
                  <Download className="h-4 w-4" />
                  Download Invoice
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ServiceRecordDialog
