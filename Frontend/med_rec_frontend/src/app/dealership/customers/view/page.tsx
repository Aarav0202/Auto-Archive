"use client"

import React, { useEffect, useState } from 'react'
import Navbar from '../../_components/Navbar'
import { useAuth } from '@/app/context/AuthContext'
import { AddCustomerDialog } from '../../_components/AddCustomerDialog'
import ViewCustomerDialog from '../../_components/ViewCustomerDialog'
import { DeleteCustomerDialog } from '../../_components/DeleteCustomerDialog'
import { Users, UserPlus, Mail, Phone, MapPin } from 'lucide-react'

export default function CustomersViewPage() {
  const { user } = useAuth()
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null)
  const [openView, setOpenView] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<any | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deletingCustomer, setDeletingCustomer] = useState<any | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const fetchCustomers = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      console.log('Fetching customers...')
      const res = await fetch('http://localhost:8080/api/customers', { credentials: 'include' })
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || `Failed to fetch (${res.status})`)
      }
      const data = await res.json()
      console.log('Customers fetched:', data)
      setCustomers(data.customers || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      console.error('Error fetching customers', err)
      setError(errorMessage)
      setCustomers([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (user?.role === 'carDealership' || user?.role === 'employee') {
      fetchCustomers()
    }
  }, [user, fetchCustomers])

  useEffect(() => {
    const handler = () => fetchCustomers()
    window.addEventListener('customerAdded', handler as EventListener)
    return () => window.removeEventListener('customerAdded', handler as EventListener)
  }, [fetchCustomers])

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-'
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })
    } catch (e) {
      return dateStr
    }
  }

  const filteredCustomers = customers.filter((c) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      c.name?.toLowerCase().includes(searchLower) ||
      c.email?.toLowerCase().includes(searchLower) ||
      c.phone?.toLowerCase().includes(searchLower) ||
      c.licenseNumber?.toLowerCase().includes(searchLower)
    )
  })

  const handleView = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:8080/api/customers/${id}`, { credentials: 'include' })
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || `Failed to fetch customer (${res.status})`)
      }
      const data = await res.json()
      console.log('Customer details received:', data)
      setSelectedCustomer(data)
      setOpenView(true)
    } catch (err) {
      console.error('Error fetching customer details', err)
      alert(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto p-6 pt-24">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading customers...</p>
            <p className="mt-2 text-xs text-gray-400">If this takes too long, please refresh the page</p>
          </div>
        </div>
      </>
    )
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto p-6 pt-24">
          <div className="text-center py-12">
            <div className="p-4 bg-red-100 rounded-full mb-4 w-fit mx-auto">
              <span className="text-2xl">⚠️</span>
            </div>
            <p className="text-lg font-medium text-gray-700">Failed to load customers</p>
            <p className="text-sm mt-2 text-gray-500">{error}</p>
            <button 
              onClick={() => fetchCustomers()}
              className="mt-4 px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 cursor-pointer"
            >
              Try Again
            </button>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto p-6 pt-24">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Customers {searchTerm ? `(${filteredCustomers.length})` : `(${customers.length})`}
            </h1>
          </div>
          <p className="text-gray-600 ml-14">Manage and view all dealership customers</p>
        </div>

        {/* Card with add button and search */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 mb-6">
          <div className="p-6 border-b bg-gradient-to-r from-green-50 to-emerald-50">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500 rounded-lg">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Customer List</h2>
              </div>
              <div className="flex space-x-3">
                <button 
                  onClick={() => setShowAddDialog(true)}
                  className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  Add Customer
                </button>
              </div>
            </div>
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by name, email, phone, or license number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div className="p-6">
          {filteredCustomers.length === 0 ? (
            <div className="text-center py-12">
              <div className="flex flex-col items-center text-gray-500">
                <div className="p-4 bg-green-100 rounded-full mb-4">
                  <Users className="w-8 h-8 text-green-500" />
                </div>
                <p className="text-lg font-medium text-gray-700">
                  {searchTerm ? 'No customers found matching your search' : 'No customers found'}
                </p>
                <p className="text-sm mt-2 text-gray-500">
                  {searchTerm ? 'Try adjusting your search terms' : 'Add your first customer to get started'}
                </p>
                {!searchTerm && (
                  <button 
                    onClick={() => setShowAddDialog(true)}
                    className="mt-4 px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4" />
                    Add Customer
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto bg-white rounded-md shadow p-4">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact & Address</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCustomers.map((c) => (
                    <tr key={c._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center text-white font-medium">
                            {c.name ? c.name.charAt(0).toUpperCase() : '?'}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{c.name}</div>
                            <div className="text-xs text-gray-400">Joined: {formatDate(c.createdAt)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex items-center gap-2"><Mail className="w-3 h-3 text-gray-400" />{c.email}</div>
                        <div className="text-sm text-gray-500 flex items-center gap-2 mt-1"><Phone className="w-3 h-3 text-gray-400" />{c.phone || '-'}</div>
                        <div className="text-xs text-gray-500 flex items-center gap-2 mt-2"><MapPin className="w-3 h-3 text-gray-400" />{c.address?.city || '-'}, {c.address?.state || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        <div><strong>DOB:</strong> {c.dateOfBirth ? formatDate(c.dateOfBirth) : '-'}</div>
                        <div className="mt-1"><strong>License:</strong> {c.licenseNumber || '-'}</div>
                        <div className="mt-1"><strong>Type:</strong> {c.customerType || '-'}</div>
                        <div className="mt-1 text-xs text-gray-500">Preferred: {c.preferredContact || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button 
                            className="text-blue-600 hover:text-blue-900 transition-colors cursor-pointer"
                            title="View Details"
                            onClick={() => handleView(c._id)}
                          >
                            View
                          </button>
                          <button
                            className="text-yellow-600 hover:text-yellow-900 transition-colors cursor-pointer"
                            title="Edit Customer"
                            onClick={() => { setEditingCustomer(c); setShowAddDialog(true) }}
                          >
                            Edit
                          </button>
                          <button
                            className="text-red-600 hover:text-red-900 transition-colors cursor-pointer"
                            title="Delete Customer"
                            onClick={() => { setDeletingCustomer(c); setShowDeleteDialog(true) }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add / Edit Customer Dialog */}
        <AddCustomerDialog 
          open={showAddDialog} 
          onOpenChange={(open) => { if (!open) { setEditingCustomer(null); setShowAddDialog(open) } else setShowAddDialog(open) }}
          initialData={editingCustomer}
          onSaved={() => { fetchCustomers(); setEditingCustomer(null) }}
        />

        {/* View Customer Dialog */}
        {selectedCustomer && (
          <ViewCustomerDialog open={openView} onOpenChange={setOpenView} data={selectedCustomer} />
        )}

        {/* Delete Customer Dialog */}
        <DeleteCustomerDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          customer={deletingCustomer}
          onCustomerDeleted={() => {
            fetchCustomers()
            setDeletingCustomer(null)
          }}
        />
      </div>
    </>
  )
}
