"use client";

import { MessageCircle } from "lucide-react";

export function ChatButton() {
  return (
    <button
      className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25 flex items-center justify-center hover:shadow-primary/40 hover:scale-105 transition-all duration-200"
      aria-label="Chat support"
    >
      <MessageCircle className="w-6 h-6" />
    </button>
  );
}
