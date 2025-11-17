"use client"

import React, { useState, useEffect } from "react"
import {
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  AlertCircle,
  Truck,
  Upload,
  Eye,
} from "lucide-react"
import toast from "react-hot-toast"
import { UploadIssuePhotosDialog } from "./UploadIssuePhotosDialog"
import { AppointmentStatusTracker } from "./AppointmentStatusTracker"

interface ServiceRequest {
  _id: string
  requestId: string
  serviceType: string
  vehicleDetails: {
    companyName: string
    vehicleName: string
    licensePlateNumber: string
    currentKms: number
  }
  requestedDate: string
  requestedTime: string
  confirmedDate?: string
  confirmedTime?: string
  status: string
  estimatedCost?: number
  responseMessage?: string
  dealershipId: {
    _id: string
    name: string
  }
  serviceRecord?: {
    partsChanged?: string
    nextServiceDueKms?: number
    nextServiceDueDate?: string
    notes?: string
    completedDate?: string
    completedKms?: number
  }
}

const MyServiceRequests = () => {
  const [requests, setRequests] = useState<ServiceRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [uploadRequestId, setUploadRequestId] = useState<string | null>(null)
  const [statusTrackerOpen, setStatusTrackerOpen] = useState(false)
  const [statusTrackerRequestId, setStatusTrackerRequestId] = useState<string | null>(null)

  useEffect(() => {
    fetchMyRequests()
  }, [])

  const fetchMyRequests = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch("http://localhost:8080/api/service-requests/customer/my-requests", {
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to fetch service requests")
      }

      const data = await response.json()
      setRequests(data.requests || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error fetching requests")
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

  const formatCurrency = (amount?: number) => {
    if (!amount) return "-"
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      case "Accepted":
        return "bg-green-100 text-green-800 border-green-300"
      case "Rejected":
        return "bg-red-100 text-red-800 border-red-300"
      case "Completed":
        return "bg-blue-100 text-blue-800 border-blue-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Pending":
        return <Clock className="h-4 w-4" />
      case "Accepted":
        return <CheckCircle className="h-4 w-4" />
      case "Rejected":
        return <XCircle className="h-4 w-4" />
      case "Completed":
        return <CheckCircle className="h-4 w-4" />
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your service requests...</p>
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

  if (requests.length === 0) {
    return (
      <div className="text-center py-12 bg-blue-50 rounded-lg border border-blue-200">
        <div className="p-4 bg-blue-100 rounded-full inline-block mb-4">
          <Truck className="h-8 w-8 text-blue-600" />
        </div>
        <p className="text-gray-700 font-medium">No service requests yet</p>
        <p className="text-sm text-gray-500 mt-2">Book a service from your vehicle cards</p>
      </div>
    )
  }

  // Organize requests by status
  const pendingRequests = requests.filter((r) => r.status === "Pending")
  const acceptedRequests = requests.filter((r) => r.status === "Accepted")
  const rejectedRequests = requests.filter((r) => r.status === "Rejected")
  const completedRequests = requests.filter((r) => r.status === "Completed")

  return (
    <div className="space-y-8">
      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-yellow-600" />
            Pending Requests ({pendingRequests.length})
          </h3>
          <div className="grid grid-cols-1 gap-4">
            {pendingRequests.map((request) => (
              <RequestCard 
                key={request._id} 
                request={request} 
                onSelect={setSelectedRequest}
                onUpload={() => {
                  setUploadRequestId(request._id)
                  setUploadDialogOpen(true)
                }}
                onViewStatus={() => {
                  setStatusTrackerRequestId(request._id)
                  setStatusTrackerOpen(true)
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Accepted/Scheduled Requests */}
      {acceptedRequests.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Scheduled Services ({acceptedRequests.length})
          </h3>
          <div className="grid grid-cols-1 gap-4">
            {acceptedRequests.map((request) => (
              <RequestCard 
                key={request._id} 
                request={request} 
                onSelect={setSelectedRequest}
                onUpload={() => {
                  setUploadRequestId(request._id)
                  setUploadDialogOpen(true)
                }}
                onViewStatus={() => {
                  setStatusTrackerRequestId(request._id)
                  setStatusTrackerOpen(true)
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Completed Requests */}
      {completedRequests.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-blue-600" />
            Completed Services ({completedRequests.length})
          </h3>
          <div className="grid grid-cols-1 gap-4">
            {completedRequests.map((request) => (
              <RequestCard 
                key={request._id} 
                request={request} 
                onSelect={setSelectedRequest}
                onUpload={() => {
                  setUploadRequestId(request._id)
                  setUploadDialogOpen(true)
                }}
                onViewStatus={() => {
                  setStatusTrackerRequestId(request._id)
                  setStatusTrackerOpen(true)
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Rejected Requests */}
      {rejectedRequests.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-600" />
            Rejected Requests ({rejectedRequests.length})
          </h3>
          <div className="grid grid-cols-1 gap-4">
            {rejectedRequests.map((request) => (
              <RequestCard 
                key={request._id} 
                request={request} 
                onSelect={setSelectedRequest}
                onUpload={() => {
                  setUploadRequestId(request._id)
                  setUploadDialogOpen(true)
                }}
                onViewStatus={() => {
                  setStatusTrackerRequestId(request._id)
                  setStatusTrackerOpen(true)
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedRequest && (
        <div
          className="fixed inset-0 bg-purple-900/20 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedRequest(null)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 flex justify-between items-center">
              <h2 className="text-xl font-bold">Request Details</h2>
              <button
                onClick={() => setSelectedRequest(null)}
                className="text-2xl font-bold hover:opacity-80 transition cursor-pointer"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Status */}
              <div className={`p-3 rounded-lg border flex items-center gap-2 ${getStatusColor(selectedRequest.status)}`}>
                {getStatusIcon(selectedRequest.status)}
                <span className="font-semibold">{selectedRequest.status}</span>
              </div>

              {/* Vehicle Info */}
              <div className="border-b pb-3">
                <p className="text-xs text-gray-600 font-medium mb-1">Vehicle</p>
                <p className="font-semibold text-gray-900">
                  {selectedRequest.vehicleDetails?.companyName} {selectedRequest.vehicleDetails?.vehicleName}
                </p>
                <p className="text-sm text-gray-600">
                  {selectedRequest.vehicleDetails?.licensePlateNumber}
                </p>
              </div>

              {/* Dealership Info */}
              <div className="border-b pb-3">
                <p className="text-xs text-gray-600 font-medium mb-1">Dealership</p>
                <p className="font-semibold text-gray-900">{selectedRequest.dealershipId?.name}</p>
              </div>

              {/* Service Type */}
              <div className="border-b pb-3">
                <p className="text-xs text-gray-600 font-medium mb-1">Service Type</p>
                <p className="font-semibold text-gray-900">{selectedRequest.serviceType}</p>
              </div>

              {/* Requested Date/Time */}
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <p className="text-xs text-gray-600 font-medium mb-2">Requested Date & Time</p>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <span className="font-semibold">{formatDate(selectedRequest.requestedDate)}</span>
                  <span className="text-gray-600">at</span>
                  <span className="font-semibold">{selectedRequest.requestedTime}</span>
                </div>
              </div>

              {/* Confirmed Date/Time (if accepted) */}
              {selectedRequest.status === "Accepted" && selectedRequest.confirmedDate && (
                <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                  <p className="text-xs text-gray-600 font-medium mb-2">Confirmed Service Date & Time</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-green-600" />
                    <span className="font-semibold">{formatDate(selectedRequest.confirmedDate)}</span>
                    <span className="text-gray-600">at</span>
                    <span className="font-semibold">{selectedRequest.confirmedTime}</span>
                  </div>
                </div>
              )}

              {/* Estimated Cost */}
              {selectedRequest.estimatedCost !== undefined && (
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <p className="text-xs text-gray-600 font-medium mb-1">Estimated Cost</p>
                  <p className="font-bold text-lg text-gray-900">
                    {formatCurrency(selectedRequest.estimatedCost)}
                  </p>
                </div>
              )}

              {/* Response Message */}
              {selectedRequest.responseMessage && (
                <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                  <p className="text-xs text-gray-600 font-medium mb-1">Message from Dealership</p>
                  <p className="text-sm text-gray-700">{selectedRequest.responseMessage}</p>
                </div>
              )}

              {/* Service Record (shown for completed services) */}
              {selectedRequest.status === "Completed" && selectedRequest.serviceRecord && (
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Service Completion Details
                  </h4>
                  <div className="space-y-3">
                    {selectedRequest.serviceRecord.partsChanged && (
                      <div>
                        <p className="text-xs text-gray-600 font-medium mb-2">Parts Changed</p>
                        <ul className="space-y-1 bg-white p-3 rounded border border-green-100">
                          {selectedRequest.serviceRecord.partsChanged.split(",").map((part, index) => (
                            <li key={index} className="text-sm text-gray-900 flex items-start gap-2">
                              <span className="text-green-600 font-bold mt-0.5">•</span>
                              <span>{part.trim()}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedRequest.serviceRecord.completedDate && (
                        <div className="bg-white p-3 rounded border border-green-100">
                          <p className="text-xs text-gray-600 font-medium">Service Completed On</p>
                          <p className="text-sm text-gray-900 font-semibold mt-1">
                            {formatDate(selectedRequest.serviceRecord.completedDate)}
                          </p>
                        </div>
                      )}
                      {selectedRequest.serviceRecord.completedKms && (
                        <div className="bg-white p-3 rounded border border-green-100">
                          <p className="text-xs text-gray-600 font-medium">Vehicle KMs at Completion</p>
                          <p className="text-sm text-gray-900 font-semibold mt-1">
                            {selectedRequest.serviceRecord.completedKms?.toLocaleString()} KMs
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="bg-blue-50 border border-blue-200 p-3 rounded">
                      <p className="text-xs text-gray-600 font-medium mb-2">Next Service Schedule</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {selectedRequest.serviceRecord.nextServiceDueKms ? (
                          <div className="text-sm text-gray-900">
                            <span className="font-medium">Due at:</span> {selectedRequest.serviceRecord.nextServiceDueKms?.toLocaleString()} KMs
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500">KMs not set</div>
                        )}
                        {selectedRequest.serviceRecord.nextServiceDueDate ? (
                          <div className="text-sm text-gray-900">
                            <span className="font-medium">Due on:</span> {formatDate(selectedRequest.serviceRecord.nextServiceDueDate)}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500">Date not set</div>
                        )}
                      </div>
                    </div>

                    {selectedRequest.serviceRecord.notes && (
                      <div>
                        <p className="text-xs text-gray-600 font-medium mb-2">Additional Notes</p>
                        <p className="text-sm text-gray-900 bg-white p-3 rounded border border-green-100">
                          {selectedRequest.serviceRecord.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="border-t p-4 flex justify-end gap-2 sticky bottom-0 bg-gray-50">
              <button
                onClick={() => setSelectedRequest(null)}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg cursor-pointer transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Photos Dialog */}
      {uploadRequestId && (
        <UploadIssuePhotosDialog
          isOpen={uploadDialogOpen}
          onOpenChange={setUploadDialogOpen}
          requestId={uploadRequestId}
          onPhotosUploaded={() => {
            fetchMyRequests()
            toast.success("Photos uploaded successfully!")
          }}
        />
      )}

      {/* Appointment Status Tracker */}
      {statusTrackerRequestId && (
        <AppointmentStatusTracker
          isOpen={statusTrackerOpen}
          onOpenChange={setStatusTrackerOpen}
          requestId={statusTrackerRequestId}
        />
      )}
    </div>
  )
}

const RequestCard = ({
  request,
  onSelect,
  onUpload,
  onViewStatus,
}: {
  request: ServiceRequest
  onSelect: (request: ServiceRequest) => void
  onUpload: () => void
  onViewStatus: () => void
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "border-yellow-200 bg-yellow-50 hover:bg-yellow-100"
      case "Accepted":
        return "border-green-200 bg-green-50 hover:bg-green-100"
      case "Rejected":
        return "border-red-200 bg-red-50 hover:bg-red-100"
      case "Completed":
        return "border-blue-200 bg-blue-50 hover:bg-blue-100"
      default:
        return "border-gray-200 bg-gray-50 hover:bg-gray-100"
    }
  }

  const isAcceptedOrCompleted = request.status === "Accepted" || request.status === "Completed"

  return (
    <div
      className={`border rounded-lg p-4 transition-all ${getStatusColor(request.status)}`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900">
            {request.vehicleDetails?.companyName} {request.vehicleDetails?.vehicleName}
          </h4>
          <p className="text-xs text-gray-600">{request.serviceType} Service</p>
        </div>
        <span className="text-xs font-semibold px-2 py-1 bg-white/70 rounded">
          {request.status}
        </span>
      </div>
      <p className="text-sm text-gray-700 mb-2">
        Requested: {new Date(request.requestedDate).toLocaleDateString("en-IN")} at {request.requestedTime}
      </p>
      {request.confirmedDate && (
        <p className="text-sm text-gray-700 mb-3">
          Confirmed: {new Date(request.confirmedDate).toLocaleDateString("en-IN")} at {request.confirmedTime}
        </p>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 pt-3 border-t border-current/10">
        <button
          onClick={() => onSelect(request)}
          className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white rounded hover:bg-gray-100 transition cursor-pointer"
        >
          Details
        </button>
        {isAcceptedOrCompleted && (
          <>
            <button
              onClick={onUpload}
              className="flex-1 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition cursor-pointer flex items-center justify-center gap-1"
            >
              <Upload className="h-4 w-4" />
              Upload Photos
            </button>
            <button
              onClick={onViewStatus}
              className="flex-1 px-3 py-2 text-sm font-medium text-white bg-purple-600 rounded hover:bg-purple-700 transition cursor-pointer flex items-center justify-center gap-1"
            >
              <Eye className="h-4 w-4" />
              View Status
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default MyServiceRequests
