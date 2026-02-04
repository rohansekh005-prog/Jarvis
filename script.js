class JarvisAssistant {
    constructor() {
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        this.isListening = false;
        this.isActive = false;
        this.wakeWord = 'hey jarvis';
        this.init();
    }

    init() {
        this.initSpeechRecognition();
        this.bindEvents();
        // অ্যান্ড্রয়েডে অডিও আনলক করার জন্য একবার ক্লিক জরুরি
        console.log("Jarvis Initialized");
    }

    initSpeechRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = true;
            this.recognition.interimResults = false;
            this.recognition.lang = 'en-US'; // বাংলা চাইলে 'bn-BD' দিন

            this.recognition.onresult = (event) => {
                const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
                document.getElementById('userTranscript').textContent = transcript;
                this.processCommand(transcript);
            };

            this.recognition.onend = () => {
                if (this.isActive) this.recognition.start(); // অটোমেটিক রিস্টার্ট
            };

            this.recognition.onerror = (event) => {
                console.error("Speech Error: ", event.error);
            };
        }
    }

    processCommand(command) {
        let response = "";
        
        if (command.includes('time')) {
            response = "The time is " + new Date().toLocaleTimeString();
        } else if (command.includes('hello') || command.includes('hi jarvis')) {
            response = "Hello sir, how can I help you?";
        } else if (command.includes('weather')) {
            response = "The weather is clear today, sir.";
        } else if (command.includes('joke')) {
            response = "Why did the robot go to the doctor? Because it had a virus!";
        } else {
            response = "I heard you, but I don't have a command for that yet.";
        }

        this.speak(response);
    }

    speak(text) {
        if (!this.synthesis) return;
        this.synthesis.cancel(); // আগের কথা থামিয়ে নতুন কথা শুরু করবে
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 1.0;
        
        document.getElementById('assistantResponse').textContent = text;
        this.synthesis.speak(utterance);
    }

    bindEvents() {
        const voiceBtn = document.getElementById('voiceBtn');
        voiceBtn.addEventListener('click', () => {
            if (!this.isActive) {
                this.isActive = true;
                this.recognition.start();
                this.speak("Jarvis is now active.");
                voiceBtn.style.background = "#00b4d8";
            } else {
                this.isActive = false;
                this.recognition.stop();
                this.speak("Jarvis deactivated.");
                voiceBtn.style.background = "#0f4c75";
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new JarvisAssistant();
});

