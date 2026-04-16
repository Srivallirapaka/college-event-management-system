# Event Management API Documentation

## Base URL
```
http://localhost:5000
```

---

## Endpoints

### 1. **Get All Events**
- **Method**: `GET`
- **URL**: `/events`
- **Description**: Retrieve all events from the database
- **Response**:
```json
[
  {
    "id": 1,
    "title": "💻 Hackathon: CodeSprint 2026",
    "description": "A 12-hour coding marathon...",
    "date": "2026-05-15",
    "time": "9:00 AM – 9:00 PM",
    "location": "Main Auditorium",
    "eligibility": "All CSE/IT students",
    "slots": 100,
    "imageUrl": "https://...",
    "category": "hackathon",
    "createdBy": "admin@example.com",
    "status": "approved",
    "registeredUsers": ["user1", "user2"],
    "createdAt": "2026-04-10T12:00:00.000Z"
  }
]
```

---

### 2. **Get Event by ID**
- **Method**: `GET`
- **URL**: `/events/:id`
- **Description**: Get detailed information about a specific event
- **Parameters**: 
  - `id` (integer) - Event ID
- **Response**: Single event object (see above)

---

### 3. **Get Events by Organizer**
- **Method**: `GET`
- **URL**: `/events/organizer/:organizerId`
- **Description**: Get all events created by a specific organizer
- **Parameters**:
  - `organizerId` (string) - Email or ID of the organizer
- **Response**: Array of event objects

---

### 4. **Get User's Registered Events**
- **Method**: `GET`
- **URL**: `/events/user/:userId`
- **Description**: Get all events a user is registered for
- **Parameters**:
  - `userId` (string) - Firebase User UID
- **Response**: Array of event objects

---

### 5. **Register for Event** ⭐
- **Method**: `POST`
- **URL**: `/events/register/:id`
- **Description**: Register a user for an event and decrement available slots
- **Parameters**:
  - `id` (integer) - Event ID
- **Request Body**:
```json
{
  "userId": "firebase-user-uid"
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Successfully registered for the event",
  "event": { /* updated event object */ }
}
```
- **Error Responses**:
  - 400: "User ID is required"
  - 400: "No slots available"
  - 400: "You are already registered for this event"
  - 404: "Event not found"

---

### 6. **Unregister from Event** ⭐
- **Method**: `POST`
- **URL**: `/events/unregister/:id`
- **Description**: Unregister a user from an event and restore a slot
- **Parameters**:
  - `id` (integer) - Event ID
- **Request Body**:
```json
{
  "userId": "firebase-user-uid"
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Successfully unregistered from the event",
  "event": { /* updated event object */ }
}
```
- **Error Responses**:
  - 400: "User ID is required"
  - 400: "You are not registered for this event"
  - 404: "Event not found"

---

### 7. **Get Registered Users for Event**
- **Method**: `GET`
- **URL**: `/events/:id/registered-users`
- **Description**: Get list of all users registered for a specific event
- **Parameters**:
  - `id` (integer) - Event ID
- **Response**:
```json
{
  "success": true,
  "eventId": 1,
  "eventTitle": "Hackathon: CodeSprint 2026",
  "totalSlots": 100,
  "availableSlots": 85,
  "registeredCount": 15,
  "registeredUsers": ["uid1", "uid2", "uid3"]
}
```

---

### 8. **Create Event**
- **Method**: `POST`
- **URL**: `/events`
- **Description**: Create a new event
- **Request Body**:
```json
{
  "title": "Event Title",
  "description": "Event description",
  "date": "2026-05-15",
  "time": "9:00 AM – 5:00 PM",
  "location": "Main Hall",
  "eligibility": "All students",
  "slots": 100,
  "imageUrl": "https://...",
  "category": "hackathon",
  "createdBy": "admin@example.com",
  "status": "pending"
}
```
- **Response**:
```json
{
  "id": 16,
  "title": "Event Title",
  ...
}
```

---

### 9. **Update Event Status**
- **Method**: `PUT`
- **URL**: `/events/:id/approve`
- **Description**: Update event approval status
- **Parameters**:
  - `id` (integer) - Event ID
- **Request Body**:
```json
{
  "status": "approved"
}
```
- **Response**: Updated event object

---

### 10. **Delete Event**
- **Method**: `DELETE`
- **URL**: `/events/:id`
- **Description**: Delete an event
- **Parameters**:
  - `id` (integer) - Event ID
- **Response**: `"Event deleted"`

---

## Common Response Patterns

### Success Response (JSON)
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

### Error Response (JSON)
```json
{
  "success": false,
  "message": "Error description"
}
```

---

## Registration Flow

### 1. User Sees Event
```
GET /events/:id
```

### 2. User Clicks "Register"
```
POST /events/register/:id
Body: { "userId": "firebase-uid" }
```

### 3. Backend Updates
- ✅ Checks if user already registered
- ✅ Verifies slots available
- ✅ Adds user to `registeredUsers` array
- ✅ Decrements `slots` count
- ✅ Returns updated event

### 4. Frontend Updates UI
- Shows "You're registered!"
- Changes button to "Unregister"
- Updates slot count in real-time

### 5. User Clicks "Unregister"
```
POST /events/unregister/:id
Body: { "userId": "firebase-uid" }
```

### 6. Backend Updates
- ✅ Removes user from `registeredUsers` array
- ✅ Increments `slots` count
- ✅ Returns updated event

---

## Slot Management

### Initial State
```
totalSlots = 100
registeredUsers = []
availableSlots = 100
```

### After 1 Registration
```
totalSlots = 100
registeredUsers = ["user1"]
availableSlots = 99
```

### After Unregistration
```
totalSlots = 100
registeredUsers = []
availableSlots = 100
```

---

## Error Handling

### Authentication Errors
- User must be logged in with Firebase
- Use `auth.currentUser` to get current user UID

### Validation Errors
- User ID is required
- Event must exist
- Slots must be available
- User cannot register twice

### Server Errors
- Check MySQL connection
- Verify database tables exist
- Check server logs

---

## Testing with cURL

### Get all events
```bash
curl http://localhost:5000/events
```

### Register for event
```bash
curl -X POST http://localhost:5000/events/register/1 \
  -H "Content-Type: application/json" \
  -d '{"userId": "test-user-id"}'
```

### Unregister from event
```bash
curl -X POST http://localhost:5000/events/unregister/1 \
  -H "Content-Type: application/json" \
  -d '{"userId": "test-user-id"}'
```

### Get registered users
```bash
curl http://localhost:5000/events/1/registered-users
```

---

## Frontend Integration

### Registering a User
```javascript
const handleRegister = async (eventId, userId) => {
  try {
    const response = await axios.post(
      `http://localhost:5000/events/register/${eventId}`,
      { userId }
    );
    console.log(response.data.message); // Success message
    // Refetch event data to update UI
  } catch (error) {
    console.error(error.response.data.message); // Error message
  }
};
```

### Unregistering a User
```javascript
const handleUnregister = async (eventId, userId) => {
  try {
    const response = await axios.post(
      `http://localhost:5000/events/unregister/${eventId}`,
      { userId }
    );
    console.log(response.data.message); // Success message
    // Refetch event data to update UI
  } catch (error) {
    console.error(error.response.data.message); // Error message
  }
};
```

---

## Database Schema

### Events Table
```sql
CREATE TABLE events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  date VARCHAR(50),
  time VARCHAR(50),
  location VARCHAR(255),
  eligibility VARCHAR(255),
  slots INT,
  imageUrl VARCHAR(500),
  category VARCHAR(100),
  createdBy VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending',
  registeredUsers JSON,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

### Slots Update Logic
- **Register**: `slots = slots - 1`
- **Unregister**: `slots = slots + 1`
- **Constraint**: `slots > 0` to register

---

## Notes
- All dates are stored as strings in `YYYY-MM-DD` format
- `registeredUsers` is stored as JSON array
- User IDs are Firebase UIDs
- Timestamps use UTC
- No authentication middleware (can be added later)
