-- Seed data for public_prompts (PromptShip)
-- Run in Supabase SQL Editor after schema_bootstrap.sql

INSERT INTO public_prompts
  (uuid, slug, title, description, model, content_json, thumbnail_url, tags, views, copies, is_featured, is_public)
VALUES
  (
    'pp_001',
    'neon-detective-rain',
    'Neon Detective in the Rain',
    'A moody cyberpunk opening with neon reflections and rain-soaked streets.',
    'Sora',
    '{"title":"Neon Detective in the Rain","logline":"A lone detective walks through neon rain.","shots":[],"master_prompt":"Cinematic neon rain, slow tracking shot, reflections, noir mood.","negative_prompt":"low quality, blurry, watermark"}',
    'https://fal.media/files/monkey/2wJ-7T3wK_3s4sF_q.png',
    '["cyberpunk","noir","rain"]',
    1250,
    342,
    true,
    true
  ),
  (
    'pp_002',
    'luxury-perfume-splash',
    'Luxury Perfume Water Splash',
    'A premium product shot with slow motion water splash and glass reflections.',
    'Veo',
    '{"title":"Luxury Perfume Water Splash","logline":"A luxury perfume bottle emerges from a slow water splash.","shots":[],"master_prompt":"Macro product shot, slow motion water splash, studio lighting, glossy reflections.","negative_prompt":"low quality, noisy, watermark"}',
    'https://fal.media/files/panda/5pQ-2R9wS_1s7sE_z.png',
    '["advertising","product","slow-motion"]',
    4500,
    1200,
    true,
    true
  ),
  (
    'pp_003',
    'fpv-forest-chase',
    'FPV Drone Forest Chase',
    'A fast FPV drone sequence weaving through a dense forest canopy.',
    'Kling',
    '{"title":"FPV Drone Forest Chase","logline":"A high-speed FPV chase through forest trails.","shots":[],"master_prompt":"FPV drone, fast banking turns, sunbeams through trees, dynamic motion blur.","negative_prompt":"low quality, jitter, watermark"}',
    'https://fal.media/files/tiger/7jM-1X5wN_6s9sA_r.png',
    '["fpv","action","nature"]',
    2100,
    560,
    false,
    true
  );
