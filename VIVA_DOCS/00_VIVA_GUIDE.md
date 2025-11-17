# Medical Records Manager - Complete Viva Guide

## Quick Navigation

This folder contains comprehensive documentation for the Medical Records Manager project viva:

1. **01_PROJECT_OVERVIEW.md** - High-level project description and architecture
2. **02_AUTHENTICATION_ROUTES.md** - Registration, login, password management
3. **03_SERVICE_REQUEST_ROUTES.md** - Core business logic for service requests
4. **04_TECH_STACK_CHOICES.md** - Technology decisions and why we chose them
5. **05_CUSTOMER_DEALERSHIP_ROUTES.md** - Customer and dealership management
6. **06_DATABASE_MODELS.md** - Mongoose schemas and relationships
7. **07_CUSTOMER_ROUTES_DETAILED.md** - Complete customer management documentation
8. **08_VEHICLE_ROUTES_DETAILED.md** - Complete vehicle management documentation
9. **09_CUSTOMER_VEHICLE_INTEGRATION.md** - How customers and vehicles work together

---

## Project at a Glance

### What is Medical Records Manager?

A web application for managing service requests, appointments, and customer relationships in car dealerships and service centers.

**Key Users**:
- Customers: Request services, track appointments
- Dealerships: Accept/reject requests, manage schedules, track completion
- Employees: Handle day-to-day operations

### Tech Stack

| Component | Technology |
|-----------|-----------|
| **Frontend** | Next.js 15.4.6 + React 19.1.0 + TypeScript + Tailwind CSS + Radix UI |
| **Backend** | Express.js 5.1.0 + Node.js |
| **Database** | MongoDB with Mongoose ODM |
| **Authentication** | JWT tokens + HTTP-only cookies |
| **Password Security** | Bcrypt (salt rounds: 10-12) |

### Core Features

1. **Multi-Role Authentication**
   - Customers, Dealerships, Employees
   - JWT-based token management
   - Secure password hashing

2. **Service Request Lifecycle**
   - Create → Pending
   - Accept/Reject
   - Schedule confirmation
   - Timeline tracking (Scheduled → In Service → Quality Check → Ready → Picked Up)
   - Completion notification

3. **Notification System**
   - Real-time notifications for all service events
   - Automatic notification creation
   - Read/unread tracking
   - Notification types: acceptance, rejection, time change, status update, completion

4. **Customer Management**
   - Profile management
   - Vehicle registration
   - Multiple dealership links
   - Service history tracking

5. **Dealership Management**
   - Employee management
   - Customer management
   - Service definition and tracking
   - Analytics and reporting

---

## Database Architecture

### Key Collections

```
User (Customers + Other Users)
  ├─ Can have multiple dealershipIds
  └─ Fields: name, email, password, phone, address, licenseNumber, etc.

Dealership
  ├─ Multiple employees
  ├─ Multiple customers
  ├─ Multiple services
  └─ Fields: name, email, password, address, licenseNumber, etc.

Employee
  ├─ Linked to one dealership
  └─ Fields: name, email, employeeId, department, position, etc.

Vehicle
  ├─ Belongs to customer
  ├─ May be linked to dealership
  └─ Service history tracking

ServiceRequest (Core Business Logic)
  ├─ Links: customer, dealership, vehicle
  ├─ Status: Pending → Accepted → Rejected → Completed
  ├─ Timeline: Scheduled → In Service → QC → Ready → Picked Up
  └─ Notifications created at each stage

Notification
  ├─ Recipient (customer)
  ├─ Dealership (sender)
  ├─ Type: acceptance, rejection, time change, status update, completion
  └─ Read/unread tracking

Service
  └─ Offered by dealership

Booking
  └─ Appointment scheduling

Promotion & NewCarLaunch
  └─ Marketing and announcements
```

---

## API Routes Overview

### Authentication Routes (`POST /api/auth/`)
- `register` - Create new user account
- `login` - Authenticate and get JWT token
- `logout` - Clear session
- `checkToken` - Verify current session
- `change-password` - Update password
- `delete-account` - Delete account and associated data

### Service Request Routes (`/api/service-requests/`)
- `POST create` - Customer creates request
- `GET dealership/pending-requests` - Get pending for dealership
- `GET dealership/scheduled-services` - Get accepted and scheduled
- `PUT accept-request` - Dealership accepts
- `PUT reject-request` - Dealership rejects
- `PUT update-schedule` - Change appointment time
- `PUT update-appointment-status` - Track progress through stages
- `PUT complete` - Mark service as done

### Customer Routes (`/api/customers/`)
- Profile management (read/update)
- Vehicle registration and management
- Service request creation
- Notification management

### Dealership Routes (`/api/dealership/`)
- Profile management
- Employee management (add, remove, list)
- Customer management (add, remove, list)
- Service management (add, edit, list)
- Analytics and reporting

### Notification Routes (`/api/notifications/`)
- Get all notifications
- Mark as read
- Delete notifications

---

## Common Workflows

### Workflow 1: Customer Service Request Creation

```
1. Customer logs in
   → GET /api/auth/checkToken (verify session)
   → Returns: user profile, dealershipIds, etc.

2. Customer navigates to "Create Service Request"
   → GET /api/vehicles (fetch customer's vehicles)
   → Displays: all registered vehicles

3. Customer fills form:
   - Vehicle selection
   - Service type
   - Preferred date/time
   - Dealership selection

4. Customer submits
   → POST /api/service-requests/create
   → Backend: Creates ServiceRequest with status "Pending"
   → Backend: Sends notification to dealership

5. Dealership receives notification
   → GET /api/service-requests/dealership/pending-requests
   → Shows: new pending request in list
```

### Workflow 2: Dealership Accepts and Tracks Service

```
1. Dealership sees pending request
   → GET /api/service-requests/dealership/pending-requests

2. Dealership accepts request
   → PUT /api/service-requests/accept-request/:requestId
   → Provides: confirmed date and time
   → Backend: Updates status to "Accepted"
   → Backend: Sends notification to customer

3. Customer receives notification
   → GET /api/notifications/
   → Shows: "Service accepted for [date] [time]"

4. Dealership may change schedule
   → PUT /api/service-requests/update-schedule/:requestId
   → Provides: new date/time
   → Backend: Sends notification with old/new times to customer

5. Service appointment arrives
   → Dealership updates status through timeline
   → PUT /api/service-requests/update-appointment-status/:requestId
   → Stages: Scheduled → In Service → Quality Check → Ready → Picked Up
   → Each stage sends notification to customer

6. Service marked complete
   → Status automatically set to "Completed" when stage="Picked Up"
   → OR: PUT /api/service-requests/:requestId/complete
   → Sends: "Service Completed" notification to customer

7. Customer sees completion notification
   → GET /api/notifications/
   → Shows: completion message
```

---

## Authentication & Authorization

### Authentication Methods

1. **Registration** (`POST /auth/register`)
   - Create new account
   - Provide: name, email, password, role
   - Password hashed with bcrypt (salt rounds: 10)
   - Email checked for uniqueness

2. **Login** (`POST /auth/login`)
   - Verify email exists in correct collection
   - Compare password with bcrypt
   - Generate JWT token (24-hour expiration)
   - Store in HTTP-only cookie

3. **Verification**
   - Every authenticated request extracts token from cookie
   - Middleware verifies JWT signature
   - Sets req.user with user details
   - Returns 401 if invalid/expired

### Authorization Rules

| Action | Customer | Dealership | Employee |
|--------|----------|-----------|----------|
| Create service request | Own vehicle | ❌ | ❌ |
| Accept service request | ❌ | Own request | ❌ |
| View customer profile | Own data | ❌ | ❌ |
| Manage employees | ❌ | Own dealership | ❌ |
| Remove customer | ❌ | From own dealership | From own dealership |

---

## Notification System

### How Notifications Work

1. **Creation**
   - Backend endpoint triggers notification
   - Calls `notifyServiceAccepted()`, `notifyServiceRejected()`, etc.
   - Notification saved to MongoDB with:
     - recipientId: customer ID
     - dealershipId: dealership ID
     - type: notification type
     - message: human-readable message

2. **Retrieval**
   ```
   GET /api/notifications/
   → Returns: all notifications for current user
   → Sorted: newest first
   → Can filter by: type, isRead
   ```

3. **Marking as Read**
   ```
   PUT /api/notifications/:notificationId/read
   → Sets: isRead = true, readAt = current time
   ```

### Notification Types

| Type | Trigger | Message |
|------|---------|---------|
| service_accepted | Dealership accepts | "Your service for [Vehicle] is accepted for [Date] [Time]" |
| service_rejected | Dealership rejects | "Your service request was rejected. Reason: [reason]" |
| service_time_changed | Dealership changes time | "Schedule changed from [Old] to [New]" |
| service_status_update | Status changes to stage | "Service status: [Stage]" |
| service_completed | Service marked complete | "[Dealership] completed service for your [Vehicle]" |
| promotion | Promotion created | "New promotion: [Title]" |
| new_car_launch | New car announced | "New car launch: [Model Name]" |

---

## Data Flow Examples

### Example 1: Complete Service Request Lifecycle

```
Jan 20, 10:00 AM:
  Customer creates request for Toyota Camry
  Status: Pending
  Dealership notified

Jan 20, 11:00 AM:
  Dealership accepts for Jan 22, 2:00 PM
  Status: Accepted
  Notification: "Accepted for Jan 22, 2 PM"

Jan 22, 1:00 PM:
  Dealership changes time to 2:30 PM
  Status: Still Accepted, time updated
  Notification: "Schedule changed to 2:30 PM"

Jan 22, 2:30 PM:
  Dealership marks: "In Service"
  Notification: "Service started"

Jan 22, 3:30 PM:
  Dealership marks: "Quality Check"
  Notification: "Quality check in progress"

Jan 22, 4:00 PM:
  Dealership marks: "Ready for Pickup"
  Notification: "Service ready for pickup"

Jan 22, 4:30 PM:
  Dealership marks: "Picked Up"
  Status: Completed
  Notification: "Service completed successfully"

Jan 22, 5:00 PM:
  Customer views all 6 notifications in NotificationCenter
  Sees complete history of service events
```

### Example 2: Multi-Dealership Customer

```
Customer John linked to:
  - Dealership A (Toyota service)
  - Dealership B (Honda service)
  - Dealership C (General service)

John's dealershipIds array: [dealIdA, dealIdB, dealIdC]

Service Requests:
  - Request 1: Vehicle (Toyota) → Dealership A
  - Request 2: Vehicle (Honda) → Dealership B
  - Request 3: Vehicle (Honda) → Dealership C

Notifications received from all three dealerships
```

---

## Security Features

### 1. Password Security
- Bcrypt hashing with salt
- Salt rounds: 10 (can be increased via env variable)
- Minimum 6 characters
- Current password verification for changes
- New password cannot be same as old

### 2. Token Security
- JWT with HMAC-SHA256 signing
- 24-hour expiration
- Stored in HTTP-only cookie (prevents XSS)
- Secure flag in production (HTTPS only)
- SameSite strict (prevents CSRF)

### 3. Authorization
- Role-based access control (RBAC)
- Ownership verification
- Dealership association checks
- Resource-level permissions

### 4. Data Validation
- Required field validation
- Email uniqueness checking
- Role validation
- Dealership association validation
- Data type validation via Mongoose

### 5. Error Handling
- No sensitive data in error messages
- Generic messages for failed login (security principle)
- Proper HTTP status codes
- Server-side logging for debugging

---

## Performance Considerations

### Database Optimization
- Mongoose population for reference fetching
- Indexed queries on: email, dealershipId, customerId, status
- Batch operations where applicable

### API Design
- RESTful endpoints matching HTTP verbs
- Proper status codes
- Pagination for list endpoints
- Filtering by user role and ownership

### Frontend Optimization
- Next.js server-side rendering
- Component code splitting
- Image optimization
- Tailwind CSS with only used classes

### Scalability
- Stateless authentication (JWT)
- Horizontal scaling possible
- MongoDB Atlas for database scaling
- No server-side session storage

---

## Common Interview Questions & Answers

### Q1: Why MongoDB instead of PostgreSQL?
**Answer**: MongoDB's flexible schema and document structure align well with our data model. Service requests with embedded timelines are naturally represented as documents. Customers linking to multiple dealerships is simpler with arrays than SQL JOINs. The flexibility allows rapid development and changes.

### Q2: Why Express.js and not Django/NestJS?
**Answer**: Express is lightweight and perfect for REST APIs. It's unopinionated, allowing us to structure the project as needed. NestJS would add unnecessary boilerplate, and Django (Python) doesn't match our JavaScript frontend ecosystem. Express provides the right balance of features and simplicity.

### Q3: How do you handle customer linking to multiple dealerships?
**Answer**: Customers have a `dealershipIds` array instead of a single `dealershipId`. During login, we can select which dealership to access. Service requests are linked to specific dealerships, so queries filter by both customer and dealership. This is more flexible than SQL foreign keys.

### Q4: How are notifications created automatically?
**Answer**: Each endpoint that modifies service requests (accept, reject, update schedule, update status, complete) explicitly calls a notification function. These functions create Notification documents with the recipient and dealership IDs. The front-end fetches these via GET /api/notifications/.

### Q5: How does JWT token expiration work?
**Answer**: JWT tokens have an `expiresIn: "1d"` property set during creation. The token is stored in an HTTP-only cookie. When a user makes an authenticated request, middleware verifies the token. If expired, verification fails and returns 401. User must log in again.

### Q6: Why use HTTP-only cookies instead of localStorage for tokens?
**Answer**: HTTP-only cookies can't be accessed via JavaScript, protecting against XSS attacks. They're automatically sent with requests and cleared easily. localStorage is vulnerable to XSS since JavaScript can access it. Cookies are also CSRF protected with SameSite strict.

### Q7: How do you prevent CSRF attacks?
**Answer**: We use SameSite: strict on cookies, which prevents cross-site requests from sending cookies. We also use CORS with specific origins (localhost:3000, 3001, 3002). These two measures together prevent CSRF attacks.

### Q8: What happens if a dealership deletes their account?
**Answer**: Cascading deletion occurs: all employees of that dealership are deleted, all customers linked to that dealership are either unlinked (if they have other dealerships) or deleted entirely. All service requests are deleted. This maintains data integrity.

### Q9: How do you handle role-based access control?
**Answer**: Token contains user ID and role. Middleware sets req.user with full user details fetched from appropriate collection. Routes check req.user.role and ownership (e.g., serviceRequest.dealershipId === req.user.id for dealerships). Unauthorized access returns 403.

### Q10: Can a customer have service requests from different dealerships for the same vehicle?
**Answer**: Yes. The vehicle has a dealershipId indicating the primary dealership, but service requests can be with any dealership the customer is linked to. This allows flexibility for customers working with multiple service providers.

---

## Deployment Checklist

### Backend Deployment
- [ ] Set environment variables (MONGODB_URI, JWT_SECRET, etc.)
- [ ] Set NODE_ENV=production
- [ ] Configure CORS origins for production domain
- [ ] Ensure MongoDB connection secure (Atlas IP whitelist)
- [ ] Set secure: true for cookies in production
- [ ] Configure HTTPS/SSL certificate
- [ ] Set up error logging/monitoring
- [ ] Database backups configured
- [ ] Rate limiting implemented

### Frontend Deployment
- [ ] Build: `npm run build`
- [ ] Test build locally: `npm start`
- [ ] Update API endpoints for production
- [ ] Enable caching headers
- [ ] Configure CDN for static assets
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Configure analytics
- [ ] Test on target devices/browsers

---

## Testing Strategy

### Unit Tests
- Password hashing/verification
- Token generation/verification
- Utility functions

### Integration Tests
- Authentication flow (register → login)
- Service request creation and updates
- Authorization checks
- Notification creation

### End-to-End Tests
- Complete service workflow
- Multi-dealership customer experience
- Employee management
- Notification display

### Security Tests
- CSRF protection
- XSS prevention
- SQL injection (N/A for MongoDB, but NoSQL injection)
- Authorization bypass attempts
- Token expiration
- CORS policy

---

## Future Enhancements

1. **Email Notifications** - SMTP integration
2. **SMS Notifications** - Twilio integration
3. **Real-time Updates** - WebSocket for live notifications
4. **Payment Integration** - Stripe or PayPal
5. **Mobile App** - React Native
6. **Advanced Analytics** - Dashboard with charts
7. **File Upload** - AWS S3 for documents
8. **Calendar Integration** - Google Calendar sync
9. **AI Chatbot** - Customer support automation
10. **Rating & Reviews** - Customer feedback system

---

## Conclusion

Medical Records Manager is a full-stack web application demonstrating:
- ✅ Modern web development practices
- ✅ Secure authentication and authorization
- ✅ Complex business logic (service request lifecycle)
- ✅ Real-time notifications
- ✅ Multi-role system design
- ✅ RESTful API design
- ✅ MongoDB and Mongoose usage
- ✅ React and Next.js frontend
- ✅ TypeScript for type safety
- ✅ Scalable architecture

This documentation should provide comprehensive answers for your viva preparation!

---

## Document Structure

Each document is standalone but references others:
- Start with **01_PROJECT_OVERVIEW.md** for high-level understanding
- Then read route-specific documents based on questions
- **04_TECH_STACK_CHOICES.md** for "why" questions
- **06_DATABASE_MODELS.md** for data structure questions

---

**Last Updated**: January 2025
**Version**: 1.0
**Status**: Complete Viva Documentation

