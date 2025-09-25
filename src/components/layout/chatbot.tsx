"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Send, Loader2 } from "lucide-react";
import { chatService } from "@/services/chat";
import type { ChatMessage, StreamingChatResponse } from "@/types/chat";

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm your AI travel assistant. How can I help you plan your next adventure? 🌍",
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streamingContent, setStreamingContent] = useState("");
  const currentStreamingRef = useRef("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatbotRef = useRef<HTMLDivElement>(null);

  // Clean up any empty messages
  const cleanMessages = (msgs: ChatMessage[]) => {
    return msgs.filter((msg) => msg.content.trim() !== "");
  };

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent]);

  const toggleChatbot = () => {
    if (isOpen && isMinimized) {
      setIsMinimized(false);
    } else {
      setIsOpen(!isOpen);
    }
  };

  const minimizeChatbot = () => {
    setIsMinimized(true);
  };

  const closeChatbot = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

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
      await chatService.sendMessageStream(
        { messages: messagesToSend },
        (chunk: StreamingChatResponse) => {
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
          // Auto-focus input after AI response
          setTimeout(() => {
            inputRef.current?.focus();
          }, 100);
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
    <>
      {/* Chatbot Icon Trigger */}
      <div
        className={`fixed bottom-6 right-6 z-50 ${
          isOpen
            ? "opacity-0 scale-0 pointer-events-none"
            : "opacity-100 scale-100"
        }`}
      >
        <Button
          onClick={toggleChatbot}
          className="w-12 h-12 md:w-14 md:h-14 liquid-glass-light !rounded-full bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
        >
          <Image
            src="/images/chatbot-icon.svg"
            alt="Chatbot"
            width={40}
            height={40}
            className="filter brightness-0 invert scale-[2.5] md:scale-[2]"
          />
        </Button>
      </div>

      {/* Chatbot Window */}
      <div
        ref={chatbotRef}
        className={`fixed bottom-6 right-6 z-50 ${
          isOpen
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-4 pointer-events-none"
        } ${isMinimized ? "h-12 w-64" : "h-[500px] w-80"}`}
      >
        <div className="liquid-glass-heavy  shadow-2xl border border-white/20 h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-2 pb-1 border-b border-white/10">
            <h6 className="text-authtext font-semibold">AI Travel Assistant</h6>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={closeChatbot}
                className="h-6 w-6 rounded-full p-0 hover:bg-white/10"
              >
                <X className="h-4 w-4 text-authtext" />
              </Button>
            </div>
          </div>

          {/* Chat Content */}
          {!isMinimized && (
            <>
              <div className="flex-1 overflow-y-auto chatbot-scrollbar  p-4 ">
                <div className="space-y-3">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex gap-2 ${
                        message.role === "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] p-2 rounded-xl text-xs ${
                          message.role === "user"
                            ? "bg-blue-300/30 rounded-2xl text-white shadow-lg"
                            : "liquid-glass text-authtext"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      </div>
                    </div>
                  ))}

                  {/* Streaming Message */}
                  {isLoading && streamingContent && (
                    <div className="max-w-[80%] p-2 rounded-xl liquid-glass text-authtext">
                      <p className="text-xs whitespace-pre-wrap">
                        {streamingContent}
                        <span className="animate-pulse">▋</span>
                      </p>
                    </div>
                  )}

                  {/* Loading Indicator */}
                  {isLoading && !streamingContent && (
                    <div className="w-[120px] p-2 rounded-xl liquid-glass text-authtext">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        <span className="text-xs">Thinking...</span>
                      </div>
                    </div>
                  )}

                  {/* Error Message */}
                  {error && (
                    <div className="max-w-[80%] p-2 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300">
                      <p className="text-xs">{error}</p>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Input Area */}
              <div className="p-3 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <Input
                    ref={inputRef}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me anything..."
                    className="flex-1 bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-xs text-authtext placeholder:text-authtext/60 focus:outline-none focus:border-primary/50"
                    disabled={isLoading}
                    maxLength={100}
                  />
                  <Button
                    size="sm"
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isLoading}
                    className="bg-primary liquid-glass-heavy transition-all duration-300 hover:scale-105 !rounded-xl hover:bg-primary/90 px-3 h-8"
                  >
                    <Send className="h-3 text-primary w-3" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
