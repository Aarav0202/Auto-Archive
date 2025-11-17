# Medical Records Manager - Project Overview

## Project Description

**Medical Records Manager** is a comprehensive web application designed to manage medical service records, appointments, and customer relationships for car dealerships and healthcare service providers. The application enables dealerships to efficiently track service requests, manage customer vehicles, handle appointments, and maintain service history records.

## Core Features

### 1. **Authentication & Authorization**
- Multi-role authentication system (Customer, Dealership, Employee)
- JWT-based token authentication with secure cookies
- Password hashing using bcrypt
- Role-based access control

### 2. **Service Management**
- Service request creation and tracking
- Service acceptance/rejection workflow
- Schedule management and timeline tracking
- Service completion and record keeping
- Appointment status updates

### 3. **Notification System**
- Real-time notifications for service events
- Acceptance, rejection, time change, and completion notifications
- Unread notification tracking
- Notification filtering by type

### 4. **Customer Management**
- Customer registration and profile management
- Multi-dealership support for customers
- Customer deletion with dealership association
- Customer activity tracking

### 5. **Dealership Management**
- Dealership registration and profile management
- Employee management
- Customer management
- Service and promotion management

### 6. **Vehicle Management**
- Vehicle registration and tracking
- Service history per vehicle
- Current KM tracking
- License plate management

### 7. **Promotions & New Car Launches**
- Promotion creation and management
- New car launch announcements
- Customer notifications for promotions

## Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js (v5.1.0)
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Middleware**: CORS, Cookie Parser

### Frontend
- **Framework**: Next.js (v15.4.6)
- **UI Library**: React (v19.1.0)
- **Styling**: Tailwind CSS
- **Component Library**: Radix UI
- **Icons**: Lucide React
- **Notifications**: React Hot Toast, Sonner
- **State Management**: React Context API
- **Language**: TypeScript

## Project Structure

```
Medical-Records-Manager/
├── Backend/
│   ├── models/              # Mongoose schemas
│   │   ├── user.js
│   │   ├── dealership.js
│   │   ├── employee.js
│   │   ├── vehicle.js
│   │   ├── service.js
│   │   ├── serviceRequest.js
│   │   ├── booking.js
│   │   ├── notification.js
│   │   ├── promotion.js
│   │   └── newCarLaunch.js
│   ├── routes/              # API endpoints
│   │   ├── auth.js
│   │   ├── customer.js
│   │   ├── dealership.js
│   │   ├── employees.js
│   │   ├── customers.js
│   │   ├── vehicles.js
│   │   ├── services.js
│   │   ├── serviceRequests.js
│   │   ├── bookings.js
│   │   ├── notifications.js
│   │   ├── promotions.js
│   │   └── newCarLaunches.js
│   ├── middleware/          # Express middleware
│   │   └── authMiddleware.js
│   ├── utils/               # Utility functions
│   │   └── notificationHelper.js
│   ├── migrations/          # Database migrations
│   └── server.js            # Application entry point
│
└── Frontend/
    └── med_rec_frontend/
        ├── src/
        │   ├── app/
        │   │   ├── (marketing)/    # Public pages
        │   │   ├── customer/       # Customer dashboard
        │   │   ├── dealership/     # Dealership dashboard
        │   │   └── context/        # Context providers
        │   ├── components/         # Reusable components
        │   └── hooks/              # Custom React hooks
        └── public/                 # Static assets
```

## Key Architectural Patterns

### 1. **Role-Based Access Control (RBAC)**
- Three distinct roles: Customer, Dealership, Employee
- Each role has specific permissions and capabilities
- Token-based verification for protected routes

### 2. **Request-Response Pattern**
- RESTful API design
- JSON request/response format
- Proper HTTP status codes

### 3. **Separation of Concerns**
- Models: Data schema definitions
- Routes: API endpoints and business logic
- Middleware: Authentication and authorization
- Utils: Reusable functions (notifications)

### 4. **Database Relationships**
- One-to-Many: Dealership ↔ Employees, Services
- Many-to-Many: Customers ↔ Dealerships
- Hierarchical: Service → ServiceRequest → Notification

## Data Flow

### User Authentication Flow
```
1. User submits credentials
2. Backend verifies email exists in appropriate model
3. Bcrypt compares password hashes
4. JWT token generated with user ID and role
5. Token stored in secure HTTP-only cookie
6. Client makes authenticated requests with token
7. Middleware verifies token for protected routes
```

### Service Request Flow
```
1. Customer creates service request
2. Dealership receives pending request notification
3. Dealership accepts/rejects request
4. Customer receives status notification
5. Dealership can modify schedule
6. Dealership tracks appointment progress
7. Dealership marks service complete
8. Customer receives completion notification
9. Service record stored in database
```

## Key Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/checkToken` - Verify current token
- `POST /api/auth/change-password` - Change password
- `DELETE /api/auth/delete-account` - Delete account

### Service Requests
- `POST /api/service-requests/create` - Create request
- `GET /api/service-requests/dealership/pending-requests` - Get pending
- `GET /api/service-requests/dealership/scheduled-services` - Get scheduled
- `PUT /api/service-requests/:id/accept` - Accept request
- `PUT /api/service-requests/:id/reject` - Reject request
- `PUT /api/service-requests/:id/complete` - Mark complete

### Notifications
- `GET /api/notifications/` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `DELETE /api/notifications/:id` - Delete notification

## Environment Configuration

The application requires the following environment variables:

```
MONGODB_URI=<MongoDB Atlas connection string>
JWT_SECRET=<Secret key for token signing>
SALT_ROUNDS=<Number of bcrypt salt rounds (default: 10)>
NODE_ENV=<development|production>
PORT=8080
```

## Database Connection

- **Provider**: MongoDB Atlas
- **Connection**: Mongoose ODM
- **Strategy**: Connection pooling
- **Error Handling**: Automatic reconnection attempts

## Security Features

1. **Password Security**
   - Bcrypt hashing with configurable salt rounds
   - Password validation (minimum 6 characters)
   - Current password verification for changes

2. **Token Security**
   - JWT tokens with 24-hour expiration
   - HTTP-only cookies (prevent XSS)
   - SameSite strict policy (prevent CSRF)
   - Secure flag in production

3. **Access Control**
   - Role-based route protection
   - Dealership ownership verification
   - Ownership-based resource access

4. **Data Validation**
   - Required field validation
   - Email uniqueness checking
   - Role validation
   - Dealership association validation

## Performance Considerations

1. **Database Queries**
   - Population of references (Mongoose `.populate()`)
   - Indexed queries for common operations
   - Batch operations where applicable

2. **API Design**
   - Proper pagination for list endpoints (implemented in some routes)
   - Filtering by user role and ownership
   - Efficient sorting and searching

3. **Frontend Optimization**
   - Next.js server-side rendering
   - Component code splitting
   - Image optimization
   - CSS-in-JS with Tailwind

## Scalability & Extensibility

- **Database**: MongoDB scales horizontally with sharding
- **API**: Stateless design allows horizontal scaling
- **Frontend**: Next.js supports static generation and incremental updates
- **Authentication**: JWT tokens don't require server-side session storage

## Error Handling

- Comprehensive try-catch blocks in routes
- Proper HTTP status codes (400, 401, 403, 404, 500)
- Meaningful error messages returned to clients
- Server-side logging of errors

## Testing Recommendations

1. Unit Tests: Middleware, utility functions
2. Integration Tests: API endpoints with database
3. End-to-End Tests: Complete user workflows
4. Security Tests: Authorization, authentication

## Future Enhancements

1. **Email Notifications**: SMTP integration for email alerts
2. **SMS Notifications**: Twilio integration for SMS alerts
3. **Real-time Updates**: WebSocket integration for live notifications
4. **Advanced Analytics**: Dashboard with statistics and insights
5. **Payment Integration**: Payment gateway for online payments
6. **File Management**: Document upload and storage (AWS S3)
7. **Appointment Scheduling**: Calendar integration with Google/Outlook
8. **Mobile App**: React Native or Flutter mobile application
