# API Documentation

## Overview

NutriFuel uses a combination of server-side API routes (Next.js API Routes) and client-side API calls to OpenAI for AI-powered features.

---

## API Routes

All API routes are located in the `app/api/` directory and follow Next.js App Router conventions.

### Base URL
- **Development**: `http://localhost:3000/api`
- **Production**: `https://your-domain.com/api`

---

## Endpoints

### 1. Nutrition Goals

#### `POST /api/nutrition-goals`

Estimates daily nutrition goals based on user profile.

**Request Body:**
```json
{
  "age": 25,
  "sex": "male",
  "height": 175,
  "weight": 70,
  "goal": "maintain",
  "activityLevel": "moderate"
}
```

**Response:**
```json
{
  "calories": 2200,
  "protein": 165,
  "carbs": 248,
  "fat": 73,
  "water": 2450
}
```

**Calculation Method:**
- Uses Mifflin-St Jeor equation for BMR
- Applies activity multiplier
- Adjusts for weight goal (lose/maintain/gain)

---

### 2. Local Dishes Discovery

#### `POST /api/dishes`

Retrieves local dishes for a destination, filtered by dietary restrictions.

**Request Body:**
```json
{
  "destination": "Japan",
  "allergies": ["Gluten", "Shellfish"],
  "preferences": ["Vegetarian"]
}
```

**Response:**
```json
{
  "dishes": [
    {
      "name": "Vegetable Tempura",
      "localName": "野菜天ぷら",
      "description": "Lightly battered and fried seasonal vegetables",
      "category": "main",
      "estimatedCalories": 350,
      "allergens": ["Gluten"],
      "isVegetarian": true,
      "culturalNote": "Best paired with tentsuyu dipping sauce"
    }
  ],
  "beverages": [
    {
      "name": "Green Tea",
      "localName": "緑茶",
      "description": "Traditional Japanese green tea",
      "estimatedCalories": 0,
      "caffeine": 30,
      "culturalNote": "Often served with meals"
    }
  ]
}
```

---

### 3. Meal Plan Generation

#### `POST /api/meal-plan`

Generates a complete meal plan for a trip.

**Request Body:**
```json
{
  "trip": {
    "id": "trip_123",
    "destination": "Japan",
    "departureCity": "New York",
    "arrivalDate": "2026-03-15",
    "returnDate": "2026-03-22",
    "arrivalTime": "14:00",
    "returnTime": "18:00",
    "timezoneShift": 14
  },
  "profile": {
    "dailyCalorieTarget": 2200,
    "macros": {
      "protein": 165,
      "carbs": 248,
      "fat": 73
    },
    "allergies": [],
    "dietaryPreferences": []
  },
  "selectedDishes": []
}
```

**Response:**
```json
{
  "plan": {
    "id": "plan_123",
    "tripId": "trip_123",
    "days": [
      {
        "date": "2026-03-15",
        "meals": [
          {
            "time": "08:00",
            "type": "breakfast",
            "name": "Traditional Japanese Breakfast",
            "description": "...",
            "calories": 450,
            "protein": 20,
            "carbs": 60,
            "fat": 15
          }
        ]
      }
    ],
    "caffeineRecommendation": {
      "suggestion": "...",
      "timing": []
    }
  }
}
```

---

### 4. Meal Analysis

#### `POST /api/analyze-meal`

Analyzes a meal photo or description for nutritional content.

**Request Body:**
```json
{
  "image": "base64_encoded_image_string",
  "description": "Optional text description"
}
```

**Response:**
```json
{
  "name": "Chicken Teriyaki Bowl",
  "description": "Grilled chicken with teriyaki sauce over rice",
  "calories": 620,
  "protein": 38,
  "carbs": 75,
  "fat": 18,
  "breakdown": [
    {
      "item": "Chicken breast",
      "calories": 280,
      "protein": 35,
      "carbs": 0,
      "fat": 14
    }
  ]
}
```

---

### 5. Menu Analysis

#### `POST /api/analyze-menu`

Analyzes a restaurant menu image to find suitable dishes.

**Request Body:**
```json
{
  "image": "base64_encoded_menu_image",
  "allergies": ["Peanuts"],
  "preferences": ["Low Carb"],
  "dailyTargets": {
    "calories": 2200,
    "protein": 165,
    "carbs": 248,
    "fat": 73
  }
}
```

**Response:**
```json
{
  "recommendations": [
    {
      "dishName": "Grilled Salmon",
      "estimatedNutrition": {
        "calories": 450,
        "protein": 42,
        "carbs": 8,
        "fat": 26
      },
      "reasons": ["High protein", "Low carb", "No allergens"],
      "warnings": []
    }
  ]
}
```

---

### 6. Plan Adaptation

#### `POST /api/adapt-plan`

Adapts an existing meal plan based on new preferences or logged meals.

**Request Body:**
```json
{
  "planId": "plan_123",
  "loggedMeals": [],
  "remainingDays": 5,
  "preferences": {
    "avoidRepetition": true,
    "preferLocal": true
  }
}
```

---

### 7. Dynamic Targets

#### `POST /api/dynamic-targets`

Calculates adjusted nutrition targets based on activity level and logged data.

**Request Body:**
```json
{
  "baseTargets": {
    "calories": 2200,
    "protein": 165,
    "carbs": 248,
    "fat": 73
  },
  "activityBoost": "high",
  "loggedToday": {
    "calories": 800,
    "protein": 45,
    "carbs": 90,
    "fat": 30
  }
}
```

---

### 8. Nutrium Integration

#### `POST /api/nutrium/send-trip-summary`

Sends trip summary to connected Nutrium account.

**Request Body:**
```json
{
  "nutriumApiKey": "user_nutrium_key",
  "tripId": "trip_123",
  "summary": {
    "destination": "Japan",
    "dates": "March 15-22, 2026",
    "totalMeals": 21,
    "averageCalories": 2150
  }
}
```

---

## Error Handling

All endpoints return errors in the following format:

```json
{
  "error": "Error message description",
  "code": "ERROR_CODE",
  "details": {}
}
```

### Common Status Codes
- `200`: Success
- `400`: Bad Request (invalid input)
- `401`: Unauthorized (missing API key)
- `429`: Rate limit exceeded
- `500`: Internal Server Error

---

## Rate Limiting

- OpenAI API calls are subject to OpenAI's rate limits
- Implement caching for repeated requests
- Consider using fallback data for common requests

---

## OpenAI Integration

### Models Used
- **GPT-4**: Meal analysis, menu scanning, complex recommendations
- **Vision API**: Image analysis for meals and menus

### Prompt Engineering
All prompts are carefully crafted to:
- Return structured JSON responses
- Provide detailed nutritional breakdowns
- Consider cultural context
- Respect dietary restrictions

---

## Local Storage API

Client-side data is stored using the browser's `localStorage`:

### Keys
- `nutrifuel_profile`: User profile data
- `nutrifuel_trips`: Array of trips
- `nutrifuel_active_trip`: Current trip ID
- `nutrifuel_meal_log`: Logged meals
- `nutrifuel_allergy_options`: Custom allergies
- `nutrifuel_diet_options`: Custom diet preferences

---

## Security Considerations

1. **API Keys**: 
   - Never expose OpenAI API keys in client code
   - Use environment variables
   - Consider implementing API key rotation

2. **Input Validation**:
   - All user inputs are validated server-side
   - Image uploads are limited in size
   - SQL injection protection (when database is added)

3. **Rate Limiting**:
   - Implement request throttling
   - Monitor API usage
   - Set usage quotas per user

---

## Future Enhancements

- [ ] Implement user authentication
- [ ] Add Redis caching layer
- [ ] Create webhook endpoints for real-time updates
- [ ] Implement GraphQL API option
- [ ] Add API versioning (v1, v2, etc.)
