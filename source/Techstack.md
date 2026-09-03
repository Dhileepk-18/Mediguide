# MediGuide

## Final Technology Stack Document

**Project:** MediGuide -- AI-Powered Healthcare Assistant\
**Project Type:** College-Level Full-Stack Software Project\
**Development Environment:** Google Antigravity\
**Cost Requirement:** Free and open-source software / free-tier services
only

------------------------------------------------------------------------

# 1. Project Overview

MediGuide is a full-stack web-based AI Healthcare Assistant designed for
an Indian healthcare context.

The application provides:

-   Patient registration and login
-   Patient, Doctor and Admin roles
-   AI healthcare chatbot
-   ML-based symptom-to-department recommendation
-   Doctor discovery
-   Appointment booking
-   Medicine management and reminders
-   Health-record upload and viewing
-   Prescription generation
-   AI chat history
-   Symptom-check history
-   Role-based dashboards

The technology stack is intentionally selected for a **single-person
college project**. The stack avoids unnecessary enterprise technologies
and focuses on tools that are free to use or have a usable free tier for
development and demonstration.

------------------------------------------------------------------------

# 2. Final Technology Stack

  ------------------------------------------------------------------------
  Layer             Technology        Purpose            Cost
  ----------------- ----------------- ------------------ -----------------
  Frontend          React             Build the web      Free / Open
                                      interface          Source

  Frontend Build    Vite              Development server Free / Open
  Tool                                and production     Source
                                      build              

  Frontend Language TypeScript        Type-safe frontend Free / Open
                                      development        Source

  Styling           Tailwind CSS      Responsive UI      Free / Open
                                      styling            Source

  UI Components     shadcn/ui         Reusable interface Free / Open
                                      components         Source

  Icons             Lucide React      Interface icons    Free / Open
                                                         Source

  Routing           React Router      Frontend           Free / Open
                                      navigation         Source

  State Management  Zustand           Lightweight        Free / Open
                                      application state  Source

  Backend Runtime   Node.js           Server-side        Free / Open
                                      runtime            Source

  Backend Framework Express.js        REST API           Free / Open
                                      development        Source

  Backend Language  TypeScript        Type-safe backend  Free / Open
                                      development        Source

  API Style         REST API          Frontend-backend   Free
                                      communication      

  Database          MongoDB           Application data   Free / Free Tier
                                      storage            

  Database ODM      Mongoose          MongoDB schemas    Free / Open
                                      and operations     Source

  Authentication    JWT               User               Free / Open
                                      authentication     Source

  Password Security bcrypt            Password hashing   Free / Open
                                                         Source

  Validation        Zod               Request and form   Free / Open
                                      validation         Source

  AI                Gemini API        AI healthcare      Free Tier
                                      chatbot            

  ML Language       Python            Machine learning   Free / Open
                                      development        Source

  ML Library        scikit-learn      Train and evaluate Free / Open
                                      ML model           Source

  ML API            FastAPI           Serve ML           Free / Open
                                      predictions        Source

  ML Model          Random Forest     Department         Free / Open
                                      classification     Source

  File Storage      Cloudinary        Store              Free Tier
                                      health-record      
                                      files              

  PDF Generation    PDFKit            Generate           Free / Open
                                      prescription PDFs  Source

  API Testing       Postman           Test REST APIs     Free Tier

  Version Control   Git               Track source-code  Free / Open
                                      changes            Source

  Repository        GitHub            Store source code  Free Tier

  Development IDE   Google            Main development   Use available
                    Antigravity       workspace          free access

  Frontend          Vercel            Deploy frontend    Free Tier
  Deployment                                             

  Backend           Render            Deploy backend     Free Tier
  Deployment                                             

  Database Hosting  MongoDB Atlas     Cloud MongoDB      Free Tier
                                      database           
  ------------------------------------------------------------------------

**Important:** Free-tier services have usage limits and those limits can
change. The project should remain fully developable locally without
requiring a paid subscription.

------------------------------------------------------------------------

# 3. Frontend Technology

## 3.1 React

React will be used to build the MediGuide user interface.

It will be used for:

-   Landing page
-   Login and registration
-   Patient dashboard
-   Doctor dashboard
-   Admin dashboard
-   AI chatbot
-   Symptom checker
-   Doctor search
-   Appointment management
-   Medicine management
-   Health records
-   Prescriptions

React is suitable because MediGuide contains many interactive pages and
reusable components.

------------------------------------------------------------------------

## 3.2 Vite

Vite will be used as the frontend build tool.

It provides:

-   Fast development server
-   Fast startup
-   Efficient builds
-   Simple project configuration
-   Lightweight development workflow

Vite is suitable for a single-student project because it avoids
unnecessary build-system complexity.

------------------------------------------------------------------------

## 3.3 TypeScript

TypeScript will be used for frontend and backend development.

It provides:

-   Type safety
-   Better error detection
-   Better IDE support
-   Improved maintainability
-   Easier refactoring

Using TypeScript across the frontend and backend also keeps the
development process consistent.

------------------------------------------------------------------------

## 3.4 Tailwind CSS

Tailwind CSS will be used for application styling.

It will be used to create:

-   Responsive layouts
-   Cards
-   Forms
-   Buttons
-   Navigation
-   Dashboards
-   Tables
-   Modals
-   Mobile-friendly interfaces

------------------------------------------------------------------------

## 3.5 shadcn/ui

shadcn/ui will provide reusable UI components.

Potential components include:

-   Buttons
-   Dialogs
-   Forms
-   Cards
-   Tables
-   Tabs
-   Alerts
-   Dropdown menus
-   Navigation components

This will help maintain a consistent healthcare application design.

------------------------------------------------------------------------

## 3.6 Lucide React

Lucide React will provide interface icons.

Examples:

-   Calendar icon for appointments
-   Pill icon for medicines
-   File icon for health records
-   Message icon for AI chat
-   User icon for profiles
-   Shield icon for security

------------------------------------------------------------------------

## 3.7 React Router

React Router will manage frontend navigation.

Example routes:

``` text
/login
/register
/dashboard
/ai-assistant
/symptom-checker
/doctors
/doctors/:id
/appointments
/medicines
/health-records
/prescriptions
/chat-history
/symptom-history
/doctor/appointments
/doctor/prescriptions
/admin/users
/admin/doctors
/admin/departments
```

Protected routes will restrict access to authenticated users.

------------------------------------------------------------------------

## 3.8 Zustand

Zustand will be used for lightweight frontend state management.

It can manage:

-   Logged-in user
-   User role
-   Authentication state
-   UI state
-   Selected doctor
-   Selected appointment
-   Other small application-level state

A large state-management framework is unnecessary for this project.

------------------------------------------------------------------------

# 4. Backend Technology

## 4.1 Node.js

Node.js will provide the backend runtime.

It will handle:

-   API requests
-   Authentication
-   Authorization
-   Database communication
-   AI API requests
-   ML-service communication
-   File-upload processing
-   Business logic

------------------------------------------------------------------------

## 4.2 Express.js

Express.js will be used to build the REST API.

Example API groups:

``` text
/api/auth
/api/users
/api/doctors
/api/appointments
/api/chat
/api/symptoms
/api/medicines
/api/health-records
/api/prescriptions
/api/admin
```

Express will act as the central backend layer connecting the frontend
with MongoDB, Gemini, the ML service and file storage.

------------------------------------------------------------------------

## 4.3 TypeScript

TypeScript will also be used in the backend.

It will improve:

-   API type safety
-   Database model consistency
-   Error detection
-   Code maintainability
-   IDE support

------------------------------------------------------------------------

# 5. Database Technology

## 5.1 MongoDB

MongoDB will be the primary application database.

It will store:

1.  USER
2.  DOCTOR
3.  APPOINTMENT
4.  CHAT_HISTORY
5.  SYMPTOM_CHECK
6.  MEDICINE
7.  HEALTH_RECORD
8.  PRESCRIPTION
9.  AUDIT_LOG

MongoDB is suitable because MediGuide contains document-oriented data
and is straightforward to integrate with Node.js.

------------------------------------------------------------------------

## 5.2 Mongoose

Mongoose will be used as the MongoDB ODM.

It will provide:

-   Schemas
-   Validation
-   Model definitions
-   Query handling
-   References between collections

Example:

``` text
USER
 ├── APPOINTMENT
 ├── CHAT_HISTORY
 ├── SYMPTOM_CHECK
 ├── MEDICINE
 ├── HEALTH_RECORD
 └── PRESCRIPTION
```

------------------------------------------------------------------------

## 5.3 MongoDB Atlas

MongoDB Atlas can be used for cloud database hosting.

For the college project, the free tier should be used within its
applicable limits.

Local MongoDB can also be used during development if required.

------------------------------------------------------------------------

# 6. Authentication and Security

## 6.1 JWT

JSON Web Tokens will be used for authentication.

Basic flow:

``` text
User Login
    ↓
Verify Credentials
    ↓
Generate Authentication Token
    ↓
Secure HTTP-Only Cookie
    ↓
Protected API Request
    ↓
Verify Token
    ↓
Check User Role
    ↓
Allow / Deny Access
```

The backend must enforce authentication and authorization.

------------------------------------------------------------------------

## 6.2 bcrypt

bcrypt will hash passwords before they are stored.

Passwords must never be stored as plain text.

------------------------------------------------------------------------

## 6.3 Role-Based Access Control

MediGuide will have three main roles.

### Patient

Can access:

-   AI chatbot
-   Symptom checker
-   Doctors
-   Appointments
-   Medicines
-   Health records
-   Prescriptions
-   Chat history
-   Symptom history

### Doctor

Can access:

-   Doctor profile
-   Appointments
-   Authorized patient consultation information
-   Prescription creation
-   Prescription history
-   Availability

### Admin

Can access:

-   User management
-   Doctor verification
-   Department management
-   Appointment overview
-   Basic audit information

------------------------------------------------------------------------

## 6.4 Zod

Zod will validate incoming data.

Validation will be applied to:

-   Registration
-   Login
-   Profile information
-   Appointments
-   Medicines
-   Symptoms
-   Prescriptions
-   Other important API requests

------------------------------------------------------------------------

# 7. Artificial Intelligence Technology

## 7.1 Gemini API

The Gemini API will be used for the AI healthcare chatbot.

Main use:

``` text
Patient Question
       ↓
React Frontend
       ↓
Node.js / Express Backend
       ↓
Gemini API
       ↓
AI Response
       ↓
React Frontend
       ↓
Chat History
```

The API key must remain on the backend.

It must never be placed directly inside frontend JavaScript or committed
to GitHub.

Google currently provides a free tier for Gemini API usage, subject to
model and usage limits. citeturn0search0turn0search1

------------------------------------------------------------------------

## 7.2 AI Responsibilities

The AI chatbot can:

-   Answer general healthcare questions.
-   Explain common health terminology.
-   Provide general wellness information.
-   Provide preliminary informational guidance.
-   Encourage professional medical consultation when appropriate.

The AI must not be presented as a doctor or as a definitive diagnostic
system.

------------------------------------------------------------------------

# 8. Machine Learning Technology

The ML component is separate from the Gemini chatbot.

## 8.1 Purpose

The ML model will recommend a suitable medical department based on
selected symptoms.

Example:

``` text
Symptoms
   ↓
Preprocessing
   ↓
Random Forest Model
   ↓
Department Prediction
   ↓
Confidence Score
   ↓
Suggested Medical Department
```

The model will **not** be used to provide a confirmed disease diagnosis.

------------------------------------------------------------------------

## 8.2 Python

Python will be used for machine-learning development.

Python is suitable because it has a large ecosystem of free and
open-source ML libraries.

------------------------------------------------------------------------

## 8.3 scikit-learn

scikit-learn will be used for:

-   Data preprocessing
-   Train/test splitting
-   Model training
-   Prediction
-   Evaluation
-   Confusion matrix
-   Accuracy
-   Precision
-   Recall
-   F1-score

------------------------------------------------------------------------

## 8.4 Random Forest

Random Forest will be the recommended baseline classification algorithm.

It will classify symptom patterns into medical departments.

Possible outputs include:

``` text
General Medicine
Cardiology
Dermatology
ENT
Orthopedics
Neurology
Gastroenterology
Pulmonology
```

The final department list should be decided during dataset preparation.

------------------------------------------------------------------------

## 8.5 FastAPI

FastAPI will expose the trained ML model through a small Python API.

Example:

``` text
Node.js Backend
      ↓
POST /predict
      ↓
FastAPI
      ↓
Random Forest Model
      ↓
Prediction
      ↓
Node.js Backend
      ↓
React Frontend
```

This keeps the ML component separate and easy to explain during the
project presentation.

------------------------------------------------------------------------

# 9. File Storage

## 9.1 Cloudinary

Cloudinary can be used for health-record file storage within its
available free-tier limits.

Supported files may include:

-   PDF
-   JPG
-   JPEG
-   PNG

MongoDB should store the document metadata and file reference rather
than large file contents.

Example:

``` text
Patient
   ↓
Upload Health Record
   ↓
Backend
   ↓
Cloudinary
   ↓
File URL / Reference
   ↓
MongoDB Metadata
```

For a local-only demonstration, files can alternatively be stored
locally during development. A cloud storage service is useful when the
deployed application needs persistent file storage.

------------------------------------------------------------------------

# 10. Prescription PDF Generation

## PDFKit

PDFKit will be used to generate prescription PDFs.

The generated PDF can contain:

-   Doctor information
-   Patient information
-   Prescription date
-   Appointment reference
-   Medicines
-   Dosage
-   Frequency
-   Duration
-   Instructions
-   Doctor notes
-   Follow-up date

PDFKit is free and open source.

------------------------------------------------------------------------

# 11. API Testing

## Postman

Postman will be used to test REST APIs independently of the frontend.

Example requests:

``` text
POST /api/auth/register
POST /api/auth/login

GET /api/doctors
GET /api/appointments
POST /api/appointments

POST /api/chat
POST /api/symptoms

GET /api/health-records
POST /api/health-records

GET /api/prescriptions
POST /api/prescriptions
```

This allows backend functionality to be tested before connecting every
feature to the UI.

------------------------------------------------------------------------

# 12. Version Control

## Git

Git will be used for:

-   Source-code management
-   Version history
-   Feature branches
-   Recovery from mistakes
-   Tracking changes

Git is free and open source.

------------------------------------------------------------------------

## GitHub

GitHub will be used to store the project repository.

Recommended structure:

``` text
mediguide/
│
├── frontend/
├── backend/
├── ml-service/
├── docs/
│   ├── PRD.md
│   ├── SRS.md
│   └── diagrams/
│
├── README.md
├── .gitignore
└── .env.example
```

Sensitive files such as `.env` must not be committed.

------------------------------------------------------------------------

# 13. Development Environment

## Google Antigravity

Google Antigravity will be the primary development workspace.

The project should be divided into small implementation tasks so that
each module can be developed and tested independently.

Suggested development sequence:

``` text
Project Setup
      ↓
Authentication
      ↓
Patient Module
      ↓
Doctor Module
      ↓
Appointments
      ↓
Health Records
      ↓
Medicines
      ↓
AI Chatbot
      ↓
ML Symptom Checker
      ↓
Prescriptions
      ↓
Admin Module
      ↓
Testing
      ↓
Deployment
```

Antigravity should be used as the development environment rather than
being treated as a runtime dependency of the deployed application.

------------------------------------------------------------------------

# 14. Deployment

## 14.1 Vercel

Vercel can be used for frontend deployment using its available free
tier.

Deployment:

``` text
React + Vite
      ↓
GitHub
      ↓
Vercel
```

------------------------------------------------------------------------

## 14.2 Render

Render can be used for backend deployment using its available free
options.

Deployment:

``` text
Node.js + Express
      ↓
GitHub
      ↓
Render
```

The ML service may also be deployed separately if a suitable free
hosting option is available. For a college demonstration, running the ML
service locally is acceptable if deployment limits make separate hosting
impractical.

------------------------------------------------------------------------

## 14.3 MongoDB Atlas

MongoDB Atlas can host the MongoDB database using its available free
tier.

------------------------------------------------------------------------

# 15. Environment Variables

Sensitive configuration must be stored in environment variables.

Example:

``` env
MONGODB_URI=your_mongodb_connection
JWT_SECRET=your_secret
GEMINI_API_KEY=your_gemini_key

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

ML_SERVICE_URL=http://localhost:8000
```

The `.env` file must be included in `.gitignore`.

Only `.env.example` should be committed.

------------------------------------------------------------------------

# 16. Overall Architecture

``` text
                         MEDIGUIDE
                              │
                              ▼
                  ┌──────────────────────┐
                  │      FRONTEND        │
                  │ React + TypeScript   │
                  │ Vite + Tailwind      │
                  │ shadcn/ui            │
                  └──────────┬───────────┘
                             │
                          REST API
                             │
                             ▼
                  ┌──────────────────────┐
                  │       BACKEND        │
                  │ Node.js + Express    │
                  │ TypeScript            │
                  │ JWT + bcrypt + Zod   │
                  └──────┬─────┬─────┬───┘
                         │     │     │
              ┌──────────┘     │     └──────────┐
              ▼                ▼                ▼
       ┌────────────┐   ┌────────────┐   ┌─────────────┐
       │  MongoDB   │   │ Gemini API │   │  Cloudinary │
       │ + Mongoose │   │    AI      │   │ Health Files│
       └────────────┘   └────────────┘   └─────────────┘
                         │
                         │
                         ▼
                 ┌──────────────────┐
                 │  Python Service  │
                 │     FastAPI      │
                 │  scikit-learn   │
                 │  Random Forest  │
                 └──────────────────┘
                         │
                         ▼
                 Department Prediction
```

------------------------------------------------------------------------

# 17. Complete Software List

## Development Software

  -----------------------------------------------------------------------
  Software                Use                     Cost
  ----------------------- ----------------------- -----------------------
  Google Antigravity      Main IDE/development    Free access where
                          workspace               available

  Visual Studio Code      Optional                Free
                          alternative/editor      

  Node.js                 Backend runtime         Free / Open Source

  npm                     Package manager         Free

  Python                  ML development          Free / Open Source

  Git                     Version control         Free / Open Source

  GitHub                  Repository              Free tier

  Postman                 API testing             Free tier

  MongoDB Compass         Optional database GUI   Free
  -----------------------------------------------------------------------

No paid IDE or paid development software is required.

------------------------------------------------------------------------

# 18. Complete Framework and Library List

### Frontend

``` text
React
Vite
TypeScript
Tailwind CSS
shadcn/ui
Lucide React
React Router
Zustand
```

### Backend

``` text
Node.js
Express.js
TypeScript
Mongoose
JWT
bcrypt
Zod
```

### AI

``` text
Gemini API
```

### Machine Learning

``` text
Python
scikit-learn
FastAPI
Random Forest
```

### Files and Documents

``` text
Cloudinary
PDFKit
```

### Testing and Development

``` text
Postman
Git
GitHub
```

### Deployment

``` text
Vercel
Render
MongoDB Atlas
```

------------------------------------------------------------------------

# 19. Cost Strategy

The project should follow a **zero-paid-software approach**.

## Free / Open-Source Software

The following do not require purchasing software licenses:

-   React
-   Vite
-   TypeScript
-   Tailwind CSS
-   shadcn/ui
-   Lucide
-   React Router
-   Zustand
-   Node.js
-   Express.js
-   Mongoose
-   JWT libraries
-   bcrypt
-   Zod
-   Python
-   scikit-learn
-   FastAPI
-   PDFKit
-   Git

## Free-Tier Services

The following can be used within their applicable free limits:

-   Gemini API
-   MongoDB Atlas
-   Cloudinary
-   GitHub
-   Postman
-   Vercel
-   Render

Free-tier availability, limits and policies can change. Therefore, the
project should not depend on paid features.

------------------------------------------------------------------------

# 20. Technologies Deliberately Not Used

To keep MediGuide realistic for a single-person college project, the
following are not required:

-   Kubernetes
-   Docker/Kubernetes-based orchestration
-   Redis
-   Kafka
-   RabbitMQ
-   Microservice architecture
-   GraphQL
-   Elasticsearch
-   Dedicated message queues
-   Paid monitoring platforms
-   Paid authentication platforms
-   Paid databases
-   Paid UI libraries
-   Enterprise cloud infrastructure
-   Complex CI/CD infrastructure

These technologies can increase development and deployment complexity
without providing enough benefit for the college MVP.

------------------------------------------------------------------------

# 21. Why This Stack Was Selected

The final stack provides a balance between:

### Simplicity

The technologies are straightforward enough for one student to develop
and explain.

### Modern Development

React, TypeScript, Node.js and modern UI tooling provide a current
full-stack development environment.

### AI Integration

Gemini provides the conversational AI component.

### Real Machine Learning

Python, scikit-learn, FastAPI and Random Forest provide a separate,
measurable ML component.

### Database Support

MongoDB and Mongoose provide flexible application data storage.

### Security

JWT, HTTP-only cookies, bcrypt and Zod provide the basic security
foundation required for the project.

### Practical Healthcare Features

Cloudinary and PDFKit support actual health-document and prescription
workflows.

### Low Cost

The project can be developed and demonstrated without purchasing paid
software, provided free-tier services remain within their limits.

------------------------------------------------------------------------

# 22. Final Recommended Stack

``` text
FRONTEND
React
+ Vite
+ TypeScript
+ Tailwind CSS
+ shadcn/ui
+ Lucide React
+ React Router
+ Zustand

BACKEND
Node.js
+ Express.js
+ TypeScript
+ REST API

DATABASE
MongoDB Atlas
+ Mongoose

AUTHENTICATION
JWT
+ HTTP-only Cookies
+ bcrypt
+ Zod

AI
Gemini API

MACHINE LEARNING
Python
+ scikit-learn
+ Random Forest
+ FastAPI

FILE STORAGE
Cloudinary

PDF
PDFKit

TESTING
Postman
+ Jest/Supertest for automated backend testing

VERSION CONTROL
Git
+ GitHub

DEVELOPMENT
Google Antigravity
+ Node.js
+ npm
+ Python

DEPLOYMENT
Vercel
+ Render
+ MongoDB Atlas
```

------------------------------------------------------------------------

# 23. Final Decision

The selected technology stack should be **kept as the final stack** for
MediGuide.

The only major addition compared with the earlier stack is the dedicated
ML layer:

``` text
Python
+
scikit-learn
+
Random Forest
+
FastAPI
```

This addition is necessary because the project includes a trained ML
model for medical-department recommendation.

The overall stack remains intentionally lightweight and suitable for a
single-person college project.

------------------------------------------------------------------------

# 24. Important Cost Note

"Free" should be understood as **free software or usable free-tier
access**, not as a guarantee that every external service will remain
free forever.

For the college project:

-   Do not purchase paid software.
-   Do not enable paid cloud billing unnecessarily.
-   Monitor API usage.
-   Stay within free-tier limits.
-   Keep the application runnable locally.
-   Keep API keys and service credentials private.
-   Use local development when a cloud free tier is unavailable.

This ensures that the project can be completed without depending on paid
software.
