# Customer Routes - Complete Documentation

## Overview

Customer routes handle all operations related to customer management in the dealership system. These routes allow dealerships and employees to register customers, view customer lists, fetch individual customer details with their vehicles, update customer information, and remove customers from dealerships.

### Key Concepts

- **Multi-Dealership Support**: A single customer can be linked to multiple dealerships via `dealershipIds` array
- **Role-Based Access**: Only dealerships and employees can access customer routes
- **Cascading Operations**: Deleting a customer removes their vehicles and dealership links
- **Data Privacy**: Passwords are never returned in responses

---

## Database Model: User (Customer)

### Customer Schema

```javascript
{
  _id: ObjectId,
  name: String,                    // Full name (required)
  email: String,                   // Email address (required, unique)
  password: String,                // Hashed password
  role: String,                    // Always "customer"
  dealershipIds: [ObjectId],       // Array of linked dealerships
  phone: String,                   // Contact number
  address: String,                 // Physical address
  dateOfBirth: Date,               // Date of birth
  licenseNumber: String,           // Driver's license number
  preferredContact: String,        // "phone" or "email"
  customerType: String,            // Type: "regular", "premium", etc.
  notes: String,                   // Internal notes
  createdAt: Date,                 // Account creation date
  updatedAt: Date                  // Last update date
}
```

### Example Customer Document

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "$2a$10$h.sR... (bcrypt hash)",
  "role": "customer",
  "dealershipIds": [
    "507f1f77bcf86cd799439001",
    "507f1f77bcf86cd799439002"
  ],
  "phone": "+1-555-0123",
  "address": "123 Main St, Springfield, IL 62701",
  "dateOfBirth": "1985-03-15",
  "licenseNumber": "IL2345678",
  "preferredContact": "email",
  "customerType": "premium",
  "notes": "VIP customer, handles own scheduling",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2025-01-10T14:20:00Z"
}
```

---

## Routes Reference

### 1. POST `/api/customers/register` - Register Customer

**Purpose**: Register a new customer or link an existing customer to a new dealership

**Method**: POST

**Authentication**: Not required for endpoint, but dealershipId must be valid

**Request Body**:

```json
{
  "name": "John Doe",                    // Required
  "email": "john.doe@example.com",       // Required
  "phone": "+1-555-0123",                // Optional
  "dealershipId": "507f1f77bcf86cd799439001", // Required
  "address": "123 Main St, Springfield",  // Optional
  "dateOfBirth": "1985-03-15",           // Optional
  "licenseNumber": "IL2345678",          // Optional
  "preferredContact": "email",           // Optional: "email" or "phone"
  "customerType": "premium",             // Optional
  "notes": "VIP customer"                // Optional
}
```

**Responses**:

**Success (New Customer)** - `201 Created`:
```json
{
  "message": "Customer registered successfully",
  "customer": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "role": "customer",
    "dealershipIds": ["507f1f77bcf86cd799439001"],
    "phone": "+1-555-0123",
    "address": "123 Main St, Springfield",
    "dateOfBirth": "1985-03-15",
    "licenseNumber": "IL2345678",
    "preferredContact": "email",
    "customerType": "premium",
    "notes": "VIP customer",
    "createdAt": "2025-01-15T10:30:00Z",
    "updatedAt": "2025-01-15T10:30:00Z"
  },
  "isNew": true
}
```

**Success (Existing Customer Linked)** - `201 Created`:
```json
{
  "message": "Customer linked to dealership successfully",
  "customer": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "role": "customer",
    "dealershipIds": [
      "507f1f77bcf86cd799439001",
      "507f1f77bcf86cd799439002"
    ],
    "phone": "+1-555-0123",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2025-01-15T15:45:00Z"
  },
  "isNew": false
}
```

**Error Responses**:

- `400 Bad Request` - Missing required fields or invalid dealership
```json
{
  "message": "Name and email are required"
}
```

- `400 Bad Request` - Customer already linked
```json
{
  "message": "Customer already linked to this dealership"
}
```

**Implementation Details**:

1. **Check if customer exists** by searching User collection with `role: 'customer'`
2. **If exists**:
   - Verify not already linked to dealership (check `dealershipIds`)
   - Add dealership to `dealershipIds` array
   - Add customer ID to dealership's `customers` array
   - Return `isNew: false`

3. **If new**:
   - Hash password with bcrypt (default: "customer1234")
   - Create new User document with `dealershipIds: [dealershipId]`
   - Add customer to dealership's `customers` array
   - Return `isNew: true`

**Use Case**: Dealership staff registers new customers when they visit for service

---

### 2. GET `/api/customers/` - Get All Customers for Dealership

**Purpose**: Retrieve all customers linked to the requesting dealership

**Method**: GET

**Authentication**: Required (JWT token in cookies)

**Authorization**: 
- Dealership can view their own customers
- Employee can view customers of their dealership

**Query Parameters**: None

**Response** - `200 OK`:

```json
{
  "customers": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "role": "customer",
      "dealershipIds": [
        {
          "_id": "507f1f77bcf86cd799439001",
          "name": "Main Dealership"
        }
      ],
      "phone": "+1-555-0123",
      "address": "123 Main St, Springfield",
      "licenseNumber": "IL2345678",
      "preferredContact": "email",
      "customerType": "premium",
      "createdAt": "2024-01-15T10:30:00Z"
    },
    {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Jane Smith",
      "email": "jane.smith@example.com",
      "role": "customer",
      "dealershipIds": [
        {
          "_id": "507f1f77bcf86cd799439001",
          "name": "Main Dealership"
        }
      ],
      "phone": "+1-555-0456",
      "createdAt": "2024-02-20T14:15:00Z"
    }
  ],
  "totalCustomers": 2
}
```

**Error Responses**:

- `401 Unauthorized` - No token
```json
{
  "message": "Authentication required"
}
```

- `401 Unauthorized` - Invalid token
```json
{
  "message": "Invalid authentication token"
}
```

- `403 Forbidden` - Not a dealership or employee
```json
{
  "message": "Only dealerships and employees can view customer list"
}
```

**Implementation Details**:

1. Verify JWT token from cookies
2. Determine if requester is dealership or employee
3. Get their dealershipId
4. Query: `User.find({ dealershipIds: dealershipId, role: 'customer' })`
5. Populate dealershipIds with name only (security)
6. Sort by createdAt descending (newest first)
7. Exclude password from response

**Use Case**: Dealership dashboard showing all registered customers

---

### 3. GET `/api/customers/:customerId` - Get Single Customer with Vehicles

**Purpose**: Retrieve a specific customer's details and their vehicles at the dealership

**Method**: GET

**Authentication**: Required

**Authorization**: Requester's dealership must be in customer's dealershipIds

**Path Parameters**:
```
customerId (ObjectId) - The customer to retrieve
```

**Response** - `200 OK`:

```json
{
  "customer": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "role": "customer",
    "dealershipIds": [
      {
        "_id": "507f1f77bcf86cd799439001",
        "name": "Main Dealership"
      },
      {
        "_id": "507f1f77bcf86cd799439002",
        "name": "Downtown Service"
      }
    ],
    "phone": "+1-555-0123",
    "address": "123 Main St, Springfield",
    "dateOfBirth": "1985-03-15",
    "licenseNumber": "IL2345678",
    "preferredContact": "email",
    "customerType": "premium",
    "notes": "VIP customer",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2025-01-10T14:20:00Z"
  },
  "vehicles": [
    {
      "_id": "607f1f77bcf86cd799439021",
      "companyName": "Toyota",
      "vehicleName": "Camry",
      "licensePlateNumber": "AB123CD",
      "year": 2022,
      "currentKms": 45000,
      "lastServicedDate": "2024-12-15",
      "dueServiceDate": "2025-03-15",
      "createdAt": "2024-01-20T10:00:00Z"
    },
    {
      "_id": "607f1f77bcf86cd799439022",
      "companyName": "Honda",
      "vehicleName": "Accord",
      "licensePlateNumber": "XY789ZW",
      "year": 2021,
      "currentKms": 67000,
      "lastServicedDate": "2024-11-10",
      "dueServiceDate": "2025-02-10",
      "createdAt": "2024-03-10T15:30:00Z"
    }
  ]
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
2. Find customer by ID
3. Check access: customer's dealershipIds must include requester's dealership
4. Query vehicles: `Vehicle.find({ ownerId: customerId, dealershipId: dealershipId })`
5. Return customer details and vehicle list

**Use Case**: Dealership staff viewing customer profile and their vehicles

---

### 4. PUT `/api/customers/:customerId` - Update Customer

**Purpose**: Update customer information (name, phone, address, etc.)

**Method**: PUT

**Authentication**: Required

**Authorization**: Requester's dealership must be in customer's dealershipIds

**Path Parameters**:
```
customerId (ObjectId) - The customer to update
```

**Request Body** (all fields optional):

```json
{
  "name": "John Doe Jr.",
  "email": "john.doe@example.com",
  "phone": "+1-555-9999",
  "address": "456 Oak Ave, Springfield",
  "dateOfBirth": "1985-03-15",
  "licenseNumber": "IL2345679",
  "preferredContact": "phone",
  "customerType": "regular",
  "notes": "Updated notes"
}
```

**Response** - `200 OK`:

```json
{
  "message": "Customer updated",
  "customer": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe Jr.",
    "email": "john.doe@example.com",
    "role": "customer",
    "dealershipIds": [
      {
        "_id": "507f1f77bcf86cd799439001",
        "name": "Main Dealership"
      }
    ],
    "phone": "+1-555-9999",
    "address": "456 Oak Ave, Springfield",
    "dateOfBirth": "1985-03-15",
    "licenseNumber": "IL2345679",
    "preferredContact": "phone",
    "customerType": "regular",
    "notes": "Updated notes",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2025-01-15T16:00:00Z"
  }
}
```

**Error Responses**:

- `404 Not Found` - Customer doesn't exist
```json
{
  "message": "Customer not found"
}
```

- `403 Forbidden` - Access denied
```json
{
  "message": "Access denied"
}
```

**Allowed Fields for Update**:
- name
- email
- phone
- address
- dateOfBirth (converted to Date)
- licenseNumber
- preferredContact
- customerType
- notes

**Non-Updatable Fields**:
- role (always "customer")
- dealershipIds (use separate endpoint if needed)
- password (use auth change-password endpoint)

**Use Case**: Dealership updating customer contact information

---

### 5. DELETE `/api/customers/:customerId` - Delete Customer

**Purpose**: Remove customer from dealership (unlink) or delete completely if no other dealerships

**Method**: DELETE

**Authentication**: Required

**Authorization**: Requester's dealership must be in customer's dealershipIds

**Path Parameters**:
```
customerId (ObjectId) - The customer to delete
```

**Response - Customer Unlinked (Has Other Dealerships)** - `200 OK`:

```json
{
  "message": "Customer unlinked from dealership",
  "fullyDeleted": false
}
```

**Response - Customer Fully Deleted (No Other Dealerships)** - `200 OK`:

```json
{
  "message": "Customer deleted completely (no more dealerships)",
  "fullyDeleted": true
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
  "message": "Customer not linked to your dealership"
}
```

**Cascading Operations**:

1. **When customer is unlinked** (`fullyDeleted: false`):
   - Remove dealershipId from customer's `dealershipIds` array
   - Delete all vehicles owned by customer at this dealership
   - Remove customer ID from dealership's `customers` array
   - Save customer (still exists with other dealerships)

2. **When customer is fully deleted** (`fullyDeleted: true`):
   - Remove dealershipId from customer's `dealershipIds` array
   - Delete all vehicles owned by customer at this dealership
   - Remove customer ID from dealership's `customers` array
   - If customer has NO MORE dealerships:
     - Delete customer completely from User collection
     - Delete all service requests by this customer

**Use Case**: 

- Dealership removing customer from their roster
- Multi-dealership customer scenario where customer leaves one dealership but continues with others

---

## Workflow Examples

### Example 1: New Customer Registration

```
Step 1: Dealership staff goes to "Add Customer" form
Step 2: Fills in customer details (name, email, phone, etc.)
Step 3: Submits form

API Call:
POST /api/customers/register
{
  "name": "Sarah Johnson",
  "email": "sarah.j@example.com",
  "phone": "+1-555-5678",
  "dealershipId": "507f1f77bcf86cd799439001",
  "address": "789 Pine St, Springfield",
  "licenseNumber": "IL3456789"
}

Response:
{
  "message": "Customer registered successfully",
  "customer": {...},
  "isNew": true
}

Step 4: Customer created with default password "customer1234"
Step 5: Dashboard shows new customer in list
Step 6: Customer can now create service requests at this dealership
```

### Example 2: Customer Linked to Multiple Dealerships

```
Day 1:
- Customer registered at Dealership A
- dealershipIds = [dealership_A_id]

Day 5:
- Same customer visits Dealership B
- Dealership B staff registers same email
- Customer already exists, so just linked

POST /api/customers/register
{
  "name": "Sarah Johnson",
  "email": "sarah.j@example.com",
  "dealershipId": "507f1f77bcf86cd799439002"
}

Response:
{
  "message": "Customer linked to dealership successfully",
  "customer": {
    ...
    "dealershipIds": [
      "507f1f77bcf86cd799439001",  // Dealership A
      "507f1f77bcf86cd799439002"   // Dealership B
    ]
  },
  "isNew": false
}

Result:
- Customer now can create service requests at both dealerships
- Dealership A sees customer in their list
- Dealership B sees customer in their list
```

### Example 3: Delete Customer from One Dealership (Keep at Another)

```
Customer Sarah linked to:
- Dealership A
- Dealership B

Dealership A wants to remove Sarah from their records:

DELETE /api/customers/507f1f77bcf86cd799439011

Backend:
1. Find customer (found, linked to both dealerships)
2. Get requester dealershipId (Dealership A)
3. Remove dealershipId from dealershipIds array
4. Delete all vehicles owned by Sarah at Dealership A
5. dealershipIds now = [dealership_B_id]
6. Customer still exists

Response:
{
  "message": "Customer unlinked from dealership",
  "fullyDeleted": false
}

Result:
- Sarah still linked to Dealership B
- Sarah's vehicles at Dealership A are deleted
- Sarah's service requests at Dealership A still exist (historical)
- Dealership A no longer sees Sarah in their customer list
- Dealership B still has Sarah
```

---

## Authorization Matrix

| Operation | Dealership | Employee | Customer |
|-----------|----------|----------|----------|
| Register customer | ✅ (for own dealership) | ❌ | ❌ |
| View all customers | ✅ (of own dealership) | ✅ (of own dealership) | ❌ |
| View single customer | ✅ (if linked to dealership) | ✅ (if linked to dealership) | ❌ |
| Update customer | ✅ (if linked to dealership) | ✅ (if linked to dealership) | ❌ |
| Delete customer | ✅ (unlink from dealership) | ✅ (unlink from dealership) | ❌ |

---

## Data Flow Diagram

```
Dealership/Employee Request
        ↓
Verify JWT Token
        ↓
Determine Role (Dealership or Employee)
        ↓
Get dealershipId
        ↓
Authorization Check:
  - Customer dealershipIds includes requester's dealershipId?
        ↓
    YES → Proceed
    NO  → Return 403 Forbidden
        ↓
Execute Operation:
  - Register: Create new or link existing
  - Get All: Fetch customers list
  - Get One: Fetch customer + vehicles
  - Update: Modify allowed fields
  - Delete: Unlink or completely delete
        ↓
Return Response (with customer data, exclude password)
```

---

## Security Considerations

1. **Password Never Returned**: All responses exclude password field
2. **Ownership Verification**: Check customer is linked to requester's dealership
3. **Cascading Deletions**: Deleting customer removes their vehicles
4. **Token Validation**: Every request validates JWT signature
5. **Role Checking**: Only dealships/employees can manage customers
6. **Email Uniqueness**: Email checked across all customers
7. **Dealership Association**: Customer must be linked to dealership they're being registered at

---

## Error Handling

### Common Errors

1. **Authentication Required** (401)
   - Cause: No token in cookies
   - Solution: User must login first

2. **Invalid Token** (401)
   - Cause: Token expired or tampered
   - Solution: User must login again

3. **Access Denied** (403)
   - Cause: Customer not linked to your dealership
   - Solution: Only manage customers linked to your dealership

4. **Customer Not Found** (404)
   - Cause: Invalid customerId
   - Solution: Verify customer exists

5. **Already Linked** (400)
   - Cause: Customer already registered at this dealership
   - Solution: Use update endpoint instead

---

## Performance Optimization

1. **Indexes**:
   - `email` + `role` for quick customer lookup
   - `dealershipIds` for filtering by dealership

2. **Populating Data**:
   - Only populate dealershipIds (avoid full documents)
   - Limit fields in responses

3. **Sorting**:
   - By createdAt descending (newest first)

4. **Query Optimization**:
   - Use `.select('-password')` to exclude password
   - Use `.lean()` if write not needed

---

## Common Use Cases

### Use Case 1: Onboarding New Customer
- Dealership staff registers customer
- Customer receives default password
- Customer can login and create service requests

### Use Case 2: Multi-Dealership Support
- Customer visits different dealerships
- Each dealership registers/links customer
- Customer has unified account across dealerships
- Each dealership only sees their own vehicles for customer

### Use Case 3: Customer Information Update
- Dealership updates customer phone number
- Next time customer contacts dealership, new number is in system

### Use Case 4: Removing Inactive Customer
- Dealership removes customer from their records
- If customer linked to other dealerships, they remain there
- If customer not linked to any dealership, account deleted

---

## Next Steps for Learning

1. Review `07_VEHICLE_ROUTES_DETAILED.md` for vehicle management
2. Study how service requests link customers to dealerships
3. Understand notification system for customer events
4. Check frontend implementation for customer registration forms

