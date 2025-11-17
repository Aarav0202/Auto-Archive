"use client"

import React, { useState, useEffect } from "react"
import {
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  Phone,
  MapPin,
  AlertCircle,
  Edit2,
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
}

interface ServiceRequest {
  _id: string
  requestId: string
  vehicleId: Vehicle
  customerId: Customer
  serviceType: string
  requestedDate: string
  requestedTime: string
  customerPhone: string
  customerEmail?: string
  description?: string
  status: string
  confirmedDate?: string
  confirmedTime?: string
  estimatedCost?: number
  requestedAt: string
}

interface PendingRequestsProps {
  onRequestUpdated?: () => void
}

const PendingServiceRequests = ({ onRequestUpdated }: PendingRequestsProps) => {
  const [requests, setRequests] = useState<ServiceRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null)
  const [showAcceptForm, setShowAcceptForm] = useState(false)
  const [acceptFormData, setAcceptFormData] = useState({
    confirmedDate: "",
    confirmedTime: "",
    responseMessage: "",
  })

  useEffect(() => {
    fetchPendingRequests()
  }, [])

  const fetchPendingRequests = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch("http://localhost:8080/api/service-requests/dealership/pending-requests", {
        credentials: "include",
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Failed to fetch pending requests:', response.status, errorData)
        throw new Error(errorData.message || `Failed to fetch pending requests (${response.status})`)
      }

      const data = await response.json()
      setRequests(data.requests || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error fetching requests"
      console.error('Error in fetchPendingRequests:', errorMessage)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptRequest = async () => {
    if (!selectedRequest) return

    if (!acceptFormData.confirmedDate || !acceptFormData.confirmedTime) {
      toast.error("Please provide confirmed date and time")
      return
    }

    try {
      const response = await fetch(
        `http://localhost:8080/api/service-requests/dealership/accept-request/${selectedRequest._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            confirmedDate: acceptFormData.confirmedDate,
            confirmedTime: acceptFormData.confirmedTime,
            responseMessage: acceptFormData.responseMessage,
          }),
        }
      )

      if (!response.ok) {
        throw new Error("Failed to accept request")
      }

      toast.success("Service request accepted!")
      setSelectedRequest(null)
      setShowAcceptForm(false)
      setAcceptFormData({
        confirmedDate: "",
        confirmedTime: "",
        responseMessage: "",
      })
      fetchPendingRequests()
      onRequestUpdated?.()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to accept request")
    }
  }

  const handleRejectRequest = async (requestId: string, message: string) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/service-requests/dealership/reject-request/${requestId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            responseMessage: message || "Request rejected",
          }),
        }
      )

      if (!response.ok) {
        throw new Error("Failed to reject request")
      }

      toast.success("Service request rejected")
      setSelectedRequest(null)
      fetchPendingRequests()
      onRequestUpdated?.()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to reject request")
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

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading service requests...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
        <div className="flex-1">
          <p className="font-medium text-red-800">Failed to fetch services</p>
          <p className="text-sm text-red-700 mt-2">{error}</p>
          <details className="text-xs text-red-600 mt-2 p-2 bg-red-100 rounded cursor-pointer">
            <summary>Debug info</summary>
            <p className="mt-1 font-mono">Error: {error}</p>
            <p className="mt-1 font-mono">API: http://localhost:8080/api/service-requests/dealership/pending-requests</p>
            <p className="mt-1 font-mono">Check browser console for more details</p>
          </details>
          <Button
            onClick={() => fetchPendingRequests()}
            variant="outline"
            className="mt-3 text-red-700 border-red-300 hover:bg-red-100"
          >
            Retry
          </Button>
        </div>
      </div>
    )
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-12 bg-blue-50 rounded-lg border border-blue-200">
        <div className="p-4 bg-blue-100 rounded-full inline-block mb-4">
          <Clock className="h-8 w-8 text-blue-600" />
        </div>
        <p className="text-gray-700 font-medium">No pending requests</p>
        <p className="text-sm text-gray-500 mt-2">Service requests will appear here</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="h-5 w-5 text-blue-600" />
        <h2 className="text-xl font-bold text-gray-900">Pending Service Requests ({requests.length})</h2>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {requests.map((request) => (
          <div
            key={request._id}
            className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-lg text-gray-900">
                  {request.vehicleId?.companyName} {request.vehicleId?.vehicleName}
                </h3>
                <p className="text-sm text-gray-500">
                  Request ID: {request.requestId}
                </p>
              </div>
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-semibold rounded-full">
                Pending
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
              {/* Service Type */}
              <div>
                <p className="text-xs text-gray-600 font-medium">Service Type</p>
                <p className="font-semibold text-gray-900">{request.serviceType}</p>
              </div>

              {/* License Plate */}
              <div>
                <p className="text-xs text-gray-600 font-medium">License Plate</p>
                <p className="font-semibold text-gray-900">
                  {request.vehicleId?.licensePlateNumber || "-"}
                </p>
              </div>

              {/* Current KMs */}
              <div>
                <p className="text-xs text-gray-600 font-medium">Current KMs</p>
                <p className="font-semibold text-gray-900">
                  {request.vehicleId?.currentKms?.toLocaleString() || "-"}
                </p>
              </div>

              {/* Customer Name */}
              <div>
                <p className="text-xs text-gray-600 font-medium">Customer</p>
                <p className="font-semibold text-gray-900">{request.customerId?.name || "-"}</p>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-2">
                <Phone className="h-4 w-4 text-gray-600 mt-1" />
                <div>
                  <p className="text-xs text-gray-600 font-medium">Phone</p>
                  <p className="font-semibold text-gray-900">{request.customerPhone}</p>
                </div>
              </div>

              {/* Email */}
              <div>
                <p className="text-xs text-gray-600 font-medium">Email</p>
                <p className="font-semibold text-gray-900 text-sm">
                  {request.customerEmail || "-"}
                </p>
              </div>
            </div>

            {/* Requested Date & Time */}
            <div className="bg-blue-50 rounded-lg p-3 mb-4 border border-blue-200">
              <p className="text-sm text-gray-700 font-medium mb-2">Requested Service</p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-gray-900">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <span className="font-semibold">{formatDate(request.requestedDate)}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-900">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="font-semibold">{request.requestedTime}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            {request.description && (
              <div className="bg-gray-50 rounded-lg p-3 mb-4 border border-gray-200">
                <p className="text-sm text-gray-700 font-medium mb-1">Description</p>
                <p className="text-sm text-gray-600">{request.description}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 flex-wrap">
              {!showAcceptForm || selectedRequest?._id !== request._id ? (
                <>
                  <Button
                    onClick={() => {
                      setSelectedRequest(request)
                      setShowAcceptForm(true)
                      setAcceptFormData({
                        confirmedDate: "",
                        confirmedTime: "",
                        responseMessage: "",
                      })
                    }}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Accept Request
                  </Button>
                  <Button
                    onClick={() => handleRejectRequest(request._id, "Cannot fulfill at this time")}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
                  >
                    <XCircle className="h-4 w-4" />
                    Reject Request
                  </Button>
                </>
              ) : (
                <div className="w-full border-t pt-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Confirmed Date</label>
                      <input
                        type="date"
                        value={acceptFormData.confirmedDate}
                        onChange={(e) =>
                          setAcceptFormData({ ...acceptFormData, confirmedDate: e.target.value })
                        }
                        min={new Date().toISOString().split("T")[0]}
                        className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Confirmed Time</label>
                      <input
                        type="time"
                        value={acceptFormData.confirmedTime}
                        onChange={(e) =>
                          setAcceptFormData({ ...acceptFormData, confirmedTime: e.target.value })
                        }
                        className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Message (Optional)</label>
                    <textarea
                      placeholder="Add a message to the customer..."
                      value={acceptFormData.responseMessage}
                      onChange={(e) =>
                        setAcceptFormData({ ...acceptFormData, responseMessage: e.target.value })
                      }
                      className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 resize-none"
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleAcceptRequest}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    >
                      Confirm Acceptance
                    </Button>
                    <Button
                      onClick={() => {
                        setShowAcceptForm(false)
                        setSelectedRequest(null)
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

export default PendingServiceRequests
