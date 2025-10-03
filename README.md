# CleanConnect: Smart Waste Management System

Welcome to the official repository for CleanConnect. This project is a full-stack MERN application designed to revolutionize urban waste management using smart, IoT-enabled dustbins and AI-powered logistics.

## Tech Stack

- **Frontend:** React, Vite, React Router, Standard CSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB with Mongoose
- **AI:** Google Gemini Pro for route optimization and user assistance
- **Deployment:** (To be decided - e.g., Vercel, AWS, Heroku)

## Project Structure

This project is a monorepo containing three main packages:

- **/client:** The React frontend application.
- **/server:** The Node.js/Express backend API.
- **/ai-services:** A dedicated module for interacting with the Gemini API.

## Setup & Installation

**Prerequisites:** Node.js (v18+), npm, and MongoDB (local or Atlas cluster).

1.  **Clone the repository:**
    `git clone <your-repository-url>`

2.  **Install all dependencies from the root:**
    `npm install`

3.  **Environment Variables:**
    - Navigate to the `server` directory.
    - Copy the `.env.example` file to a new file named `.env`.
    - Fill in the required values (MONGO_URI, PORT, GEMINI_API_KEY).

## Running the Application

From the **root directory**, run the following command to start both the frontend and backend servers concurrently:

`npm run dev`

- The backend server will be available at `http://localhost:5000`
- The frontend development server will be available at `http://localhost:5173`