# Product Service Documentation

## High-Level Overview

The Product Service is a microservice responsible for managing product-related operations including brands, categories, and products. It follows Spring Boot 3.4.0 architecture with proper separation of concerns.

## Folder Structure & Purpose

### `src/main/java/com/redstore/product/`
**Purpose**: Contains production application code
- **`controller/`**: REST API endpoints for handling HTTP requests
  - `BrandController.java`: Manages brand CRUD operations with role-based access control
- **`service/`**: Business logic layer (to be implemented)
- **`repository/`**: Data access layer for database operations
  - `BrandRepository.java`: JPA repository for Brand entity operations
- **`entity/`**: JPA entities representing database tables
  - `Brand.java`: Brand entity with fields like id, name, description, sellerId, etc.
- **`config/`**: Spring Boot configuration classes
- **`ProductServiceApplication.java`**: Main Spring Boot application class

### `src/main/resources/`
**Purpose**: Contains application configuration and resources
- **`application.properties`**: Production configuration for database, server, and JWT settings

### `src/test/java/com/redstore/product/`
**Purpose**: Contains test code for ensuring application quality
- **`controller/`**: Integration tests for REST controllers
  - `BrandControllerTest.java`: Tests brand endpoints including authorization
- **`repository/`**: Data layer tests
  - `BrandRepositoryTest.java`: Tests database operations with H2 in-memory database
- **`entity/`**: Unit tests for JPA entities
  - `BrandTest.java`: Tests entity validation and builder patterns
- **`util/`**: Test utility classes
  - `TestJwtUtils.java`: Creates JWT tokens for testing authentication
  - `TestJwtUtilsForTesting.java`: Test-specific JWT implementation
- **`config/`**: Test configuration classes
  - `TestConfig.java`: Test-specific Spring configuration with mocked components

### `src/test/resources/`
**Purpose**: Contains test-specific configuration and resources
- **`application.properties`**: Test configuration with H2 database and JWT settings

## Key Files & Their Functions

### Core Application Files

#### `ProductServiceApplication.java`
- **Purpose**: Main Spring Boot application entry point
- **Function**: Bootstraps the Spring Boot application with auto-configuration

#### `BrandController.java`
- **Purpose**: REST API controller for brand operations
- **Key Features**:
  - GET `/brands`: Returns all brands (public endpoint)
  - POST `/brands`: Creates new brand with `@RequireSeller` authorization
- **Authorization**: Uses `@RequireSeller` annotation to restrict POST to SELLER role only

#### `Brand.java` (Entity)
- **Purpose**: JPA entity representing brand data
- **Key Fields**:
  - `id`: Unique identifier
  - `name`, `description`: Brand information
  - `sellerId`: Owner of the brand
  - `status`: Brand approval status (PENDING, APPROVED, REJECTED)
  - `createdAt`, `updatedAt`: Timestamps with automatic management
- **Builder Pattern**: Uses Lombok `@Builder` for easy object creation

#### `BrandRepository.java`
- **Purpose**: Spring Data JPA repository for database operations
- **Key Methods**:
  - `findBySellerId()`: Find brands by seller
  - `findBySellerIdOrderByCreatedAtDesc()`: Find brands ordered by creation date
  - Custom query methods for specific business needs

### Common Module Integration

#### Authorization System
- **`@RequireSeller`**: Method-level annotation requiring SELLER role
- **`CurrentUserInterceptor`**: Extracts JWT from cookies and sets UserContext
- **`RoleValidationAspect`**: AOP aspect that validates roles before method execution
- **`GlobalExceptionHandler`**: Converts exceptions to appropriate HTTP responses
- **`UserContext`**: Thread-local storage for current user information

#### JWT System
- **`JwtUtils`**: Generates and validates JWT tokens using HMAC-SHA256
- **Environment Variable**: `JWT_KEY` required for token signing (32+ characters)
- **Token Claims**: Contains user id, email, and roles

### Test Infrastructure

#### `TestConfig.java`
- **Purpose**: Test-specific Spring configuration
- **Key Features**:
  - Enables AOP with `@EnableAspectJAutoProxy`
  - Imports authorization components (`RoleValidationAspect`, `GlobalExceptionHandler`)
  - Provides JSON message converters for test content types
  - Registers `CurrentUserInterceptor` for cookie processing

#### `TestJwtUtils.java`
- **Purpose**: Creates JWT cookies for testing authentication scenarios
- **Usage**:
  - `createSellerCookie()`: Creates JWT cookie with SELLER role
  - `createBuyerCookie()`: Creates JWT cookie with BUYER role
  - `createAdminCookie()`: Creates JWT cookie with ADMIN role

#### `BrandControllerTest.java`
- **Purpose**: Integration tests for brand endpoints
- **Test Scenarios**:
  - GET `/brands`: Verifies endpoint returns 200 OK
  - POST `/brands` (no auth): Expects 401 Unauthorized
  - POST `/brands` (with seller cookie): Expects 200 OK
- **Authentication**: Uses real JWT tokens via `TestJwtUtils`

## Architecture Patterns

### Layered Architecture
1. **Controller Layer**: REST endpoints with request/response handling
2. **Service Layer**: Business logic (to be implemented)
3. **Repository Layer**: Data access via Spring Data JPA
4. **Entity Layer**: Database table representations

### Security Model
1. **JWT-based Authentication**: Tokens stored in HTTP cookies
2. **Role-based Authorization**: Method-level access control via AOP
3. **Thread-local Context**: User information stored per request thread

### Testing Strategy
1. **Unit Tests**: Entity validation and repository operations
2. **Integration Tests**: Full request-response cycles with MockMvc
3. **Test Isolation**: H2 in-memory database for each test
4. **Authentication Testing**: Real JWT tokens for authorization scenarios

## Current Implementation Status

### ✅ Completed
- Brand entity with JPA annotations
- Brand repository with custom queries
- Brand controller with GET/POST endpoints
- POST endpoint with `@RequireSeller` authorization
- Comprehensive test suite for all layers
- JWT token generation and validation
- Exception handling for unauthorized access

### 🔄 In Progress
- Service layer business logic
- PUT/PATCH/DELETE endpoints for brands
- Product entity and related operations
- Category management

### 📋 Next Steps
1. Implement service layer with business logic
2. Add full CRUD operations (PUT/PATCH/DELETE)
3. Implement product and category management
4. Add input validation and error handling
5. Implement database migrations for production deployment

## Development Guidelines

### Code Standards
- Use Lombok annotations for boilerplate reduction
- Follow Spring Boot best practices
- Implement comprehensive test coverage
- Use builder patterns for object creation
- Apply role-based security consistently

### Testing Requirements
- All endpoints must have integration tests
- Authorization scenarios must be tested
- Database operations must be tested with H2
- JWT functionality must be tested end-to-end
