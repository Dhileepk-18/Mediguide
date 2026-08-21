import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config/index.js';
import { dbStore } from '../store/inMemoryStore.js';
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
            }
            else {
                envContent += `\nGEMINI_API_KEY=${activeApiKey}\n`;
            }
            fs.writeFileSync(envPath, envContent, 'utf-8');
        }
        catch (e) {
            console.warn('Could not persist key to .env file:', e);
        }
        return { success: true, hasKey: true };
    }
    else if (!sanitizedKey) {
        activeApiKey = '';
        genAI = null;
        return { success: true, hasKey: false };
    }
    else {
        throw new Error('Invalid API Key format.');
    }
}
export function getAiConfig() {
    return {
        hasKey: Boolean(activeApiKey && activeApiKey.length > 5),
        activeModel: activeApiKey ? 'Google Gemini 3.6 Flash (Live AI)' : 'MediGuide Clinical Engine (Key Required for Live Gemini)',
        provider: activeApiKey ? 'Google AI Studio / Gemini API' : 'Built-in Clinical Knowledgebase',
    };
}
const MEDICAL_SYSTEM_PROMPT = `
You are MediGuide AI, an advanced, compassionate, and highly qualified AI Healthcare Assistant.
Your objective is to provide evidence-based healthcare education, symptom guidance, lifestyle advice, and medical department recommendations.

CRITICAL SAFETY & CLINICAL PROTOCOLS:
1. Always maintain a calm, professional, and empathetic tone.
2. Structure your replies using clear Markdown:
   - Use ### for major headings
   - Use #### for sub-points
   - Use bullet points for steps or recommendations
   - Highlight key clinical terms in **bold**
3. Emphasize that your advice is for preliminary educational guidance only, and never a substitute for direct in-person evaluation by a licensed physician.
4. Clearly recommend the appropriate medical department or specialist (e.g., General Medicine, Cardiology, Dermatology, Neurology, Orthopedics, Pediatrics, ENT, Gastroenterology) when discussing symptoms.
5. If the user mentions acute red-flag symptoms (e.g. crushing chest pain, difficulty breathing, sudden slurred speech, acute trauma, severe blood loss), immediately advise them to seek emergency medical attention (call local emergency services or visit the nearest ER).
`;
export async function generateChatResponse(userMessage, history = []) {
    // If Gemini API is available, invoke real Gemini AI
    if (genAI && activeApiKey) {
        const candidateModels = [
            'gemini-3.6-flash',
            'gemini-3.7-flash',
            'gemini-3.5-flash',
            'gemini-flash-latest',
            'gemini-2.5-flash',
            'gemini-1.5-flash',
        ];
        for (const modelName of candidateModels) {
            try {
                const model = genAI.getGenerativeModel({
                    model: modelName,
                    generationConfig: {
                        temperature: 0.3,
                        maxOutputTokens: 4096,
                    },
                });
                const chatContext = history
                    .slice(-6)
                    .map((h) => `${h.sender === 'user' ? 'User' : 'Assistant'}: ${h.text}`)
                    .join('\n\n');
                const fullPrompt = `${MEDICAL_SYSTEM_PROMPT}\n\nConversation History:\n${chatContext}\n\nUser Question: ${userMessage}\n\nPlease provide a clear, comprehensive, and structured clinical response formatted with markdown headings (###, ####) and bullet points. Never cut off mid-sentence. At the very end, provide 3 suggested short follow-up questions the user might ask, formatted as: [SUGGESTIONS: question1 | question2 | question3]`;
                const result = await model.generateContent(fullPrompt);
                let responseText = result.response.text();
                // Extract suggestions if present
                let suggestions = [];
                const suggestionMatch = responseText.match(/\[SUGGESTIONS:\s*(.*?)\]/i);
                if (suggestionMatch && suggestionMatch[1]) {
                    suggestions = suggestionMatch[1]
                        .split('|')
                        .map((s) => s.trim())
                        .filter(Boolean);
                    responseText = responseText.replace(/\[SUGGESTIONS:.*?\]/i, '').trim();
                }
                if (suggestions.length === 0) {
                    suggestions = generateSuggestedFollowups(userMessage, responseText);
                }
                if (responseText && responseText.length > 50) {
                    return {
                        text: responseText,
                        suggestions,
                        modelUsed: `Google Gemini (${modelName})`,
                    };
                }
            }
            catch (err) {
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
export async function analyzeSymptoms(userId, symptoms, severity, duration, bodyArea, additionalNotes) {
    const symptomText = symptoms.join(', ');
    // Try real Gemini AI generation first
    if (genAI && activeApiKey) {
        const candidateModels = [
            'gemini-3.6-flash',
            'gemini-3.7-flash',
            'gemini-3.5-flash',
            'gemini-flash-latest',
            'gemini-2.5-flash',
            'gemini-1.5-flash',
        ];
        for (const modelName of candidateModels) {
            try {
                const model = genAI.getGenerativeModel({
                    model: modelName,
                    generationConfig: {
                        temperature: 0.2,
                        maxOutputTokens: 4096,
                        responseMimeType: 'application/json',
                    },
                });
                const prompt = `
You are an expert AI clinical triage assistant.
Analyze the following patient reported symptoms and return a strictly valid JSON response.

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
  "preliminaryGuidance": "detailed structured paragraph explaining the physiological basis, immediate home care, and clinical considerations",
  "possibleConditions": ["condition1", "condition2", "condition3"],
  "recommendedDepartment": "one of the available medical departments listed above",
  "urgencyLevel": "Low / Routine" | "Moderate / Consult Soon" | "High / Seek Immediate Care"
}
`;
                const result = await model.generateContent(prompt);
                const jsonText = result.response.text();
                const parsed = JSON.parse(jsonText);
                const allDocs = dbStore.getAllDoctors();
                const matchedDocs = allDocs.filter((d) => d.department.toLowerCase() === (parsed.recommendedDepartment || 'General Medicine').toLowerCase() &&
                    d.isAvailable);
                const matchedDoctorIds = matchedDocs.length > 0 ? matchedDocs.map((d) => d.id) : allDocs.slice(0, 2).map((d) => d.id);
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
                    urgencyLevel: parsed.urgencyLevel || (severity === 'Severe' ? 'Moderate / Consult Soon' : 'Low / Routine'),
                    matchedDoctorIds,
                    disclaimer: 'Important Notice: MediGuide AI provides preliminary guidance and informational assessment only. It does not constitute a formal medical diagnosis or prescription. If you are experiencing acute emergencies, please contact emergency medical services immediately.',
                    createdAt: new Date().toISOString(),
                };
                dbStore.addSymptomCheck(symptomResult);
                return symptomResult;
            }
            catch (err) {
                console.warn(`Attempt with ${modelName} failed:`, err);
            }
        }
    }
    // Clinical Rule-based triage fallback
    let preliminaryGuidance = '';
    let possibleConditions = [];
    let recommendedDepartment = 'General Medicine';
    let urgencyLevel = 'Low / Routine';
    const lowerSymptoms = (symptomText + ' ' + (additionalNotes || '') + ' ' + (bodyArea || '')).toLowerCase();
    if (lowerSymptoms.includes('chest') ||
        lowerSymptoms.includes('palpitation') ||
        lowerSymptoms.includes('heart') ||
        lowerSymptoms.includes('blood pressure')) {
        recommendedDepartment = 'Cardiology';
        possibleConditions = ['Cardiovascular Stress', 'Benign Palpitations / Arrhythmia', 'Elevated Arterial Pressure', 'Costochondritis'];
        urgencyLevel = severity === 'Severe' ? 'High / Seek Immediate Care' : 'Moderate / Consult Soon';
        preliminaryGuidance = `Based on your reported cardiovascular symptoms (${symptomText}), evaluation by a Cardiologist is strongly indicated. Monitoring resting heart rate, blood pressure, and performing an ECG can determine the underlying cause. Avoid caffeine and strenuous physical exertion until cleared.`;
    }
    else if (lowerSymptoms.includes('rash') ||
        lowerSymptoms.includes('itch') ||
        lowerSymptoms.includes('acne') ||
        lowerSymptoms.includes('eczema') ||
        lowerSymptoms.includes('skin')) {
        recommendedDepartment = 'Dermatology';
        possibleConditions = ['Contact Dermatitis', 'Eczema / Atopic Flare', 'Urticaria / Allergy', 'Superficial Dermatosis'];
        urgencyLevel = severity === 'Severe' ? 'Moderate / Consult Soon' : 'Low / Routine';
        preliminaryGuidance = `Your dermatological symptoms (${symptomText}) suggest localized skin inflammation or an allergic contact response. Keep the affected area clean, moisturized, and avoid harsh scented soaps. A clinical skin examination will confirm appropriate topical therapy.`;
    }
    else if (lowerSymptoms.includes('headache') &&
        (lowerSymptoms.includes('cold') || lowerSymptoms.includes('sinus') || lowerSymptoms.includes('nasal') || lowerSymptoms.includes('cough'))) {
        recommendedDepartment = 'General Medicine';
        possibleConditions = ['Upper Respiratory Viral Infection (Common Cold)', 'Acute Sinusitis / Sinus Pressure', 'Tension Headache secondary to congestion', 'Viral Rhinitis'];
        urgencyLevel = severity === 'Severe' ? 'Moderate / Consult Soon' : 'Low / Routine';
        preliminaryGuidance = `A headache accompanied by cold symptoms is very frequently caused by sinus mucosal inflammation and pressure buildup behind the forehead and nasal passages, combined with systemic viral immune response. Prioritize warm steam inhalation, adequate hydration (warm teas, broths, electrolyte water), and physical rest. A General Medicine or ENT physician can evaluate whether nasal decongestant or antihistamine therapy is indicated.`;
    }
    else if (lowerSymptoms.includes('headache') ||
        lowerSymptoms.includes('migraine') ||
        lowerSymptoms.includes('dizziness') ||
        lowerSymptoms.includes('numbness') ||
        lowerSymptoms.includes('vertigo')) {
        recommendedDepartment = 'Neurology';
        possibleConditions = ['Tension Headache', 'Migraine with/without Aura', 'Cervicogenic Headache', 'Vestibular Dysfunction'];
        urgencyLevel = severity === 'Severe' ? 'High / Seek Immediate Care' : 'Moderate / Consult Soon';
        preliminaryGuidance = `Your neurological symptoms (${symptomText}) indicate a pattern consistent with headache or vestibular irritation. Ensure proper hydration, rest in a dark quiet room, and track any specific visual triggers. A Neurologist can evaluate reflex responses and prescribe targeted migraine prophylactic management.`;
    }
    else if (lowerSymptoms.includes('joint') ||
        lowerSymptoms.includes('knee') ||
        lowerSymptoms.includes('back') ||
        lowerSymptoms.includes('bone') ||
        lowerSymptoms.includes('sprain')) {
        recommendedDepartment = 'Orthopedics';
        possibleConditions = ['Musculoskeletal Strain', 'Facet Joint Arthralgia', 'Ligament Sprain', 'Degenerative Joint Tendinopathy'];
        urgencyLevel = severity === 'Severe' ? 'Moderate / Consult Soon' : 'Low / Routine';
        preliminaryGuidance = `Your musculoskeletal indicators (${symptomText}) relate to joints or connective tissue stress. Practice the R.I.C.E. protocol (Rest, Ice, Compression, Elevation) for acute soreness. An Orthopedic consultation or X-ray imaging may be needed to rule out structural strain.`;
    }
    else if (lowerSymptoms.includes('child') ||
        lowerSymptoms.includes('infant') ||
        lowerSymptoms.includes('baby') ||
        lowerSymptoms.includes('pediatric')) {
        recommendedDepartment = 'Pediatrics';
        possibleConditions = ['Pediatric Viral Infection', 'Childhood Upper Respiratory Illness', 'Allergic Sensitivity'];
        urgencyLevel = severity === 'Severe' ? 'High / Seek Immediate Care' : 'Moderate / Consult Soon';
        preliminaryGuidance = `For pediatric symptoms (${symptomText}), careful monitoring of temperature, fluid intake, and alertness is paramount. Direct evaluation by a licensed Pediatrician is recommended for accurate age-appropriate dosage and guidance.`;
    }
    else {
        recommendedDepartment = 'General Medicine';
        possibleConditions = ['Viral Upper Respiratory Infection', 'Seasonal Allergy / Rhinitis', 'Physical Fatigue & Dehydration', 'Mild Gastrointestinal Upset'];
        urgencyLevel = severity === 'Severe' ? 'Moderate / Consult Soon' : 'Low / Routine';
        preliminaryGuidance = `Your reported symptoms (${symptomText}) point toward a systemic or upper respiratory response. Prioritize hydration (2-3L fluids daily), balanced nutrition, and adequate sleep. If symptoms persist beyond 5-7 days or worsen with fever, schedule an appointment with a General Medicine physician.`;
    }
    const allDocs = dbStore.getAllDoctors();
    const matchedDocs = allDocs.filter((d) => d.department.toLowerCase() === recommendedDepartment.toLowerCase() && d.isAvailable);
    const matchedDoctorIds = matchedDocs.length > 0 ? matchedDocs.map((d) => d.id) : allDocs.slice(0, 2).map((d) => d.id);
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
        urgencyLevel,
        matchedDoctorIds,
        disclaimer: 'Important Notice: MediGuide AI provides preliminary guidance and informational assessment only. It does not constitute a formal medical diagnosis or prescription. If you are experiencing acute emergencies, please contact emergency medical services immediately.',
        createdAt: new Date().toISOString(),
    };
    dbStore.addSymptomCheck(fallbackResult);
    return fallbackResult;
}
function dynamicHealthcareChat(message) {
    const lower = message.toLowerCase();
    if ((lower.includes('cold') && lower.includes('headache')) ||
        (lower.includes('sinus') && lower.includes('headache')) ||
        (lower.includes('congestion') && lower.includes('headache'))) {
        return {
            text: `### Managing Cold Symptoms with Headache\n\nExperiencing a headache alongside a cold is very common and typically stems from **sinus mucosal inflammation**, nasal congestion building up pressure behind the eyes and forehead, and the body's natural immune response to a viral infection.\n\n#### Recommended Care & Relief Measures:\n- **Steam Inhalation:** Inhale warm steam for 10–15 minutes twice daily to open sinus cavities and ease facial tension.\n- **Aggressive Hydration:** Drink at least 2.5–3 liters of warm fluids daily (herbal teas, warm water with lemon, broths) to thin mucus secretions.\n- **Warm Compress:** Apply a warm, moist towel across your forehead, temples, and nasal bridge.\n- **Sensory Rest:** Rest in a quiet, dim room with digital screens minimized.\n- **Sleep Elevation:** Keep your head slightly elevated with an extra pillow to prevent overnight congestion buildup.\n\n> ⚠️ **When to Seek Medical Attention:** If you develop a persistent high fever (over 38.5°C / 101.3°F), a stiff neck, sudden severe ('thunderclap') pain, or symptoms lasting beyond 7–10 days, seek immediate clinical evaluation.\n\n*Recommended Department: **General Medicine** or **ENT**.*`,
            suggestions: ['Check symptoms in AI Symptom Checker', 'Book appointment with General Physician', 'How to relieve sinus pressure naturally?'],
        };
    }
    if (lower.includes('fever') || lower.includes('temperature') || lower.includes('chills')) {
        return {
            text: `### Managing Elevated Body Temperature & Fever\n\nFever is typically your body's immune response to an active viral or bacterial challenge.\n\n#### Recommended Clinical Care Steps:\n- **Hydration:** Drink plenty of fluids (electrolyte water, warm broths, oral rehydration).\n- **Rest:** Minimize strenuous physical work to conserve metabolic energy.\n- **Room Environment:** Maintain comfortable ambient temperature (20-22°C / 68-72°F) and wear breathable cotton garments.\n- **Vitals Tracking:** Measure body temperature every 4-6 hours.\n\n> ⚠️ **When to Seek Immediate Care:** If fever exceeds 39.4°C (103°F), persists beyond 3 days, or is accompanied by stiff neck, confusion, or difficulty breathing.\n\n*Recommended Department: **General Medicine**.*`,
            suggestions: ['Check symptoms in Symptom Checker', 'Book appointment with General Physician', 'How to treat dehydration?'],
        };
    }
    if (lower.includes('blood pressure') || lower.includes('hypertension') || lower.includes('bp')) {
        return {
            text: `### Understanding Blood Pressure & Cardiovascular Wellness\n\nMaintaining balanced arterial pressure is fundamental for cardiovascular longevity.\n\n#### Reference Benchmarks:\n- **Normal:** Systolic < 120 mmHg and Diastolic < 80 mmHg\n- **Elevated:** Systolic 120-129 and Diastolic < 80 mmHg\n- **Stage 1 Hypertension:** Systolic 130-139 or Diastolic 80-89 mmHg\n\n#### Evidence-Based Interventions:\n- **DASH Dietary Pattern:** Restrict sodium (< 2,300mg/day) and increase potassium-rich leafy greens and fruits.\n- **Aerobic Activity:** 150 minutes of brisk walking or moderate cardio per week.\n- **Stress Management:** Consistent circadian sleep schedule and slow diaphragmatic breathing.\n\n*Recommended Department: **Cardiology**.*`,
            suggestions: ['Book appointment with Cardiologist', 'What foods lower BP naturally?', 'How often to log BP readings?'],
        };
    }
    if (lower.includes('headache') || lower.includes('migraine')) {
        return {
            text: `### Guidance on Headaches & Migraine Management\n\nHeadaches frequently arise from muscle contraction, dehydration, digital eye strain, cervical spine tension, or vascular dilation.\n\n#### Immediate Relief Protocols:\n- **Hydration:** Drink 500ml of cool water slowly.\n- **Sensory Rest:** Rest in a quiet, dark room with screen blue-light eliminated.\n- **Compresses:** Apply a cool compress to the forehead or warm towel across neck muscles.\n- **Ergonomics:** Ensure monitor is at eye level and relax shoulder elevation.\n\n> ⚠️ **Red Flags:** Seek emergency care for sudden 'thunderclap' headache, visual aura with numbness, or slurred speech.\n\n*Recommended Department: **Neurology**.*`,
            suggestions: ['Check symptoms in Symptom Checker', 'Book appointment with Neurologist', 'Tips to prevent screen eye strain'],
        };
    }
    if (lower.includes('sleep') || lower.includes('insomnia') || lower.includes('fatigue')) {
        return {
            text: `### Optimizing Sleep Architecture & Overcoming Fatigue\n\nRestorative sleep regulates neuro-endocrine function, immune response, and cellular repair.\n\n#### Sleep Optimization Guidelines:\n1. **Consistent Wake Time:** Wake up at the exact same hour every day, including weekends.\n2. **Morning Phototherapy:** Get 15 minutes of natural sunlight within 60 minutes of waking.\n3. **Caffeine Timing:** Cease caffeine consumption at least 8 hours before scheduled sleep.\n4. **Thermal Setting:** Maintain bedroom temperature at 18-19°C (65-67°F).\n\n*If unrefreshing sleep persists, schedule a consultation to assess thyroid, iron, or vitamin D levels.*`,
            suggestions: ['Schedule routine wellness blood test', 'Book consultation with General Medicine', 'Foods that enhance sleep quality'],
        };
    }
    // Generative comprehensive clinical response for any open query
    return {
        text: `### MediGuide Healthcare Assistant\n\nThank you for your question regarding: *"${message}"*.\n\n#### Clinical Perspective & Guidance:\n- **Overview:** Physical health symptoms are multifaceted and require evaluating onset, duration, and underlying medical history.\n- **Next Steps:** If these symptoms are newly presenting or causing acute discomfort, recording specific details in our **AI Symptom Checker** helps match you with the most appropriate medical specialty.\n- **General Supportive Care:** Prioritize adequate hydration, balanced whole-food nutrition, and proper restorative sleep while monitoring any progressive changes.\n\n*Would you like to analyze specific symptoms or explore available specialist physicians in our network?*`,
        suggestions: ['Analyze my symptoms in Symptom Checker', 'Browse available specialist doctors', 'How to organize my medications?'],
    };
}
function generateSuggestedFollowups(userMessage, _response) {
    const lower = userMessage.toLowerCase();
    if (lower.includes('pain') || lower.includes('ache') || lower.includes('sick') || lower.includes('cold') || lower.includes('headache')) {
        return ['Open AI Symptom Checker', 'Book appointment with Specialist', 'Home care recommendations'];
    }
    if (lower.includes('med') || lower.includes('pill') || lower.includes('drug')) {
        return ['View my Medicine Reminders', 'Add new medication', 'Drug interaction overview'];
    }
    return ['Tell me more about preventative care', 'Book a doctor appointment', 'Check my symptoms'];
}
