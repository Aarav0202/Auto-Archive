"use client"

import React, { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar, Phone, Mail, Clock, AlertCircle } from "lucide-react"
import toast from "react-hot-toast"

interface BookServiceDialogProps {
  vehicleId: string
  vehicleName: string
  licensePlate: string
  dealershipId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onServiceBooked?: () => void
}

const BookServiceDialog = ({
  vehicleId,
  vehicleName,
  licensePlate,
  dealershipId,
  open,
  onOpenChange,
  onServiceBooked,
}: BookServiceDialogProps) => {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    serviceType: "Regular",
    preferredDate: "",
    preferredTime: "",
    description: "",
    customerPhone: "",
    customerEmail: "",
  })

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!formData.preferredDate || !formData.preferredTime) {
      toast.error("Please select a date and time")
      return
    }

    if (!formData.customerPhone) {
      toast.error("Please provide your phone number")
      return
    }

    try {
      setLoading(true)

      // Submit service request to backend
      const response = await fetch("http://localhost:8080/api/service-requests/customer/submit-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          vehicleId,
          dealershipId,
          serviceType: formData.serviceType,
          requestedDate: formData.preferredDate,
          requestedTime: formData.preferredTime,
          customerPhone: formData.customerPhone,
          customerEmail: formData.customerEmail,
          description: formData.description,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        toast.error(result.message || "Failed to submit service request")
        return
      }

      toast.success("Service request submitted successfully!")
      
      // Reset form
      setFormData({
        serviceType: "Regular",
        preferredDate: "",
        preferredTime: "",
        description: "",
        customerPhone: "",
        customerEmail: "",
      })

      onOpenChange(false)
      onServiceBooked?.()
    } catch (error) {
      console.error("Error booking service:", error)
      toast.error("Failed to submit service request")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Book a Service
          </DialogTitle>
          <DialogDescription>
            Schedule a service appointment for your vehicle
          </DialogDescription>
        </DialogHeader>

        <div className="bg-blue-50 rounded-lg p-3 mb-4 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium">{vehicleName}</p>
            <p className="text-xs text-blue-700">{licensePlate}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Service Type */}
          <div className="space-y-2">
            <Label htmlFor="serviceType" className="font-medium">
              Service Type
            </Label>
            <select
              id="serviceType"
              name="serviceType"
              value={formData.serviceType}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="Regular">Regular Service</option>
              <option value="Major">Major Service</option>
              <option value="Minor">Minor Service</option>
              <option value="Oil Change">Oil Change</option>
              <option value="Inspection">Inspection</option>
              <option value="Repair">Repair</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Preferred Date */}
          <div className="space-y-2">
            <Label htmlFor="preferredDate" className="font-medium">
              Preferred Date
            </Label>
            <Input
              id="preferredDate"
              type="date"
              name="preferredDate"
              value={formData.preferredDate}
              onChange={handleInputChange}
              min={new Date().toISOString().split("T")[0]}
              className="border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Preferred Time */}
          <div className="space-y-2">
            <Label htmlFor="preferredTime" className="font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-600" />
              Preferred Time
            </Label>
            <Input
              id="preferredTime"
              type="time"
              name="preferredTime"
              value={formData.preferredTime}
              onChange={handleInputChange}
              className="border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <Label htmlFor="customerPhone" className="font-medium flex items-center gap-2">
              <Phone className="h-4 w-4 text-gray-600" />
              Phone Number
            </Label>
            <Input
              id="customerPhone"
              type="tel"
              name="customerPhone"
              placeholder="10-digit phone number"
              value={formData.customerPhone}
              onChange={handleInputChange}
              pattern="[0-9]{10}"
              className="border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="customerEmail" className="font-medium flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-600" />
              Email (Optional)
            </Label>
            <Input
              id="customerEmail"
              type="email"
              name="customerEmail"
              placeholder="your.email@example.com"
              value={formData.customerEmail}
              onChange={handleInputChange}
              className="border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="font-medium">
              Service Description (Optional)
            </Label>
            <textarea
              id="description"
              name="description"
              placeholder="Describe any specific issues or requirements..."
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? "Booking..." : "Book Service"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default BookServiceDialog
