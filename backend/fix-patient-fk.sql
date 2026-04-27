-- Run this SQL directly in your database to fix the foreign key constraint issue
-- This will allow null values in patient_id column

-- Step 1: Drop the existing foreign key constraint
ALTER TABLE clinical_notes 
DROP CONSTRAINT IF EXISTS clinical_notes_patient_id_fkey;

-- Step 2: Add it back with proper null handling
ALTER TABLE clinical_notes 
ADD CONSTRAINT clinical_notes_patient_id_fkey 
FOREIGN KEY (patient_id) 
REFERENCES patient(id) 
ON DELETE SET NULL 
ON UPDATE CASCADE 
DEFERRABLE INITIALLY DEFERRED;

-- Step 3: Verify the constraint was added correctly
SELECT conname, condeferrable, condeferred 
FROM pg_constraint 
WHERE conname = 'clinical_notes_patient_id_fkey';
