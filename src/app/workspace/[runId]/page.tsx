"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
} from "reactflow";
import "reactflow/dist/style.css";

import type { WorkflowPlan } from "@/services/ai-planner";

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

export default function WorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const runId = params.runId as string;

  const [run, setRun] = useState<Run | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Fetch run data
  useEffect(() => {
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

    if (runId) {
      fetchRun();
    }
  }, [runId]);

  // Generate React Flow nodes and edges from WorkflowPlan
  function generateNodesAndEdges(workflow: WorkflowPlan) {
    const generatedNodes: Node[] = [];
    const generatedEdges: Edge[] = [];

    const nodeSpacing = 200;
    let yPos = 100;

    // Create nodes for each scene (T2I -> I2V)
    workflow.scenes.forEach((scene, index) => {
      const sceneId = scene.id;

      // T2I Node
      const t2iNodeId = `t2i-${sceneId}`;
      generatedNodes.push({
        id: t2iNodeId,
        type: "default",
        position: { x: 100, y: yPos },
        data: {
          label: `🎨 Scene ${index + 1}: T2I\n"${scene.description.substring(0, 40)}..."`,
        },
      });

      // I2V Node
      const i2vNodeId = `i2v-${sceneId}`;
      generatedNodes.push({
        id: i2vNodeId,
        type: "default",
        position: { x: 400, y: yPos },
        data: {
          label: `🎬 Scene ${index + 1}: I2V\nDuration: ${scene.duration}s`,
        },
      });

      // Edge: T2I -> I2V
      generatedEdges.push({
        id: `${t2iNodeId}-${i2vNodeId}`,
        source: t2iNodeId,
        target: i2vNodeId,
      });

      yPos += nodeSpacing;
    });

    // TTS Node (if voiceover exists)
    if (workflow.voiceover) {
      const ttsNodeId = "tts";
      generatedNodes.push({
        id: ttsNodeId,
        type: "default",
        position: { x: 700, y: 100 },
        data: {
          label: `🎙️ Voiceover\n"${workflow.voiceover.script.substring(0, 40)}..."`,
        },
      });
    }

    // Merge Node
    const mergeNodeId = "merge";
    generatedNodes.push({
      id: mergeNodeId,
      type: "default",
      position: { x: 400, y: yPos },
      data: {
        label: `🎞️ Final Merge\nEstimated: ${workflow.estimatedCredits.toFixed(1)} credits`,
      },
    });

    // Connect last I2V to Merge
    if (workflow.scenes.length > 0) {
      const lastScene = workflow.scenes[workflow.scenes.length - 1];
      generatedEdges.push({
        id: `i2v-${lastScene.id}-merge`,
        source: `i2v-${lastScene.id}`,
        target: mergeNodeId,
      });
    }

    // Connect TTS to Merge (if exists)
    if (workflow.voiceover) {
      generatedEdges.push({
        id: "tts-merge",
        source: "tts",
        target: mergeNodeId,
      });
    }

    setNodes(generatedNodes);
    setEdges(generatedEdges);
  }

  const handleExecute = async () => {
    if (!run) return;

    setIsExecuting(true);

    try {
      const response = await fetch(`/api/runs/${runId}/execute`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to execute workflow");
      }

      const result = await response.json();
      alert(`Workflow execution started! Run UUID: ${result.runUuid}`);

      // Poll for status updates
      // TODO: Implement WebSocket or polling
    } catch (err: any) {
      alert(`Execution failed: ${err.message}`);
    } finally {
      setIsExecuting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-gray-600">Loading workspace...</div>
      </div>
    );
  }

  if (error || !run) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="text-xl text-red-600 mb-4">
          {error || "Run not found"}
        </div>
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
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm text-gray-600">Estimated Cost</div>
            <div className="text-xl font-bold text-blue-700">
              {run.estimated_credits.toFixed(1)} credits
            </div>
          </div>
          <button
            onClick={handleExecute}
            disabled={isExecuting || run.status !== RunStatus.Pending}
            className={`px-6 py-3 text-lg font-semibold rounded-lg transition ${
              isExecuting || run.status !== RunStatus.Pending
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
            }`}
          >
            {isExecuting ? "Executing..." : "▶️ Generate Video"}
          </button>
        </div>
      </header>

      {/* Canvas */}
      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
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
