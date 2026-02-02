import React, { createContext, useContext, useState, useEffect } from 'react';
import { getGeminiResponse } from '../services/geminiService';

const ChatbotContext = createContext();

export const useChatbot = () => {
  const context = useContext(ChatbotContext);
  if (!context) {
    throw new Error('useChatbot must be used within a ChatbotProvider');
  }
  return context;
};

export const ChatbotProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your AFI assistant. How can I help you today?",
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState('');

  // Persist chat state in localStorage
  useEffect(() => {
    const savedMessages = localStorage.getItem('chatbot_messages');
    const savedIsOpen = localStorage.getItem('chatbot_isOpen');

    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages).map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));
        setMessages(parsedMessages);
      } catch (error) {
        console.error('Error parsing saved messages:', error);
      }
    }

    if (savedIsOpen) {
      setIsOpen(JSON.parse(savedIsOpen));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('chatbot_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('chatbot_isOpen', JSON.stringify(isOpen));
  }, [isOpen]);

  const addMessage = (text, sender) => {
    const newMessage = {
      id: Date.now(),
      text,
      sender,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const toggleChat = () => {
    setIsOpen(prev => !prev);
  };

  const sendMessage = async (text) => {
    if (!text.trim()) return;

    addMessage(text, 'user');
    setInputValue('');
    setIsTyping(true);

    try {
      const response = await getGeminiResponse(text);
      addMessage(response, 'bot');
    } catch (error) {
      console.error('Chatbot error:', error);
      addMessage('Sorry, I\'m having trouble connecting right now. Please try again later.', 'bot');
    } finally {
      setIsTyping(false);
    }
  };

  const value = {
    isOpen,
    messages,
    isTyping,
    inputValue,
    setInputValue,
    toggleChat,
    sendMessage,
    addMessage,
  };

  return (
    <ChatbotContext.Provider value={value}>
      {children}
    </ChatbotContext.Provider>
  );
};
