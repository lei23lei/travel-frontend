"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { chatService } from "@/services/chat";
import type { ChatMessage, StreamingChatResponse } from "@/types/chat";
import AuthBackground from "@/components/auth/auth-bg";

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Hey! What's up? 😊",
    },
  ]);

  // Clean up any empty messages
  const cleanMessages = (msgs: ChatMessage[]) => {
    return msgs.filter((msg) => msg.content.trim() !== "");
  };
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [streamingContent, setStreamingContent] = useState("");
  const currentStreamingRef = useRef("");

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: inputMessage.trim(),
    };

    // Add user message immediately
    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);
    setError(null);
    setStreamingContent("");
    currentStreamingRef.current = "";

    try {
      // Send the current messages + the new user message, filtering out empty messages
      const messagesToSend = cleanMessages([...messages, userMessage]);
      console.log("Sending messages to backend:", messagesToSend);
      await chatService.sendMessageStream(
        { messages: messagesToSend },
        (chunk: StreamingChatResponse) => {
          console.log("Received chunk:", chunk);
          if (chunk.error) {
            setError(chunk.error);
            setIsLoading(false);
          } else if (chunk.content) {
            currentStreamingRef.current += chunk.content;
            setStreamingContent((prev) => prev + chunk.content);
          }
        },
        () => {
          // On complete - add the complete streaming message to messages
          const finalContent = currentStreamingRef.current;
          console.log("Streaming complete, final content:", finalContent);

          if (finalContent.trim()) {
            setMessages((prev) => [
              ...prev,
              {
                role: "assistant",
                content: finalContent,
              },
            ]);
          }
          setStreamingContent("");
          currentStreamingRef.current = "";
          setIsLoading(false);
        },
        (error: string) => {
          setError(error);
          setIsLoading(false);
        }
      );
    } catch (err) {
      setError("Failed to send message");
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <AuthBackground>
      <Card className="w-full max-w-4xl h-[80vh] liquid-glass-heavy">
        <CardContent className="p-0 h-full flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <Bot className="h-5 w-5 text-primary" />
              </Avatar>
              <div>
                <h2 className="text-lg font-semibold text-authtext">
                  AI Girlfriend
                </h2>
                <p className="text-sm text-authtext/70">
                  Keep responses under 10 words
                </p>
              </div>
              <Badge variant="secondary" className="ml-auto liquid-glass">
                {messages.length} messages
              </Badge>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.role === "assistant" && (
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <Bot className="h-5 w-5 text-primary" />
                  </Avatar>
                )}

                <div
                  className={`max-w-[70%] p-3 rounded-2xl liquid-glass ${
                    message.role === "user"
                      ? "bg-primary/20 text-white"
                      : "text-authtext"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">
                    {message.content}
                  </p>
                </div>

                {message.role === "user" && (
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <User className="h-5 w-5 text-primary" />
                  </Avatar>
                )}
              </div>
            ))}

            {/* Streaming Message */}
            {isLoading && streamingContent && (
              <div className="flex gap-3 justify-start">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <Bot className="h-5 w-5 text-primary" />
                </Avatar>
                <div className="max-w-[70%] p-3 rounded-2xl liquid-glass text-authtext">
                  <p className="text-sm whitespace-pre-wrap">
                    {streamingContent}
                    <span className="animate-pulse">▋</span>
                  </p>
                </div>
              </div>
            )}

            {/* Loading Indicator */}
            {isLoading && !streamingContent && (
              <div className="flex gap-3 justify-start">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <Bot className="h-5 w-5 text-primary" />
                </Avatar>
                <div className="max-w-[70%] p-3 rounded-2xl liquid-glass text-authtext">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Thinking...</span>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="flex gap-3 justify-start">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <Bot className="h-5 w-5 text-red-400" />
                </Avatar>
                <div className="max-w-[70%] p-3 rounded-2xl bg-red-500/20 border border-red-500/30 text-red-300">
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <Separator className="bg-white/10" />

          {/* Input Area */}
          <div className="p-4">
            <div className="flex gap-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message... (Enter to send)"
                className="flex-1 liquid-glass"
                disabled={isLoading}
                maxLength={200}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="liquid-glass-button px-4"
                size="icon"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-authtext/50 mt-2 text-center">
              Keep it conversational! Max 200 characters
            </p>
          </div>
        </CardContent>
      </Card>
    </AuthBackground>
  );
}
