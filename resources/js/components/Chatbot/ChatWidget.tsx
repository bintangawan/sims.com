import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, ChevronUp, MessageCircle, Send, Smile, Sparkles, Trash2, X } from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';

type Role = 'admin' | 'guru' | 'siswa' | null;

interface Message {
    id: string;
    content: string;
    sender: 'user' | 'bot';
    timestamp: Date;
}

interface ChatWidgetProps {
    isAuthenticated?: boolean;
    userRole?: Role; // 'siswa'|'guru'|'admin' atau null
    className?: string;
}

/**
 * 15 Q&A “terasa generatif” (angka-angka contoh untuk demo).
 * Nanti saat integrasi Gemini+MySQL, tinggal ganti di sisi server (tool-calls).
 */
const CANNED_FAQS: Array<{ id: string; triggers: RegExp[]; answer: string }> = [
    // 1) Total siswa di SIMS
    {
        id: 'stats_total_siswa',
        triggers: [/(total|berapa).*siswa( di sims| di sekolah| keseluruhan)?/i, /ada berapa siswa/i, /jumlah siswa/i],
        answer: 'Saat ini terdaftar **384 siswa** di SIMS — kelas X: 128, XI: 132, XII: 124. Distribusi jurusan: IPA 58%, IPS 42%.',
    },
    // 2) Kelas yang diampu (guru)
    {
        id: 'guru_kelas_diampu',
        triggers: [/(berapa|total).*kelas.*(saya|diampu|mengampu)/i, /saya mengampu berapa kelas/i, /kelas yang saya pegang/i],
        answer: 'Anda mengampu **9 kelas** aktif (X IPA 1–3, XI IPA 1–3, XII IPA 1–3). Rata-rata 10 siswa per kelas (±90 siswa total).',
    },
    // 3) Pengumuman minggu ini
    {
        id: 'announcements_this_week',
        triggers: [/pengumuman.*minggu.*ini/i, /ada.*pengumuman/i, /info.*terbaru/i],
        answer: 'Minggu ini terdapat **4 pengumuman**: 2 global (perubahan kalender), 1 untuk **guru** (rapat kurikulum), 1 untuk **siswa** (pendaftaran lomba sains).',
    },
    // 4) Tugas mendekati deadline
    {
        id: 'assignments_deadline',
        triggers: [/tugas.*(mendekati|dekat).*deadline/i, /deadline.*(terdekat|mepet)/i, /apa saja tugas.*minggu.*ini/i],
        answer: 'Ada **7 tugas** jatuh tempo 7 hari ke depan; **3** di antaranya dalam **48 jam** (Matematika—Limit, Fisika—Fluida, Bahasa—Esai).',
    },
    // 5) Statistik absensi hari ini
    {
        id: 'attendance_today',
        triggers: [/absensi.*hari.*ini/i, /rekap.*kehadiran.*hari.*ini/i, /siapa saja yang hadir hari ini/i],
        answer: 'Rekap hari ini: **hadir 512**, **izin 14**, **sakit 9**, **alpha 6**. Tingkat kehadiran keseluruhan **97.0%**.',
    },
    // 6) Nilai rata-rata semester ini
    {
        id: 'avg_scores_semester',
        triggers: [/rata.*nilai.*semester/i, /nilai.*rata.*rata/i, /rerata nilai/i],
        answer: 'Rata-rata nilai semester berjalan **82.6**. Top 3 mapel: Matematika (85.1), Bahasa Indonesia (84.4), Fisika (83.2).',
    },
    // 7) Keterlambatan submit minggu ini
    {
        id: 'late_submissions',
        triggers: [/telat.*(kumpul|submit)/i, /keterlambatan.*tugas/i, /berapa.*terlambat/i],
        answer: 'Minggu ini tercatat **23 submission terlambat** (6 ≤24 jam; 11 ≤72 jam; 6 >72 jam). Tren -12% dibanding minggu lalu.',
    },
    // 8) Jadwal mengajar hari ini (guru)
    {
        id: 'guru_jadwal_hari_ini',
        triggers: [/jadwal.*(mengajar|guru).*hari.*ini/i, /saya mengajar.*hari ini/i],
        answer: 'Hari ini Anda mengajar **3 sesi**: 07.30–09.10 (X IPA 1), 09.20–11.00 (XI IPA 2), 13.00–14.40 (XII IPA 3), ruang **F201/F204/Lab-1**.',
    },
    // 9) Hunian ruang/ruangan
    {
        id: 'room_utilization',
        triggers: [/ruang(an)? .*terpakai/i, /hunian.*ruang/i, /berapa persen ruang terpakai/i],
        answer: 'Tingkat hunian ruang hari ini **78%** (21/27 ruang aktif). Jam puncak 09.00–11.00 dengan okupansi **92%**.',
    },
    // 10) Konflik jadwal
    {
        id: 'schedule_conflicts',
        triggers: [/konflik.*jadwal/i, /bentrok.*jadwal/i, /jadwal.*bentrok/i],
        answer: 'Validasi jadwal terkini: **0 konflik** terdeteksi (guru & ruangan). Terakhir diperiksa 15 menit yang lalu.',
    },
    // 11) Ujian/kuis terdekat
    {
        id: 'exams_upcoming',
        triggers: [/ujian.*(dekat|terdekat)/i, /kuis.*minggu.*ini/i, /ada ujian kapan/i],
        answer: 'Dalam 7 hari: **2 ujian** (Kimia—Stoikiometri, Kamis 09.00; Sejarah—Bab 3, Sabtu 08.00) dan **1 kuis** (Informatika—Array, Rabu 10.00).',
    },
    // 12) Materi paling sering diunduh
    {
        id: 'top_materials',
        triggers: [/materi.*(terunduh|paling.*diunduh|paling.*sering)/i, /materi favorit/i],
        answer: '3 materi teratas (30 hari): 1) Fisika—Gelombang (**124 unduh**), 2) Matematika—Limit (**118**), 3) Biologi—Sel (**96**).',
    },
    // 13) Distribusi tipe tugas
    {
        id: 'assignment_type_distribution',
        triggers: [/distribusi.*tugas/i, /tipe.*tugas/i, /proporsi.*tugas/i],
        answer: 'Distribusi tipe tugas: **File 45%**, **Teks 30%**, **Link 25%**. Median waktu pengerjaan **2 hari 6 jam**.',
    },
    // 14) Kehadiran mingguan per kelas (ringkas)
    {
        id: 'weekly_attendance_by_class',
        triggers: [/absensi.*minggu.*ini.*kelas/i, /kehadiran.*per kelas.*minggu/i],
        answer: 'Rekap minggu ini (contoh): **XII IPA 1 96%**, **XI IPA 2 95%**, **X IPA 3 93%**. Rata-rata seluruh kelas **94.6%**.',
    },
    // 15) Kesehatan sistem / uptime
    {
        id: 'system_health',
        triggers: [/status.*sistem/i, /uptime/i, /kinerja.*aplikasi/i],
        answer: 'Sistem stabil: **99.95% uptime** (30 hari), latensi median **142 ms**, error rate **0.18%** (semua endpoint).',
    },
];

// const SUGGESTIONS = [
//   'Jadwal pelajaran hari ini',
//   'Tugas yang mendekati deadline',
//   'Bagaimana cara mengumpulkan tugas?',
//   'Di mana melihat nilai?',
//   'Ada pengumuman minggu ini?',
// ];

const ChatWidget: React.FC<ChatWidgetProps> = ({ isAuthenticated = false, userRole = null, className = '' }) => {
    const initialBotText = useMemo(
        () =>
            isAuthenticated
                ? 'Halo! Saya asisten virtual SIMS 🤖. Ada yang bisa saya bantu?'
                : 'Halo! Selamat datang di SIMS. Anda dapat bertanya tanpa login juga.',
        [isAuthenticated],
    );

    const initialMessages: Message[] = [{ id: 'greet-1', content: initialBotText, sender: 'bot', timestamp: new Date() }];

    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [showTips, setShowTips] = useState(true);

    const messagesWrapRef = useRef<HTMLDivElement>(null);

    // Persist session id
    useEffect(() => {
        const s = typeof window !== 'undefined' ? localStorage.getItem('chat_session_id') : null;
        if (s) setSessionId(s);
    }, []);
    useEffect(() => {
        if (sessionId) localStorage.setItem('chat_session_id', sessionId);
        else localStorage.removeItem('chat_session_id');
    }, [sessionId]);

    // Auto-scroll ke bawah tanpa mengubah tinggi container
    useEffect(() => {
        const el = messagesWrapRef.current;
        if (!el) return;
        el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    }, [messages, isTyping, isOpen]);

    const resetHistory = () => {
        setMessages([{ id: 'greet-reset', content: initialBotText, sender: 'bot', timestamp: new Date() }]);
        setSessionId(null);
    };

    const resolveSource = (): 'landing' | 'siswa' | 'guru' | 'admin' => {
        if (!isAuthenticated) return 'landing';
        if (userRole === 'siswa' || userRole === 'guru' || userRole === 'admin') return userRole;
        return 'landing';
    };

    const findCannedReply = (text: string): string | null => {
        for (const item of CANNED_FAQS) {
            if (item.triggers.some((rgx) => rgx.test(text))) return item.answer;
        }
        return null;
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
            const canned = findCannedReply(userMsg.content);
            const reply =
                canned ??
                `Terima kasih! Ini chatbot demo dengan jawaban singkat berbasis konteks SIMS. Coba tanya:
• "Total siswa di SIMS"
• "Saya mengampu berapa kelas?"
• "Pengumuman minggu ini"
• "Statistik absensi hari ini"
• "Ujian terdekat kapan?"
(Sumber konteks: ${resolveSource()})`;

            setTimeout(() => {
                const botMsg: Message = {
                    id: `b-${Date.now()}`,
                    content: reply,
                    sender: 'bot',
                    timestamp: new Date(),
                };
                setMessages((prev) => [...prev, botMsg]);
                setIsTyping(false);
            }, 320);
        } catch (err) {
            console.error('Chat (demo) error', err);
            setTimeout(() => {
                const botMsg: Message = {
                    id: `b-${Date.now()}`,
                    content: 'Maaf, koneksi bermasalah. Coba lagi ya.',
                    sender: 'bot',
                    timestamp: new Date(),
                };
                setMessages((prev) => [...prev, botMsg]);
                setIsTyping(false);
            }, 320);
        }
    };

    const onSend = () => sendText(inputValue);
    const formatTime = (d: Date) => d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    return (
        <div className={`fixed right-6 bottom-6 z-50 ${className}`}>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.98 }}
                        transition={{ duration: 0.18 }}
                        className="mb-3 w-[360px] max-w-[92vw] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl"
                        style={{ height: 520, willChange: 'transform' }}
                    >
                        <div className="flex h-full flex-col">
                            {/* Header */}
                            <div className="flex items-center justify-between border-b px-4 py-3">
                                <div className="flex items-center gap-2">
                                    <div className="to purple-600 flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 text-white">
                                        <Sparkles size={16} />
                                    </div>
                                    <div>
                                        <div className="text-sm font-semibold">Tanya SIMS</div>
                                        <div className="text-xs text-muted-foreground">
                                            {isAuthenticated ? 'Online • Terautentikasi' : 'Online • Guest (tanpa login)'}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <button
                                        className="rounded p-1.5 text-gray-600 hover:bg-gray-100"
                                        title="FAQ"
                                        onClick={() => setShowTips((v) => !v)}
                                    >
                                        {showTips ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                    </button>
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

                            {/* Tips collapsible (tinggi tetap) */}
                            <div
                                className={`px-4 transition-[height,opacity] ${showTips ? 'h-[84px] opacity-100' : 'h-0 opacity-0'} overflow-hidden`}
                            >
                                <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50 p-3">
                                    <p className="text-xs leading-relaxed text-gray-800">{initialBotText}</p>
                                </div>
                            </div>

                            {/* Body */}
                            <div className="flex min-h-0 flex-1 flex-col px-4 pb-3">
                                {/* (Suggestions biarkan tetap commented)
                <div className="mb-2">
                  <div className="text-xs font-medium">Pertanyaan cepat:</div>
                  <div className="mt-1 grid grid-cols-1 gap-1.5">
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => sendText(s)}
                        className="truncate rounded-full border border-gray-200 px-3 py-1.5 text-left text-xs hover:bg-gray-50"
                        title={s}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                */}

                                {/* Messages area — fixed-height scroll; container tidak “lompat” */}
                                <div ref={messagesWrapRef} className="mt-1 flex-1 overflow-y-auto rounded-md border border-gray-100 p-2">
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
                                </div>

                                {/* Input */}
                                <div className="mt-2">
                                    <div className="relative">
                                        <input
                                            value={inputValue}
                                            onChange={(e) => setInputValue(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    onSend();
                                                }
                                            }}
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

                                    <div className="mt-1 text-center text-[11px] text-gray-500">Informasi dari AI mungkin tidak akurat</div>
                                    {sessionId && <div className="text-center text-[10px] text-gray-400">session: {sessionId}</div>}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* FAB */}
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
