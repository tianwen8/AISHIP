/**
 * Workflow Builder Service
 * Intelligently generates workflow nodes based on model capabilities
 * Supports dynamic T2I→I2V or direct T2V workflows
 * Handles audio strategy decisions (model-generated vs TTS vs mixed)
 */

import { ModelOption, getModelById } from '@/config/models';
import { Scene, VoiceoverPlan } from './ai-planner';

// ============ Type Definitions ============

export interface WorkflowNode {
  id: string;
  type: 't2i' | 'i2v' | 't2v' | 'tts' | 'audio-mix' | 'merge';
  model: string;
  inputs: Record<string, any>;
  outputs: string[];
  dependencies: string[];  // Node IDs this node depends on
  metadata?: {
    sceneIndex?: number;
    audioSource?: 'model' | 'tts' | 'mixed';
  };
}

export interface AudioStrategy {
  source: 'model-generated' | 'tts' | 'mixed' | 'none';
  config: {
    keepVideoAudio?: boolean;
    addVoiceover?: boolean;
    mixRatio?: {
      videoAudio: number;  // 0-100
      voiceover: number;   // 0-100
    };
  };
}

// ============ Workflow Builder ============

export class WorkflowBuilder {
  /**
   * Build complete workflow based on scenes and selected models
   */
  buildWorkflow(
    scenes: Scene[],
    voiceoverPlan: VoiceoverPlan | undefined,
    selectedModels: {
      t2i: string;
      i2v: string;
      tts?: string;
    }
  ): WorkflowNode[] {
    const nodes: WorkflowNode[] = [];
    const i2vModel = getModelById(selectedModels.i2v, 'i2v');

    if (!i2vModel) {
      throw new Error(`I2V Model not found: ${selectedModels.i2v}`);
    }

    // Build scene nodes for each scene
    scenes.forEach((scene, index) => {
      const sceneNodes = this.buildSceneNodes(
        scene,
        index,
        selectedModels,
        i2vModel
      );
      nodes.push(...sceneNodes);
    });

    // Determine audio strategy
    const audioStrategy = this.determineAudioStrategy(
      voiceoverPlan,
      i2vModel
    );

    // Build audio nodes if needed
    if (voiceoverPlan) {
      const audioNodes = this.buildAudioNodes(
        voiceoverPlan,
        selectedModels,
        i2vModel,
        audioStrategy,
        scenes.length
      );
      nodes.push(...audioNodes);
    }

    // Build merge node
    const mergeNode = this.buildMergeNode(scenes.length, audioStrategy);
    nodes.push(mergeNode);

    return nodes;
  }

  /**
   * Build nodes for a single scene
   */
  private buildSceneNodes(
    scene: Scene,
    index: number,
    selectedModels: any,
    i2vModel: ModelOption
  ): WorkflowNode[] {
    const nodes: WorkflowNode[] = [];
    const capabilities = i2vModel.capabilities;

    // Check if model supports direct text-to-video
    const supportsT2V = capabilities?.inputType === 'both' || capabilities?.inputType === 'text';
    const needsT2I = !supportsT2V || capabilities?.inputType === 'image';

    if (needsT2I) {
      // Traditional workflow: T2I → I2V
      nodes.push({
        id: `t2i-${index}`,
        type: 't2i',
        model: selectedModels.t2i,
        inputs: {
          prompt: scene.description,
          imageSize: 'landscape_16_9'
        },
        outputs: ['imageUrl'],
        dependencies: [],
        metadata: { sceneIndex: index }
      });

      nodes.push({
        id: `i2v-${index}`,
        type: 'i2v',
        model: selectedModels.i2v,
        inputs: {
          imageUrl: `{{t2i-${index}.imageUrl}}`,
          prompt: scene.description,
          duration: scene.duration
        },
        outputs: capabilities?.audioGeneration?.enabled
          ? ['videoUrl', 'audioUrl']
          : ['videoUrl'],
        dependencies: [`t2i-${index}`],
        metadata: {
          sceneIndex: index,
          audioSource: capabilities?.audioGeneration?.enabled ? 'model' : undefined
        }
      });
    } else {
      // New workflow: Direct T2V
      nodes.push({
        id: `t2v-${index}`,
        type: 't2v',
        model: selectedModels.i2v,
        inputs: {
          prompt: scene.description,
          duration: scene.duration
        },
        outputs: capabilities?.audioGeneration?.enabled
          ? ['videoUrl', 'audioUrl']
          : ['videoUrl'],
        dependencies: [],
        metadata: {
          sceneIndex: index,
          audioSource: capabilities?.audioGeneration?.enabled ? 'model' : undefined
        }
      });
    }

    return nodes;
  }

  /**
   * Determine audio strategy based on user requirements and model capabilities
   */
  private determineAudioStrategy(
    voiceoverPlan: VoiceoverPlan | undefined,
    i2vModel: ModelOption
  ): AudioStrategy {
    const hasModelAudio = i2vModel.capabilities?.audioGeneration?.enabled;
    const modelAudioTypes = i2vModel.capabilities?.audioGeneration?.types || [];

    // Scenario 1: No voiceover requested
    if (!voiceoverPlan) {
      if (hasModelAudio) {
        // Keep model-generated audio (sound effects, music)
        return {
          source: 'model-generated',
          config: {
            keepVideoAudio: true
          }
        };
      } else {
        // No audio at all
        return {
          source: 'none',
          config: {}
        };
      }
    }

    // Scenario 2: Voiceover requested
    if (modelAudioTypes.includes('voiceover')) {
      // Model can generate voiceover, use it
      return {
        source: 'model-generated',
        config: {
          keepVideoAudio: true
        }
      };
    }

    // Scenario 3: Voiceover requested + model has sound effects
    if (hasModelAudio) {
      // Mix: 30% video audio (sound effects) + 70% TTS voiceover
      return {
        source: 'mixed',
        config: {
          keepVideoAudio: true,
          addVoiceover: true,
          mixRatio: {
            videoAudio: 30,
            voiceover: 70
          }
        }
      };
    }

    // Scenario 4: Voiceover requested + model has no audio
    // Use TTS only
    return {
      source: 'tts',
      config: {
        addVoiceover: true
      }
    };
  }

  /**
   * Build audio nodes (TTS and/or mixing)
   */
  private buildAudioNodes(
    voiceoverPlan: VoiceoverPlan,
    selectedModels: any,
    i2vModel: ModelOption,
    audioStrategy: AudioStrategy,
    sceneCount: number
  ): WorkflowNode[] {
    const nodes: WorkflowNode[] = [];

    // If model generates voiceover, no need for TTS
    if (audioStrategy.source === 'model-generated') {
      return nodes;
    }

    // Add TTS node
    if (audioStrategy.config.addVoiceover) {
      nodes.push({
        id: 'tts',
        type: 'tts',
        model: selectedModels.tts || 'elevenlabs/turbo-v2',
        inputs: {
          text: voiceoverPlan.script,
          voice: voiceoverPlan.voice
        },
        outputs: ['audioUrl'],
        dependencies: []
      });
    }

    // Add audio mixing node if needed (simplified for Phase 1)
    // Full implementation in Phase 2.5 阶段 2
    if (audioStrategy.source === 'mixed') {
      // TODO: Implement in Task 4.13
      // For now, we'll just use TTS and keep it simple
      console.log('Audio mixing will be implemented in Phase 2.5 阶段 2');
    }

    return nodes;
  }

  /**
   * Build final merge node
   */
  private buildMergeNode(
    sceneCount: number,
    audioStrategy: AudioStrategy
  ): WorkflowNode {
    // Collect video inputs
    const videoInputs = Array.from({ length: sceneCount }, (_, i) => {
      // Try both i2v and t2v node IDs (one will exist)
      return `{{i2v-${i}.videoUrl || t2v-${i}.videoUrl}}`;
    });

    // Determine audio input
    let audioInput: string | undefined;
    if (audioStrategy.source === 'tts') {
      audioInput = '{{tts.audioUrl}}';
    } else if (audioStrategy.source === 'mixed') {
      // TODO: Use mixed audio in Phase 2.5 阶段 2
      audioInput = '{{tts.audioUrl}}';  // Simplified for now
    } else if (audioStrategy.source === 'model-generated') {
      // Use audio from first video (simplified)
      audioInput = '{{i2v-0.audioUrl || t2v-0.audioUrl}}';
    }

    return {
      id: 'merge',
      type: 'merge',
      model: 'internal/video-merger',
      inputs: {
        videos: videoInputs,
        audio: audioInput
      },
      outputs: ['finalVideoUrl'],
      dependencies: Array.from({ length: sceneCount }, (_, i) => `i2v-${i}`)
    };
  }
}

/**
 * Helper function to create WorkflowBuilder instance
 */
export function createWorkflowBuilder() {
  return new WorkflowBuilder();
}
