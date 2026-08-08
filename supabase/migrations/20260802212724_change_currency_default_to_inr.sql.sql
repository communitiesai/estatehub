/*
# Change currency default from USD to INR

1. Modified Tables
- `leads`: currency column default changed from 'USD' to 'INR'.
- `properties`: currency column default changed from 'USD' to 'INR'.
- `deals`: currency column default changed from 'USD' to 'INR'.
2. Data Updates
- Existing rows with currency = 'USD' updated to 'INR' so all stored values use the rupee symbol.
3. Notes
- This app is India-focused (real estate CRM). INR is the only currency presented in the UI.
- No columns dropped or renamed; no data lost.
*/

UPDATE leads SET currency = 'INR' WHERE currency = 'USD';
UPDATE properties SET currency = 'INR' WHERE currency = 'USD';
UPDATE deals SET currency = 'INR' WHERE currency = 'USD';

ALTER TABLE leads ALTER COLUMN currency SET DEFAULT 'INR';
ALTER TABLE properties ALTER COLUMN currency SET DEFAULT 'INR';
ALTER TABLE deals ALTER COLUMN currency SET DEFAULT 'INR';
