# Implementation Plan: JWT Secret Configuration Bugfix

## Overview

This implementation plan follows the exploratory bugfix workflow to fix the JWT secret configuration crash during login. The workflow consists of:

1. **Exploration** - Write property-based tests to surface the bug on unfixed code
2. **Preservation** - Write property-based tests to verify existing behavior is preserved
3. **Implementation** - Apply the fix with understanding from exploration
4. **Validation** - Verify fix works and doesn't break anything

---

## Phase 1: Bug Exploration

- [x] 1. Write bug condition exploration test
  - **Property 1: Bug Condition** - JWT Token Generation Fails Without Secret
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the bug exists
  - **Scoped PBT Approach**: For this deterministic bug, scope the property to the concrete failing case: missing JWT_SECRET during login with valid credentials
  - Test implementation details from Bug Condition in design (isBugCondition: valid credentials + undefined JWT_SECRET)
  - The test assertions should match the Expected Behavior Properties from design (token generation succeeds without error)
  - Test approach:
    1. Temporarily unset JWT_SECRET from environment
    2. Attempt to call generateToken() with a valid user ID
    3. Assert that it throws an error (or crashes)
    4. Document the exact error message and stack trace
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS with error "secretOrPrivateKey must have a value" (this is correct - it proves the bug exists)
  - Document counterexamples found to understand root cause (e.g., "generateToken(userId) throws when JWT_SECRET is undefined")
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 1.1, 1.2_

---

## Phase 2: Preservation Testing

- [x] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Non-Buggy Authentication Behavior
  - **IMPORTANT**: Follow observation-first methodology
  - Observe behavior on UNFIXED code for non-buggy inputs (valid JWT_SECRET configured)
  - Write property-based tests capturing observed behavior patterns from Preservation Requirements
  - Property-based testing generates many test cases for stronger guarantees
  - Test approach:
    1. Set JWT_SECRET to a valid test value in environment
    2. Test that generateToken() successfully creates tokens for various user IDs
    3. Test that login with invalid credentials returns 401 error
    4. Test that login with valid credentials returns user data and token
    5. Test that generated tokens have 30-day expiration
    6. Test that token payload contains only the user ID
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3_

---

## Phase 3: Implementation

- [-] 3. Fix JWT secret configuration crash

  - [ ] 3.1 Add startup validation in server.js
    - Add validateRequiredEnvVars() function after dotenv.config()
    - Check that JWT_SECRET exists and is not empty
    - Throw clear error if JWT_SECRET is missing: "Missing required environment variables: JWT_SECRET"
    - Call validation immediately after dotenv.config() to fail fast
    - _Bug_Condition: isBugCondition(input) where process.env.JWT_SECRET is undefined_
    - _Expected_Behavior: Application fails at startup with clear error message if JWT_SECRET is missing_
    - _Preservation: Application starts successfully when JWT_SECRET is configured_
    - _Requirements: 2.1, 2.2_

  - [ ] 3.2 Add runtime validation in utils/generateToken.js
    - Add safety check before jwt.sign() call
    - Verify JWT_SECRET is available and not empty
    - Throw descriptive error if missing: "JWT_SECRET environment variable is not configured. Please add JWT_SECRET to your .env file."
    - This provides defense-in-depth if startup validation is bypassed
    - _Bug_Condition: isBugCondition(input) where process.env.JWT_SECRET is undefined during token generation_
    - _Expected_Behavior: generateToken() throws clear error instead of crashing in jwt.sign()_
    - _Preservation: generateToken() successfully creates tokens when JWT_SECRET is configured_
    - _Requirements: 2.1, 2.2_

  - [ ] 3.3 Add JWT_SECRET to .env file
    - Add JWT_SECRET entry to .env file with example value
    - Add comment explaining it's required for token signing
    - Use format: JWT_SECRET=your-secret-key-here-change-in-production
    - Ensure value is not empty
    - _Expected_Behavior: JWT_SECRET is available in environment for token generation_
    - _Requirements: 2.2_

  - [ ] 3.4 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - JWT Token Generation Succeeds With Secret
    - **IMPORTANT**: Re-run the SAME test from task 1 - do NOT write a new test
    - The test from task 1 encodes the expected behavior
    - When this test passes, it confirms the expected behavior is satisfied
    - Run bug condition exploration test from step 1 with JWT_SECRET now configured
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed)
    - Verify that generateToken() now successfully creates tokens without errors
    - _Requirements: 2.1, 2.2_

  - [ ] 3.5 Verify preservation tests still pass
    - **Property 2: Preservation** - Non-Buggy Behavior Unchanged
    - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
    - Run preservation property tests from step 2 after fix is applied
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm all tests still pass after fix (no regressions in authentication behavior)
    - Verify invalid credentials still return 401 error
    - Verify valid credentials still return user data and token
    - Verify token expiration is still 30 days
    - _Requirements: 3.1, 3.2, 3.3_

---

## Phase 4: Validation

- [x] 4. Checkpoint - Ensure all tests pass
  - Run full test suite to verify all tests pass
  - Verify bug condition exploration test passes (confirms fix works)
  - Verify preservation tests pass (confirms no regressions)
  - Verify application starts successfully with JWT_SECRET configured
  - Verify application fails at startup with clear error if JWT_SECRET is missing
  - Verify login flow works end-to-end with valid credentials
  - Verify login flow returns 401 with invalid credentials
  - Document any issues or questions that arise
  - Mark complete when all tests pass and fix is validated
  - _Requirements: 1.1, 1.2, 2.1, 2.2, 3.1, 3.2, 3.3_

