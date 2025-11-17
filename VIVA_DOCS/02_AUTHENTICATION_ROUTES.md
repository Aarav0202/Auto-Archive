# Authentication Routes - Detailed Explanation

## Overview

The authentication module handles user registration, login, logout, password management, and account deletion. It supports three distinct user types: Customers, Dealerships, and Employees, each with different authentication flows and data structures.

## Routes Explained

### 1. POST `/api/auth/register`

**Purpose**: Register a new user (customer, dealership, or employee)

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "customer",  // or "carDealership", "employee"
  "dealershipId": "optional-for-employees"
}
```

**Flow**:
```
1. Validate all required fields (name, email, password, role)
2. Check if email already exists in ANY user collection:
   - User collection (customers and other users)
   - Dealership collection
   - Employee collection
3. If role is "employee":
   - Verify dealershipId is provided
   - Verify dealership exists
4. If role is "customer" and dealershipId provided:
   - Verify dealership exists
5. Hash password using bcrypt with salt rounds from environment
6. Create appropriate document based on role:
   - "carDealership" → Create Dealership model with empty arrays
   - Other roles → Create User model with role-specific fields
7. Save to database and return success with user ID
```

**Response** (201 Created):
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "userId",
    "role": "customer"
  }
}
```

**Error Cases**:
- Missing required fields: 400 Bad Request
- Email already exists: 400 Bad Request
- Invalid dealershipId: 400 Bad Request
- Invalid role for requirements: 400 Bad Request
- Server error: 500 Internal Server Error

**Key Implementation Details**:
```javascript
// Password hashing
const saltRounds = parseInt(process.env.SALT_ROUNDS) || 10;
const salt = await bcrypt.genSalt(saltRounds);
const hashedPass = await bcrypt.hash(password, salt);

// Dealership registration creates empty arrays for future records
{
  employees: [],
  customers: [],
  carsSold: [],
  totalCarsSold: 0
}
```

---

### 2. POST `/api/auth/login`

**Purpose**: Authenticate user and create JWT token

**Request Body**:
```json
{
  "email": "john@example.com",
  "password": "password123",
  "role": "optional-explicit-role"
}
```

**Flow**:
```
1. Validate email and password provided
2. Search for user in this order:
   a) User collection (customers/other roles)
   b) If not found → Employee collection
   c) If not found → Dealership collection
3. If role parameter provided:
   - Verify it matches found user's role
   - Reject if mismatch
4. Compare provided password with stored hash using bcrypt
5. If password valid:
   - Extract user ID, email, and role
   - Generate JWT token with 24-hour expiration
   - Create secure HTTP-only cookie with token
   - Return user object with all relevant fields
6. If password invalid:
   - Return 400 with generic message (security: don't reveal if email exists)
```

**Response** (200 OK):
```json
{
  "message": "Login successful",
  "user": {
    "id": "userId",
    "email": "john@example.com",
    "role": "customer",
    "name": "John Doe",
    "dealershipIds": ["dealId1", "dealId2"],
    "dealershipId": "dealId1"
  }
}
```

**JWT Payload**:
```javascript
{
  id: userId,
  email: userEmail,
  role: userRole,
  iat: issuedAt,
  exp: expiresIn24Hours
}
```

**Cookie Settings**:
- Name: `token`
- HttpOnly: true (prevent JavaScript access - XSS protection)
- Secure: true (only HTTPS in production)
- SameSite: strict (prevent CSRF attacks)
- Expires: 24 hours

**Special Behaviors**:
- **Customers**: `dealershipIds` is an array, `dealershipId` is first element
- **Employees**: Returns `employeeId`, `department`, single `dealershipId`
- **Dealerships**: Returns `dealershipId` equal to their own ID

---

### 3. POST `/api/auth/logout`

**Purpose**: Clear authentication cookie and end session

**Request Body**: None (uses cookie from request)

**Flow**:
```
1. Clear the "token" cookie
   - Same settings as login cookie for proper clearing:
   - HttpOnly: true
   - Secure: same as production setting
   - SameSite: strict
2. Return success message
3. Client automatically sends unauthenticated requests after this
```

**Response** (200 OK):
```json
{
  "message": "Logged out successfully"
}
```

**Technical Note**: Clearing requires matching exact cookie options used during creation.

---

### 4. GET `/api/auth/checkToken`

**Purpose**: Verify current authentication status and get user details

**Parameters**: None (uses cookie from request)

**Flow**:
```
1. Check if "token" cookie exists
   - If not → Return 401 with loggedIn: false
2. If token exists:
   - Decode JWT using JWT_SECRET
   - Extract user ID from token
3. Search for user in order:
   a) User collection → Return user fields
   b) Employee collection → Return employee fields
   c) Dealership collection → Return dealership fields
4. If user found:
   - Return 200 with loggedIn: true + user details
5. If user not found (token valid but user deleted):
   - Return 401 with loggedIn: false
6. If token invalid or expired:
   - Catch error and return 401 with loggedIn: false
```

**Response** (200 OK - Logged In):
```json
{
  "loggedIn": true,
  "user": {
    "id": "userId",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer",
    "dealershipIds": ["dealId1"],
    "dealershipId": "dealId1"
  }
}
```

**Response** (401 Unauthorized - Not Logged In):
```json
{
  "loggedIn": false
}
```

**Use Cases**:
- Page refresh: Check if user still logged in
- Application startup: Restore session automatically
- Protected routes: Verify before rendering
- Guard components: Show/hide based on authentication

---

### 5. POST `/api/auth/change-password`

**Purpose**: Change user password (requires current password verification)

**Request Body**:
```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newPassword456",
  "confirmPassword": "newPassword456"
}
```

**Authentication**: Requires valid JWT token in cookie

**Flow**:
```
1. Check if token exists
   - If not → Return 401 (not authenticated)
2. Validate all three password fields provided
3. Verify newPassword === confirmPassword
4. Validate newPassword length >= 6 characters
5. Decode JWT to get user ID
6. Find user in collections (try User → Dealership → Employee)
7. If user not found:
   - Return 404 (user deleted or token invalid)
8. Compare currentPassword with stored hash:
   - If not matching → Return 401 (incorrect password)
9. Verify newPassword is different from current:
   - If same → Return 400 (new password same as old)
10. Hash newPassword with bcrypt
11. Update user.password with new hash
12. Save to database
13. Return 200 success
```

**Response** (200 OK):
```json
{
  "message": "Password changed successfully"
}
```

**Error Cases**:
- No token: 401 Unauthorized
- Missing password fields: 400 Bad Request
- Passwords don't match: 400 Bad Request
- New password < 6 chars: 400 Bad Request
- Current password incorrect: 401 Unauthorized
- New password same as old: 400 Bad Request
- User not found: 404 Not Found
- Invalid token: 401 Unauthorized

**Security Features**:
- Current password verification prevents unauthorized changes
- Same password check prevents no-change updates
- Minimum length validation (6 characters)
- Works with all user types (uses generic search)

---

### 6. DELETE `/api/auth/delete-account`

**Purpose**: Completely delete user account and associated data

**Authentication**: Requires valid JWT token in cookie

**Flow**:

**Case 1: Dealership Account**
```
1. Find dealership by ID from token
2. If found:
   a) Delete all employees of this dealership
      - Query: { dealershipId: dealership._id }
   b) Find all customers linked to dealership
      - Query: { dealershipIds: dealership._id, role: "customer" }
   c) For each customer:
      - Remove dealership from their dealershipIds array
      - If no more dealerships → Delete customer completely
      - If still linked to others → Save and keep
   d) Delete the dealership itself
   e) Clear authentication cookie
   f) Return success message
```

**Case 2: Customer Account**
```
1. Find customer by ID from token
2. If found and role is "customer":
   a) Get all dealerships customer linked to
   b) For each dealership:
      - Remove customer from dealership.customers array
   c) Delete the customer completely
   d) Clear authentication cookie
   e) Return success message
```

**Case 3: Employee Account**
```
1. Find employee by ID from token
2. If found:
   a) Find employee's dealership
   b) Remove employee from dealership.employees array
   c) Delete the employee
   d) Clear authentication cookie
   e) Return success message
```

**Response** (200 OK):
```json
{
  "message": "Account deleted successfully"
}
```

**Cascading Effects**:
- **Dealership deletion**: Deletes all employees, updates all customers
- **Customer deletion**: Removes from all dealerships
- **Employee deletion**: Removed from parent dealership

**Error Cases**:
- No token: 401 Unauthorized
- Account not found: 404 Not Found
- Invalid token: 401 Unauthorized
- Database error: 500 Internal Server Error

---

### 7. DELETE `/api/auth/delete-customer/:customerId`

**Purpose**: Dealership or Employee deletes a customer from their system

**Parameters**:
- `customerId` (URL parameter): ID of customer to delete

**Authentication**: Requires valid JWT token in cookie

**Authorization**: Only Dealership or Employee can delete customers

**Flow**:
```
1. Check if token exists
2. Decode token to get current user ID
3. Find if current user is:
   a) A dealership → Use their ID directly
   b) An employee → Use their dealershipId
   c) Neither → Return 403 Forbidden
4. Find customer by customerId
   - If not found or not a customer → Return 404
5. Verify customer is linked to dealership:
   - Check if dealership._id in customer.dealershipIds
   - If not linked → Return 403 Forbidden
6. Remove dealership from customer's dealershipIds
7. Remove customer from dealership's customers array
8. If customer has no more dealerships → Delete customer completely
9. If customer still has other dealerships → Save and keep
10. Return 200 success
```

**Response** (200 OK):
```json
{
  "message": "Customer deleted successfully"
}
```

**Error Cases**:
- No token: 401 Unauthorized
- Not dealership or employee: 403 Forbidden
- Customer not found: 404 Not Found
- Customer not linked to dealership: 403 Forbidden
- Invalid token: 401 Unauthorized
- Database error: 500 Internal Server Error

**Key Feature**: Dealerships can only delete customers from their own list, not from other dealerships.

---

## Authentication Middleware

The routes use JWT tokens stored in HTTP-only cookies. The middleware (`authMiddleware.js`) handles token verification:

```javascript
// Middleware checks:
1. Token exists in cookies
2. Token is valid (correct signature, not expired)
3. User exists in database
4. Sets req.user with user details
```

---

## Password Hashing Details

**Why Bcrypt?**
- Automatically handles salt generation
- Configurable cost factor (salt rounds)
- Resistant to brute force attacks
- Password comparison is timing-safe

**Salt Rounds**:
- Controlled via `SALT_ROUNDS` environment variable
- Default: 10
- Higher = more secure but slower
- Typical: 10-12 rounds

---

## Security Best Practices Implemented

1. **Password Security**
   - Bcrypt hashing (not reversible)
   - Salt generation per password
   - Minimum length validation

2. **Token Security**
   - JWT with secret key
   - 24-hour expiration
   - HTTP-only cookies

3. **Authorization Checks**
   - Role-based verification
   - Ownership verification
   - Dealership association checks

4. **Error Handling**
   - Generic messages for security (don't reveal email existence)
   - Proper HTTP status codes
   - No sensitive data in error responses

---

## Common Use Cases

### Customer Registration & Login
```
1. User opens application
2. Clicks "Register as Customer"
3. Fills form: name, email, password
4. Backend creates User with role: "customer"
5. User logs in with email/password
6. Frontend stores token in cookie
7. Authenticated requests include token
```

### Dealership Registration
```
1. Dealership owner visits app
2. Clicks "Register Dealership"
3. Provides: name, email, password
4. Backend creates Dealership document
5. Can now add employees and manage customers
```

### Employee Creation
```
1. Dealership admin registers employee
2. Provides: name, email, password, dealershipId
3. Backend creates User with role: "employee"
4. Employee logged in and sees dealership data
5. Can access only dealership resources
```

### Password Change Flow
```
1. User in settings clicks "Change Password"
2. Enters current password (verification)
3. Enters new password twice (confirmation)
4. Backend validates and updates
5. User remains logged in with new credentials
```

### Account Deletion Flow
```
1. User deletes account from settings
2. Backend cascades deletion:
   - If dealership: Delete all employees & update customers
   - If customer: Remove from all dealerships
   - If employee: Remove from dealership
3. Cookie cleared automatically
4. Redirect to home page
```

---

## Token Refresh Strategy

Currently, tokens expire after 24 hours with no refresh token implementation. For production:

```javascript
// Could implement:
1. Refresh token endpoint
2. Longer expiration for refresh tokens
3. Automatic token refresh on requests near expiration
4. Logout-on-expiration notification
```

---

## Summary

The authentication module provides:
- ✅ Secure password hashing
- ✅ JWT-based token authentication
- ✅ Role-based registration
- ✅ Multi-collection user search
- ✅ Password management
- ✅ Account deletion with cascading effects
- ✅ HTTP-only secure cookies
- ✅ CSRF protection

It forms the foundation for all other authenticated operations in the application.
