# Bugfix Requirements Document: JWT Secret Configuration

## Introduction

The application crashes during user login when attempting to generate JWT tokens. The error "secretOrPrivateKey must have a value" occurs in `utils/generateToken.js` because the `JWT_SECRET` environment variable is not configured. This prevents users from successfully authenticating and receiving valid JWT tokens for subsequent API requests.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN a user attempts to login with valid credentials THEN the system crashes with error "secretOrPrivateKey must have a value" at `jwt.sign()` in `generateToken.js:4`

1.2 WHEN the `JWT_SECRET` environment variable is missing or empty THEN the system passes `undefined` to `jwt.sign()` causing immediate failure

### Expected Behavior (Correct)

2.1 WHEN a user attempts to login with valid credentials THEN the system SHALL successfully generate a valid JWT token and return it in the response

2.2 WHEN the `JWT_SECRET` environment variable is properly configured THEN the system SHALL use it to sign JWT tokens without errors

### Unchanged Behavior (Regression Prevention)

3.1 WHEN a user provides invalid credentials THEN the system SHALL CONTINUE TO return a 401 "Invalid credentials" error response

3.2 WHEN a user is successfully authenticated THEN the system SHALL CONTINUE TO return user data (id, name, email, role) along with the token

3.3 WHEN JWT tokens are generated with a valid secret THEN the system SHALL CONTINUE TO set token expiration to 30 days as configured
