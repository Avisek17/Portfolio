import React, { useState, useEffect } from 'react';
import './messages.scss';

// Import API service from services folder instead of using axios directly
import { contactAPI } from '../../services/api';

const MessagesManager = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  useEffect(() => {
    loadMessages();
  }, []);
  
  const loadMessages = async () => {
    setLoading(true);
    try {
      const response = await contactAPI.getAll();
      if (response.status === 'success') {
        setMessages(response.data);
      }
    } catch (error) {
      setError(`Failed to load messages: ${error.message}`);
    }
    setLoading(false);
  };
  
  const handleMarkAsRead = async (id) => {
    try {
      const response = await contactAPI.markAsRead(id);
      if (response.status === 'success') {
        setMessages(messages.map(msg => 
          msg._id === id ? { ...msg, read: true } : msg
        ));
        setSuccess('Message marked as read');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      setError(`Failed to update message: ${error.message}`);
    }
  };
  
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      try {
        const response = await contactAPI.delete(id);
        if (response.status === 'success') {
          setMessages(messages.filter(msg => msg._id !== id));
          setSuccess('Message deleted successfully');
          setTimeout(() => setSuccess(''), 3000);
        }
      } catch (error) {
        setError(`Failed to delete message: ${error.message}`);
      }
    }
  };
  
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  if (loading && messages.length === 0) {
    return <div className="admin-loading">Loading messages...</div>;
  }
  
  return (
    <div className="messages-manager admin-page">
      {/* Page Header */}
      <div className="admin-page__header">
        <div className="admin-page__header-content">
          <h1 className="admin-page__title">Messages</h1>
          <p className="admin-page__subtitle">Manage contact form submissions</p>
        </div>
        <div className="admin-page__actions">
          <button 
            className="admin-btn admin-btn--secondary"
            onClick={loadMessages}
            disabled={loading}
          >
            <span className="admin-btn__icon">🔄</span>
            Refresh
          </button>
        </div>
      </div>
      
      {/* Success/Error Messages */}
      {error && (
        <div className="admin-error">
          {error}
          <button onClick={() => setError('')} className="admin-error__close">×</button>
        </div>
      )}
      
      {success && (
        <div className="admin-success">
          {success}
          <button onClick={() => setSuccess('')} className="admin-success__close">×</button>
        </div>
      )}
      
      {/* Messages List */}
      <div className="messages-list">
        {messages.length === 0 ? (
          <div className="admin-empty">
            <p>No messages received yet.</p>
          </div>
        ) : (
          messages.map(message => (
            <div 
              key={message._id} 
              className={`message-card ${!message.read ? 'message-card--unread' : ''}`}
            >
              <div className="message-card__header">
                <h3 className="message-card__subject">{message.subject}</h3>
                <div className="message-card__meta">
                  <span className="message-card__date">{formatDate(message.createdAt)}</span>
                  {!message.read && (
                    <span className="message-card__status">New</span>
                  )}
                </div>
              </div>
              
              <div className="message-card__sender">
                <strong>From:</strong> {message.name} &lt;{message.email}&gt;
              </div>
              
              <div className="message-card__content">
                {message.message}
              </div>
              
              <div className="message-card__actions">
                {!message.read && (
                  <button 
                    className="admin-btn admin-btn--small admin-btn--primary"
                    onClick={() => handleMarkAsRead(message._id)}
                  >
                    Mark as Read
                  </button>
                )}
                <button 
                  className="admin-btn admin-btn--small admin-btn--danger"
                  onClick={() => handleDelete(message._id)}
                >
                  Delete
                </button>
                <a 
                  href={`mailto:${message.email}?subject=Re: ${message.subject}`}
                  className="admin-btn admin-btn--small admin-btn--secondary"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Reply
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MessagesManager;
