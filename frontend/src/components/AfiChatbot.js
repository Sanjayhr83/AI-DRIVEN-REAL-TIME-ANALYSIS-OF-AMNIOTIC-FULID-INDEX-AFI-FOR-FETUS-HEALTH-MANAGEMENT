import React, { useRef, useEffect, useState } from 'react';
import { Box, IconButton, Paper, TextField, Button, Avatar, Typography, Menu, MenuItem } from '@mui/material';
import { Close, Send, Mic, Language } from '@mui/icons-material';
import ChatbotIcon from './ChatbotIcon';
import './AfiChatbot.css';
import { useChatbot } from '../contexts/ChatbotContext';
import { SUPPORTED_LANGUAGES, setCurrentLanguage, getCurrentLanguage } from '../services/geminiService';

const AfiChatbot = () => {
  const {
    isOpen,
    messages,
    isTyping,
    inputValue,
    setInputValue,
    toggleChat,
    sendMessage,
  } = useChatbot();

  const [isRecording, setIsRecording] = useState(false);
  const [languageAnchor, setLanguageAnchor] = useState(null);
  const [currentLang, setCurrentLang] = useState(getCurrentLanguage());
  const recognition = useRef(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const messageText = inputValue.trim();
    setInputValue('');
    await sendMessage(messageText);
  };

  const handleToggleRecording = () => {
    if (isRecording) {
      recognition.current.stop();
      setIsRecording(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error('Speech recognition not supported in this browser.');
      return;
    }

    recognition.current = new SpeechRecognition();
    recognition.current.continuous = false;
    recognition.current.interimResults = true;
    recognition.current.lang = 'en-US';

    recognition.current.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0])
        .map((result) => result.transcript)
        .join('');
      setInputValue(transcript);
    };

    recognition.current.onend = () => {
      setIsRecording(false);
    };

    recognition.current.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
    };

    recognition.current.start();
    setIsRecording(true);
  };


  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessageText = (text) => {
    // Split long text into smaller chunks for better readability
    const splitTextIntoChunks = (content) => {
      const maxLength = 300; // Maximum characters per message bubble

      if (content.length <= maxLength) {
        return [content];
      }

      const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
      const chunks = [];
      let currentChunk = '';

      for (const sentence of sentences) {
        const trimmedSentence = sentence.trim();
        if (!trimmedSentence) continue;

        if (currentChunk.length + trimmedSentence.length + 2 <= maxLength) {
          currentChunk += (currentChunk ? '. ' : '') + trimmedSentence;
        } else {
          if (currentChunk) chunks.push(currentChunk + '.');
          currentChunk = trimmedSentence;
        }
      }

      if (currentChunk) chunks.push(currentChunk + '.');
      return chunks.length > 0 ? chunks : [content];
    };

    const lines = text.split('\n');
    const allChunks = [];

    lines.forEach((line) => {
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        const bulletContent = line.trim().substring(2);
        const chunks = splitTextIntoChunks(bulletContent);
        chunks.forEach(chunk => {
          allChunks.push({ type: 'bullet', content: chunk });
        });
      } else if (line.trim()) {
        const chunks = splitTextIntoChunks(line);
        chunks.forEach(chunk => {
          allChunks.push({ type: 'text', content: chunk });
        });
      }
    });

    return allChunks;
  };

  const handleLanguageClick = (event) => {
    setLanguageAnchor(event.currentTarget);
  };

  const handleLanguageClose = () => {
    setLanguageAnchor(null);
  };

  const handleLanguageSelect = (languageCode) => {
    setCurrentLanguage(languageCode);
    setCurrentLang(languageCode);
    setLanguageAnchor(null);
  };

  return (
    <>
      {/* Floating Chat Icon */}
      <Box
        className={`chatbot-icon ${isOpen ? 'hidden' : ''}`}
        onClick={toggleChat}
      >
        <ChatbotIcon />
      </Box>

      {/* Chat Window */}
      <Box className={`chatbot-window ${isOpen ? 'open' : ''}`}>
        <Paper className="chatbot-header">
          <Box className="chatbot-header-content">
            <Avatar className="chatbot-avatar">🤖</Avatar>
            <Box>
              <Typography variant="h6" className="chatbot-title">
                AFI Assistant
              </Typography>
              <Typography variant="body2" className="chatbot-subtitle">
                Online
              </Typography>
              <Typography variant="body2" className="chatbot-subtitle">
                <b>Developed by Team SPSY</b> | <a href="https://github.com/Sanjay837" target='_blank' rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>Created with ❤️</a>
              </Typography>
            </Box>
          </Box>
          <Box className="chatbot-header-actions">
            <IconButton 
              onClick={handleLanguageClick} 
              size="small"
              title="Select Language"
            >
              <Language />
            </IconButton>
            <Menu
              anchorEl={languageAnchor}
              open={Boolean(languageAnchor)}
              onClose={handleLanguageClose}
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <MenuItem 
                  key={lang.code}
                  onClick={() => handleLanguageSelect(lang.code)}
                  selected={currentLang === lang.code}
                >
                  {lang.name}
                </MenuItem>
              ))}
            </Menu>
            <IconButton onClick={toggleChat} size="small">
              <Close />
            </IconButton>
          </Box>
        </Paper>

        <Box className="chatbot-messages">
          {messages.map((message) => (
            <Box
              key={message.id}
              className={`message ${message.sender === 'user' ? 'user' : 'bot'}`}
            >
              <Box className="message-content">
                {message.sender === 'bot' ? (
                  renderMessageText(message.text).map((chunk, index) => (
                    chunk.type === 'bullet' ? (
                      <li key={index} style={{ marginBottom: '4px' }}>
                        {chunk.content}
                      </li>
                    ) : (
                      <Typography key={index} variant="body1" style={{ marginBottom: '4px' }}>
                        {chunk.content}
                      </Typography>
                    )
                  ))
                ) : (
                  <Typography variant="body1">{message.text}</Typography>
                )}
                <Typography variant="caption" className="message-time">
                  {formatTime(message.timestamp)}
                </Typography>
              </Box>
            </Box>
          ))}

          {isTyping && (
            <Box className="message bot">
              <Box className="message-content typing">
                <Box className="message-bubble typing">
                  <span></span>
                  <span></span>
                  <span></span>
                </Box>
              </Box>
            </Box>
          )}

          <div ref={messagesEndRef} />
        </Box>

        <Box className="chatbot-input">
          <TextField
            ref={inputRef}
            fullWidth
            variant="outlined"
            placeholder="Type your message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isTyping}
            size="small"
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isTyping}
            className="send-button"
          >
            <Send />
          </Button>
          <IconButton
            color={isRecording ? 'secondary' : 'primary'}
            onClick={handleToggleRecording}
            disabled={isTyping}
          >
            <Mic />
          </IconButton>
        </Box>
      </Box>
    </>
  );
};

export default AfiChatbot;
