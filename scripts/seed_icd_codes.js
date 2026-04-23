const mongoose = require('mongoose');
require('dotenv').config();
const ICDCode = require('../models/icdCode');

const icdCodes = [
  // Cardiovascular
  { code: 'I10', description: 'Essential (primary) hypertension', category: 'Cardiovascular' },
  { code: 'I11.9', description: 'Hypertensive heart disease without heart failure', category: 'Cardiovascular' },
  { code: 'I20.9', description: 'Angina pectoris, unspecified', category: 'Cardiovascular' },
  { code: 'I21.9', description: 'Acute myocardial infarction, unspecified', category: 'Cardiovascular' },
  { code: 'I25.10', description: 'Atherosclerotic heart disease without angina pectoris', category: 'Cardiovascular' },
  { code: 'I48.91', description: 'Unspecified atrial fibrillation', category: 'Cardiovascular' },
  { code: 'I50.9', description: 'Heart failure, unspecified', category: 'Cardiovascular' },
  
  // Endocrine/Metabolic
  { code: 'E11.9', description: 'Type 2 diabetes mellitus without complications', category: 'Endocrine' },
  { code: 'E11.65', description: 'Type 2 diabetes mellitus with hyperglycemia', category: 'Endocrine' },
  { code: 'E10.9', description: 'Type 1 diabetes mellitus without complications', category: 'Endocrine' },
  { code: 'E03.9', description: 'Hypothyroidism, unspecified', category: 'Endocrine' },
  { code: 'E05.90', description: 'Thyrotoxicosis, unspecified', category: 'Endocrine' },
  { code: 'E66.9', description: 'Obesity, unspecified', category: 'Endocrine' },
  { code: 'E78.5', description: 'Hyperlipidemia, unspecified', category: 'Endocrine' },
  
  // Respiratory
  { code: 'J06.9', description: 'Acute upper respiratory infection, unspecified', category: 'Respiratory' },
  { code: 'J18.9', description: 'Pneumonia, unspecified organism', category: 'Respiratory' },
  { code: 'J20.9', description: 'Acute bronchitis, unspecified', category: 'Respiratory' },
  { code: 'J44.9', description: 'Chronic obstructive pulmonary disease, unspecified', category: 'Respiratory' },
  { code: 'J45.909', description: 'Unspecified asthma, uncomplicated', category: 'Respiratory' },
  { code: 'J02.9', description: 'Acute pharyngitis, unspecified', category: 'Respiratory' },
  
  // Gastrointestinal
  { code: 'K21.9', description: 'Gastro-esophageal reflux disease without esophagitis', category: 'Gastrointestinal' },
  { code: 'K29.70', description: 'Gastritis, unspecified, without bleeding', category: 'Gastrointestinal' },
  { code: 'K58.9', description: 'Irritable bowel syndrome without diarrhea', category: 'Gastrointestinal' },
  { code: 'K59.00', description: 'Constipation, unspecified', category: 'Gastrointestinal' },
  { code: 'K92.2', description: 'Gastrointestinal hemorrhage, unspecified', category: 'Gastrointestinal' },
  
  // Musculoskeletal
  { code: 'M54.5', description: 'Low back pain', category: 'Musculoskeletal' },
  { code: 'M25.50', description: 'Pain in unspecified joint', category: 'Musculoskeletal' },
  { code: 'M79.3', description: 'Panniculitis, unspecified', category: 'Musculoskeletal' },
  { code: 'M19.90', description: 'Unspecified osteoarthritis, unspecified site', category: 'Musculoskeletal' },
  { code: 'M62.830', description: 'Muscle spasm of back', category: 'Musculoskeletal' },
  
  // Neurological
  { code: 'G43.909', description: 'Migraine, unspecified, not intractable, without status migrainosus', category: 'Neurological' },
  { code: 'G44.1', description: 'Vascular headache, not elsewhere classified', category: 'Neurological' },
  { code: 'G47.00', description: 'Insomnia, unspecified', category: 'Neurological' },
  { code: 'G89.29', description: 'Other chronic pain', category: 'Neurological' },
  
  // Mental Health
  { code: 'F41.9', description: 'Anxiety disorder, unspecified', category: 'Mental Health' },
  { code: 'F32.9', description: 'Major depressive disorder, single episode, unspecified', category: 'Mental Health' },
  { code: 'F33.9', description: 'Major depressive disorder, recurrent, unspecified', category: 'Mental Health' },
  { code: 'F43.10', description: 'Post-traumatic stress disorder, unspecified', category: 'Mental Health' },
  
  // Infectious
  { code: 'A09', description: 'Infectious gastroenteritis and colitis, unspecified', category: 'Infectious' },
  { code: 'B34.9', description: 'Viral infection, unspecified', category: 'Infectious' },
  { code: 'U07.1', description: 'COVID-19', category: 'Infectious' },
  
  // Dermatological
  { code: 'L30.9', description: 'Dermatitis, unspecified', category: 'Dermatological' },
  { code: 'L50.9', description: 'Urticaria, unspecified', category: 'Dermatological' },
  { code: 'L70.0', description: 'Acne vulgaris', category: 'Dermatological' },
  
  // Genitourinary
  { code: 'N39.0', description: 'Urinary tract infection, site not specified', category: 'Genitourinary' },
  { code: 'N18.9', description: 'Chronic kidney disease, unspecified', category: 'Genitourinary' },
  
  // General Symptoms
  { code: 'R50.9', description: 'Fever, unspecified', category: 'Symptoms' },
  { code: 'R51', description: 'Headache', category: 'Symptoms' },
  { code: 'R05', description: 'Cough', category: 'Symptoms' },
  { code: 'R06.02', description: 'Shortness of breath', category: 'Symptoms' },
  { code: 'R10.9', description: 'Unspecified abdominal pain', category: 'Symptoms' },
  { code: 'R11.0', description: 'Nausea', category: 'Symptoms' },
  { code: 'R11.10', description: 'Vomiting, unspecified', category: 'Symptoms' },
  { code: 'R42', description: 'Dizziness and giddiness', category: 'Symptoms' },
  { code: 'R53.83', description: 'Other fatigue', category: 'Symptoms' },
];

async function seedICDCodes() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing codes
    await ICDCode.deleteMany({});
    console.log('Cleared existing ICD codes');

    // Insert new codes
    await ICDCode.insertMany(icdCodes);
    console.log(`Seeded ${icdCodes.length} ICD-10 codes`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding ICD codes:', error);
    process.exit(1);
  }
}

seedICDCodes();
