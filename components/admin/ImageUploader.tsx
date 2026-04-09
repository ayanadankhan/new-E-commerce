// UI: Drag-and-drop style upload area using Uploadthing for product imagery.

"use client";

import { UploadDropzone } from "@/lib/uploadthing-components";
import { toast } from "sonner";

export interface ImageUploaderProps {
  onUploaded: (urls: string[]) => void;
}

export function ImageUploader({ onUploaded }: ImageUploaderProps) {
  return (
    <UploadDropzone
      endpoint="productImages"
      onClientUploadComplete={(res) => {
        const urls = res.map((f) => f.url);
        onUploaded(urls);
        toast.success("Images uploaded");
      }}
      onUploadError={(e) => {
        toast.error(e.message);
      }}
      appearance={{
        container: "border border-dashed rounded-lg p-6 bg-muted/30",
        button: "ut-ready:bg-primary ut-uploading:cursor-not-allowed",
      }}
    />
  );
}
