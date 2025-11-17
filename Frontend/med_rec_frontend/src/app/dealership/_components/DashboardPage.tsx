import React, { useState, useEffect } from 'react'
import { useAuth } from "@/app/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Settings, TrendingUp, Users, Car, Calendar, AlertTriangle, Clock, CheckCircle, ShoppingCart, Truck, X } from "lucide-react";
import DeleteDealershipDialog from "./DeleteDealershipDialog";
import { AddEmployeeDialog } from "./AddEmployeeDialog";
import { DealershipSettingsDialog } from "./DealershipSettingsDialog";
import PendingServiceRequests from "./PendingServiceRequests";
import ScheduledServices from "./ScheduledServices";
import toast from 'react-hot-toast';


const DashboardPage = () => {
    const { user } = useAuth();
    const [employeeCount, setEmployeeCount] = useState<number>(0);
    const [customerCount, setCustomerCount] = useState<number>(0);
    const [showSettingsDialog, setShowSettingsDialog] = useState<boolean>(false);
    const [bookingStats, setBookingStats] = useState({
      totalBookings: 0,
      pendingDeliveries: 0,
      deliveredBookings: 0,
      cancelledCount: 0,
      totalRevenue: 0,
      totalAmountPaid: 0,
      pendingAmount: 0
    });
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [showAddEmployeeDialog, setShowAddEmployeeDialog] = useState<boolean>(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'pending-requests' | 'scheduled'>('overview');

    // Fetch employee and customer counts on component mount
    useEffect(() => {
        fetchCounts();
    }, []);

    const fetchCounts = async () => {
        try {
            setIsLoading(true);
            
            // Fetch employees
            const employeeResponse = await fetch('http://localhost:8080/api/employees/', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (employeeResponse.ok) {
                const employeeData = await employeeResponse.json();
                setEmployeeCount(employeeData.employees?.length || 0);
            } else {
                console.error('Failed to fetch employees');
                setEmployeeCount(0);
            }

            // Fetch customers
            const customerResponse = await fetch('http://localhost:8080/api/customers', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (customerResponse.ok) {
                const customerData = await customerResponse.json();
                setCustomerCount(customerData.customers?.length || 0);
            } else {
                console.error('Failed to fetch customers');
                setCustomerCount(0);
            }

            // Fetch booking stats
            const bookingStatsResponse = await fetch('http://localhost:8080/api/bookings/stats/dashboard', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (bookingStatsResponse.ok) {
                const bookingStatsData = await bookingStatsResponse.json();
                setBookingStats(bookingStatsData.stats || {
                  totalBookings: 0,
                  pendingDeliveries: 0,
                  deliveredBookings: 0,
                  cancelledCount: 0,
                  totalRevenue: 0,
                  totalAmountPaid: 0,
                  pendingAmount: 0
                });
            } else {
                console.error('Failed to fetch booking stats');
                setBookingStats({
                  totalBookings: 0,
                  pendingDeliveries: 0,
                  deliveredBookings: 0,
                  cancelledCount: 0,
                  totalRevenue: 0,
                  totalAmountPaid: 0,
                  pendingAmount: 0
                });
            }
        } catch (error) {
            console.error('Error fetching counts:', error);
            setEmployeeCount(0);
            setCustomerCount(0);
            setBookingStats({
              totalBookings: 0,
              pendingDeliveries: 0,
              deliveredBookings: 0,
              cancelledCount: 0,
              totalRevenue: 0,
              totalAmountPaid: 0,
              pendingAmount: 0
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Handle employee added - refresh counts
    const handleEmployeeAdded = () => {
        fetchCounts(); // Refresh both counts
    };
  return (
    <div className="container mt-18 mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {user?.name} Dashboard
          </h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's your dealership overview</p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={() => setShowSettingsDialog(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 cursor-pointer"
          >
            <Settings className="h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Stats Cards */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg shadow-md border border-blue-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-medium text-gray-900">Total Employees</h3>
            <Users className="h-6 w-6 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-blue-600 mb-2">
            {isLoading ? (
              <span className="inline-block animate-pulse bg-blue-200 rounded w-8 h-8"></span>
            ) : (
              employeeCount
            )}
          </p>
          <p className="text-sm text-blue-700">Active staff members</p>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg shadow-md border border-green-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-medium text-gray-900">Active Customers</h3>
            <Users className="h-6 w-6 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-green-600 mb-2">
            {isLoading ? (
              <span className="inline-block animate-pulse bg-green-200 rounded w-8 h-8"></span>
            ) : (
              customerCount
            )}
          </p>
          <p className="text-sm text-green-700">Registered customers</p>
        </div>
        
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg shadow-md border border-orange-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-medium text-gray-900">Pending Services</h3>
            <Calendar className="h-6 w-6 text-orange-600" />
          </div>
          <p className="text-3xl font-bold text-orange-600 mb-2">--</p>
          <p className="text-sm text-orange-700">Awaiting completion</p>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg shadow-md border border-purple-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-medium text-gray-900">Completed Services</h3>
            <Car className="h-6 w-6 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-purple-600 mb-2">--</p>
          <p className="text-sm text-purple-700">This month</p>
        </div>
      </div>

      {/* Booking Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 mt-6">
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-lg shadow-md border border-indigo-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-medium text-gray-900">Total Bookings</h3>
            <ShoppingCart className="h-6 w-6 text-indigo-600" />
          </div>
          <p className="text-3xl font-bold text-indigo-600 mb-2">
            {isLoading ? (
              <span className="inline-block animate-pulse bg-indigo-200 rounded w-8 h-8"></span>
            ) : (
              bookingStats.totalBookings
            )}
          </p>
          <p className="text-sm text-indigo-700">Car bookings</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-lg shadow-md border border-yellow-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-medium text-gray-900">Pending Deliveries</h3>
            <Truck className="h-6 w-6 text-yellow-600" />
          </div>
          <p className="text-3xl font-bold text-yellow-600 mb-2">
            {isLoading ? (
              <span className="inline-block animate-pulse bg-yellow-200 rounded w-8 h-8"></span>
            ) : (
              bookingStats.pendingDeliveries
            )}
          </p>
          <p className="text-sm text-yellow-700">Awaiting delivery</p>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-lg shadow-md border border-red-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-medium text-gray-900">Cancelled Bookings</h3>
            <X className="h-6 w-6 text-red-600" />
          </div>
          <p className="text-3xl font-bold text-red-600 mb-2">
            {isLoading ? (
              <span className="inline-block animate-pulse bg-red-200 rounded w-8 h-8"></span>
            ) : (
              bookingStats.cancelledCount
            )}
          </p>
          <p className="text-sm text-red-700">Cancelled</p>
        </div>

        <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 p-6 rounded-lg shadow-md border border-cyan-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-medium text-gray-900">Pending Amount</h3>
            <TrendingUp className="h-6 w-6 text-cyan-600" />
          </div>
          <p className="text-3xl font-bold text-cyan-600 mb-2">
            {isLoading ? (
              <span className="inline-block animate-pulse bg-cyan-200 rounded w-12 h-8"></span>
            ) : (
              `₹${bookingStats.pendingAmount.toLocaleString('en-IN')}`
            )}
          </p>
          <p className="text-sm text-cyan-700">Due from customers</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Recent Activity
            </h2>
            <Button variant="outline" size="sm" className="text-blue-600 border-blue-200 hover:bg-blue-50 cursor-pointer">
              View All
            </Button>
          </div>
          <div className="text-gray-500 text-center py-8">
            <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <p>Dashboard content will be implemented here</p>
            <p className="text-sm mt-2">This will show recent activities, charts, and key metrics</p>
          </div>
        </div>
        
        {/* Quick Actions & Account Management */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white p-6 rounded-lg shadow-md border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Settings className="h-5 w-5 text-gray-600" />
              Quick Actions
            </h3>
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start gap-2 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 text-blue-700 hover:from-blue-100 hover:to-blue-200 cursor-pointer"
                onClick={() => setShowAddEmployeeDialog(true)}
              >
                <Users className="h-4 w-4" />
                Add Employee
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start gap-2 bg-gradient-to-r from-green-50 to-green-100 border-green-200 text-green-700 hover:from-green-100 hover:to-green-200 cursor-pointer"
              >
                <Users className="h-4 w-4" />
                Add Customer
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start gap-2 bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200 text-orange-700 hover:from-orange-100 hover:to-orange-200 cursor-pointer"
              >
                <Car className="h-4 w-4" />
                Schedule Service
              </Button>
            </div>
          </div>
          
          {/* Account Management */}
          <div className="bg-white p-6 rounded-lg shadow-md border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Account Management
            </h3>
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start gap-2 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 text-blue-700 hover:from-blue-100 hover:to-blue-200 cursor-pointer"
              >
                <Settings className="h-4 w-4" />
                Account Settings
              </Button>
              <DeleteDealershipDialog />
            </div>
          </div>
        </div>
      </div>

      {/* Add Employee Dialog */}
      <AddEmployeeDialog 
        open={showAddEmployeeDialog}
        onOpenChange={setShowAddEmployeeDialog}
        onEmployeeAdded={handleEmployeeAdded}
      />

      {/* Service Management Section */}
      <div className="mt-12">
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-3 font-medium border-b-2 transition-colors cursor-pointer ${
              activeTab === 'overview'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('pending-requests')}
            className={`px-4 py-3 font-medium border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'pending-requests'
                ? 'border-yellow-600 text-yellow-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Clock className="h-4 w-4" />
            Pending Requests
          </button>
          <button
            onClick={() => setActiveTab('scheduled')}
            className={`px-4 py-3 font-medium border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'scheduled'
                ? 'border-green-600 text-green-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <CheckCircle className="h-4 w-4" />
            Scheduled Services
          </button>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === 'overview' && (
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Management Overview</h3>
              <p className="text-gray-700 mb-4">
                Manage all service requests from your customers. View pending requests, accept or reject them, and manage your scheduled services.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg border border-blue-200">
                  <p className="text-sm text-gray-600 font-medium mb-1">Pending Requests</p>
                  <p className="text-2xl font-bold text-yellow-600">Click tab to view</p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-green-200">
                  <p className="text-sm text-gray-600 font-medium mb-1">Scheduled Services</p>
                  <p className="text-2xl font-bold text-green-600">Click tab to view</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pending-requests' && (
            <PendingServiceRequests onRequestUpdated={() => {
              // Refresh counts if needed
              fetchCounts();
            }} />
          )}

          {activeTab === 'scheduled' && (
            <ScheduledServices onServiceUpdated={() => {
              // Refresh counts if needed
              fetchCounts();
            }} />
          )}
        </div>
      </div>

      {/* Settings Dialog */}
      <DealershipSettingsDialog 
        isOpen={showSettingsDialog}
        onOpenChange={setShowSettingsDialog}
      />
    </div>
  )
}

export default DashboardPage