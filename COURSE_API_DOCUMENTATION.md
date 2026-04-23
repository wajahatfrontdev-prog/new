# Course API Documentation

## Overview

The Course API provides endpoints for managing educational content in the iCare Virtual Hospital Platform. Courses can be categorized as Health Programs (for patients) or Professional Courses (for doctors), supporting the platform's integrated learning management system.

## Base URL

```
/api/courses
```

## Authentication

Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Data Models

### Course Model

```javascript
{
  _id: ObjectId,
  title: String (required),
  description: String (required),
  instructor: ObjectId (ref: User, required),
  category: String (enum: ['HealthProgram', 'ProfessionalCourse'], required),
  targetAudience: String (enum: ['Patient', 'Doctor', 'Both'], required),
  healthConditions: [String],
  difficulty: String (enum: ['Beginner', 'Intermediate', 'Advanced']),
  duration: Number (hours),
  modules: [
    {
      title: String,
      description: String,
      order: Number,
      lessons: [
        {
          title: String,
          content: String,
          videoUrl: String,
          duration: Number (minutes),
          order: Number,
          resources: [
            {
              title: String,
              url: String,
              type: String
            }
          ]
        }
      ],
      quiz: {
        questions: [
          {
            question: String,
            options: [String],
            correctAnswer: Number,
            explanation: String
          }
        ],
        passingScore: Number
      }
    }
  ],
  thumbnail: String,
  isPublished: Boolean (default: false),
  publishedAt: Date,
  enrollmentCount: Number (default: 0),
  rating: {
    average: Number (default: 0),
    count: Number (default: 0)
  },
  createdAt: Date,
  updatedAt: Date
}
```

## API Endpoints

### 1. Create Course

Create a new course (instructor only).

**Endpoint:** `POST /api/courses`

**Authentication:** Required (Instructor role)

**Request Body:**

```json
{
  "title": "Diabetes Management Program",
  "description": "Comprehensive program for managing Type 2 Diabetes",
  "category": "HealthProgram",
  "targetAudience": "Patient",
  "healthConditions": ["Diabetes", "Type 2 Diabetes"],
  "difficulty": "Beginner",
  "duration": 4,
  "modules": [
    {
      "title": "Understanding Diabetes",
      "description": "Learn the basics of diabetes",
      "order": 1,
      "lessons": [
        {
          "title": "What is Diabetes?",
          "content": "Diabetes is a chronic condition...",
          "videoUrl": "https://example.com/video1.mp4",
          "duration": 15,
          "order": 1
        }
      ],
      "quiz": {
        "questions": [
          {
            "question": "What is the main characteristic of Type 2 Diabetes?",
            "options": [
              "Insulin resistance",
              "No insulin production",
              "Autoimmune disorder",
              "Genetic mutation"
            ],
            "correctAnswer": 0,
            "explanation": "Type 2 Diabetes is characterized by insulin resistance."
          }
        ],
        "passingScore": 70
      }
    }
  ],
  "thumbnail": "https://example.com/diabetes-thumbnail.jpg"
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "message": "Course created successfully",
  "course": {
    "_id": "60d5ec49f1b2c72b8c8e4a1b",
    "title": "Diabetes Management Program",
    "description": "Comprehensive program for managing Type 2 Diabetes",
    "instructor": "60d5ec49f1b2c72b8c8e4a1a",
    "category": "HealthProgram",
    "targetAudience": "Patient",
    "healthConditions": ["Diabetes", "Type 2 Diabetes"],
    "difficulty": "Beginner",
    "duration": 4,
    "modules": [...],
    "thumbnail": "https://example.com/diabetes-thumbnail.jpg",
    "isPublished": false,
    "enrollmentCount": 0,
    "rating": {
      "average": 0,
      "count": 0
    },
    "createdAt": "2023-06-25T10:30:00.000Z",
    "updatedAt": "2023-06-25T10:30:00.000Z"
  }
}
```

**Error Responses:**

- `400 Bad Request`: Missing required fields
- `403 Forbidden`: User is not an instructor
- `500 Internal Server Error`: Server error

---

### 2. Get All Courses

Retrieve all courses with optional filters.

**Endpoint:** `GET /api/courses`

**Authentication:** Not required

**Query Parameters:**

- `category` (optional): Filter by category (HealthProgram, ProfessionalCourse)
- `targetAudience` (optional): Filter by target audience (Patient, Doctor, Both)
- `difficulty` (optional): Filter by difficulty (Beginner, Intermediate, Advanced)
- `isPublished` (optional): Filter by published status (true, false)
- `instructorId` (optional): Filter by instructor ID
- `healthCondition` (optional): Filter by health condition

**Example Request:**

```
GET /api/courses?category=HealthProgram&isPublished=true
```

**Response (200 OK):**

```json
{
  "success": true,
  "count": 2,
  "courses": [
    {
      "_id": "60d5ec49f1b2c72b8c8e4a1b",
      "title": "Diabetes Management Program",
      "description": "Comprehensive program for managing Type 2 Diabetes",
      "instructor": {
        "_id": "60d5ec49f1b2c72b8c8e4a1a",
        "name": "Dr. John Smith",
        "email": "john.smith@icare.com"
      },
      "category": "HealthProgram",
      "targetAudience": "Patient",
      "isPublished": true,
      "enrollmentCount": 45,
      "rating": {
        "average": 4.5,
        "count": 12
      },
      "createdAt": "2023-06-25T10:30:00.000Z"
    },
    ...
  ]
}
```

---

### 3. Get Course by ID

Retrieve a specific course by its ID.

**Endpoint:** `GET /api/courses/:id`

**Authentication:** Not required

**Response (200 OK):**

```json
{
  "success": true,
  "course": {
    "_id": "60d5ec49f1b2c72b8c8e4a1b",
    "title": "Diabetes Management Program",
    "description": "Comprehensive program for managing Type 2 Diabetes",
    "instructor": {
      "_id": "60d5ec49f1b2c72b8c8e4a1a",
      "name": "Dr. John Smith",
      "email": "john.smith@icare.com"
    },
    "category": "HealthProgram",
    "targetAudience": "Patient",
    "healthConditions": ["Diabetes", "Type 2 Diabetes"],
    "difficulty": "Beginner",
    "duration": 4,
    "modules": [...],
    "thumbnail": "https://example.com/diabetes-thumbnail.jpg",
    "isPublished": true,
    "publishedAt": "2023-06-25T12:00:00.000Z",
    "enrollmentCount": 45,
    "rating": {
      "average": 4.5,
      "count": 12
    },
    "createdAt": "2023-06-25T10:30:00.000Z",
    "updatedAt": "2023-06-25T12:00:00.000Z"
  }
}
```

**Error Responses:**

- `404 Not Found`: Course not found
- `500 Internal Server Error`: Server error

---

### 4. Update Course

Update an existing course (instructor only, must be course owner).

**Endpoint:** `PUT /api/courses/:id`

**Authentication:** Required (Instructor role, course owner)

**Request Body:** (all fields optional)

```json
{
  "title": "Diabetes Management Program - Updated",
  "description": "Updated description",
  "category": "HealthProgram",
  "targetAudience": "Both",
  "healthConditions": ["Diabetes", "Type 2 Diabetes", "Prediabetes"],
  "difficulty": "Intermediate",
  "duration": 6,
  "modules": [...],
  "thumbnail": "https://example.com/new-thumbnail.jpg"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Course updated successfully",
  "course": {
    "_id": "60d5ec49f1b2c72b8c8e4a1b",
    "title": "Diabetes Management Program - Updated",
    ...
  }
}
```

**Error Responses:**

- `403 Forbidden`: User is not authorized to update this course
- `404 Not Found`: Course not found
- `500 Internal Server Error`: Server error

---

### 5. Delete Course

Delete a course (instructor only, must be course owner).

**Endpoint:** `DELETE /api/courses/:id`

**Authentication:** Required (Instructor role, course owner)

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Course deleted successfully"
}
```

**Error Responses:**

- `403 Forbidden`: User is not authorized to delete this course
- `404 Not Found`: Course not found
- `500 Internal Server Error`: Server error

---

### 6. Publish Course

Publish a course to make it available to users.

**Endpoint:** `POST /api/courses/:id/publish`

**Authentication:** Required (Instructor role, course owner)

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Course published successfully",
  "course": {
    "_id": "60d5ec49f1b2c72b8c8e4a1b",
    "title": "Diabetes Management Program",
    "isPublished": true,
    "publishedAt": "2023-06-25T12:00:00.000Z",
    ...
  }
}
```

**Error Responses:**

- `400 Bad Request`: Cannot publish course without modules
- `403 Forbidden`: User is not authorized to publish this course
- `404 Not Found`: Course not found
- `500 Internal Server Error`: Server error

---

### 7. Unpublish Course

Unpublish a course to make it unavailable to users.

**Endpoint:** `POST /api/courses/:id/unpublish`

**Authentication:** Required (Instructor role, course owner)

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Course unpublished successfully",
  "course": {
    "_id": "60d5ec49f1b2c72b8c8e4a1b",
    "title": "Diabetes Management Program",
    "isPublished": false,
    ...
  }
}
```

**Error Responses:**

- `403 Forbidden`: User is not authorized to unpublish this course
- `404 Not Found`: Course not found
- `500 Internal Server Error`: Server error

---

## Usage Examples

### Example 1: Create a Health Program for Patients

```javascript
const response = await fetch('/api/courses', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: JSON.stringify({
    title: 'Heart Health Management',
    description: 'Complete guide to maintaining cardiovascular health',
    category: 'HealthProgram',
    targetAudience: 'Patient',
    healthConditions: ['Heart Disease', 'Hypertension'],
    difficulty: 'Beginner',
    duration: 6,
    modules: [...]
  })
});
```

### Example 2: Create a Professional Course for Doctors

```javascript
const response = await fetch('/api/courses', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: JSON.stringify({
    title: 'Advanced Cardiology Techniques',
    description: 'Latest techniques in cardiology for medical professionals',
    category: 'ProfessionalCourse',
    targetAudience: 'Doctor',
    difficulty: 'Advanced',
    duration: 10,
    modules: [...]
  })
});
```

### Example 3: Get Published Health Programs

```javascript
const response = await fetch('/api/courses?category=HealthProgram&isPublished=true');
const data = await response.json();
console.log(`Found ${data.count} health programs`);
```

### Example 4: Publish a Course

```javascript
const response = await fetch(`/api/courses/${courseId}/publish`, {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN'
  }
});
```

## Testing

### Run Model Tests

```bash
node scripts/test_course_api.js
```

### Run API Endpoint Tests (requires server running)

```bash
# Start the server first
npm start

# In another terminal
bash scripts/test_course_curl.sh
```

## Requirements Validation

This implementation satisfies the following requirements from the design document:

- **Requirement 14.1**: Display educational content as "Health Programs" for Patient role
- **Requirement 14.2**: Display educational content as "Courses" for Doctor role
- **Requirement 14.3**: Display educational content as "Courses" for Instructor role
- **Requirement 14.12**: Allow Instructor to categorize content as patient-focused or professional

### Features Implemented:

✅ Course model with modules and lessons
✅ Course categories (HealthProgram, ProfessionalCourse)
✅ Target audience (Patient, Doctor, Both)
✅ Quiz functionality per module
✅ Published status management
✅ Instructor-only course creation and management
✅ Filtering by category, audience, and other criteria
✅ Complete CRUD operations
✅ Authorization checks

## Notes

- Only users with the "Instructor" role can create, update, delete, publish, or unpublish courses
- Courses must have at least one module before they can be published
- The `instructor` field is automatically set to the authenticated user's ID when creating a course
- All timestamps are automatically managed by MongoDB
- Course ratings and enrollment counts are tracked but updated through separate enrollment endpoints (to be implemented in Task 19.4)
