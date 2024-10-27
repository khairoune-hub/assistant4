const md = window.markdownit();
let threadId = null;

document.addEventListener('DOMContentLoaded', function() {
    initializeThread();
    setupEventListeners();
});

function setupEventListeners() {
    document.getElementById('send-button').addEventListener('click', sendMessage);
    document.getElementById('user-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    document.getElementById('info').addEventListener('click', function() {
        alert('BCOS Content Creation Assistant - Ready to help you generate and organize content! By: Moussa KHAIROUNE');
    });
}

async function initializeThread() {
    try {
        const response = await fetch('/api/new-thread', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        const data = await response.json();
        threadId = data.threadId;
        console.log('Thread initialized:', threadId);
    } catch (error) {
        console.error('Error initializing thread:', error);
        addMessage('Failed to initialize chat. Please refresh the page.', false);
    }
}

function addMessage(message, isUser = false) {
    const chatMessages = document.getElementById('chat-messages');
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', isUser ? 'user-message' : 'bot-message');
    
    if (!isUser) {
        const arabicPattern = /[\u0600-\u06FF]/;
        messageElement.setAttribute('dir', arabicPattern.test(message) ? 'rtl' : 'ltr');
        message = md.render(message);
    }
    
    messageElement.innerHTML = message;
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function sendMessage() {
    const userInput = document.getElementById('user-input');
    const message = userInput.value.trim();
    
    if (!message || !threadId) return;
    
    addMessage(message, true);
    userInput.value = '';
    showTypingIndicator();

    try {
        const response = await fetch('/api/openai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, threadId })
        });

        const data = await response.json();
        
        if (response.ok) {
            addMessage(data.message, false);
        } else {
            throw new Error(data.error || 'Failed to get response');
        }
    } catch (error) {
        console.error('Error:', error);
        addMessage('Sorry, I encountered an error. Please try again.', false);
    } finally {
        hideTypingIndicator();
    }
}

function showTypingIndicator() {
    document.getElementById('typing-indicator').style.display = 'block';
}

function hideTypingIndicator() {
    document.getElementById('typing-indicator').style.display = 'none';
}
