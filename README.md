# MediGuide — AI Healthcare Assistant & Medical Management Portal

> **Full-Stack AI-Powered Healthcare Web Application** built with React (JavaScript/JSX), Tailwind CSS, Node.js, Express.js (ESM), and Google Gemini Generative AI.

---

## 🌟 Features Overview

- **🤖 AI Healthcare Assistant**: Real-time conversational AI powered by Google Gemini with clinical prompt engineering and follow-up suggestion chips.
- **🩺 AI Symptom Checker & Department Triage**: Multi-step symptom questionnaire with automatic clinical department matching (Cardiology, Dermatology, Neurology, Orthopedics, Pediatrics, General Medicine, ENT).
- **📅 Doctor Appointment Management**: Search doctor catalog with specialties, available time slots picker, and instant booking confirmations.
- **💊 Medicine Reminders & Adherence Tracker**: Medication schedules with interactive daily **Take / Skip** dose loggers and adherence streak scores.
- **📂 Digital Health Records Vault**: Securely organized lab reports, radiology scans, immunization records, and document viewer.
- **✍️ Digital Prescriptions**: Electronically signed medical prescriptions with 1-click *"Sync Medicines to Reminders"*.
- **🔐 Multi-Role Access Control (RBAC)**: Dedicated dashboards, workflows, and interfaces for **Patients**, **Doctors**, and **Administrators**.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 18 (JavaScript / JSX), Vite, Tailwind CSS, Lucide React, Zustand |
| **Backend** | Node.js, Express.js (JavaScript ESM), REST API Architecture |
| **AI Integration** | Google Gemini Generative AI (`@google/generative-ai`) |
| **Authentication** | JWT (JSON Web Tokens) & Role-Based Access Control (RBAC) |
| **Database** | In-Memory Database with Full Relational Schema & MongoDB Atlas support |

---

## 🚀 Quick Start

### 1. Backend Setup
```bash
cd backend
npm install
npm run dev
```
The backend REST server runs at `http://localhost:5000`.

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The frontend application will be live at `http://localhost:5173`.

---

## 🔑 AI Engine Configuration
- You can connect your Google Gemini API Key via the in-app modal in the **AI Assistant** page or by setting `GEMINI_API_KEY=your_key_here` in `backend/.env`.
- Get a free API Key from [Google AI Studio](https://aistudio.google.com/app/apikey).
