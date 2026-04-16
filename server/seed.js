require("dotenv").config();
const { connectDB, disconnectDB, getPool } = require("./db");
const Event = require("./model/Event");

const sampleEvents = [
  {
    title: "💻 Hackathon: CodeSprint 2026",
    description: "A 12-hour coding marathon focused on solving real-world problems using AI and web technologies.",
    date: "2026-05-15",
    time: "9:00 AM – 9:00 PM",
    location: "Main Auditorium",
    eligibility: "All CSE/IT students",
    slots: 100,
    imageUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=600&fit=crop",
    category: "hackathon",
    createdBy: "admin@example.com",
    status: "approved"
  },
  {
    title: "🧠 Seminar: AI in Healthcare",
    description: "Experts discuss how artificial intelligence is transforming diagnosis and patient care.",
    date: "2026-05-18",
    time: "10:00 AM – 12:00 PM",
    location: "Seminar Hall 2",
    eligibility: "All departments",
    slots: 150,
    imageUrl: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&h=600&fit=crop",
    category: "seminar",
    createdBy: "admin@example.com",
    status: "approved"
  },
  {
    title: "🎤 Guest Lecture: Future of Startups",
    description: "A successful entrepreneur shares insights on building startups and funding strategies.",
    date: "2026-05-20",
    time: "2:00 PM – 4:00 PM",
    location: "Conference Hall",
    eligibility: "Final year students",
    slots: 120,
    imageUrl: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&h=600&fit=crop",
    category: "guest-lecture",
    createdBy: "admin@example.com",
    status: "approved"
  },
  {
    title: "🎭 Cultural Fest: Kala Utsav",
    description: "Dance, music, drama, and art performances showcasing student talent.",
    date: "2026-05-25",
    time: "4:00 PM – 9:00 PM",
    location: "Open Ground",
    eligibility: "All students",
    slots: 300,
    imageUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=600&fit=crop",
    category: "cultural",
    createdBy: "admin@example.com",
    status: "approved"
  },
  {
    title: "📊 Workshop: Data Science Bootcamp",
    description: "Hands-on workshop covering Python, data analysis, and visualization.",
    date: "2026-05-28",
    time: "9:30 AM – 3:30 PM",
    location: "Lab 3",
    eligibility: "2nd year & above",
    slots: 60,
    imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop",
    category: "workshop",
    createdBy: "admin@example.com",
    status: "approved"
  },
  {
    title: "🏆 Coding Contest: Debug Battle",
    description: "Competitive programming contest focused on debugging and logic building.",
    date: "2026-05-30",
    time: "11:00 AM – 2:00 PM",
    location: "Computer Lab 1",
    eligibility: "All coding enthusiasts",
    slots: 80,
    imageUrl: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800&h=600&fit=crop",
    category: "coding-contest",
    createdBy: "admin@example.com",
    status: "approved"
  },
  {
    title: "📢 Seminar: Cybersecurity Awareness",
    description: "Learn about online threats, ethical hacking, and data protection.",
    date: "2026-06-02",
    time: "10:30 AM – 12:30 PM",
    location: "Seminar Hall 1",
    eligibility: "All students",
    slots: 200,
    imageUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&h=600&fit=crop",
    category: "seminar",
    createdBy: "admin@example.com",
    status: "approved"
  },
  {
    title: "🎨 Art Competition: Creative Minds",
    description: "Showcase creativity through painting, sketching, and digital art.",
    date: "2026-06-05",
    time: "1:00 PM – 4:00 PM",
    location: "Arts Block",
    eligibility: "All students",
    slots: 50,
    imageUrl: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&h=600&fit=crop",
    category: "competition",
    createdBy: "admin@example.com",
    status: "approved"
  },
  {
    title: "🤖 Tech Expo: InnovateX",
    description: "Students present innovative tech projects and prototypes.",
    date: "2026-06-08",
    time: "10:00 AM – 5:00 PM",
    location: "Exhibition Hall",
    eligibility: "Project teams",
    slots: 40,
    imageUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=600&fit=crop",
    category: "tech-expo",
    createdBy: "admin@example.com",
    status: "approved"
  },
  {
    title: "🗣️ Debate Competition: Youth Parliament",
    description: "Debate on national and global issues in a parliamentary format.",
    date: "2026-06-10",
    time: "2:00 PM – 6:00 PM",
    location: "Auditorium",
    eligibility: "All departments",
    slots: 60,
    imageUrl: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&h=600&fit=crop",
    category: "competition",
    createdBy: "admin@example.com",
    status: "approved"
  },
  {
    title: "🎬 Film Fest: Short Film Showcase",
    description: "Screening of student-created short films and documentaries.",
    date: "2026-06-12",
    time: "3:00 PM – 7:00 PM",
    location: "Mini Theater",
    eligibility: "Media & all students",
    slots: 100,
    imageUrl: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800&h=600&fit=crop",
    category: "cultural",
    createdBy: "admin@example.com",
    status: "approved"
  },
  {
    title: "🧪 Workshop: Robotics Basics",
    description: "Introduction to robotics, sensors, and Arduino programming.",
    date: "2026-06-15",
    time: "9:00 AM – 1:00 PM",
    location: "Robotics Lab",
    eligibility: "1st & 2nd year students",
    slots: 40,
    imageUrl: "https://images.unsplash.com/photo-1561557944-6e7860d1a7eb?w=800&h=600&fit=crop",
    category: "workshop",
    createdBy: "admin@example.com",
    status: "approved"
  },
  {
    title: "🏏 Sports Event: Inter-College Cricket Tournament",
    description: "Competitive cricket tournament among colleges.",
    date: "2026-06-18",
    time: "8:00 AM – 5:00 PM",
    location: "College Ground",
    eligibility: "Registered teams",
    slots: 16,
    imageUrl: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&h=600&fit=crop",
    category: "sports",
    createdBy: "admin@example.com",
    status: "approved"
  },
  {
    title: "💼 Career Fair: Placement Drive 2026",
    description: "Top companies recruit students for internships and full-time roles.",
    date: "2026-06-22",
    time: "9:00 AM – 4:00 PM",
    location: "Placement Cell",
    eligibility: "Final year students",
    slots: 200,
    imageUrl: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&h=600&fit=crop",
    category: "career",
    createdBy: "admin@example.com",
    status: "approved"
  },
  {
    title: "🌱 Awareness Event: Environment Day Campaign",
    description: "Tree plantation drive and awareness on sustainability.",
    date: "2026-06-25",
    time: "10:00 AM – 1:00 PM",
    location: "Campus Garden",
    eligibility: "All students",
    slots: 150,
    imageUrl: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&h=600&fit=crop",
    category: "awareness",
    createdBy: "admin@example.com",
    status: "approved"
  }
];

async function seedDatabase() {
  try {
    await connectDB();
    const pool = getPool();

    // Check if events already exist
    const query = "SELECT COUNT(*) as count FROM events";
    const connection = await pool.getConnection();
    const [countResult] = await connection.execute(query);
    connection.release();

    const count = countResult[0].count;
    
    if (count > 0) {
      console.log(`ℹ️  Database already has ${count} events. Clearing and re-seeding...`);
      const deleteQuery = "DELETE FROM events";
      const deleteConnection = await pool.getConnection();
      await deleteConnection.execute(deleteQuery);
      deleteConnection.release();
    }

    // Insert all 15 sample events
    for (const event of sampleEvents) {
      await Event.create(event);
    }

    console.log(`\n✅ Successfully seeded ${sampleEvents.length} events!\n`);

    // Display inserted events
    const displayQuery = "SELECT id, title, category, slots FROM events";
    const displayConnection = await pool.getConnection();
    const [insertedEvents] = await displayConnection.execute(displayQuery);
    displayConnection.release();

    console.log("📋 Inserted Events:");
    console.log("─".repeat(60));
    insertedEvents.forEach((event, index) => {
      console.log(`  ${index + 1}. ${event.title}`);
      console.log(`     Category: ${event.category} | Slots: ${event.slots}`);
    });
    console.log("─".repeat(60));

    await disconnectDB();
    console.log("\n✅ Seed complete. Database disconnected.");
  } catch (err) {
    console.error("❌ Error seeding database:", err.message);
    process.exit(1);
  }
}

seedDatabase();