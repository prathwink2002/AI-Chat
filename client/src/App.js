
import { FaCommentDots, FaUsers, FaEnvelope, FaTachometerAlt, FaSearch, FaEllipsisV, FaTrash, FaComment, FaEdit } from "react-icons/fa";
import React, { useEffect, useState } from 'react';

function LoginPage({ onLogin, onSwitchToRegister, error }) {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!phone || !password) {
      return;
    }
    const response = await fetch('http://localhost:4000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, password }),
    });
    const data = await response.json();
    if (response.ok) {
      onLogin(data);
    } else {
      onLogin(null, data.message);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleLogin}>
        <h2>Login</h2>
        {error && <p className="auth-error">{error}</p>}
        <input
          type="text"
          placeholder="Mobile Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="auth-btn">Login</button>
        <p className="auth-switch">
          Don't have an account? <button type="button" onClick={onSwitchToRegister}>Register</button>
        </p>
      </form>
    </div>
  );
}

function RegisterPage({ onRegister, onSwitchToLogin, error }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passError, setPassError] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setPassError("Passwords do not match.");
      return;
    }
    setPassError('');
    const response = await fetch('http://localhost:4000/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone, password }),
    });
    const data = await response.json();
    if (response.ok) {
      onRegister(data);
    } else {
      onRegister(null, data.message);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleRegister}>
        <h2>Create Account</h2>
        {error && <p className="auth-error">{error}</p>}
        {passError && <p className="auth-error">{passError}</p>}
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Mobile Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <button type="submit" className="auth-btn">Register</button>
        <p className="auth-switch">
          Already have an account? <button type="button" onClick={onSwitchToLogin}>Login</button>
        </p>
      </form>
    </div>
  );
}

// ---------------- Sidebar ----------------
function Sidebar({ activeTab, setActiveTab }) {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-title">AI-Chat</div>
      </div>
      <div className="sidebar-icons">
        <div
          className={"icon " + (activeTab === "chats" ? "active" : "")}
          onClick={() => setActiveTab("chats")}
        >
          <FaCommentDots size={22} />
        </div>
        <div
          className={"icon " + (activeTab === "contacts" ? "active" : "")}
          onClick={() => setActiveTab("contacts")}
        >
          <FaUsers size={22} />
        </div>
      </div>
    </div>
  );
}

// ---------------- Unified Top Bar for Left Panel ----------------
function LeftPanelTopBar({ activeTab, onAddContact, contacts, onSelectChat, onLogout, currentUser }) {
  const [showMessagesDropdown, setShowMessagesDropdown] = useState(false);
  const [showDashboardDropdown, setShowDashboardDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowMessagesDropdown(false);
      setShowDashboardDropdown(false);
      setSearchTerm(''); // Reset search when closing
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleContactSelect = (contact) => {
    onSelectChat(contact);
    setShowMessagesDropdown(false);
    setSearchTerm(''); // Reset search after selection
  };

  // Filter contacts based on search term
  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (contact.phone && contact.phone.includes(searchTerm))
  );

  const handleLogout = () => {
    onLogout();
    console.log("Logging out...");
  };

  return (
    <div className="left-panel-header">
      <h3 className="tab-title">
        {activeTab === "chats" ? "Chats" : "Contacts"}
      </h3>
      <div className="header-buttons">
        <div className="header-top-buttons">
          <div className="messages-dropdown-container">
            <button 
              className="header-btn" 
              title="Messages"
              onClick={(e) => {
                e.stopPropagation();
                setShowMessagesDropdown(!showMessagesDropdown);
              }}
            >
              <FaEnvelope size={16} />
            </button>
            {showMessagesDropdown && (
              <div className="messages-dropdown">
                <div className="messages-dropdown-header">
                  Select a contact to message
                </div>
                
                {/* Search Bar */}
                <div className="messages-dropdown-search">
                  <div className="search-input-wrapper">
                    <FaSearch className="search-icon" size={14} />
                    <input
                      type="text"
                      className="search-input"
                      placeholder="Search contacts..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>

                <div className="messages-dropdown-list">
                  {filteredContacts.length > 0 ? (
                    filteredContacts.map(contact => (
                      <div
                        key={contact.id}
                        className="messages-dropdown-item"
                        onClick={() => handleContactSelect(contact)}
                      >
                        <div className="dropdown-contact-avatar">
                          {contact.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="dropdown-contact-info">
                          <div className="dropdown-contact-name">{contact.name}</div>
                          <div className="dropdown-contact-phone">
                            {contact.phone || "No phone number"}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : searchTerm ? (
                    <div className="no-contacts-message">
                      No contacts found for "{searchTerm}"
                    </div>
                  ) : (
                    <div className="no-contacts-message">
                      No contacts available
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="dashboard-dropdown-container">
            <button 
              className={`header-btn ${showDashboardDropdown ? 'active' : ''}`}
              title="Dashboard"
              onClick={(e) => {
                e.stopPropagation();
                setShowDashboardDropdown(!showDashboardDropdown);
                setShowMessagesDropdown(false); // Close messages dropdown
              }}
            >
              <FaTachometerAlt size={16} />
            </button>
            {showDashboardDropdown && (
              <div className="dashboard-dropdown">
                <div className="dashboard-dropdown-header">
                  {currentUser?.name || "Dashboard"}
                </div>
                <div className="dashboard-dropdown-list">
                  <button className="dashboard-dropdown-item" onClick={handleLogout}>
                    <div className="dropdown-item-icon">🚪</div>
                    <div className="dropdown-item-text">Logout</div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        {activeTab === "contacts" && (
          <button className="add-contact-btn" onClick={onAddContact}>
            + Add Contact
          </button>
        )}
      </div>
    </div>
  );
}

// ---------------- Chats Tab ----------------
function ChatsTab({ chats, activeChat, onSelectChat }) {
  const [searchTerm, setSearchTerm] = useState("");

  // Filter chats based on search term
  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().startsWith(searchTerm.toLowerCase())
  );

  return (
    <div className="chats-container">
      {/* Search Bar */}
      <div className="search-container">
        <div className="search-input-wrapper">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search chats..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="chat-list">
        {filteredChats.length > 0 ? (
          filteredChats.map(chat => (
            <div
              key={chat.id}
              className={"chat-preview " + (activeChat?.id === chat.id ? "active" : "")}
              onClick={() => onSelectChat(chat)}
            >
              <div className="chat-avatar">{chat.name.charAt(0)}</div>
              <div className="chat-info">
                <div className="chat-name">{chat.name}</div>
                <div className="chat-last">
                  {chat.lastMessage?.content || "start messaging.."}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-results">
            {searchTerm ? "No chats found" : "No chats available"}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------- Contacts Tab ----------------
function ContactsTab({ contacts, onSelectChat, onRefreshContacts }) {

  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteMenu, setShowDeleteMenu] = useState(null);
  const [showRenameModal, setShowRenameModal] = useState(null);
  const [newName, setNewName] = useState("");

  // Filter contacts based on search term
  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().startsWith(searchTerm.toLowerCase())
  );

  const handleDeleteContact = async (contactId) => {
    if (!confirm("Are you sure you want to delete this contact?")) return;
    
    try {
      await fetch(`http://localhost:4000/api/contacts/${contactId}`, {
        method: "DELETE",
      });
      onRefreshContacts();
      setShowDeleteMenu(null);
    } catch (error) {
      console.error("Error deleting contact:", error);
    }
  };

  const handleRenameContact = async (contactId) => {
    if (!newName.trim()) return;
    
    try {
      await fetch(`http://localhost:4000/api/contacts/${contactId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() })
      });
      onRefreshContacts(); // This refreshes the contacts list
      setShowRenameModal(null);
      setNewName("");
    } catch (error) {
      console.error("Error renaming contact:", error);
    }
  };

  const handleContactClick = (e, contactId) => {
    e.stopPropagation();
    setShowDeleteMenu(showDeleteMenu === contactId ? null : contactId);
  };

  const handleStartChat = (e, contact) => {
    e.stopPropagation();
    onSelectChat(contact);
    setShowDeleteMenu(null);
  };

  const openRenameModal = (e, contact) => {
    e.stopPropagation();
    setShowRenameModal(contact.id);
    setNewName(contact.name);
    setShowDeleteMenu(null);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setShowDeleteMenu(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="contacts-container">
      {/* Search Bar */}
      <div className="search-container">
        <div className="search-input-wrapper">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* Contact List */}
      <div className="contact-list">
        {filteredContacts.length > 0 ? (
          filteredContacts.map(c => (
            <div key={c.id} className="contact-item">
              <div className="avatar">{c.name.charAt(0).toUpperCase()}</div>
              <div 
                className="details"
                onClick={(e) => handleContactClick(e, c.id)}
              >
                <div className="contact-name-container">
                  <strong className="contact-name">
                    {c.name}
                  </strong>
                  {showDeleteMenu === c.id && (
                    <div className="contact-delete-menu">
                      <div 
                        className="contact-menu-item rename"
                        onClick={(e) => openRenameModal(e, c)}
                      >
                        <FaEdit size={12} />
                        Rename Contact
                      </div>
                      <div 
                        className="contact-menu-item delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteContact(c.id);
                        }}
                      >
                        <FaTrash size={12} />
                        Delete Contact
                      </div>
                    </div>
                  )}
                </div>
                <span className="contact-phone">{c.phone || "No phone number"}</span>
              </div>
              <button 
                className="start-chat-btn"
                onClick={(e) => handleStartChat(e, c)}
                title="Start Chat"
              >
                <FaComment size={16} />
              </button>
            </div>
          ))
        ) : (
          <div className="no-results">
            {searchTerm ? "No contacts found" : "No contacts available"}
          </div>
        )}
      </div>

      {/* Rename Modal */}
      {showRenameModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Rename Contact</h2>
            <input
              type="text"
              placeholder="Enter new name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleRenameContact(showRenameModal)}
            />
            <div className="modal-buttons">
              <button 
                className="modal-btn cancel"
                onClick={() => {
                  setShowRenameModal(null);
                  setNewName("");
                }}
              >
                Cancel
              </button>
              <button 
                className="modal-btn add"
                onClick={() => handleRenameContact(showRenameModal)}
              >
                Rename
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------- Add Contact Modal ----------------
function AddContactModal({ onClose, onAdd }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const handleSubmit = async () => {
    if (!name.trim() || !phone.trim()) return;
    await fetch("http://localhost:4000/api/contacts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone }),
    });
    onAdd();
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Add New Contact</h2>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Mobile Number"
          value={phone}
          onChange={e => setPhone(e.target.value)}
        />
        <div className="modal-buttons">
          <button className="modal-btn add" onClick={handleSubmit}>
            Add Contact
          </button>
          <button className="modal-btn cancel" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------- Forward Message Modal ----------------
function ForwardMessageModal({ message, contacts, onClose, onForward, currentUser }) {
  const [selectedContact, setSelectedContact] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Filter contacts based on search term
  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleForward = async () => {
    if (!selectedContact) {
      alert("Please select a contact to forward the message to.");
      return;
    }

    try {
      await fetch("http://localhost:4000/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contact_id: selectedContact.id,
          sender: currentUser.name,
          receiver: selectedContact.name,
          content: `Forwarded: ${message.content}`,
          auto_reply: true, // Enable auto-reply for forwarded messages
        }),
      });

      onForward(selectedContact);
      onClose();
    } catch (error) {
      console.error('Error forwarding message:', error);
      alert('Failed to forward message. Please try again.');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal forward-modal">
        <h2>Forward Message</h2>
        <div className="forward-message-preview">
          <strong>Message to forward:</strong>
          <div className="message-preview">"{message.content}"</div>
        </div>
        
        <div className="forward-search">
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="forward-contact-list">
          {filteredContacts.length > 0 ? (
            filteredContacts.map(contact => (
              <div
                key={contact.id}
                className={`forward-contact-item ${selectedContact?.id === contact.id ? 'selected' : ''}`}
                onClick={() => setSelectedContact(contact)}
              >
                <div className="contact-avatar">{contact.name.charAt(0).toUpperCase()}</div>
                <div className="contact-info">
                  <div className="contact-name">{contact.name}</div>
                  <div className="contact-phone">{contact.phone || "No phone number"}</div>
                </div>
                {selectedContact?.id === contact.id && (
                  <div className="selected-indicator">✓</div>
                )}
              </div>
            ))
          ) : (
            <div className="no-contacts">
              {searchTerm ? "No contacts found" : "No contacts available"}
            </div>
          )}
        </div>

        <div className="modal-buttons">
          <button 
            className="modal-btn cancel" 
            onClick={onClose}
          >
            Cancel
          </button>
          <button 
            className="modal-btn forward" 
            onClick={handleForward}
            disabled={!selectedContact}
          >
            Forward
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------- Chat Window ----------------
function ChatWindow({ contact, contacts = [], currentUser, onSelectContact }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [showMessageMenu, setShowMessageMenu] = useState(null);
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [messageToForward, setMessageToForward] = useState(null);
  const [deletedMessages, setDeletedMessages] = useState(new Set()); // Track locally deleted messages

  useEffect(() => {
    if (!contact) return;
    fetchMessages();
  }, [contact]);

  async function fetchMessages() {
    try {
      const r = await fetch(`http://localhost:4000/api/messages/${contact.id}`);
      const data = await r.json();
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }

  async function send() {
    if (!text.trim()) return;
    try {
      await fetch("http://localhost:4000/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contact_id: contact.id,
          sender: currentUser.name,
          receiver: contact.name,
          content: text,
          auto_reply: true,
        }),
      });
      setText("");
      fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }

  async function deleteMessage(messageId) {
    if (!confirm("Are you sure you want to delete this message?")) return;
    
    try {
      console.log(`Deleting message ID: ${messageId}`);
      
      const response = await fetch(`http://localhost:4000/api/messages/single/${messageId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Delete message result:', result);
      
      // Remove the message from the local state
      setMessages(prevMessages => prevMessages.filter(msg => msg.id !== messageId));
      setShowMessageMenu(null);
      
    } catch (error) {
      console.error('Error deleting message:', error);
      alert('Failed to delete message. Please try again.');
    }
  }

  function handleForwardMessage(message) {
    setMessageToForward(message);
    setShowForwardModal(true);
    setShowMessageMenu(null);
  }

  function handleForwardComplete(selectedContact) {
    alert(`Message forwarded to ${selectedContact.name} successfully!`);
    // Optionally, you could switch to that contact's chat
    // onSelectContact(selectedContact);
  }

  function handleMessageClick(e, message) {
    e.stopPropagation();
    // Only show menu for received messages
    if (message.sender !== currentUser.name) {
      setShowMessageMenu(showMessageMenu === message.id ? null : message.id);
    }
  }

  async function clearChat() {
    if (!confirm("Are you sure you want to clear this chat? This action cannot be undone.")) return;
    
    try {
      console.log(`Clearing chat for contact ID: ${contact.id}`);
      
      const response = await fetch(`http://localhost:4000/api/messages/${contact.id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Clear chat result:', result);
      
      setMessages([]);
      setShowMenu(false);
      
    } catch (error) {
      console.error('Error clearing chat:', error);
      alert('Failed to clear chat. Please try again.');
    }
  }

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowMenu(false);
      setShowMessageMenu(null);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  function exitChat() {
    setShowMenu(false);
    // onExitChat(); // Removed since we're using direct state management
  }

  // Handle sender message clicks for dropdown
  const handleSenderMessageClick = (e, message) => {
    e.stopPropagation();
    setShowMessageMenu(showMessageMenu === message.id ? null : message.id);
  };

  // Handle delete from me (local deletion)
  const handleDeleteFromMe = (messageId) => {
    setDeletedMessages(prev => new Set([...prev, messageId]));
    setShowMessageMenu(null);
  };

  // Handle delete from everyone (server deletion)
  const handleDeleteFromEveryone = async (messageId) => {
    try {
      const response = await fetch(`http://localhost:4000/api/messages/single/${messageId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchMessages(); // Refresh messages from server
      } else {
        alert('Failed to delete message. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      alert('Failed to delete message. Please try again.');
    }
    setShowMessageMenu(null);
  };

  // Filter out locally deleted messages
  const visibleMessages = messages.filter(m => !deletedMessages.has(m.id));

  if (!contact)
    return (
      <div className="chat-empty">Select a contact to start messaging</div>
    );

  return (
    <div className="chat">
      <div className="chat-header">
        <div className="chat-header-avatar">{contact.name.charAt(0).toUpperCase()}</div>
        <div className="chat-header-info">
          <div className="chat-header-name">{contact.name}</div>
          <div className="chat-header-status">Online</div>
        </div>
        <div className="chat-menu-container">
          <button 
            className="chat-menu-btn" 
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
          >
            <FaEllipsisV />
          </button>
          {showMenu && (
            <div className="chat-dropdown">
              <div 
                className="chat-dropdown-item"
                onClick={clearChat}
              >
                Clear Chat
              </div>
              <div 
                className="chat-dropdown-item"
                onClick={exitChat}
              >
                Exit Chat
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="messages">
        {visibleMessages.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#6b7280', marginTop: '50px' }}>
            No messages yet. Start the conversation!
          </div>
        ) : (
          visibleMessages.map(m => (
            <div
              key={m.id}
              className={"message " + (m.sender === currentUser.name ? "sent" : "received")}
              onClick={(e) => {
                if (m.sender === currentUser.name) {
                  handleSenderMessageClick(e, m);
                } else {
                  handleMessageClick(e, m);
                }
              }}
              style={{ position: 'relative', cursor: m.sender === currentUser.name ? 'pointer' : 'default' }}
            >
              <div className="content">{m.content}</div>
              <div className="meta">{m.sender} • {new Date(m.timestamp).toLocaleString()}</div>
              
              {/* Message options menu for received messages */}
              {showMessageMenu === m.id && m.sender !== currentUser.name && (
                <div className="message-dropdown">
                  <div 
                    className="message-dropdown-item"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteMessage(m.id);
                    }}
                  >
                    <FaTrash size={12} />
                    Delete Message
                  </div>
                  <div 
                    className="message-dropdown-item"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleForwardMessage(m);
                    }}
                  >
                    <FaEnvelope size={12} />
                    Forward Message
                  </div>
                </div>
              )}
              
              {/* Dropdown for sender messages */}
              {m.sender === currentUser.name && showMessageMenu === m.id && (
                <div className="message-dropdown" onClick={(e) => e.stopPropagation()}>
                  <div 
                    className="message-dropdown-item"
                    onClick={() => handleDeleteFromMe(m.id)}
                  >
                    🗑️ Delete from me
                  </div>
                  <div 
                    className="message-dropdown-item"
                    onClick={() => handleDeleteFromEveryone(m.id)}
                  >
                    🗑️ Delete from everyone
                  </div>
                  <div 
                    className="message-dropdown-item"
                    onClick={() => handleForwardMessage(m)}
                  >
                    ↗️ Forward
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
      <div className="composer">
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Type a message..."
          onKeyPress={(e) => e.key === 'Enter' && send()}
        />
        <button onClick={send}>Send</button>
      </div>

      {/* Forward Message Modal */}
      {showForwardModal && messageToForward && (
        <ForwardMessageModal
          message={messageToForward}
          contacts={contacts.filter(c => c.id !== contact?.id)} // Exclude current contact
          onClose={() => setShowForwardModal(false)}
          onForward={handleForwardComplete}
          currentUser={currentUser}
        />
      )}
    </div>
  );
}

// ---------------- App ----------------
export default function App() {
  const [user, setUser] = useState(null);
  const [authError, setAuthError] = useState('');
  const [view, setView] = useState('login'); // 'login', 'register'

  const [activeTab, setActiveTab] = useState("chats");
  const [contacts, setContacts] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [messageToForward, setMessageToForward] = useState(null);
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('currentUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const handleLogin = (userData, error) => {
    if (userData) {
      setUser(userData);
      setAuthError('');
      setCurrentUser(userData);
      localStorage.setItem('currentUser', JSON.stringify(userData));
    } else {
      setAuthError(error || 'Login failed. Please try again.');
    }
  };

  const handleRegister = (userData, error) => {
    if (userData) {
      setUser(userData);
      setAuthError('');
      setCurrentUser(userData);
      localStorage.setItem('currentUser', JSON.stringify(userData));
    } else {
      setAuthError(error || 'Registration failed. Please try again.');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setView('login');
    setAuthError('');
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  useEffect(() => {
    if (user) {
      fetchContacts();
    }
  }, [user]);

  const fetchContacts = async () => {
    const res = await fetch("http://localhost:4000/api/contacts");
    const data = await res.json();
    setContacts(data);
  };

  const fetchMessages = async (contactId) => {
    const res = await fetch(`http://localhost:4000/api/messages/${contactId}`);
    const data = await res.json();
    setMessages(data);
  };

  if (!user) {
    if (view === 'register') {
      return <RegisterPage onRegister={handleRegister} onSwitchToLogin={() => setView('login')} error={authError} />;
    } else {
      return <LoginPage onLogin={handleLogin} onSwitchToRegister={() => setView('register')} error={authError} />;
    }
  }

  return (
    <div className="app">
      {/* Main layout */}
      <div className="main">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Left panel for chats/contacts */}
        <div className="left-panel">
          <LeftPanelTopBar 
            activeTab={activeTab} 
            onAddContact={() => setShowAddContactModal(true)} 
            contacts={contacts}
            onSelectChat={setActiveChat}
            onLogout={handleLogout}
            currentUser={currentUser}
          />
          <div className="tab-content">
            {activeTab === "chats" && (
              <ChatsTab
                chats={contacts}
                activeChat={activeChat}
                onSelectChat={setActiveChat}
              />
            )}
            {activeTab === "contacts" && (
  <ContactsTab
    contacts={contacts}
    onSelectChat={setActiveChat}
    onRefreshContacts={fetchContacts}
  />
)}
          </div>
        </div>

        {/* Right panel for chat window */}
        <ChatWindow contact={activeChat} contacts={contacts} currentUser={currentUser} onSelectContact={setActiveChat} />
      </div>

      {showAddContactModal && (
        <AddContactModal
          onClose={() => setShowAddContactModal(false)}
          onAdd={fetchContacts}
        />
      )}
    </div>
  );
}
