"use client";

import { useState } from "react";

export default function TestShotstackPage() {
  const [video1Url, setVideo1Url] = useState("");
  const [video2Url, setVideo2Url] = useState("");
  const [duration1, setDuration1] = useState(5);
  const [duration2, setDuration2] = useState(5);
  const [audioUrl, setAudioUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTest = async () => {
    if (!video1Url || !video2Url) {
      alert("Please provide both video URLs");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/test/merge-videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videos: [
            { url: video1Url, duration: duration1, hasAudio: false },
            { url: video2Url, duration: duration2, hasAudio: false },
          ],
          audioUrl: audioUrl || undefined,
          transitions: { type: "fade", duration: 0.5 },
          output: {
            format: "mp4",
            resolution: "hd",
            fps: 30,
            quality: "high",
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Merge failed");
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      console.error("Test error:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          🎬 Shotstack Video Merge Test
        </h1>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Configuration</h2>

          {/* Video 1 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Video 1 URL
            </label>
            <input
              type="text"
              value={video1Url}
              onChange={(e) => setVideo1Url(e.target.value)}
              placeholder="https://example.com/video1.mp4"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="mt-2">
              <label className="block text-xs text-gray-600 mb-1">
                Duration (seconds)
              </label>
              <input
                type="number"
                value={duration1}
                onChange={(e) => setDuration1(Number(e.target.value))}
                min={1}
                max={60}
                className="w-24 px-2 py-1 border border-gray-300 rounded-md text-sm"
              />
            </div>
          </div>

          {/* Video 2 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Video 2 URL
            </label>
            <input
              type="text"
              value={video2Url}
              onChange={(e) => setVideo2Url(e.target.value)}
              placeholder="https://example.com/video2.mp4"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="mt-2">
              <label className="block text-xs text-gray-600 mb-1">
                Duration (seconds)
              </label>
              <input
                type="number"
                value={duration2}
                onChange={(e) => setDuration2(Number(e.target.value))}
                min={1}
                max={60}
                className="w-24 px-2 py-1 border border-gray-300 rounded-md text-sm"
              />
            </div>
          </div>

          {/* Optional Audio */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Audio URL (Optional)
            </label>
            <input
              type="text"
              value={audioUrl}
              onChange={(e) => setAudioUrl(e.target.value)}
              placeholder="https://example.com/audio.mp3 (optional)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Test Button */}
          <button
            onClick={handleTest}
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
          >
            {isLoading ? "🔄 Merging Videos..." : "🎬 Merge Videos"}
          </button>
        </div>

        {/* Sample URLs */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">
            📝 Sample Video URLs (for testing)
          </h3>
          <p className="text-xs text-blue-700 mb-2">
            You can use these Shotstack official sample videos:
          </p>
          <div className="space-y-2 text-xs">
            <div>
              <strong>Sample 1 (Ocean waves):</strong>
              <br />
              <code className="bg-white px-2 py-1 rounded text-blue-600 break-all">
                https://shotstack-assets.s3-ap-southeast-2.amazonaws.com/footage/beach-overhead.mp4
              </code>
              <button
                onClick={() => {
                  setVideo1Url(
                    "https://shotstack-assets.s3-ap-southeast-2.amazonaws.com/footage/beach-overhead.mp4"
                  );
                  setDuration1(10);
                }}
                className="ml-2 text-blue-600 hover:underline"
              >
                Use as Video 1
              </button>
            </div>
            <div>
              <strong>Sample 2 (City traffic):</strong>
              <br />
              <code className="bg-white px-2 py-1 rounded text-blue-600 break-all">
                https://shotstack-assets.s3-ap-southeast-2.amazonaws.com/footage/city-timelapse.mp4
              </code>
              <button
                onClick={() => {
                  setVideo2Url(
                    "https://shotstack-assets.s3-ap-southeast-2.amazonaws.com/footage/city-timelapse.mp4"
                  );
                  setDuration2(10);
                }}
                className="ml-2 text-blue-600 hover:underline"
              >
                Use as Video 2
              </button>
            </div>
            <div className="mt-3 pt-3 border-t border-blue-300">
              <strong>💡 Alternative sources:</strong>
              <ul className="list-disc list-inside text-blue-700 mt-1 space-y-1">
                <li>Pexels: <a href="https://www.pexels.com/videos/" target="_blank" className="underline">pexels.com/videos</a> (right-click video → Copy video address)</li>
                <li>Coverr: <a href="https://coverr.co/" target="_blank" className="underline">coverr.co</a> (free stock videos)</li>
                <li>Any public MP4 URL that's directly accessible</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Loading Status */}
        {isLoading && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-yellow-800">
              ⏳ Submitting to Shotstack and waiting for render completion...
            </p>
            <p className="text-sm text-yellow-600 mt-2">
              This may take 1-5 minutes depending on the stage environment queue.
            </p>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h3 className="text-red-900 font-semibold mb-2">❌ Error</h3>
            <pre className="text-sm text-red-700 whitespace-pre-wrap break-words">
              {error}
            </pre>
          </div>
        )}

        {/* Success Result */}
        {result && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-green-900 font-semibold mb-4">✅ Merge Successful!</h3>

            {/* Video Player */}
            <div className="mb-4">
              <video
                src={result.finalVideoUrl}
                controls
                className="w-full rounded-lg shadow-lg"
              >
                Your browser does not support the video tag.
              </video>
            </div>

            {/* Result Details */}
            <div className="bg-white rounded p-4 text-sm space-y-2">
              <div>
                <strong>Final Video URL:</strong>
                <br />
                <a
                  href={result.finalVideoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline break-all"
                >
                  {result.finalVideoUrl}
                </a>
              </div>
              <div>
                <strong>Duration:</strong> {result.duration}s
              </div>
              <div>
                <strong>Resolution:</strong> {result.width}x{result.height}
              </div>
              <div>
                <strong>Render ID:</strong> {result.metadata?.renderId}
              </div>
              <div>
                <strong>Render Time:</strong> {(result.metadata?.renderTime / 1000).toFixed(1)}s
              </div>
              <div>
                <strong>Clip Count:</strong> {result.metadata?.clipCount}
              </div>
            </div>

            {/* Download Button */}
            <a
              href={result.finalVideoUrl}
              download="merged_video.mp4"
              className="mt-4 inline-block bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
            >
              📥 Download Video
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
