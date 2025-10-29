'use client';

import { useState, useRef, useEffect } from 'react';

export default function Home() {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [conversationHistory, setConversationHistory] = useState<Array<{role: string, content: string}>>([]);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis;

      // Initialize speech recognition
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event: any) => {
          const speechResult = event.results[0][0].transcript;
          setTranscript(speechResult);
          handleUserInput(speechResult);
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setTranscript('');
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const speak = (text: string) => {
    if (synthRef.current) {
      // Cancel any ongoing speech
      synthRef.current.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      synthRef.current.speak(utterance);
    }
  };

  const handleUserInput = async (userText: string) => {
    const newHistory = [...conversationHistory, { role: 'user', content: userText }];
    setConversationHistory(newHistory);

    // Generate AI response
    const aiResponse = generateResponse(userText, newHistory);
    setResponse(aiResponse);

    const updatedHistory = [...newHistory, { role: 'assistant', content: aiResponse }];
    setConversationHistory(updatedHistory);

    // Speak the response
    speak(aiResponse);
  };

  const generateResponse = (userInput: string, history: Array<{role: string, content: string}>): string => {
    const input = userInput.toLowerCase();

    // Greeting
    if (input.includes('hello') || input.includes('hi') || input.includes('hey')) {
      return "Hello! Welcome to our office. I'm your AI receptionist. How may I help you today?";
    }

    // Appointment related
    if (input.includes('appointment') || input.includes('schedule') || input.includes('booking')) {
      if (input.includes('cancel')) {
        return "I can help you cancel your appointment. Please provide your name and appointment date, and I'll process the cancellation for you.";
      }
      if (input.includes('reschedule') || input.includes('change')) {
        return "I'd be happy to help you reschedule. What is your preferred date and time for the new appointment?";
      }
      return "I can help you schedule an appointment. What date and time works best for you?";
    }

    // Location/directions
    if (input.includes('location') || input.includes('address') || input.includes('where') || input.includes('direction')) {
      return "We're located at 123 Business Street, Suite 400. We're on the fourth floor of the main building. There's parking available in the adjacent lot.";
    }

    // Hours
    if (input.includes('hours') || input.includes('open') || input.includes('close') || input.includes('time')) {
      return "Our office hours are Monday through Friday, 9 AM to 5 PM. We're closed on weekends and major holidays.";
    }

    // Contact
    if (input.includes('contact') || input.includes('phone') || input.includes('email') || input.includes('call')) {
      return "You can reach us at 555-0123, or email us at contact@ouroffice.com. Would you like me to take a message?";
    }

    // Services
    if (input.includes('service') || input.includes('offer') || input.includes('do you')) {
      return "We offer a full range of professional services including consultations, document processing, and client support. Would you like more details about any specific service?";
    }

    // Waiting/meeting
    if (input.includes('wait') || input.includes('meeting') || input.includes('conference room')) {
      return "Please have a seat in our waiting area. Someone will be with you shortly. Can I get you some water or coffee while you wait?";
    }

    // Thank you
    if (input.includes('thank') || input.includes('thanks')) {
      return "You're very welcome! Is there anything else I can help you with today?";
    }

    // Goodbye
    if (input.includes('bye') || input.includes('goodbye') || input.includes('see you')) {
      return "Goodbye! Have a wonderful day, and please don't hesitate to reach out if you need anything else.";
    }

    // Emergency
    if (input.includes('emergency') || input.includes('urgent') || input.includes('help')) {
      return "I understand this is urgent. Let me connect you with someone who can assist you immediately. Please hold for just a moment.";
    }

    // Default response
    return "I understand. Let me help you with that. Could you please provide more details so I can assist you better?";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold text-gray-800 dark:text-white mb-2">
              🎙️ AI Receptionist
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Voice-powered virtual assistant
            </p>
          </div>

          {/* Main Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 mb-6">
            {/* Voice Control */}
            <div className="flex flex-col items-center mb-8">
              <button
                onClick={isListening ? stopListening : startListening}
                disabled={isSpeaking}
                className={`w-32 h-32 rounded-full flex items-center justify-center text-6xl transition-all transform hover:scale-105 active:scale-95 shadow-lg ${
                  isListening
                    ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                    : isSpeaking
                    ? 'bg-blue-300 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600'
                }`}
              >
                {isSpeaking ? '🔊' : isListening ? '🎤' : '🎙️'}
              </button>
              <p className="mt-4 text-lg font-semibold text-gray-700 dark:text-gray-200">
                {isSpeaking ? 'Speaking...' : isListening ? 'Listening...' : 'Click to speak'}
              </p>
              {!recognitionRef.current && (
                <p className="mt-2 text-sm text-red-500">
                  Speech recognition not supported in this browser
                </p>
              )}
            </div>

            {/* Conversation Display */}
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {conversationHistory.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs md:max-w-md px-4 py-3 rounded-2xl ${
                      msg.role === 'user'
                        ? 'bg-blue-500 text-white rounded-br-none'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'
                    }`}
                  >
                    <p className="text-xs font-semibold mb-1 opacity-75">
                      {msg.role === 'user' ? 'You' : 'AI Receptionist'}
                    </p>
                    <p>{msg.content}</p>
                  </div>
                </div>
              ))}
            </div>

            {conversationHistory.length === 0 && (
              <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                <p className="text-lg">Click the microphone to start a conversation</p>
                <p className="text-sm mt-2">Try saying: &quot;Hello&quot;, &quot;I need an appointment&quot;, &quot;What are your hours?&quot;</p>
              </div>
            )}
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
              <div className="text-3xl mb-2">📅</div>
              <h3 className="font-semibold text-gray-800 dark:text-white mb-1">Appointments</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Schedule, cancel, or reschedule</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
              <div className="text-3xl mb-2">📍</div>
              <h3 className="font-semibold text-gray-800 dark:text-white mb-1">Location</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Get directions and parking info</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
              <div className="text-3xl mb-2">⏰</div>
              <h3 className="font-semibold text-gray-800 dark:text-white mb-1">Office Hours</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Mon-Fri, 9 AM - 5 PM</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
