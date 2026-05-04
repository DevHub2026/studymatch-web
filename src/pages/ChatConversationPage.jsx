/**
 * CHAT CONVERSATION PAGE
 * 
 * Individual chat conversation with a specific study partner
 * 
 * Features:
 * - Real-time message display (sender right, receiver left)
 * - Send text messages
 * - Auto-scroll to bottom on new messages
 * - Partner info in header
 * - Message timestamps
 * - Loading states
 * - Empty state for new conversations
 * 
 * How it works:
 * 1. Get partnerId from URL params
 * 2. Fetch conversation messages
 * 3. Display messages in chat bubbles
 * 4. Send new messages via input at bottom
 * 5. Auto-scroll to latest message
 */

import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as chatApi from '../api/chat';
import { getUser } from '../store/authStore';
import Button from '../components/common/Button';

export default function ChatConversationPage() {
  const { partnerId } = useParams();
  const navigate = useNavigate();
  const currentUser = getUser();
  
  // State for messages and partner info
  const [messages, setMessages] = useState([]);
  const [partner, setPartner] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // State for new message input
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  
  // Ref for auto-scrolling to bottom
  const messagesEndRef = useRef(null);

  /**
   * Fetch conversation messages on mount
   */
  useEffect(() => {
    const fetchConversation = async () => {
      try {
        const data = await chatApi.getConversation(partnerId);
        
        // Set partner info and messages
        setPartner(data.partner || null);
        setMessages(data.messages || []);
      } catch (error) {
        console.error('Failed to fetch conversation:', error);
        // If conversation not found, redirect to chat list
        if (error.response?.status === 404) {
          alert('Conversation not found');
          navigate('/chat');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchConversation();
  }, [partnerId, navigate]);

  /**
   * Auto-scroll to bottom when messages change
   */
// ✔️ define FIRST
const scrollToBottom = () => {
  messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
};

// ✔️ then use it
useEffect(() => {
  scrollToBottom();
}, [messages]);

  /**
   * Send a new message
   * @param {Event} e - Form submit event
   */
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    // Don't send empty messages
    if (!newMessage.trim()) return;
    
    setSending(true);

    try {
      const response = await chatApi.sendMessage(partnerId, newMessage.trim());
      
      // Add new message to messages list
      setMessages(prev => [...prev, response.message]);
      
      // Clear input field
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  /**
   * Handle Enter key press to send message
   * Shift+Enter adds new line
   */
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  /**
   * Format timestamp for message
   * @param {string} timestamp - ISO timestamp
   * @returns {string} Formatted time
   */
  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-white text-2xl">Loading conversation...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Chat Header - Partner Info */}
      <div className="bg-[#1a1d2e] border-b border-gray-700 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Back Button */}
          <button
            onClick={() => navigate('/chat')}
            className="text-gray-400 hover:text-white transition"
          >
            <span className="text-2xl">←</span>
          </button>

          {/* Partner Avatar */}
          <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-white text-lg font-bold">
            {partner?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>

          {/* Partner Info */}
          <div>
            <h2 className="text-xl font-bold text-white">
              {partner?.name || 'Unknown User'}
            </h2>
            <p className="text-gray-400 text-sm">
              @{partner?.username || 'username'}
            </p>
          </div>
        </div>

        {/* Actions (optional) */}
        <div className="flex items-center gap-2">
          {/* View Profile Button */}
          <button className="text-gray-400 hover:text-white transition text-sm">
            View Profile
          </button>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          // Empty state - No messages yet
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💬</div>
            <h3 className="text-xl font-bold text-white mb-2">No messages yet</h3>
            <p className="text-gray-400">
              Start the conversation by sending a message!
            </p>
          </div>
        ) : (
          // Messages list
          messages.map((message, index) => {
            const isSender = message.sender_id === currentUser?.id;

            return (
              <div
                key={message.id || index}
                className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[70%] ${isSender ? 'items-end' : 'items-start'} flex flex-col`}>
                  {/* Message Bubble */}
                  <div
                    className={`px-4 py-3 rounded-2xl ${
                      isSender
                        ? 'bg-purple-600 text-white rounded-br-none'
                        : 'bg-[#1a1d2e] text-gray-200 rounded-bl-none'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {message.content}
                    </p>
                  </div>

                  {/* Timestamp */}
                  <span className="text-xs text-gray-500 mt-1 px-2">
                    {formatMessageTime(message.created_at)}
                  </span>
                </div>
              </div>
            );
          })
        )}

        {/* Auto-scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input - Fixed at bottom */}
      <div className="bg-[#1a1d2e] border-t border-gray-700 p-4">
        <form onSubmit={handleSendMessage} className="flex gap-3">
          {/* Text Input */}
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            disabled={sending}
            className="flex-1 px-4 py-3 bg-[#0f1218] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 disabled:opacity-50"
          />

          {/* Send Button */}
          <Button
            type="submit"
            disabled={sending || !newMessage.trim()}
            className="px-6"
          >
            {sending ? (
              <span>Sending...</span>
            ) : (
              <span className="flex items-center gap-2">
                <span>Send</span>
                <span>📤</span>
              </span>
            )}
          </Button>
        </form>

        {/* Hint text */}
        <p className="text-gray-500 text-xs mt-2 text-center">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}