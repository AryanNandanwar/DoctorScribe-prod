CREATE TABLE IF NOT EXISTS receptionists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  doctor_id uuid NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_receptionists_doctor_id ON receptionists(doctor_id);

CREATE TABLE IF NOT EXISTS patient_intakes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id uuid NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  receptionist_id uuid NULL REFERENCES receptionists(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT patient_intakes_status_check
    CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled'))
);

CREATE INDEX IF NOT EXISTS idx_patient_intakes_doctor_status
  ON patient_intakes(doctor_id, status, created_at);
CREATE INDEX IF NOT EXISTS idx_patient_intakes_patient_id
  ON patient_intakes(patient_id);
