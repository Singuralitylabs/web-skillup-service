"use client";

import YouTube, { type YouTubeProps } from "react-youtube";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface YouTubeEmbedProps {
  url: string;
  className?: string;
}

function extractVideoId(url: string): string | null {
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
      <Card className={cn("bg-muted", className)}>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">動画を読み込めませんでした</p>
          <p className="text-sm text-muted-foreground mt-2">URL: {url}</p>
        </CardContent>
      </Card>
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
    <div className={cn("aspect-video w-full", className)}>
      <YouTube
        videoId={videoId}
        opts={opts}
        className="w-full h-full"
        iframeClassName="w-full h-full rounded-xl"
      />
    </div>
  );
}
