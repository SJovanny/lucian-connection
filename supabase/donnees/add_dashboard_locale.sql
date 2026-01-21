-- Add dashboard locale preference to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS dashboard_locale TEXT DEFAULT 'fr';

UPDATE profiles
SET dashboard_locale = 'fr'
WHERE dashboard_locale IS NULL;
