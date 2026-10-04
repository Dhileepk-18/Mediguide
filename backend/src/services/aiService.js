import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config/index.js';
import { dbStore } from '../store/inMemoryStore.js';
import { isDbConnected } from '../config/db.js';
import { SymptomCheck } from '../models/schemas.js';
import fs from 'fs';
import path from 'path';
let activeApiKey = config.geminiApiKey || process.env.GEMINI_API_KEY || '';
let genAI = activeApiKey ? new GoogleGenerativeAI(activeApiKey) : null;
export function setApiKey(newKey) {
  // Sanitize key to only allow valid alphanumeric / base64 / standard key characters
  const sanitizedKey = typeof newKey === 'string' ? newKey.trim() : '';
  if (sanitizedKey && /^[a-zA-Z0-9_\-\.]{10,128}$/.test(sanitizedKey)) {
    activeApiKey = sanitizedKey;
    genAI = new GoogleGenerativeAI(activeApiKey);
    config.geminiApiKey = activeApiKey;
    process.env.GEMINI_API_KEY = activeApiKey;
    // Persist to backend/.env if possible safely
    try {
      const envPath = path.resolve(process.cwd(), '.env');
      let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf-8') : '';
      if (envContent.includes('GEMINI_API_KEY=')) {
        envContent = envContent.replace(/GEMINI_API_KEY=.*/, `GEMINI_API_KEY=${activeApiKey}`);
      } else {
        envContent += `\nGEMINI_API_KEY=${activeApiKey}\n`;
      }
      fs.writeFileSync(envPath, envContent, 'utf-8');
    } catch (e) {
      console.warn('Could not persist key to .env file:', e);
    }
    return { success: true, hasKey: true };
  } else if (!sanitizedKey) {
    activeApiKey = '';
    genAI = null;
    return { success: true, hasKey: false };
  } else {
    throw new Error('Invalid API Key format.');
  }
}
export function getAiConfig() {
  return {
    hasKey: Boolean(activeApiKey && activeApiKey.length > 5),
    activeModel: activeApiKey
      ? 'Google Gemini 2.0 Flash (Live AI)'
      : 'MediGuide Clinical Engine (Key Required for Live Gemini)',
    provider: activeApiKey ? 'Google AI Studio / Gemini API' : 'Built-in Clinical Knowledgebase',
  };
}
const MEDICAL_SYSTEM_PROMPT = `
You are MediGuide AI, an intelligent, fast, and empathetic clinical AI health companion.
Your goal is to provide reassuring, evidence-informed preliminary health guidance structured into clear, actionable sections.

CRITICAL CLINICAL & FORMATTING RULES:
1. Keep replies concise, fast, and structured (under 140 words).
2. Structure your response into these clean Markdown sections:
   ### [Short Contextual Title]
   - **What it may mean:** 1-2 sentence clinical perspective.
   - **What you can do now:** 2-3 practical self-care steps.
   - **When to seek care:** Clear clinical red flags.
   *Recommended Specialist: **[Specialty Name]*** (e.g., General Medicine, Cardiology, Neurology, Dermatology, Orthopedics, ENT, Pediatrics).
3. If red-flag emergency symptoms are present (severe chest pressure, sudden slurred speech, heavy bleeding), clearly prioritize emergency evaluation.
`;
export async function generateChatResponse(userMessage, history = []) {
  // If Gemini API is available, invoke real Gemini AI
  if (genAI && activeApiKey) {
    const candidateModels = [
      'gemini-3.8-flash',
      'gemini-2.5-flash',
      'gemini-2.0-flash',
      'gemini-1.5-flash',
      'gemini-flash-latest',
    ];
    for (const modelName of candidateModels) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 600,
          },
        });
        const chatContext = history
          .slice(-4)
          .map(h => `${h.sender === 'user' ? 'User' : 'Assistant'}: ${h.text}`)
          .join('\n\n');
        const fullPrompt = `${MEDICAL_SYSTEM_PROMPT}\n\nConversation History:\n${chatContext}\n\nUser Question: ${userMessage}\n\nPlease provide a fast, concise, structured clinical answer (under 150 words) with bullet points and a brief title (###). At the very end, provide 2-3 short relevant follow-up questions formatted strictly as: [SUGGESTIONS: question1 | question2 | question3]`;
        const result = await model.generateContent(fullPrompt);
        let responseText = result.response.text();
        // Extract suggestions if present
        let suggestions = [];
        const suggestionMatch = responseText.match(/\[SUGGESTIONS:\s*(.*?)\]/i);
        if (suggestionMatch && suggestionMatch[1]) {
          suggestions = suggestionMatch[1]
            .split('|')
            .map(s => s.trim())
            .filter(Boolean);
          responseText = responseText.replace(/\[SUGGESTIONS:.*?\]/i, '').trim();
        }
        if (suggestions.length === 0) {
          suggestions = generateSuggestedFollowups(userMessage, responseText);
        }
        if (responseText && responseText.length > 20) {
          return {
            text: responseText,
            suggestions,
            modelUsed: `Google Gemini (${modelName})`,
          };
        }
      } catch (err) {
        console.warn(`Attempt with ${modelName} failed:`, err.message || err);
        // Continue to next candidate model or fallback
      }
    }
  }
  // Fallback intelligent reasoning engine
  const fallback = dynamicHealthcareChat(userMessage);
  return {
    ...fallback,
    modelUsed: 'MediGuide Clinical Engine (Add Gemini API Key for Live AI)',
  };
}

export async function* generateChatResponseStream(userMessage, history = []) {
  if (genAI && activeApiKey) {
    const candidateModels = [
      'gemini-3.8-flash',
      'gemini-2.5-flash',
      'gemini-2.0-flash',
      'gemini-1.5-flash',
      'gemini-flash-latest',
    ];
    for (const modelName of candidateModels) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 600,
          },
        });
        const chatContext = history
          .slice(-4)
          .map(h => `${h.sender === 'user' ? 'User' : 'Assistant'}: ${h.text}`)
          .join('\n\n');
        const fullPrompt = `${MEDICAL_SYSTEM_PROMPT}\n\nConversation History:\n${chatContext}\n\nUser Question: ${userMessage}\n\nPlease provide a fast, concise, structured clinical answer (under 150 words) with bullet points and a brief title (###).`;

        const streamingResult = await model.generateContentStream(fullPrompt);
        let yieldedAny = false;
        for await (const chunk of streamingResult.stream) {
          const chunkText = chunk.text();
          if (chunkText) {
            yieldedAny = true;
            yield chunkText;
          }
        }
        if (yieldedAny) {
          return;
        }
      } catch (err) {
        console.warn(`Streaming attempt with ${modelName} failed:`, err.message || err);
      }
    }
  }

  // Fallback intelligent reasoning engine
  const fallback = dynamicHealthcareChat(userMessage);
  yield fallback.text;
}

// Red-flag emergency detection patterns for deterministic safety overrides (PRD Section 9.6)
export const RED_FLAG_EMERGENCY_PATTERNS = [
  'chest pain',
  'chest tightness',
  'heart attack',
  'breathlessness',
  'shortness of breath',
  'slurred speech',
  'facial droop',
  'uncontrolled bleeding',
  'loss of consciousness',
  'unresponsive',
  'anaphylaxis',
  'tongue swelling',
  'throat closing',
  'cyanosis',
  'thunderclap headache',
  'coughing up blood',
  'hemoptysis',
  'status epilepticus',
  'seizure lasting',
];

export const CRITICAL_UNCONDITIONAL_RED_FLAGS = [
  'heart attack',
  'slurred speech',
  'uncontrolled bleeding',
  'loss of consciousness',
  'unresponsive',
  'anaphylaxis',
  'throat closing',
  'cyanosis',
  'chest pain',
  'thunderclap headache',
  'coughing up blood',
];

export function detectEmergencyRedFlags(symptoms, severity = 'Moderate', context = '') {
  const symptomList = Array.isArray(symptoms) ? symptoms : [String(symptoms)];
  const combined = (symptomList.join(' ') + ' ' + (context || '')).toLowerCase();
  
  const matched = RED_FLAG_EMERGENCY_PATTERNS.filter(pattern => combined.includes(pattern));
  const isCritical = CRITICAL_UNCONDITIONAL_RED_FLAGS.some(pattern => combined.includes(pattern));
  const isTriggered = isCritical || (matched.length > 0 && (severity === 'Severe' || severity === 'Moderate'));
  
  return {
    isTriggered,
    matchedKeywords: matched.length > 0 ? matched : (isTriggered ? ['acute emergency indicator'] : []),
    emergencyContacts: { national: '112', ambulance: '108', medical: '102' }
  };
}

export async function analyzeSymptoms(
  userId,
  symptoms,
  severity,
  duration,
  bodyArea,
  additionalNotes
) {
  const symptomText = symptoms.join(', ');
  const redFlagCheck = detectEmergencyRedFlags(
    symptoms,
    severity,
    `${bodyArea || ''} ${additionalNotes || ''}`
  );

  // 1. Try dedicated Python FastAPI ML Service (PRD Section 9, Techstack Section 8.5)
  const mlServiceUrl = config.mlServiceUrl || process.env.ML_SERVICE_URL || 'http://localhost:8000';
  try {
    const mlResponse = await fetch(`${mlServiceUrl}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        symptoms,
        duration: duration || '2-3 days',
        severity: severity || 'Moderate',
        context: `${bodyArea || ''} ${additionalNotes || ''}`.trim(),
      }),
      signal: AbortSignal.timeout(2000),
    });

    if (mlResponse.ok) {
      const mlData = await mlResponse.json();
      const isEmergencyEffective = Boolean(mlData.redFlagDetected || redFlagCheck.isTriggered);
      const effectiveDept = isEmergencyEffective && !mlData.redFlagDetected
        ? 'Emergency Medicine / Cardiology'
        : (mlData.recommendedDepartment || 'General Medicine');

      const allDocs = dbStore.getAllDoctors();
      const matchedDocs = allDocs.filter(
        d =>
          d.department.toLowerCase() ===
            effectiveDept.toLowerCase() && d.isAvailable
      );
      const matchedDoctorIds =
        matchedDocs.length > 0 ? matchedDocs.map(d => d.id) : allDocs.slice(0, 2).map(d => d.id);

      const symptomResult = {
        id: `sym-${Date.now()}`,
        userId,
        symptoms,
        severity,
        duration,
        bodyArea,
        additionalNotes,
        modelUsed: 'MediGuide Python Random Forest ML Service (FastAPI)',
        confidence: isEmergencyEffective ? Math.max(mlData.confidence || 82, 95) : (mlData.confidence || 82),
        recommendedDepartment: effectiveDept,
        alternativeDepartments: mlData.topAlternatives || [],
        preliminaryGuidance: isEmergencyEffective && !mlData.redFlagDetected
          ? 'CRITICAL EMERGENCY: Severe acute cardiovascular or respiratory indicators detected. Prioritize immediate emergency care or call 112 / 108.'
          : mlData.preliminaryGuidance,
        possibleConditions: [effectiveDept, 'Primary Clinical Assessment'],
        urgencyLevel: isEmergencyEffective
          ? 'High / Seek Immediate Care'
          : severity === 'Severe'
            ? 'Moderate / Consult Soon'
            : 'Low / Routine',
        redFlagDetected: isEmergencyEffective,
        isEmergency: isEmergencyEffective,
        contributingFactors: mlData.contributingFactors?.length > 0
          ? mlData.contributingFactors
          : (redFlagCheck.matchedKeywords.length > 0 ? redFlagCheck.matchedKeywords : symptoms.slice(0, 3)),
        explanation: mlData.explanation || (isEmergencyEffective
          ? `Emergency safety override activated due to critical indicators: ${redFlagCheck.matchedKeywords.join(', ')}.`
          : `Recommendation for ${effectiveDept} is guided by reported symptoms.`),
        emergencyContacts: { national: '112', ambulance: '108', medical: '102' },
        matchedDoctorIds,
        disclaimer:
          mlData.disclaimer ||
          'Suggested Department — Not a Medical Diagnosis. Based on Random Forest classification.',
        createdAt: new Date().toISOString(),
      };

      dbStore.addSymptomCheck(symptomResult);
      if (isDbConnected()) {
        SymptomCheck.create(symptomResult).catch(e => console.warn(e.message));
      }
      return symptomResult;
    }
  } catch (_mlErr) {
    // Python ML service offline or timed out, seamlessly proceed to Gemini or heuristic
  }

  // 1b. Deterministic Emergency Guardrail (if ML service offline and red flags detected)
  if (redFlagCheck.isTriggered) {
    const allDocs = dbStore.getAllDoctors();
    const matchedDocs = allDocs.filter(d => d.department.toLowerCase() === 'cardiology' && d.isAvailable);
    const matchedDoctorIds = matchedDocs.length > 0 ? matchedDocs.map(d => d.id) : allDocs.slice(0, 2).map(d => d.id);
    const emergencyResult = {
      id: `sym-${Date.now()}`,
      userId,
      symptoms,
      severity,
      duration,
      bodyArea,
      additionalNotes,
      modelUsed: 'MediGuide Emergency Safety Protocol (Deterministic Guardrail)',
      confidence: 96,
      recommendedDepartment: 'Emergency Medicine / Cardiology',
      alternativeDepartments: [
        { department: 'Cardiology', confidence: 90 },
        { department: 'Pulmonology', confidence: 75 }
      ],
      preliminaryGuidance: 'CRITICAL EMERGENCY: Severe acute cardiovascular, neurological, or respiratory indicators detected. Prioritize immediate emergency care. Call 112 or 108 or proceed to the nearest emergency department immediately.',
      possibleConditions: ['Acute Cardiovascular / Respiratory Compromise', 'Medical Emergency Assessment'],
      urgencyLevel: 'High / Seek Immediate Care',
      redFlagDetected: true,
      isEmergency: true,
      contributingFactors: redFlagCheck.matchedKeywords,
      explanation: `Emergency override activated due to critical indicators: ${redFlagCheck.matchedKeywords.join(', ')}.`,
      emergencyContacts: redFlagCheck.emergencyContacts,
      matchedDoctorIds,
      disclaimer: 'CRITICAL SAFETY ALERT: This protocol overrides standard scheduling. Seek immediate emergency care.',
      createdAt: new Date().toISOString(),
    };
    dbStore.addSymptomCheck(emergencyResult);
    if (isDbConnected()) {
      SymptomCheck.create(emergencyResult).catch(e => console.warn(e.message));
    }
    return emergencyResult;
  }

  // 2. Try real Gemini AI generation if available
  if (genAI && activeApiKey) {
    const candidateModels = [
      'gemini-3.8-flash',
      'gemini-2.5-flash',
      'gemini-2.0-flash',
      'gemini-1.5-flash',
      'gemini-flash-latest',
    ];
    for (const modelName of candidateModels) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 1024,
            responseMimeType: 'application/json',
          },
        });
        const prompt = `
You are an expert AI clinical triage assistant.
Analyze the following patient reported symptoms and return a strictly valid JSON response. Keep preliminaryGuidance concise and actionable (under 80 words).

Patient Data:
- Symptoms: ${symptomText}
- Reported Severity: ${severity}
- Duration: ${duration}
- Primary Body Area: ${bodyArea || 'General'}
- Additional Notes: ${additionalNotes || 'None'}

Available Medical Departments to recommend from:
- "General Medicine"
- "Cardiology"
- "Dermatology"
- "Neurology"
- "Orthopedics"
- "Pediatrics"
- "ENT"
- "Gastroenterology"

Return JSON with this exact schema:
{
  "preliminaryGuidance": "concise structured paragraph explaining the clinical basis, home care, and next steps (under 80 words)",
  "possibleConditions": ["condition1", "condition2", "condition3"],
  "recommendedDepartment": "one of the available medical departments listed above",
  "urgencyLevel": "Low / Routine" | "Moderate / Consult Soon" | "High / Seek Immediate Care"
}
`;
        const result = await model.generateContent(prompt);
        const jsonText = result.response.text();
        const parsed = JSON.parse(jsonText);
        const allDocs = dbStore.getAllDoctors();
        const matchedDocs = allDocs.filter(
          d =>
            d.department.toLowerCase() ===
              (parsed.recommendedDepartment || 'General Medicine').toLowerCase() && d.isAvailable
        );
        const matchedDoctorIds =
          matchedDocs.length > 0 ? matchedDocs.map(d => d.id) : allDocs.slice(0, 2).map(d => d.id);
        const symptomResult = {
          id: `sym-${Date.now()}`,
          userId,
          symptoms,
          severity,
          duration,
          bodyArea,
          additionalNotes,
          preliminaryGuidance: parsed.preliminaryGuidance,
          possibleConditions: parsed.possibleConditions || [],
          recommendedDepartment: parsed.recommendedDepartment || 'General Medicine',
          urgencyLevel:
            parsed.urgencyLevel ||
            (severity === 'Severe' ? 'Moderate / Consult Soon' : 'Low / Routine'),
          redFlagDetected: false,
          isEmergency: false,
          contributingFactors: symptoms.slice(0, 3),
          explanation: `Recommendation for ${parsed.recommendedDepartment || 'General Medicine'} was generated from clinical triage analysis of: ${symptoms.slice(0, 3).join(', ')}.`,
          emergencyContacts: { national: '112', ambulance: '108', medical: '102' },
          matchedDoctorIds,
          disclaimer:
            'Important Notice: MediGuide AI provides preliminary guidance and informational assessment only. It does not constitute a formal medical diagnosis or prescription. If you are experiencing acute emergencies, please contact emergency medical services immediately.',
          createdAt: new Date().toISOString(),
        };
        dbStore.addSymptomCheck(symptomResult);
        if (isDbConnected()) {
          SymptomCheck.create(symptomResult).catch(e => console.warn(e.message));
        }
        return symptomResult;
      } catch (err) {
        console.warn(`Attempt with ${modelName} failed:`, err);
      }
    }
  }
  // Clinical Rule-based triage fallback
  let preliminaryGuidance = '';
  let possibleConditions = [];
  let recommendedDepartment = 'General Medicine';
  let urgencyLevel = 'Low / Routine';
  const lowerSymptoms = (
    symptomText +
    ' ' +
    (additionalNotes || '') +
    ' ' +
    (bodyArea || '')
  ).toLowerCase();
  if (
    lowerSymptoms.includes('chest') ||
    lowerSymptoms.includes('palpitation') ||
    lowerSymptoms.includes('heart') ||
    lowerSymptoms.includes('blood pressure')
  ) {
    recommendedDepartment = 'Cardiology';
    possibleConditions = [
      'Cardiovascular Stress',
      'Benign Palpitations / Arrhythmia',
      'Elevated Arterial Pressure',
      'Costochondritis',
    ];
    urgencyLevel = severity === 'Severe' ? 'High / Seek Immediate Care' : 'Moderate / Consult Soon';
    preliminaryGuidance = `Based on your reported cardiovascular symptoms (${symptomText}), evaluation by a Cardiologist is strongly indicated. Monitoring resting heart rate, blood pressure, and performing an ECG can determine the underlying cause. Avoid caffeine and strenuous physical exertion until cleared.`;
  } else if (
    lowerSymptoms.includes('rash') ||
    lowerSymptoms.includes('itch') ||
    lowerSymptoms.includes('acne') ||
    lowerSymptoms.includes('eczema') ||
    lowerSymptoms.includes('skin')
  ) {
    recommendedDepartment = 'Dermatology';
    possibleConditions = [
      'Contact Dermatitis',
      'Eczema / Atopic Flare',
      'Urticaria / Allergy',
      'Superficial Dermatosis',
    ];
    urgencyLevel = severity === 'Severe' ? 'Moderate / Consult Soon' : 'Low / Routine';
    preliminaryGuidance = `Your dermatological symptoms (${symptomText}) suggest localized skin inflammation or an allergic contact response. Keep the affected area clean, moisturized, and avoid harsh scented soaps. A clinical skin examination will confirm appropriate topical therapy.`;
  } else if (
    lowerSymptoms.includes('headache') &&
    (lowerSymptoms.includes('cold') ||
      lowerSymptoms.includes('sinus') ||
      lowerSymptoms.includes('nasal') ||
      lowerSymptoms.includes('cough'))
  ) {
    recommendedDepartment = 'General Medicine';
    possibleConditions = [
      'Upper Respiratory Viral Infection (Common Cold)',
      'Acute Sinusitis / Sinus Pressure',
      'Tension Headache secondary to congestion',
      'Viral Rhinitis',
    ];
    urgencyLevel = severity === 'Severe' ? 'Moderate / Consult Soon' : 'Low / Routine';
    preliminaryGuidance = `A headache accompanied by cold symptoms is very frequently caused by sinus mucosal inflammation and pressure buildup behind the forehead and nasal passages, combined with systemic viral immune response. Prioritize warm steam inhalation, adequate hydration (warm teas, broths, electrolyte water), and physical rest. A General Medicine or ENT physician can evaluate whether nasal decongestant or antihistamine therapy is indicated.`;
  } else if (
    lowerSymptoms.includes('headache') ||
    lowerSymptoms.includes('migraine') ||
    lowerSymptoms.includes('dizziness') ||
    lowerSymptoms.includes('numbness') ||
    lowerSymptoms.includes('vertigo')
  ) {
    recommendedDepartment = 'Neurology';
    possibleConditions = [
      'Tension Headache',
      'Migraine with/without Aura',
      'Cervicogenic Headache',
      'Vestibular Dysfunction',
    ];
    urgencyLevel = severity === 'Severe' ? 'High / Seek Immediate Care' : 'Moderate / Consult Soon';
    preliminaryGuidance = `Your neurological symptoms (${symptomText}) indicate a pattern consistent with headache or vestibular irritation. Ensure proper hydration, rest in a dark quiet room, and track any specific visual triggers. A Neurologist can evaluate reflex responses and prescribe targeted migraine prophylactic management.`;
  } else if (
    lowerSymptoms.includes('joint') ||
    lowerSymptoms.includes('knee') ||
    lowerSymptoms.includes('back') ||
    lowerSymptoms.includes('bone') ||
    lowerSymptoms.includes('sprain')
  ) {
    recommendedDepartment = 'Orthopedics';
    possibleConditions = [
      'Musculoskeletal Strain',
      'Facet Joint Arthralgia',
      'Ligament Sprain',
      'Degenerative Joint Tendinopathy',
    ];
    urgencyLevel = severity === 'Severe' ? 'Moderate / Consult Soon' : 'Low / Routine';
    preliminaryGuidance = `Your musculoskeletal indicators (${symptomText}) relate to joints or connective tissue stress. Practice the R.I.C.E. protocol (Rest, Ice, Compression, Elevation) for acute soreness. An Orthopedic consultation or X-ray imaging may be needed to rule out structural strain.`;
  } else if (
    lowerSymptoms.includes('child') ||
    lowerSymptoms.includes('infant') ||
    lowerSymptoms.includes('baby') ||
    lowerSymptoms.includes('pediatric')
  ) {
    recommendedDepartment = 'Pediatrics';
    possibleConditions = [
      'Pediatric Viral Infection',
      'Childhood Upper Respiratory Illness',
      'Allergic Sensitivity',
    ];
    urgencyLevel = severity === 'Severe' ? 'High / Seek Immediate Care' : 'Moderate / Consult Soon';
    preliminaryGuidance = `For pediatric symptoms (${symptomText}), careful monitoring of temperature, fluid intake, and alertness is paramount. Direct evaluation by a licensed Pediatrician is recommended for accurate age-appropriate dosage and guidance.`;
  } else {
    recommendedDepartment = 'General Medicine';
    possibleConditions = [
      'Viral Upper Respiratory Infection',
      'Seasonal Allergy / Rhinitis',
      'Physical Fatigue & Dehydration',
      'Mild Gastrointestinal Upset',
    ];
    urgencyLevel = severity === 'Severe' ? 'Moderate / Consult Soon' : 'Low / Routine';
    preliminaryGuidance = `Your reported symptoms (${symptomText}) point toward a systemic or upper respiratory response. Prioritize hydration (2-3L fluids daily), balanced nutrition, and adequate sleep. If symptoms persist beyond 5-7 days or worsen with fever, schedule an appointment with a General Medicine physician.`;
  }
  const allDocs = dbStore.getAllDoctors();
  const matchedDocs = allDocs.filter(
    d => d.department.toLowerCase() === recommendedDepartment.toLowerCase() && d.isAvailable
  );
  const matchedDoctorIds =
    matchedDocs.length > 0 ? matchedDocs.map(d => d.id) : allDocs.slice(0, 2).map(d => d.id);
  const contributingFactors = symptoms && symptoms.length > 0 ? symptoms.slice(0, 3) : ['General clinical presentation'];
  const explanation = `Recommendation for ${recommendedDepartment} was determined based on reported symptoms (${contributingFactors.join(', ')}) aligning with standard primary care guidelines.`;

  const fallbackResult = {
    id: `sym-${Date.now()}`,
    userId,
    symptoms,
    severity,
    duration,
    bodyArea,
    additionalNotes,
    preliminaryGuidance,
    possibleConditions,
    recommendedDepartment,
    confidence: 78,
    urgencyLevel,
    redFlagDetected: false,
    isEmergency: false,
    contributingFactors,
    explanation,
    emergencyContacts: { national: '112', ambulance: '108', medical: '102' },
    matchedDoctorIds,
    disclaimer:
      'Important Notice: MediGuide AI provides preliminary guidance and informational assessment only. It does not constitute a formal medical diagnosis or prescription. If you are experiencing acute emergencies, please contact emergency medical services immediately.',
    createdAt: new Date().toISOString(),
  };
  dbStore.addSymptomCheck(fallbackResult);
  if (isDbConnected()) {
    SymptomCheck.create(fallbackResult).catch(e => console.warn(e.message));
  }
  return fallbackResult;
}
function dynamicHealthcareChat(message) {
  const lower = message.toLowerCase();

  // 1. Diagnostic Lab Reports, Blood Tests, CBC, Lipid, Metabolic, and Vault Documents
  if (
    lower.includes('lab report') ||
    lower.includes('medical record') ||
    lower.includes('blood report') ||
    lower.includes('blood test') ||
    lower.includes('clinical significance') ||
    lower.includes('test result') ||
    lower.includes('diagnostic') ||
    lower.includes('cbc') ||
    lower.includes('lipid') ||
    lower.includes('hemoglobin') ||
    lower.includes('platelet') ||
    lower.includes('wbc') ||
    lower.includes('rbc') ||
    lower.includes('glucose') ||
    lower.includes('sugar') ||
    lower.includes('hba1c') ||
    lower.includes('cholesterol') ||
    lower.includes('triglyceride') ||
    lower.includes('creatinine') ||
    lower.includes('urea') ||
    lower.includes('thyroid') ||
    lower.includes('tsh') ||
    lower.includes('bilirubin') ||
    lower.includes('lft') ||
    lower.includes('kft')
  ) {
    return {
      text: `### Clinical Lab Report & Diagnostic Interpretation\n\nDiagnostic tests provide essential baseline biomarkers to evaluate physiological function and organ health.\n\n- **Core Biomarker Benchmarks:**\n  - **Hemoglobin (Hb):** Normal: *13.5–17.5 g/dL* (men) / *12.0–15.5 g/dL* (women). Evaluates oxygen transportation capacity.\n  - **Total WBC Count:** Normal: *4,000–11,000 /mcL*. Indicates immune defense status.\n  - **Platelet Count:** Normal: *150,000–450,000 /mcL*. Essential for normal vascular clotting.\n  - **Fasting Blood Glucose:** Normal: *70–99 mg/dL* (Prediabetes: 100–125 mg/dL).\n  - **Lipid Profile (Total Cholesterol):** Desirable: *< 200 mg/dL* (LDL < 100, HDL > 50 mg/dL, Triglycerides < 150 mg/dL).\n  - **Kidney Function (Creatinine):** Normal: *0.7–1.3 mg/dL*.\n\n- **What You Can Do Now:**\n  1. Maintain adequate hydration and note whether the test was conducted in a fasting or post-prandial state.\n  2. Compare these numbers against historical baseline trends in your **Digital Health Vault**.\n  3. Note specific inquiries regarding lifestyle or dietary modifications for your follow-up visit.\n\n- **When to Seek Care:**\n  Share this vaulted document directly with your attending specialist or primary physician to correlate with physical examination findings and clinical history.\n\n*Recommended Specialist: **General Medicine** or **Pathology**.*`,
      suggestions: [
        'Book consultation with General Physician',
        'How to prepare for a fasting blood test?',
        'Share record with doctor',
        'What foods help improve hemoglobin naturally?',
      ],
    };
  }

  // 2. Imaging, X-Rays, Ultrasound, CT, and MRI Scans
  if (
    lower.includes('imaging') ||
    lower.includes('x-ray') ||
    lower.includes('xray') ||
    lower.includes('scan') ||
    lower.includes('mri') ||
    lower.includes('ct scan') ||
    lower.includes('ultrasound') ||
    lower.includes('sonography') ||
    lower.includes('radiology')
  ) {
    return {
      text: `### Imaging & Radiology Report Overview\n\nRadiological imaging visualizes anatomical structures, bone alignment, and soft-tissue densities.\n\n- **Clinical Perspective:** Imaging findings must always be correlated with physical symptoms and clinical palpation.\n- **Common Terms:** *Radiolucent* (darker, air-filled structures), *Radio-opaque* (denser, bone or contrast structures), *Unremarkable* (no pathological abnormalities detected).\n- **Next Steps:** Ensure the complete DICOM file or film series is reviewed alongside the radiologist's impression report.\n\n*Recommended Specialist: **Radiology** or **Orthopedics / General Medicine**.*`,
      suggestions: [
        'Book consultation with Specialist',
        'Upload imaging document to Vault',
        'Check symptoms in Symptom Checker',
      ],
    };
  }

  // 3. Prescriptions and Medications
  if (
    lower.includes('prescription') ||
    lower.includes('medicine') ||
    lower.includes('medication') ||
    lower.includes('tablet') ||
    lower.includes('dosage') ||
    lower.includes('drug interaction') ||
    lower.includes('pill')
  ) {
    return {
      text: `### Prescription & Medication Guidance\n\nAdhering to prescribed dosages and scheduled meal timings is crucial for therapeutic efficacy.\n\n- **Timing & Absorption:** Follow prescribed directions (*Before Food*, *After Food*, or *Bedtime*) to ensure optimal gastrointestinal absorption.\n- **Safety & Interactions:** Do not combine medications or alter dosage amounts without consulting your physician.\n- **Tracking:** Log your scheduled doses in the **Medicine Tracker** to maintain an accurate 7-day adherence streak.\n\n*Recommended Specialist: **General Medicine** or **Pharmacology**.*`,
      suggestions: [
        'Open Medicine Tracker',
        'Check drug interactions',
        'Book appointment with Doctor',
      ],
    };
  }

  // 4. Vaccines and Immunization
  if (lower.includes('vaccin') || lower.includes('immuniz') || lower.includes('booster')) {
    return {
      text: `### Vaccination & Immunization Record Guidance\n\nVaccines stimulate active antibody production, providing proactive immunity against target viral and bacterial pathogens.\n\n- **Immune Protection:** Immunizations establish memory T and B lymphocytes for long-term pathogen recognition.\n- **Documentation:** Keeping your official certificate vaulted ensures easy access for healthcare records, travel, and booster tracking.\n- **Mild Post-Vaccine Reactions:** Mild localized soreness, low-grade fever, or fatigue typically resolve spontaneously within 24–48 hours.\n\n*Recommended Specialist: **General Medicine / Preventive Health**.*`,
      suggestions: [
        'View digital health records',
        'General wellness blood test benchmarks',
        'Book consultation with Doctor',
      ],
    };
  }

  // 5. Cold with Sinus Headache
  if (
    (lower.includes('cold') && lower.includes('headache')) ||
    (lower.includes('sinus') && lower.includes('headache')) ||
    (lower.includes('congestion') && lower.includes('headache'))
  ) {
    return {
      text: `### Cold with Sinus Headache\n\nCold-related headaches typically result from **sinus mucosal inflammation** and nasal congestion building pressure behind the forehead and eyes.\n\n- **Steam Inhalation:** Inhale warm steam for 10 minutes twice daily to clear airways.\n- **Hydration:** Drink 2.5–3L of warm fluids (water, herbal teas, clear broths).\n- **Warm Compress:** Place a warm cloth over the forehead and bridge of the nose.\n- **Elevated Sleep:** Prop your head up slightly to ease overnight sinus drainage.\n\n*Recommended Specialist: **General Medicine** or **ENT**.*`,
      suggestions: [
        'Check symptoms in Symptom Checker',
        'Book appointment with General Physician',
        'How to relieve sinus pressure naturally?',
      ],
    };
  }

  // 6. Fever & Temperature
  if (lower.includes('fever') || lower.includes('temperature') || lower.includes('chills')) {
    return {
      text: `### Managing Fever & Elevated Temperature\n\nFever is your immune system's standard response to an active viral or bacterial infection.\n\n- **Rest & Hydration:** Drink plenty of electrolyte fluids and rest to save metabolic energy.\n- **Comfort:** Wear light, breathable clothing and keep the room at 20-22°C.\n- **Vitals Monitoring:** Check temperature every 4–6 hours.\n- **When to Seek Care:** Seek urgent medical attention if temperature exceeds 39.4°C (103°F) or lasts over 3 days.\n\n*Recommended Specialist: **General Medicine**.*`,
      suggestions: [
        'Check symptoms in Symptom Checker',
        'Book appointment with General Physician',
        'Signs of dehydration',
      ],
    };
  }

  // 7. Blood Pressure
  if (lower.includes('blood pressure') || lower.includes('hypertension') || lower.includes('bp')) {
    return {
      text: `### Blood Pressure Overview\n\nMaintaining target blood pressure helps protect heart and vascular health.\n\n- **Normal Range:** Systolic < 120 mmHg and Diastolic < 80 mmHg.\n- **Elevated:** Systolic 120–129 mmHg and Diastolic < 80 mmHg.\n- **Key Actions:** Reduce dietary sodium (< 2,300mg/day), engage in 30 mins of moderate daily activity, and manage stress.\n\n*Recommended Specialist: **Cardiology**.*`,
      suggestions: [
        'Book appointment with Cardiologist',
        'Foods that help lower blood pressure',
        'How often should I log BP?',
      ],
    };
  }

  // 8. Headache & Migraine
  if (lower.includes('headache') || lower.includes('migraine')) {
    return {
      text: `### Headache & Migraine Care\n\nHeadaches commonly arise from muscle contraction, dehydration, eye strain, or vascular changes.\n\n- **Immediate Relief:** Drink 500ml of water and rest in a dark, quiet room.\n- **Compress:** Apply a cool compress to your forehead or warm cloth to neck muscles.\n- **Screen Break:** Minimize digital screens and relax neck posture.\n- **Red Flags:** Seek emergency care for sudden 'thunderclap' onset, visual loss, or weakness.\n\n*Recommended Specialist: **Neurology**.*`,
      suggestions: [
        'Check symptoms in Symptom Checker',
        'Book appointment with Neurologist',
        'Tips to prevent screen eye strain',
      ],
    };
  }

  // 9. Diet & Nutrition
  if (
    lower.includes('diet') ||
    lower.includes('food') ||
    lower.includes('nutrition') ||
    lower.includes('cholesterol')
  ) {
    return {
      text: `### Nutrition & Dietary Guidance\n\nA balanced, nutrient-dense diet supports metabolic health and steady energy.\n\n- **Whole Foods:** Prioritize colorful vegetables, lean proteins, legumes, and whole grains.\n- **Healthy Fats:** Choose olive oil, nuts, and seeds over trans and saturated fats.\n- **Portion & Fiber:** Aim for 25–30g of dietary fiber daily to support digestion and lipid balance.\n- **Hydration:** Aim for 2–3 liters of water daily.\n\n*Recommended Specialist: **General Medicine / Clinical Dietetics**.*`,
      suggestions: [
        'Calculate daily caloric needs',
        'Foods to lower cholesterol',
        'Meal ideas for balanced nutrition',
      ],
    };
  }

  // 10. Sleep & Recovery
  if (lower.includes('sleep') || lower.includes('insomnia') || lower.includes('fatigue')) {
    return {
      text: `### Sleep Hygiene & Energy Recovery\n\nRestorative sleep is vital for cellular repair, immune response, and mental clarity.\n\n- **Consistent Routine:** Wake and sleep at the same time every day.\n- **Morning Sunlight:** Get 10–15 minutes of natural light within an hour of waking.\n- **Caffeine Cutoff:** Avoid caffeine at least 7–8 hours before bed.\n- **Cool Bedroom:** Keep your bedroom quiet, dark, and cool (18–20°C).\n\n*Recommended Specialist: **General Medicine**.*`,
      suggestions: [
        'Schedule routine wellness blood test',
        'Book consultation with General Medicine',
        'Evening relaxation routine',
      ],
    };
  }

  // Concise generative healthcare fallback response
  return {
    text: `### MediGuide AI Health Guidance\n\nRegarding your query about: *"${message}"*:\n\n- **Clinical Perspective:** Physical health symptoms require evaluating duration, triggers, and severity.\n- **Recommended Step:** Use our **AI Symptom Checker** for tailored assessment and specialist routing.\n- **Supportive Care:** Maintain hydration, balanced nutrition, and monitor any symptom progression.\n\n*Recommended Specialist: **General Medicine**.*`,
    suggestions: [
      'Analyze my symptoms in Symptom Checker',
      'Browse available specialist doctors',
      'Medicine schedule tips',
    ],
  };
}
function generateSuggestedFollowups(userMessage, _response) {
  const lower = userMessage.toLowerCase();
  if (
    lower.includes('pain') ||
    lower.includes('ache') ||
    lower.includes('sick') ||
    lower.includes('cold') ||
    lower.includes('headache')
  ) {
    return [
      'Open AI Symptom Checker',
      'Book appointment with Specialist',
      'Home care recommendations',
    ];
  }
  if (lower.includes('med') || lower.includes('pill') || lower.includes('drug')) {
    return ['View my Medicine Reminders', 'Add new medication', 'Drug interaction overview'];
  }
  return ['Tell me more about preventative care', 'Book a doctor appointment', 'Check my symptoms'];
}
