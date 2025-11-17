"use client"

import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { Gift, Edit, Trash2, Eye, Search, Calendar, Percent } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AddPromotionDialog } from './AddPromotionDialog'

interface Promotion {
  _id: string
  title: string
  description: string
  promotionType: string
  discountType: string
  discountValue: number
  startDate: string
  endDate: string
  status: string
  couponCode?: string
  usageCount?: number
  usageLimit?: number
  isActive: boolean
}

export const PromotionsList = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [filteredPromotions, setFilteredPromotions] = useState<Promotion[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showAddDialog, setShowAddDialog] = useState(false)

  useEffect(() => {
    fetchPromotions()
  }, [])

  const fetchPromotions = async () => {
    try {
      setLoading(true)
      const res = await fetch('http://localhost:8080/api/promotions/', {
        credentials: 'include'
      })

      if (res.ok) {
        const data = await res.json()
        setPromotions(data.promotions || [])
        applyFilters(data.promotions || [], searchQuery, statusFilter)
      } else {
        toast.error('Failed to fetch promotions')
      }
    } catch (error) {
      console.error('Error fetching promotions:', error)
      toast.error('Error fetching promotions')
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = (promo: Promotion[], search: string, status: string) => {
    let filtered = promo

    if (search.trim()) {
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase()) ||
        p.couponCode?.toLowerCase().includes(search.toLowerCase())
      )
    }

    if (status !== 'all') {
      filtered = filtered.filter(p => p.status === status)
    }

    setFilteredPromotions(filtered)
  }

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    applyFilters(promotions, value, statusFilter)
  }

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value)
    applyFilters(promotions, searchQuery, value)
  }

  const handleDelete = async (promotionId: string) => {
    if (!confirm('Are you sure you want to delete this promotion?')) return

    try {
      const res = await fetch(`http://localhost:8080/api/promotions/${promotionId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (res.ok) {
        toast.success('Promotion deleted successfully')
        fetchPromotions()
      } else {
        toast.error('Failed to delete promotion')
      }
    } catch (error) {
      console.error('Error deleting promotion:', error)
      toast.error('Error deleting promotion')
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'scheduled': return 'bg-blue-100 text-blue-800'
      case 'expired': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading promotions...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Gift className="w-6 h-6 text-orange-500" />
            Promotional Offers
          </h2>
          <p className="text-gray-600 text-sm mt-1">Manage and track your promotional campaigns</p>
        </div>
        <Button
          onClick={() => setShowAddDialog(true)}
          className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 cursor-pointer"
        >
          <Gift className="w-4 h-4 mr-2" />
          New Promotion
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search promotions, coupon codes..."
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
          <option value="active">Active</option>
          <option value="scheduled">Scheduled</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      {/* Promotions Table */}
      {filteredPromotions.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <Gift className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">No promotions found</p>
          <p className="text-gray-500 text-sm">Create your first promotion to attract customers</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Title</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Discount</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Period</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Usage</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPromotions.map(promotion => (
                  <tr key={promotion._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900">{promotion.title}</p>
                        {promotion.couponCode && (
                          <p className="text-sm text-gray-500">Code: {promotion.couponCode}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Percent className="w-4 h-4 text-orange-500" />
                        <span className="font-semibold text-gray-900">
                          {promotion.discountValue}{promotion.discountType === 'percentage' ? '%' : '₹'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(promotion.startDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(promotion.status)}`}>
                        {promotion.status.charAt(0).toUpperCase() + promotion.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {promotion.usageLimit ? (
                        <span>{promotion.usageCount || 0} / {promotion.usageLimit}</span>
                      ) : (
                        <span>{promotion.usageCount || 0} times</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
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
                          onClick={() => handleDelete(promotion._id)}
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

      {/* Add Promotion Dialog */}
      <AddPromotionDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onPromotionAdded={fetchPromotions}
      />
    </div>
  )
}
