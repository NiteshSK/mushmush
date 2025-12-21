"use client";

import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, User, Bot, Loader2, Sparkles } from "lucide-react";

interface Message {
    role: "user" | "assistant";
    content: string;
}

const ChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: "assistant", content: "Hi! I'm Mushy, your AI guide. How can I help you today?" }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput("");
        setMessages(prev => [...prev, { role: "user", content: userMessage }]);
        setIsLoading(true);

        try {
            const response = await fetch("/api/ai-chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [...messages, { role: "user", content: userMessage }]
                }),
            });

            if (!response.ok) throw new Error("Failed to send message");

            const data = await response.json();
            setMessages(prev => [...prev, { role: "assistant", content: data.content }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I encountered an error. Please try again later." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-[9999]">
            {/* Floating Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-blue hover:bg-blue-dark text-white p-4 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 flex items-center justify-center group relative"
                >
                    <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center animate-pulse border-2 border-white">
                        1
                    </div>
                    <MessageCircle size={28} />
                    <span className="max-w-0 overflow-hidden group-hover:max-w-xs group-hover:ml-2 transition-all duration-500 whitespace-nowrap font-medium text-sm">
                        Ask Mushy
                    </span>
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="bg-white/80 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl w-[380px] h-[520px] flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300 transition-all">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue to-blue-dark p-4 flex justify-between items-center text-white">
                        <div className="flex items-center gap-2">
                            <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
                                <Sparkles size={18} />
                            </div>
                            <div>
                                <h3 className="font-bold">Mushy AI</h3>
                                <div className="flex items-center gap-1">
                                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                    <span className="text-[10px] opacity-80 uppercase tracking-wider">Online</span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="hover:bg-black/10 p-1 rounded-full transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                        {messages.map((msg, i) => (
                            <div
                                key={i}
                                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`max-w-[85%] p-3 rounded-2xl text-sm ${msg.role === "user"
                                            ? "bg-blue text-white rounded-tr-none"
                                            : "bg-white border border-gray-100 shadow-sm rounded-tl-none text-gray-800"
                                        }`}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        {msg.role === "assistant" ? (
                                            <div className="w-5 h-5 bg-blue/10 rounded-full flex items-center justify-center text-blue">
                                                <Bot size={12} />
                                            </div>
                                        ) : (
                                            <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center ml-auto">
                                                <User size={12} />
                                            </div>
                                        )}
                                        <span className="text-[10px] font-semibold opacity-60">
                                            {msg.role === "user" ? "You" : "Mushy"}
                                        </span>
                                    </div>
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-tl-none p-3 max-w-[85%] flex items-center gap-2">
                                    <Loader2 className="animate-spin text-blue" size={16} />
                                    <span className="text-xs text-gray-500 italic">Thinking...</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <form
                        onSubmit={handleSubmit}
                        className="p-4 bg-white border-t border-gray-100 flex gap-2 items-center"
                    >
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask about training, products..."
                            className="flex-1 text-sm border-none focus:ring-0 focus:outline-none placeholder:text-gray-400"
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || isLoading}
                            className={`p-2 rounded-lg transition-all ${input.trim() && !isLoading
                                    ? "bg-blue text-white shadow-md hover:scale-105 active:scale-95"
                                    : "bg-gray-100 text-gray-400"
                                }`}
                        >
                            <Send size={18} />
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="px-4 py-2 bg-gray-50 text-[10px] text-center text-gray-400">
                        Powered by Mushmush AI • Always helpful
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatBot;
