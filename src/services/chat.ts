import { apiClient } from "@/lib/api-client";
import { apiUtils } from "@/lib/api-client";
import type {
  ChatRequest,
  ChatAPIResponse,
  StreamingChatResponse,
} from "@/types/chat";

// Regular chat endpoint (non-streaming)
export const chatService = {
  sendMessage: async (request: ChatRequest): Promise<ChatAPIResponse> => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error: any) {
      return apiUtils.handleError(error);
    }
  },

  // Streaming chat endpoint
  sendMessageStream: async (
    request: ChatRequest,
    onChunk: (chunk: StreamingChatResponse) => void,
    onComplete: () => void,
    onError: (error: string) => void
  ): Promise<void> => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/chat/stream`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(request),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response body reader available");
      }

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        // Decode the chunk and add to buffer
        buffer += decoder.decode(value, { stream: true });

        // Process complete lines
        const lines = buffer.split("\n");
        buffer = lines.pop() || ""; // Keep incomplete line in buffer

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              onChunk(data);

              if (data.done) {
                onComplete();
                return;
              }
            } catch (parseError) {
              console.error("Failed to parse SSE data:", parseError);
              onError("Failed to parse response data");
              return;
            }
          }
        }
      }
    } catch (error: any) {
      onError(error.message || "Streaming request failed");
    }
  },
};
