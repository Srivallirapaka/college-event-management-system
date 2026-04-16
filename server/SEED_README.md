# MongoDB Seed Instructions

To populate your MongoDB database with the 15 sample campus events, follow these steps:

## Prerequisites
- Ensure MongoDB is running locally on port 27017
- Navigate to the `server` directory
- Install dependencies if not already done: `npm install`

## Seed Database

Run the seed script:
```bash
node seed.js
```

This will create 15 campus events including:
- **3 Hackathons**: CodeStorm, Robotics, Blockchain
- **3 Seminars**: AI in Education, Cloud Computing, Career Guidance  
- **3 Workshops**: Web Development, Data Science, Machine Learning
- **3 Guest Lectures**: Cybersecurity, Entrepreneurship, Space Technology
- **3 Cultural Events**: Utsav Fest, Music Night, Annual Cultural Day

All events will be:
- Approved and visible to users
- Assigned to admin@example.com as organizer
- Include sample image URLs, descriptions, dates, and slot counts

## Verify Seeded Data

After seeding, you can:
1. Log in as Admin to view all events in the Admin Dashboard
2. Log in as Organizer to see events created by other admins
3. Log in as User to browse and register for events

The seed script checks if events already exist to prevent duplicates.

## Notes
- Image URLs use Unsplash for high-quality stock photos
- All events are set to "approved" status - change this to "pending" if you want admin approval workflow
- Dates are set for April-August 2026 - adjust as needed
- Slot counts range from 80-600 depending on event size
