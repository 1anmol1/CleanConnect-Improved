import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'react-toastify';

// This is a custom hook that encapsulates all the complex logic for wake word detection.
const useVoiceAssistant = ({ onCommand }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);
  const recognitionRef = useRef(null);

  // This effect runs once to set up the speech recognition engine.
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsSpeechSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = true; // Keep listening even after pauses
      recognition.interimResults = false; // We only want the final transcript
      recognitionRef.current = recognition;
    } else {
      console.warn("Speech recognition is not supported in this browser.");
    }
  }, []);

  const handleListen = useCallback(() => {
    if (!recognitionRef.current) return;
    const recognition = recognitionRef.current;

    recognition.onstart = () => {
      setIsListening(true);
      console.log("Voice assistant is now listening for 'Hey CleanConnect'...");
    };

    recognition.onend = () => {
      // If it stops for any reason (e.g., network error, silence), restart it
      // as long as the user hasn't manually stopped it.
      if (isListening) {
        recognition.start();
      }
    };

    recognition.onerror = (event) => {
      console.error(`Speech recognition error: ${event.error}`);
      // Don't show a toast for common errors like 'no-speech'
      if (event.error !== 'no-speech') {
        toast.error("Voice recognition error.");
      }
    };

    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
      
      // --- WAKE WORD DETECTION ---
      if (transcript.includes("hey clean connect") || transcript.includes("hey cleanconnect")) {
        console.log("Wake word detected!");
        toast.info("Wake word detected! Listening for your command...");
        
        // The onCommand callback (which we will define in App.jsx) will handle
        // opening the chatbot and passing the subsequent command.
        onCommand(); 
      }
    };

    recognition.start();
  }, [onCommand, isListening]);

  const startListening = () => {
    if (!isListening) {
      handleListen();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.onend = null; // Prevent it from auto-restarting
      recognitionRef.current.stop();
      setIsListening(false);
      console.log("Voice assistant stopped.");
    }
  };

  return { isListening, startListening, stopListening, isSpeechSupported };
};

export default useVoiceAssistant;
