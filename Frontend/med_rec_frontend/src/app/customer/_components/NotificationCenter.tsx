"use client"

import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { Bell, Trash2, CheckCircle, Clock, Gift, Zap, AlertCircle, Archive, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Notification {
  _id: string
  type: string
  title: string
  message: string
  relatedEntityType: string
  relatedEntityId?: string
  actionData?: {
    requestId?: string
    [key: string]: any
  }
  isRead: boolean
  createdAt: string
}

export const NotificationCenter = () => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)
  const [filterType, setFilterType] = useState('all')
  const [expandedNotification, setExpandedNotification] = useState<string | null>(null)

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      console.log('Fetching notifications from: http://localhost:8080/api/notifications/')
      const res = await fetch('http://localhost:8080/api/notifications/', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      console.log('Notifications response status:', res.status)
      
      if (res.ok) {
        const data = await res.json()
        console.log('Notifications received:', data.notifications?.length || 0)
        setNotifications(data.notifications || [])
        calculateUnreadCount(data.notifications || [])
      } else {
        const errorData = await res.text()
        console.error('Failed to fetch notifications - Status:', res.status, 'Response:', errorData)
        toast.error(`Failed to fetch notifications (${res.status})`)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
      toast.error('Error fetching notifications')
    } finally {
      setLoading(false)
    }
  }

  const calculateUnreadCount = (notifs: Notification[]) => {
    const count = notifs.filter(n => !n.isRead).length
    setUnreadCount(count)
  }

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const res = await fetch(`http://localhost:8080/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        credentials: 'include'
      })

      if (res.ok) {
        fetchNotifications()
      } else {
        toast.error('Failed to mark as read')
      }
    } catch (error) {
      console.error('Error marking as read:', error)
      toast.error('Error marking notification as read')
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/notifications/read/all', {
        method: 'PUT',
        credentials: 'include'
      })

      if (res.ok) {
        toast.success('All notifications marked as read')
        fetchNotifications()
      } else {
        toast.error('Failed to mark all as read')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error marking all as read')
    }
  }

  const handleDelete = async (notificationId: string) => {
    try {
      const res = await fetch(`http://localhost:8080/api/notifications/${notificationId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (res.ok) {
        toast.success('Notification deleted')
        fetchNotifications()
      } else {
        toast.error('Failed to delete notification')
      }
    } catch (error) {
      console.error('Error deleting notification:', error)
      toast.error('Error deleting notification')
    }
  }

  const handleDeleteReadNotifications = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/notifications/delete/read', {
        method: 'DELETE',
        credentials: 'include'
      })

      if (res.ok) {
        toast.success('Read notifications deleted')
        fetchNotifications()
      } else {
        toast.error('Failed to delete notifications')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error deleting notifications')
    }
  }

  const handleViewServiceDetails = (notification: Notification) => {
    if (notification.actionData?.requestId) {
      // This will trigger the parent to open the service details
      window.dispatchEvent(new CustomEvent('openServiceRequest', {
        detail: { requestId: notification.actionData.requestId }
      }))
      handleMarkAsRead(notification._id)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'promotion':
        return <Gift className="w-5 h-5 text-orange-500" />
      case 'new_car_launch':
        return <Zap className="w-5 h-5 text-blue-500" />
      case 'booking_update':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'service_reminder':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />
      default:
        return <Bell className="w-5 h-5 text-gray-500" />
    }
  }

  const filteredNotifications = filterType === 'all'
    ? notifications
    : notifications.filter(n => n.type === filterType)

  const unreadNotifications = filteredNotifications.filter(n => !n.isRead)
  const readNotifications = filteredNotifications.filter(n => n.isRead)

  if (loading) {
    return <div className="text-center py-8">Loading notifications...</div>
  }

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* Header with Actions */}
      <div className="flex items-center justify-between bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bell className="w-6 h-6 text-blue-500" />
            Notifications
            {unreadCount > 0 && (
              <span className="ml-2 px-3 py-1 bg-red-500 text-white text-sm rounded-full font-semibold">
                {unreadCount}
              </span>
            )}
          </h2>
          <p className="text-gray-600 text-sm mt-1">Stay updated with latest service updates and offers</p>
        </div>
        {unreadCount > 0 && (
          <Button
            onClick={handleMarkAllAsRead}
            className="bg-blue-500 hover:bg-blue-600 cursor-pointer whitespace-nowrap"
          >
            Mark All as Read
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        {['all', 'promotion', 'new_car_launch', 'booking_update', 'service_reminder'].map(type => (
          <Button
            key={type}
            onClick={() => setFilterType(type)}
            variant={filterType === type ? 'default' : 'outline'}
            className={`cursor-pointer ${
              filterType === type
                ? 'bg-blue-500 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            {type === 'all' ? 'All' : type.replace(/_/g, ' ').charAt(0).toUpperCase() + type.replace(/_/g, ' ').slice(1)}
          </Button>
        ))}
      </div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Bell className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">No notifications</p>
          <p className="text-gray-500 text-sm">You're all caught up!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Unread Notifications */}
          {unreadNotifications.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-blue-50 border-b border-blue-200 px-6 py-3">
                <h3 className="font-semibold text-gray-800">Unread ({unreadNotifications.length})</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {unreadNotifications.map(notification => (
                  <div
                    key={notification._id}
                    className="p-4 hover:bg-blue-50 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">{notification.title}</p>
                            <p className="text-gray-700 text-sm mt-1">{notification.message}</p>
                            <p className="text-gray-500 text-xs mt-2">
                              {new Date(notification.createdAt).toLocaleDateString()} {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                          <div className="flex-shrink-0 flex gap-1">
                            {notification.actionData?.requestId && notification.type === 'booking_update' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewServiceDetails(notification)}
                                className="text-blue-600 hover:bg-blue-100 cursor-pointer"
                                title="View service details"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMarkAsRead(notification._id)}
                              className="text-green-600 hover:bg-green-100 cursor-pointer"
                              title="Mark as read"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(notification._id)}
                              className="text-red-600 hover:bg-red-100 cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Read Notifications */}
          {readNotifications.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 border-b border-gray-200 px-6 py-3 flex items-center justify-between">
                <h3 className="font-semibold text-gray-800">Read ({readNotifications.length})</h3>
                {readNotifications.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDeleteReadNotifications}
                    className="text-gray-600 hover:text-red-600 text-xs cursor-pointer"
                  >
                    <Archive className="w-3 h-3 mr-1" />
                    Clear All
                  </Button>
                )}
              </div>
              <div className="divide-y divide-gray-200">
                {readNotifications.map(notification => (
                  <div
                    key={notification._id}
                    className="p-4 hover:bg-gray-50 transition-colors opacity-80"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">{notification.title}</p>
                            <p className="text-gray-700 text-sm mt-1">{notification.message}</p>
                            <p className="text-gray-500 text-xs mt-2">
                              {new Date(notification.createdAt).toLocaleDateString()} {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(notification._id)}
                            className="text-red-600 hover:bg-red-100 cursor-pointer flex-shrink-0"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
