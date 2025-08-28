-- Fix missing type field in transportation additional field
UPDATE properties 
SET guest_profile_config = jsonb_set(
    COALESCE(guest_profile_config, '{}'::jsonb),
    '{additional_fields,transportation,type}',
    '"select"'
)
WHERE guest_profile_config IS NOT NULL 
  AND guest_profile_config->'additional_fields'->'transportation' IS NOT NULL
  AND guest_profile_config->'additional_fields'->'transportation'->>'type' IS NULL;