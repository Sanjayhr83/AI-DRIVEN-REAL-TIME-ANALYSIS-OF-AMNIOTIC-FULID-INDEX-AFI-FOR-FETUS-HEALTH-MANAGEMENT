import { useCallback, useEffect, useRef, useState } from 'react';

export default function useSpeech({ initialLanguage = 'en' } = {}) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [language, setLanguage] = useState(initialLanguage);
  const [error, setError] = useState(null);

  const recognitionRef = useRef(null);
  const synthRef = useRef(typeof window !== 'undefined' ? window.speechSynthesis : null);
  const speakUtteranceRef = useRef(null);

  const supportsRecognition = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);
  const supportsSynthesis = typeof window !== 'undefined' && !!synthRef.current;

  useEffect(() => {
    setError(null);
    if (!supportsRecognition) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = language === 'kn' ? 'kn-IN' : 'en-US';
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onstart = () => {
      setIsListening(true);
      setInterimTranscript('');
    };

    recognition.onresult = (event) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const res = event.results[i];
        if (res.isFinal) final += res[0].transcript;
        else interim += res[0].transcript;
      }
      if (interim) setInterimTranscript(interim);
      if (final) {
        setTranscript((prev) => (prev ? `${prev}\n${final}` : final));
        setInterimTranscript('');
      }
    };

    recognition.onerror = (ev) => {
      console.warn('SpeechRecognition error', ev);
      setError(ev.error || 'recognition_error');
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;

    return () => {
      try { recognition.stop && recognition.stop(); } catch (e) {}
      recognitionRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!recognitionRef.current) return;
    try { recognitionRef.current.lang = language === 'kn' ? 'kn-IN' : 'en-US'; } catch (e) {}
  }, [language]);

  const startListening = useCallback(() => {
    setError(null);
    if (!supportsRecognition) { setError('SpeechRecognition not supported'); return; }
    try { recognitionRef.current && recognitionRef.current.start(); } catch (e) { setError(e.message || 'start_failed'); }
  }, [supportsRecognition]);

  const stopListening = useCallback(() => { try { recognitionRef.current && recognitionRef.current.stop(); } catch (e) { console.warn(e); } }, []);

  const cancelSpeaking = useCallback(() => {
    if (!supportsSynthesis) return;
    try { synthRef.current.cancel(); speakUtteranceRef.current = null; setIsSpeaking(false); } catch (e) { console.warn(e); }
  }, [supportsSynthesis]);

  const speak = useCallback((text, lang = language, { rate = 1, pitch = 1, voice = null } = {}) => {
    return new Promise((resolve, reject) => {
      if (!supportsSynthesis) return reject(new Error('SpeechSynthesis not supported'));
      try {
        cancelSpeaking();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = lang === 'kn' ? 'kn-IN' : 'en-US';
        u.rate = rate; u.pitch = pitch;
        if (voice) u.voice = voice;
        u.onstart = () => setIsSpeaking(true);
        u.onend = () => { setIsSpeaking(false); speakUtteranceRef.current = null; resolve(); };
        u.onerror = (ev) => { setIsSpeaking(false); speakUtteranceRef.current = null; reject(ev.error || new Error('tts_error')); };
        speakUtteranceRef.current = u;
        synthRef.current.speak(u);
      } catch (e) { setIsSpeaking(false); speakUtteranceRef.current = null; reject(e); }
    });
  }, [supportsSynthesis, cancelSpeaking, language]);

  const clear = useCallback(() => { setTranscript(''); setInterimTranscript(''); setError(null); }, []);

  return { isListening, isSpeaking, transcript, interimTranscript, language, error, startListening, stopListening, speak, setLanguage, clear };
}
