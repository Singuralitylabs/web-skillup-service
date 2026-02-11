"use client";

import type { AIReview } from "@/app/types";
import { AIReviewDisplay } from "./AIReviewDisplay";

interface AIReviewDisplayServerProps {
  review: AIReview;
}

export function AIReviewDisplayServer({ review }: AIReviewDisplayServerProps) {
  return <AIReviewDisplay review={review} defaultExpanded={false} />;
}
