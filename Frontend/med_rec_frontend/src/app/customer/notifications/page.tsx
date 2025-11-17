"use client"

import React from 'react'
import { NotificationCenter } from '../_components/NotificationCenter'
import Navbar from '../_components/Navbar'

export default function NotificationsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <Navbar />
      <div className="pt-24 px-4 sm:px-6 lg:px-8 pb-8">
        <div className="max-w-4xl mx-auto">
          <NotificationCenter />
        </div>
      </div>
    </div>
  )
}
