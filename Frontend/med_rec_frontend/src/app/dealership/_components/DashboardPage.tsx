import React, { useState, useEffect } from 'react'
import { useAuth } from "@/app/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Settings, TrendingUp, Users, Car, Calendar, AlertTriangle } from "lucide-react";
import DeleteDealershipDialog from "./DeleteDealershipDialog";
import { AddEmployeeDialog } from "./AddEmployeeDialog";


const DashboardPage = () => {
    const { user } = useAuth();
    const [employeeCount, setEmployeeCount] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [showAddEmployeeDialog, setShowAddEmployeeDialog] = useState<boolean>(false);

    // Fetch employee count on component mount
    useEffect(() => {
        fetchEmployeeCount();
    }, []);

    const fetchEmployeeCount = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('http://localhost:8080/api/employees/', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                setEmployeeCount(data.employees?.length || 0);
            } else {
                console.error('Failed to fetch employees');
                setEmployeeCount(0);
            }
        } catch (error) {
            console.error('Error fetching employee count:', error);
            setEmployeeCount(0);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle employee added - refresh count
    const handleEmployeeAdded = () => {
        fetchEmployeeCount(); // Refresh the employee count
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
            variant="outline" 
            className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 text-blue-700 hover:from-blue-100 hover:to-purple-100"
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
          <p className="text-3xl font-bold text-green-600 mb-2">--</p>
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
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Recent Activity
            </h2>
            <Button variant="outline" size="sm" className="text-blue-600 border-blue-200 hover:bg-blue-50">
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
                className="w-full justify-start gap-2 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 text-blue-700 hover:from-blue-100 hover:to-blue-200"
                onClick={() => setShowAddEmployeeDialog(true)}
              >
                <Users className="h-4 w-4" />
                Add Employee
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start gap-2 bg-gradient-to-r from-green-50 to-green-100 border-green-200 text-green-700 hover:from-green-100 hover:to-green-200"
              >
                <Users className="h-4 w-4" />
                Add Customer
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start gap-2 bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200 text-orange-700 hover:from-orange-100 hover:to-orange-200"
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
                className="w-full justify-start gap-2 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 text-blue-700 hover:from-blue-100 hover:to-blue-200"
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
    </div>
  )
}

export default DashboardPage