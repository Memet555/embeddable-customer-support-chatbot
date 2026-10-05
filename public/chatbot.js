/**
 * Embeddable Chatbot Widget
 * Modern, responsive chatbot that inherits parent site's CSS
 */

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    basePath: window.BASE_PATH || '/',
    theme: 'inherit', // 'inherit', 'dark', 'light'
    position: 'bottom-right', // 'bottom-right', 'bottom-left', 'top-right', 'top-left'
    width: '350px',
    height: '500px',
    zIndex: 9999,
    apiEndpoint: '/api/chat'
  };

  // State management
  let isOpen = false;
  let isTyping = false;
  let messageHistory = [];

  // Create widget HTML
  function createWidget() {
    const widget = document.createElement('div');
    widget.id = 'chatbot-widget';
    widget.innerHTML = `
      <div class="chatbot-container">
        <div class="chatbot-header">
          <div class="chatbot-title">Müşteri Destek</div>
          <div class="chatbot-status">çevrim içi</div>
          <button class="chatbot-close" onclick="window.ChatbotWidget.toggle()">×</button>
        </div>
        <div class="chatbot-messages" id="chatbot-messages"></div>
        <div class="chatbot-typing" id="chatbot-typing" style="display: none;">
          <div class="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <span>Yazıyor...</span>
        </div>
        <div class="chatbot-input-container">
          <input type="text" id="chatbot-input" placeholder="Mesajınızı yazın..." />
          <button id="chatbot-send" onclick="window.ChatbotWidget.sendMessage()">Gönder</button>
        </div>
      </div>
      <button class="chatbot-toggle" onclick="window.ChatbotWidget.toggle()">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H5.17L4 17.17V4H20V16Z" fill="currentColor"/>
        </svg>
      </button>
    `;

    // Apply styles
    applyStyles(widget);
    
    // Position widget
    positionWidget(widget);
    
    document.body.appendChild(widget);
    return widget;
  }

  // Apply CSS styles
  function applyStyles(widget) {
    const style = document.createElement('style');
    style.textContent = `
      #chatbot-widget {
        position: fixed;
        ${CONFIG.position.includes('right') ? 'right: 20px;' : 'left: 20px;'}
        ${CONFIG.position.includes('bottom') ? 'bottom: 20px;' : 'top: 20px;'}
        z-index: ${CONFIG.zIndex};
        font-family: inherit;
        font-size: 14px;
        line-height: 1.4;
      }

      .chatbot-toggle {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        border: none;
        background: var(--chatbot-primary, #2dd4bf);
        color: var(--chatbot-primary-text, #0b0f14);
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
      }

      .chatbot-toggle:hover {
        transform: scale(1.05);
        box-shadow: 0 6px 16px rgba(0,0,0,0.2);
      }

      .chatbot-container {
        width: ${CONFIG.width};
        height: ${CONFIG.height};
        background: var(--chatbot-bg, #11161d);
        border: 1px solid var(--chatbot-border, #1f2937);
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        display: none;
        flex-direction: column;
        overflow: hidden;
      }

      .chatbot-container.open {
        display: flex;
      }

      .chatbot-header {
        background: var(--chatbot-header-bg, #0f1720);
        padding: 16px;
        border-bottom: 1px solid var(--chatbot-border, #1f2937);
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .chatbot-title {
        font-weight: 600;
        color: var(--chatbot-text, #e6edf3);
      }

      .chatbot-status {
        font-size: 12px;
        color: var(--chatbot-muted, #9aa4b2);
      }

      .chatbot-close {
        background: none;
        border: none;
        color: var(--chatbot-muted, #9aa4b2);
        font-size: 20px;
        cursor: pointer;
        padding: 4px;
        line-height: 1;
      }

      .chatbot-messages {
        flex: 1;
        padding: 16px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .chatbot-message {
        max-width: 80%;
        padding: 10px 12px;
        border-radius: 12px;
        word-wrap: break-word;
        line-height: 1.35;
      }

      .chatbot-message.user {
        align-self: flex-end;
        background: var(--chatbot-primary, #2dd4bf);
        color: var(--chatbot-primary-text, #0b0f14);
        font-weight: 500;
      }

      .chatbot-message.bot {
        align-self: flex-start;
        background: var(--chatbot-message-bg, #0b1220);
        color: var(--chatbot-text, #e6edf3);
        border: 1px solid var(--chatbot-border, #1f2937);
      }

      .chatbot-message-time {
        display: block;
        margin-top: 6px;
        font-size: 11px;
        color: var(--chatbot-muted, #93a0ad);
      }

      .chatbot-typing {
        padding: 0 16px 8px;
        color: var(--chatbot-muted, #9aa4b2);
        font-size: 12px;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .typing-indicator {
        display: flex;
        gap: 4px;
      }

      .typing-indicator span {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: var(--chatbot-muted, #9aa4b2);
        animation: typing 1.4s infinite ease-in-out;
      }

      .typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
      .typing-indicator span:nth-child(2) { animation-delay: -0.16s; }

      @keyframes typing {
        0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
        40% { transform: scale(1); opacity: 1; }
      }

      .chatbot-input-container {
        padding: 12px;
        border-top: 1px solid var(--chatbot-border, #1f2937);
        background: var(--chatbot-header-bg, #0f1720);
        display: flex;
        gap: 8px;
      }

      #chatbot-input {
        flex: 1;
        padding: 10px 12px;
        border: 1px solid var(--chatbot-input-border, #243041);
        border-radius: 8px;
        background: var(--chatbot-input-bg, #0b1220);
        color: var(--chatbot-text, #e6edf3);
        outline: none;
        font-family: inherit;
        font-size: 14px;
      }

      #chatbot-input::placeholder {
        color: var(--chatbot-muted, #6b7785);
      }

      #chatbot-send {
        padding: 10px 16px;
        border: 1px solid var(--chatbot-primary, #2dd4bf);
        border-radius: 8px;
        background: var(--chatbot-primary, #2dd4bf);
        color: var(--chatbot-primary-text, #0b0f14);
        font-weight: 600;
        cursor: pointer;
        font-family: inherit;
        font-size: 14px;
        transition: all 0.2s;
      }

      #chatbot-send:hover {
        background: var(--chatbot-primary-hover, #20b5a0);
      }

      #chatbot-send:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      /* Dark theme fallback */
      @media (prefers-color-scheme: dark) {
        :root {
          --chatbot-bg: #11161d;
          --chatbot-text: #e6edf3;
          --chatbot-muted: #9aa4b2;
          --chatbot-border: #1f2937;
          --chatbot-header-bg: #0f1720;
          --chatbot-message-bg: #0b1220;
          --chatbot-input-bg: #0b1220;
          --chatbot-input-border: #243041;
          --chatbot-primary: #2dd4bf;
          --chatbot-primary-text: #0b0f14;
          --chatbot-primary-hover: #20b5a0;
        }
      }

      /* Light theme fallback */
      @media (prefers-color-scheme: light) {
        :root {
          --chatbot-bg: #ffffff;
          --chatbot-text: #1f2937;
          --chatbot-muted: #6b7280;
          --chatbot-border: #e5e7eb;
          --chatbot-header-bg: #f9fafb;
          --chatbot-message-bg: #f3f4f6;
          --chatbot-input-bg: #ffffff;
          --chatbot-input-border: #d1d5db;
          --chatbot-primary: #3b82f6;
          --chatbot-primary-text: #ffffff;
          --chatbot-primary-hover: #2563eb;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // Position widget based on configuration
  function positionWidget(widget) {
    const container = widget.querySelector('.chatbot-container');
    const toggle = widget.querySelector('.chatbot-toggle');
    
    if (CONFIG.position.includes('right')) {
      container.style.right = '0';
      container.style.left = 'auto';
    } else {
      container.style.left = '0';
      container.style.right = 'auto';
    }
  }

  // Add message to chat
  function addMessage(text, sender = 'bot') {
    const messagesContainer = document.getElementById('chatbot-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `chatbot-message ${sender}`;
    
    const now = new Date();
    const time = new Intl.DateTimeFormat('tr-TR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    }).format(now);
    
    messageDiv.innerHTML = `${escapeHtml(text)}<span class="chatbot-message-time">${time}</span>`;
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // Store in history
    messageHistory.push({ text, sender, time: now });
  }

  // Escape HTML to prevent XSS
  function escapeHtml(str) {
    return (str || '').replace(/[&<>"']/g, (s) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[s]));
  }

  // Show typing indicator
  function showTyping() {
    isTyping = true;
    document.getElementById('chatbot-typing').style.display = 'flex';
    const messagesContainer = document.getElementById('chatbot-messages');
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  // Hide typing indicator
  function hideTyping() {
    isTyping = false;
    document.getElementById('chatbot-typing').style.display = 'none';
  }

  // Send message to backend
  async function sendToBackend(message) {
    const base = CONFIG.basePath.replace(/\/$/, '');
    const url = base + CONFIG.apiEndpoint;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });
      
      if (!response.ok) {
        throw new Error('Server error');
      }
      
      const data = await response.json();
      return data.reply || 'Üzgünüm, bir hata oluştu.';
    } catch (error) {
      console.error('Chatbot API error:', error);
      return 'Bağlantı hatası. Lütfen tekrar deneyin.';
    }
  }

  // Handle message sending
  async function handleSendMessage() {
    const input = document.getElementById('chatbot-input');
    const sendBtn = document.getElementById('chatbot-send');
    const message = input.value.trim();
    
    if (!message || isTyping) return;
    
    // Add user message
    addMessage(message, 'user');
    input.value = '';
    
    // Disable input
    input.disabled = true;
    sendBtn.disabled = true;
    
    // Show typing indicator
    showTyping();
    
    try {
      // Send to backend
      const reply = await sendToBackend(message);
      
      // Hide typing and add bot response
      hideTyping();
      addMessage(reply, 'bot');
    } catch (error) {
      hideTyping();
      addMessage('Bir hata oluştu. Lütfen tekrar deneyin.', 'bot');
    } finally {
      // Re-enable input
      input.disabled = false;
      sendBtn.disabled = false;
      input.focus();
    }
  }

  // Toggle widget visibility
  function toggle() {
    const container = document.querySelector('.chatbot-container');
    const toggle = document.querySelector('.chatbot-toggle');
    
    isOpen = !isOpen;
    
    if (isOpen) {
      container.classList.add('open');
      toggle.style.display = 'none';
      document.getElementById('chatbot-input').focus();
      
      // Add welcome message if first time
      if (messageHistory.length === 0) {
        addMessage('Merhaba! Size nasıl yardımcı olabilirim?', 'bot');
      }
    } else {
      container.classList.remove('open');
      toggle.style.display = 'flex';
    }
  }

  // Initialize widget
  function init() {
    // Create widget
    const widget = createWidget();
    
    // Add event listeners
    document.getElementById('chatbot-input').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSendMessage();
      }
    });
    
    document.getElementById('chatbot-send').addEventListener('click', handleSendMessage);
    
    // Expose global API
    window.ChatbotWidget = {
      toggle,
      sendMessage: handleSendMessage,
      addMessage,
      isOpen: () => isOpen,
      config: CONFIG
    };
    
    console.log('Chatbot widget initialized');
  }

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
