// Chat message interface
interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

// Chat request interface
interface ChatRequest {
  messages: ChatMessage[];
}

// Chat response interface
interface ChatResponse {
  response: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// Streaming chat response interface
interface StreamingChatResponse {
  content: string;
  done: boolean;
  error?: string;
}

// Chat API response wrapper
interface ChatAPIResponse {
  status: "success" | "fail";
  message: string;
  data: ChatResponse | null;
}

// Export types
export type {
  ChatMessage,
  ChatRequest,
  ChatResponse,
  StreamingChatResponse,
  ChatAPIResponse,
};
