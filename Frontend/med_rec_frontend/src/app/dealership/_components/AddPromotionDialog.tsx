"use client"

import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '@/app/context/AuthContext'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Gift,
  Percent,
  DollarSign,
  Calendar,
  Tag,
  Users,
  AlertCircle
} from 'lucide-react'

interface AddPromotionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onPromotionAdded?: () => void
}

export const AddPromotionDialog = ({ open, onOpenChange, onPromotionAdded }: AddPromotionDialogProps) => {
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    promotionType: 'discount',
    discountType: 'percentage',
    discountValue: '',
    applicableOn: ['all'],
    startDate: '',
    endDate: '',
    minimumPurchaseAmount: '',
    maximumDiscount: '',
    couponCode: '',
    targetCustomers: 'all',
    imageUrl: '',
    description_detailed: '',
    terms_and_conditions: ''
  })

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) newErrors.title = 'Title is required'
    if (!formData.description.trim()) newErrors.description = 'Description is required'
    if (!formData.discountValue) newErrors.discountValue = 'Discount value is required'
    else if (parseFloat(formData.discountValue) <= 0) newErrors.discountValue = 'Discount must be greater than 0'
    if (!formData.startDate) newErrors.startDate = 'Start date is required'
    if (!formData.endDate) newErrors.endDate = 'End date is required'

    if (formData.startDate && formData.endDate) {
      if (new Date(formData.startDate) >= new Date(formData.endDate)) {
        newErrors.endDate = 'End date must be after start date'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error('Please fix the errors in the form')
      return
    }

    try {
      setIsSubmitting(true)

      const payload = {
        title: formData.title,
        description: formData.description,
        promotionType: formData.promotionType,
        discountType: formData.discountType,
        discountValue: parseFloat(formData.discountValue),
        applicableOn: formData.applicableOn,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        minimumPurchaseAmount: formData.minimumPurchaseAmount ? parseFloat(formData.minimumPurchaseAmount) : 0,
        maximumDiscount: formData.maximumDiscount ? parseFloat(formData.maximumDiscount) : null,
        couponCode: formData.couponCode || null,
        targetCustomers: formData.targetCustomers,
        imageUrl: formData.imageUrl || null,
        description_detailed: formData.description_detailed || null,
        terms_and_conditions: formData.terms_and_conditions || null,
        applicableVehicleIds: [],
        applicableServiceIds: [],
        usageLimit: null,
        perCustomerLimit: null,
        targetCustomerIds: []
      }

      console.log('Sending payload:', payload)

      const res = await fetch('http://localhost:8080/api/promotions/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      })

      const data = await res.json()
      console.log('Response:', data)

      if (res.ok) {
        toast.success('Promotion created successfully!')
        setFormData({
          title: '',
          description: '',
          promotionType: 'discount',
          discountType: 'percentage',
          discountValue: '',
          applicableOn: ['all'],
          startDate: '',
          endDate: '',
          minimumPurchaseAmount: '',
          maximumDiscount: '',
          couponCode: '',
          targetCustomers: 'all',
          imageUrl: '',
          description_detailed: '',
          terms_and_conditions: ''
        })
        onOpenChange(false)
        if (onPromotionAdded) onPromotionAdded()
      } else {
        console.error('Error response:', data)
        toast.error(data.message || 'Failed to create promotion')
      }
    } catch (error) {
      console.error('Error creating promotion:', error)
      toast.error('Network error while creating promotion')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
              <Gift className="w-5 h-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold text-gray-900">Create New Promotion</DialogTitle>
              <DialogDescription className="text-sm text-gray-600 mt-1">
                Set up promotional offers to attract customers
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="border-b pb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>

            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Promotion Title *</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Summer Sale 2024"
                  className="cursor-pointer"
                />
                {errors.title && <p className="text-xs text-red-600 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.title}</p>}
              </div>

              <div>
                <Label htmlFor="description">Short Description *</Label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Brief description for notification"
                  rows={2}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer"
                />
                {errors.description && <p className="text-xs text-red-600 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.description}</p>}
              </div>

              <div>
                <Label htmlFor="description_detailed">Detailed Description</Label>
                <textarea
                  id="description_detailed"
                  name="description_detailed"
                  value={formData.description_detailed}
                  onChange={handleInputChange}
                  placeholder="Full details for customer viewing"
                  rows={3}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Discount Configuration */}
          <div className="border-b pb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Percent className="w-5 h-5 text-orange-500" />
              Discount Configuration
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="promotionType">Promotion Type *</Label>
                <select
                  id="promotionType"
                  name="promotionType"
                  value={formData.promotionType}
                  onChange={handleInputChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer"
                >
                  <option value="discount">Discount</option>
                  <option value="cashback">Cashback</option>
                  <option value="freebies">Freebies</option>
                  <option value="seasonal">Seasonal</option>
                  <option value="combo">Combo Offer</option>
                </select>
              </div>

              <div>
                <Label htmlFor="discountType">Discount Type *</Label>
                <select
                  id="discountType"
                  name="discountType"
                  value={formData.discountType}
                  onChange={handleInputChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed_amount">Fixed Amount (₹)</option>
                </select>
              </div>

              <div>
                <Label htmlFor="discountValue">Discount Value *</Label>
                <Input
                  id="discountValue"
                  name="discountValue"
                  type="number"
                  step="0.01"
                  value={formData.discountValue}
                  onChange={handleInputChange}
                  placeholder={formData.discountType === 'percentage' ? 'e.g., 20' : 'e.g., 5000'}
                  className="cursor-pointer"
                />
                {errors.discountValue && <p className="text-xs text-red-600 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.discountValue}</p>}
              </div>

              <div>
                <Label htmlFor="maximumDiscount">Maximum Discount (₹)</Label>
                <Input
                  id="maximumDiscount"
                  name="maximumDiscount"
                  type="number"
                  step="0.01"
                  value={formData.maximumDiscount}
                  onChange={handleInputChange}
                  placeholder="e.g., 50000"
                  className="cursor-pointer"
                />
              </div>

              <div>
                <Label htmlFor="minimumPurchaseAmount">Minimum Purchase Amount (₹)</Label>
                <Input
                  id="minimumPurchaseAmount"
                  name="minimumPurchaseAmount"
                  type="number"
                  step="0.01"
                  value={formData.minimumPurchaseAmount}
                  onChange={handleInputChange}
                  placeholder="e.g., 100000"
                  className="cursor-pointer"
                />
              </div>

              <div>
                <Label htmlFor="couponCode">Coupon Code (Optional)</Label>
                <Input
                  id="couponCode"
                  name="couponCode"
                  value={formData.couponCode}
                  onChange={handleInputChange}
                  placeholder="e.g., SUMMER20 - Leave empty if not needed"
                  className="cursor-pointer uppercase"
                />
                {formData.couponCode && (
                  <p className="text-xs text-gray-500 mt-1">
                    ✓ Coupon code must be unique across the system
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Date & Validity */}
          <div className="border-b pb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              Validity Period
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className="cursor-pointer"
                />
                {errors.startDate && <p className="text-xs text-red-600 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.startDate}</p>}
              </div>

              <div>
                <Label htmlFor="endDate">End Date *</Label>
                <Input
                  id="endDate"
                  name="endDate"
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className="cursor-pointer"
                />
                {errors.endDate && <p className="text-xs text-red-600 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.endDate}</p>}
              </div>
            </div>
          </div>

          {/* Applicability */}
          <div className="border-b pb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-500" />
              Target Audience
            </h3>

            <div>
              <Label htmlFor="targetCustomers">Target Customers</Label>
              <select
                id="targetCustomers"
                name="targetCustomers"
                value={formData.targetCustomers}
                onChange={handleInputChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer"
              >
                <option value="all">All Customers</option>
                <option value="new_customers">New Customers Only</option>
                <option value="existing_customers">Existing Customers</option>
                <option value="vip_customers">VIP Customers</option>
              </select>
            </div>
          </div>

          {/* Terms & Conditions */}
          <div className="pb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Terms & Conditions</h3>
            <textarea
              id="terms_and_conditions"
              name="terms_and_conditions"
              value={formData.terms_and_conditions}
              onChange={handleInputChange}
              placeholder="Enter terms and conditions..."
              rows={3}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="px-6 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="px-6 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 cursor-pointer"
            >
              {isSubmitting ? 'Creating...' : 'Create Promotion'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
