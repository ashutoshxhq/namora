import { BASE_WS_URL } from "web-sockets/constants";

const isBrowser = typeof window !== "undefined";
export const webSocket = isBrowser ? new WebSocket(BASE_WS_URL) : null;
