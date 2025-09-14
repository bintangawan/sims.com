import { AnimatePresence, motion } from 'framer-motion';
import { MessageCircle, Send, Smile, Sparkles, Trash2, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

type Role = 'admin' | 'guru' | 'siswa' | null;

interface Message {
    id: string;
    content: string;
    sender: 'user' | 'bot';
    timestamp: Date;
}

interface ChatWidgetProps {
    isAuthenticated?: boolean;
    userRole?: Role;
    className?: string;
}

const SUGGESTIONS = ['Saya ingin membuat akun siswa', 'Bagaimana cara reset password?', 'Cara melihat nilai & absensi'];

const ChatWidget: React.FC<ChatWidgetProps> = ({ isAuthenticated = false, userRole = null, className = '' }) => {
    const initialBotText = isAuthenticated
        ? 'Halo! Saya asisten virtual SIMS 🤖. Ada yang bisa saya bantu?'
        : 'Halo! Selamat datang di SIMS. Silakan login untuk pengalaman yang lebih personal. Saya siap membantu!';

    const initialMessages: Message[] = [
        {
            id: 'greet-1',
            content: initialBotText,
            sender: 'bot',
            timestamp: new Date(),
        },
    ];

    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Scroll ke bawah saat ada pesan baru
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Fokus input ketika terbuka
    useEffect(() => {
        if (isOpen) inputRef.current?.focus();
    }, [isOpen]);

    // ESC untuk tutup
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) setIsOpen(false);
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [isOpen]);

    const resetHistory = () => {
        setMessages([
            {
                id: 'greet-reset',
                content: initialBotText,
                sender: 'bot',
                timestamp: new Date(),
            },
        ]);
    };

    const sendText = async (text: string) => {
        if (!text.trim()) return;

        const userMsg: Message = {
            id: `u-${Date.now()}`,
            content: text.trim(),
            sender: 'user',
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMsg]);
        setInputValue('');
        setIsTyping(true);

        try {
            const endpoint = isAuthenticated ? '/api/chat' : '/api/chat/public';
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    message: userMsg.content,
                    context: { role: userRole, authenticated: isAuthenticated },
                }),
            });

            const data = await res.json();

            setTimeout(() => {
                const botMsg: Message = {
                    id: `b-${Date.now()}`,
                    content: data?.response || 'Maaf, terjadi kesalahan. Silakan coba lagi.',
                    sender: 'bot',
                    timestamp: new Date(),
                };
                setMessages((prev) => [...prev, botMsg]);
                setIsTyping(false);
            }, 600);
        } catch {
            setTimeout(() => {
                const botMsg: Message = {
                    id: `b-${Date.now()}`,
                    content: 'Maaf, koneksi bermasalah. Coba lagi ya.',
                    sender: 'bot',
                    timestamp: new Date(),
                };
                setMessages((prev) => [...prev, botMsg]);
                setIsTyping(false);
            }, 600);
        }
    };

    const onSend = () => sendText(inputValue);
    const onKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSend();
        }
    };

    const formatTime = (d: Date) => d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    return (
        <div className={`fixed right-6 bottom-6 z-50 ${className}`}>
            {/* Widget */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.98 }}
                        transition={{ duration: 0.18 }}
                        className="mb-3 w-[360px] max-w-[92vw] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl"
                    >
                        {/* Header mirip Hostinger */}
                        <div className="flex items-center justify-between px-4 py-3">
                            <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                                    <Sparkles size={16} />
                                </div>
                                <div>
                                    <div className="text-sm font-semibold">Tanya SIMS</div>
                                    <div className="text-xs text-muted-foreground">Online • Siap membantu</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="rounded p-1.5 text-gray-600 hover:bg-gray-100" title="Reaksi">
                                    <Smile size={16} />
                                </button>
                                <button className="rounded p-1.5 text-gray-600 hover:bg-gray-100" title="Hapus riwayat" onClick={resetHistory}>
                                    <Trash2 size={16} />
                                </button>
                                <button className="rounded p-1.5 text-gray-600 hover:bg-gray-100" title="Tutup" onClick={() => setIsOpen(false)}>
                                    <X size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="px-4 pb-4">
                            {/* Kartu sapaan seperti bubble */}
                            <div className="mb-4 rounded-xl border border-gray-200 bg-gray-50 p-3">
                                <div className="flex items-start gap-3">
                                    <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                                        <Sparkles size={14} />
                                    </div>
                                    <p className="text-sm leading-relaxed text-gray-800">{initialBotText}</p>
                                </div>
                            </div>

                            {/* FAQ pills */}
                            <div className="mb-2 text-sm font-medium">Pertanyaan yang sering diajukan:</div>
                            <div className="mb-4 space-y-2">
                                {SUGGESTIONS.map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => sendText(s)}
                                        className="w-full rounded-full border border-gray-200 px-4 py-2 text-left text-sm hover:bg-gray-50"
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>

                            {/* List messages */}
                            <div className="mb-3 max-h-64 overflow-y-auto">
                                <div className="space-y-3">
                                    {messages.map((m) => (
                                        <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            <div
                                                className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                                                    m.sender === 'user'
                                                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                                                        : 'border border-gray-200 bg-white text-gray-800'
                                                }`}
                                            >
                                                <div>{m.content}</div>
                                                <div className={`mt-1 text-[10px] ${m.sender === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                                                    {formatTime(m.timestamp)}
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {isTyping && (
                                        <div className="flex justify-start">
                                            <div className="rounded-2xl border border-gray-200 bg-white px-3 py-2">
                                                <div className="flex gap-1">
                                                    <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" />
                                                    <span
                                                        className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
                                                        style={{ animationDelay: '0.1s' }}
                                                    />
                                                    <span
                                                        className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
                                                        style={{ animationDelay: '0.2s' }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div ref={messagesEndRef} />
                            </div>

                            {/* input + send */}
                            <div className="relative">
                                <input
                                    ref={inputRef}
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={onKeyPress}
                                    placeholder="Ketik pertanyaan Anda..."
                                    className="w-full rounded-xl border border-gray-300 py-2 pr-10 pl-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                    disabled={isTyping}
                                />
                                <button
                                    onClick={onSend}
                                    disabled={!inputValue.trim() || isTyping}
                                    className="absolute top-1.5 right-1 inline-flex h-7 w-7 items-center justify-center rounded-md bg-gray-900 text-white disabled:opacity-40"
                                    title="Kirim"
                                >
                                    <Send size={14} />
                                </button>
                            </div>

                            {/* disclaimer */}
                            <div className="mt-2 text-center text-[11px] text-gray-500">Informasi dari AI mungkin tidak akurat</div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* FAB: {Logo} Tanya SIMS — selalu sama, klik lagi untuk menutup */}
            <button
                onClick={() => setIsOpen((v) => !v)}
                className="flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 text-white shadow-lg transition-shadow hover:shadow-xl"
                aria-label={isOpen ? 'Tutup Tanya SIMS' : 'Buka Tanya SIMS'}
            >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20">
                    <MessageCircle size={14} />
                </span>
                <span className="text-sm font-semibold">Tanya SIMS</span>
            </button>
        </div>
    );
};

export default ChatWidget;
