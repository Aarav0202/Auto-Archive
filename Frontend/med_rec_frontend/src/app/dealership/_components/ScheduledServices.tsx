"use client"

import React, { useState, useEffect } from "react"
import {
  Calendar,
  Clock,
  Phone,
  MapPin,
  AlertCircle,
  CheckCircle,
  Edit2,
  Wrench,
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

interface ScheduledService {
  _id: string
  requestId: string
  vehicleId: Vehicle
  customerId: Customer
  serviceType: string
  confirmedDate: string
  confirmedTime: string
  customerPhone: string
  estimatedCost?: number
  status: string
}

interface ScheduledServicesProps {
  onServiceUpdated?: () => void
}

const ScheduledServices = ({ onServiceUpdated }: ScheduledServicesProps) => {
  const [services, setServices] = useState<ScheduledService[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedService, setSelectedService] = useState<ScheduledService | null>(null)
  const [showEditForm, setShowEditForm] = useState(false)
  const [editFormData, setEditFormData] = useState({
    confirmedDate: "",
    confirmedTime: "",
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

  const handleUpdateSchedule = async (serviceId: string) => {
    if (!editFormData.confirmedDate || !editFormData.confirmedTime) {
      toast.error("Please provide date and time")
      return
    }

    try {
      const response = await fetch(
        `http://localhost:8080/api/service-requests/dealership/update-schedule/${serviceId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            confirmedDate: editFormData.confirmedDate,
            confirmedTime: editFormData.confirmedTime,
          }),
        }
      )

      if (!response.ok) {
        throw new Error("Failed to update schedule")
      }

      toast.success("Schedule updated successfully!")
      setShowEditForm(false)
      setSelectedService(null)
      fetchScheduledServices()
      onServiceUpdated?.()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update schedule")
    }
  }

  const handleCompleteService = async (serviceId: string) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/service-requests/${serviceId}/complete`,
        {
          method: "PUT",
          credentials: "include",
        }
      )

      if (!response.ok) {
        throw new Error("Failed to complete service")
      }

      toast.success("Service marked as completed!")
      setSelectedService(null)
      fetchScheduledServices()
      onServiceUpdated?.()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to complete service")
    }
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

  const formatCurrency = (amount?: number) => {
    if (!amount) return "-"
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount)
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
      return "bg-red-50 border-red-200"
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "bg-orange-50 border-orange-200"
    } else if (date < nextWeek) {
      return "bg-yellow-50 border-yellow-200"
    }
    return "bg-blue-50 border-blue-200"
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
          <div className="h-3 w-3 rounded bg-red-300"></div>
          <span className="text-xs text-gray-600">Today</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-orange-300"></div>
          <span className="text-xs text-gray-600">Tomorrow</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-yellow-300"></div>
          <span className="text-xs text-gray-600">This week</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-blue-300"></div>
          <span className="text-xs text-gray-600">Later</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {services.map((service) => (
          <div
            key={service._id}
            className={`border rounded-lg p-4 bg-white hover:shadow-lg transition-shadow ${getDateColor(
              service.confirmedDate
            )}`}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-lg text-gray-900">
                  {service.vehicleId?.companyName} {service.vehicleId?.vehicleName}
                </h3>
                <p className="text-sm text-gray-500">
                  Request ID: {service.requestId}
                </p>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded-full">
                Scheduled
              </span>
            </div>

            {/* Date and Time Highlight */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-600 font-medium mb-1 flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-green-600" />
                    Scheduled Date
                  </p>
                  <p className="font-bold text-lg text-gray-900">
                    {formatDate(service.confirmedDate)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-medium mb-1 flex items-center gap-1">
                    <Clock className="h-4 w-4 text-green-600" />
                    Scheduled Time
                  </p>
                  <p className="font-bold text-lg text-gray-900">
                    {service.confirmedTime}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-medium mb-1">Service Type</p>
                  <p className="font-bold text-gray-900 flex items-center gap-1">
                    <Wrench className="h-4 w-4 text-green-600" />
                    {service.serviceType}
                  </p>
                </div>
              </div>
            </div>

            {/* Vehicle and Customer Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-600 font-medium mb-1">Vehicle Details</p>
                <div className="space-y-1">
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">License:</span> {service.vehicleId?.licensePlateNumber}
                  </p>
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">KMs:</span> {service.vehicleId?.currentKms?.toLocaleString()}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-600 font-medium mb-1">Customer Details</p>
                <div className="space-y-1">
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">Name:</span> {service.customerId?.name}
                  </p>
                  <p className="text-sm text-gray-900 flex items-center gap-2">
                    <Phone className="h-3 w-3 text-gray-600" />
                    {service.customerPhone}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 flex-wrap">
              {!showEditForm || selectedService?._id !== service._id ? (
                <>
                  <Button
                    onClick={() => {
                      setSelectedService(service)
                      setShowEditForm(true)
                      setEditFormData({
                        confirmedDate: service.confirmedDate.split("T")[0],
                        confirmedTime: service.confirmedTime,
                      })
                    }}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                  >
                    <Edit2 className="h-4 w-4" />
                    Change Schedule
                  </Button>
                  <Button
                    onClick={() => handleCompleteService(service._id)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Mark Complete
                  </Button>
                </>
              ) : (
                <div className="w-full border-t pt-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700">New Date</label>
                      <input
                        type="date"
                        value={editFormData.confirmedDate}
                        onChange={(e) =>
                          setEditFormData({ ...editFormData, confirmedDate: e.target.value })
                        }
                        className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">New Time</label>
                      <input
                        type="time"
                        value={editFormData.confirmedTime}
                        onChange={(e) =>
                          setEditFormData({ ...editFormData, confirmedTime: e.target.value })
                        }
                        className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleUpdateSchedule(service._id)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Update Schedule
                    </Button>
                    <Button
                      onClick={() => {
                        setShowEditForm(false)
                        setSelectedService(null)
                      }}
                      variant="outline"
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ScheduledServices
