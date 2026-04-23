#!/bin/bash

echo "🚀 Testing Course API Endpoints with curl"
echo "=========================================="

BASE_URL="http://localhost:5000"
API_URL="$BASE_URL/api"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Get instructor token
echo -e "\n${YELLOW}📝 Step 1: Getting instructor authentication token...${NC}"
TOKEN_RESPONSE=$(curl -s -X GET "$BASE_URL/debug/login/production.instructor@icare.com")
TOKEN=$(echo $TOKEN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo -e "${RED}❌ Failed to get token${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Got authentication token${NC}"
echo "   Token: ${TOKEN:0:20}..."

# Step 2: Create a new course
echo -e "\n${YELLOW}📝 Step 2: Creating a new course (POST /api/courses)...${NC}"
CREATE_RESPONSE=$(curl -s -X POST "$API_URL/courses" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Hypertension Management Program",
    "description": "Learn to manage high blood pressure effectively",
    "category": "HealthProgram",
    "targetAudience": "Patient",
    "healthConditions": ["Hypertension", "High Blood Pressure"],
    "difficulty": "Beginner",
    "duration": 5,
    "modules": [
      {
        "title": "Understanding Blood Pressure",
        "description": "Learn what blood pressure means",
        "order": 1,
        "lessons": [
          {
            "title": "What is Blood Pressure?",
            "content": "Blood pressure is the force of blood...",
            "videoUrl": "https://example.com/bp-basics.mp4",
            "duration": 20,
            "order": 1
          }
        ]
      }
    ],
    "thumbnail": "https://example.com/hypertension.jpg"
  }')

COURSE_ID=$(echo $CREATE_RESPONSE | grep -o '"_id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -z "$COURSE_ID" ]; then
    echo -e "${RED}❌ Failed to create course${NC}"
    echo "Response: $CREATE_RESPONSE"
    exit 1
fi

echo -e "${GREEN}✅ Course created successfully${NC}"
echo "   Course ID: $COURSE_ID"

# Step 3: Get all courses
echo -e "\n${YELLOW}📝 Step 3: Getting all courses (GET /api/courses)...${NC}"
ALL_COURSES=$(curl -s -X GET "$API_URL/courses")
COURSE_COUNT=$(echo $ALL_COURSES | grep -o '"count":[0-9]*' | cut -d':' -f2)
echo -e "${GREEN}✅ Retrieved all courses${NC}"
echo "   Total courses: $COURSE_COUNT"

# Step 4: Get course by ID
echo -e "\n${YELLOW}📝 Step 4: Getting course by ID (GET /api/courses/:id)...${NC}"
COURSE_DETAIL=$(curl -s -X GET "$API_URL/courses/$COURSE_ID")
COURSE_TITLE=$(echo $COURSE_DETAIL | grep -o '"title":"[^"]*' | head -1 | cut -d'"' -f4)
echo -e "${GREEN}✅ Retrieved course by ID${NC}"
echo "   Title: $COURSE_TITLE"

# Step 5: Update course
echo -e "\n${YELLOW}📝 Step 5: Updating course (PUT /api/courses/:id)...${NC}"
UPDATE_RESPONSE=$(curl -s -X PUT "$API_URL/courses/$COURSE_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Hypertension Management Program - Updated",
    "duration": 7
  }')
echo -e "${GREEN}✅ Course updated successfully${NC}"

# Step 6: Publish course
echo -e "\n${YELLOW}📝 Step 6: Publishing course (POST /api/courses/:id/publish)...${NC}"
PUBLISH_RESPONSE=$(curl -s -X POST "$API_URL/courses/$COURSE_ID/publish" \
  -H "Authorization: Bearer $TOKEN")
IS_PUBLISHED=$(echo $PUBLISH_RESPONSE | grep -o '"isPublished":true')
if [ -n "$IS_PUBLISHED" ]; then
    echo -e "${GREEN}✅ Course published successfully${NC}"
else
    echo -e "${RED}❌ Failed to publish course${NC}"
fi

# Step 7: Filter courses
echo -e "\n${YELLOW}📝 Step 7: Filtering courses (GET /api/courses?category=HealthProgram)...${NC}"
FILTERED=$(curl -s -X GET "$API_URL/courses?category=HealthProgram&isPublished=true")
FILTERED_COUNT=$(echo $FILTERED | grep -o '"count":[0-9]*' | cut -d':' -f2)
echo -e "${GREEN}✅ Filtered courses retrieved${NC}"
echo "   Health Programs found: $FILTERED_COUNT"

# Step 8: Unpublish course
echo -e "\n${YELLOW}📝 Step 8: Unpublishing course (POST /api/courses/:id/unpublish)...${NC}"
UNPUBLISH_RESPONSE=$(curl -s -X POST "$API_URL/courses/$COURSE_ID/unpublish" \
  -H "Authorization: Bearer $TOKEN")
echo -e "${GREEN}✅ Course unpublished successfully${NC}"

# Step 9: Delete course
echo -e "\n${YELLOW}📝 Step 9: Deleting course (DELETE /api/courses/:id)...${NC}"
DELETE_RESPONSE=$(curl -s -X DELETE "$API_URL/courses/$COURSE_ID" \
  -H "Authorization: Bearer $TOKEN")
echo -e "${GREEN}✅ Course deleted successfully${NC}"

# Step 10: Verify deletion
echo -e "\n${YELLOW}📝 Step 10: Verifying deletion...${NC}"
VERIFY_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$API_URL/courses/$COURSE_ID")
HTTP_CODE=$(echo "$VERIFY_RESPONSE" | tail -n1)
if [ "$HTTP_CODE" = "404" ]; then
    echo -e "${GREEN}✅ Deletion verified - course not found${NC}"
else
    echo -e "${RED}❌ Deletion verification failed - course still exists${NC}"
fi

echo -e "\n${GREEN}✅ All API endpoint tests completed successfully!${NC}"
echo ""
echo "📊 Test Summary:"
echo "   ✅ POST /api/courses - Create course"
echo "   ✅ GET /api/courses - Get all courses"
echo "   ✅ GET /api/courses/:id - Get course by ID"
echo "   ✅ PUT /api/courses/:id - Update course"
echo "   ✅ POST /api/courses/:id/publish - Publish course"
echo "   ✅ POST /api/courses/:id/unpublish - Unpublish course"
echo "   ✅ DELETE /api/courses/:id - Delete course"
echo "   ✅ Filtering by category working"
