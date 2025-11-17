"use client"

import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { Gift, Search, Percent, Calendar, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Promotion {
  _id: string
  title: string
  description: string
  promotionType: string
  discountType: string
  discountValue: number
  couponCode?: string
  startDate: string
  endDate: string
  usageCount?: number
  usageLimit?: number
}

export const CustomerPromotionsView = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [filteredPromotions, setFilteredPromotions] = useState<Promotion[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  useEffect(() => {
    fetchPromotions()
  }, [])

  const fetchPromotions = async () => {
    try {
      setLoading(true)
      // This endpoint should return promotions for customer's dealership
      const res = await fetch('http://localhost:8080/api/promotions/', {
        credentials: 'include'
      })

      if (res.ok) {
        const data = await res.json()
        const activePromos = (data.promotions || []).filter((p: Promotion) => {
          const startDate = new Date(p.startDate)
          const endDate = new Date(p.endDate)
          const now = new Date()
          return startDate <= now && now <= endDate
        })
        setPromotions(activePromos)
        setFilteredPromotions(activePromos)
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

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    const filtered = promotions.filter(p =>
      p.title.toLowerCase().includes(value.toLowerCase()) ||
      p.description.toLowerCase().includes(value.toLowerCase()) ||
      p.couponCode?.toLowerCase().includes(value.toLowerCase())
    )
    setFilteredPromotions(filtered)
  }

  const copyCouponCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    toast.success('Coupon code copied!')
    setTimeout(() => setCopiedCode(null), 2000)
  }

  if (loading) {
    return <div className="text-center py-8">Loading promotions...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Gift className="w-6 h-6 text-orange-500" />
          Active Promotions
        </h2>
        <p className="text-gray-600 text-sm mt-1">Explore amazing deals and discounts just for you</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Search promotions by name or coupon code..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10 cursor-pointer"
        />
      </div>

      {/* Promotions Grid */}
      {filteredPromotions.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <Gift className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">No active promotions at the moment</p>
          <p className="text-gray-500 text-sm">Check back soon for exclusive deals!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPromotions.map(promotion => (
            <div
              key={promotion._id}
              className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow overflow-hidden"
            >
              {/* Discount Badge */}
              <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-6 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Percent className="w-8 h-8" />
                </div>
                <div className="text-4xl font-bold">
                  {promotion.discountValue}{promotion.discountType === 'percentage' ? '%' : '₹'}
                </div>
                <p className="text-orange-100 text-sm mt-1">Off</p>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{promotion.title}</h3>
                  <p className="text-gray-600 text-sm mt-2 line-clamp-2">{promotion.description}</p>
                </div>

                {/* Coupon Code */}
                {promotion.couponCode && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-2">Coupon Code</p>
                    <div className="flex items-center justify-between gap-2">
                      <code className="font-mono font-bold text-gray-900 flex-1">
                        {promotion.couponCode}
                      </code>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyCouponCode(promotion.couponCode!)}
                        className="text-blue-600 hover:bg-blue-50 cursor-pointer p-0"
                      >
                        {copiedCode === promotion.couponCode ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Dates */}
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Valid till {new Date(promotion.endDate).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Usage Info */}
                {promotion.usageLimit && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm">
                    <p className="text-yellow-800">
                      Limited offer: {promotion.usageCount || 0} / {promotion.usageLimit} used
                    </p>
                  </div>
                )}

                {/* Use Promotion Button */}
                <Button className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white cursor-pointer">
                  Use This Offer
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
