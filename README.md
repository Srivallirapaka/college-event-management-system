# College Event Management System 🎓📅

A comprehensive event management platform designed for college campuses to streamline event creation, registration, and attendance tracking. Built with modern web technologies and featuring role-based access control.

## 🌟 Features

### For Users
- **Browse & Register** - Discover and register for campus events
- **Event Details** - View comprehensive event information with images, location, and schedule
- **QR Check-in** - Scan QR codes for automatic event attendance tracking
- **Profile Management** - Manage personal profile and track registered events
- **Badges & Achievements** - Earn badges based on event attendance
- **Notifications** - Stay updated with upcoming events within 24 hours
- **Feedback** - Leave feedback and ratings for attended events

### For Organizers
- **Event Creation** - Create and manage events with full customization
- **Registration Dashboard** - Monitor event registrations in real-time
- **Analytics** - Track event statistics including attendance rates
- **Attendee Management** - View attendee details and check-in status
- **Event Status Control** - Update event status (pending, approved, completed)
- **Dashboard Overview** - Quick stats on total events, registrations, and attendance

### For Administrators
- **Admin Dashboard** - Comprehensive platform overview and management
- **Event Approval** - Review and approve/reject event submissions
- **User Management** - Manage users, organizers, and admins
- **Platform Analytics** - View platform-wide statistics and trends
- **Admin Profile** - Dedicated admin profile with platform insights
- **Registration Metrics** - Monitor occupancy and registration rates

## 🛠️ Tech Stack

### Frontend
- **React** with Vite for fast development
- **Tailwind CSS** for modern, responsive styling
- **Axios** for API communication
- **React Query** for state management
- **Firebase** for authentication
- **Lucide React** for beautiful icons
- **QR Code** (qrcode.react) for attendance tracking
- **Recharts** for analytics visualization

### Backend
- **Node.js** with Express.js framework
- **MySQL** database (migrated from MongoDB)
- **RESTful API** architecture
- **Firebase Authentication** integration

### Deployment
- Local development with npm

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MySQL Server
- Firebase account (for authentication)

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/Srivallirapaka/college-event-management-system.git
cd college-event-management-system
```

### 2. Backend Setup

```bash
cd server
npm install
```

**Configure Database:**
- Create a MySQL database
- Update database connection in `server/db.js` with your credentials

**Environment Variables** (create `.env` in server directory):
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=event_management
PORT=5000
```

**Start Server:**
```bash
npm run dev
# Server runs on http://localhost:5000
```

### 3. Frontend Setup

```bash
cd client
npm install
```

**Configure Firebase:**
- Update Firebase credentials in `client/src/firebase.js`

**Start Client:**
```bash
npm run dev
# Client runs on http://localhost:5173
```

## 📱 User Roles

### 1. **User** 👤
- Browse and register for events
- Check-in using QR codes
- View personal dashboard and profiles
- Earn badges and provide feedback

### 2. **Organizer** 👥
- Create and manage events
- View registration metrics
- Monitor attendee check-ins
- Access analytics dashboard
- No access to user profile page

### 3. **Admin** 🔐
- Approve/reject events
- View platform-wide analytics
- Manage all users and organizers
- Dedicated admin profile page
- Full system control

## 🎯 Core Features in Detail

### Event Management
- Create events with title, description, location, date, time
- Upload event poster images (optional - displays blank if missing)
- Set event capacity and track occupancy percentage
- Categorize events (Tech, Sports, Arts, Workshop, etc.)
- Real-time registration count updates

### Attendance Tracking
- **QR Code Generation** - Automatic QR code for each event
- **Check-in System** - Users scan QR to mark attendance
- **Attendance Verification** - Admin can verify attendance records
- **Attendance History** - Users can view their check-in history

### Dashboard Analytics
- **User Dashboard** - Registered events, upcoming events, badges
- **Organizer Dashboard** - Event metrics, registration stats, occupancy rates
- **Admin Dashboard** - Platform overview, approval pending, user statistics

### UI/UX Enhancements
- Professional solid blue gradient theme (from-blue-600 to-blue-700)
- Responsive design for mobile, tablet, and desktop
- Light backgrounds with high contrast for readability
- Smooth transitions and hover effects
- Bottom navigation for quick access

## 📊 Database Schema

### Key Tables
- **users** - User accounts with authentication
- **events** - Event information and details
- **registrations** - User event registrations
- **attendance** - QR code check-in records
- **badges** - User achievements and badges
- **feedback** - Event feedback and ratings

## 🔐 Security Features

- Firebase authentication for secure login
- Role-based access control (RBAC)
- Protected routes for each user role
- Unique QR codes per event for attendance
- CORS enabled for secure API communication

## 📝 API Endpoints (Sample)

### Events
- `GET /events` - Get all events
- `POST /events` - Create new event
- `GET /events/:id` - Get event details
- `PUT /events/:id` - Update event

### Attendance
- `POST /events/attendance/checkin/:eventId` - Check-in user
- `GET /events/attendance/stats/:eventId` - Get attendance stats
- `GET /events/attendance/user/:userId` - User attendance history

### Registrations
- `GET /events/:eventId/registrations` - Get registrations
- `POST /events/:eventId/register` - Register user

## 🎨 Color Theme

The application uses a modern professional blue gradient theme:
- **Primary Gradient**: `from-blue-600 to-blue-700`
- **Light Background**: `from-blue-50 to-blue-100`
- **Accent**: Light blue shades for cards and badges
- **Text**: Dark slate for high contrast readability

## 🐛 Troubleshooting

### Frontend Won't Start
```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install
npm run dev
```

### Backend Connection Issues
- Ensure MySQL server is running
- Verify database credentials in `db.js`
- Check if port 5000 is available

### QR Code Not Working
- Ensure event has an ID in the database
- Browser may need camera permissions for mobile

## 📖 Project Structure

```
college-event-management-system/
├── client/                          # React frontend
│   ├── src/
│   │   ├── pages/                  # Page components
│   │   ├── components/             # Reusable components
│   │   ├── assets/                 # Images and static files
│   │   └── firebase.js             # Firebase config
│   └── package.json
├── server/                          # Express backend
│   ├── routes/                     # API routes
│   ├── model/                      # Database models
│   ├── db.js                       # Database connection
│   └── package.json
└── README.md
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors

- **Srivalli Rapaka** - Project Creator and Developer

## 📞 Support

For support or questions, please open an issue on the GitHub repository:
https://github.com/Srivallirapaka/college-event-management-system/issues

## 🙏 Acknowledgments

- Firebase for authentication
- Tailwind CSS for styling framework
- React community for amazing tools
- All contributors and testers

---

**Happy Event Managing! 🎉**

Last Updated: April 17, 2026
