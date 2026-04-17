const express = require("express");
const router = express.Router();
const Event = require("../model/Event");

// ✅ Create Event
router.post("/", async (req, res) => {
  try {
    const result = await Event.create(req.body);
    res.send({ id: result.insertId, ...req.body });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// ✅ Get Events
router.get("/", async (req, res) => {
  try {
    const events = await Event.findAll();
    res.send(events);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// ✅ Get Event by ID
router.get("/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).send("Event not found");
    }
    res.send(event);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// ✅ Get Organizer Events
router.get("/organizer/:organizerId", async (req, res) => {
  try {
    const events = await Event.findByCreatedBy(req.params.organizerId);
    res.send(events);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// ✅ Get User's My Events
router.get("/user/:userId", async (req, res) => {
  try {
    const events = await Event.findByRegisteredUser(req.params.userId);
    res.send(events);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// ✅ Register Event
router.post("/register/:id", async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: "User ID is required" 
      });
    }

    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ 
        success: false, 
        message: "Event not found" 
      });
    }

    if (event.slots <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: "No slots available" 
      });
    }

    // Check if user already registered
    let registeredUsers = event.registeredUsers;
    
    // Handle various formats that might come from MySQL
    if (typeof registeredUsers === 'string') {
      try {
        registeredUsers = JSON.parse(registeredUsers);
      } catch (err) {
        registeredUsers = [];
      }
    }
    
    // Ensure it's an array
    if (!Array.isArray(registeredUsers)) {
      registeredUsers = [];
    }

    if (registeredUsers.includes(userId)) {
      return res.status(400).json({ 
        success: false, 
        message: "You are already registered for this event" 
      });
    }

    const result = await Event.registerUser(req.params.id, userId);
    const updatedEvent = await Event.findById(req.params.id);
    
    res.json({ 
      success: true, 
      message: "Successfully registered for the event",
      event: updatedEvent 
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
});

// ✅ Unregister Event
router.post("/unregister/:id", async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: "User ID is required" 
      });
    }

    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ 
        success: false, 
        message: "Event not found" 
      });
    }

    // Get registered users from the event
    let registeredUsers = event.registeredUsers || [];
    
    // If it's a string, parse it
    if (typeof registeredUsers === 'string') {
      try {
        registeredUsers = JSON.parse(registeredUsers);
      } catch (err) {
        registeredUsers = [];
      }
    }
    
    // Ensure it's an array
    if (!Array.isArray(registeredUsers)) {
      registeredUsers = [];
    }

    // Check if user is registered (compare as strings to handle type mismatches)
    const isRegistered = registeredUsers.some(id => String(id) === String(userId));
    
    if (!isRegistered) {
      return res.status(400).json({ 
        success: false, 
        message: "You are not registered for this event" 
      });
    }

    // Remove user and increment slots
    registeredUsers = registeredUsers.filter(id => id !== userId);
    
    const query = `
      UPDATE events 
      SET slots = slots + 1, registeredUsers = ?
      WHERE id = ?
    `;
    
    const { getPool } = require("../db");
    const pool = getPool();
    const connection = await pool.getConnection();
    try {
      await connection.execute(query, [JSON.stringify(registeredUsers), req.params.id]);
    } finally {
      connection.release();
    }

    const updatedEvent = await Event.findById(req.params.id);
    
    res.json({ 
      success: true, 
      message: "Successfully unregistered from the event",
      event: updatedEvent 
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
});

// ✅ Get Registered Users for an Event
router.get("/:id/registered-users", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ 
        success: false, 
        message: "Event not found" 
      });
    }

    let registeredUsers = [];
    try {
      registeredUsers = JSON.parse(event.registeredUsers) || [];
    } catch (err) {
      registeredUsers = [];
    }

    res.json({ 
      success: true, 
      eventId: req.params.id,
      eventTitle: event.title,
      totalSlots: event.slots + registeredUsers.length,
      availableSlots: event.slots,
      registeredCount: registeredUsers.length,
      registeredUsers: registeredUsers
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
});

// ✅ Delete Event
router.delete("/:id", async (req, res) => {
  try {
    await Event.deleteById(req.params.id);
    res.send("Event deleted");
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// ✅ Update Event Details
router.put("/:id", async (req, res) => {
  try {
    const { title, description, date, time, location, slots, category, format, status } = req.body;
    const updateData = {};
    
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (date !== undefined) updateData.date = date;
    if (time !== undefined) updateData.time = time;
    if (location !== undefined) updateData.location = location;
    if (slots !== undefined) updateData.slots = slots;
    if (category !== undefined) updateData.category = category;
    if (format !== undefined) updateData.format = format;
    if (status !== undefined) updateData.status = status;
    
    await Event.updateById(req.params.id, updateData);
    const event = await Event.findById(req.params.id);
    res.send(event);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// ✅ Approve/Reject Event
router.put("/:id/approve", async (req, res) => {
  try {
    await Event.updateById(req.params.id, { status: req.body.status });
    const event = await Event.findById(req.params.id);
    res.send(event);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// ✅ Get Badges for User
router.get("/badges/user/:email", async (req, res) => {
  try {
    const email = req.params.email;
    const events = await Event.findByRegisteredUser(email);
    const registeredCount = events.length;
    
    const badges = [];
    
    if (registeredCount >= 5) {
      badges.push({
        id: 1,
        title: "Event Explorer",
        description: "Registered for 5 events",
        earnedAt: new Date(),
        icon: "🌟"
      });
    }
    
    if (registeredCount >= 25) {
      badges.push({
        id: 2,
        title: "Event Master",
        description: "Registered for 25 events",
        earnedAt: new Date(),
        icon: "👑"
      });
    }
    
    if (registeredCount >= 50) {
      badges.push({
        id: 3,
        title: "Event Legend",
        description: "Registered for 50 events",
        earnedAt: new Date(),
        icon: "🏆"
      });
    }
    
    if (registeredCount >= 100) {
      badges.push({
        id: 4,
        title: "Campus Ambassador",
        description: "Registered for 100 events",
        earnedAt: new Date(),
        icon: "🎖️"
      });
    }
    
    res.json(badges);
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
});

// ✅ Get Feedback for User
router.get("/feedback/user/:email", async (req, res) => {
  try {
    const email = req.params.email;
    // For now, return empty array. This can be expanded to fetch from a feedback table
    res.json([]);
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
});

// ✅ Submit Feedback for Event
router.post("/feedback", async (req, res) => {
  try {
    const { email, eventId, eventTitle, rating, comment } = req.body;
    
    if (!email || !eventId || !rating) {
      return res.status(400).json({ 
        success: false, 
        message: "Email, event ID, and rating are required" 
      });
    }
    
    // For now, just return success
    // This can be expanded to store feedback in a feedback table
    res.json({ 
      success: true, 
      message: "Feedback submitted successfully",
      feedback: {
        email,
        eventId,
        eventTitle,
        rating,
        comment,
        submittedAt: new Date()
      }
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
});

// ✅ Record Attendance (QR Code Check-in)
router.post("/attendance/checkin/:eventId", async (req, res) => {
  try {
    const { userId, qrCode } = req.body;
    const eventId = req.params.eventId;

    if (!userId || !eventId) {
      return res.status(400).json({
        success: false,
        message: "User ID and Event ID are required"
      });
    }

    // Verify user is registered for the event
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found"
      });
    }

    let registeredUsers = event.registeredUsers || [];
    if (typeof registeredUsers === 'string') {
      try {
        registeredUsers = JSON.parse(registeredUsers);
      } catch (err) {
        registeredUsers = [];
      }
    }

    if (!Array.isArray(registeredUsers) || !registeredUsers.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: "User is not registered for this event"
      });
    }

    // Record attendance
    const { Attendance } = require("../model/Event");
    await Attendance.recordAttendance(eventId, userId, qrCode);

    res.json({
      success: true,
      message: "✓ Attendance recorded successfully"
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

// ✅ Get Event Attendance Stats
router.get("/attendance/stats/:eventId", async (req, res) => {
  try {
    const { Attendance } = require("../model/Event");
    const stats = await Attendance.getEventAttendance(req.params.eventId);
    
    res.json({
      success: true,
      ...stats
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

// ✅ Get User Attendance History
router.get("/attendance/user/:userId", async (req, res) => {
  try {
    const { Attendance } = require("../model/Event");
    const attendance = await Attendance.getUserAttendance(req.params.userId);
    
    res.json({
      success: true,
      attendance: attendance
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

// ✅ Check if User Has Attended Event
router.get("/attendance/check/:eventId/:userId", async (req, res) => {
  try {
    const { Attendance } = require("../model/Event");
    const hasAttended = await Attendance.isUserAttended(req.params.eventId, req.params.userId);
    
    res.json({
      success: true,
      hasAttended: hasAttended
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

module.exports = router;