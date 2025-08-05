document.addEventListener('DOMContentLoaded', function() {
    const chatMessages = document.getElementById('chatMessages');
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');

    // 发送消息函数
    function sendMessage() {
        const messageText = messageInput.value.trim();
        if (messageText) {
            // 添加用户消息到聊天窗口
            addMessage(messageText, 'user');
            
            // 清空输入框
            messageInput.value = '';
            
            // 模拟回复
            setTimeout(() => {
                simulateReply();
            }, 1000);
        }
    }

    // 添加消息到聊天窗口
    function addMessage(text, sender) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');
        messageElement.classList.add(sender + '-message');
        
        const now = new Date();
        const timeString = now.getHours().toString().padStart(2, '0') + ':' + 
                          now.getMinutes().toString().padStart(2, '0') + ':' + 
                          now.getSeconds().toString().padStart(2, '0');
        
        messageElement.innerHTML = `
            <span class="message-text">${escapeHtml(text)}</span>
            <span class="message-time">${timeString}</span>
        `;
        
        chatMessages.appendChild(messageElement);
        
        // 滚动到底部
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // 转义HTML特殊字符
    function escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        
        return text.replace(/[&<>"']/g, function(m) { return map[m]; });
    }

    // 模拟回复
    function simulateReply() {
        const replies = [
            "你好！很高兴和你聊天。",
            "这很有趣，能告诉我更多吗？",
            "我明白了，谢谢你的分享。",
            "这是一个很好的观点。",
            "我也这么认为。",
            "让我们换个话题聊聊吧。",
            "今天过得怎么样？"
        ];
        
        const randomReply = replies[Math.floor(Math.random() * replies.length)];
        addMessage(randomReply, 'other');
    }

    // 事件监听器
    sendButton.addEventListener('click', sendMessage);
    
    messageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // 添加系统时间消息
    function addSystemTimeMessage() {
        const now = new Date();
        const timeString = now.toLocaleString('zh-CN');
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', 'system-message');
        messageElement.innerHTML = `
            <span class="message-text">当前时间: ${timeString}</span>
            <span class="message-time"></span>
        `;
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // 页面加载完成后显示时间
    addSystemTimeMessage();
});