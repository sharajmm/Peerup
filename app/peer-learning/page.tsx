"use client";

import React, { useState } from "react";
import { Search, User, Languages, Clock, Users } from "lucide-react";

const LANGUAGES = [
  "English",
  "Spanish",
  "French",
  "German",
  "Chinese",
  "Hindi",
];
const AVAILABILITY = ["Morning", "Afternoon", "Evening", "Weekend", "Weekday"];

export default function PeerLearningPage() {
  const [mode, setMode] = useState("learn");
  const [loading, setLoading] = useState(false);
  // ...other state for form fields...

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-blue-700 flex flex-col items-center py-12 px-4">
      {/* Header Section */}
      <div className="flex flex-col items-center mb-10">
        <div className="flex items-center justify-center mb-4">
          <span className="bg-white bg-opacity-20 backdrop-blur rounded-full p-3 mr-2">
            <Search size={24} className="text-white" />
          </span>
          <h1 className="text-4xl font-bold text-white">
            Find Your Learning Partners
          </h1>
        </div>
        <p className="text-lg text-white/80 max-w-xl text-center">
          Connect with peers to learn or teach new skills. Choose your mode and
          get started!
        </p>
      </div>

      {/* Mode Toggle */}
      <div className="flex justify-center mb-8">
        <div className="bg-white bg-opacity-20 backdrop-blur border border-white/30 rounded-xl shadow-lg flex p-2">
          <button
            className={`px-6 py-2 rounded-xl font-semibold transition-all ${
              mode === "learn"
                ? "bg-gradient-to-r from-blue-600 to-purple-700 text-white shadow"
                : "bg-white bg-opacity-10 text-white/70 hover:bg-opacity-20"
            }`}
            onClick={() => setMode("learn")}
          >
            I Want to Learn
          </button>
          <button
            className={`px-6 py-2 rounded-xl font-semibold transition-all ml-2 ${
              mode === "teach"
                ? "bg-gradient-to-r from-blue-600 to-purple-700 text-white shadow"
                : "bg-white bg-opacity-10 text-white/70 hover:bg-opacity-20"
            }`}
            onClick={() => setMode("teach")}
          >
            I Want to Teach
          </button>
        </div>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
        {/* Main Form (2 columns) */}
        <div className="md:col-span-2">
          <div className="bg-white bg-opacity-20 backdrop-blur border border-white/30 rounded-xl shadow-lg p-8">
            {/* ...Form content goes here... */}
            <h2 className="text-2xl font-bold text-white mb-6">
              {mode === "learn"
                ? "What do you want to learn?"
                : "What can you teach?"}
            </h2>
            {/* Example input fields, replace with actual form logic */}
            <input
              type="text"
              className="w-full mb-4 px-4 py-2 rounded-lg bg-white bg-opacity-30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={
                mode === "learn"
                  ? "e.g., JavaScript, Spanish conversation, Guitar basics"
                  : "e.g., React development, French conversation, Piano"
              }
              required
            />
            <select
              className="w-full mb-4 px-4 py-2 rounded-lg bg-white bg-opacity-30 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            >
              <option value="">Select Language</option>
              {LANGUAGES.map((lang) => (
                <option key={lang} value={lang} className="text-black">
                  {lang}
                </option>
              ))}
            </select>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {AVAILABILITY.map((slot) => (
                <label
                  key={slot}
                  className="flex items-center bg-white bg-opacity-10 rounded-lg px-3 py-2 text-white/80 cursor-pointer hover:bg-opacity-20"
                >
                  <input type="checkbox" className="mr-2 accent-purple-600" />
                  {slot}
                </label>
              ))}
            </div>
            <button
              className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-blue-600 to-purple-700 text-white shadow-lg flex items-center justify-center"
              disabled={loading}
            >
              {loading ? (
                <span className="animate-spin mr-2">
                  <Clock size={20} />
                </span>
              ) : null}
              {mode === "learn" ? "Find Teachers" : "Create Teaching Offer"}
            </button>
          </div>
        </div>

        {/* Sidebar (1 column) */}
        <div className="flex flex-col gap-8">
          {/* Requests For Me Component */}
          <div className="bg-white bg-opacity-20 backdrop-blur border border-white/30 rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <Users className="mr-2" /> Requests For Me
            </h3>
            {/* ...Request cards go here... */}
            <div className="text-white/70">No pending requests.</div>
          </div>
          {/* Tips for Success Card */}
          <div className="bg-white bg-opacity-20 backdrop-blur border border-white/30 rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <User className="mr-2" /> Tips for Success
            </h3>
            <ul className="list-disc pl-6 text-white/80 space-y-2">
              <li>Be specific about what you want to learn or teach</li>
              <li>Choose comfortable time slots for both parties</li>
              <li>Prepare questions or materials in advance</li>
              <li>Be patient and encouraging with your learning partner</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
