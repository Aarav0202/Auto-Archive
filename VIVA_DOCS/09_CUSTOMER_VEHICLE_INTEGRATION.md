# Customer & Vehicle Routes - Integration Guide

## Overview

This document explains how Customer Routes and Vehicle Routes work together to form the core data management system of the Medical Records Manager application.

---

## System Architecture

### Data Relationships

```
Dealership
    ├─ Has many Customers (through dealershipIds)
    └─ Has many Vehicles (through dealershipId)
        
Customer
    ├─ Can link to multiple Dealerships (dealershipIds array)
    └─ Owns multiple Vehicles (ownerId)

Vehicle
    ├─ Belongs to one Customer (ownerId)
    ├─ Associated with one Dealership (dealershipId)
    └─ Subject of Service Requests
    
Service Request
    ├─ Created by Customer
    ├─ For specific Vehicle
    ├─ At specific Dealership
    └─ Notifies Dealership
```

### Data Flow Diagram

```
┌─────────────────────────────────────────────────────┐
│                  DEALERSHIP                          │
│  Manages customers and their vehicles               │
└────────────────┬────────────────────────────────────┘
                 │
        ┌────────┴────────┐
        │                 │
        ▼                 ▼
   ┌────────┐        ┌────────┐
   │CUSTOMER│        │VEHICLE │
   │        │        │        │
   │ Email  │◄───────┤ Owner  │
   │ Phone  │        │        │
   │ Address│        │Company │
   │        │        │Model   │
   └────────┘        │Chassy# │
        │            │        │
        │ Creates    │  For   │
        │ Request    │Request │
        │            └────────┘
        └──────┬──────────┘
               │
               ▼
       ┌───────────────────┐
       │ SERVICE REQUEST   │
       │ (See Route Docs)  │
       └───────────────────┘
```

---

## Customer Routes Summary

### Quick Reference

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/customers/register` | POST | Register/link customer |
| `/api/customers/` | GET | List all customers at dealership |
| `/api/customers/:customerId` | GET | Get customer + vehicles |
| `/api/customers/:customerId` | PUT | Update customer info |
| `/api/customers/:customerId` | DELETE | Remove customer from dealership |

### Key Features

1. **Multi-Dealership Support**
   - Customers have `dealershipIds` array
   - Can be registered at multiple dealerships
   - Each dealership manages their customer relationship

2. **Customer Registration**
   - New or existing customer
   - System detects duplicates by email
   - Links to new dealership if exists
   - Creates new account with default password if new

3. **Customer Management**
   - View customer list
   - Update customer details
   - Remove customer from dealership
   - Cascading deletes if customer has no dealerships

4. **Authorization**
   - Only dealership/employee can manage customers
   - Must be same dealership as customer link
   - Customers cannot access customer management routes

---

## Vehicle Routes Summary

### Quick Reference

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/vehicles/` | POST | Register new vehicle |
| `/api/vehicles/customer/:customerId` | GET | Get customer's vehicles |
| `/api/vehicles/` | GET | List all vehicles at dealership |
| `/api/vehicles/:vehicleId` | GET | Get vehicle details |
| `/api/vehicles/:vehicleId` | PUT | Update vehicle info |
| `/api/vehicles/:vehicleId` | DELETE | Remove vehicle |

### Key Features

1. **Vehicle Registration**
   - Linked to specific customer
   - Associated with specific dealership
   - Tracks detailed vehicle information
   - Prevents duplicate chassy numbers

2. **Maintenance Tracking**
   - Last serviced date and kilometers
   - Due service date and kilometers
   - Current odometer reading
   - Two-factor maintenance (date + distance)

3. **Service Planning**
   - Dealership can identify due services
   - Plan maintenance schedules
   - Track service history
   - Update after each service

4. **Authorization**
   - Only dealership/employee can manage vehicles
   - Must be same dealership as vehicle
   - Can only see/manage own dealership vehicles

---

## Integration Workflows

### Workflow 1: Complete Customer Onboarding

```
STEP 1: Register Customer
┌─────────────────────────────────────────┐
│ POST /api/customers/register             │
│ {                                       │
│   "name": "John Doe",                  │
│   "email": "john@example.com",         │
│   "dealershipId": "dealer_id_123"      │
│ }                                       │
└──────────────┬──────────────────────────┘
               ▼
         Customer created/linked
         dealershipIds: ["dealer_id_123"]
         Password: "customer1234"
               │
               ▼

STEP 2: Register Customer's Vehicle
┌─────────────────────────────────────────┐
│ POST /api/vehicles/                      │
│ {                                       │
│   "companyName": "Toyota",             │
│   "vehicleName": "Camry",              │
│   "ownerId": "customer_id_456",        │
│   "dealershipId": "dealer_id_123",     │
│   "chassyNumber": "ABC123",            │
│   "currentKms": 0                      │
│ }                                       │
└──────────────┬──────────────────────────┘
               ▼
         Vehicle created
         Associated with customer
         Associated with dealership
               │
               ▼

STEP 3: View Customer & Their Vehicles
┌─────────────────────────────────────────┐
│ GET /api/customers/customer_id_456      │
│ Returns:                                │
│ {                                       │
│   "customer": {...},                   │
│   "vehicles": [                         │
│     {vehicle from Step 2}               │
│   ]                                     │
│ }                                       │
└─────────────────────────────────────────┘
       Customer onboarding complete!
       Now ready for service requests
```

### Workflow 2: Service Request with Vehicles

```
STEP 1: Get Customer's Vehicles
┌──────────────────────────────────┐
│ GET /api/vehicles/customer/xyz   │
│ (From dealership's perspective)  │
│                                  │
│ Response: All vehicles at this   │
│ dealership owned by customer     │
└──────────────┬───────────────────┘
               ▼
         Display vehicle list

STEP 2: Customer Creates Service Request
┌──────────────────────────────────┐
│ POST /api/service-requests/      │
│ {                                │
│   "customerId": "customer_xyz",  │
│   "vehicleId": "vehicle_abc",    │
│   "dealershipId": "dealer_123",  │
│   "serviceType": "Regular"       │
│ }                                │
└──────────────┬───────────────────┘
               ▼
    Service request created
    References customer + vehicle
               │
               ▼

STEP 3: After Service Complete
┌──────────────────────────────────┐
│ PUT /api/vehicles/vehicle_abc    │
│ {                                │
│   "lastServicedDate": "2025-01-15",
│   "lastServicedKms": 50000,      │
│   "dueServiceDate": "2025-07-15", │
│   "dueServiceKms": 60000,        │
│   "currentKms": 50000            │
│ }                                │
└──────────────┬───────────────────┘
               ▼
     Vehicle tracking updated
     Ready for next service cycle
```

### Workflow 3: Multi-Dealership Customer

```
SCENARIO: Customer visits multiple dealerships

DAY 1 - At Dealership A
┌──────────────────────────────┐
│ POST /api/customers/register │
│ email: "john@example.com"    │
│ dealershipId: "dealer_A"     │
└──────────────┬───────────────┘
               ▼
    Customer created
    dealershipIds: ["dealer_A"]
               │
               ▼
    POST /api/vehicles/
    Register Toyota Camry
    ownerId: customer_id
    dealershipId: "dealer_A"
               │
               ▼

DAY 5 - At Dealership B
┌──────────────────────────────┐
│ POST /api/customers/register │
│ email: "john@example.com"    │
│ dealershipId: "dealer_B"     │
└──────────────┬───────────────┘
               ▼
    Customer already exists!
    Link to new dealership
    dealershipIds: ["dealer_A", "dealer_B"]
               │
               ▼
    POST /api/vehicles/
    Register Honda Accord
    ownerId: same customer_id
    dealershipId: "dealer_B"
               │
               ▼

RESULT:
Customer has:
  ├─ Toyota Camry at Dealership A
  └─ Honda Accord at Dealership B

Each dealership only sees their own vehicles:
  Dealership A: GET /api/vehicles/ → [Toyota Camry]
  Dealership B: GET /api/vehicles/ → [Honda Accord]

Customer can view all vehicles:
  GET /api/vehicles/customer/customer_id
  (From Dealership A): [Toyota Camry]
  (From Dealership B): [Honda Accord]
```

---

## Authorization Patterns

### Dealership Authorization

```javascript
// Dealership can:
✅ Register customers at their dealership
✅ View customers linked to their dealership
✅ Update customer information
✅ Remove customers from their dealership

✅ Add vehicles for their customers
✅ View all vehicles at their dealership
✅ Update vehicle information
✅ Delete vehicles from their dealership

❌ Access customers from other dealerships
❌ Access vehicles from other dealerships
❌ Register customers globally
❌ View other dealerships' inventory
```

### Employee Authorization

```javascript
// Employee can:
✅ Register customers at their dealership
✅ View customers linked to their dealership
✅ Update customer information
✅ Remove customers from their dealership

✅ Add vehicles for their customers
✅ View all vehicles at their dealership
✅ Update vehicle information
✅ Delete vehicles from their dealership

(Employee auth = Dealership auth)

❌ Access customers from other dealerships
❌ Access vehicles from other dealerships
```

### Customer Authorization

```javascript
// Customer can:
❌ Register other customers
❌ View other customers
❌ Update other customers
❌ Delete other customers

❌ Add vehicles
❌ View all vehicles
❌ Update vehicles
❌ Delete vehicles

✅ View their own vehicles
✅ Create service requests for their vehicles
✅ View their service request history
✅ View notifications about their services
```

---

## Error Scenarios & Solutions

### Scenario 1: Duplicate Customer Email

```
Problem:
POST /api/customers/register
{
  "email": "john@example.com",
  "dealershipId": "dealer_A"
}

Same email registered again at same dealership

Solution:
System returns: "Customer already linked to this dealership"
Status: 400 Bad Request
Action: Use UPDATE or skip if intentional
```

### Scenario 2: Customer Without Dealership

```
Problem:
POST /api/vehicles/
{
  "ownerId": "customer_without_dealership",
  "dealershipId": "dealer_A"
}

Customer not linked to dealership

Solution:
System returns: "Customer not linked to this dealership"
Status: 400 Bad Request
Action: Register customer first via /api/customers/register
```

### Scenario 3: Cross-Dealership Access

```
Problem:
Dealership A tries to access Dealership B's customer

GET /api/customers/customer_from_dealer_B

Solution:
System returns: "Access denied"
Status: 403 Forbidden
Action: User can only manage own dealership's customers
```

### Scenario 4: Duplicate Chassy Number

```
Problem:
POST /api/vehicles/
{
  "chassyNumber": "ABC123",
  "dealershipId": "dealer_A"
}

Chassy number already exists at this dealership

Solution:
System returns: "Vehicle with this chassy number already exists"
Status: 400 Bad Request
Action: Verify chassy number or update existing vehicle
```

---

## Data Validation Rules

### Customer Registration

```javascript
Required Fields:
  ✓ name (non-empty string)
  ✓ email (valid email, unique per role)
  ✓ dealershipId (must exist, valid ObjectId)

Optional Fields:
  ✓ phone (string)
  ✓ address (string)
  ✓ dateOfBirth (valid date)
  ✓ licenseNumber (string)
  ✓ preferredContact (email or phone)
  ✓ customerType (string)
  ✓ notes (string)

Auto-Generated:
  ✓ password: "customer1234" (hashed with bcrypt)
  ✓ role: "customer" (always)
  ✓ dealershipIds: [dealershipId] (array with provided id)
```

### Vehicle Registration

```javascript
Required Fields:
  ✓ companyName (non-empty, trimmed)
  ✓ vehicleName (non-empty, trimmed)
  ✓ ownerId (valid customer ID)
  ✓ dealershipId (valid dealership ID)

Optional Fields:
  ✓ model (string)
  ✓ chassyNumber (unique per dealership, uppercase)
  ✓ licensePlateNumber (uppercase)
  ✓ dateOfBuying (valid date)
  ✓ color (string)
  ✓ year (number)
  ✓ lastServicedDate (valid date)
  ✓ lastServicedKms (number)
  ✓ dueServiceDate (valid date)
  ✓ dueServiceKms (number)
  ✓ fuelType (enum: Petrol, Diesel, Electric, Hybrid, CNG, Other)
  ✓ transmission (enum: Manual, Automatic, CVT, Other)
  ✓ engineCapacity (string, e.g., "2.0L")
  ✓ currentKms (number, default: 0)
  ✓ notes (string)
```

---

## Database Query Patterns

### Efficient Queries

```javascript
// Get all customers at dealership
User.find({ dealershipIds: dealershipId, role: 'customer' })
  .select('-password')
  .populate('dealershipIds', 'name')
  .sort({ createdAt: -1 })

// Get customer with vehicles at dealership
const customer = await User.findById(customerId);
const vehicles = await Vehicle.find({
  ownerId: customerId,
  dealershipId: dealershipId
});

// Get all vehicles at dealership
Vehicle.find({ dealershipId: dealershipId })
  .populate('ownerId', 'name email phone')
  .populate('dealershipId', 'name')
  .sort({ createdAt: -1 })

// Check if customer linked to dealership
const isLinked = customer.dealershipIds.some(
  id => id.toString() === dealershipId.toString()
);
```

### Index Usage

```javascript
// These indexes improve performance:

// Customer queries
db.users.createIndex({ "dealershipIds": 1, "role": 1 })
db.users.createIndex({ "email": 1, "role": 1 })

// Vehicle queries
db.vehicles.createIndex({ "ownerId": 1, "dealershipId": 1 })
db.vehicles.createIndex({ "licensePlateNumber": 1, "dealershipId": 1 })
db.vehicles.createIndex({ "dealershipId": 1 })
```

---

## Testing Strategy

### Customer Routes Testing

```javascript
// Test 1: Register new customer
POST /api/customers/register
  ✓ Should create new customer
  ✓ Should return isNew: true
  ✓ Should hash password
  ✓ Should handle duplicate email linking

// Test 2: Get customers
GET /api/customers/
  ✓ Should require authentication
  ✓ Should only return customers at dealership
  ✓ Should exclude password
  ✓ Should populate dealershipIds with names

// Test 3: Update customer
PUT /api/customers/:customerId
  ✓ Should update allowed fields only
  ✓ Should verify dealership access
  ✓ Should not allow password change
  ✓ Should preserve dealershipIds

// Test 4: Delete customer
DELETE /api/customers/:customerId
  ✓ Should unlink from dealership if multiple
  ✓ Should delete if only one dealership
  ✓ Should cascade delete vehicles
  ✓ Should return fullyDeleted flag
```

### Vehicle Routes Testing

```javascript
// Test 1: Add vehicle
POST /api/vehicles/
  ✓ Should require valid customer
  ✓ Should verify customer linked to dealership
  ✓ Should prevent duplicate chassy numbers
  ✓ Should normalize data (uppercase, trim, etc.)

// Test 2: Get vehicles
GET /api/vehicles/
  ✓ Should only return vehicles at dealership
  ✓ Should populate owner and dealership details
  ✓ Should require authentication
  ✓ Should sort by createdAt descending

// Test 3: Update vehicle
PUT /api/vehicles/:vehicleId
  ✓ Should update service tracking fields
  ✓ Should verify dealership ownership
  ✓ Should prevent cross-dealership moves
  ✓ Should check chassy uniqueness on update

// Test 4: Delete vehicle
DELETE /api/vehicles/:vehicleId
  ✓ Should delete vehicle
  ✓ Should preserve service request history
  ✓ Should verify dealership access
```

---

## Performance Considerations

### Query Optimization

1. **Indexing Strategy**
   - Customer queries indexed on dealershipIds + role
   - Vehicle queries indexed on ownerId + dealershipId
   - License plate lookups indexed at dealership level

2. **Pagination** (if needed)
   - Limit result sets for large dealerships
   - Use `.skip()` and `.limit()`
   - Sort consistently (by createdAt)

3. **Population Strategy**
   - Only populate necessary fields
   - Dealership: name only
   - Owner: name, email, phone
   - Avoid deep nesting

### Data Volume Considerations

```
At scale:
- Dealership with 10,000 customers
- Each customer with 2-3 vehicles average
- Total vehicles: 20,000-30,000

Index ensures:
- Customer list: O(log n) instead of O(n)
- Vehicle lookup: O(log n) instead of O(n)
- Chassy number check: O(log n) instead of O(n)
```

---

## Security Best Practices

1. **Authentication**
   - All routes require JWT token
   - Token validated before authorization check
   - Token has 24-hour expiration

2. **Authorization**
   - Dealership association verified for every request
   - Cannot access customers/vehicles from other dealerships
   - Role-based restrictions (dealership/employee only)

3. **Data Protection**
   - Passwords excluded from all responses
   - Sensitive fields not exposed unnecessarily
   - String inputs trimmed and validated

4. **Validation**
   - Required fields checked
   - Data types validated
   - Enum fields restricted to allowed values
   - Dates parsed and validated

5. **Cascading Operations**
   - Deleting customer deletes their vehicles
   - Maintains referential integrity
   - Service requests preserved for history

---

## Common Questions & Answers

### Q1: Can a customer be registered at multiple dealerships?
**A**: Yes, via the `dealershipIds` array. When same email registered again, customer is linked to new dealership instead of creating duplicate.

### Q2: Can a vehicle be moved between dealerships?
**A**: No, dealershipId is immutable. To move, delete at current dealership and re-register at new dealership.

### Q3: What happens when deleting a customer linked to multiple dealerships?
**A**: Only unlinking from current dealership occurs. Customer remains linked to other dealerships.

### Q4: How are vehicles tracked for maintenance?
**A**: Two-factor tracking - by date AND by kilometers. Service due when either is reached first.

### Q5: Can customers manage their own vehicles?
**A**: Customers can view their vehicles but cannot add/edit. Only dealership/employee can manage vehicle records.

### Q6: How are chassy numbers enforced as unique?
**A**: Unique per dealership only. Same car's chassy can exist at different dealerships (multitenancy).

### Q7: What's the default customer password?
**A**: "customer1234" - must be changed on first login.

### Q8: Can customer information be updated after registration?
**A**: Yes, via PUT endpoint. Dealership staff can update customer details.

---

## Related Documentation

- **07_CUSTOMER_ROUTES_DETAILED.md** - Detailed customer route documentation
- **08_VEHICLE_ROUTES_DETAILED.md** - Detailed vehicle route documentation
- **03_SERVICE_REQUEST_ROUTES.md** - How vehicles are used in service requests
- **02_AUTHENTICATION_ROUTES.md** - How authentication works
- **06_DATABASE_MODELS.md** - User and Vehicle schema details

---

## Migration from Existing Systems

### If importing from legacy system:

```javascript
// Step 1: Bulk register customers
customers.forEach(async (customer) => {
  POST /api/customers/register {
    "name": customer.name,
    "email": customer.email,
    "dealershipId": dealershipId,
    "phone": customer.phone,
    "address": customer.address
  }
});

// Step 2: Get created customer IDs

// Step 3: Bulk register vehicles
vehicles.forEach(async (vehicle) => {
  POST /api/vehicles/ {
    "companyName": vehicle.make,
    "vehicleName": vehicle.model,
    "ownerId": customer_id_from_step2,
    "dealershipId": dealershipId,
    "chassyNumber": vehicle.vin,
    ...other_fields
  }
});

// Step 4: Verify data integrity
GET /api/customers/ → Should show all migrated customers
GET /api/vehicles/ → Should show all migrated vehicles
```

---

**Document Version**: 1.0
**Last Updated**: January 2025
**Status**: Complete & Ready for Viva

