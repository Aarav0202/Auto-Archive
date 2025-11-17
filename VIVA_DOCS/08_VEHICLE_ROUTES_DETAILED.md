# Vehicle Routes - Complete Documentation

## Overview

Vehicle routes manage all operations related to vehicle registration, tracking, and maintenance scheduling. These routes allow dealerships and employees to register customer vehicles, track service history, manage maintenance schedules, and view vehicle details. Vehicles are the central entity around which service requests are created.

### Key Concepts

- **Vehicle Ownership**: Each vehicle belongs to a customer (ownerId)
- **Dealership Association**: Each vehicle is associated with a specific dealership
- **Service Tracking**: System tracks last service date/km and next due service date/km
- **Maintenance Scheduling**: Dealerships can plan maintenance based on mileage and time intervals

---

## Database Model: Vehicle

### Vehicle Schema

```javascript
{
  _id: ObjectId,
  
  // Basic Information
  companyName: String,             // Brand/Manufacturer (required) - e.g., "Toyota"
  vehicleName: String,             // Model name (required) - e.g., "Camry"
  model: String,                   // Model variant - e.g., "2.5 LE"
  
  // Identification
  chassyNumber: String,            // VIN/Chassis number (unique per dealership)
  licensePlateNumber: String,      // License plate number
  
  // Purchase Details
  dateOfBuying: Date,              // Date of purchase
  color: String,                   // Vehicle color
  year: Number,                    // Model year
  
  // Service Information
  lastServicedDate: Date,          // When last serviced
  lastServicedKms: Number,         // Kilometers at last service
  dueServiceDate: Date,            // When next service due (by date)
  dueServiceKms: Number,           // When next service due (by km)
  
  // Ownership
  ownerId: ObjectId,               // Customer who owns vehicle (required)
  dealershipId: ObjectId,          // Dealership managing vehicle (required)
  
  // Additional Information
  fuelType: String,                // Enum: Petrol, Diesel, Electric, Hybrid, CNG, Other
  transmission: String,             // Enum: Manual, Automatic, CVT, Other
  engineCapacity: String,          // e.g., "2000cc" or "2.0L"
  currentKms: Number,              // Current odometer reading (default: 0)
  notes: String,                   // Additional notes
  
  createdAt: Date,                 // When vehicle was registered
  updatedAt: Date                  // Last update timestamp
}
```

### Example Vehicle Document

```json
{
  "_id": "607f1f77bcf86cd799439021",
  "companyName": "Toyota",
  "vehicleName": "Camry",
  "model": "2.5 LE",
  "chassyNumber": "4T1BF1AK5CU123456",
  "licensePlateNumber": "ABC1234",
  "dateOfBuying": "2021-06-15",
  "color": "Silver",
  "year": 2021,
  
  "lastServicedDate": "2024-12-15",
  "lastServicedKms": 45000,
  "dueServiceDate": "2025-06-15",
  "dueServiceKms": 55000,
  
  "ownerId": "507f1f77bcf86cd799439011",
  "dealershipId": "507f1f77bcf86cd799439001",
  
  "fuelType": "Petrol",
  "transmission": "Automatic",
  "engineCapacity": "2.5L",
  "currentKms": 47500,
  "notes": "Regular maintenance, no issues",
  
  "createdAt": "2024-01-20T10:30:00Z",
  "updatedAt": "2024-12-15T14:20:00Z"
}
```

### Database Indexes

```javascript
// Index for owner + dealership lookups (most common query)
vehicleSchema.index({ ownerId: 1, dealershipId: 1 });

// Index for license plate lookups at dealership
vehicleSchema.index({ licensePlateNumber: 1, dealershipId: 1 });
```

---

## Routes Reference

### 1. POST `/api/vehicles/` - Add Vehicle

**Purpose**: Register a new vehicle for a customer at a dealership

**Method**: POST

**Authentication**: Required (JWT token in cookies)

**Authorization**: Only dealership/employee of the dealership can add vehicles

**Request Body**:

```json
{
  "companyName": "Toyota",               // Required
  "vehicleName": "Camry",                // Required
  "model": "2.5 LE",                     // Optional
  "chassyNumber": "4T1BF1AK5CU123456",   // Optional
  "licensePlateNumber": "ABC1234",       // Optional
  "dateOfBuying": "2021-06-15",          // Optional
  "color": "Silver",                     // Optional
  "year": 2021,                          // Optional
  
  "lastServicedDate": "2024-12-15",      // Optional
  "lastServicedKms": 45000,              // Optional
  "dueServiceDate": "2025-06-15",        // Optional
  "dueServiceKms": 55000,                // Optional
  
  "fuelType": "Petrol",                  // Optional: Petrol|Diesel|Electric|Hybrid|CNG|Other
  "transmission": "Automatic",           // Optional: Manual|Automatic|CVT|Other
  "engineCapacity": "2.5L",              // Optional
  "currentKms": 47500,                   // Optional
  "notes": "Regular maintenance",        // Optional
  
  "ownerId": "507f1f77bcf86cd799439011", // Required - customer ID
  "dealershipId": "507f1f77bcf86cd799439001" // Required - dealership ID
}
```

**Response** - `201 Created`:

```json
{
  "message": "Vehicle added successfully",
  "vehicle": {
    "_id": "607f1f77bcf86cd799439021",
    "companyName": "Toyota",
    "vehicleName": "Camry",
    "model": "2.5 LE",
    "chassyNumber": "4T1BF1AK5CU123456",
    "licensePlateNumber": "ABC1234",
    "dateOfBuying": "2021-06-15",
    "color": "Silver",
    "year": 2021,
    "lastServicedDate": "2024-12-15",
    "lastServicedKms": 45000,
    "dueServiceDate": "2025-06-15",
    "dueServiceKms": 55000,
    "fuelType": "Petrol",
    "transmission": "Automatic",
    "engineCapacity": "2.5L",
    "currentKms": 47500,
    "notes": "Regular maintenance",
    "ownerId": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "phone": "+1-555-0123"
    },
    "dealershipId": "507f1f77bcf86cd799439001",
    "createdAt": "2025-01-15T10:30:00Z",
    "updatedAt": "2025-01-15T10:30:00Z"
  }
}
```

**Error Responses**:

- `400 Bad Request` - Missing required fields
```json
{
  "message": "Company name and vehicle name are required"
}
```

- `400 Bad Request` - Customer not linked to dealership
```json
{
  "message": "Customer not linked to this dealership"
}
```

- `400 Bad Request` - Duplicate chassy number
```json
{
  "message": "Vehicle with this chassy number already exists in your dealership"
}
```

- `403 Forbidden` - Not a dealership/employee of that dealership
```json
{
  "message": "Only dealerships and employees can add vehicles"
}
```

**Implementation Details**:

1. Verify JWT token
2. Determine role (dealership or employee)
3. Verify customer exists and is linked to dealership
4. Check chassy number uniqueness at dealership
5. Normalize data:
   - Trim strings
   - Convert numbers (year, km)
   - Convert dates to ISO format
   - Uppercase chassy number and license plate
6. Create Vehicle document
7. Populate and return vehicle with owner details

**Data Validation**:

- `companyName`: trimmed, required
- `vehicleName`: trimmed, required
- `chassyNumber`: trimmed, uppercase, unique per dealership
- `licensePlateNumber`: uppercase
- `year`: parsed as integer
- `currentKms`, `lastServicedKms`, `dueServiceKms`: parsed as integers
- Dates: converted to ISO date format

**Use Case**: Dealership registering a customer's vehicle for service tracking

---

### 2. GET `/api/vehicles/customer/:customerId` - Get Customer's Vehicles

**Purpose**: Retrieve all vehicles owned by a customer at a specific dealership

**Method**: GET

**Authentication**: Required

**Authorization**: Requester's dealership must be one of customer's dealerships

**Path Parameters**:
```
customerId (ObjectId) - The customer whose vehicles to retrieve
```

**Query Parameters**: None

**Response** - `200 OK`:

```json
{
  "vehicles": [
    {
      "_id": "607f1f77bcf86cd799439021",
      "companyName": "Toyota",
      "vehicleName": "Camry",
      "model": "2.5 LE",
      "licensePlateNumber": "ABC1234",
      "year": 2021,
      "color": "Silver",
      "currentKms": 47500,
      "lastServicedDate": "2024-12-15",
      "dueServiceDate": "2025-06-15",
      "fuelType": "Petrol",
      "transmission": "Automatic",
      "createdAt": "2024-01-20T10:30:00Z"
    },
    {
      "_id": "607f1f77bcf86cd799439022",
      "companyName": "Honda",
      "vehicleName": "Accord",
      "licensePlateNumber": "XY789ZW",
      "year": 2022,
      "color": "Blue",
      "currentKms": 32000,
      "lastServicedDate": "2024-11-10",
      "dueServiceDate": "2025-05-10",
      "fuelType": "Petrol",
      "transmission": "Automatic",
      "createdAt": "2024-03-10T15:30:00Z"
    }
  ],
  "count": 2
}
```

**Error Responses**:

- `404 Not Found` - Customer doesn't exist
```json
{
  "message": "Customer not found"
}
```

- `403 Forbidden` - Customer not linked to your dealership
```json
{
  "message": "Access denied"
}
```

**Implementation Details**:

1. Verify JWT token
2. Verify customer exists and is a customer role
3. Check access: customer's dealershipIds includes requester's dealership
4. Query: `Vehicle.find({ ownerId: customerId, dealershipId: dealershipId })`
5. Populate dealershipId with name only
6. Sort by createdAt descending
7. Return vehicles list with count

**Use Case**: 
- Dealership staff viewing customer's vehicles
- Customer service dashboard showing their vehicles

---

### 3. GET `/api/vehicles/` - Get All Vehicles at Dealership

**Purpose**: Retrieve all vehicles registered at the requesting dealership

**Method**: GET

**Authentication**: Required

**Authorization**: Must be dealership or employee (customers cannot access)

**Query Parameters**: None

**Response** - `200 OK`:

```json
{
  "vehicles": [
    {
      "_id": "607f1f77bcf86cd799439021",
      "companyName": "Toyota",
      "vehicleName": "Camry",
      "model": "2.5 LE",
      "licensePlateNumber": "ABC1234",
      "year": 2021,
      "currentKms": 47500,
      "lastServicedDate": "2024-12-15",
      "dueServiceDate": "2025-06-15",
      "fuelType": "Petrol",
      "transmission": "Automatic",
      "ownerId": {
        "_id": "507f1f77bcf86cd799439011",
        "name": "John Doe",
        "email": "john.doe@example.com",
        "phone": "+1-555-0123"
      },
      "dealershipId": {
        "_id": "507f1f77bcf86cd799439001",
        "name": "Main Dealership"
      },
      "createdAt": "2024-01-20T10:30:00Z"
    },
    {
      "_id": "607f1f77bcf86cd799439022",
      "companyName": "Honda",
      "vehicleName": "Accord",
      "licensePlateNumber": "XY789ZW",
      "year": 2022,
      "currentKms": 32000,
      "ownerId": {
        "_id": "507f1f77bcf86cd799439012",
        "name": "Jane Smith",
        "email": "jane.smith@example.com",
        "phone": "+1-555-0456"
      },
      "dealershipId": {
        "_id": "507f1f77bcf86cd799439001",
        "name": "Main Dealership"
      },
      "createdAt": "2024-03-10T15:30:00Z"
    }
  ],
  "count": 2
}
```

**Error Responses**:

- `403 Forbidden` - Not a dealership or employee
```json
{
  "message": "Only dealerships and employees can view vehicles"
}
```

**Implementation Details**:

1. Verify JWT token
2. Get requester's dealershipId
3. Query: `Vehicle.find({ dealershipId: dealershipId })`
4. Populate ownerId (name, email, phone) and dealershipId (name)
5. Sort by createdAt descending
6. Return vehicles list with count

**Use Case**: 
- Dealership dashboard showing all registered vehicles
- Inventory management and tracking
- Service planning overview

---

### 4. GET `/api/vehicles/:vehicleId` - Get Single Vehicle Details

**Purpose**: Retrieve detailed information about a specific vehicle

**Method**: GET

**Authentication**: Required

**Authorization**: Requester's dealership must match vehicle's dealership

**Path Parameters**:
```
vehicleId (ObjectId) - The vehicle to retrieve
```

**Response** - `200 OK`:

```json
{
  "vehicle": {
    "_id": "607f1f77bcf86cd799439021",
    "companyName": "Toyota",
    "vehicleName": "Camry",
    "model": "2.5 LE",
    "chassyNumber": "4T1BF1AK5CU123456",
    "licensePlateNumber": "ABC1234",
    "dateOfBuying": "2021-06-15",
    "color": "Silver",
    "year": 2021,
    "lastServicedDate": "2024-12-15",
    "lastServicedKms": 45000,
    "dueServiceDate": "2025-06-15",
    "dueServiceKms": 55000,
    "fuelType": "Petrol",
    "transmission": "Automatic",
    "engineCapacity": "2.5L",
    "currentKms": 47500,
    "notes": "Regular maintenance, no issues",
    "ownerId": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "phone": "+1-555-0123"
    },
    "dealershipId": {
      "_id": "507f1f77bcf86cd799439001",
      "name": "Main Dealership"
    },
    "createdAt": "2024-01-20T10:30:00Z",
    "updatedAt": "2024-12-15T14:20:00Z"
  }
}
```

**Error Responses**:

- `404 Not Found` - Vehicle doesn't exist
```json
{
  "message": "Vehicle not found"
}
```

- `403 Forbidden` - Vehicle not at your dealership
```json
{
  "message": "Access denied"
}
```

**Implementation Details**:

1. Verify JWT token
2. Find vehicle by ID
3. Check access: vehicle's dealershipId matches requester's dealership
4. Populate ownerId and dealershipId with details
5. Return vehicle with all details

**Use Case**: 
- Viewing complete vehicle details before creating service request
- Checking maintenance history
- Verifying vehicle information for service planning

---

### 5. PUT `/api/vehicles/:vehicleId` - Update Vehicle

**Purpose**: Update vehicle information including service tracking data

**Method**: PUT

**Authentication**: Required

**Authorization**: Requester's dealership must match vehicle's dealership

**Path Parameters**:
```
vehicleId (ObjectId) - The vehicle to update
```

**Request Body** (all fields optional):

```json
{
  "companyName": "Toyota",
  "vehicleName": "Camry",
  "model": "2.5 LE",
  "chassyNumber": "4T1BF1AK5CU123456",
  "licensePlateNumber": "ABC1234",
  "dateOfBuying": "2021-06-15",
  "color": "Silver",
  "year": 2021,
  "lastServicedDate": "2024-12-15",
  "lastServicedKms": 45000,
  "dueServiceDate": "2025-06-15",
  "dueServiceKms": 55000,
  "fuelType": "Petrol",
  "transmission": "Automatic",
  "engineCapacity": "2.5L",
  "currentKms": 47500,
  "notes": "Updated service notes"
}
```

**Response** - `200 OK`:

```json
{
  "message": "Vehicle updated successfully",
  "vehicle": {
    "_id": "607f1f77bcf86cd799439021",
    "companyName": "Toyota",
    "vehicleName": "Camry",
    "model": "2.5 LE",
    "chassyNumber": "4T1BF1AK5CU123456",
    "licensePlateNumber": "ABC1234",
    "dateOfBuying": "2021-06-15",
    "color": "Silver",
    "year": 2021,
    "lastServicedDate": "2024-12-15",
    "lastServicedKms": 45000,
    "dueServiceDate": "2025-06-15",
    "dueServiceKms": 55000,
    "currentKms": 47500,
    "fuelType": "Petrol",
    "transmission": "Automatic",
    "engineCapacity": "2.5L",
    "notes": "Updated service notes",
    "ownerId": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "phone": "+1-555-0123"
    },
    "dealershipId": {
      "_id": "507f1f77bcf86cd799439001",
      "name": "Main Dealership"
    },
    "updatedAt": "2025-01-15T14:20:00Z"
  }
}
```

**Error Responses**:

- `404 Not Found` - Vehicle doesn't exist
```json
{
  "message": "Vehicle not found"
}
```

- `403 Forbidden` - Not your dealership
```json
{
  "message": "Access denied: not your dealership"
}
```

- `400 Bad Request` - Duplicate chassy number
```json
{
  "message": "Another vehicle with this chassy number already exists"
}
```

**Allowed Fields for Update**:
- companyName
- vehicleName
- model
- chassyNumber (checked for uniqueness)
- licensePlateNumber
- dateOfBuying
- color
- year
- lastServicedDate
- lastServicedKms
- dueServiceDate
- dueServiceKms
- fuelType
- transmission
- engineCapacity
- currentKms
- notes

**Non-Updatable Fields**:
- ownerId (vehicle owner cannot change)
- dealershipId (vehicle cannot be moved between dealerships)

**Data Processing**:

1. Strings: Trim whitespace
2. Numbers: Parse as integers
3. Dates: Convert to ISO format
4. Chassy Number: Uppercase
5. License Plate: Uppercase
6. Duplicate Check: If chassy number changed, verify uniqueness at dealership

**Use Case**: 
- Update service information after maintenance
- Update current odometer reading
- Correct vehicle details
- Update maintenance schedule

---

### 6. DELETE `/api/vehicles/:vehicleId` - Delete Vehicle

**Purpose**: Delete a vehicle from the system

**Method**: DELETE

**Authentication**: Required

**Authorization**: Requester's dealership must match vehicle's dealership

**Path Parameters**:
```
vehicleId (ObjectId) - The vehicle to delete
```

**Response** - `200 OK`:

```json
{
  "message": "Vehicle deleted successfully"
}
```

**Error Responses**:

- `404 Not Found` - Vehicle doesn't exist
```json
{
  "message": "Vehicle not found"
}
```

- `403 Forbidden` - Not your dealership
```json
{
  "message": "Access denied: not your dealership"
}
```

**Implementation Details**:

1. Verify JWT token
2. Find vehicle by ID
3. Check access: vehicle's dealershipId matches requester's dealership
4. Delete vehicle from Vehicle collection
5. Note: Service requests linked to this vehicle remain (for historical records)

**Cascading Behavior**:
- Vehicle is deleted
- Service requests referring to this vehicle remain (not deleted)
- Notifications about services remain (for history)

**Use Case**: 
- Remove vehicle from dealership records
- Vehicle no longer serviced at this dealership
- Vehicle sold or discarded

---

## Workflow Examples

### Example 1: Complete Vehicle Lifecycle

```
Timeline:

Jan 15, 2024 - Vehicle Registration
POST /api/vehicles/
{
  "companyName": "Toyota",
  "vehicleName": "Camry",
  "year": 2021,
  "chassyNumber": "4T1BF1AK5CU123456",
  "licensePlateNumber": "ABC1234",
  "ownerId": "507f1f77bcf86cd799439011",
  "dealershipId": "507f1f77bcf86cd799439001",
  "currentKms": 0
}
Response: Vehicle created with ID 607f1f77bcf86cd799439021

Jan 15, 2024 - First Service Request Created
POST /api/service-requests/create
{
  "customerId": "507f1f77bcf86cd799439011",
  "vehicleId": "607f1f77bcf86cd799439021",
  "dealershipId": "507f1f77bcf86cd799439001",
  "serviceType": "Regular Maintenance"
}

Dec 15, 2024 - After First Service
PUT /api/vehicles/607f1f77bcf86cd799439021
{
  "lastServicedDate": "2024-12-15",
  "lastServicedKms": 45000,
  "dueServiceDate": "2025-06-15",
  "dueServiceKms": 55000,
  "currentKms": 45000
}
Response: Vehicle updated with service info

Jan 10, 2025 - Dashboard View
GET /api/vehicles/607f1f77bcf86cd799439021
Response: 
- Vehicle details
- Service history visible
- Current km: 47500
- Next due service: June 15, 2025 or 55000 km
```

### Example 2: Multi-Dealership Vehicle Scenario

```
Customer has vehicles at multiple dealerships:

GET /api/vehicles/customer/507f1f77bcf86cd799439011
(From Dealership A)

Response: Returns only vehicles registered at Dealership A
[
  {
    "_id": "607f1f77bcf86cd799439021",
    "companyName": "Toyota",
    "vehicleName": "Camry",
    "dealershipId": "507f1f77bcf86cd799439001"
  }
]

GET /api/vehicles/customer/507f1f77bcf86cd799439011
(From Dealership B)

Response: Returns only vehicles registered at Dealership B
[
  {
    "_id": "607f1f77bcf86cd799439022",
    "companyName": "Honda",
    "vehicleName": "Accord",
    "dealershipId": "507f1f77bcf86cd799439002"
  }
]

Note: Same customer, different vehicles at each dealership
```

### Example 3: Maintenance Schedule Tracking

```
Customer creates service request:
GET /api/vehicles/607f1f77bcf86cd799439021
Current km: 45000
Due service km: 55000 (10,000 km remaining)

After 6 months of usage:
Current km: 50000
Dealership sees: Only 5,000 km until next service due

Customer requests appointment:
POST /api/service-requests/create
{
  "vehicleId": "607f1f77bcf86cd799439021",
  "serviceType": "Regular Maintenance"
}

Service completed:
PUT /api/vehicles/607f1f77bcf86cd799439021
{
  "lastServicedDate": "2025-01-15",
  "lastServicedKms": 50000,
  "dueServiceDate": "2025-07-15",
  "dueServiceKms": 60000,
  "currentKms": 50000
}

New maintenance due: July 15, 2025 or 60,000 km
```

---

## Authorization Matrix

| Operation | Dealership | Employee | Customer |
|-----------|----------|----------|----------|
| Add vehicle | ✅ (for own dealership) | ✅ (for own dealership) | ❌ |
| Get customer vehicles | ✅ (if customer linked) | ✅ (if customer linked) | ❌ |
| Get all vehicles | ✅ (of own dealership) | ✅ (of own dealership) | ❌ |
| Get single vehicle | ✅ (if at own dealership) | ✅ (if at own dealership) | ❌ |
| Update vehicle | ✅ (if at own dealership) | ✅ (if at own dealership) | ❌ |
| Delete vehicle | ✅ (if at own dealership) | ✅ (if at own dealership) | ❌ |

---

## Data Flow Diagram

```
Vehicle Management Workflow

1. ADD VEHICLE
   Customer registers vehicle at dealership
   ↓
   POST /api/vehicles/
   ↓
   Verify: Customer linked to dealership
   Verify: Chassy number unique
   ↓
   Create vehicle document
   ↓
   Vehicle ready for service requests

2. SERVICE REQUEST CREATION
   Customer or dealership creates request
   ↓
   References vehicleId
   ↓
   Dealership accepts/completes service
   
3. UPDATE VEHICLE (After Service)
   Dealership updates:
   - Last serviced date/km
   - Due service date/km
   - Current km
   ↓
   PUT /api/vehicles/:vehicleId
   ↓
   Vehicle tracking updated
   ↓
   System knows when next service due

4. DASHBOARD VIEW
   GET /api/vehicles/ (at dealership)
   ↓
   Shows all vehicles
   ↓
   Staff can identify maintenance-due vehicles
```

---

## Service Tracking Features

### Maintenance Due Tracking

**Two-Factor Maintenance Schedule**:
1. **Time-based**: Due by specific date
2. **Distance-based**: Due at specific mileage

**Example**:
- Last service: Dec 15, 2024 at 45,000 km
- Due service: June 15, 2025 or 55,000 km (whichever comes first)

**Current Status** (Jan 15, 2025):
- Time passed: ~1 month (5 months remaining)
- Distance: 47,500 km (7,500 km remaining)
- Status: Not due yet

**Logic**: Service is due when EITHER date OR kilometers is reached

### Updating After Service

After completing a service, dealership updates:
```json
{
  "lastServicedDate": "2025-01-15",    // Service completed on this date
  "lastServicedKms": 50000,             // Vehicle had 50,000 km
  "dueServiceDate": "2025-07-15",       // Next service due 6 months later
  "dueServiceKms": 60000,               // Or when reaching 60,000 km
  "currentKms": 50000                   // Update current odometer
}
```

---

## Security Considerations

1. **Ownership Verification**: Vehicle must belong to a customer
2. **Dealership Association**: Can only manage vehicles of your dealership
3. **Uniqueness Checks**: Chassy number unique per dealership (not globally)
4. **Token Validation**: Every request validates JWT
5. **Role-Based Access**: Customers cannot manage vehicles
6. **Data Integrity**: OwnerId and dealershipId cannot be changed

---

## Performance Optimization

### Database Indexes

```javascript
// Frequently searched combinations
vehicleSchema.index({ ownerId: 1, dealershipId: 1 });
vehicleSchema.index({ licensePlateNumber: 1, dealershipId: 1 });

// These ensure:
// - Fast lookup of customer's vehicles at dealership
// - Fast lookup by license plate at dealership
```

### Query Optimization

1. **Populate Selectively**: Only include needed fields
   - Owner: name, email, phone
   - Dealership: name

2. **Sorting**: By createdAt descending (newest first)

3. **Lean Queries**: Use `.lean()` for read-only operations

---

## Error Handling

### Common Errors

1. **Vehicle Not Found** (404)
   - Cause: Invalid vehicleId
   - Solution: Verify vehicle exists and ID is correct

2. **Access Denied** (403)
   - Cause: Vehicle not at your dealership
   - Solution: Only manage vehicles at your dealership

3. **Duplicate Chassy Number** (400)
   - Cause: Chassy number already exists at this dealership
   - Solution: Verify chassy number is correct and unique

4. **Customer Not Linked** (400)
   - Cause: Customer not associated with dealership
   - Solution: Register customer at dealership first

5. **Authentication Required** (401)
   - Cause: No token in cookies
   - Solution: Login first

---

## Common Use Cases

### Use Case 1: Service Planning Dashboard
- Dealership wants to see all vehicles needing service
- Queries all vehicles at dealership
- Filters by dueServiceDate and dueServiceKms
- Plans maintenance schedule

### Use Case 2: Customer Service History
- Customer wants to see all their vehicles
- Queries GET /api/vehicles/customer/:customerId
- Sees complete vehicle list across dealerships
- Can select vehicle to create service request

### Use Case 3: Post-Service Update
- Service completed by dealership staff
- Updates vehicle with new service information
- Changes lastServicedDate, lastServicedKms
- Updates dueServiceDate, dueServiceKms
- Current km updated from service log

### Use Case 4: Vehicle Deregistration
- Vehicle sold or no longer serviced
- Dealership deletes vehicle from system
- Service history remains for records
- New vehicle can be registered

---

## Frontend Integration

### Customer Perspective

```typescript
// Get customer's vehicles
GET /api/vehicles/customer/[customerId]

// Display in vehicle selector when creating service request
const vehicles = await fetch(`/api/vehicles/customer/${userId}`);
// Shows all customer's vehicles across all dealerships
```

### Dealership Perspective

```typescript
// Get all vehicles at dealership
GET /api/vehicles/

// Display in dashboard with service status
// Identify due/overdue services
// Plan maintenance schedule
```

---

## Next Steps for Learning

1. Study how vehicles are used in service request creation
2. Review notification system for service-related events
3. Understand how customers view and manage their vehicles
4. Learn about maintenance scheduling and planning features
5. Check integration with customer dashboard

