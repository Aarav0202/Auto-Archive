import React from 'react'
import { useAuth } from "@/app/context/AuthContext";


const DashboardPage = () => {
    const { user } = useAuth();
  return (
    <div className="container mt-18 mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{user?.name} Dashboard</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Stats Cards */}
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h3 className="text-lg font-medium text-gray-900">Total Employees</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">--</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h3 className="text-lg font-medium text-gray-900">Active Customers</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">--</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h3 className="text-lg font-medium text-gray-900">Pending Services</h3>
          <p className="text-3xl font-bold text-orange-600 mt-2">--</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h3 className="text-lg font-medium text-gray-900">Completed Services</h3>
          <p className="text-3xl font-bold text-purple-600 mt-2">--</p>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md border">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="text-gray-500 text-center py-8">
          <p>Dashboard content will be implemented here</p>
          <p className="text-sm mt-2">This will show recent activities, charts, and key metrics</p>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage