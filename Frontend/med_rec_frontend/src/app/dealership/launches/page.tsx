"use client"

import React from 'react'
import { CarLaunchsList } from '../_components/CarLaunchsList'
import Navbar from '../_components/Navbar'

export default function CarLaunchesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <Navbar />
      <div className="pt-24 px-4 sm:px-6 lg:px-8 pb-8">
        <div className="max-w-7xl mx-auto">
          <CarLaunchsList />
        </div>
      </div>
    </div>
  )
}
