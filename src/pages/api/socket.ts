import { Server, Socket } from "socket.io";
import type { NextApiRequest, NextApiResponse } from "next";

// Define a custom NextApiResponse to type the socket server attachment
type NextApiResponseWithSocket = NextApiResponse & {
  socket: {
    server: any;
  };
};

export default function SocketHandler(
  req: NextApiRequest,
  res: NextApiResponseWithSocket,
) {
  // If the server is already running, skip initialization
  if (res.socket.server.io) {
    console.log("Socket is already running");
  } else {
    console.log("Socket is initializing");
    const io = new Server(res.socket.server, {
      path: "/api/socket_io",
      addTrailingSlash: false,
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });

    // Attach the Socket.io server to the Next.js server instance
    res.socket.server.io = io;

    // A simple Set to track unique connection IDs
    const connectedUsers = new Set<string>();

    io.on("connection", (socket: Socket) => {
      connectedUsers.add(socket.id);

      // When a manager connects, they'll join a specific room or we can just broadcast globally.
      // For simplicity, we can broadcast the count to everyone, but only managers will listen.
      io.emit("active_users_count", connectedUsers.size);

      // We can set up an interval to broadcast the count every second.
      // To avoid multiple intervals overwriting each other, we can track them per socket
      // or just trust the connection/disconnect events.
      // Broadcasting directly on connect/disconnect is often enough unless we want a
      // strict 1-second heartbeat. A strict heartbeat is good for real-time graphs.
      const broadcastInterval = setInterval(() => {
        io.emit("active_users_count", connectedUsers.size);
      }, 1000);

      socket.on("disconnect", () => {
        connectedUsers.delete(socket.id);
        io.emit("active_users_count", connectedUsers.size);
        clearInterval(broadcastInterval);
      });
    });
  }
  res.end();
}
