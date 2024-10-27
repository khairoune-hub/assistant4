let apiUrl = "https://assistant3-khairoune-hub-khairoune-hubs-projects.vercel.app/api/chat";

window.addEventListener('load', () => {
    const spinner = document.getElementById('spinner');
    const minimumLoadingTime = 1000;
    setTimeout(() => {
        spinner.style.display = 'none';
    }, minimumLoadingTime);
});

const button = document.getElementById('info');
button.addEventListener('click', function() {
    alert('This is your BCOS content creation assistant, ready to help you generate and organize content!, by : Moussa KHAIROUNE ');
});

let threadId = null;

document.addEventListener('DOMContentLoaded', function() {
    initializeThread();
    document.getElementById('send-button').addEventListener('click', sendMessage);
    document.getElementById('user-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
});

function convertToHtml(message) {
    md = window.markdownit()
    return md.render(message);
}

function addMessage(Message, isUser = false) {
    const chatMessages = document.getElementById('chat-messages');
    const messageWrapper = document.createElement('div');
    messageWrapper.classList.add('message-wrapper');

    if (isUser) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', 'user-message');
        messageElement.innerHTML = Message;
        messageWrapper.appendChild(messageElement);
    } else {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', 'bot-message');
        const arabicPattern = /[\u0600-\u06FF]/;
          
        if (arabicPattern.test(Message)) {
            messageElement.setAttribute('dir', 'rtl');
        } else {
            messageElement.setAttribute('dir', 'ltr');
        }
        messageElement.innerHTML = convertToHtml(Message);
        messageWrapper.appendChild(messageElement);
    }

    const typingIndicator = document.getElementById('typing-indicator');
    chatMessages.insertBefore(messageWrapper, typingIndicator);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showTypingIndicator() {
    document.getElementById('typing-indicator').style.display = 'block';
    const chatMessages = document.getElementById('chat-messages');
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function hideTypingIndicator() {
    document.getElementById('typing-indicator').style.display = 'none';
}

async function initializeThread() {
    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ action: 'new_thread' })
        });
        const data = await response.json();
        threadId = data.threadId;
        console.log('Thread initialized:', threadId);
    } catch (error) {
        console.error('Error initializing thread:', error);
    }
}

function sendMessage() {
    const userInput = document.getElementById('user-input');
    const message = userInput.value.trim();
    
    if (message === '') return;
    
    addMessage(message, true);
    userInput.value = '';
    getBotResponse(message);
}

async function getBotResponse(userMessage) {
    showTypingIndicator();

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: userMessage })
        });

        const data = await response.json();

        if (response.ok) {
            addMessage(data.message, false);
        } else {
            throw new Error(data.error || 'Failed to get bot response');
        }
    } catch (error) {
        console.error('Error getting bot response:', error);
        addMessage('Sorry, I encountered an error. Please try again.', false);
    } finally {
        hideTypingIndicator();
    }
}