const Notification = require('../models/notification');

/**
 * Create a notification for a user
 * @param {Object} data - Notification data
 * @param {String} data.recipientId - User ID to receive notification
 * @param {String} data.dealershipId - Dealership ID (required by schema)
 * @param {String} data.type - Type of notification (booking_update, service_completed, etc.)
 * @param {String} data.title - Notification title
 * @param {String} data.message - Notification message
 * @param {String} data.relatedEntityType - Type of related entity (ServiceRequest, Booking, etc.)
 * @param {String} data.relatedEntityId - ID of related entity
 * @param {Object} data.actionData - Additional data for actions (requestId, etc.)
 */
async function createNotification(data) {
  try {
    const notification = new Notification({
      recipientId: data.recipientId,
      dealershipId: data.dealershipId,
      type: data.type,
      title: data.title,
      message: data.message,
      relatedEntityType: data.relatedEntityType,
      relatedEntityId: data.relatedEntityId,
      actionData: data.actionData || {},
      isRead: false,
      createdAt: new Date(),
    });

    await notification.save();
    console.log('Notification created:', notification._id);
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
}

/**
 * Create notification when service request status is updated
 */
async function notifyServiceStatusUpdate(customerId, requestId, stage, notes, dealershipId, dealershipName) {
  try {
    const stageMessages = {
      'Scheduled': 'Your service appointment has been confirmed',
      'In Service': 'Your vehicle is currently being serviced',
      'Quality Check': 'Your vehicle is undergoing quality checks',
      'Ready for Pickup': 'Your vehicle is ready to be picked up',
      'Picked Up': 'Your service is complete! Thank you for your business',
      'Cancelled': 'Your service appointment has been cancelled',
      'Pending': 'Your service request has been received',
      'Accepted': 'Your service request has been accepted',
    };

    const message = stageMessages[stage] || `Your service status has been updated to ${stage}`;
    let fullMessage = message;
    if (notes) {
      fullMessage += ` - ${notes}`;
    }
    if (dealershipName) {
      fullMessage += ` (${dealershipName})`;
    }

    await createNotification({
      recipientId: customerId,
      dealershipId: dealershipId,
      type: 'booking_update',
      title: `Service Status Update - ${stage}`,
      message: fullMessage,
      relatedEntityType: 'ServiceRequest',
      relatedEntityId: requestId,
      actionData: {
        requestId,
        stage,
        dealershipName,
      },
    });

    console.log(`Notification sent for service status update: ${stage}`);
  } catch (error) {
    console.error('Error notifying service status update:', error);
  }
}

/**
 * Create notification when service time is changed
 */
async function notifyServiceTimeChange(customerId, requestId, oldDate, oldTime, newDate, newTime, dealershipId, dealershipName) {
  try {
    const message = `Your service appointment time has been changed from ${oldDate} at ${oldTime} to ${newDate} at ${newTime}`;

    await createNotification({
      recipientId: customerId,
      dealershipId: dealershipId,
      type: 'booking_update',
      title: 'Service Time Changed',
      message,
      relatedEntityType: 'ServiceRequest',
      relatedEntityId: requestId,
      actionData: {
        requestId,
        oldDate,
        oldTime,
        newDate,
        newTime,
        dealershipName,
      },
    });

    console.log(`Notification sent for service time change`);
  } catch (error) {
    console.error('Error notifying service time change:', error);
  }
}

/**
 * Create notification when service is completed
 */
async function notifyServiceCompletion(customerId, requestId, vehicleName, dealershipId, dealershipName) {
  try {
    const message = `Your ${vehicleName} service has been completed successfully. Click to view service details.`;

    await createNotification({
      recipientId: customerId,
      dealershipId: dealershipId,
      type: 'booking_update',
      title: 'Service Completed',
      message,
      relatedEntityType: 'ServiceRequest',
      relatedEntityId: requestId,
      actionData: {
        requestId,
        vehicleName,
        dealershipName,
        action: 'view_details',
      },
    });

    console.log(`Notification sent for service completion`);
  } catch (error) {
    console.error('Error notifying service completion:', error);
  }
}

/**
 * Create notification when service request is accepted
 */
async function notifyServiceAccepted(customerId, requestId, confirmedDate, confirmedTime, dealershipId, dealershipName) {
  try {
    const message = `Your service request has been accepted! Scheduled for ${confirmedDate} at ${confirmedTime} at ${dealershipName}`;

    await createNotification({
      recipientId: customerId,
      dealershipId: dealershipId,
      type: 'booking_update',
      title: 'Service Request Accepted',
      message,
      relatedEntityType: 'ServiceRequest',
      relatedEntityId: requestId,
      actionData: {
        requestId,
        confirmedDate,
        confirmedTime,
        dealershipName,
      },
    });

    console.log(`Notification sent for service acceptance`);
  } catch (error) {
    console.error('Error notifying service acceptance:', error);
  }
}

/**
 * Create notification when service request is rejected
 */
async function notifyServiceRejected(customerId, requestId, reason, dealershipId, dealershipName) {
  try {
    const message = `Your service request has been rejected${reason ? ` with reason: ${reason}` : ''}`;

    await createNotification({
      recipientId: customerId,
      dealershipId: dealershipId,
      type: 'booking_update',
      title: 'Service Request Rejected',
      message,
      relatedEntityType: 'ServiceRequest',
      relatedEntityId: requestId,
      actionData: {
        requestId,
        reason,
        dealershipName,
      },
    });

    console.log(`Notification sent for service rejection`);
  } catch (error) {
    console.error('Error notifying service rejection:', error);
  }
}

module.exports = {
  createNotification,
  notifyServiceStatusUpdate,
  notifyServiceTimeChange,
  notifyServiceCompletion,
  notifyServiceAccepted,
  notifyServiceRejected,
};
