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
    let registeredUsers = [];
    try {
      registeredUsers = JSON.parse(event.registeredUsers);
    } catch (err) {
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

    // Get registered users
    let registeredUsers = [];
    try {
      registeredUsers = JSON.parse(event.registeredUsers);
    } catch (err) {
      registeredUsers = [];
    }

    // Check if user is registered
    if (!registeredUsers.includes(userId)) {
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

module.exports = router;