"use client";

import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, User, Bot, Loader2, Sparkles } from "lucide-react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const ChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const { messages, sendMessage, status, error } = useChat({
        transport: new DefaultChatTransport({ api: "/api/ai-chat" }),
        messages: [
            {
                id: "welcome",
                role: "assistant",
                parts: [{ type: 'text', text: "Hi there! 🍄 I'm Mushy, your guide to MushMush.\n\nI can help you with:\n• 🌱 **Mushroom Cultivation Training**\n• 🛍️ **Fresh & Dried Mushrooms**\n• 💊 **Health Supplements**\n• 📦 **Product Availability & Pricing**\n\nWhat would you like to explore today?" }]
            } as any
        ],
    });

    const isLoading = status === "submitted" || status === "streaming";

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    // Auto-open chat on initial load
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsOpen(true);
        }, 1500);
        return () => clearTimeout(timer);
    }, []);

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const content = input;
        setInput(""); // Clear input early for UX
        await sendMessage({ text: content });
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
                <div className="bg-white/90 backdrop-blur-md border border-white/20 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300 transition-all fixed inset-0 w-full h-full rounded-none z-[10000] sm:static sm:w-[380px] sm:h-[600px] sm:rounded-2xl">
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
                        {messages.length === 0 && (
                            <div className="flex justify-start">
                                <div className="max-w-[85%] p-3 rounded-2xl text-sm bg-white border border-gray-100 shadow-sm rounded-tl-none text-gray-800">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="w-5 h-5 bg-blue/10 rounded-full flex items-center justify-center text-blue">
                                            <Bot size={12} />
                                        </div>
                                        <span className="text-[10px] font-semibold opacity-60">Mushy</span>
                                    </div>
                                    <div className="whitespace-pre-wrap leading-relaxed">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            Hi there! 🍄 I'm Mushy, your guide to MushMush.

                                            I can help you with:
                                            • 🌱 **Mushroom Cultivation Training**
                                            • 🛍️ **Fresh & Dried Mushrooms**
                                            • 💊 **Health Supplements**
                                            • 📦 **Product Availability & Pricing**

                                            What would you like to explore today?
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            </div>
                        )}
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
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
                                    <div className="whitespace-pre-wrap leading-relaxed markdown-content">
                                        {msg.parts.map((part: any, i: number) =>
                                            part.type === 'text' ? (
                                                <ReactMarkdown
                                                    key={i}
                                                    remarkPlugins={[remarkGfm]}
                                                    components={{
                                                        a: ({ node, ...props }) => {
                                                            const href = props.href || '';
                                                            const isWhatsApp = href.includes("wa.me");
                                                            const isEmail = href.startsWith("mailto:");
                                                            const isPhone = href.startsWith("tel:");

                                                            if (isWhatsApp) {
                                                                return (
                                                                    <a
                                                                        {...props}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#25D366] text-white hover:bg-green-600 transition-all mx-1 align-middle"
                                                                        title="Chat on WhatsApp"
                                                                    >
                                                                        <svg className="fill-current" width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                            <path
                                                                                d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"
                                                                                fillRule="evenodd"
                                                                            />
                                                                        </svg>
                                                                    </a>
                                                                );
                                                            }

                                                            if (isEmail) {
                                                                return (
                                                                    <a
                                                                        {...props}
                                                                        className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue text-white hover:bg-blue-dark transition-all mx-1 align-middle"
                                                                        title="Send Email"
                                                                    >
                                                                        <svg className="fill-current" width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                                                                        </svg>
                                                                    </a>
                                                                );
                                                            }

                                                            if (isPhone) {
                                                                return (
                                                                    <a
                                                                        {...props}
                                                                        className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue text-white hover:bg-blue-dark transition-all mx-1 align-middle"
                                                                        title="Call Phone"
                                                                    >
                                                                        <svg className="fill-current" width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                            <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                                                                        </svg>
                                                                    </a>
                                                                );
                                                            }

                                                            return (
                                                                <a {...props} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800 break-all" />
                                                            );
                                                        }
                                                    }}
                                                >
                                                    {part.text}
                                                </ReactMarkdown>
                                            ) : null
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {isLoading && messages[messages.length - 1]?.role === "user" && (
                            <div className="flex justify-start">
                                <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-tl-none p-3 max-w-[85%] flex items-center gap-2">
                                    <Loader2 className="animate-spin text-blue" size={16} />
                                    <span className="text-xs text-gray-500 italic">Mushy is thinking...</span>
                                </div>
                            </div>
                        )}
                        {error && (
                            <div className="p-3 bg-red-50 text-red-600 text-xs rounded-lg border border-red-100 flex items-center gap-2 animate-pulse">
                                <span className="text-lg">🍄</span>
                                <span>Oops! My mycelium network disconnected. Please check your connection or try again!</span>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <form
                        onSubmit={handleFormSubmit}
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
                        Powered by Mushmush AI • Real-time Streaming
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatBot;
