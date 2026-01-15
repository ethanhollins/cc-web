"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { type WebSocketMessage, useWebSocket } from "@/lib/websocket-provider";

export interface UseWebSocketMessagesOptions {
  messageType?: string;
  autoConnect?: boolean;
}

export function useWebSocketMessages<T = unknown>(handler?: (message: WebSocketMessage<T>) => void, options: UseWebSocketMessagesOptions = {}) {
  const { lastMessage, connect, disconnect, connectionState, isConnected, addMessageListener } = useWebSocket();

  // Use ref to avoid recreating the listener on every render
  const handlerRef = useRef(handler);
  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    if (options.autoConnect !== false) {
      connect();
      return () => {
        disconnect();
      };
    }
  }, [connect, disconnect, options.autoConnect]);

  useEffect(() => {
    if (!handlerRef.current) {
      return;
    }

    // Subscribe to messages via the listener pattern (no rerenders!)
    const unsubscribe = addMessageListener((message) => {
      if (options.messageType && message.type !== options.messageType) {
        return;
      }

      handlerRef.current?.(message as WebSocketMessage<T>);
    });

    return unsubscribe;
  }, [addMessageListener, options.messageType]);

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
