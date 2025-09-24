"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { X, Minimize2 } from "lucide-react";

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const toggleChatbot = () => {
    // if (isOpen && isMinimized) {
    //   setIsMinimized(false);
    // } else {
    //   setIsOpen(!isOpen);
    // }
  };

  const minimizeChatbot = () => {
    setIsMinimized(true);
  };

  const closeChatbot = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  return (
    <>
      {/* Chatbot Icon Trigger */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            onClick={toggleChatbot}
            className="w-12 h-12 md:w-14 md:h-14 liquid-glass-light !rounded-full bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
          >
            <Image
              src="/images/chatbot-icon.svg"
              alt="Chatbot"
              width={40}
              height={40}
              className="filter  brightness-0 invert scale-[2.5] md:scale-[2]"
            />
          </Button>
        </div>
      )}
    </>
  );
}
