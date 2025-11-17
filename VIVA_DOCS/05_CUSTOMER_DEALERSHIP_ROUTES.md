# Customer & Dealership Management Routes

## Overview

These routes handle customer and dealership profile management, enabling users to view, edit, and manage their account information and related data.

---

## Customer Routes (Customer Dashboard)

### GET `/customer/home`

**Purpose**: Load customer dashboard home page

**Authentication**: Required (Customer)

**Features Displayed**:
- Recent service requests
- Upcoming appointments
- Service history
- Notifications
- Quick actions (create service request)

---

### GET `/customer/profile`

**Purpose**: Retrieve customer profile information

**Authentication**: Required (Customer)

**Response**:
```json
{
  "user": {
    "_id": "customerId",
    "name": "John Doe",
    "email": "john@example.com",
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
    "dealershipIds": ["dealId1", "dealId2"]
  }
}
```

---

### PUT `/customer/profile`

**Purpose**: Update customer profile information

**Authentication**: Required (Customer)

**Request Body**:
```json
{
  "name": "Jane Doe",
  "phone": "987-654-3210",
  "address": {
    "street": "456 Oak Ave",
    "city": "Boston",
    "state": "MA",
    "zipCode": "02101",
    "country": "USA"
  },
  "dateOfBirth": "1990-01-15",
  "licenseNumber": "DL654321",
  "preferredContact": "phone"
}
```

**Flow**:
1. Verify user is authenticated customer
2. Find customer by ID
3. Update provided fields
4. Save to database
5. Return updated profile

**Response** (200 OK):
```json
{
  "message": "Profile updated successfully",
  "user": { /* updated profile */ }
}
```

---

### GET `/customer/vehicles`

**Purpose**: Get all vehicles registered by customer

**Authentication**: Required (Customer)

**Flow**:
1. Verify authenticated user is customer
2. Query Vehicle collection:
   - customerId: current user ID
3. Populate dealership and service references
4. Return array of vehicles

**Response**:
```json
{
  "vehicles": [
    {
      "_id": "vehicleId",
      "customerId": "customerId",
      "companyName": "Toyota",
      "vehicleName": "Camry",
      "licensePlateNumber": "ABC123",
      "color": "Silver",
      "yearOfManufacture": 2022,
      "engineNumber": "ENG123",
      "chassisNumber": "CHASSIS123",
      "currentKms": 45000,
      "serviceHistory": [
        {
          "date": "2025-01-15",
          "type": "Oil Change",
          "dealership": "ABC Dealership"
        }
      ]
    }
  ]
}
```

---

### POST `/customer/register-vehicle`

**Purpose**: Register a new vehicle for customer

**Authentication**: Required (Customer)

**Request Body**:
```json
{
  "companyName": "Honda",
  "vehicleName": "Civic",
  "licensePlateNumber": "XYZ789",
  "color": "Black",
  "yearOfManufacture": 2023,
  "engineNumber": "ENG456",
  "chassisNumber": "CHASSIS456",
  "currentKms": 5000,
  "dealershipId": "dealershipId"
}
```

**Flow**:
1. Verify user is customer
2. Validate all required fields
3. Verify dealership exists
4. Create Vehicle document with:
   - customerId: current user
   - dealershipId: specified dealership
   - All vehicle details
5. Save to database
6. Return created vehicle

**Response** (201 Created):
```json
{
  "message": "Vehicle registered successfully",
  "vehicle": { /* vehicle object */ }
}
```

---

### GET `/customer/notifications`

**Purpose**: Get all notifications for customer

**Authentication**: Required (Customer)

**Query Parameters**:
```
?type=all              // all, booking_update, service_reminder, etc.
?isRead=false          // true, false
?limit=10              // pagination
?offset=0              // pagination
```

**Flow**:
1. Verify authenticated user is customer
2. Query Notification collection:
   - recipientId: current user ID
   - Filter by type if provided
   - Filter by isRead if provided
3. Sort by createdAt (newest first)
4. Apply pagination
5. Return notifications array

**Response**:
```json
{
  "notifications": [
    {
      "_id": "notificationId",
      "type": "service_accepted",
      "title": "Service Request Accepted",
      "message": "Your service for Toyota Camry is accepted for Jan 22, 2 PM",
      "isRead": false,
      "createdAt": "2025-01-20T10:30:00Z",
      "dealershipId": "dealershipId"
    }
  ],
  "total": 5,
  "unreadCount": 2
}
```

---

### PUT `/customer/notifications/:notificationId/read`

**Purpose**: Mark notification as read

**Authentication**: Required (Customer)

**Flow**:
1. Verify user is authenticated
2. Find notification by ID
3. Verify notification belongs to user
4. Set isRead: true
5. Set readAt: current timestamp
6. Save to database

**Response** (200 OK):
```json
{
  "message": "Notification marked as read"
}
```

---

## Dealership Routes (Admin Dashboard)

### GET `/dealership/home`

**Purpose**: Load dealership admin dashboard

**Authentication**: Required (Dealership)

**Features**:
- Pending service requests count
- Scheduled services
- Recent activity
- Employee management access
- Customer management access
- Analytics/statistics

---

### GET `/dealership/profile`

**Purpose**: Retrieve dealership profile information

**Authentication**: Required (Dealership)

**Response**:
```json
{
  "dealership": {
    "_id": "dealershipId",
    "name": "Premium Auto Dealership",
    "email": "contact@premiumauto.com",
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
    "employees": ["empId1", "empId2"],
    "customers": ["custId1", "custId2"],
    "services": ["serviceId1", "serviceId2"],
    "createdAt": "2024-01-01"
  }
}
```

---

### PUT `/dealership/profile`

**Purpose**: Update dealership profile information

**Authentication**: Required (Dealership)

**Request Body**:
```json
{
  "name": "Premium Auto Dealership",
  "phone": "555-5678",
  "address": {
    "street": "789 Commerce Blvd",
    "city": "Los Angeles",
    "state": "CA",
    "zipCode": "90001"
  },
  "numberOfLocations": 3,
  "licenseNumber": "DEL123456"
}
```

**Response** (200 OK):
```json
{
  "message": "Profile updated successfully",
  "dealership": { /* updated profile */ }
}
```

---

### GET `/dealership/employees`

**Purpose**: Get all employees of dealership

**Authentication**: Required (Dealership)

**Response**:
```json
{
  "employees": [
    {
      "_id": "employeeId",
      "name": "Alice Johnson",
      "email": "alice@dealership.com",
      "employeeId": "EMP001",
      "department": "Service",
      "position": "Service Manager",
      "hireDate": "2024-01-15",
      "phone": "555-1111",
      "dealershipId": "dealershipId"
    }
  ]
}
```

---

### POST `/dealership/add-employee`

**Purpose**: Register new employee for dealership

**Authentication**: Required (Dealership)

**Request Body**:
```json
{
  "name": "Bob Smith",
  "email": "bob@dealership.com",
  "password": "securePassword123",
  "employeeId": "EMP002",
  "department": "Maintenance",
  "position": "Technician",
  "phone": "555-2222"
}
```

**Flow**:
1. Verify user is dealership
2. Validate all required fields
3. Check email doesn't exist
4. Hash password
5. Create Employee document with:
   - dealershipId: current dealership
   - All employee details
6. Add employee ID to dealership.employees array
7. Save both documents

**Response** (201 Created):
```json
{
  "message": "Employee added successfully",
  "employee": { /* employee object */ }
}
```

---

### GET `/dealership/customers`

**Purpose**: Get all customers associated with dealership

**Authentication**: Required (Dealership)

**Query Parameters**:
```
?search=John      // search by name
?status=active    // active, inactive
?sort=name        // sort field
```

**Response**:
```json
{
  "customers": [
    {
      "_id": "customerId",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "123-456-7890",
      "address": { /* ... */ },
      "customerType": "Individual",
      "vehicles": 2,
      "totalServiceRequests": 5,
      "lastServiceDate": "2025-01-15"
    }
  ],
  "total": 50,
  "page": 1,
  "limit": 10
}
```

---

### POST `/dealership/add-customer`

**Purpose**: Add existing customer to dealership

**Authentication**: Required (Dealership)

**Request Body**:
```json
{
  "customerId": "customerId"
}
```

**Flow**:
1. Verify user is dealership
2. Find customer by ID
3. Add dealership to customer.dealershipIds
4. Add customer to dealership.customers
5. Save both documents

**Response** (201 Created):
```json
{
  "message": "Customer added successfully",
  "customer": { /* customer object */ }
}
```

---

### DELETE `/dealership/remove-customer/:customerId`

**Purpose**: Remove customer from dealership

**Authentication**: Required (Dealership)

**Flow**:
1. Verify user is dealership
2. Find customer by ID
3. Remove dealership from customer.dealershipIds
4. Remove customer from dealership.customers
5. If customer has no more dealerships, delete customer
6. Save documents

**Response** (200 OK):
```json
{
  "message": "Customer removed successfully"
}
```

---

### GET `/dealership/services`

**Purpose**: Get all services offered by dealership

**Authentication**: Required (Dealership)

**Response**:
```json
{
  "services": [
    {
      "_id": "serviceId",
      "name": "Oil Change",
      "description": "Regular oil and filter change",
      "estimatedTime": "30 minutes",
      "price": 49.99,
      "dealershipId": "dealershipId"
    },
    {
      "_id": "serviceId2",
      "name": "Tire Rotation",
      "description": "Rotate vehicle tires",
      "estimatedTime": "45 minutes",
      "price": 59.99,
      "dealershipId": "dealershipId"
    }
  ]
}
```

---

### POST `/dealership/add-service`

**Purpose**: Add new service offering

**Authentication**: Required (Dealership)

**Request Body**:
```json
{
  "name": "Brake Inspection",
  "description": "Complete brake system inspection",
  "estimatedTime": "60 minutes",
  "price": 79.99,
  "category": "Maintenance"
}
```

**Response** (201 Created):
```json
{
  "message": "Service added successfully",
  "service": { /* service object */ }
}
```

---

### GET `/dealership/analytics`

**Purpose**: Get dealership statistics and analytics

**Authentication**: Required (Dealership)

**Response**:
```json
{
  "stats": {
    "totalServiceRequests": 156,
    "pendingRequests": 3,
    "completedRequests": 148,
    "acceptanceRate": "96%",
    "averageCompletionTime": "2.5 days",
    "totalCustomers": 42,
    "totalEmployees": 8,
    "monthlyRevenue": 15000,
    "topService": "Oil Change",
    "busyHours": ["10:00 AM", "2:00 PM"],
    "customerSatisfaction": "4.8/5"
  },
  "chart_data": {
    "monthly_requests": [/* data */],
    "service_breakdown": [/* data */],
    "employee_performance": [/* data */]
  }
}
```

---

## Authorization Patterns

### Customer Access
- ✅ View own profile
- ✅ View own vehicles
- ✅ Create service requests for own vehicles
- ✅ View own service requests
- ✅ View own notifications
- ❌ View other customers' data
- ❌ Accept/reject service requests
- ❌ Manage dealership

### Dealership Access
- ✅ View own profile
- ✅ View pending/scheduled service requests
- ✅ Accept/reject service requests
- ✅ Update schedules
- ✅ Manage employees
- ✅ Manage customers
- ✅ View analytics
- ❌ View customer personal data
- ❌ Accept other dealerships' requests

### Employee Access
- ✅ View dealership data (if employee of dealership)
- ✅ View assigned service requests
- ✅ Update service status
- ❌ Accept new requests (dealership does)
- ❌ Delete customers (dealership does)
- ❌ View other dealership data

---

## Error Handling

**Common Errors**:

1. **Not Authenticated** (401)
   - Missing or invalid token

2. **Not Authorized** (403)
   - Customer trying to access dealership data
   - Dealership trying to manage other dealership's employees
   - Employee of Dealership A accessing Dealership B data

3. **Not Found** (404)
   - Customer doesn't exist
   - Dealership doesn't exist
   - Vehicle doesn't exist
   - Employee doesn't exist

4. **Conflict** (409)
   - Email already exists
   - Customer already linked to dealership
   - Duplicate license number

5. **Validation Error** (400)
   - Missing required fields
   - Invalid email format
   - Phone number format invalid
   - Price format invalid

---

## Pagination & Filtering

### List Endpoints Support:
```
?page=1          // Page number (default: 1)
?limit=10        // Items per page (default: 10)
?sort=name       // Sort field
?order=asc       // asc or desc
?search=query    // Text search
?status=active   // Filter by status
```

### Response Format:
```json
{
  "data": [ /* array of items */ ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

---

## Summary

**Customer Routes**:
- ✅ Profile management
- ✅ Vehicle registration
- ✅ Service request creation
- ✅ Notification management

**Dealership Routes**:
- ✅ Profile management
- ✅ Employee management
- ✅ Customer management
- ✅ Service management
- ✅ Analytics and reporting

**Key Features**:
- Role-based access control
- Comprehensive error handling
- Pagination and filtering
- Notification integration
- Analytics and statistics

