/**
 * MODERN CHAT PAGE
 * 
 * WhatsApp/Discord-style chat interface with:
 * - Two-column layout (conversations + messages)
 * - Search conversations
 * - Real-time message display
 * - Smooth animations
 * - Mobile responsive
 */

import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as chatApi from '../api/chat';
import { getUser } from '../store/authStore';
import Button from '../components/common/Button';

export default function ChatPage() {
  const { partnerId } = useParams();
  const navigate = useNavigate();
  const currentUser = getUser();

  // Conversations state
  const [conversations, setConversations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Active conversation state
  const [messages, setMessages] = useState([]);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // New message state
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);

  // Refs
  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);

  /**
   * Fetch all conversations on mount
   */
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const data = await chatApi.getConversations();
        setConversations(data.conversations || []);
      } catch (error) {
        console.error('Failed to fetch conversations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

  /**
   * Load conversation when partnerId changes (from URL)
   */
  useEffect(() => {
    if (partnerId) {
      loadConversation(partnerId);
    } else {
      setMessages([]);
      setSelectedPartner(null);
    }
  }, [partnerId]);

  /**
   * Auto-scroll to bottom when messages change
   */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /**
   * Load a specific conversation
   */
  const loadConversation = async (partnerIdToLoad) => {
    setLoadingMessages(true);
    try {
      const data = await chatApi.getConversation(partnerIdToLoad);
      setSelectedPartner(data.partner || null);
      setMessages(data.messages || []);
      
      // Focus message input
      setTimeout(() => messageInputRef.current?.focus(), 100);
    } catch (error) {
      console.error('Failed to load conversation:', error);
    } finally {
      setLoadingMessages(false);
    }
  };

  /**
   * Handle conversation selection
   */
  const handleSelectConversation = (partner) => {
    navigate(`/chat/${partner.id}`);
  };

  /**
   * Send a new message
   */
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !partnerId) return;
    
    setSending(true);

    try {
      const response = await chatApi.sendMessage(partnerId, newMessage.trim());
      setMessages(prev => [...prev, response.message]);
      setNewMessage('');
      
      // Focus back on input
      messageInputRef.current?.focus();
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  /**
   * Handle Enter key (send message)
   */
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  /**
   * Format timestamp
   */
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  /**
   * Filter conversations by search query
   */
  const filteredConversations = conversations.filter(conv => 
    conv.partner?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-[#0a0d14]">
      {/* LEFT SIDEBAR - Conversations List */}
      <div className="w-full md:w-96 border-r border-gray-800 flex flex-col bg-[#0f1218]">
        {/* Header */}
        <div className="p-4 border-b border-gray-800">
          <h1 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <span>💬</span>
            <span>Messages</span>
          </h1>
          
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full px-4 py-2 pl-10 bg-[#1a1d2e] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition"
            />
            <span className="absolute left-3 top-2.5 text-gray-500">🔍</span>
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-gray-500">Loading...</div>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="text-5xl mb-3">💬</div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {searchQuery ? 'No results' : 'No conversations yet'}
              </h3>
              <p className="text-gray-500 text-sm mb-4">
                {searchQuery 
                  ? 'Try a different search term'
                  : 'Accept match requests to start chatting!'}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => navigate('/requests')}
                  className="text-purple-400 hover:text-purple-300 text-sm font-medium transition"
                >
                  View Match Requests →
                </button>
              )}
            </div>
          ) : (
            filteredConversations.map(conversation => {
              const partner = conversation.partner || {};
              const lastMessage = conversation.last_message || {};
              const hasUnread = conversation.unread_count > 0;
              const isActive = partnerId === String(partner.id);

              return (
                <button
                  key={conversation.id}
                  onClick={() => handleSelectConversation(partner)}
                  className={`w-full p-4 flex items-center gap-3 hover:bg-[#1a1d2e] transition border-l-4 ${
                    isActive 
                      ? 'bg-[#1a1d2e] border-purple-500' 
                      : 'border-transparent'
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
                      {partner.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    {partner.is_online && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0f1218]"></div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-baseline justify-between mb-1">
                      <h3 className={`font-semibold truncate ${hasUnread ? 'text-white' : 'text-gray-300'}`}>
                        {partner.name || 'Unknown User'}
                      </h3>
                      <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                        {formatTime(lastMessage.created_at || conversation.updated_at)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className={`text-sm truncate ${hasUnread ? 'text-gray-400 font-medium' : 'text-gray-600'}`}>
                        {lastMessage.content || 'No messages yet'}
                      </p>
                      {hasUnread && (
                        <span className="bg-purple-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 min-w-[20px] text-center">
                          {conversation.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT PANEL - Messages */}
      <div className="hidden md:flex flex-1 flex-col">
        {!partnerId ? (
          // No conversation selected
          <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-[#0a0d14] to-[#1a1d2e]">
            <div className="text-center">
              <div className="text-8xl mb-4">💬</div>
              <h2 className="text-2xl font-bold text-white mb-2">Select a conversation</h2>
              <p className="text-gray-500">Choose a chat from the list to start messaging</p>
            </div>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="bg-[#1a1d2e] border-b border-gray-800 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                  {selectedPartner?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">
                    {selectedPartner?.name || 'Unknown User'}
                  </h2>
                  <p className="text-sm text-gray-500">
                    @{selectedPartner?.username || 'username'}
                  </p>
                </div>
              </div>
              <button className="text-gray-400 hover:text-white transition text-sm font-medium">
                View Profile
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-[#0a0d14] to-[#0f1218]">
              {loadingMessages ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-gray-500">Loading messages...</div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="text-6xl mb-3">👋</div>
                    <h3 className="text-xl font-bold text-white mb-2">Start the conversation!</h3>
                    <p className="text-gray-500">Send a message to begin chatting</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message, index) => {
                    const isSender = message.sender_id === currentUser?.id;
                    const showAvatar = index === 0 || messages[index - 1].sender_id !== message.sender_id;

                    return (
                      <div
                        key={message.id || index}
                        className={`flex gap-3 ${isSender ? 'justify-end' : 'justify-start'} animate-fade-in`}
                      >
                        {!isSender && (
                          <div className="flex-shrink-0">
                            {showAvatar ? (
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold">
                                {selectedPartner?.name?.charAt(0)?.toUpperCase() || 'U'}
                              </div>
                            ) : (
                              <div className="w-8"></div>
                            )}
                          </div>
                        )}

                        <div className={`flex flex-col ${isSender ? 'items-end' : 'items-start'} max-w-[70%]`}>
                          <div
                            className={`px-4 py-2 rounded-2xl shadow-lg ${
                              isSender
                                ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-br-sm'
                                : 'bg-[#1a1d2e] text-gray-200 border border-gray-800 rounded-bl-sm'
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                              {message.content}
                            </p>
                          </div>
                          <span className="text-xs text-gray-600 mt-1 px-2">
                            {formatMessageTime(message.created_at)}
                          </span>
                        </div>

                        {isSender && <div className="w-8"></div>}
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="bg-[#1a1d2e] border-t border-gray-800 p-4">
              <form onSubmit={handleSendMessage} className="flex gap-3">
                <input
                  ref={messageInputRef}
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  disabled={sending}
                  className="flex-1 px-4 py-3 bg-[#0f1218] border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 disabled:opacity-50 transition"
                />
                <Button
                  type="submit"
                  disabled={sending || !newMessage.trim()}
                  className="px-6 rounded-xl"
                >
                  {sending ? '⏳' : '📤'}
                </Button>
              </form>
              <p className="text-gray-600 text-xs mt-2 text-center">
                Press Enter to send • Shift+Enter for new line
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}