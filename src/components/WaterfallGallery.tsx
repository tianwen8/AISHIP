"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface VideoCard {
  id: string;
  videoUrl: string;
  thumbnailUrl: string;
  prompt: string;
  duration: number;
  createdAt: string;
  userName?: string;
  userAvatar?: string;
  likes?: number;
}

export function WaterfallGallery() {
  const [videos, setVideos] = useState<VideoCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Fetch featured/public videos
    fetch("/api/gallery/featured")
      .then((res) => res.json())
      .then((data) => {
        if (data.code === 0 && data.data) {
          setVideos(data.data.videos || []);
        }
      })
      .catch((err) => {
        console.error("Failed to load gallery:", err);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleUseTemplate = (video: VideoCard) => {
    // Pre-fill the prompt and redirect to homepage
    const currentUrl = new URL(window.location.href);
    currentUrl.pathname = "/";
    currentUrl.searchParams.set("prompt", video.prompt);
    router.push(currentUrl.toString());
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          Community Creations
        </h2>
        <p className="text-lg text-gray-600">
          See what others are creating with AI Video Studio
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading amazing videos...</p>
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🎬</div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-2">
            No videos yet
          </h3>
          <p className="text-gray-600 mb-6">
            Be the first to create amazing AI videos!
          </p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition"
          >
            Create Your First Video
          </button>
        </div>
      ) : (
        <>
          {/* Masonry Grid - CSS columns for waterfall effect */}
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4">
            {videos.map((video) => (
              <div
                key={video.id}
                className="break-inside-avoid mb-4"
              >
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 group">
                  {/* Video Thumbnail */}
                  <div className="aspect-[9/16] bg-gray-900 relative overflow-hidden">
                    <video
                      src={video.videoUrl}
                      poster={video.thumbnailUrl}
                      className="w-full h-full object-cover"
                      loop
                      muted
                      playsInline
                      onMouseEnter={(e) => {
                        e.currentTarget.play().catch(() => {
                          // Ignore play errors (autoplay restrictions)
                        });
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.pause();
                        e.currentTarget.currentTime = 0;
                      }}
                    />

                    {/* Play overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform scale-75 group-hover:scale-100">
                        <span className="text-2xl ml-1">▶️</span>
                      </div>
                    </div>

                    {/* Duration badge */}
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                      {video.duration}s
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    {/* Prompt */}
                    <p className="text-sm text-gray-700 mb-3 line-clamp-2 leading-relaxed">
                      {video.prompt}
                    </p>

                    {/* User info */}
                    {video.userName && (
                      <div className="flex items-center gap-2 mb-3">
                        {video.userAvatar ? (
                          <img
                            src={video.userAvatar}
                            alt={video.userName}
                            className="w-6 h-6 rounded-full border border-gray-200"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-semibold">
                            {video.userName.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span className="text-xs text-gray-500 truncate">{video.userName}</span>
                      </div>
                    )}

                    {/* Actions */}
                    <button
                      onClick={() => handleUseTemplate(video)}
                      className="w-full py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                      Use as Template
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Load More */}
          {videos.length >= 12 && (
            <div className="text-center mt-12">
              <button className="px-8 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:border-gray-400 hover:bg-gray-50 transition">
                Load More Creations
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
