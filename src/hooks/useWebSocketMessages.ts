"use client";

import type { UseWebSocketMessagesOptions } from "@/hooks/useWebSocketHooks";
import { useWebSocketMessages as internalUseWebSocketMessages } from "@/hooks/useWebSocketHooks";

export type UseWebSocketMessagesReturn = ReturnType<typeof internalUseWebSocketMessages>;

/**
 * Public WebSocket messages hook used by new code.
 *
 * This is intentionally defined in its own module so call sites can remain
 * stable even if the underlying implementation changes.
 */
export function useWebSocketMessages(
  messageHandler?: Parameters<typeof internalUseWebSocketMessages>[0],
  options?: UseWebSocketMessagesOptions,
): UseWebSocketMessagesReturn {
  return internalUseWebSocketMessages(messageHandler, options);
}
