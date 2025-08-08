# 🏨 YakRooms Frontend – Project Overview

YakRooms is a Bhutan-first hotel booking platform built with React and Vite. The frontend serves as the user interface layer for interacting with hotel listings, booking rooms, submitting reviews, and managing hotel operations. This project is integrated with a Spring Boot backend and focuses on delivering a fast, mobile-optimized, user-friendly experience.

---

## 🎯 Objective

Enable users and hotel admins to:

- Discover and filter verified hotels in Bhutan
- View hotel details including photos, amenities, and reviews
- Book rooms manually or online
- Submit reviews and ratings
- Support local businesses through a simple and intuitive digital platform

---

## 🛠 Tech Stack

- **Frontend**: React (Vite), TailwindCSS (Shadcn UI), React Router
- **Backend**: Spring Boot + MySQL (REST API)
- **Auth**: Firebase Authentication
- **CI/CD**: [Not configured yet]
- **Hosting**: Vercel/Firebase Hosting for React and Railway for Spring Boot

---

## ✅ Recent Feature Updates

- ✅ **Manual walk-in booking** flow completed
- ✅ **Hotel amenities update** functionality for admins
- ✅ **Review system**: Users can rate and review hotels
- ✅ **Search improvements**: Filter by district, hotel type, and amenities

---

## 📌 Key Notes for Claude / AI Agents

- Use **React functional components** and **hooks** (`useState`, `useEffect`, `useNavigate`, etc...)
- Follow **TailwindCSS utility-first** styling
- Structure logic cleanly inside `/services/` for API communication
- Maintain responsive design (mobile-first preferred)
- Integrate components progressively – break tasks down into granular PRs
- When suggesting improvements, align with performance, maintainability, and UX best practices

---

### 🧭 General Instructions for Claude (Code Generation Guide)

Always follow these principles when writing or modifying code in YakRooms:

#### 💡 Component Standards

- Use **React functional components** only (no class components).
- Always type props using **JSX**.
- Follow **component folder structure**: keep related logic, styles, and tests in one place.
- Prefer **Shadcn UI** + **TailwindCSS** utility classes for consistent styling.

#### 📦 Code Structure & Clean Architecture

- Abstract all API logic inside `/services/`.
- Avoid inline logic; extract functions when logic exceeds 3–5 lines.
- Reuse components. Do not duplicate UI or business logic.
- Co-locate logic with features (`/features/hotels/HotelCard.jsx`, `/features/bookings/useBookingForm.js`)

#### 🔐 Security & Data Handling

- Never expose sensitive data like Firebase config keys directly.
- Always validate data before sending to backend.
- Escape or sanitize inputs in forms if needed.

#### 🧠 AI-Aware Logic Suggestions

- If writing logic that could be AI-enhanced later (e.g. semantic search, booking suggestions), leave `// TODO: AI enhancement` comments.
- Propose smart ways to abstract business logic (e.g., availability rules, calendar logic) with scalability in mind.

#### 📄 Documentation & Comments

- Write **JSDoc** comments for all utility functions and API service methods.
- Include in-line comments **only where the logic is not obvious**.
- For each PR or large commit, generate a summary markdown comment.

#### 📱 Responsiveness & UX

- Design for **mobile-first** responsiveness.
- Use `flex`, `grid`, `gap`, and `min-h-screen` wisely.
- Default to accessible markup (semantic HTML + ARIA when needed).

## 📞 Contact

Lead Developer: **Chogyal**  
Tech Stack: React + Spring Boot + Firebase  
Location: Bhutan 🇧🇹  
For questions, use project issues or ping via [preferred contact].

---