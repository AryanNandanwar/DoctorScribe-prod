import { IncrementalNoteService } from './incremental-note.service';

describe('IncrementalNoteService', () => {
  let service: IncrementalNoteService;

  beforeEach(() => {
    service = new IncrementalNoteService();
  });

  describe('parseFinalResponse', () => {
    it('repairs list-shaped objects returned by the model', () => {
      const response = `{
  "patientDetails": "Name: Mahavidya, Gender: Female, Pregnancy Status: 5 months pregnant (conception date: June 12)",

  "medicalHistory": "Not mentioned",

  "problemsFaced": {
    "- Fever episodes",
    "- Swelling in eyebrows and eyes",
    "- Throat issues",
    "- Morning cough",
    "- Weight: 82 kg"
  },

  "findings": {
    "- Throat: Slightly red",
    "- Temperature: No fever at time of examination",
    "- Pulse: Normal",
    "- Chest: Normal"
  },

  "diagnosis": "Upper respiratory tract infection with pregnancy",

  "investigationsAdvised": "Not mentioned",

  "doctorInstructions": {
    "- Gargle with warm salt water",
    "- Use steam inhalation with hot water",
    "- Take medications as prescribed",
    "- Take Dolo only if fever develops"
  },

  "medicationPrescribed": {
    "1. Cetrizine 10mg - Half tablet twice daily (morning and night) for 5 days",
    "2. Dolo 650mg - As needed for fever",
    "3. Cough syrup - As needed",
    "4. Amrit - As prescribed"
  }
}`;

      const parsed = (service as any).parseFinalResponse(response);

      expect(parsed.patientDetails).toEqual({
        Name: 'Mahavidya',
        Gender: 'Female',
        'Pregnancy Status': '5 months pregnant (conception date: June 12)',
      });
      expect(parsed.problemFaced).toBe(
        'Fever episodes, Swelling in eyebrows and eyes, Throat issues, Morning cough, Weight: 82 kg',
      );
      expect(parsed.findings).toEqual([
        'Throat: Slightly red',
        'Temperature: No fever at time of examination',
        'Pulse: Normal',
        'Chest: Normal',
      ]);
      expect(parsed.diagnosis).toEqual(['Upper respiratory tract infection with pregnancy']);
      expect(parsed.doctorInstructions).toEqual([
        'Gargle with warm salt water',
        'Use steam inhalation with hot water',
        'Take medications as prescribed',
        'Take Dolo only if fever develops',
      ]);
      expect(parsed.medicationPrescribed).toEqual([
        '1. Cetrizine 10mg - Half tablet twice daily (morning and night) for 5 days',
        '2. Dolo 650mg - As needed for fever',
        '3. Cough syrup - As needed',
        '4. Amrit - As prescribed',
      ]);
    });
  });
});
