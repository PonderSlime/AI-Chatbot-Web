
import { HfInference} from;

(function () {
    document.head.insertAdjacentHTML('beforeend', '<link href="https://cdnjs.cloudflare.com/ajax/libs/tailwindcss/2.2.16/tailwind.min.css" rel="stylesheet">');
    
    const style = document.createElement('style');
    style.innerHTML = `
    .hidden {
        display: none;
    }
    #chat-widget-container {
        position: fixed;
        bottom: 20px;
        right: 20px;
        flex-direction: column;
    }
    .chatbot__arrow--left {
        border-top: 6px solid transparent;
        border-bottom: 6px solid transparent;
        border-right: 6px solid #f0f0f0;
    }
    .chatbot__arrow {
    width: 0;
    height: 0;
    margin-top: 18px;
    }
    .chatbot__arrow--right {
    border-top: 6px solid transparent;
    border-bottom: 6px solid transparent;
    border-left: 6px solid #1a181e;
    } 
    
    #chat-popup {
        height: 70vh;
        max-height: 70vh;
        transition: all 0.3s;
        overflow: hidden;
        position:relative;
    }

    .content-loader {
        display: none;
        padding: 12px 20px;
        position: absolute;
        z-index: 1;
        right: 50px;
        bottom: 100px;
    }


    
    .typing-loader::after {
        content: "Agent is typing.....";
        animation: typing 1s steps(1) infinite, blink .75s step-end infinite;
        font-size:10px;
    }
    
    @keyframes typing {
        from,to { width: 0; }
        50% { width: 15px; }
    }
    
    @keyframes blink {
        50% { color: transparent; }
    }
    @media (max-width: 768px) {
        #chat-popup {
        position: fixed;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 100%;
        max-height: 100%;
        border-radius: 0;
        }
    }
    .icon {
        width: 32px;
        height: 32px;
        background-image: url('./assets/icon.png');
    }`;

    document.head.appendChild(style);

    const chatWidgetContainer = document.createElement('div');
    chatWidgetContainer.id = 'chat-widget-container';
    document.body.appendChild(chatWidgetContainer);

    chatWidgetContainer.innerHTML = `
    <div id="chat-bubble" class="w-16 h-16 bg-purple-800 rounded-full flex items-center justify-center cursor-pointer text-3xl">
    <div class="icon"></div>
    </div>
    <div id="chat-popup" class="hidden absolute bottom-20 right-0 w-96 bg-white rounded-md shadow-md flex flex-col transition-all text-sm">
        <div id="chat-header" class="flex justify-between items-center p-4 bg-purple-800 text-white">
            <h3 class="m-0 text-lg">Travel Chat Support</h3>
            <button id="close-popup" class="bg-transparent border-none text-white cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            </button>
        </div>
        <div class="content-loader">
    <div class="typing-loader"></div>
    </div>
        <div id="chat-messages" class="flex-1 p-4 overflow-y-auto"></div>
        <div id="chat-input-container" class="p-4 border-t border-purple-200">
            <div class="flex space-x-4 items-center">
            <input type="text" id="chat-input" class="flex-1 border border-purple-300 rounded-md px-4 py-2 outline-none w-3/4" placeholder="Type your message...">
            <button id="chat-submit" class="bg-purple-800 text-white rounded-md px-4 py-2 cursor-pointer">Send</button>
            </div>
            <div class="flex text-center text-xs pt-4">
            <span class="flex-1">Powered by <a href="https://www.youtube.com/@doiteasy5568" target="_blank" class="text-purple-600">@doiteasy</a></span>
            </div>
        </div>
    </div>
    `;
    const chatInput = document.getElementById('chat-input');
    const chatSubmit = document.getElementById('chat-submit');
    const chatBubble = document.getElementById('chat-bubble');
    const chatPopup = document.getElementById('chat-messages');
    const chatMessages = document.getElementById('chat-messages')
    const loader = document.querySelector('.content-loader');
    const closePopup = document.getElementById('close-popup');

    chatSubmit.addEventListener('click', function () {
        const message = chatInput.value.trim();
        if  (!message) return;
        
        chatMessages.scrollTop = chatMessages.scrollHeight;

        chatInput.value = '';

        onUserRequest(message);
        getHuggingFaceResponse(message);
    });

    chatInput.addEventListener('keyup', function (event) {
        if (event.key === 'Enter') {
            chatSubmit.click();
        }
    });

    chatBubble.addEventListener('click', function () {
        togglePopup();
    });

    closePopup.addEventListener('click', function () {
        togglePopup();
    });

    function togglePopup() {
        const chatPopup = document.getElementById('chat-popup');
        chatPopup.classList.toggle('hidden');
        if (!chatPopup.classList.contains('hiddne')) {
            document.getElementById('chat-input').focus();
        }
    }

    function highlightContactDetails(text) {
        // Email regex
        const emailRegex = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
        // Phone number regex
        const phoneRegex = /(\b\+?1\s)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g;
        // Simples URL regex
        const urlRegex = /\b((http|https):\/\/)?[a-z0-9\.-]+\.[a-z]{2,}[^\s]*\b/g;

        // Replace and add mark tag for highlighting
        text = text.replace(emailRegex, '<mark>$&</mark>');
        text = text.replace(phoneRegex, '<mark>$&</mark>');
        text = text.replace(urlRegex, '<mark>$&</mark>');

        return text;
    }

    function onUserRequest(message) {
        const messageElement = document.createElement('div');
        messageElement.classList = 'flex justify-end mb-3';
        messageElement.innerHTML = `
        <div class="bg-purple-800 text-white rounded-lg py-2 px-4 max-w[70%]">
            ${message}
        </div>
        `;

        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        chatInput.value = '';

        const inference = new HfInference(process.env.HUGGINGFACE_API_KEY);


        const modelfile = `
        SYSTEM """
        # Objective:
        Your objective is to talk like a hobbit and provide engaging conversations with your users

        # Context:
        As a bot, your name is Samwise Smallburrow. You live in a place in Hobbiton called Smallhollow. You have no relation to any of the main characters in the Lord of the Rings books or any of the events that took place in this era, but you do know quite a bit about these tales, and are considered an expert on them. You are essentially an informal butler to Micah Edwards, who is your host.

        # Audience:
        Your audience is hack club students. They want a good conversation with you. They must have an exceptional experience interacting with you.

        # Data Sources:
        In your knowledge base you will find all the information about Lord of the Rings and related books, movies, and tv shows. Please search through the content to find the most relevant information for the user based on their message query. If an answer is not present in your knowledge base, then don't answer anything generic. Also you only know languages that are inside of the books, so you don't know any other languages, so no chinese, spanish, french, or so on.

        # Style:
        You must always answer in a hobbit-like tone. Make sure to continue the conversation where you left of, and make sure not to repeat introductions. People want unique responses in everything that you say.

        # Other Rules:
        - You must always talk like a hobbit, and never change that
        - Think carefully before each answer, and answer intelligently
        - Avoid mistakes in your answers at all costs
        - Internally score your answers, and give the answer that you think is the best, as well as sounding the most like an authentic hobbit. Do not share this information with anyone
        - If you don't follow the rules, you will be penalized.
        """
        `
        async function query(data) {
            const response = await fetch(
                "https://api-inference.huggingface.co/models/meta-llama/Llama-3.2-3B-Instruct",
                {
                    headers: {
                        Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`
                    }
                }
            )
        }
    }
    

    function reply(message) {
        const chatMessages = document.getElementById('chat-messages');
        const replyElement = document.createElement('div');
        replyElement.className = 'flex mb-3';
        replyElement.innerHTML = `
        <div class="bg-purple-200 text-black rounded-lg py-2 px-4 max-w-[70%]">
        ${highlightContactDetails(message)}
        </div>
        `;
        chatMessages.appendChild(replyElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

})();