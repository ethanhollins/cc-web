"use client";

import { useCallback, useEffect, useMemo } from "react";
import { type WebSocketMessage, useWebSocket } from "@/lib/websocket-provider";

export interface UseWebSocketMessagesOptions {
  messageType?: string;
  autoConnect?: boolean;
}

export function useWebSocketMessages<T = unknown>(handler?: (message: WebSocketMessage<T>) => void, options: UseWebSocketMessagesOptions = {}) {
  const { lastMessage, connect, disconnect, connectionState, isConnected } = useWebSocket();

  useEffect(() => {
    if (options.autoConnect !== false) {
      connect();
      return () => {
        disconnect();
      };
    }
  }, [connect, disconnect, options.autoConnect]);

  useEffect(() => {
    if (!lastMessage || !handler) {
      return;
    }

    if (options.messageType && lastMessage.type !== options.messageType) {
      return;
    }

    handler(lastMessage as WebSocketMessage<T>);
  }, [lastMessage, handler, options.messageType]);

  return {
    lastMessage,
    connect,
    disconnect,
    connectionState,
    isConnected,
  };
}

export function useWebSocketSender() {
  const { sendMessage, isConnected, connectionState } = useWebSocket();

  const send = useCallback(
    (message: unknown): boolean => {
      return sendMessage(message);
    },
    [sendMessage],
  );

  return useMemo(
    () => ({
      send,
      isConnected,
      connectionState,
    }),
    [send, isConnected, connectionState],
  );
}

export function useWebSocketConnection() {
  const { connectionState, connect, disconnect, isConnected } = useWebSocket();

  return {
    connectionState,
    connect,
    disconnect,
    isConnected,
  };
}
