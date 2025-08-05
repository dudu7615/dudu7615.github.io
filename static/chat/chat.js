document.addEventListener('DOMContentLoaded', function() {
    const chatMessages = document.getElementById('chatMessages');
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');

    // AI初始人设
    const aiPersona = {
        role: 'system',
        content: '你是蓝轩宇，被誉为“龙神血脉继承者”。一头乌黑短发尽显干练，深邃如星辰的眼眸仿佛藏着无尽奥秘，身姿挺拔，身着一袭蓝色劲装，英姿飒爽。\n- 性格特点：勇敢，面对任何危险都敢挺身而出；坚毅，无论多大的困难都无法让你放弃；聪慧，总能想出巧妙的办法解决难题；自信，对自己的实力充满信心；沉稳，遇事从不慌乱。\n- 你拥有“龙神变”“元素掌控”“时空之力”等强大技能，熟悉斗罗大陆的故事，能生动讲述自己的传奇经历。说话时语气坚定有力，充满自信。\n- 你的目标是不断提升实力，守护身边的人，探索斗罗大陆的未知奥秘。妻子白秀秀是你的逆鳞，你会拼尽全力保护她。在与对手对决时，严格按照斗罗大陆四终极斗罗的设定运用魂技，还拥有大量魂导器，实力已达真神级。'
    };

    // 存储对话历史，初始化时加入人设
    let conversationHistory = [aiPersona];

    // 发送消息函数
    function sendMessage() {
        const messageText = messageInput.value.trim();
        if (messageText) {
            // 添加用户消息到聊天窗口
            addMessage(messageText, 'user');
            
            // 添加用户消息到历史记录
            conversationHistory.push({
                role: 'user',
                content: messageText
            });
            
            // 清空输入框
            messageInput.value = '';
            
            // 调用AI接口获取回复
            getAIReply(messageText);
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
        
        // 使用 marked.js 格式化消息内容
        const formattedText = marked.parse(escapeHtml(text));
        
        messageElement.innerHTML = `
            <span class="message-text">${formattedText}</span>
            <span class="message-time">${timeString}</span>
        `;
        
        chatMessages.appendChild(messageElement);
        
        // 滚动到底部
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        return messageElement;
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

    // 创建AI回复消息容器
    function createAIReplyContainer() {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', 'other-message');
        
        const now = new Date();
        const timeString = now.getHours().toString().padStart(2, '0') + ':' + 
                          now.getMinutes().toString().padStart(2, '0') + ':' + 
                          now.getSeconds().toString().padStart(2, '0');
        
        messageElement.innerHTML = `
            <span class="message-text"></span>
            <span class="message-time">${timeString}</span>
        `;
        
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        return messageElement.querySelector('.message-text');
    }

    // 调用AI接口获取流式回复
    async function getAIReply(userMessage) {
        try {
            const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer 6d1847d3044742498efb0c63b37bc904.fstXIOTUYIKZI4oa',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: "GLM-4-Flash-250414",
                    messages: conversationHistory,
                    stream: true  // 开启流式回复
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder('utf-8');
            let aiMessageContainer = null;
            let accumulatedText = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data:')) {
                        const data = line.substring(5).trim();
                        
                        if (data === '[DONE]') {
                            // 流式传输完成，将AI回复添加到历史记录
                            conversationHistory.push({
                                role: 'assistant',
                                content: accumulatedText
                            });
                            break;
                        }

                        try {
                            const parsed = JSON.parse(data);
                            const content = parsed.choices[0]?.delta?.content;
                            
                            if (content) {
                                if (!aiMessageContainer) {
                                    aiMessageContainer = createAIReplyContainer();
                                }
                                
                                accumulatedText += content;
                                // 使用 marked.js 格式化AI回复内容
                                aiMessageContainer.innerHTML = marked.parse(accumulatedText);
                                chatMessages.scrollTop = chatMessages.scrollHeight;
                            }
                        } catch (e) {
                            // 解析错误，跳过这一行
                            continue;
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error getting AI reply:', error);
            addMessage('抱歉，获取回复时出现错误，请稍后重试。'+error, 'other');
        }
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