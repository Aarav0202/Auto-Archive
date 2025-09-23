"use client"
import React from "react"
import { Button } from "@/components/ui/button"
import { Car, Building2, Eye, Calendar } from "lucide-react"

const Card = () => {
  return (
    <div className="m-4 w-64 border border-green-200 rounded-xl shadow-lg overflow-hidden flex flex-col bg-gradient-to-br from-white to-green-50/50 hover:shadow-xl transition-all duration-300">
      <div className="h-40 w-full bg-gradient-to-br from-green-100 via-blue-100 to-green-200 flex items-center justify-center relative">
        <div className="absolute top-3 right-3">
          <div className="p-2 bg-white/80 rounded-full">
            <Car className="h-5 w-5 text-green-600" />
          </div>
        </div>
        <h2 className="text-xl font-bold text-green-800">Car Model Name</h2>
      </div>

      <div className="flex flex-col flex-1 p-4 gap-3">
        <div className="flex items-center gap-2">
          <Car className="h-4 w-4 text-blue-600" />
          <p className="text-gray-700 font-medium">Car Number</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-green-600" />
          <p className="text-gray-500 text-sm">Dealership Name</p>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Calendar className="h-3 w-3" />
          <span>Last service: 2 weeks ago</span>
        </div>

        <div className="mt-auto pt-3">
          <Button className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white flex items-center gap-2">
            <Eye className="h-4 w-4" />
            View Details
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Card
