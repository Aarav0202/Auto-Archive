# Quick Reference Guide - Customer & Vehicle Routes

## 🚀 Super Quick Overview

### Customer Routes (5 endpoints)
```
POST   /api/customers/register              Register/link customer
GET    /api/customers/                       List dealership customers
GET    /api/customers/:customerId            Get customer + vehicles
PUT    /api/customers/:customerId            Update customer
DELETE /api/customers/:customerId            Delete/unlink customer
```

### Vehicle Routes (6 endpoints)
```
POST   /api/vehicles/                        Add vehicle
GET    /api/vehicles/customer/:customerId    Get customer's vehicles
GET    /api/vehicles/                        Get dealership's vehicles
GET    /api/vehicles/:vehicleId              Get vehicle details
PUT    /api/vehicles/:vehicleId              Update vehicle
DELETE /api/vehicles/:vehicleId              Delete vehicle
```

---

## 📋 Request/Response Quick Sheets

### Register Customer

```javascript
POST /api/customers/register

REQUEST:
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1-555-0123",
  "dealershipId": "dealer_id_123",
  "address": "123 Main St",
  "licenseNumber": "ABC123"
}

RESPONSE (201):
{
  "message": "Customer registered successfully",
  "customer": { ...customer data... },
  "isNew": true
}
```

### Add Vehicle

```javascript
POST /api/vehicles/

REQUEST:
{
  "companyName": "Toyota",
  "vehicleName": "Camry",
  "ownerId": "customer_id_456",
  "dealershipId": "dealer_id_123",
  "chassyNumber": "ABC123",
  "licensePlateNumber": "ABC1234",
  "currentKms": 0
}

RESPONSE (201):
{
  "message": "Vehicle added successfully",
  "vehicle": { ...vehicle data... }
}
```

### Get Customer with Vehicles

```javascript
GET /api/customers/:customerId

RESPONSE (200):
{
  "customer": { ...customer data... },
  "vehicles": [
    { ...vehicle1... },
    { ...vehicle2... }
  ]
}
```

### Get All Vehicles at Dealership

```javascript
GET /api/vehicles/

RESPONSE (200):
{
  "vehicles": [
    {
      "_id": "vehicle_id_1",
      "companyName": "Toyota",
      "vehicleName": "Camry",
      "licensePlateNumber": "ABC1234",
      "ownerId": { "name": "John Doe", ... },
      ...
    },
    ...
  ],
  "count": 5
}
```

### Update Vehicle

```javascript
PUT /api/vehicles/:vehicleId

REQUEST:
{
  "currentKms": 50000,
  "lastServicedDate": "2025-01-15",
  "lastServicedKms": 50000,
  "dueServiceDate": "2025-07-15",
  "dueServiceKms": 60000
}

RESPONSE (200):
{
  "message": "Vehicle updated successfully",
  "vehicle": { ...updated vehicle... }
}
```

---

## ⚡ Common Error Codes

### 400 Bad Request
```
"Name and email are required"
"Customer already linked to this dealership"
"Vehicle with this chassy number already exists"
"Customer not linked to this dealership"
"Owner ID and dealership ID are required"
```

### 401 Unauthorized
```
"Authentication required"
"Invalid authentication token"
```

### 403 Forbidden
```
"Access denied"
"Only dealerships and employees can add vehicles"
"Customer not linked to your dealership"
"Access denied: not your dealership"
```

### 404 Not Found
```
"Customer not found"
"Vehicle not found"
```

---

## 🔐 Authorization Quick Matrix

### Customer Routes - Who Can Access?

| Action | Dealership | Employee | Customer |
|--------|----------|----------|----------|
| Register | ✅ | ❌ | ❌ |
| Get List | ✅ | ✅ | ❌ |
| Get One | ✅ | ✅ | ❌ |
| Update | ✅ | ✅ | ❌ |
| Delete | ✅ | ✅ | ❌ |

### Vehicle Routes - Who Can Access?

| Action | Dealership | Employee | Customer |
|--------|----------|----------|----------|
| Add | ✅ | ✅ | ❌ |
| Get Customer's | ✅ | ✅ | ❌ |
| Get All | ✅ | ✅ | ❌ |
| Get One | ✅ | ✅ | ❌ |
| Update | ✅ | ✅ | ❌ |
| Delete | ✅ | ✅ | ❌ |

---

## 📊 Database Schemas Quick View

### Customer (User Model)

```javascript
{
  _id: ObjectId,
  name: String,              // Required
  email: String,             // Required, unique per role
  password: String,          // Hashed with bcrypt
  role: "customer",          // Always "customer"
  dealershipIds: [ObjectId], // Array of dealerships
  phone: String,
  address: String,
  dateOfBirth: Date,
  licenseNumber: String,
  preferredContact: String,
  customerType: String,
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Vehicle

```javascript
{
  _id: ObjectId,
  
  // Required
  companyName: String,       // Toyota, Honda, etc.
  vehicleName: String,       // Camry, Accord, etc.
  ownerId: ObjectId,         // Customer
  dealershipId: ObjectId,    // Dealership
  
  // Optional but important
  chassyNumber: String,      // Unique per dealership
  licensePlateNumber: String,
  currentKms: Number,
  
  // Service tracking
  lastServicedDate: Date,
  lastServicedKms: Number,
  dueServiceDate: Date,
  dueServiceKms: Number,
  
  // Vehicle details
  model: String,
  dateOfBuying: Date,
  color: String,
  year: Number,
  fuelType: String,          // Petrol, Diesel, etc.
  transmission: String,      // Manual, Automatic, etc.
  engineCapacity: String,    // "2.0L", "2000cc"
  notes: String,
  
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🎯 Workflow Quick Steps

### Onboard New Customer

```
1. POST /api/customers/register
   └─ Creates customer OR links to new dealership
   
2. POST /api/vehicles/
   └─ Register customer's vehicle
   
3. GET /api/customers/:customerId
   └─ View customer + vehicles
   
4. Now customer can create service requests!
```

### Handle Service & Update Tracking

```
1. Service request created by customer
   
2. Dealership accepts and provides time
   
3. After service completed:
   PUT /api/vehicles/:vehicleId
   {
     "lastServicedDate": "2025-01-15",
     "lastServicedKms": 50000,
     "dueServiceDate": "2025-07-15",
     "dueServiceKms": 60000,
     "currentKms": 50000
   }
   
4. Vehicle tracking updated
   Dashboard shows next service due
```

---

## 🔄 Multi-Dealership Scenarios

### Scenario 1: Customer at Multiple Dealerships

```
Day 1: Register at Dealership A
POST /api/customers/register
{
  "email": "john@example.com",
  "dealershipId": "dealer_A_id"
}
→ New customer created

Day 5: Same customer at Dealership B
POST /api/customers/register
{
  "email": "john@example.com",
  "dealershipId": "dealer_B_id"
}
→ Existing customer linked (isNew: false)

Result:
customer.dealershipIds = ["dealer_A_id", "dealer_B_id"]

Each dealership sees only their vehicles:
GET /api/vehicles/          (at dealer A)
→ [Toyota Camry]

GET /api/vehicles/          (at dealer B)
→ [Honda Accord]
```

---

## 💾 Important Data Rules

### Customer Registration Rules
- ✅ Email must be provided
- ✅ Name must be provided
- ✅ DealershipId must be valid
- ✅ If email exists: link to new dealership (not duplicate)
- ✅ Default password: "customer1234" (hashed)
- ✅ Must change password on first login

### Vehicle Registration Rules
- ✅ CompanyName required
- ✅ VehicleName required
- ✅ Customer must exist
- ✅ Customer must be linked to dealership
- ✅ Chassy number must be unique PER DEALERSHIP (not globally)
- ✅ Cannot move vehicle between dealerships

### Update Rules
- ✅ Can update allowed fields only
- ✅ Cannot change ownerId (customer)
- ✅ Cannot change dealershipId (dealership)
- ✅ Cannot change password here (use auth route)
- ✅ Cannot change role

---

## 🔍 Quick Troubleshooting

### "Customer not found" Error
**Cause**: Invalid customerId in request
**Solution**: Verify customer exists first
```javascript
GET /api/customers/  // Check if customer in list
```

### "Customer not linked to this dealership" Error
**Cause**: Customer not associated with requesting dealership
**Solution**: Register customer first
```javascript
POST /api/customers/register  // Link customer
```

### "Vehicle with this chassy number already exists" Error
**Cause**: Chassy number not unique at dealership
**Solution**: Check existing vehicles or update one
```javascript
GET /api/vehicles/  // See all vehicles
```

### "Access denied" Error
**Cause**: Trying to access from different dealership
**Solution**: Only manage your own dealership's resources

### "Only dealerships and employees can add vehicles" Error
**Cause**: Customer trying to add vehicle
**Solution**: Only dealership/employee can add vehicles

---

## 🚨 Important Security Notes

✅ **Always validate token** - Required for all routes
✅ **Verify dealership association** - Check customer/vehicle links
✅ **No password in responses** - Never return hashed passwords
✅ **Unique indexes** - Chassy per dealership, email per role
✅ **Cascading deletes** - Deleting customer deletes vehicles
✅ **Bcrypt hashing** - Passwords always hashed
✅ **Role-based access** - Different permissions by role

---

## 📞 Quick Integration with Service Requests

When creating service request:
```javascript
POST /api/service-requests/create

{
  "customerId": "...",       // From customer registration
  "vehicleId": "...",        // From vehicle registration
  "dealershipId": "...",     // Customer's dealership
  "serviceType": "Regular"
}
```

After service completes:
```javascript
PUT /api/vehicles/:vehicleId

{
  "lastServicedDate": "2025-01-15",
  "lastServicedKms": 50000,
  "dueServiceDate": "2025-07-15",
  "dueServiceKms": 60000
}
```

---

## 📚 Related Routes to Know

### Authentication (Before Customer Routes)
```
POST /api/auth/register       // Create user account
POST /api/auth/login          // Get JWT token
POST /api/auth/logout         // Clear session
GET /api/auth/checkToken      // Verify session
```

### Service Requests (After Customer & Vehicle Routes)
```
POST /api/service-requests/create
GET /api/service-requests/dealership/pending-requests
PUT /api/service-requests/dealership/accept-request/:id
PUT /api/service-requests/dealership/reject-request/:id
```

---

## 💡 Pro Tips

1. **Always register customer before vehicle**
   - Vehicle requires valid ownerId

2. **Check dealership exists first**
   - Required for both customer and vehicle registration

3. **Use GET endpoints to verify before DELETE**
   - Prevents accidental deletions

4. **Update vehicle after every service**
   - Keeps maintenance tracking accurate

5. **Use lastServicedDate + lastServicedKms**
   - Plan maintenance by time AND distance

6. **Handle multi-dealership in frontend**
   - Customer may be linked to multiple dealerships
   - Each dealership sees only their data

7. **Validate email uniqueness**
   - Email must be unique per role
   - System handles linking if duplicate

8. **Use populated fields in responses**
   - Owner details populated in vehicle list
   - Dealership details populated in customer list

---

## 🎓 For Viva Exam

### Memorize These

1. **5 Customer Routes**
2. **6 Vehicle Routes**
3. **2-Factor Maintenance** (date + distance)
4. **Authorization Rules** (dealership-specific access)
5. **Cascading Deletes** (customer → vehicles)
6. **Multi-Dealership** (dealershipIds array)

### Be Able to Explain

1. How customers register and link to dealerships
2. How vehicles are managed per dealership
3. Why chassy number is unique per dealership
4. How maintenance is tracked
5. Authorization checks at each route
6. Error scenarios and handling

### Draw & Explain

1. Customer-Vehicle-Dealership relationship diagram
2. Multi-dealership customer scenario
3. Complete onboarding workflow
4. Authorization matrix for routes

---

## 📖 For Complete Details

Refer to full documentation:
- **07_CUSTOMER_ROUTES_DETAILED.md** - Complete customer route docs
- **08_VEHICLE_ROUTES_DETAILED.md** - Complete vehicle route docs
- **09_CUSTOMER_VEHICLE_INTEGRATION.md** - Integration patterns

---

**Quick Reference Version**: 1.0
**Last Updated**: January 2025
**Status**: Ready for Quick Review & Viva

