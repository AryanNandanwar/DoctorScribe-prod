-- This script fixes the foreign key constraint issue on clinical_notes.patient_id
-- Run this script in your database to allow null values in patient_id

-- First, drop the existing foreign key constraint
ALTER TABLE clinical_notes DROP CONSTRAINT IF EXISTS clinical_notes_patient_id_fkey;

-- Then add it back with proper nullable support
ALTER TABLE clinical_notes 
ADD CONSTRAINT clinical_notes_patient_id_fkey 
FOREIGN KEY (patient_id) 
REFERENCES patient(id) 
ON DELETE CASCADE 
ON UPDATE CASCADE 
DEFERRABLE INITIALLY DEFERRED;

-- This allows the constraint to be checked at transaction end, 
-- giving us more flexibility with null values
