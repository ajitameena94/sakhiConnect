import React, { useState, useRef, useEffect } from 'react';
// Helper to render *something* as bold (without showing asterisks)
function renderWithBold(text: string) {
  // Replace *something* with <strong>something</strong>, but not across lines
  const parts = text.split(/(\*[^*]+\*)/g);
  return parts.map((part, i) => {
    const match = part.match(/^\*([^*]+)\*$/);
    if (match) {
      return <strong key={i} className="font-semibold text-green-900">{match[1]}</strong>;
    }
    return part;
  });
}
import { User } from 'firebase/auth';
import { ChatMessage } from '../types';
import { streamSakhiResponse, translateText } from '../services/geminiService';
import { getUserChatHistory, saveChatMessage } from '../services/firestoreService';
import Spinner from './Spinner';
import { useTranslation } from '../hooks/useTranslation';

interface ChatAssistantProps {
  user: User;
}

const ChatAssistant: React.FC<ChatAssistantProps> = ({ user }) => {
  const { t, language } = useTranslation();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      setIsHistoryLoading(true);
      const history = await getUserChatHistory(user.uid);
      if (history.length === 0) {
        const welcomeHi = 'नमस्ते! मैं Sakhi Connect की AI सहायक हूँ। आप मुझसे खेती, पशुपालन या सरकारी योजनाओं के बारे में कुछ भी पूछ सकती हैं।';
        const welcomeText = language === 'hi' ? welcomeHi : await translateText(welcomeHi, language);
        setMessages([{
          id: 'init',
          role: 'model',
          text: welcomeText,
        }]);
      } else {
        // Pre-translate each message so UI never shows original then updates (prevents flicker)
        const translatedMessages = await Promise.all(history.map(async (m) => {
          if (!m.text) return m;
          if (language === 'hi') return m; // stored language is Hindi
          try {
            const translated = await translateText(m.text, language);
            return { ...m, text: translated };
          } catch (e) {
            return m;
          }
        }));
        setMessages(translatedMessages as any);
      }
      setIsHistoryLoading(false);
    };

    fetchHistory();
  }, [user.uid, t]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const newUserMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
    };
    
    const currentInput = input;
    setInput('');
    setIsLoading(true);

  const updatedMessages = [...messages, newUserMessage];
  setMessages(updatedMessages);
    
    await saveChatMessage(user.uid, newUserMessage);

    const modelMessageId = (Date.now() + 1).toString();
    // Show a placeholder while model streams (avoid showing original language during streaming)
    const modelMessagePlaceholder: ChatMessage = { id: modelMessageId, role: 'model', text: '' };
    setMessages(prev => [...prev, modelMessagePlaceholder]);

    let fullModelResponse = "";
    try {
      const stream = streamSakhiResponse(updatedMessages, currentInput);
      for await (const chunk of stream) {
        // Accumulate but do not update visible text until translation is ready
        fullModelResponse += chunk;
      }

      // Save original Hindi response to Firestore
      const finalModelMessageOriginal: ChatMessage = {
        id: modelMessageId,
        role: 'model',
        text: fullModelResponse,
      };
      await saveChatMessage(user.uid, finalModelMessageOriginal);

      // Translate before displaying
      const displayText = language === 'hi' ? fullModelResponse : await translateText(fullModelResponse, language);
      setMessages((prev) => prev.map((msg) => (msg.id === modelMessageId ? { ...msg, text: displayText } : msg)));

    } catch (error) {
      console.error('Error handling stream:', error);
      const errorMessage: ChatMessage = {
        id: modelMessageId,
        role: 'model',
        text: language === 'hi' ? 'कुछ गड़बड़ हो गयी है, कृपया फिर प्रयास करें।' : await translateText('कुछ गड़बड़ हो गयी है, कृपया फिर प्रयास करें।', language),
      };
      setMessages((prev) => prev.map((msg) => (msg.id === modelMessageId ? errorMessage : msg)));
      await saveChatMessage(user.uid, { role: errorMessage.role, text: fullModelResponse || errorMessage.text });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-green-50 via-amber-50 to-stone-100 rounded-2xl shadow-inner border border-green-100">
      <div className="flex-grow overflow-y-auto px-2 py-4 md:px-6 md:py-6 space-y-3">
        {isHistoryLoading ? (
          <div className="flex justify-center items-center h-full"><Spinner /></div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={msg.id}
              className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'model' && (
                <div className="flex-shrink-0">
                  {/* Sakhi avatar */}
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-400 to-amber-300 flex items-center justify-center border-2 border-green-700 shadow">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="12" fill="#fff7e6" />
                      <ellipse cx="12" cy="10.5" rx="5" ry="5.5" fill="#fbbf24" />
                      <ellipse cx="12" cy="13.5" rx="6" ry="4.5" fill="#fde68a" />
                      <ellipse cx="12" cy="10.5" rx="3.5" ry="4" fill="#f59e42" />
                      <circle cx="12" cy="11" r="2.2" fill="#fff" />
                      <circle cx="12" cy="11.5" r="1.1" fill="#166534" />
                    </svg>
                  </div>
                </div>
              )}
              <div
                className={`max-w-[80%] md:max-w-md px-4 py-2 rounded-2xl text-base md:text-[1.08rem] shadow-md ${
                  msg.role === 'user'
                    ? 'bg-green-700 text-white rounded-br-none border border-green-800'
                    : 'bg-white text-gray-800 rounded-bl-none border border-amber-200'
                }`}
              >
                <p className="whitespace-pre-wrap leading-relaxed">
                  {msg.role === 'model'
                    ? (
                      msg.text
                        ? renderWithBold(msg.text)
                        : <span className="inline-flex items-center gap-2"><Spinner /><span className="text-sm text-gray-500">{t('सखी टाइप कर रही है...')}</span></span>
                    )
                    : msg.text || '...'
                  }
                </p>
              </div>
              {msg.role === 'user' && (
                <div className="flex-shrink-0">
                  {/* User avatar (initial) */}
                  <div className="w-9 h-9 rounded-full bg-green-200 flex items-center justify-center border-2 border-green-700 shadow">
                    <span className="text-green-900 font-bold text-lg">{user.displayName?.[0] || 'U'}</span>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="p-2 md:p-4 bg-white/80 border-t border-green-100 rounded-b-2xl">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('यहाँ अपना सवाल लिखें...')}
            className="w-full p-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-amber-500 focus:border-transparent transition text-base bg-white"
            disabled={isLoading || isHistoryLoading}
            autoFocus
          />
          <button
            type="submit"
            disabled={isLoading || isHistoryLoading || !input.trim()}
            className="bg-gradient-to-br from-green-600 to-amber-400 text-white p-3 rounded-full disabled:bg-gray-400 hover:from-green-700 hover:to-amber-500 shadow-md transition-colors"
            aria-label="Send"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatAssistant;