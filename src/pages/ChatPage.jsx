/**
 * CHAT PAGE (Conversations List)
 * 
 * Display all active chat conversations with study partners
 * 
 * Features:
 * - List of all chat conversations
 * - Show last message preview
 * - Unread message indicators
 * - Click to open individual conversation
 * - Search/filter conversations (optional)
 * - Empty state when no chats exist
 * 
 * How it works:
 * 1. Fetches all conversations from API
 * 2. Shows list with partner info and last message
 * 3. Click conversation to open ChatConversationPage
 * 4. Only shows conversations with accepted match requests
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as chatApi from '../api/chat';
import PageHeader from '../components/layout/PageHeader';
import Card from '../components/common/Card';

export default function ChatPage() {
  // State for conversations list
  const [conversations, setConversations] = useState([]);
  
  // Loading state
  const [loading, setLoading] = useState(true);

  /**
   * Fetch all conversations on component mount
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
   * Format timestamp to relative time
   * @param {string} timestamp - ISO timestamp
   * @returns {string} Formatted relative time
   */
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-white text-2xl">Loading conversations...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <PageHeader
        icon="💬"
        title="Messages"
        subtitle="Chat with your study partners"
      />

      {/* Empty State - No conversations */}
      {conversations.length === 0 ? (
        <Card className="text-center py-12">
          <div className="text-6xl mb-4">💬</div>
          <h3 className="text-2xl font-bold text-white mb-2">No Conversations Yet</h3>
          <p className="text-gray-400 mb-6">
            Accept match requests to start chatting with study partners!
          </p>
          <Link
            to="/requests"
            className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-3 rounded-lg transition"
          >
            View Match Requests
          </Link>
        </Card>
      ) : (
        // Conversations List
        <div className="space-y-3">
          {conversations.map(conversation => {
            const partner = conversation.partner || {};
            const lastMessage = conversation.last_message || {};
            const hasUnread = conversation.unread_count > 0;

            return (
              <Link
                key={conversation.id}
                to={`/chat/${partner.id}`}
                className="block"
              >
                <Card hover className={hasUnread ? 'border-purple-500' : ''}>
                  <div className="flex items-center gap-4">
                    {/* Partner Avatar */}
                    <div className="relative">
                      <div className="w-14 h-14 rounded-full bg-purple-600 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                        {partner.name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      
                      {/* Online Status Indicator (optional) */}
                      {partner.is_online && (
                        <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-[#1a1d2e]"></div>
                      )}
                    </div>

                    {/* Conversation Info */}
                    <div className="flex-1 min-w-0">
                      {/* Partner Name & Timestamp */}
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <h3 className={`text-lg font-bold truncate ${hasUnread ? 'text-white' : 'text-gray-300'}`}>
                          {partner.name || 'Unknown User'}
                        </h3>
                        <span className="text-gray-500 text-xs flex-shrink-0">
                          {formatTime(lastMessage.created_at || conversation.updated_at)}
                        </span>
                      </div>

                      {/* Last Message Preview */}
                      <div className="flex items-center gap-2">
                        <p className={`text-sm truncate flex-1 ${hasUnread ? 'text-gray-300 font-medium' : 'text-gray-500'}`}>
                          {lastMessage.content || 'No messages yet'}
                        </p>
                        
                        {/* Unread Badge */}
                        {hasUnread && (
                          <span className="bg-purple-600 text-white text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0">
                            {conversation.unread_count}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}