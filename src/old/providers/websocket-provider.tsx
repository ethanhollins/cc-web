"use client";

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

export type WebSocketMessage = {
  type: string;
  data: any;
  timestamp: number;
};

export type WebSocketConnectionState = "connecting" | "connected" | "disconnected" | "reconnecting" | "error";

export interface WebSocketContextType {
  connectionState: WebSocketConnectionState;
  lastMessage: WebSocketMessage | null;
  sendMessage: (message: any) => boolean;
  connect: () => void;
  disconnect: () => void;
  isConnected: boolean;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

interface WebSocketProviderProps {
  children: React.ReactNode;
  url?: string;
  autoConnect?: boolean;
  maxReconnectAttempts?: number;
  reconnectInterval?: number;
}

const DEFAULT_WS_URL = "wss://0lb3xuz9nj.execute-api.ap-southeast-2.amazonaws.com/dev/";
const DEFAULT_MAX_RECONNECT_ATTEMPTS = 5;
const DEFAULT_RECONNECT_INTERVAL = 3000;

export function WebSocketProvider({
  children,
  url = DEFAULT_WS_URL,
  autoConnect = true,
  maxReconnectAttempts = DEFAULT_MAX_RECONNECT_ATTEMPTS,
  reconnectInterval = DEFAULT_RECONNECT_INTERVAL,
}: WebSocketProviderProps) {
  const [connectionState, setConnectionState] = useState<WebSocketConnectionState>("disconnected");
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);

  const websocketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const isManualDisconnectRef = useRef(false);

  const clearReconnectTimeout = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  const connect = useCallback(() => {
    // Don't create multiple connections
    if (websocketRef.current?.readyState === WebSocket.CONNECTING || websocketRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      setConnectionState("connecting");
      isManualDisconnectRef.current = false;

      const ws = new WebSocket(url);
      websocketRef.current = ws;

      ws.onopen = () => {
        console.log("WebSocket connected to", url);
        setConnectionState("connected");
        reconnectAttemptsRef.current = 0;
        clearReconnectTimeout();
      };

      ws.onmessage = (event) => {
        console.log("WebSocket message received:", event.data);
        try {
          let messageData;
          try {
            messageData = JSON.parse(event.data);
          } catch {
            // If it's not JSON, treat it as plain text
            messageData = { message: event.data };
          }

          const message: WebSocketMessage = {
            type: messageData.type || "message",
            data: messageData,
            timestamp: Date.now(),
          };

          setLastMessage(message);
        } catch (error) {
          console.error("Error processing WebSocket message:", error);
        }
      };

      ws.onclose = (event) => {
        console.log("WebSocket disconnected:", event.code, event.reason);

        if (!isManualDisconnectRef.current && reconnectAttemptsRef.current < maxReconnectAttempts) {
          setConnectionState("reconnecting");
          reconnectAttemptsRef.current++;

          console.log(`Attempting to reconnect (${reconnectAttemptsRef.current}/${maxReconnectAttempts})...`);

          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        } else {
          setConnectionState("disconnected");
          if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
            console.error("Max reconnection attempts reached");
          }
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        setConnectionState("error");
      };
    } catch (error) {
      console.error("Failed to create WebSocket connection:", error);
      setConnectionState("error");
    }
  }, [url, maxReconnectAttempts, reconnectInterval, clearReconnectTimeout]);

  const disconnect = useCallback(() => {
    isManualDisconnectRef.current = true;
    clearReconnectTimeout();

    if (websocketRef.current) {
      websocketRef.current.close(1000, "Manual disconnect");
      websocketRef.current = null;
    }

    setConnectionState("disconnected");
    reconnectAttemptsRef.current = 0;
  }, [clearReconnectTimeout]);

  const sendMessage = useCallback((message: any): boolean => {
    if (websocketRef.current?.readyState === WebSocket.OPEN) {
      try {
        const messageString = typeof message === "string" ? message : JSON.stringify(message);

        websocketRef.current.send(messageString);
        return true;
      } catch (error) {
        console.error("Failed to send WebSocket message:", error);
        return false;
      }
    }

    console.warn("WebSocket is not connected. Message not sent:", message);
    return false;
  }, []);

  // Auto-connect on mount if enabled
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  // Handle page visibility changes to reconnect when tab becomes active
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && connectionState === "disconnected" && !isManualDisconnectRef.current) {
        connect();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [connect, connectionState]);

  const contextValue: WebSocketContextType = {
    connectionState,
    lastMessage,
    sendMessage,
    connect,
    disconnect,
    isConnected: connectionState === "connected",
  };

  return <WebSocketContext.Provider value={contextValue}>{children}</WebSocketContext.Provider>;
}

export function useWebSocket(): WebSocketContextType {
  const context = useContext(WebSocketContext);

  if (!context) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }

  return context;
}
