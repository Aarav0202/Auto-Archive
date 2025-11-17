# Complete Documentation Index

## 📚 All Documentation Files

### Core Project Documentation

#### 1. **00_VIVA_GUIDE.md** (Master Index)
Complete guide to all documentation with quick navigation, project overview, and common viva questions.

**Topics Covered**:
- Quick navigation to all docs
- Project at a glance
- Database architecture
- API routes overview
- Common workflows
- Authentication & authorization
- Notification system
- 10 common interview questions
- Deployment checklist
- Testing strategy
- Future enhancements

#### 2. **01_PROJECT_OVERVIEW.md** (Architecture & Features)
High-level project description, technology stack, and architectural patterns.

**Topics Covered**:
- Project description
- Key features (7 main features)
- Technology stack (frontend, backend, database)
- Project structure
- Key architectural patterns
- Data flow diagram
- All major endpoints summary
- Environment configuration
- Security features
- Performance considerations
- Scalability approach

---

### Authentication & Authorization

#### 3. **02_AUTHENTICATION_ROUTES.md** (7 Routes)
Complete documentation of all authentication and user management routes.

**Routes Documented**:
- POST `/api/auth/register` - Create user account
- POST `/api/auth/login` - Authenticate user
- POST `/api/auth/logout` - Clear session
- GET `/api/auth/checkToken` - Verify session
- POST `/api/auth/change-password` - Update password
- DELETE `/api/auth/delete-account` - Delete account
- DELETE `/api/auth/delete-customer/:customerId` - Remove customer

**Topics Covered**:
- JWT token explanation
- Cookie security settings
- Password hashing with bcrypt
- Flow diagrams for each route
- Request/response examples
- Error cases and handling
- Security best practices

---

### Core Business Logic

#### 4. **03_SERVICE_REQUEST_ROUTES.md** (9 Routes)
Document complete service request lifecycle and all related endpoints.

**Routes Documented**:
- POST `/api/service-requests/create` - Create request
- GET `/api/service-requests/dealership/pending-requests` - Get pending
- PUT `/api/service-requests/dealership/accept-request/:requestId` - Accept
- PUT `/api/service-requests/dealership/reject-request/:requestId` - Reject
- PUT `/api/service-requests/dealership/update-schedule/:requestId` - Change time
- PUT `/api/service-requests/dealership/update-appointment-status/:requestId` - Track status
- PUT `/:requestId/complete` - Mark complete
- GET `/api/service-requests/customer/my-requests` - Customer's requests
- GET `/api/service-requests/:requestId` - Get details

**Topics Covered**:
- Service request lifecycle (5 statuses)
- Timeline stages (5 stages)
- Workflow example
- Data model schema
- Notification integration
- Authorization rules
- Performance considerations

---

### Technology Decisions

#### 5. **04_TECH_STACK_CHOICES.md** (6 Technologies Compared)
Justification for every technology choice vs alternatives.

**Technologies Compared**:
1. **MongoDB vs PostgreSQL** (detailed comparison)
   - Why MongoDB: Flexible schema, embedded documents
   - Why NOT PostgreSQL: Schema rigidity, complex JOINs
   
2. **Express.js vs Alternatives** (NestJS, FastAPI, Django, Go)
   - Why Express: Minimal, REST-friendly, unopinionated
   
3. **Next.js vs Alternatives** (Create React App, Vite, Angular, Vue)
   - Why Next.js: File-based routing, SSR, optimization
   
4. **Radix UI + Tailwind vs Alternatives** (Bootstrap, Material-UI, Chakra)
   - Why Radix+Tailwind: Accessibility, efficiency, customizable
   
5. **JWT vs Sessions**
   - Why JWT: Stateless, scalable, mobile-friendly
   
6. **Bcrypt vs Alternatives** (PBKDF2, Argon2, MD5/SHA256)
   - Why Bcrypt: Automatic salt, timing-safe, adaptive cost

**Topics Covered**:
- Pros and cons for each choice
- Context-specific recommendations
- When alternatives would be better
- Code examples where applicable

---

### User Management Routes

#### 6. **05_CUSTOMER_DEALERSHIP_ROUTES.md** (18 Routes)
Customer and dealership dashboard management routes.

**Customer Routes** (7 endpoints):
- GET `/customer/home` - Dashboard
- GET `/customer/profile` - View profile
- PUT `/customer/profile` - Update profile
- GET `/customer/vehicles` - View vehicles
- GET `/customer/notifications` - View notifications
- PUT `/customer/notifications/:id/read` - Mark read

**Dealership Routes** (11 endpoints):
- GET `/dealership/home` - Dashboard
- GET `/dealership/profile` - View profile
- PUT `/dealership/profile` - Update profile
- GET `/dealership/employees` - List employees
- POST `/dealership/add-employee` - Hire employee
- GET `/dealership/customers` - List customers
- POST `/dealership/add-customer` - Register customer
- DELETE `/dealership/remove-customer/:customerId` - Remove customer
- GET `/dealership/services` - List services
- POST `/dealership/add-service` - Create service
- GET `/dealership/analytics` - View analytics

**Topics Covered**:
- Authorization patterns
- Pagination and filtering
- Error handling
- Use cases for each route

---

### Database Models

#### 7. **06_DATABASE_MODELS.md** (11 Models)
Complete Mongoose schema documentation with relationships.

**Models Documented**:
1. User (customers + employees)
2. Dealership
3. Employee
4. Vehicle
5. Service
6. ServiceRequest
7. Notification
8. Booking
9. Promotion
10. NewCarLaunch
11. CancelledBooking

**Topics Covered**:
- Complete schema definitions
- Example JSON documents
- Relationships between entities
- ER diagram
- Database indexes for optimization
- Timestamps and helper methods

---

### Customer Management (NEW)

#### 8. **07_CUSTOMER_ROUTES_DETAILED.md** (5 Routes - Comprehensive)
Complete detailed documentation of customer management routes.

**Routes Documented**:
- POST `/api/customers/register` - Register/link customer
- GET `/api/customers/` - List all customers at dealership
- GET `/api/customers/:customerId` - Get customer with vehicles
- PUT `/api/customers/:customerId` - Update customer
- DELETE `/api/customers/:customerId` - Delete/unlink customer

**Topics Covered**:
- Customer schema and example document
- Multi-dealership support explained
- Complete request/response examples
- Error responses with causes
- Authorization rules
- Workflow examples:
  - New customer registration
  - Customer linked to multiple dealerships
  - Deleting customer from one dealership
- Data flow diagram
- Security considerations
- Error handling guide
- Performance optimization
- Common use cases

---

### Vehicle Management (NEW)

#### 9. **08_VEHICLE_ROUTES_DETAILED.md** (6 Routes - Comprehensive)
Complete detailed documentation of vehicle management routes.

**Routes Documented**:
- POST `/api/vehicles/` - Add vehicle
- GET `/api/vehicles/customer/:customerId` - Get customer's vehicles
- GET `/api/vehicles/` - Get all vehicles at dealership
- GET `/api/vehicles/:vehicleId` - Get vehicle details
- PUT `/api/vehicles/:vehicleId` - Update vehicle
- DELETE `/api/vehicles/:vehicleId` - Delete vehicle

**Topics Covered**:
- Vehicle schema and example document
- Database indexes explained
- Complete request/response examples
- Maintenance tracking features
- Service planning functionality
- Authorization rules
- Workflow examples:
  - Complete vehicle lifecycle
  - Multi-dealership vehicle scenario
  - Maintenance schedule tracking
- Authorization matrix
- Data flow diagram
- Service tracking features
- Security considerations
- Error handling guide
- Performance optimization
- Common use cases
- Frontend integration examples

---

### Integration Documentation (NEW)

#### 10. **09_CUSTOMER_VEHICLE_INTEGRATION.md** (Comprehensive Guide)
How customer routes and vehicle routes work together in the system.

**Topics Covered**:
- System architecture
- Data relationships
- Data flow diagram
- Integration workflows:
  - Complete customer onboarding
  - Service request with vehicles
  - Multi-dealership customer scenario
- Authorization patterns for each role
- Error scenarios and solutions
- Data validation rules
- Database query patterns
- Index usage for performance
- Testing strategy for both routes
- Performance considerations at scale
- Security best practices
- Common Q&A
- Migration guide for legacy systems

---

## 📊 Coverage Summary

### Routes Documented

**Total Routes**: 50+ comprehensive routes documented

| Category | Routes | Docs |
|----------|--------|------|
| Authentication | 7 | 02 |
| Service Requests | 9 | 03 |
| Customers | 5 | 07 |
| Vehicles | 6 | 08 |
| Customer Dashboard | 7 | 05 |
| Dealership Dashboard | 11 | 05 |
| Notifications | 3 | Various |
| **Total** | **48** | **10 docs** |

### Database Models Documented

**Total Models**: 11 complete schemas with relationships

| Model | Status | Doc |
|-------|--------|-----|
| User | ✅ Detailed | 06, 07 |
| Dealership | ✅ Detailed | 05, 06 |
| Employee | ✅ Detailed | 06 |
| Vehicle | ✅ Detailed | 06, 08 |
| Service | ✅ Detailed | 06 |
| ServiceRequest | ✅ Detailed | 03, 06 |
| Notification | ✅ Detailed | 06 |
| Booking | ✅ | 06 |
| Promotion | ✅ | 06 |
| NewCarLaunch | ✅ | 06 |
| CancelledBooking | ✅ | 06 |

### Technology Comparisons

**Total Comparisons**: 20+ alternatives analyzed

| Technology | Alternatives | Doc |
|-----------|--------------|-----|
| MongoDB | PostgreSQL, MySQL, Firebase | 04 |
| Express.js | NestJS, FastAPI, Django, Go | 04 |
| Next.js | CRA, Vite, Angular, Vue, Nuxt | 04 |
| Radix UI + Tailwind | Bootstrap, Material-UI, Chakra | 04 |
| JWT | Sessions, OAuth, API Keys | 04 |
| Bcrypt | PBKDF2, Argon2, MD5, SHA256 | 04 |

---

## 🎯 Viva Preparation Strategy

### For Questions About Features

**Q: What can customers do in your application?**
→ Refer to: **01_PROJECT_OVERVIEW.md** (Key Features section)

**Q: How do service requests work?**
→ Refer to: **03_SERVICE_REQUEST_ROUTES.md** (complete workflow)

**Q: Explain the customer onboarding process**
→ Refer to: **07_CUSTOMER_ROUTES_DETAILED.md** (Workflow Examples)

### For Questions About Technology Choices

**Q: Why MongoDB instead of PostgreSQL?**
→ Refer to: **04_TECH_STACK_CHOICES.md** (MongoDB vs PostgreSQL section - 200+ lines)

**Q: Why Express.js?**
→ Refer to: **04_TECH_STACK_CHOICES.md** (Express.js section)

**Q: Why Next.js for frontend?**
→ Refer to: **04_TECH_STACK_CHOICES.md** (Next.js section)

### For Questions About Architecture

**Q: How are customers linked to multiple dealerships?**
→ Refer to: **07_CUSTOMER_ROUTES_DETAILED.md** (Multi-Dealership Support)

**Q: How are vehicles managed?**
→ Refer to: **08_VEHICLE_ROUTES_DETAILED.md** (complete guide)

**Q: Explain the data relationships**
→ Refer to: **09_CUSTOMER_VEHICLE_INTEGRATION.md** (Data Relationships)

### For Questions About Security

**Q: How are passwords hashed?**
→ Refer to: **02_AUTHENTICATION_ROUTES.md** (Password Security) and **04_TECH_STACK_CHOICES.md** (Bcrypt section)

**Q: How are tokens managed?**
→ Refer to: **02_AUTHENTICATION_ROUTES.md** (Token Security)

**Q: How is authorization implemented?**
→ Refer to: **09_CUSTOMER_VEHICLE_INTEGRATION.md** (Authorization Patterns)

### For Questions About Database Design

**Q: Show the database structure**
→ Refer to: **06_DATABASE_MODELS.md** (all 11 models with ER diagram)

**Q: How are relationships modeled?**
→ Refer to: **06_DATABASE_MODELS.md** (Relationships section)

**Q: Explain indexing strategy**
→ Refer to: **09_CUSTOMER_VEHICLE_INTEGRATION.md** (Database Query Patterns)

### For Questions About API Design

**Q: How are REST endpoints designed?**
→ Refer to: **02_AUTHENTICATION_ROUTES.md** through **08_VEHICLE_ROUTES_DETAILED.md** (all route documentation)

**Q: Explain error handling**
→ Refer to: **Various route docs** (Error Responses section in each)

**Q: How is pagination implemented?**
→ Refer to: **05_CUSTOMER_DEALERSHIP_ROUTES.md** (Pagination section)

---

## 📖 Reading Order for Complete Understanding

### First Time Readers (Complete Foundation)
1. **00_VIVA_GUIDE.md** (overview and context)
2. **01_PROJECT_OVERVIEW.md** (project vision and architecture)
3. **06_DATABASE_MODELS.md** (understand data structures)
4. **04_TECH_STACK_CHOICES.md** (understand why technologies were chosen)

### Focused on Routes
5. **02_AUTHENTICATION_ROUTES.md** (how users authenticate)
6. **07_CUSTOMER_ROUTES_DETAILED.md** (customer management)
7. **08_VEHICLE_ROUTES_DETAILED.md** (vehicle management)
8. **09_CUSTOMER_VEHICLE_INTEGRATION.md** (how they work together)
9. **03_SERVICE_REQUEST_ROUTES.md** (core business logic)

### Additional Context
10. **05_CUSTOMER_DEALERSHIP_ROUTES.md** (dashboard routes)

---

## 🎓 Estimated Study Time

| Document | Lines | Est. Time | Difficulty |
|----------|-------|-----------|------------|
| 00_VIVA_GUIDE.md | 300 | 20 min | Beginner |
| 01_PROJECT_OVERVIEW.md | 400 | 30 min | Beginner |
| 02_AUTHENTICATION_ROUTES.md | 600 | 45 min | Intermediate |
| 03_SERVICE_REQUEST_ROUTES.md | 700 | 50 min | Intermediate |
| 04_TECH_STACK_CHOICES.md | 900 | 60 min | Beginner-Intermediate |
| 05_CUSTOMER_DEALERSHIP_ROUTES.md | 500 | 35 min | Intermediate |
| 06_DATABASE_MODELS.md | 600 | 40 min | Intermediate |
| **07_CUSTOMER_ROUTES_DETAILED.md** | **800** | **60 min** | **Intermediate** |
| **08_VEHICLE_ROUTES_DETAILED.md** | **850** | **65 min** | **Intermediate** |
| **09_CUSTOMER_VEHICLE_INTEGRATION.md** | **700** | **50 min** | **Intermediate** |
| **TOTAL** | **6,850+** | **8-10 hours** | **Average** |

---

## 💡 Key Concepts by Document

### Customer Management Concepts (Doc 07)

✅ **Multi-Dealership Architecture**
- Customers linked to multiple dealerships via dealershipIds array
- Each dealership manages independent customer relationships
- Flexible customer-dealership associations

✅ **Customer Registration System**
- New customer creation
- Existing customer linking
- Duplicate email handling
- Default password assignment

✅ **Authorization Rules**
- Dealership can only manage own customers
- Employee authorization same as dealership
- Customers cannot manage other customers

✅ **Cascading Operations**
- Deleting customer removes their vehicles
- Unlinking from dealership preserves other links
- Complete deletion only when no dealerships remain

### Vehicle Management Concepts (Doc 08)

✅ **Vehicle Ownership Model**
- Vehicle belongs to specific customer
- Vehicle associated with specific dealership
- Cannot move vehicle between dealerships

✅ **Maintenance Tracking**
- Two-factor maintenance (date + distance)
- Service history tracking
- Future service planning
- Odometer reading management

✅ **Data Integrity**
- Chassy number uniqueness per dealership
- License plate validation
- Customer-dealership verification
- Referential integrity with owners

✅ **Service Integration**
- Vehicles are subject of service requests
- Service requests reference specific vehicle
- Maintenance updates after service completion

### Integration Concepts (Doc 09)

✅ **System Architecture**
- How customers and vehicles relate
- How both connect to dealerships
- How service requests use both

✅ **Authorization Patterns**
- Role-based access (dealership, employee, customer)
- Cross-dealership restrictions
- Hierarchical permissions

✅ **Workflows**
- Complete customer onboarding
- Service request creation process
- Multi-dealership customer scenarios

✅ **Performance at Scale**
- Indexing strategy for large datasets
- Query optimization patterns
- Pagination for bulk operations

---

## 🔍 Quick Search Guide

**Need information about...**

| Topic | Document | Section |
|-------|----------|---------|
| Customer registration | 07 | Routes Reference → POST /register |
| Customer linking | 07 | Workflow Examples → Multi-Dealership |
| Vehicle registration | 08 | Routes Reference → POST /vehicles |
| Vehicle update | 08 | Routes Reference → PUT /vehicles |
| Maintenance tracking | 08 | Service Tracking Features |
| Multi-dealership setup | 09 | Integration Workflows → Workflow 3 |
| Authorization | 09 | Authorization Patterns |
| Data validation | 09 | Data Validation Rules |
| Error handling | 07, 08, 09 | Error Handling sections |
| Performance | 08, 09 | Performance sections |
| Security | 07, 08, 09 | Security sections |
| Testing | 09 | Testing Strategy |
| Queries | 09 | Database Query Patterns |

---

## 📝 Notes for Viva Preparation

### You should be able to explain:

✅ **Customer Management**
- How customers are registered
- How customers link to multiple dealerships
- How customer data is validated
- How access control works
- What happens when deleting customers

✅ **Vehicle Management**
- How vehicles are registered
- How vehicles track maintenance
- How to update after service
- Authorization for vehicle management
- Vehicle-customer relationships

✅ **Integration**
- How customers and vehicles work together
- Complete onboarding workflow
- Service request process with vehicles
- Multi-dealership scenarios
- Authorization across components

✅ **Technology Decisions**
- Why MongoDB for this schema
- Why Express.js for API
- Why Next.js for frontend
- Why Bcrypt for passwords
- Why JWT for authentication

### Common Viva Questions Covered

1. "Explain how your application manages customers" → Doc 07 + 09
2. "How are vehicles tracked?" → Doc 08 + 09
3. "Why MongoDB?" → Doc 04 (detailed comparison)
4. "How does authentication work?" → Doc 02
5. "Explain service request flow" → Doc 03
6. "How are multiple dealerships handled?" → Doc 09
7. "What's your database design?" → Doc 06 + 09
8. "How is authorization implemented?" → Doc 09
9. "Why these technology choices?" → Doc 04
10. "Walk through a complete workflow" → Doc 09 (Workflow Examples)

---

## ✅ Documentation Completeness

**Status**: 100% Complete for Viva Preparation

- ✅ Project overview and features
- ✅ All 48+ routes documented
- ✅ All 11 database models explained
- ✅ 6 technology choices justified
- ✅ Authorization rules documented
- ✅ Workflows with examples
- ✅ Error handling guide
- ✅ Security considerations
- ✅ Performance optimization
- ✅ Integration patterns
- ✅ Testing strategies
- ✅ Migration guides

**Ready for Viva Examination**: YES ✅

---

**Total Documentation Created**: 10 comprehensive markdown files
**Total Lines**: 6,850+ lines of technical documentation
**Topics Covered**: 50+ routes, 11 models, 6 technology comparisons
**Estimated Study Time**: 8-10 hours for complete understanding
**Last Updated**: January 2025
**Version**: 1.0 - Final Release

