const express = require('express');
const ServiceRequest = require('../models/serviceRequest');
const Vehicle = require('../models/vehicle');
const User = require('../models/user');
const Dealership = require('../models/dealership');
const jwt = require('jsonwebtoken');
const {
  notifyServiceAccepted,
  notifyServiceRejected,
  notifyServiceStatusUpdate,
  notifyServiceTimeChange,
  notifyServiceCompletion,
} = require('../utils/notificationHelper');

const router = express.Router();

// Middleware to verify authentication
const verifyAuth = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Debug endpoint: Check current user
router.get('/debug/current-user', verifyAuth, async (req, res) => {
  try {
    console.log('DEBUG: userId=' + req.userId + ', userRole=' + req.userRole);
    const dealership = await Dealership.findById(req.userId);
    res.json({
      userId: req.userId,
      userRole: req.userRole,
      dealershipFound: !!dealership,
      dealershipName: dealership ? dealership.name : null,
      dealershipId: dealership ? dealership._id : null
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ---- CUSTOMER: SUBMIT SERVICE REQUEST ----
router.post('/customer/submit-request', verifyAuth, async (req, res) => {
  try {
    const {
      vehicleId,
      dealershipId,
      serviceType,
      requestedDate,
      requestedTime,
      customerPhone,
      customerEmail,
      description
    } = req.body;

    // Validate required fields
    if (!vehicleId || !dealershipId || !requestedDate || !requestedTime || !customerPhone) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Verify vehicle belongs to customer
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle || vehicle.ownerId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized access to this vehicle' });
    }

    // Verify dealership exists
    const dealership = await Dealership.findById(dealershipId);
    if (!dealership) {
      return res.status(404).json({ message: 'Dealership not found' });
    }

    // Create service request
    const serviceRequest = new ServiceRequest({
      vehicleId,
      customerId: req.userId,
      dealershipId,
      serviceType: serviceType || 'Regular',
      requestedDate: new Date(requestedDate),
      requestedTime,
      customerPhone,
      customerEmail,
      description,
      status: 'Pending',
      vehicleDetails: {
        companyName: vehicle.companyName,
        vehicleName: vehicle.vehicleName,
        model: vehicle.model,
        licensePlateNumber: vehicle.licensePlateNumber,
        currentKms: vehicle.currentKms
      }
    });

    await serviceRequest.save();

    res.status(201).json({
      message: 'Service request submitted successfully',
      request: serviceRequest
    });
  } catch (error) {
    console.error('Error submitting service request:', error);
    res.status(500).json({ message: 'Server error submitting service request' });
  }
});

// ---- CUSTOMER: GET MY SERVICE REQUESTS ----
router.get('/customer/my-requests', verifyAuth, async (req, res) => {
  try {
    const requests = await ServiceRequest.find({ customerId: req.userId })
      .populate('vehicleId')
      .populate('dealershipId', 'name email')
      .sort({ requestedAt: -1 });

    res.status(200).json({
      message: 'Service requests fetched',
      requests
    });
  } catch (error) {
    console.error('Error fetching service requests:', error);
    res.status(500).json({ message: 'Server error' });
  }
});



// ---- DEALERSHIP: GET SERVICE RECORDS FOR A CUSTOMER'S VEHICLE ----
router.get('/customer/vehicle/:vehicleId', verifyAuth, async (req, res) => {
  try {
    const { vehicleId } = req.params;

    // First check if user is a customer
    const user = await User.findById(req.userId);
    if (user && user.role === 'customer') {
      // Verify vehicle belongs to customer
      const vehicle = await Vehicle.findById(vehicleId);
      if (!vehicle || vehicle.ownerId.toString() !== req.userId) {
        return res.status(403).json({ message: 'Unauthorized access to this vehicle' });
      }

      // Get all completed service requests for this vehicle
      const requests = await ServiceRequest.find({
        vehicleId: vehicleId,
        customerId: req.userId,
        status: 'Completed'
      })
        .populate('vehicleId')
        .populate('dealershipId', 'name email')
        .sort({ confirmedDate: -1 });

      return res.status(200).json({
        message: 'Service records fetched',
        requests
      });
    }

    // If not a customer, they might be a dealership trying to view customer records
    // Get the vehicle to find its owner
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    // Get all completed service requests for this vehicle
    const requests = await ServiceRequest.find({
      vehicleId: vehicleId,
      status: 'Completed'
    })
      .populate('vehicleId')
      .populate('customerId', 'name email phone')
      .populate('dealershipId', 'name email')
      .sort({ confirmedDate: -1 });

    res.status(200).json({
      message: 'Service records fetched',
      requests
    });
  } catch (error) {
    console.error('Error fetching vehicle service records:', error);
    res.status(500).json({ message: 'Server error fetching service records' });
  }
});

// ---- DEALERSHIP: GET PENDING SERVICE REQUESTS ----
router.get('/dealership/pending-requests', verifyAuth, async (req, res) => {
  try {
    console.log('GET /dealership/pending-requests - userId:', req.userId, 'userRole:', req.userRole);
    
    // Verify user is a dealership
    const dealership = await Dealership.findById(req.userId);
    if (!dealership) {
      console.error('Dealership not found for userId:', req.userId);
      return res.status(403).json({ message: 'Only dealerships can access this. User is not a dealership.' });
    }

    console.log('Dealership found:', dealership.name);

    // Get all pending requests for this dealership
    const requests = await ServiceRequest.find({
      dealershipId: req.userId,
      status: 'Pending'
    })
      .populate('vehicleId')
      .populate('customerId', 'name email')
      .sort({ requestedAt: -1 });

    console.log('Found pending requests:', requests.length);

    res.status(200).json({
      message: 'Pending requests fetched',
      requests
    });
  } catch (error) {
    console.error('Error fetching pending requests:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// ---- DEALERSHIP: GET ACCEPTED/PENDING SERVICES (BY DATE) ----
router.get('/dealership/scheduled-services', verifyAuth, async (req, res) => {
  try {
    // Verify user is a dealership
    const dealership = await Dealership.findById(req.userId);
    if (!dealership) {
      return res.status(403).json({ message: 'Only dealerships can access this' });
    }

    // Get all accepted requests sorted by confirmed date
    const requests = await ServiceRequest.find({
      dealershipId: req.userId,
      status: 'Accepted'
    })
      .populate('vehicleId')
      .populate('customerId', 'name email phone')
      .sort({ confirmedDate: 1 }); // Sort by date ascending

    res.status(200).json({
      message: 'Scheduled services fetched',
      requests
    });
  } catch (error) {
    console.error('Error fetching scheduled services:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ---- DEALERSHIP: ACCEPT SERVICE REQUEST ----
router.put('/dealership/accept-request/:requestId', verifyAuth, async (req, res) => {
  try {
    const { requestId } = req.params;
    const { confirmedDate, confirmedTime, estimatedCost, responseMessage } = req.body;

    // Validate required fields
    if (!confirmedDate || !confirmedTime) {
      return res.status(400).json({ message: 'Confirmed date and time are required' });
    }

    // Find request
    const serviceRequest = await ServiceRequest.findById(requestId)
      .populate('dealershipId', 'name')
      .populate('customerId', '_id');
    
    if (!serviceRequest) {
      return res.status(404).json({ message: 'Service request not found' });
    }

    // Verify dealership owns this request
    if (serviceRequest.dealershipId._id.toString() !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized to accept this request' });
    }

    // Update request to accepted
    serviceRequest.status = 'Accepted';
    serviceRequest.respondedBy = req.userId;
    serviceRequest.responseDate = new Date();
    serviceRequest.responseMessage = responseMessage || 'Request accepted';
    serviceRequest.confirmedDate = new Date(confirmedDate);
    serviceRequest.confirmedTime = confirmedTime;
    serviceRequest.estimatedCost = estimatedCost || 0;

    await serviceRequest.save();

    // Send notification to customer
    try {
      await notifyServiceAccepted(
        serviceRequest.customerId._id,
        requestId,
        new Date(confirmedDate).toLocaleDateString('en-IN'),
        confirmedTime,
        serviceRequest.dealershipId._id,
        serviceRequest.dealershipId.name
      );
    } catch (notificationError) {
      console.error('Error sending acceptance notification:', notificationError);
      // Don't fail the request if notification fails
    }

    res.status(200).json({
      message: 'Service request accepted',
      request: serviceRequest
    });
  } catch (error) {
    console.error('Error accepting request:', error);
    res.status(500).json({ message: 'Server error accepting request' });
  }
});

// ---- DEALERSHIP: REJECT SERVICE REQUEST ----
router.put('/dealership/reject-request/:requestId', verifyAuth, async (req, res) => {
  try {
    const { requestId } = req.params;
    const { responseMessage } = req.body;

    // Find request
    const serviceRequest = await ServiceRequest.findById(requestId)
      .populate('dealershipId', 'name')
      .populate('customerId', '_id');
    
    if (!serviceRequest) {
      return res.status(404).json({ message: 'Service request not found' });
    }

    // Verify dealership owns this request
    if (serviceRequest.dealershipId._id.toString() !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized to reject this request' });
    }

    // Update request to rejected
    serviceRequest.status = 'Rejected';
    serviceRequest.respondedBy = req.userId;
    serviceRequest.responseDate = new Date();
    serviceRequest.responseMessage = responseMessage || 'Request rejected';

    await serviceRequest.save();

    // Send notification to customer
    try {
      await notifyServiceRejected(
        serviceRequest.customerId._id,
        requestId,
        responseMessage,
        serviceRequest.dealershipId._id,
        serviceRequest.dealershipId.name
      );
    } catch (notificationError) {
      console.error('Error sending rejection notification:', notificationError);
      // Don't fail the request if notification fails
    }

    res.status(200).json({
      message: 'Service request rejected',
      request: serviceRequest
    });
  } catch (error) {
    console.error('Error rejecting request:', error);
    res.status(500).json({ message: 'Server error rejecting request' });
  }
});

// ---- DEALERSHIP: UPDATE CONFIRMED DATE/TIME ----
router.put('/dealership/update-schedule/:requestId', verifyAuth, async (req, res) => {
  try {
    const { requestId } = req.params;
    const { confirmedDate, confirmedTime } = req.body;

    // Validate required fields
    if (!confirmedDate || !confirmedTime) {
      return res.status(400).json({ message: 'Confirmed date and time are required' });
    }

    // Find request
    const serviceRequest = await ServiceRequest.findById(requestId)
      .populate('dealershipId', 'name')
      .populate('customerId', '_id');
    
    if (!serviceRequest) {
      return res.status(404).json({ message: 'Service request not found' });
    }

    // Verify dealership owns this request and it's accepted
    if (serviceRequest.dealershipId._id.toString() !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized to update this request' });
    }

    if (serviceRequest.status !== 'Accepted') {
      return res.status(400).json({ message: 'Can only update accepted requests' });
    }

    // Store old values for notification
    const oldDate = serviceRequest.confirmedDate
      ? new Date(serviceRequest.confirmedDate).toLocaleDateString('en-IN')
      : 'Not set';
    const oldTime = serviceRequest.confirmedTime || 'Not set';

    // Update schedule
    serviceRequest.confirmedDate = new Date(confirmedDate);
    serviceRequest.confirmedTime = confirmedTime;

    await serviceRequest.save();

    // Send notification to customer about time change
    try {
      const newDate = new Date(confirmedDate).toLocaleDateString('en-IN');
      
      await notifyServiceTimeChange(
        serviceRequest.customerId._id,
        requestId,
        oldDate,
        oldTime,
        newDate,
        confirmedTime,
        serviceRequest.dealershipId._id,
        serviceRequest.dealershipId.name
      );
    } catch (notificationError) {
      console.error('Error sending time change notification:', notificationError);
      // Don't fail the request if notification fails
    }

    res.status(200).json({
      message: 'Schedule updated successfully',
      request: serviceRequest
    });
  } catch (error) {
    console.error('Error updating schedule:', error);
    res.status(500).json({ message: 'Server error updating schedule' });
  }
});

// ---- GET SERVICE REQUEST BY ID ----
router.get('/:requestId', verifyAuth, async (req, res) => {
  try {
    const { requestId } = req.params;

    const serviceRequest = await ServiceRequest.findById(requestId)
      .populate('vehicleId')
      .populate('customerId', 'name email phone')
      .populate('dealershipId', 'name email address')
      .populate('respondedBy', 'name');

    if (!serviceRequest) {
      return res.status(404).json({ message: 'Service request not found' });
    }

    // Verify access: customer or dealership involved
    if (
      serviceRequest.customerId._id.toString() !== req.userId &&
      serviceRequest.dealershipId._id.toString() !== req.userId
    ) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    res.status(200).json({
      message: 'Service request fetched',
      request: serviceRequest
    });
  } catch (error) {
    console.error('Error fetching service request:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ---- COMPLETE SERVICE REQUEST ----
router.put('/:requestId/complete', verifyAuth, async (req, res) => {
  try {
    const { requestId } = req.params;

    const serviceRequest = await ServiceRequest.findById(requestId).populate('customerId dealershipId vehicleId');
    if (!serviceRequest) {
      return res.status(404).json({ message: 'Service request not found' });
    }

    // Verify dealership owns this request
    if (serviceRequest.dealershipId._id.toString() !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized to complete this request' });
    }

    // Mark as completed
    serviceRequest.status = 'Completed';
    serviceRequest.completedAt = new Date();

    await serviceRequest.save();

    // Send completion notification to customer
    await notifyServiceCompletion(
      serviceRequest.customerId._id,
      requestId,
      serviceRequest.vehicleId?.companyName + ' ' + serviceRequest.vehicleId?.vehicleName,
      serviceRequest.dealershipId._id,
      serviceRequest.dealershipId.name
    );

    console.log('Service completion notification sent for request:', requestId);

    res.status(200).json({
      message: 'Service request marked as completed',
      request: serviceRequest
    });
  } catch (error) {
    console.error('Error completing request:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ---- DEALERSHIP: ADD SERVICE RECORD ----
router.put('/dealership/add-record/:requestId', verifyAuth, async (req, res) => {
  try {
    const { requestId } = req.params;
    const {
      partsChanged,
      nextServiceDueKms,
      nextServiceDueDate,
      notes,
      completedDate,
      completedKms
    } = req.body;

    // Find request
    const serviceRequest = await ServiceRequest.findById(requestId);
    if (!serviceRequest) {
      return res.status(404).json({ message: 'Service request not found' });
    }

    // Verify dealership owns this request
    if (serviceRequest.dealershipId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized to add record for this request' });
    }

    // Add service record
    serviceRequest.serviceRecord = {
      partsChanged: partsChanged || '',
      nextServiceDueKms: nextServiceDueKms || null,
      nextServiceDueDate: nextServiceDueDate ? new Date(nextServiceDueDate) : null,
      notes: notes || '',
      completedDate: completedDate ? new Date(completedDate) : new Date(),
      completedKms: completedKms || null
    };

    // Mark service as completed if not already
    if (serviceRequest.status !== 'Completed') {
      serviceRequest.status = 'Completed';
      serviceRequest.completedAt = new Date();
    }

    await serviceRequest.save();

    res.status(200).json({
      message: 'Service record added successfully',
      request: serviceRequest
    });
  } catch (error) {
    console.error('Error adding service record:', error);
    res.status(500).json({ message: 'Server error adding service record' });
  }
});

// ---- CUSTOMER: UPLOAD ISSUE PHOTOS ----
router.post('/customer/upload-photos/:requestId', verifyAuth, async (req, res) => {
  try {
    const { requestId } = req.params;
    const { photos } = req.body; // Array of { filename, url, caption }

    // Validate photos array
    if (!photos || !Array.isArray(photos) || photos.length === 0) {
      return res.status(400).json({ message: 'At least one photo is required' });
    }

    // Find service request
    const serviceRequest = await ServiceRequest.findById(requestId);
    if (!serviceRequest) {
      return res.status(404).json({ message: 'Service request not found' });
    }

    // Verify customer owns this request
    if (serviceRequest.customerId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized to upload photos for this request' });
    }

    // Only allow photo upload if request is pending or accepted
    if (!['Pending', 'Accepted'].includes(serviceRequest.status)) {
      return res.status(400).json({ message: 'Cannot upload photos for this request status' });
    }

    // Initialize issuePhotos array if doesn't exist
    if (!serviceRequest.issuePhotos) {
      serviceRequest.issuePhotos = [];
    }

    // Add photos to request
    photos.forEach(photo => {
      serviceRequest.issuePhotos.push({
        filename: photo.filename || `issue-${Date.now()}`,
        url: photo.url,
        caption: photo.caption || '',
        uploadedAt: new Date()
      });
    });

    await serviceRequest.save();

    res.status(200).json({
      message: 'Photos uploaded successfully',
      photosCount: serviceRequest.issuePhotos.length,
      request: serviceRequest
    });
  } catch (error) {
    console.error('Error uploading photos:', error);
    res.status(500).json({ message: 'Server error uploading photos' });
  }
});

// ---- CUSTOMER: GET APPOINTMENT STATUS TRACKING ----
router.get('/customer/appointment-status/:requestId', verifyAuth, async (req, res) => {
  try {
    const { requestId } = req.params;

    // Find service request
    const serviceRequest = await ServiceRequest.findById(requestId)
      .populate('appointmentStatus.timeline.completedBy', 'name email');

    if (!serviceRequest) {
      return res.status(404).json({ message: 'Service request not found' });
    }

    // Verify customer owns this request
    if (serviceRequest.customerId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized to view this request' });
    }

    res.status(200).json({
      message: 'Appointment status retrieved successfully',
      requestId: serviceRequest._id,
      currentStatus: serviceRequest.appointmentStatus.current,
      timeline: serviceRequest.appointmentStatus.timeline,
      lastUpdated: serviceRequest.appointmentStatus.lastUpdated,
      serviceRequest: {
        requestId: serviceRequest.requestId,
        serviceType: serviceRequest.serviceType,
        confirmedDate: serviceRequest.confirmedDate,
        confirmedTime: serviceRequest.confirmedTime,
        estimatedCost: serviceRequest.estimatedCost,
        dealershipName: serviceRequest.dealershipId.name || 'Dealership'
      }
    });
  } catch (error) {
    console.error('Error fetching appointment status:', error);
    res.status(500).json({ message: 'Server error fetching appointment status' });
  }
});

// ---- DEALERSHIP: UPDATE APPOINTMENT STATUS ----
router.put('/dealership/update-appointment-status/:requestId', verifyAuth, async (req, res) => {
  try {
    const { requestId } = req.params;
    const { stage, notes } = req.body;

    // Validate input
    if (!stage) {
      return res.status(400).json({ message: 'Stage is required' });
    }

    const validStages = ['Scheduled', 'In Service', 'Quality Check', 'Ready for Pickup', 'Picked Up', 'Cancelled'];
    if (!validStages.includes(stage)) {
      return res.status(400).json({ message: 'Invalid stage' });
    }

    // Find service request
    const serviceRequest = await ServiceRequest.findById(requestId)
      .populate('dealershipId', 'name')
      .populate('customerId', '_id')
      .populate('vehicleId', 'companyName vehicleName');
    
    if (!serviceRequest) {
      return res.status(404).json({ message: 'Service request not found' });
    }

    // Verify dealership owns this request
    if (serviceRequest.dealershipId._id.toString() !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized to update this request' });
    }

    // Get old stage for comparison
    const oldStage = serviceRequest.appointmentStatus.current;

    // Update current status
    serviceRequest.appointmentStatus.current = stage;
    serviceRequest.appointmentStatus.lastUpdated = new Date();

    // Add to timeline
    serviceRequest.appointmentStatus.timeline.push({
      stage: stage,
      timestamp: new Date(),
      notes: notes || '',
      completedBy: req.userId
    });

    await serviceRequest.save();

    // Send notification to customer
    try {
      if (stage === 'Picked Up') {
        // Special notification for completion
        const vehicleName = serviceRequest.vehicleId
          ? `${serviceRequest.vehicleId.companyName} ${serviceRequest.vehicleId.vehicleName}`
          : 'Your vehicle';
        
        await notifyServiceCompletion(
          serviceRequest.customerId._id,
          requestId,
          vehicleName,
          serviceRequest.dealershipId._id,
          serviceRequest.dealershipId.name
        );
      } else {
        // Regular status update notification
        await notifyServiceStatusUpdate(
          serviceRequest.customerId._id,
          requestId,
          stage,
          notes,
          serviceRequest.dealershipId._id,
          serviceRequest.dealershipId.name
        );
      }
    } catch (notificationError) {
      console.error('Error sending status update notification:', notificationError);
      // Don't fail the request if notification fails
    }

    res.status(200).json({
      message: 'Appointment status updated successfully',
      currentStatus: serviceRequest.appointmentStatus.current,
      timeline: serviceRequest.appointmentStatus.timeline
    });
  } catch (error) {
    console.error('Error updating appointment status:', error);
    res.status(500).json({ message: 'Server error updating appointment status' });
  }
});

// ---- DEALERSHIP: GET REQUEST WITH ISSUE PHOTOS ----
router.get('/dealership/request-details/:requestId', verifyAuth, async (req, res) => {
  try {
    const { requestId } = req.params;

    // Find service request
    const serviceRequest = await ServiceRequest.findById(requestId)
      .populate('customerId', 'name email phone')
      .populate('vehicleId', 'companyName vehicleName licensePlateNumber currentKms');

    if (!serviceRequest) {
      return res.status(404).json({ message: 'Service request not found' });
    }

    // Verify dealership owns this request
    if (serviceRequest.dealershipId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized to view this request' });
    }

    res.status(200).json({
      message: 'Request details retrieved successfully',
      request: {
        _id: serviceRequest._id,
        requestId: serviceRequest.requestId,
        serviceType: serviceRequest.serviceType,
        description: serviceRequest.description,
        issuePhotos: serviceRequest.issuePhotos || [],
        customerInfo: {
          name: serviceRequest.customerId.name,
          email: serviceRequest.customerId.email,
          phone: serviceRequest.customerId.phone
        },
        vehicleInfo: serviceRequest.vehicleDetails || {},
        requestedDate: serviceRequest.requestedDate,
        requestedTime: serviceRequest.requestedTime,
        confirmedDate: serviceRequest.confirmedDate,
        confirmedTime: serviceRequest.confirmedTime,
        estimatedCost: serviceRequest.estimatedCost,
        appointmentStatus: serviceRequest.appointmentStatus,
        status: serviceRequest.status
      }
    });
  } catch (error) {
    console.error('Error fetching request details:', error);
    res.status(500).json({ message: 'Server error fetching request details' });
  }
});

module.exports = router;
