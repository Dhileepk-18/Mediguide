import {
  Wind,
  HeartPulse,
  Brain,
  Layers,
  Flame,
  Activity,
} from 'lucide-react';

export const CATEGORIZED_SYMPTOMS = [
  {
    category: 'Respiratory',
    icon: Wind,
    items: ['Shortness of breath', 'Persistent cough', 'Sore throat', 'Wheezing / Chest congestion', 'Runny / Stuffy nose'],
  },
  {
    category: 'Cardiovascular',
    icon: HeartPulse,
    items: ['Chest pain / Tightness', 'Palpitations / Rapid heartbeat', 'Dizziness & lightheadedness', 'Swollen ankles / feet'],
  },
  {
    category: 'Neurology',
    icon: Brain,
    items: ['Headache & migraine', 'Throbbing temple pain', 'Sensitivity to light (photophobia)', 'Numbness / Tingling in hands', 'Sudden vertigo'],
  },
  {
    category: 'Skin & Allergy',
    icon: Layers,
    items: ['Skin rash & itching', 'Hives / Welts', 'Dry scaling skin patches', 'Facial redness / burning', 'Acne flareup'],
  },
  {
    category: 'Digestive',
    icon: Flame,
    items: ['Nausea & vomiting', 'Acid reflux / Heartburn', 'Severe stomach cramps', 'Abdominal bloating', 'Diarrhea / Loose stools'],
  },
  {
    category: 'Orthopedic',
    icon: Activity,
    items: ['Joint & knee pain', 'Lower back ache', 'Stiff neck & shoulders', 'Muscle weakness', 'Swollen joints'],
  },
];

export const ALL_SYMPTOMS = CATEGORIZED_SYMPTOMS.flatMap(c => c.items);

export const RED_FLAG_SYMPTOMS = [
  'chest pain',
  'shortness of breath',
  'severe headache',
  'slurred speech',
  'uncontrolled bleeding',
];

export const STEPS = [
  { num: 1, title: 'Symptoms', desc: 'Presenting issues' },
  { num: 2, title: 'Context', desc: 'Timeline & history' },
  { num: 3, title: 'Severity', desc: 'Impact level' },
  { num: 4, title: 'Report', desc: 'Clinical routing' },
];

export const DURATION_OPTIONS = ['Less than 24h', '2 - 3 days', '1 - 2 weeks', 'Over a month'];
export const AGE_GROUP_OPTIONS = ['Child / Teen (<18)', 'Adult (18 - 60)', 'Senior (60+)'];
export const CONDITION_OPTIONS = ['None', 'Hypertension', 'Type 2 Diabetes', 'Asthma / Bronchitis', 'Migraine History', 'Skin Allergies'];
export const SEVERITY_LEVELS = [
  {
    level: 'Mild',
    title: 'Mild / Routine Discomfort',
    desc: 'Discomfort is manageable. Able to conduct normal work and physical tasks without notable impairment.',
    accent: 'border-emerald-500 bg-emerald-50/50 text-emerald-900',
    badge: 'Outpatient Routine',
  },
  {
    level: 'Moderate',
    title: 'Moderate / Disruptive',
    desc: 'Symptoms cause noticeable pain or discomfort. Daily tasks are interrupted; extra rest required.',
    accent: 'border-amber-500 bg-amber-50/50 text-amber-900',
    badge: 'Prompt Clinic Review',
  },
  {
    level: 'Severe',
    title: 'Severe / Acute Distress',
    desc: 'Intense or disabling pain, difficulty resting, breathing, or concentrating. Requires rapid assessment.',
    accent: 'border-red-500 bg-red-50/50 text-red-900',
    badge: 'High Priority Triage',
  },
];
