"use client"

import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { Zap, Search, Star, Eye, TrendingUp, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface CarLaunch {
  _id: string
  carName: string
  manufacturer: string
  model: string
  segment: string
  shortDescription: string
  basePrice: number
  launchDate: string
  preOrderDate?: string
  status: string
  views: number
  isFeatured: boolean
  imageUrl?: string
  engine: string
  transmission: string
  fuelType: string
}

export const CustomerCarLaunchesView = () => {
  const [launches, setLaunches] = useState<CarLaunch[]>([])
  const [filteredLaunches, setFilteredLaunches] = useState<CarLaunch[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [segmentFilter, setSegmentFilter] = useState('all')

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
        applyFilters(data.launches || [], searchQuery, segmentFilter)
      } else {
        toast.error('Failed to fetch car launches')
      }
    } catch (error) {
      console.error('Error fetching launches:', error)
      toast.error('Error fetching car launches')
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = (launchData: CarLaunch[], search: string, segment: string) => {
    let filtered = launchData

    if (search.trim()) {
      filtered = filtered.filter(l =>
        l.carName.toLowerCase().includes(search.toLowerCase()) ||
        l.manufacturer.toLowerCase().includes(search.toLowerCase()) ||
        l.model.toLowerCase().includes(search.toLowerCase())
      )
    }

    if (segment !== 'all') {
      filtered = filtered.filter(l => l.segment === segment)
    }

    setFilteredLaunches(filtered)
  }

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    applyFilters(launches, value, segmentFilter)
  }

  const handleSegmentFilter = (value: string) => {
    setSegmentFilter(value)
    applyFilters(launches, searchQuery, value)
  }

  const handlePreOrder = async (launchId: string) => {
    try {
      const res = await fetch(`http://localhost:8080/api/new-car-launches/${launchId}/preorder`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      })

      if (res.ok) {
        toast.success('Pre-order created successfully! Our team will contact you shortly.')
        fetchLaunches()
      } else {
        const error = await res.json()
        toast.error(error.message || 'Failed to create pre-order')
      }
    } catch (error) {
      console.error('Error creating pre-order:', error)
      toast.error('Error creating pre-order')
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'teaser': return 'bg-purple-100 text-purple-800'
      case 'announced': return 'bg-blue-100 text-blue-800'
      case 'preOrder_open': return 'bg-green-100 text-green-800'
      case 'launched': return 'bg-emerald-100 text-emerald-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading car launches...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Zap className="w-6 h-6 text-blue-500" />
          Upcoming Car Launches
        </h2>
        <p className="text-gray-600 text-sm mt-1">Discover the latest vehicles launching at your dealership</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search by car name, manufacturer, or model..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 cursor-pointer"
          />
        </div>
        <select
          value={segmentFilter}
          onChange={(e) => handleSegmentFilter(e.target.value)}
          className="px-4 py-2 border rounded-md cursor-pointer"
        >
          <option value="all">All Segments</option>
          <option value="sedan">Sedan</option>
          <option value="suv">SUV</option>
          <option value="hatchback">Hatchback</option>
          <option value="mpv">MPV</option>
          <option value="crossover">Crossover</option>
        </select>
      </div>

      {/* Featured Launches - Grid View */}
      {filteredLaunches.filter(l => l.isFeatured).length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
            Featured Launches
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredLaunches.filter(l => l.isFeatured).map(launch => (
              <div
                key={launch._id}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Image */}
                {launch.imageUrl && (
                  <div className="w-full h-48 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                    <img
                      src={launch.imageUrl}
                      alt={launch.carName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none'
                      }}
                    />
                  </div>
                )}

                {/* Content */}
                <div className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xl font-bold text-gray-900">{launch.carName}</h4>
                      <p className="text-gray-600 text-sm">{launch.manufacturer} {launch.model}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(launch.status)}`}>
                      {launch.status.replace(/_/g, ' ').charAt(0).toUpperCase() + launch.status.replace(/_/g, ' ').slice(1)}
                    </span>
                  </div>

                  <p className="text-gray-600 text-sm">{launch.shortDescription}</p>

                  {/* Specs */}
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <span className="font-semibold">Engine:</span> {launch.engine}
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-semibold">Fuel:</span> {launch.fuelType}
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-semibold">Transmission:</span> {launch.transmission}
                    </div>
                  </div>

                  {/* Price and Analytics */}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="text-2xl font-bold text-blue-600">
                      {formatPrice(launch.basePrice)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {launch.views}
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" />
                        Popular
                      </div>
                    </div>
                  </div>

                  {/* Date Info */}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    Launch: {new Date(launch.launchDate).toLocaleDateString()}
                  </div>

                  {/* CTA Buttons */}
                  {launch.status === 'preOrder_open' ? (
                    <Button
                      onClick={() => handlePreOrder(launch._id)}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white cursor-pointer"
                    >
                      Pre-Order Now
                    </Button>
                  ) : (
                    <Button
                      disabled
                      className="w-full bg-gray-300 text-gray-600 cursor-not-allowed"
                    >
                      {launch.status === 'launched' ? 'Available in Showroom' : 'Coming Soon'}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Launches - List View */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">All Launches</h3>
        {filteredLaunches.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
            <Zap className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">No car launches found</p>
            <p className="text-gray-500 text-sm">Check back soon for exciting launches!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredLaunches.map(launch => (
              <div
                key={launch._id}
                className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow flex items-start gap-4"
              >
                {/* Icon */}
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-gray-900">{launch.carName}</h4>
                      <p className="text-gray-600 text-sm">{launch.manufacturer} {launch.model} • {launch.segment}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-semibold flex-shrink-0 ${getStatusColor(launch.status)}`}>
                      {launch.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <p className="text-gray-600 text-sm mt-2">{launch.shortDescription}</p>

                  <div className="flex items-center justify-between mt-3 text-sm text-gray-600">
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-blue-600">{formatPrice(launch.basePrice)}</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(launch.launchDate).toLocaleDateString()}
                      </span>
                    </div>
                    {launch.status === 'preOrder_open' && (
                      <Button
                        onClick={() => handlePreOrder(launch._id)}
                        size="sm"
                        className="bg-green-500 hover:bg-green-600 text-white cursor-pointer"
                      >
                        Pre-Order
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
