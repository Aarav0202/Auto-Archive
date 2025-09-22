"use client"
import React from "react"
import { Button } from "@/components/ui/button"

const Card = () => {
  return (
    <div className=" m-4 w-64 border rounded-xl shadow-md overflow-hidden flex flex-col">
      <div className="h-40 w-full bg-gray-300 flex items-center justify-center">
        <h2 className="text-xl font-bold">Car Model Name</h2>
      </div>

      <div className="flex flex-col flex-1 p-4 gap-2">
        <p className="text-gray-700">Car Number</p>
        <p className="text-gray-500 text-sm">Dealership Name</p>

        <div className="mt-auto">
          <Button className="w-full">View Details</Button>
        </div>
      </div>
    </div>
  )
}

export default Card
