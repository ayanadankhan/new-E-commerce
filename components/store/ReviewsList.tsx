// UI: Static sample reviews with star ratings for the product detail tab.

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

const SAMPLE = [
  { author: "Alex M.", rating: 5, text: "Excellent quality and quick shipping." },
  { author: "Jordan K.", rating: 4, text: "Great value. Packaging could be better." },
  { author: "Sam R.", rating: 5, text: "Would buy again — highly recommend." },
];

export function ReviewsList() {
  return (
    <ul className="space-y-6">
      {SAMPLE.map((r) => (
        <li key={r.author} className="border-b border-border pb-6 last:border-0">
          <div className="flex items-center gap-2">
            <span className="font-medium">{r.author}</span>
            <span className="flex text-amber-400" aria-label={`${r.rating} out of 5 stars`}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-4 w-4",
                    i < r.rating ? "text-amber-400" : "text-muted-foreground/35"
                  )}
                  fill={i < r.rating ? "currentColor" : "none"}
                />
              ))}
            </span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{r.text}</p>
        </li>
      ))}
    </ul>
  );
}
