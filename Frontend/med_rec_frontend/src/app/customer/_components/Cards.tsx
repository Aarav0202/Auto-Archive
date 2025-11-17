"use client"
import React, { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Car, Building2, Eye, Calendar, AlertCircle, Wrench } from "lucide-react"
import ServiceRecordDialog from "./ServiceRecordDialog"
import ServiceRecordsFromDealership from "./ServiceRecordsFromDealership"
import BookServiceDialog from "./BookServiceDialog"

interface Vehicle {
  _id: string
  companyName: string
  vehicleName: string
  model: string
  licensePlateNumber: string
  chassyNumber: string
  dateOfBuying?: string
  lastServicedDate?: string
  dueServiceDate?: string
  serviceIntervalKm?: number
  currentKms?: number
  dealershipId?: {
    _id: string
    name: string
  }
  createdAt: string
}

interface VehicleDetails {
  _id: string
  companyName: string
  vehicleName: string
  model: string
  licensePlateNumber: string
  chassyNumber: string
  dateOfBuying?: string
  lastServicedDate?: string
  dueServiceDate?: string
  currentKms?: number
  dealershipId?: {
    _id: string
    name: string
  }
}

const Card = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleDetails | null>(null)
  const [showServiceRecords, setShowServiceRecords] = useState(false)
  const [showDealershipServiceRecords, setShowDealershipServiceRecords] = useState(false)
  const [showBookService, setShowBookService] = useState(false)
  const [selectedServiceVehicle, setSelectedServiceVehicle] = useState<Vehicle | null>(null)

  useEffect(() => {
    const fetchVehicles = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch("http://localhost:8080/customer/vehicles", {
          credentials: "include",
        })

        if (!response.ok) {
          throw new Error(`Failed to fetch vehicles: ${response.statusText}`)
        }

        const data = await response.json()
        setVehicles(data.vehicles || [])
      } catch (err) {
        console.error("Error fetching vehicles:", err)
        setError(err instanceof Error ? err.message : "Failed to fetch vehicles")
        setVehicles([])
      } finally {
        setLoading(false)
      }
    }

    fetchVehicles()
  }, [])

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

  const isServiceDue = (dueDate?: string) => {
    if (!dueDate) return false
    const due = new Date(dueDate)
    const today = new Date()
    return due <= today
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your vehicles...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center text-red-600">
          <AlertCircle className="h-12 w-12 mx-auto mb-4" />
          <p className="font-medium">Error: {error}</p>
          <p className="text-sm text-gray-600 mt-2">Please try refreshing the page</p>
        </div>
      </div>
    )
  }

  if (vehicles.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="p-4 bg-green-100 rounded-full inline-block mb-4">
            <Car className="h-8 w-8 text-green-600" />
          </div>
          <p className="text-gray-700 font-medium">No vehicles added yet</p>
          <p className="text-sm text-gray-500 mt-2">Contact your dealership to add your vehicles</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap gap-6 justify-start">
      {vehicles.map((vehicle) => (
        <div
          key={vehicle._id}
          className="w-80 border border-green-200 rounded-xl shadow-lg overflow-hidden flex flex-col bg-gradient-to-br from-white to-green-50/50 hover:shadow-xl transition-all duration-300"
        >
          {/* Header with vehicle image area */}
          <div className="h-40 w-full bg-gradient-to-br from-green-100 via-blue-100 to-green-200 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="inline-block p-3 bg-white/40 rounded-full mb-2">
                  <Car className="h-8 w-8 text-green-700" />
                </div>
                <p className="text-sm font-semibold text-green-900 max-w-xs">
                  {vehicle.companyName} {vehicle.vehicleName}
                </p>
              </div>
            </div>
            <div className="absolute top-3 right-3">
              <div className="p-2 bg-white/90 rounded-full shadow-md">
                <Car className="h-5 w-5 text-green-600" />
              </div>
            </div>
            {isServiceDue(vehicle.dueServiceDate) && (
              <div className="absolute top-3 left-3">
                <div className="px-3 py-1 bg-red-500 text-white text-xs font-semibold rounded-full shadow-md">
                  Service Due
                </div>
              </div>
            )}
          </div>

          {/* Vehicle details */}
          <div className="flex flex-col flex-1 p-4 gap-3">
            {/* Model and License */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Car className="h-4 w-4 text-blue-600" />
                <p className="text-sm font-semibold text-gray-900">{vehicle.model}</p>
              </div>
              <p className="text-xs text-gray-600 ml-6">
                <strong>License:</strong> {vehicle.licensePlateNumber || "-"}
              </p>
            </div>

            {/* Dealership */}
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-green-600" />
              <p className="text-gray-600 text-sm">
                {vehicle.dealershipId?.name || "Dealership"}
              </p>
            </div>

            {/* Service Information */}
            {(vehicle.lastServicedDate || vehicle.dueServiceDate) && (
              <div className="bg-blue-50 rounded-lg p-3 space-y-1">
                {vehicle.lastServicedDate && (
                  <div className="flex items-center gap-2 text-xs text-gray-700">
                    <Calendar className="h-3 w-3 text-blue-600" />
                    <span>
                      <strong>Last Serviced:</strong> {formatDate(vehicle.lastServicedDate)}
                    </span>
                  </div>
                )}
                {vehicle.dueServiceDate && (
                  <div
                    className={`flex items-center gap-2 text-xs font-semibold ${
                      isServiceDue(vehicle.dueServiceDate)
                        ? "text-red-700"
                        : "text-gray-700"
                    }`}
                  >
                    <Calendar className="h-3 w-3" />
                    <span>
                      <strong>Due Service:</strong> {formatDate(vehicle.dueServiceDate)}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Chassis Number */}
            <div className="text-xs text-gray-600">
              <strong>Chassis:</strong> {vehicle.chassyNumber || "-"}
            </div>

            {/* View Details Button */}
            <div className="mt-auto pt-3 space-y-2">
              <Button
                onClick={() => setSelectedVehicle(vehicle)}
                className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white flex items-center gap-2 cursor-pointer"
              >
                <Eye className="h-4 w-4" />
                View Details
              </Button>
              
              <Button
                onClick={() => {
                  setSelectedServiceVehicle(vehicle)
                  setShowBookService(true)
                }}
                className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white flex items-center gap-2 cursor-pointer"
              >
                <Wrench className="h-4 w-4" />
                Book Service
              </Button>
            </div>
          </div>
        </div>
      ))}

      {/* Vehicle Details Modal */}
      {selectedVehicle && (
        <div
          className="fixed inset-0 bg-purple-900/20 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedVehicle(null)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-96 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-gradient-to-r from-green-500 to-blue-600 text-white p-6 flex justify-between items-center">
              <h2 className="text-xl font-bold">Vehicle Details</h2>
              <button
                onClick={() => setSelectedVehicle(null)}
                className="text-2xl font-bold hover:opacity-80 transition cursor-pointer"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="border-b pb-3">
                <h3 className="font-bold text-lg text-gray-900">
                  {selectedVehicle.companyName} {selectedVehicle.vehicleName}
                </h3>
                <p className="text-sm text-gray-600">{selectedVehicle.model}</p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-700 font-medium">License Plate:</span>
                  <span className="text-gray-900 font-semibold">
                    {selectedVehicle.licensePlateNumber || "-"}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-700 font-medium">Chassis Number:</span>
                  <span className="text-gray-900 font-semibold">
                    {selectedVehicle.chassyNumber || "-"}
                  </span>
                </div>

                {selectedVehicle.dealershipId && (
                  <div className="flex justify-between">
                    <span className="text-gray-700 font-medium">Dealership:</span>
                    <span className="text-gray-900 font-semibold">
                      {selectedVehicle.dealershipId.name || "-"}
                    </span>
                  </div>
                )}

                {selectedVehicle.dateOfBuying && (
                  <div className="flex justify-between">
                    <span className="text-gray-700 font-medium">Date of Buying:</span>
                    <span className="text-gray-900 font-semibold">
                      {formatDate(selectedVehicle.dateOfBuying)}
                    </span>
                  </div>
                )}

                {selectedVehicle.lastServicedDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-700 font-medium">Last Serviced:</span>
                    <span className="text-gray-900 font-semibold">
                      {formatDate(selectedVehicle.lastServicedDate)}
                    </span>
                  </div>
                )}

                {selectedVehicle.dueServiceDate && (
                  <div
                    className={`flex justify-between ${
                      isServiceDue(selectedVehicle.dueServiceDate)
                        ? "bg-red-50 p-2 rounded"
                        : ""
                    }`}
                  >
                    <span className="text-gray-700 font-medium">Due Service:</span>
                    <span
                      className={`font-semibold ${
                        isServiceDue(selectedVehicle.dueServiceDate)
                          ? "text-red-700"
                          : "text-gray-900"
                      }`}
                    >
                      {formatDate(selectedVehicle.dueServiceDate)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t p-4 flex justify-end gap-2 sticky bottom-0 bg-gray-50">
              <Button
                onClick={() => {
                  // Find the full vehicle data from the vehicles array
                  const fullVehicle = vehicles.find(v => v._id === selectedVehicle?._id)
                  if (fullVehicle) {
                    setSelectedServiceVehicle(fullVehicle)
                    setShowDealershipServiceRecords(true)
                  }
                  setSelectedVehicle(null)
                }}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center gap-2"
              >
                <Wrench className="h-4 w-4" />
                View Service Records
              </Button>
              <button
                onClick={() => setSelectedVehicle(null)}
                className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium rounded-lg cursor-pointer transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Service Record Dialog */}
      <ServiceRecordDialog
        vehicleId={selectedServiceVehicle?._id || ""}
        open={showServiceRecords}
        onOpenChange={setShowServiceRecords}
      />

      {/* Dealership Service Records Dialog */}
      <ServiceRecordsFromDealership
        vehicleId={selectedServiceVehicle?._id || ""}
        open={showDealershipServiceRecords}
        onOpenChange={setShowDealershipServiceRecords}
      />

      {/* Book Service Dialog */}
      {selectedServiceVehicle && (
        <BookServiceDialog
          vehicleId={selectedServiceVehicle._id}
          vehicleName={`${selectedServiceVehicle.companyName} ${selectedServiceVehicle.vehicleName}`}
          licensePlate={selectedServiceVehicle.licensePlateNumber}
          dealershipId={selectedServiceVehicle.dealershipId?._id || ""}
          open={showBookService}
          onOpenChange={setShowBookService}
        />
      )}
    </div>
  )
}

export default Card
