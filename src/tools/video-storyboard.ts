import { z } from "zod";
import { DeepSeekLLMAdapter } from "@/integrations/ai-adapters/deepseek";
import { DEFAULT_MODELS } from "@/integrations/ai-adapters";

// ============ Type Definitions ============

export const VideoStoryboardInputSchema = z.object({
  prompt: z.string().min(5, "Prompt must be at least 5 characters"),
  duration: z.number().default(15),
  models: z.array(z.string()).default(["sora", "kling", "veo"]), // Targeted models
  style: z.string().optional(), // e.g. "cinematic", "anime"
  withPreviewImage: z.boolean().optional().default(false),
});

export type VideoStoryboardInput = z.infer<typeof VideoStoryboardInputSchema>;

export interface DirectorShot {
  id: number;
  duration: number; // Duration of this specific shot
  description: string; // Visual description
  transition: string; // e.g. "cut", "match cut", "whip pan"
  camera_movement: string; // Professional camera movement term
  composition: string; // e.g. "Rule of thirds", "Symmetry"
  lighting: string; // e.g. "Golden hour", "Cyberpunk neon"
  audio_sfx: string; // Sound effects for this shot
  prompt_en: string; // The exact English prompt to use for this shot
}

export interface DirectorCharacter {
  id: string;
  anchors: string; // Visual anchor points for consistency
  prompt: string; // Reference prompt for character generation
}

export interface DirectorOutput {
  title: string;
  logline: string; // One sentence summary (pitch)
  story_arc: string; // Brief explanation of the narrative structure
  style_lock: string; // Global style consistency lock
  continuity_notes: string; // Continuity notes across shots
  characters: DirectorCharacter[];
  scene_prompt: string; // Reference prompt for scene generation
  master_prompt: string; // One giant prompt that could generate the whole video (if supported)
  negative_prompt: string; // Common negative terms
  shots: DirectorShot[];
  audio: {
    music_prompt: string; // For Suno/Udio
    voiceover_script?: string; // Optional narration
  };
  // New fields for Long-form support
  is_long_form?: boolean;
  scene_number?: number; // e.g., Scene 1 of X
  next_scene_suggestion?: string; // Idea for the next block of 60s
}

// ============ AI Director Implementation ============

export class VideoStoryboardTool {
  private llm = new DeepSeekLLMAdapter();

  /**
   * Run the AI Director to generate a storyboard
   */
  async run(input: VideoStoryboardInput): Promise<DirectorOutput> {
    const isLongForm = input.prompt.length > 300 || input.duration > 60;
    
    // Base System Prompt
    let systemPrompt = `You are a Hollywood-level Film Director and Screenwriter.
Your goal is to turn a user's idea into a professional, actionable Video Storyboard for AI Video Generators (Sora, Kling, Runway, Veo).

**Process:**
1.  **Analyze**: Understand the core emotion and narrative.
2.  **Structure**: Break the video into a logical sequence of shots.
3.  **Compose**: Apply professional film theory (lighting, lens choice, camera movement).
4.  **Translate**: Write precise, English prompts optimized for AI video models.

**Tone & Style**:
- If user input is simple, ADD CREATIVE DETAILS.
- Example: User says "cat running". You output: "Low angle, tracking shot of a determined tabby cat sprinting through a neon-lit alleyway."`;

    // Add Long-form Logic
    if (isLongForm) {
      systemPrompt += `

**LONG-FORM NARRATIVE MODE ACTIVATED**:
The user has provided a long story or article.
1.  **Summarize**: Distill the key plot points.
2.  **Focus on Scene 1**: Generate the storyboard ONLY for the first 30-60 seconds (The Setup / Inciting Incident).
3.  **Suggestion**: Provide a brief suggestion for what Scene 2 should cover in the 'next_scene_suggestion' field.
`;
    }

    systemPrompt += `
**Output Rules (STRICT):**
- Return ONLY a JSON object. No markdown. No extra text.
- JSON keys: title, logline, story_arc, style_lock, continuity_notes, characters, scene_prompt, master_prompt, negative_prompt, shots, audio
- shots must be an array of objects with: id, duration, description, transition, camera_movement, composition, lighting, audio_sfx, prompt_en
- characters must be an array of objects with: id, anchors, prompt
- audio must be an object with: music_prompt, voiceover_script (optional)
- English only for all text fields.
- Sum of shot durations must equal exactly ${Math.min(input.duration, 60)}.
- camera_movement must use film terms (e.g. "Dolly Zoom", "Truck Left", "Pedestal Up", "Handheld").
`;

    const userPrompt = `
**User Idea**: "${input.prompt}"
**Target Duration**: ${Math.min(input.duration, 60)} seconds
**Style Preference**: ${input.style || "Cinematic/Default"}

Please generate a professional storyboard in JSON format.
`;

    try {
      const response = await this.llm.call({
        model: DEFAULT_MODELS.llm, // DeepSeek
        prompt: userPrompt,
        systemPrompt: systemPrompt,
        temperature: 0.8, 
        maxTokens: 4000, // Increased for long-form context
        responseFormat: "json",
      });

      // Parse the JSON output
      let outputData: DirectorOutput;
      try {
        outputData = JSON.parse(response.output);
      } catch (e) {
        // Fallback for messy JSON
        const match = response.output.match(/\{[\s\S]*\}/);
        if (match) {
          outputData = JSON.parse(match[0]);
        } else {
          throw new Error("Failed to parse JSON from AI response");
        }
      }

      // Basic validation
      if (!outputData.shots || !Array.isArray(outputData.shots)) {
        throw new Error("AI output missing required 'shots' array");
      }

      const ensureText = (value: any, fallback: string) =>
        typeof value === "string" && value.trim() ? value : fallback;

      outputData.style_lock = ensureText(
        outputData.style_lock,
        "cinematic, consistent color palette, stable lighting, cohesive film grain"
      );

      outputData.continuity_notes = ensureText(
        outputData.continuity_notes,
        "Maintain consistent character appearance, wardrobe, and lighting across shots."
      );

      if (!Array.isArray(outputData.characters) || outputData.characters.length === 0) {
        outputData.characters = [
          {
            id: "lead",
            anchors: "distinct outfit, signature accessory, consistent hairstyle",
            prompt:
              "Character reference sheet: lead character, distinct outfit, signature accessory, consistent hairstyle, neutral pose, front view, side view, back view.",
          },
        ];
      }

      outputData.characters = outputData.characters.map((character, index) => {
        const id = ensureText(character?.id, `character_${index + 1}`);
        const anchors = ensureText(
          character?.anchors,
          "distinct outfit, signature accessory, consistent hairstyle"
        );
        const prompt = ensureText(
          character?.prompt,
          `Character reference sheet: ${anchors}. Neutral pose, front view, side view, back view.`
        );
        return { id, anchors, prompt };
      });

      outputData.scene_prompt = ensureText(
        outputData.scene_prompt,
        `Scene reference image: ${outputData.logline}. ${outputData.style_lock}.`
      );

      // Inject long-form metadata
      if (isLongForm) {
        outputData.is_long_form = true;
        outputData.scene_number = 1;
        if (!outputData.next_scene_suggestion) {
           outputData.next_scene_suggestion = "Continue the story with the rising action...";
        }
      }

      return outputData;
    } catch (error: any) {
      console.error("VideoStoryboardTool Error:", error);
      throw new Error(`Director failed to generate storyboard: ${error.message}`);
    }
  }
}
