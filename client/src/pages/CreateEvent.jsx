import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus } from "lucide-react";
import { z } from "zod";
import { auth } from "../Firebase.js";

// Validation schema
const eventSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  date: z.string().refine(val => val !== "", "Date is required"),
  time: z.string().min(1, "Time is required"),
  location: z.string().min(3, "Location is required"),
  slots: z.string().transform(Number).refine(val => val > 0, "Slots must be greater than 0"),
  imageUrl: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  createdBy: z.string().min(1, "User ID is required"),
});

function CreateEvent() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    slots: "",
    imageUrl: "",
    category: "",
    createdBy: ""
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get user on mount
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setForm(prev => ({
          ...prev,
          createdBy: currentUser.uid
        }));
      }
    });
    return () => unsubscribe();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    try {
      // Validate form and use transformed values
      const parsed = eventSchema.parse(form);

      setIsSubmitting(true);
      await axios.post("http://localhost:5000/events", parsed);
      navigate("/organizer-dashboard");
    } catch (err) {
      if (err instanceof z.ZodError) {
        const newErrors = {};
        err.errors.forEach(error => {
          newErrors[error.path[0]] = error.message;
        });
        setErrors(newErrors);
      } else {
        setErrors({ submit: err.response?.data?.message || "Failed to create event. Please try again." });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="bg-black backdrop-blur-xl border-b border-rust/30 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate("/organizer-dashboard")}
            className="flex items-center gap-2 text-gray-sec hover:text-rust transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-black backdrop-blur border border-rust/30 rounded-2xl p-8 shadow-2xl shadow-rust-glow">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <Plus className="w-6 h-6 text-rust" />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Create New Event
              </h1>
            </div>
            <p className="text-gray-sec">Fill in the details to create an amazing event</p>
          </div>

          {/* Error Message */}
          {errors.submit && (
            <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/50 text-red-400 text-sm">
              {errors.submit}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Event Title
              </label>
              <input
                type="text"
                name="title"
                placeholder="e.g., Tech Conference 2024"
                value={form.title}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg bg-black/50 border transition-colors focus:outline-none focus:ring-2 ${
                  errors.title
                    ? "border-red-500/50 focus:ring-red-500"
                    : "border-rust/30 focus:ring-cyan-500 focus:border-rust"
                } text-white placeholder-gray-500`}
              />
              {errors.title && (
                <p className="text-red-400 text-sm mt-1">{errors.title}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Description
              </label>
              <textarea
                name="description"
                placeholder="Describe your event..."
                value={form.description}
                onChange={handleChange}
                rows="4"
                className={`w-full px-4 py-3 rounded-lg bg-black/50 border transition-colors focus:outline-none focus:ring-2 resize-none ${
                  errors.description
                    ? "border-red-500/50 focus:ring-red-500"
                    : "border-rust/30 focus:ring-cyan-500 focus:border-rust"
                } text-white placeholder-gray-500`}
              />
              {errors.description && (
                <p className="text-red-400 text-sm mt-1">{errors.description}</p>
              )}
            </div>

            {/* Date & Time Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Event Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg bg-black/50 border transition-colors focus:outline-none focus:ring-2 ${
                    errors.date
                      ? "border-red-500/50 focus:ring-red-500"
                      : "border-rust/30 focus:ring-cyan-500 focus:border-rust"
                  } text-white`}
                />
                {errors.date && (
                  <p className="text-red-400 text-sm mt-1">{errors.date}</p>
                )}
              </div>

              {/* Time */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Event Time
                </label>
                <input
                  type="time"
                  name="time"
                  value={form.time}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg bg-black/50 border transition-colors focus:outline-none focus:ring-2 ${
                    errors.time
                      ? "border-red-500/50 focus:ring-red-500"
                      : "border-rust/30 focus:ring-cyan-500 focus:border-rust"
                  } text-white`}
                />
                {errors.time && (
                  <p className="text-red-400 text-sm mt-1">{errors.time}</p>
                )}
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Event Location
              </label>
              <input
                type="text"
                name="location"
                placeholder="e.g., Convention Center, Hall A"
                value={form.location}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg bg-black/50 border transition-colors focus:outline-none focus:ring-2 ${
                  errors.location
                    ? "border-red-500/50 focus:ring-red-500"
                    : "border-rust/30 focus:ring-cyan-500 focus:border-rust"
                } text-white placeholder-gray-500`}
              />
              {errors.location && (
                <p className="text-red-400 text-sm mt-1">{errors.location}</p>
              )}
            </div>

            {/* Slots & Category Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Slots */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Available Slots
                </label>
                <input
                  type="number"
                  name="slots"
                  placeholder="e.g., 100"
                  value={form.slots}
                  onChange={handleChange}
                  min="1"
                  className={`w-full px-4 py-3 rounded-lg bg-black/50 border transition-colors focus:outline-none focus:ring-2 ${
                    errors.slots
                      ? "border-red-500/50 focus:ring-red-500"
                      : "border-rust/30 focus:ring-cyan-500 focus:border-rust"
                  } text-white placeholder-gray-500`}
                />
                {errors.slots && (
                  <p className="text-red-400 text-sm mt-1">{errors.slots}</p>
                )}
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Category
                </label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg bg-black/50 border transition-colors focus:outline-none focus:ring-2 ${
                    errors.category
                      ? "border-red-500/50 focus:ring-red-500"
                      : "border-rust/30 focus:ring-cyan-500 focus:border-rust"
                  } text-white`}
                >
                  <option value="">Select Category</option>
                  <option value="hackathon">Hackathon</option>
                  <option value="seminar">Seminar</option>
                  <option value="workshop">Workshop</option>
                  <option value="guest-lecture">Guest Lecture</option>
                  <option value="cultural">Cultural Event</option>
                </select>
                {errors.category && (
                  <p className="text-red-400 text-sm mt-1">{errors.category}</p>
                )}
              </div>
            </div>

            {/* Image URL */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Event Poster URL
              </label>
              <input
                type="url"
                name="imageUrl"
                placeholder="https://example.com/image.jpg"
                value={form.imageUrl}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg bg-black/50 border transition-colors focus:outline-none focus:ring-2 ${
                  errors.imageUrl
                    ? "border-red-500/50 focus:ring-red-500"
                    : "border-rust/30 focus:ring-cyan-500 focus:border-rust"
                } text-white placeholder-gray-500`}
              />
              {errors.imageUrl && (
                <p className="text-red-400 text-sm mt-1">{errors.imageUrl}</p>
              )}
            </div>



            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-3 px-6 rounded-lg bg-gradient-to-r from-rust to-rust text-black font-semibold hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    Create Event
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate("/organizer-dashboard")}
                className="flex-1 py-3 px-6 rounded-lg border border-gray-400/50 text-gray-sec hover:text-rust hover:border-rust/50 font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateEvent;