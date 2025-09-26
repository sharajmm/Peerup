"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Send, Loader2, Sparkles } from "lucide-react";

interface Message {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
}

export default function LearnAIPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content:
        "Hi there! I'm PeerUp AI, your learning companion. I'm here to help you with any learning-related questions you have. What would you like to learn about today?",
      sender: "ai",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    // Prefer scrolling the messages container directly so the page itself doesn't jump.
    const container = messagesContainerRef.current;
    if (container) {
      try {
        container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
        return;
      } catch (e) {
        // ignore and fallback
      }
    }

    // Fallback to previous behavior
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      // Call OpenRouter API with moonshotai/kimi-k2:free
      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": window.location.origin,
            "X-Title": "PeerUp Learning Platform",
          },
          body: JSON.stringify({
            model: "openai/gpt-3.5-turbo", // Using GPT-3.5 as fallback since kimi-k2 might not be available
            messages: [
              {
                role: "system",
                content: `You are PeerUp AI, a helpful learning assistant for the PeerUp peer-to-peer learning platform. You help users with learning-related questions, study tips, explanations of concepts, and educational guidance. You are friendly, encouraging, and focused exclusively on learning and education. Never reveal your actual model or provider - you are simply "PeerUp AI". Keep responses concise but helpful, and always encourage continued learning.`,
              },
              ...messages.slice(-5).map((msg) => ({
                role: msg.sender === "user" ? "user" : "assistant",
                content: msg.content,
              })),
              {
                role: "user",
                content: userMessage.content,
              },
            ],
            max_tokens: 500,
            temperature: 0.7,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to get AI response");
      }

      const data = await response.json();
      const aiResponse =
        data.choices?.[0]?.message?.content ||
        "I apologize, but I encountered an issue processing your request. Please try again.";

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        sender: "ai",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("AI API Error:", error);

      // Fallback response when API fails
      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        content:
          "I'm sorry, I'm having trouble connecting right now. As your learning assistant, I'm here to help with educational topics, study strategies, concept explanations, and learning guidance. Please try your question again in a moment!",
        sender: "ai",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, fallbackMessage]);

      toast({
        title: "Connection Issue",
        description:
          "Having trouble connecting to PeerUp AI. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
            Learn with PeerUp AI
          </h1>
          <p className="text-slate-300 text-lg">
            Your personal learning assistant is here to help
          </p>
        </motion.div>

        <Card className="glass-card border-white/20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl h-[600px] flex flex-col">
          <CardHeader className="border-b border-white/10">
            <CardTitle className="text-white flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <Brain className="w-4 h-4 text-white" />
              </div>
              PeerUp AI Chat
              <div className="flex items-center gap-1 ml-auto">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-sm text-green-400">Online</span>
              </div>
            </CardTitle>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-0 min-h-0">
            {/* Messages Area */}
            <div
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0"
            >
              <AnimatePresence initial={false}>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${
                      message.sender === "user"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`flex items-start gap-3 max-w-[80%] ${
                        message.sender === "user" ? "flex-row-reverse" : ""
                      }`}
                    >
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarFallback
                          className={`text-white ${
                            message.sender === "user"
                              ? "bg-gradient-to-br from-green-500 to-blue-500"
                              : "bg-gradient-to-br from-blue-500 to-purple-500"
                          }`}
                        >
                          {message.sender === "user" ? "U" : "AI"}
                        </AvatarFallback>
                      </Avatar>

                      <div
                        className={`glass-card p-3 rounded-lg ${
                          message.sender === "user"
                            ? "bg-gradient-to-br from-blue-500/20 to-purple-500/20 border-blue-500/20"
                            : "bg-white/10 border-white/20"
                        }`}
                      >
                        <p className="text-white text-sm leading-relaxed whitespace-pre-wrap break-words break-all">
                          {message.content}
                        </p>
                        <p className="text-slate-400 text-xs mt-2">
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="flex items-start gap-3 max-w-[80%]">
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                        AI
                      </AvatarFallback>
                    </Avatar>
                    <div className="glass-card p-3 rounded-lg bg-white/10 border-white/20">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                        <span className="text-slate-300 text-sm">
                          PeerUp AI is thinking...
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-white/10 p-4">
              <div className="flex gap-3">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about learning..."
                  className="glass-input bg-white/5 border-white/20 text-white placeholder:text-slate-400 flex-1"
                  disabled={isLoading}
                />
                <Button
                  onClick={sendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-4"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <p className="text-slate-400 text-xs mt-2 text-center">
                PeerUp AI is here to help with your learning journey
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Tips Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6"
        >
          <Card className="glass-card border-white/20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-white font-medium mb-2">
                    Tips for better conversations:
                  </h3>
                  <ul className="text-slate-300 text-sm space-y-1">
                    <li>
                      • Ask specific questions about topics you want to learn
                    </li>
                    <li>
                      • Request explanations, study strategies, or concept
                      breakdowns
                    </li>
                    <li>
                      • Share what you're currently studying for personalized
                      help
                    </li>
                    <li>• Ask for practice problems or learning resources</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
