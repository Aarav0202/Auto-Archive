# Service Request Routes - Detailed Explanation

## Overview

Service request routes handle the complete lifecycle of service booking and management. They enable customers to request services, dealerships to accept/reject requests, manage schedules, update appointment status, and track completion. This is the core business logic of the application.

## Service Request Workflow

```
Customer Creates Request (Pending)
         ↓
Dealership Accepts/Rejects Request
         ↓
If Accepted → Schedule Confirmed
         ↓
Dealership May Change Schedule (Update Time)
         ↓
Service Appointment Scheduled
         ↓
Dealership Updates Status (Scheduled → In Service → Quality Check → Ready → Picked Up)
         ↓
Dealership May Mark Complete
         ↓
Customer Can View Service Records
```

## Key Endpoints

### 1. POST `/api/service-requests/create`

**Purpose**: Customer creates a new service request

**Request Body**:
```json
{
  "vehicleId": "vehicleId",
  "serviceType": "Maintenance",
  "description": "Regular checkup needed",
  "preferredDate": "2025-01-20",
  "preferredTime": "10:00",
  "dealershipId": "dealershipId"
}
```

**Authentication**: Required (JWT token)

**Flow**:
```
1. Verify user is authenticated (token in cookie)
2. Verify user is a customer
3. Validate all required fields
4. Find vehicle by ID and verify it belongs to customer
5. Create ServiceRequest document with:
   - customerId: logged-in user ID
   - vehicleId: referenced vehicle
   - dealershipId: specified dealership
   - status: "Pending"
   - requestedDate: preferredDate
   - requestedTime: preferredTime
   - description: provided description
   - timeline: empty array (filled later with status updates)
6. Save to database
7. Trigger notification: notifyServiceRequested() to dealership
8. Return created request with ID
```

**Response** (201 Created):
```json
{
  "message": "Service request created successfully",
  "request": {
    "_id": "requestId",
    "customerId": "customerId",
    "vehicleId": "vehicleId",
    "dealershipId": "dealershipId",
    "status": "Pending",
    "requestedDate": "2025-01-20",
    "requestedTime": "10:00",
    "description": "Regular checkup needed",
    "createdAt": "timestamp"
  }
}
```

**Error Cases**:
- Not authenticated: 401 Unauthorized
- Not a customer: 403 Forbidden
- Missing required fields: 400 Bad Request
- Vehicle not found: 404 Not Found
- Vehicle doesn't belong to customer: 403 Forbidden
- Dealership not found: 404 Not Found

**Notifications Triggered**:
- Dealership receives: "New Service Request" notification
- Dealership sees request in "Pending Services" tab

---

### 2. GET `/api/service-requests/dealership/pending-requests`

**Purpose**: Get all pending service requests for a dealership

**Authentication**: Required (Dealership)

**Query Parameters**:
```
?status=pending  (optional filter)
?sort=createdAt  (optional sort)
```

**Flow**:
```
1. Verify user is authenticated and is a dealership
2. Query ServiceRequest collection:
   - dealershipId: current dealership ID
   - status: "Pending"
3. Populate customer and vehicle details
4. Sort by createdAt (newest first)
5. Return array of pending requests
```

**Response** (200 OK):
```json
{
  "requests": [
    {
      "_id": "requestId",
      "customerId": {
        "_id": "customerId",
        "name": "John Doe",
        "phone": "1234567890"
      },
      "vehicleId": {
        "companyName": "Toyota",
        "vehicleName": "Camry",
        "licensePlateNumber": "ABC123",
        "currentKms": 50000
      },
      "dealershipId": "dealershipId",
      "status": "Pending",
      "requestedDate": "2025-01-20",
      "requestedTime": "10:00",
      "description": "Regular checkup",
      "createdAt": "timestamp"
    }
  ]
}
```

**Use Cases**:
- Dealership dashboard shows pending services tab
- Employee views requests to process
- System shows unreviewed customer requests

---

### 3. PUT `/api/service-requests/dealership/accept-request/:requestId`

**Purpose**: Dealership accepts a service request

**Request Body**:
```json
{
  "confirmedDate": "2025-01-22",
  "confirmedTime": "14:00"
}
```

**Authentication**: Required (Dealership)

**Flow**:
```
1. Verify authenticated user is dealership
2. Find service request by ID
   - If not found → 404
3. Verify dealership owns this request
   - serviceRequest.dealershipId === current dealership
   - If not → 403 Forbidden
4. Verify status is "Pending"
   - If not → 400 Bad Request (can't accept already processed request)
5. Update request:
   - status: "Accepted"
   - confirmedDate: provided date
   - confirmedTime: provided time
   - acceptedAt: current timestamp
6. Save to database
7. Trigger notification: notifyServiceAccepted()
   - Recipient: Customer
   - Message: "Your service for [Vehicle] is accepted for [Date] at [Time]"
8. Return updated request
```

**Response** (200 OK):
```json
{
  "message": "Service request accepted",
  "request": {
    "_id": "requestId",
    "status": "Accepted",
    "confirmedDate": "2025-01-22",
    "confirmedTime": "14:00",
    "acceptedAt": "timestamp"
  }
}
```

**Notifications Triggered**:
- Customer receives: "Service Request Accepted" notification
- Service moves from "Pending" to "Scheduled Services"

---

### 4. PUT `/api/service-requests/dealership/reject-request/:requestId`

**Purpose**: Dealership rejects a service request with optional reason

**Request Body**:
```json
{
  "rejectionReason": "Vehicle parts not available"
}
```

**Authentication**: Required (Dealership)

**Flow**:
```
1. Verify authenticated user is dealership
2. Find service request by ID
3. Verify dealership owns request
4. Verify status is "Pending"
5. Update request:
   - status: "Rejected"
   - rejectionReason: provided reason or null
   - rejectedAt: current timestamp
6. Save to database
7. Trigger notification: notifyServiceRejected()
   - Recipient: Customer
   - Message: "Your service request was rejected. Reason: [reason]"
8. Return updated request
```

**Response** (200 OK):
```json
{
  "message": "Service request rejected",
  "request": {
    "_id": "requestId",
    "status": "Rejected",
    "rejectionReason": "Vehicle parts not available",
    "rejectedAt": "timestamp"
  }
}
```

**Notifications Triggered**:
- Customer receives: "Service Request Rejected" notification
- Shows rejection reason if provided
- Request removed from pending list

---

### 5. PUT `/api/service-requests/dealership/update-schedule/:requestId`

**Purpose**: Change appointment date/time after initial acceptance

**Request Body**:
```json
{
  "confirmedDate": "2025-01-25",
  "confirmedTime": "16:00"
}
```

**Authentication**: Required (Dealership)

**Flow**:
```
1. Verify authenticated user is dealership
2. Find service request by ID
   - Populate customer and dealership details
3. Verify dealership owns request
4. Verify status is "Accepted"
   - Can only reschedule accepted requests
5. Store old values:
   - oldDate = current confirmedDate
   - oldTime = current confirmedTime
6. Update request:
   - confirmedDate: new date
   - confirmedTime: new time
   - lastScheduleChange: current timestamp
7. Save to database
8. Trigger notification: notifyServiceTimeChange()
   - Recipient: Customer
   - Message: "Schedule changed from [Old Date] [Old Time] to [New Date] [New Time]"
9. Return updated request
```

**Response** (200 OK):
```json
{
  "message": "Schedule updated successfully",
  "request": {
    "_id": "requestId",
    "confirmedDate": "2025-01-25",
    "confirmedTime": "16:00",
    "lastScheduleChange": "timestamp"
  }
}
```

**Notifications Triggered**:
- Customer receives: "Service Schedule Changed" notification
- Shows both old and new date/time

---

### 6. PUT `/api/service-requests/dealership/update-appointment-status/:requestId`

**Purpose**: Update service progress through appointment timeline stages

**Request Body**:
```json
{
  "stage": "In Service",  // or "Quality Check", "Ready for Pickup", "Picked Up"
  "notes": "Replaced oil filter, checked brake pads"
}
```

**Stages**:
1. **Scheduled** - Appointment confirmed, waiting
2. **In Service** - Service work started
3. **Quality Check** - Inspecting completed work
4. **Ready for Pickup** - Service complete, waiting customer
5. **Picked Up** - Customer collected vehicle (Final)

**Authentication**: Required (Dealership)

**Flow**:
```
1. Verify authenticated user is dealership
2. Find service request by ID
   - Populate customer, dealership, vehicle
3. Verify dealership owns request
4. Verify request is "Accepted"
   - Can't update rejected/pending requests
5. Add to timeline array:
   - stage: provided stage
   - notes: provided notes (optional)
   - timestamp: current time
6. If stage === "Picked Up":
   - Set status: "Completed"
   - Set completedAt: current timestamp
   - Trigger notifyServiceCompletion()
   - Message: "Your [Vehicle] service is completed"
7. Else:
   - Keep status: "Accepted"
   - Trigger notifyServiceStatusUpdate()
   - Message: "Service status updated to [Stage]"
8. Save to database
9. Return updated request with timeline
```

**Response** (200 OK):
```json
{
  "message": "Appointment status updated",
  "request": {
    "_id": "requestId",
    "status": "Accepted" or "Completed",
    "timeline": [
      {
        "stage": "In Service",
        "notes": "Work started",
        "timestamp": "timestamp"
      },
      {
        "stage": "Quality Check",
        "notes": "Inspection in progress",
        "timestamp": "timestamp"
      }
    ]
  }
}
```

**Notifications Triggered**:
- **Status Update**: "Service status changed to [Stage]"
- **Completion**: "Your service has been completed"

---

### 7. PUT `/:requestId/complete`

**Purpose**: Mark service complete (shortcut without timeline stages)

**Authentication**: Required (Dealership)

**Flow**:
```
1. Verify authenticated user is dealership
2. Find service request by ID
   - Populate customerId, dealershipId, vehicleId
3. Verify dealership owns request
4. Update request:
   - status: "Completed"
   - completedAt: current timestamp
5. Save to database
6. Trigger notification: notifyServiceCompletion()
   - Recipient: Customer
   - Message: "[Dealership] completed service for your [Vehicle Name]"
7. Return success response
```

**Response** (200 OK):
```json
{
  "message": "Service request marked as completed",
  "request": {
    "_id": "requestId",
    "status": "Completed",
    "completedAt": "timestamp"
  }
}
```

**Notifications Triggered**:
- Customer receives: "Service Completed" notification
- Service no longer in "Scheduled Services"

---

### 8. GET `/api/service-requests/customer/my-requests`

**Purpose**: Get all service requests created by logged-in customer

**Authentication**: Required (Customer)

**Query Parameters**:
```
?status=Accepted     (optional filter)
?sort=-createdAt    (optional sort)
```

**Flow**:
```
1. Verify user is authenticated and is customer
2. Query ServiceRequest collection:
   - customerId: current user ID
3. Populate dealership and vehicle details
4. Sort by requested date
5. Return array of requests
```

**Response** (200 OK):
```json
{
  "requests": [
    {
      "_id": "requestId",
      "dealershipId": {
        "_id": "dealershipId",
        "name": "ABC Dealership"
      },
      "vehicleId": {
        "companyName": "Honda",
        "vehicleName": "Civic",
        "licensePlateNumber": "XYZ789"
      },
      "status": "Accepted",
      "requestedDate": "2025-01-20",
      "requestedTime": "10:00",
      "confirmedDate": "2025-01-22",
      "confirmedTime": "14:00",
      "description": "Service request",
      "timeline": [
        {
          "stage": "In Service",
          "timestamp": "2025-01-22T14:05:00"
        }
      ],
      "createdAt": "timestamp"
    }
  ]
}
```

---

### 9. GET `/api/service-requests/:requestId`

**Purpose**: Get detailed view of a specific service request

**Authentication**: Required

**Flow**:
```
1. Verify user is authenticated
2. Find service request by ID
   - Populate all references (customer, dealership, vehicle, service)
3. Verify user is either:
   - The customer who created it
   - The dealership handling it
   - An employee of that dealership
4. Return detailed request with full timeline
```

**Response** (200 OK):
```json
{
  "request": {
    "_id": "requestId",
    "customerId": { /* full customer object */ },
    "dealershipId": { /* full dealership object */ },
    "vehicleId": { /* full vehicle object */ },
    "status": "Accepted",
    "timeline": [
      {
        "stage": "Scheduled",
        "notes": "Appointment confirmed",
        "timestamp": "timestamp"
      },
      {
        "stage": "In Service",
        "notes": "Work started",
        "timestamp": "timestamp"
      }
    ],
    "requestedDate": "2025-01-20",
    "confirmedDate": "2025-01-22",
    "confirmedTime": "14:00",
    "description": "Service description",
    "createdAt": "timestamp"
  }
}
```

---

## Data Model: ServiceRequest

```javascript
{
  customerId: ObjectId (required) - Reference to User
  dealershipId: ObjectId (required) - Reference to Dealership
  vehicleId: ObjectId (required) - Reference to Vehicle
  serviceType: String - Type of service (Maintenance, Repair, etc.)
  description: String - Customer's description
  status: String - Enum: ["Pending", "Accepted", "Rejected", "Completed"]
  requestedDate: Date - Customer's preferred date
  requestedTime: String - Customer's preferred time
  confirmedDate: Date - Dealership confirmed date
  confirmedTime: String - Dealership confirmed time
  rejectionReason: String - Reason for rejection (if rejected)
  timeline: Array [
    {
      stage: String - Service stage (Scheduled, In Service, Quality Check, etc.)
      notes: String - Additional notes
      timestamp: Date - When this stage was reached
    }
  ]
  acceptedAt: Date - When dealership accepted
  rejectedAt: Date - When dealership rejected
  completedAt: Date - When service was completed
  lastScheduleChange: Date - When time was last changed
  createdAt: Date - When request was created
  updatedAt: Date - Last update timestamp
}
```

---

## Notification System Integration

Service requests trigger notifications through `notificationHelper.js`:

| Event | Notification Type | Recipient | Message |
|-------|------------------|-----------|---------|
| Request Created | service_requested | Dealership | "New service request for [Vehicle]" |
| Request Accepted | service_accepted | Customer | "Your service accepted for [Date] [Time]" |
| Request Rejected | service_rejected | Customer | "Service rejected. Reason: [reason]" |
| Time Changed | service_time_changed | Customer | "Schedule changed from [old] to [new]" |
| Status Updated | service_status_update | Customer | "Status: [stage]" |
| Service Completed | service_completed | Customer | "[Dealership] completed your [Vehicle] service" |

---

## Authorization Rules

| Role | Can Create | Can Accept | Can Reject | Can Update Schedule | Can Update Status | Can View |
|------|-----------|-----------|-----------|------------------|-----------------|----------|
| Customer | Own requests | ❌ | ❌ | ❌ | ❌ | Own requests |
| Dealership | ❌ | Own requests | Own requests | Own requests | Own requests | Own requests |
| Employee | ❌ | Own dealership requests | Own dealership requests | Own dealership requests | Own dealership requests | Own dealership requests |

---

## Error Handling

**Common Error Scenarios**:

1. **Not Authenticated** (401)
   - Missing or invalid token
   - Session expired

2. **Not Authorized** (403)
   - Trying to access other user's request
   - Customer trying to accept request
   - Dealership trying to create request

3. **Invalid State** (400)
   - Rejecting already accepted request
   - Updating rejected request
   - Missing required fields

4. **Not Found** (404)
   - Request doesn't exist
   - Vehicle doesn't exist
   - Customer doesn't exist

5. **Server Error** (500)
   - Database connection error
   - Notification creation failed
   - Unexpected error

---

## Example Complete Workflow

```
Day 1, 09:00 AM:
Customer: Creates request for Toyota Camry service
Request status: "Pending"
Dealership: Receives notification "New Service Request"

Day 1, 10:30 AM:
Dealership: Accepts request for January 22, 2 PM
Request status: "Accepted"
Customer: Receives notification "Service Request Accepted for Jan 22, 2 PM"

Day 3, 01:00 PM:
Dealership: Changes time to 2:30 PM (traffic delay)
Request confirmed time: "14:30"
Customer: Receives notification "Schedule changed to 2:30 PM"

Day 3, 02:30 PM:
Dealership: Updates status to "In Service"
Customer: Receives notification "Service started"

Day 3, 04:00 PM:
Dealership: Updates status to "Quality Check"
Customer: Receives notification "Quality check in progress"

Day 3, 04:30 PM:
Dealership: Updates status to "Ready for Pickup"
Customer: Receives notification "Service ready for pickup"

Day 3, 05:00 PM:
Dealership: Updates status to "Picked Up" (Final)
Request status: "Completed"
Customer: Receives notification "Service Completed!"
```

---

## Performance Considerations

1. **Query Optimization**:
   - Index on `dealershipId` and `customerId` for fast filtering
   - Index on `status` for status filtering
   - Populate only needed fields

2. **Notification Efficiency**:
   - Async notification creation (doesn't block response)
   - Batch notifications for bulk updates
   - Error handling for failed notifications

3. **Data Size**:
   - Timeline array grows with each status update
   - Consider archiving old requests
   - Pagination for customer's request list

---

## Summary

Service request routes provide:
- ✅ Complete request lifecycle management
- ✅ Status tracking through appointment stages
- ✅ Authorization-based access control
- ✅ Automatic notification triggering
- ✅ Cascading operations on status changes
- ✅ Timeline-based appointment tracking
- ✅ Role-specific operations (customer, dealership, employee)

These routes form the core business logic of the application.
