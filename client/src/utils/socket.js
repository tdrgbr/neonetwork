import { io } from "socket.io-client";
import { DOMAIN } from "./config";

export const socket = io(DOMAIN, {
  withCredentials: true,
  transports: ["websocket"],
});
