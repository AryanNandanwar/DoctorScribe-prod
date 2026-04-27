export type Medication = {
  name?: string;
  dosage?: string;
  duration?: string;
  purpose?: string;
  instructions?: string;
  description?: string;
  note?: string;
};

export type ParsedNote = {
  patientDetails?: Record<string, string>;
  medicalHistory?: string[];
  problemFaced?: string | string[];
  findings?: string[] | Record<string, string>;
  diagnosis?: string[];
  investigationsAdvised?: string[];
  doctorInstructions?: string[];
  medicationPrescribed?: (string | Medication)[];
  raw?: string;
};
