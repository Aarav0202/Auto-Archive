"use client"

import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { Zap, Edit, Trash2, Eye, Search, Calendar, TrendingUp, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface CarLaunch {
  _id: string
  carName: string
  manufacturer: string
  model: string
  segment: string
  launchDate: string
  preOrderDate?: string
  basePrice: number
  status: string
  views: number
  preOrderCount: number
  isFeatured: boolean
}

export const CarLaunchsList = () => {
  const [launches, setLaunches] = useState<CarLaunch[]>([])
  const [filteredLaunches, setFilteredLaunches] = useState<CarLaunch[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    fetchLaunches()
  }, [])

  const fetchLaunches = async () => {
    try {
      setLoading(true)
      const res = await fetch('http://localhost:8080/api/new-car-launches/', {
        credentials: 'include'
      })

      if (res.ok) {
        const data = await res.json()
        setLaunches(data.launches || [])
        applyFilters(data.launches || [], searchQuery, statusFilter)
      } else {
        toast.error('Failed to fetch car launches')
      }
    } catch (error) {
      console.error('Error fetching launches:', error)
      toast.error('Error fetching launches')
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = (launchData: CarLaunch[], search: string, status: string) => {
    let filtered = launchData

    if (search.trim()) {
      filtered = filtered.filter(l =>
        l.carName.toLowerCase().includes(search.toLowerCase()) ||
        l.manufacturer.toLowerCase().includes(search.toLowerCase()) ||
        l.model.toLowerCase().includes(search.toLowerCase())
      )
    }

    if (status !== 'all') {
      filtered = filtered.filter(l => l.status === status)
    }

    setFilteredLaunches(filtered)
  }

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    applyFilters(launches, value, statusFilter)
  }

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value)
    applyFilters(launches, searchQuery, value)
  }

  const handleDelete = async (launchId: string) => {
    if (!confirm('Are you sure you want to delete this car launch?')) return

    try {
      const res = await fetch(`http://localhost:8080/api/new-car-launches/${launchId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (res.ok) {
        toast.success('Car launch deleted successfully')
        fetchLaunches()
      } else {
        toast.error('Failed to delete car launch')
      }
    } catch (error) {
      console.error('Error deleting launch:', error)
      toast.error('Error deleting car launch')
    }
  }

  const toggleFeatured = async (launchId: string, currentFeatured: boolean) => {
    try {
      const res = await fetch(`http://localhost:8080/api/new-car-launches/${launchId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFeatured: !currentFeatured })
      })

      if (res.ok) {
        toast.success(`Launch ${!currentFeatured ? 'featured' : 'unfeatured'} successfully`)
        fetchLaunches()
      } else {
        toast.error('Failed to update featured status')
      }
    } catch (error) {
      console.error('Error toggling featured:', error)
      toast.error('Error updating featured status')
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'teaser': return 'bg-purple-100 text-purple-800'
      case 'announced': return 'bg-blue-100 text-blue-800'
      case 'preOrder_open': return 'bg-green-100 text-green-800'
      case 'launched': return 'bg-emerald-100 text-emerald-800'
      case 'discontinued': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price)
  }

  if (loading) {
    return <div className="text-center py-8">Loading car launches...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Zap className="w-6 h-6 text-blue-500" />
            New Car Launches
          </h2>
          <p className="text-gray-600 text-sm mt-1">Manage and track new car launch campaigns</p>
        </div>
        <Button className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 cursor-pointer">
          <Zap className="w-4 h-4 mr-2" />
          Launch New Car
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search car name, manufacturer, model..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 cursor-pointer"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => handleStatusFilter(e.target.value)}
          className="px-4 py-2 border rounded-md cursor-pointer"
        >
          <option value="all">All Status</option>
          <option value="teaser">Teaser</option>
          <option value="announced">Announced</option>
          <option value="preOrder_open">Pre-Order Open</option>
          <option value="launched">Launched</option>
          <option value="discontinued">Discontinued</option>
        </select>
      </div>

      {/* Car Launches Table */}
      {filteredLaunches.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <Zap className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">No car launches found</p>
          <p className="text-gray-500 text-sm">Create a new car launch to showcase upcoming models</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Car Details</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Price</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Launch Date</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Analytics</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredLaunches.map(launch => (
                  <tr key={launch._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900">{launch.carName}</p>
                        <p className="text-sm text-gray-500">{launch.manufacturer} {launch.model}</p>
                        <p className="text-xs text-gray-400">{launch.segment}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-gray-900">{formatPrice(launch.basePrice)}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(launch.launchDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(launch.status)}`}>
                        {launch.status.replace(/_/g, ' ').charAt(0).toUpperCase() + launch.status.replace(/_/g, ' ').slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          <span>{launch.views}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-4 h-4" />
                          <span>{launch.preOrderCount}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`${launch.isFeatured ? 'text-yellow-600' : 'text-gray-400'} hover:bg-yellow-50 cursor-pointer`}
                          onClick={() => toggleFeatured(launch._id, launch.isFeatured)}
                          title="Toggle featured"
                        >
                          <Star className="w-4 h-4" fill={launch.isFeatured ? 'currentColor' : 'none'} />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50 cursor-pointer">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-green-600 hover:bg-green-50 cursor-pointer">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:bg-red-50 cursor-pointer"
                          onClick={() => handleDelete(launch._id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
