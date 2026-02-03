import { createSafeActionClient } from "next-safe-action";
import { z } from "zod";

export const actionClient = createSafeActionClient({
  handleServerError(e) {
    console.error("Action error:", e);
    return {
      serverError: e instanceof Error ? e.message : "An error occurred",
    };
  },
});
