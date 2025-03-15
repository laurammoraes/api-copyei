import { Server } from "socket.io";

let io;

export function startWebsocket(server) {
  io = new Server(Number(process.env.WEBSOCKET_PORT) || 3334, {
    cors: {
      origin: process.env.APP_BASE_URL,
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    if (process.env.NODE_ENV === "development")
      console.log(`Usuário conectado: ${socket.id}`);

    socket.on("join", (taskId) => {
      socket.join(taskId);
    });
  });
}

export async function updateLoadingState(website) {
  if (io) {
    io.to(`uploading-${website}`).emit("update-loading-state", website);
  }
}

export async function emitUploadError(website, errorMessage) {
  if (io) {
    io.to(`uploading-${website}`).emit("upload-error", { website, error: 'Não foi possível realizar o upload dessa página, tente outra' });
  }
}
