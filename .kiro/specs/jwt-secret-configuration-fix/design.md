# JWT Secret Configuration Bugfix Design

## Overview

The application crashes during user login when attempting to generate JWT tokens because the `JWT_SECRET` environment variable is not configured. When `jwt.sign()` receives `undefined` as the secret parameter, it throws an error "secretOrPrivateKey must have a value", preventing users from authenticating. This design document outlines a comprehensive fix that ensures JWT_SECRET is always available, properly validated at startup, and handled gracefully if misconfigured.

The fix strategy involves three key components:
1. **Configuration Validation**: Validate JWT_SECRET exists at application startup
2. **Error Handling**: Provide clear error messages if configuration is missing
3. **Token Generation**: Ensure generateToken.js safely uses the validated secret

## Glossary

- **Bug_Condition (C)**: The condition that triggers the bug - when JWT_SECRET environment variable is missing or undefined during token generation
- **Property (P)**: The desired behavior when JWT_SECRET is properly configured - tokens should be generated successfully without errors
- **Preservation**: Existing authentication behavior (401 errors for invalid credentials, token expiration, user data in response) that must remain unchanged
- **JWT_SECRET**: The environment variable containing the secret key used to sign JWT tokens
- **generateToken()**: The function in `utils/generateToken.js` that creates JWT tokens using jwt.sign()
- **authController.login()**: The controller function in `controllers/authController.js` that calls generateToken() after credential validation
- **Startup Validation**: Configuration checks performed when the application starts (in server.js)

## Bug Details

### Bug Condition

The bug manifests when a user attempts to login with valid credentials. The `generateToken()` function is called with `process.env.JWT_SECRET` which is `undefined` because the environment variable is not set in the `.env` file. This causes `jwt.sign()` to fail immediately with "secretOrPrivateKey must have a value".

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type LoginRequest (email, password)
  OUTPUT: boolean
  
  RETURN input.email IS_VALID
         AND input.password MATCHES_USER_PASSWORD
         AND process.env.JWT_SECRET IS undefined
         AND generateToken() IS_CALLED
END FUNCTION
```

### Examples

**Example 1: Missing JWT_SECRET during login**
- Input: User submits login form with valid email and password
- Current Behavior: Application crashes with "secretOrPrivateKey must have a value"
- Expected Behavior: User receives JWT token and is logged in successfully

**Example 2: Empty JWT_SECRET in .env**
- Input: .env file exists but JWT_SECRET is empty or commented out
- Current Behavior: jwt.sign() receives empty string, may fail or create invalid tokens
- Expected Behavior: Application should fail at startup with clear error message

**Example 3: Valid JWT_SECRET configured**
- Input: JWT_SECRET is properly set in .env (e.g., JWT_SECRET=my-secret-key-12345)
- Current Behavior: Should work, but currently crashes if not set
- Expected Behavior: Token generation succeeds, user receives valid JWT

**Edge Case: JWT_SECRET set but empty string**
- Input: JWT_SECRET="" in .env file
- Current Behavior: jwt.sign() may accept empty string but create invalid tokens
- Expected Behavior: Application should reject empty string at startup

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- Invalid credentials must continue to return 401 "Invalid credentials" error
- Valid login must continue to return user data (id, name, email, role) in response
- JWT tokens must continue to expire after 30 days as configured
- Token payload must continue to contain only the user ID
- All other authentication flows must remain unaffected

**Scope:**
All inputs that do NOT involve missing JWT_SECRET should be completely unaffected by this fix. This includes:
- Login attempts with invalid credentials (should still return 401)
- Login attempts with valid credentials when JWT_SECRET is properly configured
- All other API endpoints that use JWT authentication
- Token validation and verification in middleware

## Hypothesized Root Cause

Based on the bug description, the most likely issues are:

1. **Missing Environment Variable**: The JWT_SECRET is not defined in the `.env` file at all
   - The `.env` file exists but doesn't include JWT_SECRET entry
   - No default value is provided in the code
   - process.env.JWT_SECRET returns undefined

2. **No Startup Validation**: The application doesn't validate required environment variables when it starts
   - Missing configuration is only discovered when generateToken() is called
   - No early warning or clear error message at startup
   - Users see cryptic jwt.sign() error instead of configuration error

3. **No Fallback or Default**: The code doesn't provide any fallback mechanism or default value
   - In production, this should fail fast at startup
   - In development, a default might be acceptable but should be explicit

4. **Insufficient Error Context**: When the error occurs, it's not clear what's missing
   - Error message "secretOrPrivateKey must have a value" doesn't indicate JWT_SECRET
   - Stack trace points to jwt.sign() not to configuration issue
   - Users don't know to add JWT_SECRET to .env

## Correctness Properties

Property 1: Bug Condition - JWT Token Generation with Valid Secret

_For any_ login request where the user credentials are valid AND the JWT_SECRET environment variable is properly configured, the fixed generateToken() function SHALL successfully create a valid JWT token without throwing an error.

**Validates: Requirements 2.1, 2.2**

Property 2: Preservation - Invalid Credentials and Non-Buggy Inputs

_For any_ login request where the user credentials are invalid OR the JWT_SECRET is properly configured, the fixed code SHALL produce exactly the same behavior as the original code, preserving all existing authentication error handling and token expiration behavior.

**Validates: Requirements 3.1, 3.2, 3.3**

## Fix Implementation

### Changes Required

Assuming our root cause analysis is correct, the fix involves validating JWT_SECRET at startup and ensuring it's always available when generateToken() is called.

**File 1**: `server.js`

**Changes**:
1. **Add Configuration Validation Function**: Create a function that validates all required environment variables at startup
   - Check that JWT_SECRET exists and is not empty
   - Throw a clear error if JWT_SECRET is missing
   - Log success message if validation passes

2. **Call Validation at Startup**: Execute validation immediately after dotenv.config()
   - Fail fast if configuration is invalid
   - Prevent application from starting with missing secrets
   - Provide clear error message to developer

**Implementation Detail**:
```javascript
// After dotenv.config() in server.js
function validateRequiredEnvVars() {
  const requiredVars = ['JWT_SECRET'];
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

validateRequiredEnvVars();
```

**File 2**: `utils/generateToken.js`

**Changes**:
1. **Add Runtime Validation**: Add a safety check before calling jwt.sign()
   - Verify JWT_SECRET is available
   - Throw descriptive error if missing
   - Provide guidance on how to fix

2. **Improve Error Message**: If JWT_SECRET is somehow still undefined, provide clear error
   - Include the variable name that's missing
   - Suggest checking .env file
   - Include documentation link if available

**Implementation Detail**:
```javascript
const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    throw new Error(
      'JWT_SECRET environment variable is not configured. ' +
      'Please add JWT_SECRET to your .env file.'
    );
  }
  
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};
```

**File 3**: `.env` (Documentation/Example)

**Changes**:
1. **Add JWT_SECRET Entry**: Ensure .env file includes JWT_SECRET
   - Add example value or placeholder
   - Add comment explaining what it is
   - Ensure it's not empty

**Implementation Detail**:
```
# JWT Secret for token signing - MUST be set in production
JWT_SECRET=your-secret-key-here-change-in-production
```

**File 4**: `middleware/authMiddleware.js` (Optional Enhancement)

**Changes**:
1. **Add Token Verification Error Handling**: Improve error messages if token verification fails
   - Distinguish between invalid token and missing secret
   - Provide clear error responses to client

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate the bug on unfixed code, then verify the fix works correctly and preserves existing behavior.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate the bug BEFORE implementing the fix. Confirm or refute the root cause analysis. If we refute, we will need to re-hypothesize.

**Test Plan**: Write tests that simulate login requests with valid credentials when JWT_SECRET is missing. Run these tests on the UNFIXED code to observe failures and understand the root cause. Verify that the error message is "secretOrPrivateKey must have a value" and occurs in jwt.sign().

**Test Cases**:
1. **Missing JWT_SECRET Test**: Remove JWT_SECRET from environment, attempt login with valid credentials (will fail on unfixed code)
2. **Empty JWT_SECRET Test**: Set JWT_SECRET to empty string, attempt login with valid credentials (may fail or create invalid tokens on unfixed code)
3. **Undefined JWT_SECRET Test**: Explicitly set process.env.JWT_SECRET to undefined, call generateToken() (will fail on unfixed code)
4. **Valid JWT_SECRET Test**: Set JWT_SECRET to valid value, attempt login with valid credentials (should work, baseline for comparison)

**Expected Counterexamples**:
- jwt.sign() throws "secretOrPrivateKey must have a value" when JWT_SECRET is undefined
- No startup validation occurs, error only appears during login
- Error message doesn't clearly indicate JWT_SECRET is missing

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds, the fixed function produces the expected behavior.

**Pseudocode:**
```
FOR ALL input WHERE isBugCondition(input) DO
  // Ensure JWT_SECRET is configured
  process.env.JWT_SECRET = 'test-secret-key'
  result := login(input.email, input.password)
  ASSERT result.token IS_NOT_EMPTY
  ASSERT result.token IS_VALID_JWT
  ASSERT result.user.id IS_PRESENT
  ASSERT result.user.email IS_PRESENT
END FOR
```

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold, the fixed function produces the same result as the original function.

**Pseudocode:**
```
FOR ALL input WHERE NOT isBugCondition(input) DO
  ASSERT login_original(input) = login_fixed(input)
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many test cases automatically across the input domain
- It catches edge cases that manual unit tests might miss
- It provides strong guarantees that behavior is unchanged for all non-buggy inputs

**Test Plan**: Observe behavior on UNFIXED code first for invalid credentials and valid JWT_SECRET scenarios, then write property-based tests capturing that behavior.

**Test Cases**:
1. **Invalid Credentials Preservation**: Verify that invalid email/password combinations continue to return 401 error after fix
2. **Valid Login Preservation**: Verify that valid credentials continue to return user data and token after fix
3. **Token Expiration Preservation**: Verify that generated tokens continue to expire after 30 days
4. **User Data Preservation**: Verify that token response continues to include id, name, email, role

### Unit Tests

- Test that startup validation throws error when JWT_SECRET is missing
- Test that startup validation succeeds when JWT_SECRET is configured
- Test that generateToken() throws descriptive error if JWT_SECRET is somehow undefined
- Test that generateToken() successfully creates token when JWT_SECRET is available
- Test that login with invalid credentials returns 401 regardless of JWT_SECRET
- Test that login with valid credentials returns token when JWT_SECRET is configured

### Property-Based Tests

- Generate random valid user credentials and verify login succeeds with JWT_SECRET configured
- Generate random invalid credentials and verify login fails with 401 error
- Generate random JWT_SECRET values and verify tokens are created successfully
- Generate random user IDs and verify tokens contain correct payload
- Test that all non-buggy login scenarios produce identical results before and after fix

### Integration Tests

- Test full login flow with JWT_SECRET properly configured
- Test that application fails to start if JWT_SECRET is missing
- Test that application starts successfully if JWT_SECRET is configured
- Test that authenticated requests work with tokens generated by fixed code
- Test that token verification in middleware works with fixed tokens
