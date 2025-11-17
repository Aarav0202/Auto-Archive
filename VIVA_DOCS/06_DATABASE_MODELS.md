# Database Models - Schema Explanation

## Overview

The application uses Mongoose schemas to define the structure of MongoDB documents. Each model represents a core entity in the system with specific relationships to other entities.

---

## 1. User Model

**File**: `models/user.js`

**Purpose**: Represents customers and other non-dealership, non-employee users

**Schema**:
```javascript
{
  name: String (required, trimmed),
  email: String (required, unique, lowercase, trimmed),
  password: String (required),
  role: String (enum: ["carDealership", "employee", "customer"], default: "customer"),
  
  // For Employees: single dealershipId (required if role === "employee")
  dealershipId: ObjectId (ref: "Dealership"),
  
  // For Customers: array of dealershipIds (can be linked to multiple dealerships)
  dealershipIds: [ObjectId] (ref: "Dealership", default: []),
  
  // Customer-specific fields
  phone: String,
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  dateOfBirth: Date,
  licenseNumber: String,
  preferredContact: String,
  customerType: String,
  notes: String,
  
  timestamps: true  // createdAt, updatedAt
}
```

**Key Differences for Different Roles**:

| Field | Customer | Employee | Dealership |
|-------|----------|----------|-----------|
| dealershipId | Optional | Required | N/A (in Dealership model) |
| dealershipIds | Array (multiple) | N/A | N/A |
| phone | Optional | Optional | N/A |
| address | Optional | Optional | N/A |
| dateOfBirth | Optional | Optional | N/A |

**Relationships**:
- One Customer → Multiple Dealerships (dealershipIds array)
- One Employee → One Dealership (dealershipId)

**Helper Methods**:
```javascript
user.isDealership()  // returns true if role === "carDealership"
user.isEmployee()    // returns true if role === "employee"
user.isCustomer()    // returns true if role === "customer"
```

**Example Document**:
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john@example.com",
  "password": "$2a$10$hashed_password_here",
  "role": "customer",
  "dealershipIds": ["507f1f77bcf86cd799439012", "507f1f77bcf86cd799439013"],
  "phone": "123-456-7890",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  },
  "dateOfBirth": "1990-01-15",
  "licenseNumber": "DL123456",
  "customerType": "Individual",
  "createdAt": "2025-01-01T10:00:00Z",
  "updatedAt": "2025-01-15T15:30:00Z"
}
```

---

## 2. Dealership Model

**File**: `models/dealership.js`

**Purpose**: Represents car dealerships managing services and customers

**Schema**:
```javascript
{
  name: String (required, trimmed),
  email: String (required, unique, lowercase, trimmed),
  password: String (required),
  
  // Business Information
  phone: String,
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  licenseNumber: String,
  numberOfLocations: Number,
  businessHours: {
    monday: { open: String, close: String },
    tuesday: { open: String, close: String },
    // ... rest of week
  },
  
  // Relationships
  employees: [ObjectId] (ref: "Employee"),
  customers: [ObjectId] (ref: "User"),
  services: [ObjectId] (ref: "Service"),
  
  // Statistics
  totalCarsSold: Number (default: 0),
  carsSold: [ObjectId] (ref: "Vehicle"),
  rating: Number,
  reviewCount: Number,
  
  timestamps: true
}
```

**Relationships**:
- One Dealership → Many Employees
- One Dealership → Many Customers
- One Dealership → Many Services

**Example Document**:
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "name": "Premium Auto Dealership",
  "email": "contact@dealership.com",
  "password": "$2a$10$hashed_password_here",
  "phone": "555-1234",
  "address": {
    "street": "789 Commerce Blvd",
    "city": "Los Angeles",
    "state": "CA",
    "zipCode": "90001",
    "country": "USA"
  },
  "licenseNumber": "DEL123456",
  "numberOfLocations": 3,
  "employees": ["empId1", "empId2", "empId3"],
  "customers": ["custId1", "custId2"],
  "services": ["serviceId1", "serviceId2"],
  "totalCarsSold": 450,
  "rating": 4.8,
  "reviewCount": 127,
  "createdAt": "2024-01-01T10:00:00Z",
  "updatedAt": "2025-01-15T15:30:00Z"
}
```

---

## 3. Employee Model

**File**: `models/employee.js`

**Purpose**: Represents dealership staff members

**Schema**:
```javascript
{
  name: String (required, trimmed),
  email: String (required, unique, lowercase, trimmed),
  password: String (required),
  
  // Employment Information
  employeeId: String (unique),
  department: String,
  position: String,
  hireDate: Date,
  salary: Number,
  
  // Contact
  phone: String,
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  
  // Relationship to Dealership
  dealershipId: ObjectId (ref: "Dealership", required),
  
  // Performance
  performanceRating: Number,
  yearsOfExperience: Number,
  specializations: [String],
  
  timestamps: true
}
```

**Relationships**:
- Many Employees → One Dealership

**Example Document**:
```json
{
  "_id": "empId1",
  "name": "Alice Johnson",
  "email": "alice@dealership.com",
  "password": "$2a$10$hashed_password_here",
  "employeeId": "EMP001",
  "department": "Service",
  "position": "Service Manager",
  "hireDate": "2024-01-15",
  "salary": 55000,
  "phone": "555-1111",
  "dealershipId": "507f1f77bcf86cd799439012",
  "performanceRating": 4.7,
  "yearsOfExperience": 5,
  "specializations": ["Electrical", "Diagnostics"],
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2025-01-15T15:30:00Z"
}
```

---

## 4. Vehicle Model

**File**: `models/vehicle.js`

**Purpose**: Represents customer vehicles

**Schema**:
```javascript
{
  // Customer & Dealership
  customerId: ObjectId (ref: "User", required),
  dealershipId: ObjectId (ref: "Dealership"),
  
  // Vehicle Details
  companyName: String (required),
  vehicleName: String (required),
  licensePlateNumber: String (unique),
  color: String,
  yearOfManufacture: Number,
  engineNumber: String,
  chassisNumber: String,
  fuelType: String,
  transmission: String,
  
  // Usage Tracking
  currentKms: Number,
  purchaseDate: Date,
  purchasePrice: Number,
  
  // Service Information
  registrationExpiry: Date,
  insuranceExpiry: Date,
  nextServiceDueKms: Number,
  nextServiceDueDate: Date,
  
  // Service History
  serviceHistory: [
    {
      date: Date,
      type: String,
      dealership: String,
      notes: String,
      cost: Number
    }
  ],
  
  timestamps: true
}
```

**Relationships**:
- Many Vehicles → One Customer
- Many Vehicles → One Dealership (optional)

**Example Document**:
```json
{
  "_id": "vehicleId1",
  "customerId": "507f1f77bcf86cd799439011",
  "dealershipId": "507f1f77bcf86cd799439012",
  "companyName": "Toyota",
  "vehicleName": "Camry",
  "licensePlateNumber": "ABC123",
  "color": "Silver",
  "yearOfManufacture": 2022,
  "engineNumber": "ENG123456",
  "chassisNumber": "CHASSIS123456",
  "fuelType": "Gasoline",
  "transmission": "Automatic",
  "currentKms": 45000,
  "purchaseDate": "2022-06-15",
  "purchasePrice": 25000,
  "registrationExpiry": "2026-06-15",
  "insuranceExpiry": "2025-12-31",
  "nextServiceDueKms": 50000,
  "nextServiceDueDate": "2025-03-01",
  "serviceHistory": [
    {
      "date": "2025-01-15",
      "type": "Oil Change",
      "dealership": "Premium Auto Dealership",
      "notes": "Regular maintenance",
      "cost": 49.99
    }
  ],
  "createdAt": "2022-06-15T10:00:00Z",
  "updatedAt": "2025-01-15T15:30:00Z"
}
```

---

## 5. Service Model

**File**: `models/service.js`

**Purpose**: Represents services offered by dealerships

**Schema**:
```javascript
{
  dealershipId: ObjectId (ref: "Dealership", required),
  
  // Service Details
  name: String (required),
  description: String,
  category: String,
  
  // Service Information
  estimatedTime: String,
  estimatedPrice: Number,
  requirements: [String],
  partsRequired: [String],
  
  // Tracking
  isActive: Boolean (default: true),
  popularityRating: Number,
  
  timestamps: true
}
```

**Example Document**:
```json
{
  "_id": "serviceId1",
  "dealershipId": "507f1f77bcf86cd799439012",
  "name": "Oil Change",
  "description": "Regular oil and filter change",
  "category": "Maintenance",
  "estimatedTime": "30 minutes",
  "estimatedPrice": 49.99,
  "requirements": ["Synthetic Oil", "Oil Filter"],
  "partsRequired": ["Mobil 5W-30", "Fram Filter"],
  "isActive": true,
  "popularityRating": 4.5,
  "createdAt": "2024-01-01T10:00:00Z",
  "updatedAt": "2025-01-15T15:30:00Z"
}
```

---

## 6. ServiceRequest Model

**File**: `models/serviceRequest.js`

**Purpose**: Represents service requests from customers

**Schema**:
```javascript
{
  // Relationships
  customerId: ObjectId (ref: "User", required),
  dealershipId: ObjectId (ref: "Dealership", required),
  vehicleId: ObjectId (ref: "Vehicle", required),
  
  // Request Details
  status: String (enum: ["Pending", "Accepted", "Rejected", "Completed"]),
  requestedDate: Date,
  requestedTime: String,
  confirmedDate: Date,
  confirmedTime: String,
  
  // Service Information
  serviceType: String,
  description: String,
  rejectionReason: String,
  
  // Timeline Tracking
  timeline: [
    {
      stage: String,
      notes: String,
      timestamp: Date
    }
  ],
  
  // Timestamps
  acceptedAt: Date,
  rejectedAt: Date,
  completedAt: Date,
  lastScheduleChange: Date,
  
  timestamps: true
}
```

**Status Values**:
- **Pending**: Initial state, waiting for dealership response
- **Accepted**: Dealership confirmed appointment
- **Rejected**: Dealership declined request
- **Completed**: Service finished

**Timeline Stages**:
- Scheduled
- In Service
- Quality Check
- Ready for Pickup
- Picked Up (Final)

**Example Document**:
```json
{
  "_id": "requestId1",
  "customerId": "507f1f77bcf86cd799439011",
  "dealershipId": "507f1f77bcf86cd799439012",
  "vehicleId": "vehicleId1",
  "status": "Accepted",
  "requestedDate": "2025-01-20",
  "requestedTime": "10:00",
  "confirmedDate": "2025-01-22",
  "confirmedTime": "14:00",
  "serviceType": "Maintenance",
  "description": "Regular oil change and inspection",
  "timeline": [
    {
      "stage": "Scheduled",
      "notes": "Appointment confirmed",
      "timestamp": "2025-01-20T11:00:00Z"
    },
    {
      "stage": "In Service",
      "notes": "Work started",
      "timestamp": "2025-01-22T14:05:00Z"
    },
    {
      "stage": "Completed",
      "notes": "Service finished successfully",
      "timestamp": "2025-01-22T14:35:00Z"
    }
  ],
  "acceptedAt": "2025-01-20T11:00:00Z",
  "completedAt": "2025-01-22T14:35:00Z",
  "createdAt": "2025-01-20T10:00:00Z",
  "updatedAt": "2025-01-22T14:35:00Z"
}
```

---

## 7. Notification Model

**File**: `models/notification.js`

**Purpose**: Stores notifications for users

**Schema**:
```javascript
{
  // Recipient
  recipientId: ObjectId (ref: "User", required),
  dealershipId: ObjectId (ref: "Dealership", required),
  
  // Notification Content
  type: String (enum: ["service_accepted", "service_rejected", "service_time_changed", 
                       "service_status_update", "service_completed", "promotion", 
                       "new_car_launch"]),
  title: String,
  message: String,
  
  // Optional Data
  relatedEntityId: ObjectId,
  actionData: Object,
  
  // Status
  isRead: Boolean (default: false),
  readAt: Date,
  priority: String (enum: ["low", "normal", "high"], default: "normal"),
  
  // Expiration
  expiresAt: Date,
  
  timestamps: true
}
```

**Notification Types**:

| Type | Trigger | Recipient |
|------|---------|-----------|
| service_accepted | Dealership accepts request | Customer |
| service_rejected | Dealership rejects request | Customer |
| service_time_changed | Dealership changes schedule | Customer |
| service_status_update | Status changes to stage | Customer |
| service_completed | Service marked complete | Customer |
| promotion | New promotion created | Customer |
| new_car_launch | New car announced | Customer |

**Example Document**:
```json
{
  "_id": "notificationId1",
  "recipientId": "507f1f77bcf86cd799439011",
  "dealershipId": "507f1f77bcf86cd799439012",
  "type": "service_accepted",
  "title": "Service Request Accepted",
  "message": "Your service for Toyota Camry is accepted for Jan 22, 2 PM",
  "relatedEntityId": "requestId1",
  "actionData": {
    "serviceDate": "2025-01-22",
    "serviceTime": "14:00",
    "vehicleName": "Toyota Camry"
  },
  "isRead": false,
  "priority": "normal",
  "createdAt": "2025-01-20T11:00:00Z",
  "updatedAt": "2025-01-20T11:00:00Z"
}
```

---

## 8. Booking Model

**File**: `models/booking.js`

**Purpose**: Represents appointment bookings

**Schema**:
```javascript
{
  customerId: ObjectId (ref: "User", required),
  dealershipId: ObjectId (ref: "Dealership", required),
  vehicleId: ObjectId (ref: "Vehicle", required),
  serviceId: ObjectId (ref: "Service"),
  
  // Booking Details
  bookingDate: Date,
  bookingTime: String,
  notes: String,
  status: String (enum: ["Confirmed", "Cancelled", "Completed"]),
  
  // Reminders
  reminderSent: Boolean (default: false),
  reminderTime: Date,
  
  timestamps: true
}
```

---

## 9. Promotion Model

**File**: `models/promotion.js`

**Purpose**: Represents promotional offers

**Schema**:
```javascript
{
  dealershipId: ObjectId (ref: "Dealership", required),
  
  // Promotion Details
  title: String (required),
  description: String,
  discountPercentage: Number,
  discountAmount: Number,
  
  // Validity
  validFrom: Date,
  validUntil: Date,
  applicableServices: [String],
  
  // Status
  isActive: Boolean (default: true),
  
  timestamps: true
}
```

---

## 10. NewCarLaunch Model

**File**: `models/newCarLaunch.js`

**Purpose**: Represents new vehicle announcements

**Schema**:
```javascript
{
  dealershipId: ObjectId (ref: "Dealership", required),
  
  // Car Details
  companyName: String,
  modelName: String,
  releaseDate: Date,
  startingPrice: Number,
  description: String,
  specifications: Object,
  
  // Marketing
  featureHighlights: [String],
  imageUrl: String,
  
  // Tracking
  viewCount: Number,
  inquiryCount: Number,
  isActive: Boolean (default: true),
  
  timestamps: true
}
```

---

## 11. CancelledBooking Model

**File**: `models/cancelledBooking.js`

**Purpose**: Archives cancelled bookings

**Schema**:
```javascript
{
  originalBookingId: ObjectId,
  customerId: ObjectId,
  dealershipId: ObjectId,
  vehicleId: ObjectId,
  
  // Cancellation Details
  cancelledDate: Date,
  cancellationReason: String,
  refundAmount: Number,
  refundStatus: String,
  
  timestamps: true
}
```

---

## Entity Relationship Diagram

```
User (Customer)
  ├── dealershipIds → [Dealership] (Many-to-Many)
  ├── vehicles → [Vehicle] (One-to-Many)
  ├── serviceRequests → [ServiceRequest] (One-to-Many)
  └── notifications → [Notification] (One-to-Many)

Dealership
  ├── customers → [User] (Many-to-Many via dealershipIds)
  ├── employees → [Employee] (One-to-Many)
  ├── services → [Service] (One-to-Many)
  ├── serviceRequests → [ServiceRequest] (One-to-Many)
  ├── promotions → [Promotion] (One-to-Many)
  ├── newCarLaunches → [NewCarLaunch] (One-to-Many)
  └── notifications → [Notification] (One-to-Many as dealershipId)

Employee
  └── dealershipId → Dealership

Vehicle
  ├── customerId → User (Many-to-One)
  ├── dealershipId → Dealership (Many-to-One)
  └── serviceRequests → [ServiceRequest] (One-to-Many via vehicleId)

Service
  └── dealershipId → Dealership

ServiceRequest
  ├── customerId → User
  ├── dealershipId → Dealership
  └── vehicleId → Vehicle

Notification
  ├── recipientId → User
  └── dealershipId → Dealership

Booking
  ├── customerId → User
  ├── dealershipId → Dealership
  ├── vehicleId → Vehicle
  └── serviceId → Service
```

---

## Database Indexes

For performance optimization, these indexes should be created:

```javascript
// User
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ dealershipIds: 1 })

// Dealership
db.dealerships.createIndex({ email: 1 }, { unique: true })

// Employee
db.employees.createIndex({ email: 1 }, { unique: true })
db.employees.createIndex({ dealershipId: 1 })

// Vehicle
db.vehicles.createIndex({ customerId: 1 })
db.vehicles.createIndex({ licensePlateNumber: 1 }, { unique: true })

// ServiceRequest
db.servicerequests.createIndex({ customerId: 1 })
db.servicerequests.createIndex({ dealershipId: 1 })
db.servicerequests.createIndex({ status: 1 })

// Notification
db.notifications.createIndex({ recipientId: 1, isRead: 1 })
db.notifications.createIndex({ createdAt: -1 })
```

---

## Summary

The database models are designed to:
- ✅ Support flexible customer-dealership relationships
- ✅ Track complete service request lifecycle
- ✅ Maintain comprehensive notification history
- ✅ Enable role-based access control
- ✅ Support multiple dealerships per customer
- ✅ Provide audit trails via timestamps
- ✅ Facilitate complex queries through relationships

