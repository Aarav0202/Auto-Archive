"use client"

import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { Zap, AlertCircle, X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface AddCarLaunchDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onLaunchAdded?: () => void
}

interface FormErrors {
  [key: string]: string
}

export const AddCarLaunchDialog: React.FC<AddCarLaunchDialogProps> = ({
  open = false,
  onOpenChange,
  onLaunchAdded
}) => {
  const [isOpen, setIsOpen] = useState(open)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [features, setFeatures] = useState<string[]>([''])
  const [colors, setColors] = useState<string[]>([''])
  const [variants, setVariants] = useState<Array<{ name: string; price: number }>>([{ name: '', price: 0 }])

  const [formData, setFormData] = useState({
    carName: '',
    manufacturer: '',
    model: '',
    segment: 'sedan',
    basePrice: '',
    shortDescription: '',
    detailedDescription: '',
    launchDate: '',
    preOrderDate: '',
    engine: '',
    transmission: 'manual',
    fuelType: 'petrol',
    mileage: '',
    features: [] as string[],
    colors: [] as string[],
    variants: [] as Array<{ name: string; price: number }>,
    imageUrl: '',
    videoUrl: '',
    targetSegment: 'all'
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const addFeature = () => {
    setFeatures([...features, ''])
  }

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...features]
    newFeatures[index] = value
    setFeatures(newFeatures)
    setFormData(prev => ({
      ...prev,
      features: newFeatures.filter(f => f.trim())
    }))
  }

  const removeFeature = (index: number) => {
    const newFeatures = features.filter((_, i) => i !== index)
    setFeatures(newFeatures)
    setFormData(prev => ({
      ...prev,
      features: newFeatures.filter(f => f.trim())
    }))
  }

  const addColor = () => {
    setColors([...colors, ''])
  }

  const updateColor = (index: number, value: string) => {
    const newColors = [...colors]
    newColors[index] = value
    setColors(newColors)
    setFormData(prev => ({
      ...prev,
      colors: newColors.filter(c => c.trim())
    }))
  }

  const removeColor = (index: number) => {
    const newColors = colors.filter((_, i) => i !== index)
    setColors(newColors)
    setFormData(prev => ({
      ...prev,
      colors: newColors.filter(c => c.trim())
    }))
  }

  const addVariant = () => {
    setVariants([...variants, { name: '', price: 0 }])
  }

  const updateVariant = (index: number, field: string, value: string | number) => {
    const newVariants = [...variants]
    newVariants[index] = {
      ...newVariants[index],
      [field]: field === 'price' ? Number(value) : value
    }
    setVariants(newVariants)
    setFormData(prev => ({
      ...prev,
      variants: newVariants.filter(v => v.name.trim())
    }))
  }

  const removeVariant = (index: number) => {
    const newVariants = variants.filter((_, i) => i !== index)
    setVariants(newVariants)
    setFormData(prev => ({
      ...prev,
      variants: newVariants.filter(v => v.name.trim())
    }))
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.carName.trim()) newErrors.carName = 'Car name is required'
    if (!formData.manufacturer.trim()) newErrors.manufacturer = 'Manufacturer is required'
    if (!formData.model.trim()) newErrors.model = 'Model is required'
    if (!formData.basePrice || Number(formData.basePrice) <= 0) newErrors.basePrice = 'Valid price is required'
    if (!formData.launchDate) newErrors.launchDate = 'Launch date is required'
    if (!formData.shortDescription.trim()) newErrors.shortDescription = 'Short description is required'
    if (!formData.engine.trim()) newErrors.engine = 'Engine specification is required'
    if (!formData.mileage.trim()) newErrors.mileage = 'Mileage is required'

    const launchDate = new Date(formData.launchDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (launchDate < today) {
      newErrors.launchDate = 'Launch date cannot be in the past'
    }

    if (formData.preOrderDate) {
      const preOrderDate = new Date(formData.preOrderDate)
      if (preOrderDate >= launchDate) {
        newErrors.preOrderDate = 'Pre-order date must be before launch date'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error('Please fix all errors')
      return
    }

    try {
      setLoading(true)

      const payload = {
        ...formData,
        basePrice: Number(formData.basePrice),
        variants: formData.variants.filter(v => v.name.trim()),
        features: formData.features.filter(f => f.trim()),
        colors: formData.colors.filter(c => c.trim())
      }

      const res = await fetch('http://localhost:8080/api/new-car-launches/', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        toast.success('Car launch created successfully!')
        resetForm()
        setIsOpen(false)
        if (onOpenChange) onOpenChange(false)
        if (onLaunchAdded) onLaunchAdded()
      } else {
        const error = await res.json()
        toast.error(error.message || 'Failed to create car launch')
      }
    } catch (error) {
      console.error('Error creating car launch:', error)
      toast.error('Error creating car launch')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      carName: '',
      manufacturer: '',
      model: '',
      segment: 'sedan',
      basePrice: '',
      shortDescription: '',
      detailedDescription: '',
      launchDate: '',
      preOrderDate: '',
      engine: '',
      transmission: 'manual',
      fuelType: 'petrol',
      mileage: '',
      features: [],
      colors: [],
      variants: [],
      imageUrl: '',
      videoUrl: '',
      targetSegment: 'all'
    })
    setFeatures([''])
    setColors([''])
    setVariants([{ name: '', price: 0 }])
    setErrors({})
  }

  const handleOpenChange = (newOpen: boolean) => {
    setIsOpen(newOpen)
    if (!newOpen) resetForm()
    if (onOpenChange) onOpenChange(newOpen)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Zap className="w-5 h-5 text-blue-500" />
            Launch New Car
          </DialogTitle>
          <DialogDescription>
            Create and configure a new car launch campaign. Customers linked to your dealership will receive notifications automatically.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information Section */}
          <div className="space-y-4 border-b pb-6">
            <h3 className="font-semibold text-gray-900 text-lg">Basic Information</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="carName">Car Name *</Label>
                <Input
                  id="carName"
                  name="carName"
                  placeholder="e.g., New XUV500"
                  value={formData.carName}
                  onChange={handleInputChange}
                  className="cursor-pointer"
                />
                {errors.carName && (
                  <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {errors.carName}
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="manufacturer">Manufacturer *</Label>
                <Input
                  id="manufacturer"
                  name="manufacturer"
                  placeholder="e.g., Mahindra"
                  value={formData.manufacturer}
                  onChange={handleInputChange}
                  className="cursor-pointer"
                />
                {errors.manufacturer && (
                  <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {errors.manufacturer}
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="model">Model *</Label>
                <Input
                  id="model"
                  name="model"
                  placeholder="e.g., 2024"
                  value={formData.model}
                  onChange={handleInputChange}
                  className="cursor-pointer"
                />
                {errors.model && (
                  <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {errors.model}
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="segment">Segment</Label>
                <select
                  id="segment"
                  name="segment"
                  value={formData.segment}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md cursor-pointer"
                >
                  <option value="sedan">Sedan</option>
                  <option value="suv">SUV</option>
                  <option value="hatchback">Hatchback</option>
                  <option value="mpv">MPV</option>
                  <option value="crossover">Crossover</option>
                  <option value="coupe">Coupe</option>
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="shortDescription">Short Description *</Label>
              <textarea
                id="shortDescription"
                name="shortDescription"
                placeholder="Brief description (max 200 characters)"
                maxLength={200}
                rows={2}
                value={formData.shortDescription}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md cursor-pointer"
              />
              <div className="text-right text-sm text-gray-500 mt-1">
                {formData.shortDescription.length}/200
              </div>
              {errors.shortDescription && (
                <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {errors.shortDescription}
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="detailedDescription">Detailed Description</Label>
              <textarea
                id="detailedDescription"
                name="detailedDescription"
                placeholder="Detailed description of the car"
                rows={3}
                value={formData.detailedDescription}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md cursor-pointer"
              />
            </div>
          </div>

          {/* Pricing Section */}
          <div className="space-y-4 border-b pb-6">
            <h3 className="font-semibold text-gray-900 text-lg">Pricing</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="basePrice">Base Price (₹) *</Label>
                <Input
                  id="basePrice"
                  name="basePrice"
                  type="number"
                  placeholder="5000000"
                  value={formData.basePrice}
                  onChange={handleInputChange}
                  className="cursor-pointer"
                />
                {errors.basePrice && (
                  <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {errors.basePrice}
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <Label>Variants</Label>
                <Button
                  type="button"
                  onClick={addVariant}
                  className="text-blue-600 hover:text-blue-700 text-sm bg-transparent cursor-pointer"
                >
                  + Add Variant
                </Button>
              </div>
              <div className="space-y-2">
                {variants.map((variant, index) => (
                  <div key={index} className="flex gap-2 items-end">
                    <Input
                      placeholder="Variant name (e.g., Standard, Executive)"
                      value={variant.name}
                      onChange={(e) => updateVariant(index, 'name', e.target.value)}
                      className="flex-1 cursor-pointer"
                    />
                    <Input
                      type="number"
                      placeholder="Price"
                      value={variant.price || ''}
                      onChange={(e) => updateVariant(index, 'price', e.target.value)}
                      className="w-32 cursor-pointer"
                    />
                    {variants.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => removeVariant(index)}
                        className="text-red-600 hover:text-red-700 bg-transparent cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Technical Specifications */}
          <div className="space-y-4 border-b pb-6">
            <h3 className="font-semibold text-gray-900 text-lg">Technical Specifications</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="engine">Engine *</Label>
                <Input
                  id="engine"
                  name="engine"
                  placeholder="e.g., 2.0L Turbo Diesel"
                  value={formData.engine}
                  onChange={handleInputChange}
                  className="cursor-pointer"
                />
                {errors.engine && (
                  <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {errors.engine}
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="transmission">Transmission</Label>
                <select
                  id="transmission"
                  name="transmission"
                  value={formData.transmission}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md cursor-pointer"
                >
                  <option value="manual">Manual</option>
                  <option value="automatic">Automatic</option>
                  <option value="cvt">CVT</option>
                </select>
              </div>

              <div>
                <Label htmlFor="fuelType">Fuel Type</Label>
                <select
                  id="fuelType"
                  name="fuelType"
                  value={formData.fuelType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md cursor-pointer"
                >
                  <option value="petrol">Petrol</option>
                  <option value="diesel">Diesel</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="electric">Electric</option>
                  <option value="cng">CNG</option>
                </select>
              </div>

              <div>
                <Label htmlFor="mileage">Mileage (km/l) *</Label>
                <Input
                  id="mileage"
                  name="mileage"
                  placeholder="e.g., 16 km/l"
                  value={formData.mileage}
                  onChange={handleInputChange}
                  className="cursor-pointer"
                />
                {errors.mileage && (
                  <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {errors.mileage}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="space-y-4 border-b pb-6">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 text-lg">Features</h3>
              <Button
                type="button"
                onClick={addFeature}
                className="text-blue-600 hover:text-blue-700 text-sm bg-transparent cursor-pointer"
              >
                + Add Feature
              </Button>
            </div>
            <div className="space-y-2">
              {features.map((feature, index) => (
                <div key={index} className="flex gap-2 items-end">
                  <Input
                    placeholder="e.g., Sunroof, All-Terrain Tyres"
                    value={feature}
                    onChange={(e) => updateFeature(index, e.target.value)}
                    className="flex-1 cursor-pointer"
                  />
                  {features.length > 1 && (
                    <Button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="text-red-600 hover:text-red-700 bg-transparent cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Colors Section */}
          <div className="space-y-4 border-b pb-6">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 text-lg">Available Colors</h3>
              <Button
                type="button"
                onClick={addColor}
                className="text-blue-600 hover:text-blue-700 text-sm bg-transparent cursor-pointer"
              >
                + Add Color
              </Button>
            </div>
            <div className="space-y-2">
              {colors.map((color, index) => (
                <div key={index} className="flex gap-2 items-end">
                  <Input
                    placeholder="e.g., Pearl White, Metallic Black"
                    value={color}
                    onChange={(e) => updateColor(index, e.target.value)}
                    className="flex-1 cursor-pointer"
                  />
                  {colors.length > 1 && (
                    <Button
                      type="button"
                      onClick={() => removeColor(index)}
                      className="text-red-600 hover:text-red-700 bg-transparent cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Launch Details Section */}
          <div className="space-y-4 border-b pb-6">
            <h3 className="font-semibold text-gray-900 text-lg">Launch Details</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="launchDate">Launch Date *</Label>
                <Input
                  id="launchDate"
                  name="launchDate"
                  type="datetime-local"
                  value={formData.launchDate}
                  onChange={handleInputChange}
                  className="cursor-pointer"
                />
                {errors.launchDate && (
                  <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {errors.launchDate}
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="preOrderDate">Pre-Order Start Date</Label>
                <Input
                  id="preOrderDate"
                  name="preOrderDate"
                  type="datetime-local"
                  value={formData.preOrderDate}
                  onChange={handleInputChange}
                  className="cursor-pointer"
                />
                {errors.preOrderDate && (
                  <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {errors.preOrderDate}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="imageUrl">Image URL</Label>
                <Input
                  id="imageUrl"
                  name="imageUrl"
                  placeholder="https://example.com/image.jpg"
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                  className="cursor-pointer"
                />
              </div>

              <div>
                <Label htmlFor="videoUrl">Video URL</Label>
                <Input
                  id="videoUrl"
                  name="videoUrl"
                  placeholder="https://youtube.com/watch?v=..."
                  value={formData.videoUrl}
                  onChange={handleInputChange}
                  className="cursor-pointer"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="targetSegment">Target Customer Segment</Label>
              <select
                id="targetSegment"
                name="targetSegment"
                value={formData.targetSegment}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md cursor-pointer"
              >
                <option value="all">All Customers</option>
                <option value="new">New Customers</option>
                <option value="existing">Existing Customers</option>
                <option value="vip">VIP Customers</option>
              </select>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 cursor-pointer"
            >
              {loading ? 'Creating...' : 'Create Car Launch'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
