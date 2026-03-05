"use client";

import { useEffect } from "react";
import { io } from "socket.io-client";

export function TrackingProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // We only need to connect to let the server know a user is here
    // The socket auto-connects and auto-disconnects on unmount/close

    // Check if we are running on the client
    if (typeof window !== "undefined") {
      fetch("/api/socket").finally(() => {
        const socket = io({
          path: "/api/socket_io",
          addTrailingSlash: false,
        });

        // Cleanup on unmount
        return () => {
          socket.disconnect();
        };
      });
    }
  }, []);

  return <>{children}</>;
}
