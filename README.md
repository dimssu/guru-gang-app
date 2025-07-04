# Guru Gang

Guru Gang is an interactive learning platform for students, teachers, and admins. It offers engaging courses, quizzes, assignments, concept battles, and a distraction-free focus room, all enhanced by an AI-powered assistant.

## Features
- **Student Dashboard:** Personalized learning journey, course progress tracking, and quick access to assignments, quizzes, and concept battles.
- **Courses:** Browse, enroll, and track progress through interactive slides and resource links.
- **Assignments:** Upload, download, and manage assignments with ease.
- **Quizzes:** Take and create quizzes to reinforce learning and assess understanding.
- **Concept Battles:** Fun, gamified challenges to test and master key concepts.
- **Focus Room:** AI-powered distraction monitoring to help students stay productive.
- **Teacher/Admin Tools:** Create and manage courses, slides, quizzes, and monitor student progress.
- **AI Assistant:** Chatbot support for study tips, navigation, and platform guidance.

## Tech Stack
- **Frontend:** React, Vite, face-api.js, react-router-dom, react-icons
- **AI Assistant:** Gemini API via dissu-talks

## Getting Started

### Prerequisites
- Node.js (v18 or above recommended)
- npm or yarn

### Installation
1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd guru-gang-app
   ```
2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```
3. Set up environment variables:
   - Create a `.env` file in the root directory.
   - Add your Gemini API key:
     ```env
     VITE_GEMINI_API_KEY=your_gemini_api_key_here
     ```
4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

## Usage
- Visit `http://localhost:5173` in your browser.
- Register as a student, teacher, or admin to explore respective features.
- Use the AI assistant for help and study tips.

## Folder Structure
- `src/pages/` — Main application pages (Dashboard, Courses, Assignments, etc.)
- `src/components/` — Reusable UI components
- `src/context/` — Context providers (e.g., Auth)
- `src/api/` — API utilities
- `src/styles/` — CSS files

## License
All rights reserved @2025. For educational use only.
