"use client";

import { useState } from "react";
import { useWebSocketConnection, useWebSocketMessages } from "@/old/hooks/use-websocket";
import { WebSocketMessage } from "@/old/providers/websocket-provider";

export function WebSocketDebugPanel() {
  const [messages, setMessages] = useState<WebSocketMessage[]>([]);
  const [messageToSend, setMessageToSend] = useState("");

  const { connectionState, isConnected, connect, disconnect } = useWebSocketConnection();

  const { sendMessage } = useWebSocketMessages((message: WebSocketMessage) => {
    setMessages((prev) => [...prev.slice(-9), message]); // Keep last 10 messages
  });

  const handleSendMessage = () => {
    if (messageToSend.trim()) {
      const success = sendMessage({
        type: "test",
        message: messageToSend,
        timestamp: Date.now(),
      });

      if (success) {
        setMessageToSend("");
      }
    }
  };

  const getStatusColor = () => {
    switch (connectionState) {
      case "connected":
        return "text-green-600";
      case "connecting":
        return "text-yellow-600";
      case "reconnecting":
        return "text-orange-600";
      case "error":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 rounded-lg border border-gray-200 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold">WebSocket Debug</h3>
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}></div>
          <span className={`text-xs font-medium ${getStatusColor()}`}>{connectionState}</span>
        </div>
      </div>

      <div className="mb-3 space-y-2">
        <div className="flex gap-2">
          <button
            onClick={connect}
            disabled={isConnected}
            className="rounded bg-blue-500 px-2 py-1 text-xs text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Connect
          </button>
          <button
            onClick={disconnect}
            disabled={!isConnected}
            className="rounded bg-red-500 px-2 py-1 text-xs text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Disconnect
          </button>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={messageToSend}
            onChange={(e) => setMessageToSend(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Type message..."
            className="flex-1 rounded border border-gray-300 bg-white px-2 py-1 text-xs dark:border-gray-600 dark:bg-gray-700"
            disabled={!isConnected}
          />
          <button
            onClick={handleSendMessage}
            disabled={!isConnected || !messageToSend.trim()}
            className="rounded bg-green-500 px-2 py-1 text-xs text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-2 dark:border-gray-700">
        <div className="mb-2 text-xs font-medium">Recent Messages:</div>
        <div className="max-h-32 space-y-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="text-xs italic text-gray-500">No messages yet</div>
          ) : (
            messages.map((msg, index) => (
              <div key={index} className="rounded bg-gray-50 p-2 text-xs dark:bg-gray-700">
                <div className="font-medium text-blue-600 dark:text-blue-400">{msg.type}</div>
                <div className="mt-1 text-gray-700 dark:text-gray-300">
                  {typeof msg.data === "object" ? JSON.stringify(msg.data, null, 2) : String(msg.data)}
                </div>
                <div className="mt-1 text-xs text-gray-400">{new Date(msg.timestamp).toLocaleTimeString()}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
