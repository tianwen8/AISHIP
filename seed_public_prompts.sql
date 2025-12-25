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
  ),
  (
    'pp_004',
    'midnight-subway-heist',
    'Midnight Subway Heist',
    'A tense underground chase with precise shot-by-shot pacing.',
    'Sora',
    '{"title":"Midnight Subway Heist","logline":"A courier flees through an empty subway after a midnight handoff goes wrong.","style_lock":"35mm film, high contrast, cool teal shadows, low-key lighting, subtle grain","characters":[{"id":"courier","anchors":"black hoodie, scar on left eyebrow, messenger bag with red strap","prompt":"Character reference sheet, young courier, black hoodie, scar on left eyebrow, red strap messenger bag, neutral pose, front view, side view, back view, cinematic lighting"},{"id":"pursuer","anchors":"long trench coat, short hair, earpiece","prompt":"Character reference sheet, pursuer in long trench coat, short hair, earpiece, neutral pose, front view, side view, back view, cinematic lighting"}],"scene_prompt":"Empty subway platform at night, flickering fluorescent lights, cool teal shadows, light haze, reflective tiles, cinematic 35mm look.","shots":[{"id":1,"duration":4,"description":"Wide establishing shot of an empty subway platform, fluorescent lights flicker as the courier enters frame.","camera_movement":"slow dolly in","composition":"wide, centered subject","lighting":"cool fluorescent, pools of shadow","audio_sfx":"distant train rumble","prompt_en":"empty subway platform at night, lone courier in black hoodie with red strap messenger bag, wide shot, flickering fluorescent lights, cool teal shadows, cinematic 35mm"},{"id":2,"duration":3,"description":"Close-up of the courier glancing back, breath visible in cold air.","camera_movement":"static close-up","composition":"tight on face","lighting":"rim light from overhead tubes","audio_sfx":"sharp inhale","prompt_en":"close-up face, scar on left eyebrow, cold breath, rim light, tense expression, cinematic"},{"id":3,"duration":4,"description":"Low tracking shot as the courier sprints along the platform, bag bouncing.","camera_movement":"low tracking","composition":"leading lines, shallow depth","lighting":"streaked highlights","audio_sfx":"footsteps echo","prompt_en":"low angle tracking shot, courier running, messenger bag with red strap, motion blur, fluorescent streaks, cinematic"},{"id":4,"duration":4,"description":"Medium shot as the pursuer appears at the far end, trench coat swinging.","camera_movement":"slow push in","composition":"subject framed by tunnel","lighting":"backlit haze","audio_sfx":"distant radio chatter","prompt_en":"medium shot, pursuer in long trench coat, backlit tunnel haze, cinematic noir"},{"id":5,"duration":5,"description":"Whip pan to the courier jumping into a departing train, doors closing.","camera_movement":"whip pan","composition":"dynamic, motion blur","lighting":"sparks and reflections","audio_sfx":"train doors slam","prompt_en":"whip pan, courier jumps into moving train, door closing, motion blur, sparks, reflections, cinematic action"}],"master_prompt":"Cinematic subway chase, 35mm film, cool teal shadows, low-key lighting, subtle grain, empty platform, courier with black hoodie and red strap messenger bag, pursuer in trench coat, suspense pacing, professional shot list.","negative_prompt":"low quality, blurry, watermark","continuity_notes":"Courier keeps red strap bag, pursuer appears after shot 2, empty platform throughout."}',
    'https://fal.media/files/monkey/2wJ-7T3wK_3s4sF_q.png',
    '["thriller","cinematic","chase","urban","night"]',
    980,
    210,
    true,
    true
  ),
  (
    'pp_005',
    'desert-wind-turbine-doc',
    'Desert Wind Turbine Doc',
    'A documentary-style sequence about clean energy in the desert.',
    'Veo',
    '{"title":"Desert Wind Turbine Doc","logline":"A sunrise documentary of wind turbines powering a desert town.","style_lock":"documentary realism, natural light, warm sunrise palette, crisp detail","characters":[{"id":"technician","anchors":"workwear jacket, safety vest, sun hat, clipboard","prompt":"Character reference sheet, renewable energy technician, workwear jacket, safety vest, sun hat, holding clipboard, neutral pose, front view, side view, back view, documentary lighting"}],"scene_prompt":"Desert plain at sunrise, wind turbines in the distance, dusty air, warm golden light, documentary realism.","shots":[{"id":1,"duration":4,"description":"Aerial wide shot over a desert plain as turbines spin at sunrise.","camera_movement":"slow aerial glide","composition":"wide landscape","lighting":"golden hour","audio_sfx":"soft wind","prompt_en":"aerial wide shot, desert plain, wind turbines spinning, golden sunrise, documentary realism"},{"id":2,"duration":4,"description":"Medium shot of turbine blades sweeping past the camera.","camera_movement":"static, blades pass","composition":"off-center blade sweep","lighting":"warm edge light","audio_sfx":"whoosh of blades","prompt_en":"medium shot, turbine blades sweeping, warm edge light, documentary style"},{"id":3,"duration":4,"description":"Cut to a local worker checking a control panel in a small facility.","camera_movement":"handheld slight","composition":"medium close-up","lighting":"soft interior window light","audio_sfx":"panel beeps","prompt_en":"worker checking control panel, warm interior light, documentary handheld"},{"id":4,"duration":4,"description":"Wide shot of a small desert town with turbines on the horizon.","camera_movement":"slow push in","composition":"town foreground, turbines background","lighting":"morning sun","audio_sfx":"quiet ambience","prompt_en":"desert town wide shot, turbines on horizon, morning sun, documentary"}],"master_prompt":"Documentary sequence about wind energy, desert sunrise, natural light, warm palette, realistic details, professional shot list.","negative_prompt":"low quality, oversaturated, watermark","continuity_notes":"Same sunrise time, consistent warm palette."}',
    'https://fal.media/files/panda/5pQ-2R9wS_1s7sE_z.png',
    '["documentary","nature","aerial","energy","sunrise"]',
    740,
    190,
    false,
    true
  ),
  (
    'pp_006',
    'startup-pitch-night',
    'Startup Pitch Night',
    'A high-pressure demo night with crisp corporate visuals.',
    'Sora',
    '{"title":"Startup Pitch Night","logline":"A founder delivers a critical pitch as the clock runs down.","style_lock":"clean corporate, modern glass, cool white key light, subtle bloom","characters":[{"id":"founder","anchors":"navy blazer, white sneakers, silver laptop","prompt":"Character reference sheet, startup founder, navy blazer, white sneakers, holding silver laptop, neutral pose, front view, side view, back view, clean corporate lighting"}],"scene_prompt":"Modern demo night stage, large presentation screen with charts, cool white key light, blue accent lights, glass surfaces.","shots":[{"id":1,"duration":3,"description":"Wide shot of a stage with a large screen showing charts.","camera_movement":"slow dolly in","composition":"wide, centered stage","lighting":"cool white key, blue accents","audio_sfx":"low crowd murmur","prompt_en":"wide stage, startup demo night, large screen charts, cool white lighting, corporate cinematic"},{"id":2,"duration":4,"description":"Medium shot of the founder gesturing with a clicker.","camera_movement":"steady cam","composition":"rule of thirds","lighting":"spotlight with soft fill","audio_sfx":"clicker sound","prompt_en":"founder in navy blazer, white sneakers, holding clicker, soft spotlight, corporate cinematic"},{"id":3,"duration":4,"description":"Close-up of the silver laptop with a live dashboard.","camera_movement":"macro push in","composition":"tight on screen","lighting":"screen glow","audio_sfx":"soft keyboard taps","prompt_en":"close-up silver laptop, live dashboard UI, screen glow, macro cinematic"},{"id":4,"duration":4,"description":"Cut to judges watching intently, subtle nods.","camera_movement":"static medium","composition":"line of judges","lighting":"soft top light","audio_sfx":"room tone","prompt_en":"judges watching, focused expressions, soft top light, corporate documentary"},{"id":5,"duration":4,"description":"Wide shot as a countdown timer hits zero and applause starts.","camera_movement":"slow zoom out","composition":"wide with timer","lighting":"stage lights flare","audio_sfx":"applause swell","prompt_en":"stage wide shot, countdown timer hits zero, applause, stage lights flare, cinematic"}],"master_prompt":"Corporate demo night, modern glass stage, cool white key light, crisp detail, confident founder, professional shot list.","negative_prompt":"low quality, blurry, watermark","continuity_notes":"Same stage, same founder outfit, screen charts throughout."}',
    'https://fal.media/files/monkey/2wJ-7T3wK_3s4sF_q.png',
    '["corporate","startup","presentation","night","cinematic"]',
    610,
    170,
    false,
    true
  ),
  (
    'pp_007',
    'mythic-forest-ritual',
    'Mythic Forest Ritual',
    'A fantasy ritual sequence with glowing artifacts and fog.',
    'Kling',
    '{"title":"Mythic Forest Ritual","logline":"A group of mystics awakens an ancient artifact in a moonlit forest.","style_lock":"fantasy cinematic, blue moonlight, mist, glowing runes, soft bloom","characters":[{"id":"mystic","anchors":"hooded robe, glowing rune necklace, silver staff","prompt":"Character reference sheet, mystic in hooded robe, glowing rune necklace, silver staff, neutral pose, front view, side view, back view, moonlit lighting"}],"scene_prompt":"Moonlit forest clearing, thick mist, ancient stone altar, glowing runes, soft bloom, blue palette.","shots":[{"id":1,"duration":4,"description":"Wide shot of a moonlit forest clearing with thick mist.","camera_movement":"slow crane down","composition":"wide, symmetrical trees","lighting":"blue moonlight","audio_sfx":"whispering wind","prompt_en":"moonlit forest clearing, thick mist, blue moonlight, fantasy cinematic"},{"id":2,"duration":4,"description":"Medium shot of a glowing artifact on a stone altar.","camera_movement":"slow push in","composition":"centered artifact","lighting":"glow from runes","audio_sfx":"low hum","prompt_en":"glowing artifact on stone altar, runes, soft bloom, fantasy"},{"id":3,"duration":4,"description":"Close-up of a mystic placing a hand on the artifact, light intensifies.","camera_movement":"static close-up","composition":"hands and light","lighting":"glow spill","audio_sfx":"pulse sound","prompt_en":"close-up hands touching glowing artifact, light intensifies, mist, cinematic fantasy"},{"id":4,"duration":5,"description":"Wide shot as light rises into the trees, fog swirling.","camera_movement":"slow pull back","composition":"wide with light beam","lighting":"blue moon + artifact glow","audio_sfx":"crescendo","prompt_en":"wide shot, light beam rising into trees, swirling fog, fantasy cinematic"}],"master_prompt":"Fantasy ritual in a moonlit forest, glowing runes, mist, blue palette, soft bloom, cinematic shot list.","negative_prompt":"low quality, blurry, watermark","continuity_notes":"Moonlight and mist remain constant."}',
    'https://fal.media/files/tiger/7jM-1X5wN_6s9sA_r.png',
    '["fantasy","cinematic","ritual","moonlight","atmospheric"]',
    530,
    140,
    false,
    true
  ),
  (
    'pp_008',
    'street-food-night-market',
    'Street Food Night Market',
    'A vibrant travel piece focused on motion, steam, and flavors.',
    'Veo',
    '{"title":"Street Food Night Market","logline":"A night market chef prepares a signature dish in a busy alley.","style_lock":"handheld travel, neon accents, warm steam, vibrant colors","characters":[{"id":"chef","anchors":"short apron, rolled sleeves, steel spatula, confident smile","prompt":"Character reference sheet, street food chef, short apron, rolled sleeves, steel spatula, confident smile, neutral pose, front view, side view, back view, neon stall light"}],"scene_prompt":"Crowded night market alley, neon signs, warm steam, sizzling stalls, handheld travel energy.","shots":[{"id":1,"duration":3,"description":"Wide shot of a crowded night market alley with neon signs.","camera_movement":"handheld walk-in","composition":"wide, busy crowd","lighting":"neon + warm stalls","audio_sfx":"market chatter","prompt_en":"night market alley, neon signs, crowded stalls, handheld travel style"},{"id":2,"duration":3,"description":"Medium shot of the chef slicing ingredients quickly.","camera_movement":"handheld close","composition":"medium, fast hands","lighting":"warm stall light","audio_sfx":"knife chops","prompt_en":"chef slicing ingredients, fast hands, warm stall light, handheld"},{"id":3,"duration":3,"description":"Close-up of sizzling pan with steam and flames.","camera_movement":"macro tilt","composition":"tight on pan","lighting":"orange flame glow","audio_sfx":"sizzle","prompt_en":"close-up sizzling pan, steam, flames, macro shot, vibrant"},{"id":4,"duration":4,"description":"Customer receives the dish, smiles, takes a bite.","camera_movement":"steady medium","composition":"two-shot","lighting":"neon rim light","audio_sfx":"ambient crowd","prompt_en":"customer smiling, takes a bite, neon rim light, travel cinematic"},{"id":5,"duration":4,"description":"Final wide shot of the alley, steam rising as the camera pulls back.","camera_movement":"slow pull back","composition":"wide farewell","lighting":"neon haze","audio_sfx":"fade out ambience","prompt_en":"wide night market alley, steam rising, neon haze, slow pull back"}],"master_prompt":"Travel night market sequence, handheld energy, neon accents, warm steam, vibrant colors, professional shot list.","negative_prompt":"low quality, blurry, watermark","continuity_notes":"Same alley, neon palette, steam visible in each shot."}',
    'https://fal.media/files/panda/5pQ-2R9wS_1s7sE_z.png',
    '["travel","food","night","handheld","urban"]',
    870,
    230,
    true,
    true
  );
