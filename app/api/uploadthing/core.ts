import { createUploadthing, type FileRouter } from "uploadthing/next";
import { z } from "zod";
import { getOwnerFromCookieHeader } from "@/lib/auth";

const f = createUploadthing();

export const ourFileRouter = {
  villaDocuments: f({
    "application/pdf": { maxFileSize: "8MB" },
    "image/jpeg": { maxFileSize: "8MB" },
    "image/png": { maxFileSize: "8MB" },
  })
    .middleware(async ({ req }) => {
      const cookieHeader = req.headers.get("cookie");
      const session = getOwnerFromCookieHeader(cookieHeader);
      if (!session) throw new Error("NOT_AUTHENTICATED");
      return { ownerId: session.ownerId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.ownerId, url: file.url };
    }),
  ownerIdentity: f({
    "image/jpeg": { maxFileSize: "4MB" },
    "image/png": { maxFileSize: "4MB" },
    "application/pdf": { maxFileSize: "4MB" },
  })
    .input(z.object({ ownerId: z.string() }))
    .middleware(async ({ req }) => {
      const cookieHeader = req.headers.get("cookie");
      const session = getOwnerFromCookieHeader(cookieHeader);
      if (!session) throw new Error("NOT_AUTHENTICATED");
      return { ownerId: session.ownerId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.ownerId, url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
