# Backend: Add OpenAPI/Swagger for Local Development

## Request
Add OpenAPI 3.0 specification to Spring Boot backend **for local development only** (localhost:8080).

## Why
- Frontend MCP tools need OpenAPI spec for local development
- Better API documentation during development
- Enables local testing and integration

## Implementation (Spring Boot)

### 1. Add Dependency
Add to `pom.xml` or `build.gradle`:
```xml
<!-- SpringDoc OpenAPI -->
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
    <version>2.2.0</version>
</dependency>
```

### 2. Configure Application Properties
Add to `application.properties` or `application.yml`:
```properties
# OpenAPI Configuration (Local Development)
springdoc.api-docs.path=/v3/api-docs
springdoc.swagger-ui.path=/swagger-ui.html
springdoc.swagger-ui.enabled=true
```

### 3. Expected Local Endpoints
After implementation, these should be accessible on localhost:
- **JSON Spec**: `http://localhost:8080/v3/api-docs`
- **UI**: `http://localhost:8080/swagger-ui.html`

## Deliverable
Once done, ensure `/v3/api-docs` endpoint is accessible at `http://localhost:8080/v3/api-docs` when backend is running locally.

## Note
This is for **local development only**. Production deployment can be configured separately if needed.

