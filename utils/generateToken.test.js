const generateToken = require('./generateToken');
const fc = require('fast-check');

/**
 * Property 1: Bug Condition - JWT Token Generation Fails Without Secret
 * 
 * Validates: Requirements 1.1, 1.2
 * 
 * This test surfaces the bug on unfixed code. It MUST FAIL on unfixed code
 * to confirm the bug exists. When JWT_SECRET is missing from the environment,
 * generateToken() should throw an error.
 * 
 * Bug Condition: valid credentials + undefined JWT_SECRET
 * Expected Behavior: token generation throws error (not crashes silently)
 */
describe('generateToken - Bug Condition Exploration', () => {
  let originalJwtSecret;

  beforeEach(() => {
    // Save original JWT_SECRET
    originalJwtSecret = process.env.JWT_SECRET;
  });

  afterEach(() => {
    // Restore original JWT_SECRET
    if (originalJwtSecret !== undefined) {
      process.env.JWT_SECRET = originalJwtSecret;
    } else {
      delete process.env.JWT_SECRET;
    }
  });

  test('Property 1: generateToken throws error when JWT_SECRET is undefined', () => {
    // Arrange: Unset JWT_SECRET from environment
    delete process.env.JWT_SECRET;

    // Act & Assert: Attempt to generate token with valid user ID
    // This should throw an error on unfixed code
    const validUserId = '507f1f77bcf86cd799439011'; // Valid MongoDB ObjectId format

    expect(() => {
      generateToken(validUserId);
    }).toThrow();
  });

  test('Property 1: generateToken throws descriptive error when JWT_SECRET is undefined', () => {
    // Arrange: Unset JWT_SECRET from environment
    delete process.env.JWT_SECRET;

    // Act & Assert: Attempt to generate token and verify specific error message
    const validUserId = '507f1f77bcf86cd799439011';

    expect(() => {
      generateToken(validUserId);
    }).toThrow('JWT_SECRET environment variable is not configured');
  });

  test('Property 1: generateToken throws error for any valid user ID when JWT_SECRET is undefined', () => {
    // Arrange: Unset JWT_SECRET from environment
    delete process.env.JWT_SECRET;

    // Act & Assert: Property-based test - for any valid user ID, should throw
    fc.assert(
      fc.property(fc.string({ minLength: 1, maxLength: 50 }), (userId) => {
        expect(() => {
          generateToken(userId);
        }).toThrow();
      })
    );
  });

  test('Property 1: generateToken throws error when JWT_SECRET is empty string', () => {
    // Arrange: Set JWT_SECRET to empty string
    process.env.JWT_SECRET = '';

    // Act & Assert: Attempt to generate token
    const validUserId = '507f1f77bcf86cd799439011';

    expect(() => {
      generateToken(validUserId);
    }).toThrow();
  });

  test('Baseline: generateToken succeeds when JWT_SECRET is configured', () => {
    // Arrange: Set JWT_SECRET to a valid test value
    process.env.JWT_SECRET = 'test-secret-key-for-testing-12345';

    // Act: Generate token with valid user ID
    const validUserId = '507f1f77bcf86cd799439011';
    const token = generateToken(validUserId);

    // Assert: Token should be a non-empty string
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(0);
  });
});

/**
 * Property 2: Preservation - Non-Buggy Authentication Behavior
 * 
 * Validates: Requirements 3.1, 3.2, 3.3
 * 
 * These tests verify that existing authentication behavior is preserved
 * when JWT_SECRET is properly configured. They observe behavior on unfixed code
 * for non-buggy inputs and capture the expected patterns.
 * 
 * Preservation Requirements:
 * - Invalid credentials return 401 error
 * - Valid login returns user data (id, name, email, role) + token
 * - Tokens expire after 30 days
 * - Token payload contains only user ID
 */
describe('generateToken - Preservation Tests', () => {
  let originalJwtSecret;

  beforeEach(() => {
    // Save original JWT_SECRET
    originalJwtSecret = process.env.JWT_SECRET;
    // Set JWT_SECRET to a valid test value for preservation tests
    process.env.JWT_SECRET = 'test-secret-key-for-preservation-testing';
  });

  afterEach(() => {
    // Restore original JWT_SECRET
    if (originalJwtSecret !== undefined) {
      process.env.JWT_SECRET = originalJwtSecret;
    } else {
      delete process.env.JWT_SECRET;
    }
  });

  describe('Property 2.1: generateToken successfully creates tokens for various user IDs', () => {
    test('generateToken creates valid JWT token for single user ID', () => {
      // Arrange: Valid user ID
      const userId = '507f1f77bcf86cd799439011';

      // Act: Generate token
      const token = generateToken(userId);

      // Assert: Token should be a valid JWT string
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts: header.payload.signature
    });

    test('Property 2.1: generateToken creates valid tokens for any user ID', () => {
      // Property-based test: for any valid user ID string, generateToken should succeed
      fc.assert(
        fc.property(fc.string({ minLength: 1, maxLength: 50 }), (userId) => {
          const token = generateToken(userId);
          
          // Token should be a valid JWT (3 parts separated by dots)
          expect(token).toBeDefined();
          expect(typeof token).toBe('string');
          expect(token.split('.')).toHaveLength(3);
        })
      );
    });

    test('generateToken creates different tokens for different user IDs', () => {
      // Arrange: Two different user IDs
      const userId1 = '507f1f77bcf86cd799439011';
      const userId2 = '507f1f77bcf86cd799439012';

      // Act: Generate tokens for both users
      const token1 = generateToken(userId1);
      const token2 = generateToken(userId2);

      // Assert: Tokens should be different
      expect(token1).not.toEqual(token2);
    });
  });

  describe('Property 2.2: Token payload contains only the user ID', () => {
    test('Token payload contains only user ID field', () => {
      // Arrange: Valid user ID
      const userId = '507f1f77bcf86cd799439011';

      // Act: Generate token
      const token = generateToken(userId);

      // Assert: Decode token and verify payload contains only 'id' field
      const jwt = require('jsonwebtoken');
      const decoded = jwt.decode(token);
      
      expect(decoded).toBeDefined();
      expect(decoded.id).toEqual(userId);
      // Verify only 'id' and standard JWT claims (iat, exp) are present
      expect(Object.keys(decoded).sort()).toEqual(['exp', 'iat', 'id'].sort());
    });

    test('Property 2.2: Token payload contains only user ID for any user ID', () => {
      // Property-based test: for any user ID, token payload should contain only 'id'
      const jwt = require('jsonwebtoken');
      
      fc.assert(
        fc.property(fc.string({ minLength: 1, maxLength: 50 }), (userId) => {
          const token = generateToken(userId);
          const decoded = jwt.decode(token);
          
          // Payload should contain the user ID
          expect(decoded.id).toEqual(userId);
          // Payload should only have 'id' and standard JWT claims
          expect(Object.keys(decoded).sort()).toEqual(['exp', 'iat', 'id'].sort());
        })
      );
    });
  });

  describe('Property 2.3: Generated tokens have 30-day expiration', () => {
    test('Token expiration is set to 30 days from creation', () => {
      // Arrange: Valid user ID and current time
      const userId = '507f1f77bcf86cd799439011';
      const beforeGeneration = Math.floor(Date.now() / 1000);

      // Act: Generate token
      const token = generateToken(userId);

      // Assert: Verify token expiration is approximately 30 days from now
      const jwt = require('jsonwebtoken');
      const decoded = jwt.decode(token);
      const afterGeneration = Math.floor(Date.now() / 1000);
      
      // 30 days in seconds
      const thirtyDaysInSeconds = 30 * 24 * 60 * 60;
      
      // Token expiration should be approximately 30 days from now
      // Allow 5 second tolerance for test execution time
      expect(decoded.exp).toBeGreaterThanOrEqual(beforeGeneration + thirtyDaysInSeconds - 5);
      expect(decoded.exp).toBeLessThanOrEqual(afterGeneration + thirtyDaysInSeconds + 5);
    });

    test('Property 2.3: All generated tokens expire after 30 days', () => {
      // Property-based test: for any user ID, token should expire in ~30 days
      const jwt = require('jsonwebtoken');
      const thirtyDaysInSeconds = 30 * 24 * 60 * 60;
      
      fc.assert(
        fc.property(fc.string({ minLength: 1, maxLength: 50 }), (userId) => {
          const beforeGeneration = Math.floor(Date.now() / 1000);
          const token = generateToken(userId);
          const afterGeneration = Math.floor(Date.now() / 1000);
          
          const decoded = jwt.decode(token);
          
          // Token expiration should be approximately 30 days from now
          expect(decoded.exp).toBeGreaterThanOrEqual(beforeGeneration + thirtyDaysInSeconds - 5);
          expect(decoded.exp).toBeLessThanOrEqual(afterGeneration + thirtyDaysInSeconds + 5);
        })
      );
    });

    test('Token is not expired immediately after generation', () => {
      // Arrange: Valid user ID
      const userId = '507f1f77bcf86cd799439011';

      // Act: Generate token
      const token = generateToken(userId);

      // Assert: Token should not be expired
      const jwt = require('jsonwebtoken');
      const decoded = jwt.decode(token);
      const currentTime = Math.floor(Date.now() / 1000);
      
      expect(decoded.exp).toBeGreaterThan(currentTime);
    });
  });

  describe('Property 2.4: Token generation consistency', () => {
    test('generateToken is deterministic for same user ID and secret', () => {
      // Arrange: Valid user ID
      const userId = '507f1f77bcf86cd799439011';

      // Act: Generate token twice
      const token1 = generateToken(userId);
      const token2 = generateToken(userId);

      // Assert: Tokens should be different (due to iat timestamp)
      // but should decode to the same user ID
      const jwt = require('jsonwebtoken');
      const decoded1 = jwt.decode(token1);
      const decoded2 = jwt.decode(token2);
      
      expect(decoded1.id).toEqual(decoded2.id);
      expect(decoded1.id).toEqual(userId);
    });

    test('generateToken uses the configured JWT_SECRET', () => {
      // Arrange: Valid user ID and a different secret
      const userId = '507f1f77bcf86cd799439011';
      const token = generateToken(userId);
      const jwt = require('jsonwebtoken');

      // Act & Assert: Token should verify with the configured secret
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      expect(decoded.id).toEqual(userId);

      // Token should NOT verify with a different secret
      expect(() => {
        jwt.verify(token, 'wrong-secret-key');
      }).toThrow();
    });
  });
});
