"use client";

import type { AIReview } from "@/app/types";
import { AIReviewDisplay } from "./AIReviewDisplay";

interface AIReviewDisplayClientProps {
  review: AIReview;
}

export function AIReviewDisplayClient({ review }: AIReviewDisplayClientProps) {
  return <AIReviewDisplay review={review} defaultExpanded={false} />;
}
