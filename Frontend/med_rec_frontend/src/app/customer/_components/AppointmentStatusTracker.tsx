'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  MapPin,
  DollarSign,
  ChevronRight,
  Loader,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface TimelineEvent {
  stage: string;
  timestamp: string;
  notes: string;
  completedBy?: {
    name: string;
    email: string;
  };
}

interface AppointmentStatusTrackerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  requestId: string;
}

export function AppointmentStatusTracker({
  isOpen,
  onOpenChange,
  requestId,
}: AppointmentStatusTrackerProps) {
  const [status, setStatus] = useState<string | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [serviceRequest, setServiceRequest] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      fetchAppointmentStatus();
    }
  }, [isOpen, requestId]);

  const fetchAppointmentStatus = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `http://localhost:8080/api/service-requests/customer/appointment-status/${requestId}`,
        {
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch appointment status');
      }

      const data = await response.json();
      setStatus(data.currentStatus);
      setTimeline(data.timeline || []);
      setServiceRequest(data.serviceRequest);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching status');
      toast.error('Failed to load appointment status');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (stage: string) => {
    switch (stage) {
      case 'Scheduled':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'In Service':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'Quality Check':
        return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'Ready for Pickup':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'Picked Up':
        return 'bg-emerald-100 text-emerald-700 border-emerald-300';
      case 'Cancelled':
        return 'bg-red-100 text-red-700 border-red-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getStatusIcon = (stage: string) => {
    switch (stage) {
      case 'Scheduled':
        return <Calendar className="h-5 w-5" />;
      case 'In Service':
        return <Clock className="h-5 w-5 animate-spin" />;
      case 'Quality Check':
        return <AlertCircle className="h-5 w-5" />;
      case 'Ready for Pickup':
        return <CheckCircle className="h-5 w-5" />;
      case 'Picked Up':
        return <CheckCircle className="h-5 w-5" />;
      case 'Cancelled':
        return <AlertCircle className="h-5 w-5" />;
      default:
        return <Loader className="h-5 w-5" />;
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const stages = [
    'Scheduled',
    'In Service',
    'Quality Check',
    'Ready for Pickup',
    'Picked Up',
  ];

  const currentStageIndex = stages.indexOf(status || '');

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            Appointment Status Tracking
          </DialogTitle>
          <DialogDescription>
            Real-time tracking of your service appointment
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading status...</span>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-2">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-800">Error</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Service Request Info */}
            {serviceRequest && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-600 font-medium">Request ID</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {serviceRequest.requestId}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-medium">Service Type</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {serviceRequest.serviceType}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-medium flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Confirmed Date
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {serviceRequest.confirmedDate
                        ? new Date(
                            serviceRequest.confirmedDate
                          ).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })
                        : 'Not Confirmed'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-medium flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      Estimated Cost
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {serviceRequest.estimatedCost
                        ? formatCurrency(serviceRequest.estimatedCost)
                        : 'TBD'}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-medium flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    Service Center
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {serviceRequest.dealershipName}
                  </p>
                </div>
              </div>
            )}

            {/* Current Status Badge */}
            <div className="flex items-center justify-between bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-4">
              <div className="flex items-center gap-3">
                {getStatusIcon(status || '')}
                <div>
                  <p className="text-xs opacity-90">Current Status</p>
                  <p className="text-lg font-bold">{status || 'Unknown'}</p>
                </div>
              </div>
              <Button
                onClick={fetchAppointmentStatus}
                size="sm"
                variant="secondary"
                className="text-blue-600"
              >
                Refresh
              </Button>
            </div>

            {/* Progress Timeline */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Status Timeline</h3>

              {/* Visual Progress Bar */}
              <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-500"
                  style={{
                    width: `${((currentStageIndex + 1) / stages.length) * 100}%`,
                  }}
                />
              </div>

              {/* Stage Indicators */}
              <div className="flex justify-between text-center">
                {stages.map((stage, index) => (
                  <div key={stage} className="flex-1">
                    <div
                      className={`flex items-center justify-center h-8 w-8 rounded-full mx-auto mb-1 font-semibold text-sm ${
                        index <= currentStageIndex
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-300 text-gray-600'
                      }`}
                    >
                      {index + 1}
                    </div>
                    <p className="text-xs text-gray-600">{stage}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline Events */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">History</h3>

              {timeline.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  No status updates yet
                </p>
              ) : (
                <div className="space-y-2">
                  {timeline
                    .sort(
                      (a, b) =>
                        new Date(b.timestamp).getTime() -
                        new Date(a.timestamp).getTime()
                    )
                    .map((event, index) => (
                      <div
                        key={index}
                        className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex gap-3">
                          <div className="flex-shrink-0">
                            <div
                              className={`flex items-center justify-center h-8 w-8 rounded-full ${getStatusColor(
                                event.stage
                              )}`}
                            >
                              {getStatusIcon(event.stage)}
                            </div>
                          </div>

                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-medium text-gray-900">
                                  {event.stage}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {formatDate(event.timestamp)}
                                </p>
                              </div>
                            </div>

                            {event.notes && (
                              <p className="text-sm text-gray-700 mt-2 bg-gray-50 p-2 rounded">
                                {event.notes}
                              </p>
                            )}

                            {event.completedBy && (
                              <p className="text-xs text-gray-500 mt-2">
                                Updated by:{' '}
                                <span className="font-medium">
                                  {event.completedBy.name}
                                </span>
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-2">
              <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Status Updates</p>
                <p className="text-xs">
                  This page automatically tracks your appointment status. Updates are added by our service team as they progress through each stage.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Close Button */}
        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
