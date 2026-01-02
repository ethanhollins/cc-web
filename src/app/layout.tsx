import type { Metadata, Viewport } from "next";
import { WebSocketProvider } from "@/lib/websocket-provider";
import "@/styles/themes.css";
import LegacyRootLayout, { metadata as legacyMetadata, viewport as legacyViewport } from "../old/app/layout";

export const metadata: Metadata = legacyMetadata;
export const viewport: Viewport = legacyViewport;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <WebSocketProvider>
      <LegacyRootLayout>{children}</LegacyRootLayout>
    </WebSocketProvider>
  );
}
