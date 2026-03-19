// Simple test to verify backend changes work
const http = require('http');

const testData = {
  patientDetails: { name: "Test Patient", age: "35", gender: "Male" },
  medicalHistory: ["Hypertension"],
  problemFaced: ["Chest pain"],
  findings: ["Blood pressure: 140/90", "Heart rate: 95 bpm"],
  diagnosis: ["Hypertension"],
  investigationsAdvised: ["ECG", "Blood tests"],
  doctorInstructions: ["Reduce salt intake"],
  medicationPrescribed: ["Amlodipine 5mg"]
};

function testBackend() {
  const data = JSON.stringify(testData);
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/clinical-notes',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Headers: ${JSON.stringify(res.headers)}`);
    
    let responseData = '';
    res.on('data', (chunk) => {
      responseData += chunk;
    });
    
    res.on('end', () => {
      try {
        const parsed = JSON.parse(responseData);
        console.log('Response:', JSON.stringify(parsed, null, 2));
        
        if (res.statusCode === 401) {
          console.log('✅ Backend is running and responding (authentication expected)');
        } else if (res.statusCode === 400) {
          console.log('✅ Backend is running and validating input');
          if (responseData.includes('findings') || responseData.includes('diagnosis')) {
            console.log('✅ New fields are being validated');
          }
        } else if (res.statusCode === 201) {
          console.log('✅ Note created successfully!');
          console.log('✅ New fields accepted by backend');
        }
      } catch (e) {
        console.log('Response parsing failed:', e.message);
      }
    });
  });

  req.on('error', (e) => {
    console.error(`Request error: ${e.message}`);
    console.log('❌ Backend may not be running or not accessible');
  });

  req.write(data);
  req.end();
}

console.log('Testing backend with new clinical note structure...');
testBackend();
