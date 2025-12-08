import { useState, useEffect, useRef } from 'react';

const ChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const CHATBOT_API_URL = import.meta.env.VITE_CHATBOT_API_URL || 'http://localhost:8000';

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (isOpen) {
            setUnreadCount(0);
            inputRef.current?.focus();
        }
    }, [isOpen]);

    useEffect(() => {
        // Welcome message on component mount
        setMessages([
            {
                text: '👋 Hi! How can I help you today? Ask me about our vehicles, pricing, or rental policies!',
                sender: 'bot',
                timestamp: new Date()
            }
        ]);
    }, []);

    const toggleChat = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            setUnreadCount(0);
        }
    };

    const addMessage = (text, sender) => {
        const newMessage = {
            text,
            sender,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, newMessage]);
        
        // Show badge if window is closed and sender is bot
        if (!isOpen && sender === 'bot') {
            setUnreadCount(prev => prev + 1);
        }
    };

    const sendMessage = async () => {
        const text = inputText.trim();
        if (!text) return;

        // Add user message
        addMessage(text, 'user');
        setInputText('');
        setIsTyping(true);

        try {
            const response = await fetch(`${CHATBOT_API_URL}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text })
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            setIsTyping(false);
            addMessage(data.answer || 'No answer available', 'bot');
        } catch (error) {
            console.error('Chat error:', error);
            setIsTyping(false);
            addMessage('Sorry, I encountered an error. Please try again later.', 'bot');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className="font-sans">
            {/* Chat Window */}
            <div
                className={`fixed sm:bottom-20 bottom-0 sm:right-4 right-0 sm:left-auto left-0 sm:w-auto w-full sm:w-[420px] max-w-[92%] h-[70vh] sm:h-[600px] bg-gradient-to-br from-slate-900 to-slate-800 sm:rounded-2xl rounded-t-2xl shadow-2xl border border-blue-500/20 flex-col overflow-hidden transition-all duration-300 backdrop-blur-sm ${
                    isOpen ? 'flex animate-slideUp' : 'hidden'
                }`}
                style={{
                    boxShadow: '0 12px 48px rgba(0, 0, 0, 0.4), 0 0 60px rgba(59, 130, 246, 0.15)'
                }}
                role="dialog"
                aria-modal={isOpen}
                aria-hidden={!isOpen}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-5 flex justify-between items-center border-b border-blue-500/30">
                    <div>
                        <h3 className="text-lg font-semibold">🚗 SupportBot</h3>
                        <p className="text-xs opacity-90 mt-1">We're here to help!</p>
                    </div>
                    <button
                        onClick={toggleChat}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/20 transition-all duration-200 hover:scale-110"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Messages Container */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-blue-600 scrollbar-track-blue-900/10">
                    {messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`flex animate-fadeIn ${
                                msg.sender === 'user' ? 'justify-end' : 'justify-start'
                            }`}
                        >
                            <div
                                className={`max-w-[85%] sm:max-w-[70%] p-3 rounded-xl text-sm leading-relaxed ${
                                    msg.sender === 'user'
                                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-br-sm shadow-lg shadow-blue-500/30'
                                        : 'bg-blue-500/15 text-blue-100 border border-blue-500/30 rounded-bl-sm'
                                }`}
                            >
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    
                    {/* Typing Indicator */}
                    {isTyping && (
                        <div className="flex justify-start animate-fadeIn">
                            <div className="bg-blue-500/15 text-blue-100 border border-blue-500/30 p-3 rounded-xl rounded-bl-sm">
                                <div className="flex gap-1">
                                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-blue-500/20 bg-slate-900/80">
                    <div className="flex gap-3">
                        <input
                            ref={inputRef}
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Ask about rentals, pricing, policies..."
                            className="flex-1 px-3.5 py-3 border border-blue-500/30 rounded-lg bg-slate-800/60 text-blue-100 placeholder-blue-300/50 focus:outline-none focus:border-blue-500 focus:bg-slate-800/90 focus:ring-2 focus:ring-blue-500/10 transition-all text-sm"
                        />
                        <button
                            onClick={sendMessage}
                            disabled={!inputText.trim()}
                            className="px-5 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/30 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none flex items-center justify-center min-w-[50px]"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Toggle Button */}
            <button
                onClick={toggleChat}
                className={`fixed bottom-6 right-6 z-[10000] w-14 h-14 sm:w-16 sm:h-16 rounded-full text-white border-none text-2xl sm:text-3xl cursor-pointer shadow-2xl transition-all duration-300 items-center justify-center relative overflow-hidden hover:scale-110 active:scale-95 ${isOpen ? 'hidden sm:flex' : 'flex'} ${
                    isOpen
                        ? 'bg-gradient-to-br from-red-500 to-red-600 shadow-red-500/40'
                        : 'bg-gradient-to-br from-blue-600 to-blue-700 shadow-blue-500/40'
                }`}
                aria-label={isOpen ? 'Close chat' : 'Open chat'}
            >
                {isOpen ? (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                ) : (
                    '💬'
                )}
                
                {/* Notification Badge */}
                {unreadCount > 0 && !isOpen && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold animate-bounce">
                        {unreadCount}
                    </div>
                )}
            </button>

            <style jsx>{`
                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .animate-slideUp {
                    animation: slideUp 0.3s ease-out;
                }
                
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out;
                }
            `}</style>
        </div>
    );
};

export default ChatBot;