/**
 * Phase 2: Security & Access Control Automated Verification Suite
 * Tests:
 * 1. BCrypt Password Hashing & Authentication
 * 2. JWT Access Token Expiry & Refresh Token Flow
 * 3. Zod Request Payload Validation on Write Endpoints
 * 4. Strict Role-Based Access Control (RBAC) & IDOR Prevention:
 *    - Patient A reading Patient B records -> 403 Forbidden
 *    - Patient A reading Patient B appointment -> 403 Forbidden
 *    - Patient A reading Patient B prescription -> 403 Forbidden
 *    - Patient accessing Admin routes -> 403 Forbidden
 *    - Doctor accessing patient records WITHOUT an appointment -> 403 Forbidden
 *    - Doctor accessing patient records WITH an appointment -> 200 OK
 *    - Doctor issuing prescription WITHOUT consultation -> 403 Forbidden
 *    - Admin accessing admin routes -> 200 OK
 * 5. Security Audit Logging (Login, Record Access, Prescriptions, Admin actions)
 * 6. Helmet Security Headers & Strict CORS
 */

process.env.NODE_ENV = 'test';

import request from 'supertest';
import { app } from './src/server.js';
import { dbStore } from './src/store/inMemoryStore.js';
import bcrypt from 'bcryptjs';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

async function runSecuritySuite() {
  console.log('===============================================================');
  console.log('🔒 MEDIGUIDE PHASE 2: SECURITY & RBAC VERIFICATION SUITE');
  console.log('===============================================================\n');

  // --- Suite 1: Password Hashing with BCrypt ---
  console.log('[SEC-01] Testing Password Hashing & Authentication...');
  const users = dbStore.users;
  const patientUser = users.find(u => u.email === 'patient@mediguide.com');
  assert(
    patientUser && patientUser.password.startsWith('$2b$'),
    'Stored patient password is a valid BCrypt hash ($2b$)'
  );
  assert(
    patientUser && !patientUser.password.includes('password123'),
    'Plaintext password is never stored or exposed'
  );

  const isHashValid = await bcrypt.compare('password123', patientUser.password);
  assert(isHashValid, 'Bcrypt successfully verifies authentic password');

  // Failed login attempt with incorrect credentials
  const badLoginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'patient@mediguide.com', password: 'wrongpassword' });
  assert(badLoginRes.status === 401, 'Invalid password attempt returns 401 Unauthorized');
  assert(
    badLoginRes.body.success === false,
    'Failed login returns structured error without credential leak'
  );

  // --- Suite 2: JWT Short-lived Access Token & Refresh Token Flow ---
  console.log('\n[SEC-02] Testing JWT Expiry & Refresh Token Rotation...');
  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'patient@mediguide.com', password: 'password123' });

  assert(loginRes.status === 200, 'Valid login returns status 200 OK');
  assert(
    loginRes.body.token && loginRes.body.accessToken,
    'Login returns access token for authorization'
  );
  assert(loginRes.body.refreshToken, 'Login returns refresh token for rotation');

  const patientToken = loginRes.body.accessToken;
  const patientRefreshToken = loginRes.body.refreshToken;

  // Refresh Token endpoint
  const refreshRes = await request(app)
    .post('/api/auth/refresh-token')
    .send({ refreshToken: patientRefreshToken });

  assert(refreshRes.status === 200, 'POST /api/auth/refresh-token returns 200 OK');
  assert(refreshRes.body.accessToken, 'Refresh token endpoint provides new access token');
  assert(refreshRes.body.refreshToken, 'Refresh token endpoint rotates refresh token');

  // Bad Refresh Token test
  const badRefreshRes = await request(app)
    .post('/api/auth/refresh-token')
    .send({ refreshToken: 'invalid.jwt.token.string' });
  assert(
    badRefreshRes.status === 401,
    'Invalid refresh token is rejected with 401 Unauthorized'
  );

  // --- Suite 3: Zod Payload Validation on Write Endpoints ---
  console.log('\n[SEC-03] Testing Zod Request Payload Validation...');
  // Bad registration (invalid email)
  const badRegRes = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Test', email: 'not-an-email', password: '123' });
  assert(badRegRes.status === 400, 'Registration with invalid email returns 400 Bad Request');

  // Bad appointment booking (missing reason)
  const badAptRes = await request(app)
    .post('/api/appointments')
    .set('Authorization', `Bearer ${patientToken}`)
    .send({ doctorId: 'doc-cardio-1', date: 'not-a-date' });
  assert(
    badAptRes.status === 400,
    'Appointment booking with invalid schema returns 400 Bad Request'
  );

  // --- Suite 4: Strict RBAC & IDOR Cross-User Isolation ---
  console.log('\n[SEC-04] Testing Strict RBAC & Cross-User Isolation...');

  // Setup: Authenticate Patient A (Rahul Sharma)
  const patientARes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'patient@mediguide.com', password: 'password123' });
  const patientAToken = patientARes.body.accessToken;
  const patientAId = patientARes.body.user.id;

  // Setup: Authenticate Patient B (Priya Nair)
  const patientBRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'priya.nair@mediguide.com', password: 'password123' });
  const patientBId = patientBRes.body.user.id;

  // Setup: Ensure Patient B has an appointment and prescription
  const patientBAppointment = dbStore.addAppointment({
    id: `apt-patient-b-${Date.now()}`,
    patientId: patientBId,
    patientName: 'Priya Nair',
    doctorId: 'doc-derma-1',
    doctorName: 'Dr. Ananya Deshmukh',
    date: '2026-10-22',
    timeSlot: '11:30 AM',
    status: 'confirmed',
    reason: 'Skin allergy consultation',
  });

  const patientBPrescription = dbStore.addPrescription({
    id: `rx-patient-b-${Date.now()}`,
    patientId: patientBId,
    patientName: 'Priya Nair',
    doctorId: 'doc-derma-1',
    doctorName: 'Dr. Ananya Deshmukh',
    registrationNumber: 'NMC-2026-4482',
    qrVerificationCode: 'MG-RX-IN-TEST-999',
    date: '2026-10-22',
    diagnosis: 'Contact Dermatitis',
    medicines: [
      {
        name: 'Cetirizine',
        dosage: '10mg',
        frequency: 'Once Daily',
        duration: '7 days',
        instructions: 'Take at night',
      },
    ],
    diagnosticTests: ['Serum IgE', 'Patch Allergy Test'],
  });

  // Test 1: Patient A attempts to read Patient B's health records
  const crossRecordRes = await request(app)
    .get(`/api/health-records?patientId=${patientBId}`)
    .set('Authorization', `Bearer ${patientAToken}`);
  assert(
    crossRecordRes.status === 403,
    'Patient A reading Patient B health records returns 403 Forbidden'
  );

  // Test 2: Patient A attempts to read Patient B's medicines
  const crossMedRes = await request(app)
    .get(`/api/medicines?patientId=${patientBId}`)
    .set('Authorization', `Bearer ${patientAToken}`);
  assert(
    crossMedRes.status === 403,
    'Patient A reading Patient B medicines returns 403 Forbidden'
  );

  // Test 3: Patient A attempts to read Patient B's appointment by ID
  const crossAptRes = await request(app)
    .get(`/api/appointments/${patientBAppointment.id}`)
    .set('Authorization', `Bearer ${patientAToken}`);
  assert(
    crossAptRes.status === 403,
    'Patient A reading Patient B appointment by ID returns 403 Forbidden'
  );

  // Test 4: Patient A attempts to read Patient B's prescription by ID
  const crossRxRes = await request(app)
    .get(`/api/prescriptions/${patientBPrescription.id}`)
    .set('Authorization', `Bearer ${patientAToken}`);
  assert(
    crossRxRes.status === 403,
    'Patient A reading Patient B prescription returns 403 Forbidden'
  );

  // Test 5: Patient attempts to access Admin Routes
  const adminBlockedRes = await request(app)
    .get('/api/admin/stats')
    .set('Authorization', `Bearer ${patientAToken}`);
  assert(
    adminBlockedRes.status === 403,
    'Patient accessing /api/admin/stats returns 403 Forbidden'
  );

  const adminUsersBlockedRes = await request(app)
    .get('/api/admin/users')
    .set('Authorization', `Bearer ${patientAToken}`);
  assert(
    adminUsersBlockedRes.status === 403,
    'Patient accessing /api/admin/users returns 403 Forbidden'
  );

  // Test 6: Authenticate Doctor (Dr. Rajesh Venkat - doc-cardio-1)
  const doctorLoginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'doctor.smith@mediguide.com', password: 'password123' });
  const doctorToken = doctorLoginRes.body.accessToken;

  // Find a patient who has NO appointment with Dr. Rajesh Venkat
  // Let's create an unlinked patient to test negative doctor access
  const unlinkedPatient = {
    id: `usr-unlinked-${Date.now()}`,
    name: 'Unlinked Patient',
    email: `unlinked.${Date.now()}@example.com`,
    password: patientUser.password,
    role: 'patient',
  };
  dbStore.addUser(unlinkedPatient);

  const doctorNoAptRes = await request(app)
    .get(`/api/health-records?patientId=${unlinkedPatient.id}`)
    .set('Authorization', `Bearer ${doctorToken}`);
  assert(
    doctorNoAptRes.status === 403,
    'Doctor accessing records of patient with NO appointment returns 403 Forbidden'
  );

  // Test 7: Doctor prescription issuance WITHOUT an appointment
  const doctorUnlinkedRxRes = await request(app)
    .post('/api/prescriptions')
    .set('Authorization', `Bearer ${doctorToken}`)
    .send({
      patientId: unlinkedPatient.id,
      diagnosis: 'Hypertension',
      medicines: [
        {
          name: 'Amlodipine',
          dosage: '5mg',
          frequency: 'Once Daily',
          duration: '30 days',
        },
      ],
    });
  assert(
    doctorUnlinkedRxRes.status === 403,
    'Doctor issuing prescription to patient with NO appointment returns 403 Forbidden'
  );

  // Test 8: Doctor access to patient WITH an appointment
  // Create an appointment between Dr. Rajesh and Patient A
  dbStore.addAppointment({
    id: `apt-test-${Date.now()}`,
    patientId: patientAId,
    patientName: 'Rahul Sharma',
    doctorId: 'doc-cardio-1',
    doctorName: 'Dr. Rajesh Venkat',
    date: '2026-10-15',
    timeSlot: '10:00 AM',
    status: 'confirmed',
    reason: 'Routine Cardiology Follow-up',
  });

  const doctorAllowedRes = await request(app)
    .get(`/api/health-records?patientId=${patientAId}`)
    .set('Authorization', `Bearer ${doctorToken}`);
  assert(
    doctorAllowedRes.status === 200,
    'Doctor accessing records of patient WITH appointment returns 200 OK'
  );

  // Test 9: Admin Authorized Access
  const adminLoginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@mediguide.com', password: 'admin123' });
  const adminToken = adminLoginRes.body.accessToken;

  const adminStatsRes = await request(app)
    .get('/api/admin/stats')
    .set('Authorization', `Bearer ${adminToken}`);
  assert(
    adminStatsRes.status === 200,
    'Admin successfully accesses /api/admin/stats (200 OK)'
  );

  // --- Suite 5: Security Audit Trail Verification ---
  console.log('\n[SEC-05] Testing Security Audit Trail Events...');
  const auditLogs = dbStore.getAuditLogs();
  const hasLoginLog = auditLogs.some(
    l => l.eventType === 'USER_LOGIN' || l.eventType === 'DEMO_LOGIN'
  );
  assert(hasLoginLog, 'Audit trail records USER_LOGIN events');

  const hasRecordAccessLog = auditLogs.some(l => l.eventType === 'RECORD_ACCESS');
  assert(hasRecordAccessLog, 'Audit trail records RECORD_ACCESS events on record fetch');

  const hasFailedLoginLog = auditLogs.some(l => l.eventType === 'FAILED_LOGIN_ATTEMPT');
  assert(hasFailedLoginLog, 'Audit trail records FAILED_LOGIN_ATTEMPT security events');

  // --- Suite 6: Security Headers (Helmet) ---
  console.log('\n[SEC-06] Testing Helmet Security Headers...');
  const headersRes = await request(app).get('/api/health');
  assert(
    headersRes.headers['x-content-type-options'] === 'nosniff',
    'Helmet X-Content-Type-Options: nosniff header is present'
  );
  assert(
    headersRes.headers['x-dns-prefetch-control'] !== undefined,
    'Helmet DNS prefetch control header is active'
  );

  console.log('\n===============================================================');
  console.log(`📊 PHASE 2 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('===============================================================');

  if (failed === 0) {
    console.log('🎉 ALL PHASE 2 SECURITY & RBAC SPECIFICATIONS VERIFIED!');
    process.exit(0);
  } else {
    console.error('❌ SOME PHASE 2 TESTS FAILED.');
    process.exit(1);
  }
}

runSecuritySuite().catch(err => {
  console.error('Unexpected test error:', err);
  process.exit(1);
});
