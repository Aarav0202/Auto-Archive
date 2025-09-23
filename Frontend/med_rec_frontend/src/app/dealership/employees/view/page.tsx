"use client";

import React, { useState, useEffect } from 'react'
import Navbar from '../../_components/Navbar'
import { AddEmployeeDialog } from '../../_components/AddEmployeeDialog'
import { EmployeeHeader } from '../../_components/EmployeeHeader'
import { EmployeeTable } from '../../_components/EmployeeTable'
import { EmptyState } from '../../_components/EmptyState'

interface Employee {
  _id: string;
  name: string;
  email: string;
  phone: string;
  employeeId: string;
  department: string;
  position: string;
  salary: number;
  dateOfJoining: string;
  carsSold: number;
  salesTarget: number;
  isActive: boolean;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  emergencyContact?: {
    name?: string;
    phone?: string;
    relationship?: string;
  };
  dealershipId: {
    _id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

const ViewEmployeesPage = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);

  // Fetch employees from API
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8080/api/employees/', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setEmployees(data.employees || []);
      } else {
        console.error('Failed to fetch employees');
        setEmployees([]);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch employees on component mount
  useEffect(() => {
    fetchEmployees();
  }, []);

  // Handle employee added/deleted callback
  const handleEmployeeChange = () => {
    fetchEmployees(); // Refresh the employee list
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto p-6 pt-24">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading employees...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto p-6 pt-24">
        <EmployeeHeader
          employeeCount={employees.length}
          onAddEmployee={() => setShowAddDialog(true)}
        />
        
        <div className="p-6">
          {employees.length === 0 ? (
            <EmptyState
              onAddEmployee={() => setShowAddDialog(true)}
            />
          ) : (
            <EmployeeTable
              employees={employees}
              onEmployeeUpdated={handleEmployeeChange}
            />
          )}
        </div>

        {/* Add Employee Dialog */}
        <AddEmployeeDialog 
          open={showAddDialog}
          onOpenChange={setShowAddDialog}
          onEmployeeAdded={handleEmployeeChange}
        />
      </div>
    </>
  )
}

export default ViewEmployeesPage