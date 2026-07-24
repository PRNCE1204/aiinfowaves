import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import s from './ChatbotWidget.module.css';
import { API_BASE_URL } from '../../../config';

const SUGGESTIONS = [
  'What services do you offer?',
  'Tell me about internships',
  'How do I book a consultation?',
  'View career openings'
];


export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hi there! 👋 I am **AI Infowave**, your intelligent AI assistant.

Here is what I can help you with:
- Explain our **Bio & Health AI** or **Agriculture AI** solutions
- Guide you through registering for our **Internship Program**
- Help you book a free scientific consultation call

How can I help you today?`
    }
  ]);

  const [loading, setLoading] = useState(false);
  
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  // Send message handler
  const handleSend = async (messageText) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || loading) return;

    // Clear input if sending from user input box
    if (!messageText) setInput('');

    // Append user message
    const newMessages = [...messages, { role: 'user', content: textToSend }];
    setMessages(newMessages);
    setLoading(true);

    try {
      // Map history to server expectation (excluding current message)
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: textToSend,
          history: messages
        })
      });

      const data = await response.json();
      
      if (response.ok && data.response) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
      } else {
        setMessages(prev => [
          ...prev, 
          { 
            role: 'assistant', 
            content: "Sorry, I am having trouble connecting to my servers right now. Please try again or fill out our contact form at [/contact](/contact)." 
          }
        ]);
      }
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [
        ...prev,
        { 
          role: 'assistant', 
          content: "Oops! An error occurred. Please verify your connection or visit our booking page at [/book](/book) to speak with a human agent." 
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button 
        className={s.fabButton}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle chat assistant"
      >
        {isOpen ? <X size={26} /> : <MessageCircle size={26} />}
      </button>

      {/* Chat Window Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className={s.chatContainer}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            {/* Header */}
            <div className={s.chatHeader}>
              <div className={s.headerInfo}>
                <div className={s.botAvatar}>
                  <Bot size={18} />
                </div>
                <div className={s.botTitle}>
                  <span>AI Infowave</span>
                  <span className={s.botStatus}>
                    <span className={s.statusDot}></span>
                    AI Online
                  </span>
                </div>
              </div>
              <button 
                className={s.closeButton} 
                onClick={() => setIsOpen(false)}
                aria-label="Close chat"
              >
                <X size={20} />
              </button>
            </div>

            {/* Message Area */}
            <div className={s.messageArea}>
              {messages.map((msg, index) => (
                <div 
                  key={index} 
                  className={`${s.messageRow} ${msg.role === 'user' ? s.userRow : s.assistantRow}`}
                >
                  <div 
                    className={`${s.messageBubble} ${msg.role === 'user' ? s.userBubble : s.assistantBubble}`}
                  >
                    {msg.role === 'user' ? (
                      msg.content
                    ) : (
                      <ReactMarkdown
                        components={{
                          a: ({ href, children }) => {
                            if (href && href.startsWith('/')) {
                              return (
                                <Link to={href}>
                                  {children}
                                </Link>
                              );
                            }
                            return (
                              <a href={href} target="_blank" rel="noopener noreferrer">
                                {children}
                              </a>
                            );
                          }
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    )}

                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {loading && (
                <div className={`${s.messageRow} ${s.assistantRow}`}>
                  <div className={`${s.messageBubble} ${s.assistantBubble}`}>
                    <div className={s.typingIndicator}>
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Predefined Suggestions Panel */}
            <div className={s.suggestionsContainer}>
              <div className={s.suggestionTitle}>Suggested Inquiries</div>
              <div className={s.chipsWrapper}>
                {SUGGESTIONS.map((text, idx) => (
                  <button 
                    key={idx}
                    className={s.chipButton}
                    onClick={() => handleSend(text)}
                    disabled={loading}
                  >
                    {text}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Form */}
            <div className={s.inputForm}>
              <input
                type="text"
                className={s.inputField}
                placeholder="Ask AI Infowave a question..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                disabled={loading}
              />
              <button
                className={s.sendButton}
                onClick={() => handleSend()}
                disabled={loading || !input.trim()}
                aria-label="Send message"
              >
                <Send size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
