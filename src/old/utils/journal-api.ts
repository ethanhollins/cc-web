export interface ChatMessage {
  type: "text" | "image";
  content: string;
  fileName?: string;
}

export interface JournalAPIResponse {
  success: boolean;
  markdown: string;
  timestamp: string;
}

/**
 * Placeholder API function for sending chat messages and receiving markdown responses
 * TODO: Replace with actual API endpoint
 */
export const sendJournalMessage = async (message: ChatMessage): Promise<JournalAPIResponse> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Mock response based on message type
  let mockMarkdown: string;

  if (message.type === "image") {
    mockMarkdown = `# Image Analysis

I can see you've shared an image: **${message.fileName}**

Here's what I observe:
- This appears to be an interesting image
- The composition and content suggest...
- Some key insights from this image are...

## Reflection
This image makes me think about the importance of visual documentation in our daily work and life.

*Generated at ${new Date().toLocaleString()}*`;
  } else {
    mockMarkdown = `# Reflection on: "${message.content}"

Thank you for sharing your thoughts. Here's my reflection:

## Analysis
Your message touches on several important themes:
- [ ] **Insight 1**: The core message seems to be about...
- [ ] **Insight 2**: There's an underlying concern about...
- [ ] **Insight 3**: This connects to broader patterns of...

## Questions to Consider
1. What motivated you to share this thought?
2. How does this relate to your current goals?
3. What actions might emerge from this reflection?

## Summary
${
  message.content.split(" ").length > 10
    ? "This detailed thought deserves deeper consideration and follow-up action."
    : "Sometimes the simplest thoughts carry the most profound insights."
}

*Generated at ${new Date().toLocaleString()}*`;
  }

  return {
    success: true,
    markdown: mockMarkdown,
    timestamp: new Date().toISOString(),
  };
};
