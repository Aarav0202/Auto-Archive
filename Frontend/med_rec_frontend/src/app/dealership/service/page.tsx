import React from 'react'
import Navbar from '../_components/Navbar'
import { 
  Wrench, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Calendar,
  Search,
  Filter,
  Plus,
  FileText,
  Settings,
  Car,
  User
} from 'lucide-react'

const ServiceStationPage = () => {
  return (
    <>
      <Navbar />
      <div className="container mx-auto p-6 pt-24">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
              <Wrench className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Service Station
            </h1>
          </div>
          <p className="text-gray-600 ml-14">Manage vehicle services and appointments</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Service Statistics */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-6 rounded-xl shadow-lg border border-blue-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-blue-900">Service Overview</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg text-center shadow-sm border border-blue-100">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <p className="text-2xl font-bold text-blue-600">--</p>
                </div>
                <p className="text-sm text-blue-700 font-medium">Pending Services</p>
              </div>
              <div className="bg-white p-4 rounded-lg text-center shadow-sm border border-green-100">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <p className="text-2xl font-bold text-green-600">--</p>
                </div>
                <p className="text-sm text-green-700 font-medium">Completed Today</p>
              </div>
              <div className="bg-white p-4 rounded-lg text-center shadow-sm border border-orange-100">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                  <p className="text-2xl font-bold text-orange-600">--</p>
                </div>
                <p className="text-sm text-orange-700 font-medium">In Progress</p>
              </div>
              <div className="bg-white p-4 rounded-lg text-center shadow-sm border border-purple-100">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  <p className="text-2xl font-bold text-purple-600">--</p>
                </div>
                <p className="text-sm text-purple-700 font-medium">Scheduled</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-6 rounded-xl shadow-lg border border-green-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-500 rounded-lg">
                <Plus className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-green-900">Quick Actions</h2>
            </div>
            <div className="space-y-3">
              <button className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 text-left transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-3">
                <Plus className="w-4 h-4" />
                Schedule New Service
              </button>
              <button className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 text-left transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-3">
                <CheckCircle className="w-4 h-4" />
                Quick Check-in
              </button>
              <button className="w-full px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 text-left transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-3">
                <FileText className="w-4 h-4" />
                View Service History
              </button>
              <button className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 text-left transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-3">
                <FileText className="w-4 h-4" />
                Generate Reports
              </button>
            </div>
          </div>
        </div>

        {/* Current Services */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 mb-8">
          <div className="p-6 border-b bg-gradient-to-r from-gray-50 to-gray-100">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500 rounded-lg">
                  <Car className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Current Services</h2>
              </div>
              <div className="flex space-x-3">
                <div className="relative">
                  <Filter className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <select className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white">
                    <option>All Status</option>
                    <option>Pending</option>
                    <option>In Progress</option>
                    <option>Completed</option>
                  </select>
                </div>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="search"
                    placeholder="Search by vehicle or customer..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Service ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vehicle
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Service Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Scheduled Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {/* Empty state */}
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center text-gray-500">
                        <div className="p-4 bg-gray-100 rounded-full mb-4">
                          <Wrench className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-lg font-medium text-gray-700">No services scheduled</p>
                        <p className="text-sm mt-2 text-gray-500">Schedule your first service appointment</p>
                        <button className="mt-4 px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2">
                          <Plus className="w-4 h-4" />
                          Schedule Service
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Upcoming Services */}
        <div className="bg-gradient-to-br from-violet-50 to-purple-100 rounded-xl shadow-lg border border-violet-200">
          <div className="p-6 border-b border-violet-200 bg-gradient-to-r from-violet-50 to-purple-50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-violet-500 rounded-lg">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-violet-900">Upcoming Services</h2>
            </div>
          </div>
          <div className="p-6">
            <div className="text-center py-12">
              <div className="flex flex-col items-center text-violet-600">
                <div className="p-4 bg-violet-100 rounded-full mb-4">
                  <Calendar className="w-8 h-8 text-violet-500" />
                </div>
                <p className="text-lg font-medium text-violet-700">No upcoming services scheduled</p>
                <p className="text-sm mt-2 text-violet-600">Future appointments will appear here</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ServiceStationPage