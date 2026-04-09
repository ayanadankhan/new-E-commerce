// PURPOSE: Client-side Uploadthing dropzone wired to the server file router types.

"use client";

import { generateUploadDropzone } from "@uploadthing/react";
import type { OurFileRouter } from "@/lib/uploadthing";

export const UploadDropzone = generateUploadDropzone<OurFileRouter>();
