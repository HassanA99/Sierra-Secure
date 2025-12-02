-- Add phone number and biometric fields for citizen login and deduplication
ALTER TABLE users ADD COLUMN phoneNumber VARCHAR(20);
ALTER TABLE users ADD COLUMN phoneVerified BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN biometricData JSONB; -- Store facial recognition data
ALTER TABLE users ADD COLUMN biometricHash VARCHAR(255); -- SHA256 of biometric for matching

-- Create unique index on phone number
CREATE UNIQUE INDEX idx_users_phone ON users(phoneNumber) WHERE phoneNumber IS NOT NULL;

-- Create index on biometric hash for duplicate detection
CREATE INDEX idx_users_biometric_hash ON users(biometricHash) WHERE biometricHash IS NOT NULL;
