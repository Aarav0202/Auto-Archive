import React from 'react'
import Navbar from '../../_components/Navbar'
import { 
  UserCheck, 
  Search, 
  UserPlus, 
  Eye, 
  Edit, 
  Trash2, 
  Phone, 
  Mail, 
  Car,
  Crown,
  TrendingUp,
  Calendar,
  Filter,
  Star
} from 'lucide-react'

const ViewCustomersPage = () => {
  return (
    <>
      <Navbar />
      <div className="container mx-auto p-6 pt-24">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
              <UserCheck className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Customers
            </h1>
          </div>
          <p className="text-gray-600 ml-14">Manage and view all dealership customers</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="p-6 border-b bg-gradient-to-r from-purple-50 to-pink-50">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500 rounded-lg">
                  <UserCheck className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Customer List</h2>
              </div>
              <div className="flex space-x-3">
                <div className="relative">
                  <Filter className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <select className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white">
                    <option>All Customers</option>
                    <option>Active</option>
                    <option>Inactive</option>
                    <option>VIP</option>
                  </select>
                </div>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="search"
                    placeholder="Search customers..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <button className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  Add Customer
                </button>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vehicles
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Service
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {/* Empty state */}
                  <tr>
                    <td colSpan={8} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center text-gray-500">
                        <div className="p-4 bg-purple-100 rounded-full mb-4">
                          <UserCheck className="w-8 h-8 text-purple-500" />
                        </div>
                        <p className="text-lg font-medium text-gray-700">No customers found</p>
                        <p className="text-sm mt-2 text-gray-500">Get started by adding your first customer</p>
                        <button className="mt-4 px-6 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2">
                          <UserPlus className="w-4 h-4" />
                          Add Customer
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Customer Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl shadow-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-blue-900">Total Customers</h3>
                <p className="text-3xl font-bold text-blue-600 mt-2">--</p>
              </div>
              <div className="p-3 bg-blue-500 rounded-lg">
                <UserCheck className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl shadow-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-green-900">Active Customers</h3>
                <p className="text-3xl font-bold text-green-600 mt-2">--</p>
              </div>
              <div className="p-3 bg-green-500 rounded-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl shadow-lg border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-purple-900">VIP Customers</h3>
                <p className="text-3xl font-bold text-purple-600 mt-2">--</p>
              </div>
              <div className="p-3 bg-purple-500 rounded-lg">
                <Crown className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl shadow-lg border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-orange-900">New This Month</h3>
                <p className="text-3xl font-bold text-orange-600 mt-2">--</p>
              </div>
              <div className="p-3 bg-orange-500 rounded-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ViewCustomersPage