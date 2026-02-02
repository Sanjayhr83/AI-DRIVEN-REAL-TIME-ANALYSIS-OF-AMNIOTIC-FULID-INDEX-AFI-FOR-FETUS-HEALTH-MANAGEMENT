import { useState, useCallback, useRef, useEffect } from 'react';

/**
import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * useSpeech Hook
 * Handles Speech-to-Text (STT) and Text-to-Speech (TTS) using Web Speech API
 * with fallback to server-side processing.
 *
 * @param {string} language - 'en' for English, 'kn' for Kannada
 * @returns {Object} - { isListening, transcript, isSpeaking, startListening, stopListening, speak, error }
 */
export const useSpeech = (language = 'en') => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState(null);
  
  const recognitionRef = useRef(null);
  const synthRef = useRef(null);
  const onResultRef = useRef(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Speech Recognition not supported in this browser');
      return;
    }
    
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = language === 'kn' ? 'kn-IN' : 'en-US';

    recognitionRef.current.onstart = () => {
      setIsListening(true);
      setTranscript('');
      setError(null);
    };

    recognitionRef.current.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptSegment = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcriptSegment + ' ';
        } else {
          interimTranscript += transcriptSegment;
        }
      }

      setTranscript(finalTranscript || interimTranscript);

      if (onResultRef.current) {
        onResultRef.current({
          transcript: finalTranscript || interimTranscript,
          isFinal: event.results[event.results.length - 1].isFinal
        });
      }
    };

    recognitionRef.current.onerror = (event) => {
      setError(`Speech recognition error: ${event.error}`);
      setIsListening(false);
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [language]);

  // Initialize Speech Synthesis
  useEffect(() => {
    synthRef.current = window.speechSynthesis;
  }, []);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.lang = language === 'kn' ? 'kn-IN' : 'en-US';
      recognitionRef.current.start();
    }
  }, [isListening, language]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);

  const speak = useCallback(
    (text) => {
      return new Promise((resolve, reject) => {
        if (!synthRef.current) {
          reject(new Error('Speech Synthesis not supported'));
          return;
        }

        // Cancel any ongoing speech
        synthRef.current.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = language === 'kn' ? 'kn-IN' : 'en-US';
        utterance.rate = 1;
        utterance.pitch = 1;
        utterance.volume = 1;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => {
          setIsSpeaking(false);
          resolve();
        };
        utterance.onerror = (event) => {
          setIsSpeaking(false);
          reject(new Error(`TTS error: ${event.error}`));
        };

        setIsSpeaking(true);
        synthRef.current.speak(utterance);
      });
    },
    [language]
  );

  const onResult = useCallback((callback) => {
    onResultRef.current = callback;
  }, []);

  return {
    isListening,
    transcript,
    isSpeaking,
    startListening,
    stopListening,
    speak,
    onResult,
    error
  };
};
