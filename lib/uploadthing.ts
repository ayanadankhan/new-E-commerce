// PURPOSE: Uploadthing file router for product images and server/client helpers.

import { createUploadthing, type FileRouter } from "uploadthing/server";

const f = createUploadthing();

export const ourFileRouter = {
  productImages: f({
    image: { maxFileSize: "8MB", maxFileCount: 10 },
  })
    .middleware(async () => {
      return {};
    })
    .onUploadComplete(async ({ file }) => {
      return { url: file.url };
    }),
  storeLogo: f({
    image: { maxFileSize: "4MB", maxFileCount: 1 },
  })
    .middleware(async () => ({}))
    .onUploadComplete(async ({ file }) => ({ url: file.url })),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
