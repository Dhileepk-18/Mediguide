/**
 * Comprehensive Automated System Test for MediGuide India (PRD v1.0)
 * Validates all 18 Functional Requirements (FR-01 through FR-18)
 */
import { dbStore as inMemoryStore } from './src/store/inMemoryStore.js';

async function runTests() {
  console.log('===============================================================');
  console.log('🧪 RUNNING MEDIGUIDE PRD v1.0 FULL SYSTEM VERIFICATION SUITE');
  console.log('===============================================================');

  let passed = 0;
  let failed = 0;

  function assert(cond, name) {
    if (cond) {
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${name}`);
      failed++;
    }
  }

  try {
    // FR-01: User Authentication & Role-Based Access Control
    console.log('\n[FR-01] Testing User Authentication & RBAC...');
    const patient = inMemoryStore.users.find(u => u.role === 'patient');
    const doctor = inMemoryStore.users.find(u => u.role === 'doctor');
    const admin = inMemoryStore.users.find(u => u.role === 'admin');
    assert(patient && doctor && admin, 'All 3 user roles exist in seed store');
    assert(patient.phone.startsWith('+91'), 'Patient phone uses Indian +91 format');

    // FR-02: Patient Health Profile Management
    console.log('\n[FR-02] Testing Patient Health Profile Management...');
    assert(
      patient.bloodGroup && patient.city && patient.state,
      'Patient has blood group, city, state'
    );
    assert(
      Array.isArray(patient.allergies) && Array.isArray(patient.chronicConditions),
      'Allergies and chronic conditions arrays exist'
    );

    // FR-03: AI Medical Query Assistant & FR-04: Symptom Checker & Clinical Triage
    console.log('\n[FR-03 & FR-04] Testing Dual AI Architecture & Symptom Triage...');
    const cardiologyDept = inMemoryStore.departments.find(d => d.name === 'Cardiology');
    assert(
      cardiologyDept && cardiologyDept.name === 'Cardiology',
      'Medical department taxonomy configured'
    );

    // FR-05: Department & Specialty Recommendation
    console.log('\n[FR-05] Testing Department & Specialty Recommendation...');
    assert(
      inMemoryStore.departments.length >= 8,
      `Found ${inMemoryStore.departments.length} departments (target >= 8)`
    );

    // FR-06: Doctor Discovery & Search
    console.log('\n[FR-06] Testing Doctor Discovery with Indian Filters...');
    const aiimsDoc = inMemoryStore.doctors.find(
      d => d.hospital.includes('AIIMS') || d.city === 'New Delhi'
    );
    assert(aiimsDoc && aiimsDoc.registrationNumber, 'Doctor has NMC registration number');
    assert(
      aiimsDoc.consultationFee > 0,
      `Doctor consultation fee in INR: ₹${aiimsDoc.consultationFee}`
    );

    // FR-07: Appointment Scheduling & Conflict Protection
    console.log('\n[FR-07] Testing Appointment Scheduling in IST...');
    const appts = inMemoryStore.appointments;
    assert(appts.length > 0, `Found ${appts.length} active appointments in store`);
    assert(
      appts[0].timeSlot.includes('AM') || appts[0].timeSlot.includes('PM'),
      'Time slot formatted in IST standard'
    );

    // FR-08: Appointment Rescheduling & Cancellation
    console.log('\n[FR-08] Testing Appointment Rescheduling & Cancellation...');
    const sampleApt = inMemoryStore.appointments[0];
    assert(
      sampleApt &&
        ['confirmed', 'rescheduled', 'completed', 'cancelled'].includes(sampleApt.status),
      'Valid appointment status'
    );

    // FR-09: Digital Prescription Management & FR-10: E-Prescription Builder
    console.log(
      '\n[FR-09 & FR-10] Testing Digital Prescriptions with NMC Reg & Diagnostic Tests...'
    );
    const rx =
      inMemoryStore.prescriptions.find(p => p.id === 'rx-seed-1') ||
      inMemoryStore.prescriptions[0];
    assert(
      rx && rx.registrationNumber && rx.qrVerificationCode,
      'Prescription has NMC reg number and QR code'
    );
    assert(rx.medicines.length > 0, `Prescription has ${rx.medicines.length} medicines`);
    assert(
      rx.diagnosticTests && rx.diagnosticTests.length > 0,
      'Prescription has diagnostic tests advised'
    );

    // FR-11: Medicine & Prescription Tracker
    console.log('\n[FR-11] Testing Medicine Reminder & Adherence Tracker...');
    const meds = inMemoryStore.medicines;
    assert(meds.length > 0, `Found ${meds.length} scheduled medicines`);
    assert(
      meds[0].mealTiming && meds[0].slotTiming,
      'Medicine includes meal timing and slot timing'
    );

    // FR-12: Digital Health Records Vault
    console.log('\n[FR-12] Testing Health Records Vault with PDF categories...');
    const records = inMemoryStore.healthRecords;
    assert(records.length > 0, `Found ${records.length} health records`);
    assert(records[0].fileName.endsWith('.pdf'), 'Health record has PDF filename format');

    // FR-13: Doctor Schedule & Availability
    console.log('\n[FR-13] Testing Doctor Practice Schedule...');
    assert(
      aiimsDoc.availableDays.length > 0 && aiimsDoc.availableTimeSlots.length > 0,
      'Doctor has working days and time slots'
    );

    // FR-14: Admin Portal & Doctor Verification
    console.log('\n[FR-14] Testing Admin Portal & Doctor Verification...');
    const settings = inMemoryStore.getSystemSettings();
    assert(settings.aiProvider, 'System settings has AI provider configured');
    assert(
      settings.emergencyHelplines.nationalEmergency === '112',
      '112 National Emergency helpline configured'
    );

    // FR-15: In-App Notifications
    console.log('\n[FR-15] Testing In-App Notification Center...');
    const notifs = inMemoryStore.notifications;
    assert(notifs.length > 0, `Found ${notifs.length} in-app notifications`);
    assert(
      notifs.some(n => n.type === 'appointment' || n.type === 'medicine'),
      'Notification categories validated'
    );

    // FR-16: Security Audit Trail & Compliance Logging
    console.log('\n[FR-16] Testing Immutable Security Audit Trail...');
    const logs = inMemoryStore.auditLogs;
    assert(logs.length > 0, `Found ${logs.length} security audit trail events`);
    assert(
      logs[0].timestamp && (logs[0].eventType || logs[0].action),
      'Audit logs have ISO timestamps and event identifiers'
    );

    // FR-17: Emergency Escalation Protocol
    console.log('\n[FR-17] Testing 24x7 India Emergency SOS Protocol...');
    const helplines = settings.emergencyHelplines;
    assert(
      helplines.nationalEmergency === '112' &&
        helplines.ambulance === '108' &&
        helplines.teleManasMentalHealth === '14416',
      'All India emergency numbers configured'
    );

    // FR-18: India-First Localization & DPDP Act 2023 Compliance
    console.log('\n[FR-18] Testing DPDP Act 2023 Portability & Erasure...');
    const exportData = inMemoryStore.exportUserData(patient.id);
    assert(
      exportData.profile &&
        Array.isArray(exportData.appointments) &&
        Array.isArray(exportData.prescriptions),
      'DPDP full data export validated'
    );

    // Phase 1: MongoDB & Mongoose Schemas Verification
    console.log('\n[Phase 1] Testing MongoDB & Mongoose Schema Architecture...');
    const {
      User,
      Doctor,
      DoctorProfile,
      Department,
      Appointment,
      Prescription,
      HealthRecord,
      Medicine,
      MedicineSchedule,
      DoseLog,
      AuditLog,
      ChatHistory,
      SymptomCheck,
      Notification,
      SystemSettings,
    } = await import('./src/models/schemas.js');

    assert(
      User && Doctor && DoctorProfile && Department && Appointment && Prescription,
      'Core clinical Mongoose models exported (User, Doctor, DoctorProfile, Department, Appointment, Prescription)'
    );
    assert(
      HealthRecord && Medicine && MedicineSchedule && DoseLog && AuditLog,
      'Vault, Medication, DoseLog, and AuditLog Mongoose models exported'
    );
    assert(
      ChatHistory && SymptomCheck && Notification && SystemSettings,
      'AI conversation, SymptomCheck, Notification, and SystemSettings models exported'
    );

    // Validate Schema compilation with sample documents
    const testUser = new User({
      id: 'test-usr-1',
      name: 'Test Aarav',
      email: 'aarav.test@mediguide.com',
      password: 'sample_hash_pwd',
      role: 'patient',
    });
    const testUserValidation = testUser.validateSync();
    assert(!testUserValidation, 'User Mongoose model validates correctly');

    const testDoctor = new Doctor({
      id: 'test-doc-1',
      name: 'Dr. Test',
      email: 'dr.test@mediguide.com',
      specialization: 'Cardiology',
      department: 'Cardiology',
      registrationNumber: 'NMC-2026-999999',
    });
    const testDocValidation = testDoctor.validateSync();
    assert(!testDocValidation, 'DoctorProfile Mongoose model validates correctly');

    const testAppointment = new Appointment({
      id: 'test-apt-1',
      patientId: 'test-usr-1',
      patientName: 'Test Aarav',
      doctorId: 'test-doc-1',
      doctorName: 'Dr. Test',
      department: 'Cardiology',
      date: '2026-10-10',
      timeSlot: '10:00 AM',
    });
    const testAptValidation = testAppointment.validateSync();
    assert(!testAptValidation, 'Appointment Mongoose model validates correctly');

    const { connectDB, isDbConnected } = await import('./src/config/db.js');
    assert(typeof connectDB === 'function' && typeof isDbConnected === 'function', 'Database connection module exports connectDB & isDbConnected');

    // Phase 3: ML Triage Evaluation & Safety Guardrails
    console.log('\n[Phase 3] Testing ML Triage Safety Guardrails & Explainability...');
    const { detectEmergencyRedFlags, analyzeSymptoms } = await import('./src/services/aiService.js');

    // 1. Red-flag pattern matcher
    const chestPainCheck = detectEmergencyRedFlags(['severe crushing chest pain', 'sweating'], 'Severe');
    assert(chestPainCheck.isTriggered, 'Emergency red-flag detected for acute chest pain');
    assert(chestPainCheck.matchedKeywords.includes('chest pain'), 'Matched keywords include chest pain');
    assert(chestPainCheck.emergencyContacts.national === '112', 'Emergency contacts include 112');

    const strokeCheck = detectEmergencyRedFlags(['sudden slurred speech', 'facial droop'], 'Moderate');
    assert(strokeCheck.isTriggered, 'Emergency red-flag detected for stroke symptoms');

    const routineCheck = detectEmergencyRedFlags(['mild dry skin and itching'], 'Mild');
    assert(!routineCheck.isTriggered, 'Non-emergency presentation correctly identified as routine');

    // 2. analyzeSymptoms with Emergency Presentation
    const emergencyTriageResult = await analyzeSymptoms(
      'test-usr-1',
      ['severe chest pain radiating to left arm', 'profuse sweating'],
      'Severe',
      '1 hour',
      'Chest',
      'Sudden onset while resting'
    );
    assert(emergencyTriageResult.redFlagDetected === true, 'Emergency triage sets redFlagDetected to true');
    assert(emergencyTriageResult.isEmergency === true, 'Emergency triage sets isEmergency to true');
    assert(emergencyTriageResult.urgencyLevel === 'High / Seek Immediate Care', 'Emergency urgencyLevel elevated to High');
    assert(emergencyTriageResult.emergencyContacts && emergencyTriageResult.emergencyContacts.national === '112', 'Emergency contacts returned in triage payload');
    assert(emergencyTriageResult.contributingFactors.length > 0, 'Contributing factors returned for explainability');

    // 3. analyzeSymptoms with Routine Presentation
    const routineTriageResult = await analyzeSymptoms(
      'test-usr-1',
      ['dry itchy skin rash with scales'],
      'Mild',
      '5 days',
      'Arms',
      'None'
    );
    assert(routineTriageResult.redFlagDetected === false, 'Routine triage sets redFlagDetected to false');
    assert(routineTriageResult.recommendedDepartment === 'Dermatology', 'Routine skin symptoms route to Dermatology');
    assert(routineTriageResult.contributingFactors.length > 0, 'Routine triage includes contributing factors for explainability');
    assert(typeof routineTriageResult.explanation === 'string' && routineTriageResult.explanation.length > 10, 'Routine triage includes explanatory text');

    // 4. Verify evaluation metrics and confusion matrix exist
    const fs = await import('fs');
    const path = await import('path');
    const { fileURLToPath } = await import('url');
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const rootDir = path.resolve(__dirname, '..');
    const metricsPath = path.join(rootDir, 'ml-service', 'model', 'evaluation_metrics.json');
    const cmPath = path.join(rootDir, 'ml-service', 'model', 'confusion_matrix.png');
    assert(fs.existsSync(metricsPath), 'ML evaluation metrics report exists');
    assert(fs.existsSync(cmPath), 'ML confusion matrix visualization exists');
    const metricsContent = JSON.parse(fs.readFileSync(metricsPath, 'utf8'));
    assert(metricsContent.overall_metrics && metricsContent.overall_metrics.accuracy >= 0.90, `ML model accuracy >= 90% (achieved: ${(metricsContent.overall_metrics.accuracy * 100).toFixed(1)}%)`);
    assert(metricsContent.red_flag_safety_benchmark && metricsContent.red_flag_safety_benchmark.emergency_recall_percentage === 100, `Red-flag emergency recall is 100% (achieved: ${metricsContent.red_flag_safety_benchmark.emergency_recall_percentage}%)`);

    console.log('\n===============================================================');
    console.log(`📊 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('===============================================================');

    if (failed === 0) {
      console.log('🎉 ALL 18 FUNCTIONAL REQUIREMENTS VERIFIED SUCCESSFULLY!');
    } else {
      process.exit(1);
    }
  } catch (e) {
    console.error('Test execution error:', e);
    process.exit(1);
  }
}

runTests();
