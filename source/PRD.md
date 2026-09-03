# MediGuide

## AI-Powered Healthcare Assistant for India

**Product Requirements Document**

**Project Type:** College Software Engineering Project\
**Development Environment:** Google Antigravity\
**Primary Platform:** Responsive Web Application\
**Primary Users:** Patient/User, Doctor, Administrator

------------------------------------------------------------------------

## 1. Product Overview

MediGuide is a full-stack web-based AI Healthcare Assistant designed for
an Indian healthcare context. The system brings common
healthcare-support activities into one platform:

-   General healthcare information through an AI chatbot
-   Preliminary symptom guidance using a simple ML model
-   Medical department recommendation based on symptoms
-   Doctor discovery and filtering
-   Doctor appointment booking
-   Medicine management and reminders
-   Health-record upload and viewing
-   Doctor-created prescriptions
-   AI chat and symptom-check history
-   Patient, Doctor and Admin dashboards

MediGuide is a **college project**, so the system is intentionally
scoped to features that can realistically be designed, implemented,
tested and demonstrated by a student. It is not intended to be a
production hospital system or a replacement for medical professionals.

------------------------------------------------------------------------

## 2. Problem Statement

Patients often manage healthcare information across different places
such as paper reports, PDFs, messaging applications, hospital portals
and appointment systems. It can also be difficult for users to
understand which type of doctor or medical department they should
approach for a particular set of symptoms.

MediGuide addresses this problem by providing a single web application
for:

1.  General health information
2.  Preliminary symptom guidance
3.  Department recommendation
4.  Doctor discovery
5.  Appointment management
6.  Medicine reminders
7.  Personal medical-document storage
8.  Prescription access

The application provides healthcare support and organization, but it
does not provide a definitive medical diagnosis.

------------------------------------------------------------------------

## 3. Product Vision

The vision of MediGuide is to create a simple, accessible and practical
digital healthcare-support platform for users in India.

The application should:

-   Be easy for a first-time user to understand.
-   Work well on desktop and mobile devices.
-   Provide useful AI-assisted healthcare information.
-   Use ML for a clearly defined and measurable task.
-   Help users identify an appropriate medical department.
-   Allow users to organize real medical documents.
-   Provide a simple doctor and appointment workflow.
-   Give doctors tools to manage appointments and prescriptions.
-   Give administrators basic control over users and doctors.
-   Maintain clear safety boundaries around AI-generated information.

------------------------------------------------------------------------

## 4. Project Objectives

### 4.1 Main Objectives

-   Develop a complete full-stack healthcare web application.
-   Implement secure user authentication and role-based access.
-   Integrate an AI chatbot for general healthcare information.
-   Develop a simple ML-based symptom classification system.
-   Recommend suitable medical departments based on structured symptoms.
-   Implement doctor discovery and appointment booking.
-   Implement medicine schedules and reminders.
-   Provide real PDF/image health-record storage.
-   Allow doctors to create downloadable prescriptions.
-   Provide separate dashboards for patients, doctors and
    administrators.
-   Demonstrate database, API, AI, ML and frontend integration in one
    project.

### 4.2 Academic Objectives

The project should demonstrate practical knowledge of:

-   Software requirements engineering
-   Full-stack web development
-   REST APIs
-   Database design
-   Authentication and authorization
-   Artificial intelligence API integration
-   Machine learning
-   File handling
-   PDF generation
-   Software testing
-   UML/system modelling
-   Git-based development
-   Agent-assisted development using Antigravity

------------------------------------------------------------------------

## 5. Target Users

  -----------------------------------------------------------------------
  User                                Main Needs
  ----------------------------------- -----------------------------------
  Patient/User                        Health information, symptom
                                      guidance, doctors, appointments,
                                      medicines and records

  Doctor                              Appointments, patient context and
                                      prescription creation

  Administrator                       User management, doctor
                                      verification and system management
  -----------------------------------------------------------------------

The system may also support caregiver-oriented usage through a patient's
account, but a separate caregiver role is not required for the college
MVP.

------------------------------------------------------------------------

## 6. Project Scope

### 6.1 In Scope

-   User registration and login
-   Patient profile management
-   Doctor registration and profile
-   Admin approval of doctors
-   Role-based dashboards
-   AI healthcare chatbot
-   ML symptom checker
-   Red-flag symptom screening
-   Medical department recommendation
-   Doctor search and filtering
-   Appointment booking
-   Appointment status management
-   Medicine management
-   Medicine reminders
-   Health-record upload
-   PDF/image health-record preview
-   Prescription creation
-   Prescription PDF generation
-   AI chat history
-   Symptom-check history
-   Basic notifications
-   Basic audit logging
-   Responsive web UI

### 6.2 Out of Scope

The following are not required for the college MVP:

-   Autonomous medical diagnosis
-   Autonomous prescription generation
-   Emergency ambulance dispatch
-   Real payment processing
-   Insurance claim processing
-   Pharmacy delivery
-   Real ABHA/ABDM integration
-   Video consultation
-   Hospital integration
-   Advanced medical OCR
-   Production-scale infrastructure
-   Multi-region deployment
-   Complex DevOps monitoring
-   Enterprise compliance certification
-   Large-scale clinical data processing

These can be documented as future enhancements.

------------------------------------------------------------------------

# 7. User Roles and Permissions

  ----------------------------------------------------------------------------
  Feature                Patient             Doctor               Admin
  ---------------- ------------------- ------------------- -------------------
  Register/Login            ✓                   ✓                   ✓

  Manage Own                ✓                   ✓                   ✓
  Profile                                                  

  AI Chatbot                ✓               Optional            Optional

  Symptom Checker           ✓               Optional               \-

  View Doctors              ✓                  \-                   ✓

  Book Appointment          ✓                  \-                   ✓

  Manage                View own         Manage assigned       View/manage
  Appointments                                             

  Manage Medicines          ✓                  \-                  \-

  Health Records       Own records      Limited permitted   No default access
                                             access        

  Create                   \-                   ✓                  \-
  Prescription                                             

  View                      ✓                   ✓                  \-
  Prescription                                             

  Doctor                   \-                  \-                   ✓
  Verification                                             

  User Management          \-                  \-                   ✓

  Department               \-                  \-                   ✓
  Management                                               

  Audit Log                \-                  \-                   ✓
  ----------------------------------------------------------------------------

The backend must enforce these permissions. Hiding a button in the
frontend is not considered authorization.

------------------------------------------------------------------------

# 8. Core Features

## 8.1 Authentication

Users should be able to:

-   Register an account.
-   Log in.
-   Log out.
-   Reset a forgotten password.
-   Maintain an authenticated session.
-   Access only features allowed for their role.

For the college MVP, email/password authentication is sufficient. Phone
OTP can be added later if required.

------------------------------------------------------------------------

## 8.2 Patient Profile

The patient profile may contain:

-   Full name
-   Email
-   Mobile number
-   Date of birth
-   Gender
-   Blood group
-   Emergency contact
-   Allergies
-   City
-   State
-   Preferred language

Only information necessary for the project should be collected.

------------------------------------------------------------------------

## 8.3 AI Healthcare Chatbot

The AI chatbot provides general healthcare information.

### Capabilities

-   Answer general healthcare questions.
-   Explain common health terms.
-   Provide general wellness information.
-   Ask for clarification when the question lacks context.
-   Maintain chat history for the logged-in user.

### Restrictions

The chatbot must:

-   Clearly state that responses are AI-generated.
-   Avoid presenting information as a confirmed diagnosis.
-   Not prescribe medication.
-   Not change medication dosage.
-   Not replace a doctor.
-   Encourage professional medical help when appropriate.
-   Escalate potentially urgent situations instead of continuing as if
    the situation were routine.

The AI API key must remain on the backend and must never be exposed in
frontend code.

------------------------------------------------------------------------

# 9. ML Symptom Checker

The ML symptom checker is one of the main technical components of
MediGuide.

## 9.1 Purpose

The ML system does **not** diagnose a disease.

Its purpose is to recommend a suitable medical department based on
structured symptom information.

Example:

**Input:** - Chest discomfort - Breathlessness - Fatigue

**Possible output:** - Cardiology - General Medicine

The result should be displayed as:

> Suggested Department --- Not a Diagnosis

------------------------------------------------------------------------

## 9.2 Input

The symptom checker can collect:

-   Selected symptoms
-   Duration
-   Severity
-   Age group
-   Existing conditions

The initial implementation should use a predefined list of symptoms
rather than depending entirely on free-text input.

------------------------------------------------------------------------

## 9.3 ML Model

A simple supervised classification model should be used.

Recommended models:

-   Random Forest
-   XGBoost

For a college project, **Random Forest is sufficient** if it provides
acceptable results and is easier to explain.

The model should be trained using a public, de-identified dataset.

No real patient data should be used for training.

------------------------------------------------------------------------

## 9.4 ML Output

The model should return:

-   Recommended department
-   Confidence score
-   Optional top alternative departments

Example:

``` text
Recommended Department:
General Medicine

Confidence:
78%

Alternative:
Dermatology - 14%
ENT - 8%

Note:
This is preliminary guidance and not a medical diagnosis.
```

------------------------------------------------------------------------

## 9.5 Evaluation

The ML model should be evaluated using:

-   Training/test split
-   Accuracy
-   Precision
-   Recall
-   F1-score
-   Confusion matrix

If multiple department predictions are displayed, top-3 accuracy can
also be reported.

The final project report should include the actual metrics obtained
during training rather than invented values.

------------------------------------------------------------------------

## 9.6 Red-Flag Screening

A simple rule-based safety layer should run before displaying the ML
recommendation.

Examples of potentially urgent symptoms include:

-   Severe chest pain with breathing difficulty
-   Sudden severe headache
-   Severe difficulty breathing
-   Uncontrolled bleeding
-   Possible stroke symptoms
-   Severe allergic reaction

If a red flag is detected, the application should prioritize seeking
immediate professional/emergency care.

The red-flag rules are separate from the ML model and should override
the normal department recommendation.

------------------------------------------------------------------------

# 10. Doctor Discovery

Patients should be able to search for doctors using filters such as:

-   Department
-   Specialization
-   City
-   Consultation mode
-   Language
-   Availability

Doctor profiles may show:

-   Doctor name
-   Specialization
-   Department
-   Experience
-   Languages
-   Facility
-   Consultation mode
-   Availability
-   Verification status

------------------------------------------------------------------------

# 11. Appointment Management

## Patient

The patient can:

1.  Search for a doctor.
2.  View available slots.
3.  Select a date and time.
4.  Enter the reason for the appointment.
5.  Select consultation mode.
6.  Confirm the appointment.
7.  View appointment status.
8.  Cancel or reschedule when permitted.

## Doctor

The doctor can:

-   View upcoming appointments.
-   Accept or reject appointment requests.
-   Reschedule appointments.
-   Mark appointments as completed.
-   Mark no-shows.
-   Add appropriate appointment notes.

### Appointment Statuses

-   Requested
-   Confirmed
-   Rescheduled
-   Cancelled
-   Completed
-   No-show

The backend should prevent two patients from successfully booking the
same doctor and time slot.

------------------------------------------------------------------------

# 12. Medicine Management

Patients can create medicine schedules manually.

Each medicine may contain:

-   Medicine name
-   Strength
-   Dosage
-   Frequency
-   Route
-   Reminder times
-   Start date
-   End date
-   Instructions
-   Active/inactive status

The system can display:

-   Upcoming reminders
-   Completed reminders
-   Missed reminders

The reminder system must not recommend taking an additional or
corrective dose after a missed dose.

------------------------------------------------------------------------

# 13. Health Records

Health records are an important practical feature of MediGuide.

## Supported Formats

-   PDF
-   JPG
-   JPEG
-   PNG

## Document Types

-   Lab report
-   Prescription
-   Discharge summary
-   Vaccination record
-   Imaging report
-   Referral document
-   Other medical document

## Metadata

Each record should store:

-   Record ID
-   User ID
-   Title
-   Document type
-   File reference
-   MIME type
-   File size
-   Record date
-   Upload date
-   Optional facility/doctor information

## User Actions

Patients can:

-   Upload a document.
-   View metadata.
-   Preview supported files.
-   Download the original file.
-   Edit metadata.
-   Archive records.

Health records must be private to the patient unless explicitly
authorized through a defined application workflow.

------------------------------------------------------------------------

# 14. Prescription Management

Doctors can create structured prescriptions for their patients.

A prescription should contain:

-   Prescription ID
-   Patient name
-   Doctor name
-   Doctor specialization
-   Facility
-   Doctor registration number
-   Prescription date
-   Appointment reference
-   Medicine name
-   Strength
-   Dosage
-   Frequency
-   Route
-   Duration
-   Instructions
-   Doctor notes
-   Follow-up date when required

The system should generate a downloadable PDF.

The PDF should clearly indicate that it is a system-generated document.

A digital signature should not be represented as a legally verified
signature unless an actual valid signing mechanism is implemented.

------------------------------------------------------------------------

# 15. Doctor Module

The doctor dashboard should include:

-   Profile
-   Verification status
-   Appointment list
-   Today's appointments
-   Upcoming appointments
-   Patient context required for an appointment
-   Prescription creation
-   Prescription history
-   Schedule/availability management

Doctors should not have unrestricted access to unrelated patient health
records.

------------------------------------------------------------------------

# 16. Admin Module

The administrator dashboard should include:

-   Total users
-   Total doctors
-   Appointment overview
-   User management
-   Doctor management
-   Doctor approval/rejection
-   Department management
-   Account suspension/deactivation
-   Basic audit-log viewing

Admin access to private health records should not be enabled by default.

------------------------------------------------------------------------

# 17. Notifications

The application should provide basic in-app notifications for:

-   Appointment confirmation
-   Appointment rescheduling
-   Appointment cancellation
-   Upcoming appointment
-   Medicine reminder
-   Prescription availability
-   Health-record upload completion

Email/SMS notifications can be treated as optional enhancements rather
than core requirements.

------------------------------------------------------------------------

# 18. Database Design

MongoDB will be used as the primary database.

## Main Collections

  -----------------------------------------------------------------------
  Collection              Purpose                 Important Fields
  ----------------------- ----------------------- -----------------------
  USER                    User accounts and       userId, name, email,
                          profiles                phone, passwordHash,
                                                  role, city, state

  DOCTOR                  Doctor information      doctorId, name,
                                                  specialization,
                                                  department, experience,
                                                  languages, facility,
                                                  registrationNumber,
                                                  verificationStatus

  APPOINTMENT             Patient-doctor          appointmentId, userId,
                          appointments            doctorId, date, time,
                                                  mode, reason, status

  CHAT_HISTORY            AI conversations        chatId, userId,
                                                  messages, createdAt

  SYMPTOM_CHECK           Symptom-check history   checkId, userId,
                                                  symptoms, duration,
                                                  severity, predictions,
                                                  confidence, redFlag,
                                                  guidance, createdAt

  MEDICINE                Medicine schedules      medicineId, userId,
                                                  name, strength, dosage,
                                                  frequency,
                                                  reminderTimes,
                                                  startDate, endDate

  HEALTH_RECORD           Medical-file metadata   recordId, userId,
                                                  title, type,
                                                  fileReference,
                                                  mimeType, size,
                                                  recordDate, uploadedAt

  PRESCRIPTION            Doctor-created          prescriptionId,
                          prescriptions           doctorId, userId,
                                                  appointmentId,
                                                  medicines,
                                                  instructions, date,
                                                  pdfReference

  AUDIT_LOG               Security-sensitive      logId, actorId,
                          events                  actorRole, action,
                                                  resourceType,
                                                  resourceId, timestamp
  -----------------------------------------------------------------------

### Important Database Rules

-   User email should be unique.
-   Doctor/date/time combinations should prevent double-booking.
-   User-owned records should be indexed for efficient history
    retrieval.
-   Passwords must never be stored in plain text.

------------------------------------------------------------------------

# 19. System Architecture

MediGuide should use a simple architecture that is realistic for a
college project.

``` text
                         ┌──────────────────────┐
                         │   User Web Browser   │
                         │ React + TypeScript   │
                         └──────────┬───────────┘
                                    │
                                    │ HTTPS / REST API
                                    ▼
                         ┌──────────────────────┐
                         │ Node.js + Express    │
                         │ Backend API          │
                         │ Auth + RBAC + Logic  │
                         └──────┬───────┬───────┘
                                │       │
                 ┌──────────────┘       └──────────────┐
                 ▼                                     ▼
       ┌──────────────────┐                  ┌──────────────────┐
       │ MongoDB          │                  │ AI API           │
       │ Application Data │                  │ Chatbot          │
       └──────────────────┘                  └──────────────────┘
                                │
                                ▼
                       ┌────────────────────┐
                       │ Python ML Service  │
                       │ FastAPI + ML Model │
                       └────────────────────┘
                                │
                                ▼
                       ┌────────────────────┐
                       │ File Storage       │
                       │ Health Documents   │
                       └────────────────────┘
```

The architecture intentionally avoids unnecessary microservices, queues,
caching systems and infrastructure for the college MVP.

------------------------------------------------------------------------

# 20. Recommended Technology Stack

  Layer                     Technology
  ------------------------- ------------------------------------------
  Frontend                  React + Vite + TypeScript
  Styling                   Tailwind CSS
  UI Components             shadcn/ui
  Icons                     Lucide
  Routing                   React Router
  State Management          Zustand or React Context
  Backend                   Node.js + Express + TypeScript
  Database                  MongoDB + Mongoose
  Authentication            JWT/session approach + HTTP-only cookies
  Password Hashing          bcrypt
  Validation                Zod
  AI                        Gemini API or another suitable AI API
  ML                        Python + scikit-learn
  ML API                    FastAPI
  File Storage              Cloudinary or S3-compatible storage
  PDF Generation            PDFKit
  Testing                   Jest/Supertest + selected browser tests
  API Testing               Postman
  Version Control           Git + GitHub
  Development Environment   Google Antigravity

Free or student-friendly tiers may be used where available. Service
limits should be checked before deployment.

------------------------------------------------------------------------

# 21. Antigravity IDE Development Structure

Google Antigravity is the primary development workspace for the project.

The repository should be organized so that Antigravity agents can
understand each part of the application independently.

## Recommended Repository

``` text
mediguide/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── layouts/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── store/
│   │   ├── types/
│   │   └── utils/
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   └── app.ts
│   └── package.json
│
├── ml-service/
│   ├── model/
│   ├── dataset/
│   ├── training/
│   ├── app.py
│   ├── requirements.txt
│   └── README.md
│
├── docs/
│   ├── PRD.md
│   ├── SRS.md
│   └── diagrams/
│
├── .env.example
├── .gitignore
└── README.md
```

The exact structure can be adjusted during implementation, but frontend,
backend and ML code should remain clearly separated.

------------------------------------------------------------------------

# 22. How Antigravity Should Be Used

The entire project should not be given to an agent as one giant
implementation request.

Development should be divided into small, verifiable tasks.

Recommended implementation order:

### Phase 1 --- Project Setup

-   Create repository structure.
-   Configure frontend.
-   Configure backend.
-   Configure TypeScript.
-   Configure environment variables.
-   Connect MongoDB.
-   Create README.
-   Create basic application layout.

### Phase 2 --- Authentication

-   User registration
-   Login/logout
-   Password hashing
-   Authentication middleware
-   Role-based authorization
-   Protected routes

### Phase 3 --- Patient Module

-   Patient profile
-   Dashboard
-   Navigation
-   Basic account settings

### Phase 4 --- Doctor Module

-   Doctor registration
-   Doctor profile
-   Admin verification
-   Doctor listing
-   Doctor search/filter

### Phase 5 --- Appointments

-   Doctor availability
-   Slot selection
-   Appointment creation
-   Appointment status
-   Cancellation/rescheduling
-   Double-booking prevention

### Phase 6 --- Health Records

-   File upload
-   File validation
-   Secure storage
-   Metadata
-   Preview
-   Download
-   Archive

### Phase 7 --- Medicines

-   Medicine CRUD
-   Reminder schedules
-   Reminder UI
-   Active/inactive medicine status

### Phase 8 --- AI Chatbot

-   Backend AI service wrapper
-   Chat interface
-   Conversation history
-   Safety instructions
-   Error handling

### Phase 9 --- ML Symptom Checker

-   Dataset preparation
-   Data preprocessing
-   Model training
-   Model evaluation
-   FastAPI service
-   Node.js integration
-   Prediction UI

### Phase 10 --- Safety Layer

-   Red-flag rules
-   Emergency escalation UI
-   Safety messages
-   Test cases

### Phase 11 --- Prescriptions

-   Doctor prescription form
-   Prescription storage
-   PDF generation
-   Patient prescription viewer

### Phase 12 --- Admin

-   Admin dashboard
-   User management
-   Doctor verification
-   Department management
-   Audit-log viewing

### Phase 13 --- Testing and Polish

-   API testing
-   Authentication testing
-   Role testing
-   File-access testing
-   Appointment conflict testing
-   ML testing
-   Responsive UI testing
-   Final bug fixing

------------------------------------------------------------------------

# 23. Antigravity Task Guidelines

Each Antigravity task should clearly contain:

1.  Objective
2.  Files/modules involved
3.  Requirements
4.  Expected behavior
5.  Edge cases
6.  Tests required
7.  Completion criteria

Example:

``` text
Task:
Implement appointment booking.

Requirements:
- Patient can select a doctor.
- Patient can view available slots.
- Patient can book one slot.
- Doctor can view the appointment.
- Patient can cancel when permitted.
- Prevent duplicate booking for the same doctor/date/time.

Testing:
- Successful booking.
- Invalid doctor.
- Invalid slot.
- Unauthorized access.
- Two users attempting the same slot.
```

Agents should be asked to implement and test the task rather than only
generate code.

Generated implementation plans and test results should be reviewed
before accepting changes.

------------------------------------------------------------------------

# 24. Frontend Requirements

## Public Pages

-   Landing page
-   About/Project information
-   Login
-   Registration

## Patient Pages

-   Dashboard
-   AI Assistant
-   Symptom Checker
-   Doctors
-   Doctor Profile
-   Appointments
-   Medicines
-   Health Records
-   Prescriptions
-   Chat History
-   Symptom History
-   Profile

## Doctor Pages

-   Dashboard
-   Appointments
-   Patients/appointment context
-   Prescriptions
-   Schedule
-   Profile

## Admin Pages

-   Dashboard
-   Users
-   Doctors
-   Departments
-   Appointments
-   Audit Logs

The UI should be responsive for desktop, tablet and mobile screens.

------------------------------------------------------------------------

# 25. Backend Requirements

The backend should provide REST APIs for:

-   Authentication
-   Users
-   Doctors
-   Appointments
-   Medicines
-   Health records
-   Prescriptions
-   AI chat
-   Symptom checking
-   Notifications
-   Admin functions

The backend should include:

-   Authentication middleware
-   Role-based authorization
-   Request validation
-   Centralized error handling
-   Secure file-upload validation
-   Appointment conflict checking
-   AI/ML service integration
-   Environment-variable configuration
-   Basic rate limiting for sensitive endpoints
-   Pagination where required

------------------------------------------------------------------------

# 26. API Design Principles

API responses should use a consistent structure.

Example success response:

``` json
{
  "success": true,
  "data": {}
}
```

Example error response:

``` json
{
  "success": false,
  "error": {
    "code": "INVALID_REQUEST",
    "message": "Invalid appointment details"
  }
}
```

Important principles:

-   Validate input on the backend.
-   Never trust frontend role information.
-   Return appropriate HTTP status codes.
-   Do not expose internal errors or secrets.
-   Keep API keys on the server.
-   Protect patient-owned resources.

------------------------------------------------------------------------

# 27. Security and Privacy

MediGuide handles healthcare-related information, so security must be
treated seriously even though this is a college project.

### Authentication

-   Hash passwords using bcrypt.
-   Use secure authentication sessions/tokens.
-   Use HTTP-only cookies where appropriate.
-   Do not store plain-text passwords.

### Authorization

-   Enforce RBAC on the backend.
-   Verify ownership before accessing patient records.
-   Prevent patients from accessing another patient's data.
-   Prevent doctors from accessing unrelated records.
-   Restrict admin functions.

### File Security

-   Validate file extension and MIME type.
-   Set a reasonable maximum file size.
-   Do not expose private health records through permanent public links.
-   Store only file references in MongoDB.
-   Re-check authorization before file access.

### Application Security

-   Validate user input.
-   Configure CORS appropriately.
-   Use secure HTTP headers.
-   Protect login and password-reset endpoints from abuse.
-   Store secrets in environment variables.
-   Never commit `.env` files to Git.

------------------------------------------------------------------------

# 28. India-Specific Requirements

MediGuide should be designed with Indian users in mind.

-   Phone numbers should support +91.
-   Currency should use INR where applicable.
-   Date/time should be displayed in IST.
-   Indian states and union territories should be supported.
-   Doctor profiles should support Indian registration numbers.
-   City/locality should be available for doctor discovery.
-   Doctors can specify languages spoken.
-   Medical records should support common Indian healthcare documents.
-   UI text should be structured so Indian-language translation can be
    added later.

ABHA/ABDM integration is not part of the college MVP.

------------------------------------------------------------------------

# 29. AI Safety Requirements

MediGuide must clearly separate healthcare assistance from medical
diagnosis.

The system must not:

-   Claim that an AI prediction is a confirmed diagnosis.
-   Autonomously prescribe medication.
-   Recommend changing medication dosage.
-   Replace professional medical advice.
-   Hide uncertainty.
-   Ignore emergency symptoms.

The application should use terminology such as:

-   Preliminary Guidance
-   Suggested Department
-   AI-Generated Information
-   ML-Suggested Result

The symptom-check result should always provide an option to find/book a
doctor.

------------------------------------------------------------------------

# 30. Testing Plan

Testing should focus on the features that are most important to
demonstrate.

## Authentication Testing

-   Valid registration
-   Duplicate email
-   Invalid password
-   Login/logout
-   Unauthorized access
-   Role restrictions

## Appointment Testing

-   Valid booking
-   Invalid slot
-   Cancellation
-   Rescheduling
-   Doctor availability
-   Duplicate booking prevention

## Health Record Testing

-   Valid PDF upload
-   Valid image upload
-   Invalid file type
-   File-size limit
-   Unauthorized record access
-   Preview/download

## AI Testing

-   Normal health question
-   Missing context
-   Unsafe/urgent question
-   AI API failure
-   Chat history storage

## ML Testing

-   Valid symptom input
-   Invalid input
-   Prediction output
-   Confidence score
-   Red-flag override
-   Model API unavailable

## Role Testing

Test separately with:

-   Patient account
-   Doctor account
-   Admin account

At least two patient accounts should be used to verify that one patient
cannot access another patient's private health records.

------------------------------------------------------------------------

# 31. Non-Functional Requirements

  -----------------------------------------------------------------------
  Category                            Requirement
  ----------------------------------- -----------------------------------
  Performance                         Pages and normal API operations
                                      should respond smoothly under
                                      normal college-demo usage

  Usability                           Main features should be
                                      understandable without extensive
                                      instructions

  Responsiveness                      Application should work on desktop,
                                      tablet and mobile

  Security                            Authentication, authorization and
                                      protected file access must be
                                      implemented

  Reliability                         External AI/ML failures should
                                      produce clear user messages instead
                                      of application crashes

  Maintainability                     Code should be modular and readable

  Accessibility                       Use readable text, labels,
                                      keyboard-friendly controls and
                                      appropriate contrast

  Compatibility                       Support current major desktop and
                                      mobile browsers

  Scalability                         Architecture should allow
                                      additional features later without
                                      unnecessary complexity
  -----------------------------------------------------------------------

------------------------------------------------------------------------

# 32. Project Success Criteria

The college MVP will be considered successful when the following flow
works end-to-end:

### Patient Flow

``` text
Register
   ↓
Login
   ↓
Patient Dashboard
   ↓
Use AI Assistant
   ↓
Use Symptom Checker
   ↓
Receive Preliminary Guidance
   ↓
View Suggested Department
   ↓
Find Doctor
   ↓
Book Appointment
   ↓
Add Medicine
   ↓
Upload Health Record
   ↓
View Prescription
```

### Doctor Flow

``` text
Doctor Login
   ↓
Doctor Dashboard
   ↓
View Appointments
   ↓
Open Appointment
   ↓
Create Prescription
   ↓
Generate PDF
```

### Admin Flow

``` text
Admin Login
   ↓
Admin Dashboard
   ↓
View Users
   ↓
Verify Doctor
   ↓
Manage Departments
   ↓
View Appointments / Audit Information
```

------------------------------------------------------------------------

# 33. Demo Checklist

Before the final college demonstration, verify:

-   [ ] Patient registration works.
-   [ ] Patient login works.
-   [ ] Doctor login works.
-   [ ] Admin login works.
-   [ ] Role-based pages work.
-   [ ] AI chatbot works.
-   [ ] Chat history is saved.
-   [ ] Symptom checker works.
-   [ ] ML model returns a department recommendation.
-   [ ] ML evaluation results are documented.
-   [ ] Red-flag scenario works.
-   [ ] Doctor search works.
-   [ ] Appointment booking works.
-   [ ] Duplicate booking is prevented.
-   [ ] Medicine can be added.
-   [ ] Reminder information is displayed.
-   [ ] Real PDF health record can be uploaded.
-   [ ] Health record can be previewed/downloaded.
-   [ ] Doctor can create a prescription.
-   [ ] Prescription PDF can be generated.
-   [ ] Admin can verify a doctor.
-   [ ] Unauthorized record access is blocked.
-   [ ] Application works on mobile layout.
-   [ ] API keys are not exposed in frontend code.
-   [ ] Secrets are not committed to Git.

------------------------------------------------------------------------

# 34. Project Limitations

The following limitations should be openly documented in the project
report:

1.  The ML model is trained using a public dataset rather than real
    clinical data.
2.  Public symptom datasets may not accurately represent India's
    population and disease distribution.
3.  The ML model provides department recommendations, not medical
    diagnoses.
4.  AI responses can contain errors and therefore require safety
    disclaimers.
5.  The application is not connected to real hospital systems.
6.  ABHA/ABDM integration is not implemented.
7.  The project does not provide emergency services.
8.  The college MVP does not include production-scale infrastructure.
9.  The system has not undergone formal clinical, security or regulatory
    certification.
10. SMS, payment and telemedicine integrations are outside the core
    project scope.

These limitations do not make the project incomplete; they define the
boundary of a realistic student project.

------------------------------------------------------------------------

# 35. Future Enhancements

After the college MVP, the following features could be added:

-   Multilingual UI and AI support
-   Hindi, Tamil, Telugu and other Indian-language support
-   ABHA/ABDM integration through official APIs
-   Consent-based health-record sharing
-   OCR for scanned medical reports
-   Telemedicine/video consultations
-   Hospital integration
-   Lab-result integration
-   UPI/payment integration
-   Pharmacy integration
-   More advanced ML models
-   Larger India-representative datasets
-   FHIR-compatible healthcare data
-   Multi-factor authentication
-   Advanced security monitoring

These are future enhancements and should not delay completion of the
core college project.

------------------------------------------------------------------------

# 36. Recommended Development Priority

If development time becomes limited, features should be implemented in
this order:

### Priority 1 --- Must Work

1.  Authentication
2.  Patient/Doctor/Admin roles
3.  Patient dashboard
4.  Doctor management
5.  Appointment booking
6.  Health-record upload
7.  Prescription creation/PDF
8.  AI chatbot

### Priority 2 --- Main Technical Differentiator

9.  ML symptom checker
10. Red-flag safety rules
11. Symptom history

### Priority 3 --- Supporting Features

12. Medicine management
13. Reminders
14. Notifications
15. Audit log
16. Admin analytics

A working core application is more important than adding many advanced
features that are difficult to complete.

------------------------------------------------------------------------

# 37. Final Product Boundary

MediGuide is a **college software-engineering project** demonstrating
full-stack development, AI integration, machine learning, database
management, file handling and role-based healthcare workflows.

It is a healthcare-support and coordination application, not:

-   A hospital information system
-   An emergency response system
-   A medical device
-   An autonomous diagnostic system
-   A prescription-generating medical system
-   A replacement for a Registered Medical Practitioner

Any real-world deployment involving real patients or clinical decisions
would require additional clinical validation, security testing, privacy
controls, regulatory review and professional oversight.

------------------------------------------------------------------------

# 38. Final Development Principle

The main goal of MediGuide is **not to build the largest possible
healthcare application**.

The goal is to build a **complete, understandable, working and
demonstrable college project** in which every major feature can be
explained during a viva.

Every technology and feature should therefore satisfy at least one of
these questions:

1.  Does it solve a real MediGuide requirement?
2.  Can it be implemented reliably within the project timeline?
3.  Can the student explain how it works?
4.  Can it be demonstrated during the final presentation?
5.  Does it meaningfully improve the project?

If the answer is no, the feature should be considered for future
enhancement rather than added to the MVP.
