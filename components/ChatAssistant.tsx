import React, { useState, useRef, useEffect } from 'react';
import { User } from 'firebase/auth';
import { ChatMessage } from '../types';
import { streamSakhiResponse } from '../services/geminiService';
import { getUserChatHistory, saveChatMessage } from '../services/firestoreService';
import Spinner from './Spinner';
import { useTranslation } from '../hooks/useTranslation';

interface ChatAssistantProps {
  user: User;
}

const ChatAssistant: React.FC<ChatAssistantProps> = ({ user }) => {
  const { t } = useTranslation();
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
          setMessages([{
            id: 'init',
            role: 'model',
            text: t('नमस्ते! मैं Sakhi Connect की AI सहायक हूँ। आप मुझसे खेती, पशुपालन या सरकारी योजनाओं के बारे में कुछ भी पूछ सकती हैं।'),
        }]);
      } else {
        setMessages(history);
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
    const modelMessagePlaceholder: ChatMessage = { id: modelMessageId, role: 'model', text: '' };
    setMessages(prev => [...prev, modelMessagePlaceholder]);

    let fullModelResponse = "";
    try {
      const stream = streamSakhiResponse(updatedMessages, currentInput);
      for await (const chunk of stream) {
        fullModelResponse += chunk;
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === modelMessageId ? { ...msg, text: fullModelResponse } : msg
          )
        );
      }
      
      const finalModelMessage: ChatMessage = {
          id: modelMessageId,
          role: 'model',
          text: fullModelResponse
      }
      await saveChatMessage(user.uid, finalModelMessage);

    } catch (error) {
      console.error('Error handling stream:', error);
      const errorMessage : ChatMessage = {
          id: modelMessageId,
          role: 'model',
          text: "कुछ गड़बड़ हो गयी है, कृपया फिर प्रयास करें।"
      }
      setMessages((prev) =>
          prev.map((msg) => (msg.id === modelMessageId ? errorMessage : msg))
        );
      await saveChatMessage(user.uid, errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-grow space-y-4 overflow-y-auto">
        {isHistoryLoading ? (
            <div className="flex justify-center items-center h-full"><Spinner /></div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs md:max-w-md px-4 py-2 rounded-2xl ${
                  msg.role === 'user'
                    ? 'bg-green-700 text-white rounded-br-none'
                    : 'bg-white text-gray-800 shadow-sm rounded-bl-none'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.role === 'model' ? t(msg.text) : msg.text || '...'}</p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="mt-4">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t("यहाँ अपना सवाल लिखें...")}
            className="w-full p-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
            disabled={isLoading || isHistoryLoading}
          />
          <button
            type="submit"
            disabled={isLoading || isHistoryLoading || !input.trim()}
            className="bg-green-700 text-white p-3 rounded-full disabled:bg-gray-400 hover:bg-green-800 transition-colors"
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