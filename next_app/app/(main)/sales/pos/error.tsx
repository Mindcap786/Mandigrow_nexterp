"use client";

import { ErrorBoundary } from "@/components/error-boundary";
import React from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorBoundary>
      <ThrowError error={error} />
    </ErrorBoundary>
  );
}

function ThrowError({ error }: { error: Error }) {
  React.useEffect(() => {
    throw error;
  }, [error]);
  return null;
}
