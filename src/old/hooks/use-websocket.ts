import { useCallback, useEffect, useRef } from "react";
import { WebSocketMessage, useWebSocket } from "@/old/providers/websocket-provider";

export interface UseWebSocketMessagesOptions {
  /**
   * Filter messages by type. If provided, only messages with matching type will trigger the handler
   */
  messageType?: string;

  /**
   * Whether to automatically connect when the hook mounts
   */
  autoConnect?: boolean;
}

export interface UseWebSocketMessagesReturn {
  /**
   * Current connection state
   */
  connectionState: string;

  /**
   * Whether the WebSocket is currently connected
   */
  isConnected: boolean;

  /**
   * Send a message through the WebSocket
   */
  sendMessage: (message: any) => boolean;

  /**
   * Manually trigger connection
   */
  connect: () => void;

  /**
   * Manually disconnect
   */
  disconnect: () => void;

  /**
   * The last received message (filtered by messageType if specified)
   */
  lastMessage: WebSocketMessage | null;
}

/**
 * Hook for components to easily interact with WebSocket and handle messages
 */
export function useWebSocketMessages(
  messageHandler?: (message: WebSocketMessage) => void,
  options: UseWebSocketMessagesOptions = {},
): UseWebSocketMessagesReturn {
  const { messageType, autoConnect = false } = options;
  const { connectionState, lastMessage, sendMessage, connect, disconnect, isConnected } = useWebSocket();

  const messageHandlerRef = useRef(messageHandler);
  const lastProcessedMessageRef = useRef<WebSocketMessage | null>(null);

  // Update the ref when handler changes
  useEffect(() => {
    messageHandlerRef.current = messageHandler;
  }, [messageHandler]);

  // Handle incoming messages
  useEffect(() => {
    if (lastMessage && lastMessage !== lastProcessedMessageRef.current) {
      // Filter by message type if specified
      if (messageType && lastMessage.type !== messageType) {
        return;
      }

      // Call the message handler if provided
      if (messageHandlerRef.current) {
        messageHandlerRef.current(lastMessage);
      }

      lastProcessedMessageRef.current = lastMessage;
    }
  }, [lastMessage, messageType]);

  // Auto-connect if requested
  useEffect(() => {
    if (autoConnect && connectionState === "disconnected") {
      connect();
    }
  }, [autoConnect, connectionState, connect]);

  return {
    connectionState,
    isConnected,
    sendMessage,
    connect,
    disconnect,
    lastMessage: messageType ? (lastMessage?.type === messageType ? lastMessage : null) : lastMessage,
  };
}

/**
 * Simplified hook for sending messages without handling incoming ones
 */
export function useWebSocketSender() {
  const { sendMessage, isConnected, connectionState } = useWebSocket();

  const sendMessageSafely = useCallback(
    (message: any) => {
      if (!isConnected) {
        console.warn("Cannot send message: WebSocket not connected");
        return false;
      }
      return sendMessage(message);
    },
    [sendMessage, isConnected],
  );

  return {
    sendMessage: sendMessageSafely,
    isConnected,
    connectionState,
  };
}

/**
 * Hook that provides connection status and controls without message handling
 */
export function useWebSocketConnection() {
  const { connectionState, isConnected, connect, disconnect } = useWebSocket();

  return {
    connectionState,
    isConnected,
    connect,
    disconnect,
  };
}
