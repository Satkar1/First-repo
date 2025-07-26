import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import ChatInterface from "@/components/chatbot/chat-interface";
import Header from "@/components/layout/header";

export default function Chatbot() {
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState([
    {
      id: "1",
      content: "Hello! I'm your Legal AI Assistant. I can help you with legal procedures, IPC sections, court processes, and general legal guidance. Available in English, Hindi, and Marathi. How can I assist you today?",
      sender: "bot" as const,
      timestamp: new Date(),
    }
  ]);

  const chatMutation = useMutation({
    mutationFn: async ({ query, language }: { query: string; language: string }) => {
      const response = await apiRequest("POST", "/api/chatbot", { query, language });
      return response;
    },
    onSuccess: (data) => {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        content: data.response,
        sender: "bot" as const,
        timestamp: new Date(),
        confidence: data.confidence,
        suggestedActions: data.suggestedActions,
        relatedSections: data.relatedSections,
      }]);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = (content: string, language: string = 'english') => {
    // Add user message
    const userMessage = {
      id: Date.now().toString(),
      content,
      sender: "user" as const,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);

    // Send to API
    chatMutation.mutate({ query: content, language });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <Header 
        title="Legal AI Assistant" 
        subtitle="Get instant legal guidance and support"
      />
      <div className="max-w-4xl mx-auto">
        <ChatInterface
          messages={messages}
          onSendMessage={handleSendMessage}
          isLoading={chatMutation.isPending}
        />
      </div>
    </div>
  );
}
