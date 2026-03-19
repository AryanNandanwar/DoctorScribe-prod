const axios = require('axios');

// Test data with new fields
const testData = {
  patientDetails: {
    name: "Test Patient",
    age: "35",
    gender: "Male"
  },
  medicalHistory: ["Hypertension", "Diabetes Type 2"],
  problemFaced: ["Chest pain", "Shortness of breath"],
  findings: ["Blood pressure: 140/90", "Heart rate: 95 bpm", "Normal heart sounds"],
  diagnosis: ["Hypertension", "Possible angina"],
  investigationsAdvised: ["ECG", "Lipid profile", "Chest X-ray"],
  doctorInstructions: ["Reduce salt intake", "Exercise regularly", "Follow up in 2 weeks"],
  medicationPrescribed: ["Amlodipine 5mg once daily", "Metformin 500mg twice daily"]
};

async function testNewFields() {
  try {
    console.log('Testing new clinical note fields...');
    
    // First, let's login to get a token (you'll need to replace with actual credentials)
    const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
      email: 'test@example.com',
      password: 'password'
    }).catch(() => {
      console.log('Login failed - you may need to update credentials or create a test user');
      return { data: { token: 'mock-token' } };
    });
    
    const token = loginResponse.data.token;
    console.log('Token obtained:', token ? 'Yes' : 'No');
    
    // Test creating a clinical note with new fields
    const createResponse = await axios.post('http://localhost:3000/api/clinical-notes', testData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }).catch(err => {
      console.log('Create failed:', err.response?.data || err.message);
      return null;
    });
    
    if (createResponse) {
      console.log('✅ Clinical note created successfully!');
      console.log('Note ID:', createResponse.data.id);
      console.log('New fields included:');
      console.log('- Findings:', createResponse.data.findings ? '✅' : '❌');
      console.log('- Diagnosis:', createResponse.data.diagnosis ? '✅' : '❌');
      console.log('- Investigations Advised:', createResponse.data.investigationsAdvised ? '✅' : '❌');
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testNewFields();
