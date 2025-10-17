import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'react-toastify';

const useVoiceAssistant = ({ onCommand }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);
  const recognitionRef = useRef(null);
  const isManuallyStoppedRef = useRef(false);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsSpeechSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognitionRef.current = recognition;
    } else {
      console.warn("Speech recognition is not supported in this browser.");
    }
  }, []);

  const handleListen = useCallback(() => {
    if (!recognitionRef.current) return;
    const recognition = recognitionRef.current;
    
    recognition.onstart = () => {
      isManuallyStoppedRef.current = false;
      setIsListening(true);
      console.log("Voice assistant is now listening for a wake word...");
    };

    recognition.onend = () => {
      if (!isManuallyStoppedRef.current && isListening) {
        recognition.start();
      } else {
        setIsListening(false);
      }
    };

    recognition.onerror = (event) => {
      if (event.error === 'aborted' || event.error === 'no-speech') {
        console.warn(`Speech recognition event: ${event.error}`);
      } else {
        // We will not show a toast for 'not-allowed' as it's a persistent user setting
        if (event.error !== 'not-allowed') {
          toast.error(`Voice recognition error: ${event.error}`);
        }
        console.error(`Speech recognition error: ${event.error}`);
      }
      setIsListening(false);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
      
      // --- THE FIX IS HERE ---
      // We now listen for a list of simpler, more reliable wake words.
      const wakeWords = ["connect"];
      
      if (wakeWords.some(word => transcript.includes(word))) {
        console.log(`Wake word detected: "${transcript}"`);
        toast.info("Wake word detected! Listening for your command...");
        
        // Stop the global listener to hand off control
        stopListening();
        
        // The onCommand callback will now open the chatbot
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
      isManuallyStoppedRef.current = true;
      recognitionRef.current.stop();
      console.log("Voice assistant stopped.");
    }
  };

  return { isListening, startListening, stopListening, isSpeechSupported };
};

export default useVoiceAssistant;