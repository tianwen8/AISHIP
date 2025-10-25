"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  NodeTypes,
  useReactFlow,
} from "reactflow";
import "reactflow/dist/style.css";

import type { WorkflowPlan } from "@/services/ai-planner";
import { getUuid } from "@/lib/hash";

// Import custom node components
import PromptNode from "@/components/nodes/PromptNode";
import T2INode from "@/components/nodes/T2INode";
import I2VNode from "@/components/nodes/I2VNode";
import TTSNode from "@/components/nodes/TTSNode";
import MergeNode from "@/components/nodes/MergeNode";
import CanvasToolbar from "@/components/CanvasToolbar";

// RunStatus enum (avoiding database import on client side)
enum RunStatus {
  Pending = "pending",
  Running = "running",
  Completed = "completed",
  Failed = "failed",
}

interface Run {
  run_uuid: string;
  status: RunStatus;
  workflow_plan: WorkflowPlan;
  estimated_credits: number;
  used_credits: number;
}

// Internal canvas component that uses useReactFlow
function CanvasContent({
  nodes,
  edges,
  nodeTypes,
  onNodesChange,
  onEdgesChange,
  isGenerating,
}: {
  nodes: Node[];
  edges: Edge[];
  nodeTypes: NodeTypes;
  onNodesChange: any;
  onEdgesChange: any;
  isGenerating: boolean;
}) {
  const { fitView } = useReactFlow();

  // Auto fit view when nodes change during generation
  useEffect(() => {
    if (isGenerating && nodes.length > 0) {
      setTimeout(() => {
        fitView({ duration: 500, padding: 0.1 });
      }, 100);
    }
  }, [nodes.length, isGenerating, fitView]);

  return (
    <>
      <Background />
      <Controls />
      {!isGenerating && <MiniMap />}
    </>
  );
}

export default function WorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const runId = params.runId as string;

  const [run, setRun] = useState<Run | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  // Progress state for SSE
  const [progressMessage, setProgressMessage] = useState<string>("Initializing...");
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Define custom node types
  const nodeTypes: NodeTypes = useMemo(
    () => ({
      prompt: PromptNode,
      t2i: T2INode,
      i2v: I2VNode,
      tts: TTSNode,
      merge: MergeNode,
    }),
    []
  );

  // Fetch run data OR handle streaming generation
  useEffect(() => {
    // Check if this is a temporary runId (immediate redirect scenario)
    const isTempRun = runId.startsWith("temp_");

    if (isTempRun) {
      // Start SSE streaming generation
      startStreamingGeneration();
    } else {
      // Normal flow: fetch existing run
      fetchRun();
    }
  }, [runId]);

  async function fetchRun() {
    try {
      const response = await fetch(`/api/runs/${runId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch run");
      }
      const data = await response.json();
      setRun(data);

      // Generate nodes and edges from workflow_plan
      generateNodesAndEdges(data.workflow_plan);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function startStreamingGeneration() {
    setIsGenerating(true);
    setLoading(false);

    try {
      // Read generation params from sessionStorage
      const paramsJson = sessionStorage.getItem("generationParams");
      if (!paramsJson) {
        throw new Error("Generation parameters not found");
      }

      const params = JSON.parse(paramsJson);

      // Step 1: Immediately show prompt node
      const promptNode: Node = {
        id: "prompt-node",
        type: "prompt",
        position: { x: 50, y: 200 },
        data: {
          prompt: params.prompt,
          referenceImage: params.referenceImage,
        },
      };
      setNodes([promptNode]);

      // Connect to SSE endpoint
      const response = await fetch("/api/generate-stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error("Failed to start generation stream");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("Response body is not readable");
      }

      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("event: ")) {
            const eventMatch = line.match(/event: (\w+)\ndata: (.+)/s);
            if (eventMatch) {
              const [, event, dataStr] = eventMatch;
              const data = JSON.parse(dataStr);

              await handleSSEEvent(event, data);
            }
          }
        }
      }
    } catch (err: any) {
      setError(err.message);
      setIsGenerating(false);
    }
  }

  async function handleSSEEvent(event: string, data: any) {
    console.log("SSE Event:", event, data);

    switch (event) {
      case "init":
        // Immediately update URL with real runId (no page reload)
        window.history.replaceState(null, '', `/workspace/${data.runUuid}`);

        // Update run state with initial data
        setRun({
          run_uuid: data.runUuid,
          status: RunStatus.Running,
          workflow_plan: {},
          estimated_credits: 0,
          used_credits: 0,
        });
        break;

      case "status":
        setProgressMessage(data.message);
        setProgressPercent(data.progress || 0);
        break;

      case "workflow":
        // Gradually show nodes with animation
        await generateNodesWithAnimation(data.workflowPlan);
        break;

      case "complete":
        setProgressMessage("Complete!");
        setProgressPercent(100);

        // Update run data with completion status (preserve existing fields)
        setRun((prevRun) => ({
          ...prevRun,
          run_uuid: data.runUuid,
          status: RunStatus.Completed,
          workflow_plan: data.workflowPlan || prevRun?.workflow_plan || {},
          graph_snapshot: data.workflowPlan || prevRun?.graph_snapshot || {},
          estimated_credits: data.estimatedCredits || prevRun?.estimated_credits || 0,
          used_credits: 0,
        } as any));

        // URL already updated in "init" event, no need to update again

        // Clear sessionStorage
        sessionStorage.removeItem("generationParams");

        // Stop generating mode
        setIsGenerating(false);
        break;

      case "error":
        setError(data.message);
        setIsGenerating(false);
        break;
    }
  }

  // Generate nodes with animation (渐进式出现)
  async function generateNodesWithAnimation(workflow: WorkflowPlan) {
    const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    // Column positions (横向布局)
    const colX = {
      prompt: 50,
      scenes: 400,    // 分镜列
      videos: 750,    // 视频列
      audio: 1100,    // 音频列
      merge: 1450,    // 合成列
    };

    let yPos = 100;
    const sceneSpacing = 380; // Increased to accommodate thumbnails/videos in completed state

    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];

    // Keep prompt node
    newNodes.push({
      id: "prompt-node",
      type: "prompt",
      position: { x: colX.prompt, y: 200 },
      data: {
        prompt: workflow.scenes[0]?.description || "Your video prompt",
        referenceImage: null,
      },
    });

    // Add animated edge from prompt
    await delay(300);

    // Create scene nodes progressively
    for (let index = 0; index < workflow.scenes.length; index++) {
      const scene = workflow.scenes[index];
      const sceneId = scene.id;

      // T2I Node (scene node)
      const t2iNodeId = `t2i-${sceneId}`;
      newNodes.push({
        id: t2iNodeId,
        type: "t2i",
        position: { x: colX.scenes, y: yPos },
        data: {
          label: `Scene ${index + 1}`,
          prompt: scene.description,
          model: scene.t2iModel || "fal-ai/flux-dev",
          credits: scene.t2iCredits || 0.25,
          sceneIndex: index + 1,
          onModelChange: handleModelChange,
          onPromptChange: handlePromptChange,
        },
      });

      // Edge from prompt to scene
      newEdges.push({
        id: `prompt-${t2iNodeId}`,
        source: "prompt-node",
        target: t2iNodeId,
        animated: true,
        style: { stroke: "#3b82f6", strokeWidth: 2 },
      });

      setNodes([...newNodes]);
      setEdges([...newEdges]);
      await delay(300);

      // I2V Node (video node)
      const i2vNodeId = `i2v-${sceneId}`;
      newNodes.push({
        id: i2vNodeId,
        type: "i2v",
        position: { x: colX.videos, y: yPos },
        data: {
          label: `Video ${index + 1}`,
          duration: scene.duration,
          model: scene.t2vModel || "fal-ai/kling-v1",
          credits: scene.t2vCredits || (scene.duration * 0.8),
          sceneIndex: index + 1,
          onModelChange: handleModelChange,
        },
      });

      // Edge from T2I to I2V
      newEdges.push({
        id: `${t2iNodeId}-${i2vNodeId}`,
        source: t2iNodeId,
        target: i2vNodeId,
        animated: true,
        style: { stroke: "#10b981", strokeWidth: 2 },
      });

      setNodes([...newNodes]);
      setEdges([...newEdges]);
      await delay(300);

      yPos += sceneSpacing;
    }

    // TTS Node (if voiceover exists)
    if (workflow.voiceover) {
      const ttsNodeId = "tts";
      newNodes.push({
        id: ttsNodeId,
        type: "tts",
        position: { x: colX.audio, y: 200 },
        data: {
          label: "Voiceover",
          script: workflow.voiceover.script,
          voice: workflow.voiceover.voice || "female",
          model: workflow.voiceover.ttsModel || "elevenlabs/turbo-v2",
          credits: workflow.voiceover.ttsCredits || 0.5,
          onModelChange: handleModelChange,
        },
      });

      setNodes([...newNodes]);
      await delay(300);
    }

    // Merge Node
    const mergeNodeId = "merge";
    const mergeY = (yPos - sceneSpacing) / 2 + 100;
    newNodes.push({
      id: mergeNodeId,
      type: "merge",
      position: { x: colX.merge, y: mergeY },
      data: {
        label: "Final Output",
        totalDuration: workflow.totalDurationSeconds,
        sceneCount: workflow.scenes.length,
        credits: workflow.mergeCredits || 0.1,
        hasVoiceover: !!workflow.voiceover,
      },
    });

    setNodes([...newNodes]);
    await delay(300);

    // Connect all I2V nodes to Merge (多条线汇聚)
    workflow.scenes.forEach((scene) => {
      const i2vNodeId = `i2v-${scene.id}`;
      newEdges.push({
        id: `${i2vNodeId}-merge`,
        source: i2vNodeId,
        target: mergeNodeId,
        animated: true,
        style: { stroke: "#8b5cf6", strokeWidth: 2 },
      });
    });

    // Connect TTS to Merge (if exists)
    if (workflow.voiceover) {
      newEdges.push({
        id: "tts-merge",
        source: "tts",
        target: mergeNodeId,
        animated: true,
        style: { stroke: "#f59e0b", strokeWidth: 2 },
      });
    }

    setEdges([...newEdges]);
  }

  // Generate React Flow nodes and edges from WorkflowPlan (横向布局 - 无动画版本)
  function generateNodesAndEdges(workflow: WorkflowPlan) {
    // Column positions (横向布局)
    const colX = {
      prompt: 50,
      scenes: 400,    // 分镜列
      videos: 750,    // 视频列
      audio: 1100,    // 音频列
      merge: 1450,    // 合成列
    };

    let yPos = 100;
    const sceneSpacing = 380; // Increased to accommodate thumbnails/videos in completed state

    const generatedNodes: Node[] = [];
    const generatedEdges: Edge[] = [];

    // Prompt node
    generatedNodes.push({
      id: "prompt-node",
      type: "prompt",
      position: { x: colX.prompt, y: 200 },
      data: {
        prompt: workflow.scenes[0]?.description || "Your video prompt",
        referenceImage: null,
      },
    });

    // Create scene nodes
    workflow.scenes.forEach((scene, index) => {
      const sceneId = scene.id;

      // T2I Node (scene node)
      const t2iNodeId = `t2i-${sceneId}`;
      generatedNodes.push({
        id: t2iNodeId,
        type: "t2i",
        position: { x: colX.scenes, y: yPos },
        data: {
          label: `Scene ${index + 1}`,
          prompt: scene.description,
          model: scene.t2iModel || "fal-ai/flux-dev",
          credits: scene.t2iCredits || 0.25,
          sceneIndex: index + 1,
          onModelChange: handleModelChange,
          onPromptChange: handlePromptChange,
        },
      });

      // Edge from prompt to scene
      generatedEdges.push({
        id: `prompt-${t2iNodeId}`,
        source: "prompt-node",
        target: t2iNodeId,
        animated: true,
        style: { stroke: "#3b82f6", strokeWidth: 2 },
      });

      // I2V Node (video node)
      const i2vNodeId = `i2v-${sceneId}`;
      generatedNodes.push({
        id: i2vNodeId,
        type: "i2v",
        position: { x: colX.videos, y: yPos },
        data: {
          label: `Video ${index + 1}`,
          duration: scene.duration,
          model: scene.t2vModel || "fal-ai/kling-v1",
          credits: scene.t2vCredits || (scene.duration * 0.8),
          sceneIndex: index + 1,
          onModelChange: handleModelChange,
        },
      });

      // Edge from T2I to I2V
      generatedEdges.push({
        id: `${t2iNodeId}-${i2vNodeId}`,
        source: t2iNodeId,
        target: i2vNodeId,
        animated: true,
        style: { stroke: "#10b981", strokeWidth: 2 },
      });

      yPos += sceneSpacing;
    });

    // TTS Node (if voiceover exists)
    if (workflow.voiceover) {
      const ttsNodeId = "tts";
      generatedNodes.push({
        id: ttsNodeId,
        type: "tts",
        position: { x: colX.audio, y: 200 },
        data: {
          label: "Voiceover",
          script: workflow.voiceover.script,
          voice: workflow.voiceover.voice || "female",
          model: workflow.voiceover.ttsModel || "elevenlabs/turbo-v2",
          credits: workflow.voiceover.ttsCredits || 0.5,
          onModelChange: handleModelChange,
        },
      });
    }

    // Merge Node
    const mergeNodeId = "merge";
    const mergeY = (yPos - sceneSpacing) / 2 + 100;
    generatedNodes.push({
      id: mergeNodeId,
      type: "merge",
      position: { x: colX.merge, y: mergeY },
      data: {
        label: "Final Output",
        totalDuration: workflow.totalDurationSeconds,
        sceneCount: workflow.scenes.length,
        credits: workflow.mergeCredits || 0.1,
        hasVoiceover: !!workflow.voiceover,
      },
    });

    // Connect all I2V nodes to Merge (多条线汇聚)
    workflow.scenes.forEach((scene) => {
      const i2vNodeId = `i2v-${scene.id}`;
      generatedEdges.push({
        id: `${i2vNodeId}-merge`,
        source: i2vNodeId,
        target: mergeNodeId,
        animated: true,
        style: { stroke: "#8b5cf6", strokeWidth: 2 },
      });
    });

    // Connect TTS to Merge (if exists)
    if (workflow.voiceover) {
      generatedEdges.push({
        id: "tts-merge",
        source: "tts",
        target: mergeNodeId,
        animated: true,
        style: { stroke: "#f59e0b", strokeWidth: 2 },
      });
    }

    setNodes(generatedNodes);
    setEdges(generatedEdges);
  }

  // Handle adding new node
  const handleAddNode = (nodeType: "t2i" | "i2v" | "tts" | "merge") => {
    const nodeId = `${nodeType}-${getUuid()}`;
    const position = { x: Math.random() * 500 + 100, y: Math.random() * 500 + 100 };

    let newNode: Node;

    switch (nodeType) {
      case "t2i":
        newNode = {
          id: nodeId,
          type: "t2i",
          position,
          data: {
            label: "New T2I",
            prompt: "Enter your prompt...",
            model: "fal-ai/flux-dev",
            credits: 0.25,
            sceneIndex: nodes.length + 1,
            onModelChange: handleModelChange,
            onPromptChange: handlePromptChange,
          },
        };
        break;
      case "i2v":
        newNode = {
          id: nodeId,
          type: "i2v",
          position,
          data: {
            label: "New I2V",
            duration: 5,
            model: "fal-ai/kling-v1",
            credits: 4.0,
            sceneIndex: nodes.length + 1,
            onModelChange: handleModelChange,
          },
        };
        break;
      case "tts":
        newNode = {
          id: nodeId,
          type: "tts",
          position,
          data: {
            label: "New TTS",
            script: "Enter your voiceover script...",
            voice: "female",
            model: "elevenlabs/turbo-v2",
            credits: 0.5,
            onModelChange: handleModelChange,
          },
        };
        break;
      case "merge":
        newNode = {
          id: nodeId,
          type: "merge",
          position,
          data: {
            label: "New Merge",
            totalDuration: 15,
            sceneCount: 3,
            credits: 0.1,
            hasVoiceover: false,
          },
        };
        break;
    }

    setNodes((nds) => [...nds, newNode]);
  };

  // Handle save workflow
  const handleSave = () => {
    // TODO: Implement save functionality
    alert("Save functionality coming soon!");
  };

  // Handle share workflow
  const handleShare = () => {
    const shareUrl = `${window.location.origin}/workspace/${runId}`;
    navigator.clipboard.writeText(shareUrl);
    alert(`Workflow URL copied to clipboard!\n${shareUrl}`);
  };

  // Handle model change in nodes
  const handleModelChange = (nodeId: string, newModel: string, newCredits: number) => {
    // Update node data
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              data: {
                ...node.data,
                model: newModel,
                credits: newCredits,
              },
            }
          : node
      )
    );

    // Recalculate total estimated credits
    if (run) {
      const updatedNodes = nodes.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, model: newModel, credits: newCredits } }
          : node
      );

      const totalCredits = updatedNodes.reduce((sum, node) => {
        if (node.data && typeof node.data.credits === 'number') {
          return sum + node.data.credits;
        }
        return sum;
      }, 0);

      setRun((prevRun) => ({
        ...prevRun!,
        estimated_credits: totalCredits,
      }));
    }
  };

  // Handle prompt change in nodes
  const handlePromptChange = (nodeId: string, newPrompt: string) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              data: {
                ...node.data,
                prompt: newPrompt,
              },
            }
          : node
      )
    );
  };

  // Handle nodes delete - recalculate credits
  const handleNodesDelete = (deleted: Node[]) => {
    if (run) {
      // Calculate total credits after deletion
      const remainingNodes = nodes.filter(
        (node) => !deleted.find((d) => d.id === node.id)
      );

      const totalCredits = remainingNodes.reduce((sum, node) => {
        if (node.data && typeof node.data.credits === 'number') {
          return sum + node.data.credits;
        }
        return sum;
      }, 0);

      setRun((prevRun) => ({
        ...prevRun!,
        estimated_credits: totalCredits,
      }));
    }
  };

  const handleExecute = async () => {
    if (!run) return;

    setIsExecuting(true);

    try {
      // Use run.run_uuid instead of params.runId to handle URL update timing
      const response = await fetch(`/api/runs/${run.run_uuid}/execute`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to execute workflow");
      }

      // Handle SSE stream
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("Response body is not readable");
      }

      let buffer = "";
      let currentEvent = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");

        // Keep the last incomplete line in the buffer
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("event:")) {
            currentEvent = line.substring(6).trim();
            continue;
          }

          if (line.startsWith("data:")) {
            const dataStr = line.substring(5).trim();
            if (!dataStr) continue;

            try {
              const data = JSON.parse(dataStr);
              await handleExecutionEvent(currentEvent || "message", data);
            } catch (e) {
              console.error("Failed to parse SSE data:", dataStr, e);
            }
          }
        }
      }
    } catch (err: any) {
      console.error("Execution error:", err);
      alert(`Execution failed: ${err.message}`);
    } finally {
      setIsExecuting(false);
    }
  };

  // Handle execution SSE events
  async function handleExecutionEvent(eventType: string, data: any) {
    console.log("Execution Event:", eventType, data);

    switch (eventType) {
      case "execution_start":
        console.log("Execution started:", data);
        break;

      case "node_start":
        // Update node status to 'running'
        setNodes((nds) =>
          nds.map((node) =>
            node.id === data.nodeId
              ? { ...node, data: { ...node.data, status: "running" } }
              : node
          )
        );
        break;

      case "node_complete":
        // Update node status to 'completed' with artifact URLs
        setNodes((nds) =>
          nds.map((node) =>
            node.id === data.nodeId
              ? {
                  ...node,
                  data: {
                    ...node.data,
                    status: "completed",
                    artifactUrl: data.artifactUrl,
                    thumbnailUrl: data.thumbnailUrl,
                  },
                }
              : node
          )
        );
        break;

      case "node_error":
        // Update node status to 'failed'
        setNodes((nds) =>
          nds.map((node) =>
            node.id === data.nodeId
              ? {
                  ...node,
                  data: { ...node.data, status: "failed", error: data.error },
                }
              : node
          )
        );
        break;

      case "workflow_complete":
        setIsExecuting(false);
        alert(`Workflow completed! Final video: ${data.finalVideoUrl}`);
        break;

      case "error":
        setIsExecuting(false);
        alert(`Error: ${data.message}`);
        break;
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-gray-600">Loading workspace...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="text-xl text-red-600 mb-4">{error}</div>
        <button
          onClick={() => router.push("/")}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Back to Home
        </button>
      </div>
    );
  }

  // During generation, show canvas with nodes appearing progressively
  if (isGenerating) {
    return (
      <div className="h-screen flex flex-col">
        {/* Header */}
        <header className="border-b border-gray-200 bg-white px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AI Workflow Generation</h1>
            <p className="text-sm text-gray-600">{progressMessage}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <span className="text-sm text-gray-600">Generating...</span>
          </div>
        </header>

        {/* Canvas - nodes appear progressively */}
        <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={false}
          >
            <CanvasContent
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              isGenerating={isGenerating}
            />
          </ReactFlow>
        </div>
      </div>
    );
  }

  if (!run) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="text-xl text-red-600 mb-4">Run not found</div>
        <button
          onClick={() => router.push("/")}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Workflow Canvas</h1>
          <p className="text-sm text-gray-600">
            AI-generated workflow • Run ID: {runId.substring(0, 8)}...
          </p>
        </div>

        {/* Toolbar moved to header */}
        <div className="flex items-center gap-3">
          {/* Quick Add Nodes */}
          <div className="flex items-center gap-1 pr-3 border-r border-gray-200">
            <button
              onClick={() => handleAddNode("t2i")}
              className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-700 rounded-lg transition flex items-center gap-1"
              title="Add T2I Node"
            >
              <span>🎨</span>
              <span>T2I</span>
            </button>
            <button
              onClick={() => handleAddNode("i2v")}
              className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-green-50 hover:text-green-700 rounded-lg transition flex items-center gap-1"
              title="Add I2V Node"
            >
              <span>🎬</span>
              <span>I2V</span>
            </button>
            <button
              onClick={() => handleAddNode("tts")}
              className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-700 rounded-lg transition flex items-center gap-1"
              title="Add TTS Node"
            >
              <span>🎙️</span>
              <span>TTS</span>
            </button>
          </div>

          {/* Cost Display */}
          <div className="text-right pr-3 border-r border-gray-200">
            <div className="text-xs text-gray-500">Estimated Cost</div>
            <div className="text-lg font-bold text-blue-700">
              {run.estimated_credits.toFixed(1)} credits
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleExecute}
            disabled={isExecuting || run.status === RunStatus.Running}
            className={`px-6 py-3 text-lg font-semibold rounded-lg transition ${
              isExecuting || run.status === RunStatus.Running
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
            }`}
          >
            {isExecuting ? "Executing..." : "▶️ Generate Video"}
          </button>
        </div>
      </header>

      {/* Canvas */}
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodesDelete={handleNodesDelete}
          nodesDeletable={true}
          fitView
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>
    </div>
  );
}
