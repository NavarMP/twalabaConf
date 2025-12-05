"use client";

import { useState, useRef, useEffect } from "react";
import { FiMessageSquare, FiX, FiSend, FiLoader } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
    role: "user" | "model";
    parts: { text: string }[];
}

export default function AIAssistant() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = input;
        setInput("");

        const newMessages = [
            ...messages,
            { role: "user" as const, parts: [{ text: userMessage }] }
        ];

        setMessages(newMessages);
        setIsLoading(true);

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: userMessage,
                    history: messages.map(m => ({
                        role: m.role,
                        parts: [{ text: m.parts[0].text }]
                    }))
                }),
            });

            const data = await response.json();
            if (data.reply) {
                setMessages([
                    ...newMessages,
                    { role: "model", parts: [{ text: data.reply }] }
                ]);
            }
        } catch (error) {
            console.error("Chat error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        className="mb-4 w-80 md:w-96 bg-background/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[500px]"
                    >
                        {/* Header */}
                        <div className="p-4 bg-primary text-white flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                                <h3 className="font-bold">Conference Assistant</h3>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="hover:bg-white/20 p-1 rounded transition-colors"
                            >
                                <FiX className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.length === 0 && (
                                <div className="text-center text-foreground/50 mt-10">
                                    <p>Ask me anything about the conference!</p>
                                    <p className="text-sm mt-2">Try: "Who are the guests?" or "Where is the venue?"</p>
                                </div>
                            )}
                            {messages.map((msg, idx) => (
                                <div
                                    key={idx}
                                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                                >
                                    <div
                                        className={`max-w-[80%] p-3 rounded-2xl ${msg.role === "user"
                                                ? "bg-primary text-white rounded-br-none"
                                                : "bg-secondary/10 text-foreground rounded-bl-none"
                                            }`}
                                    >
                                        <p className="text-sm whitespace-pre-wrap">{msg.parts[0].text}</p>
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-secondary/10 p-3 rounded-2xl rounded-bl-none">
                                        <FiLoader className="w-4 h-4 animate-spin text-primary" />
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="p-4 border-t border-border bg-background/50">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                                    placeholder="Type a message..."
                                    className="flex-1 bg-secondary/5 border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={isLoading || !input.trim()}
                                    className="p-2 bg-primary text-white rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <FiSend className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className="p-4 rounded-full bg-gradient-to-r from-primary to-secondary text-white shadow-2xl hover:shadow-primary/50 transition-shadow"
            >
                {isOpen ? <FiX className="w-6 h-6" /> : <FiMessageSquare className="w-6 h-6" />}
            </motion.button>
        </div>
    );
}
