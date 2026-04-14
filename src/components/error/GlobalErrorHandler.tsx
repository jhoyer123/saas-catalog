"use client";

import { useEffect } from "react";

export default function GlobalErrorHandler() {
  useEffect(() => {
    const handler = (event: any) => {
      if (
        event?.reason?.name === "ChunkLoadError" ||
        event?.message?.includes("ChunkLoadError")
      ) {
        window.location.reload();
      }
    };

    window.addEventListener("error", handler);
    window.addEventListener("unhandledrejection", handler);

    return () => {
      window.removeEventListener("error", handler);
      window.removeEventListener("unhandledrejection", handler);
    };
  }, []);

  return null;
}
