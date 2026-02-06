"use client";

import YouTube, { type YouTubeProps } from "react-youtube";

interface YouTubeEmbedProps {
  url: string;
  className?: string;
}

function extractVideoId(url: string): string | null {
  // 対応パターン:
  // - https://www.youtube.com/watch?v=VIDEO_ID
  // - https://youtu.be/VIDEO_ID
  // - https://www.youtube.com/embed/VIDEO_ID
  const patterns = [/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) {
      return match[1];
    }
  }

  return null;
}

export function YouTubeEmbed({ url, className }: YouTubeEmbedProps) {
  const videoId = extractVideoId(url);

  if (!videoId) {
    return (
      <div className={`bg-muted rounded-lg p-8 text-center ${className}`}>
        <p className="text-muted-foreground">動画を読み込めませんでした</p>
        <p className="text-sm text-muted-foreground mt-2">URL: {url}</p>
      </div>
    );
  }

  const opts: YouTubeProps["opts"] = {
    width: "100%",
    height: "100%",
    playerVars: {
      autoplay: 0,
      modestbranding: 1,
      rel: 0,
    },
  };

  return (
    <div className={`aspect-video w-full ${className}`}>
      <YouTube
        videoId={videoId}
        opts={opts}
        className="w-full h-full"
        iframeClassName="w-full h-full rounded-lg"
      />
    </div>
  );
}
