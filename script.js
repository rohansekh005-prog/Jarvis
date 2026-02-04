class JarvisAssistant {
    constructor() {
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        this.isActive = false;
        
        // LocalStorage থেকে নাম খুঁজে বের করা
        this.userName = localStorage.getItem('jarvis_user_name') || "";

        this.init();
    }

    init() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return alert("Chrome ব্যবহার করুন");

        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.lang = 'en-US';

        this.recognition.onresult = (event) => {
            if (this.synthesis.speaking) return;
            const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
            document.getElementById('userTranscript').textContent = transcript;
            this.handleLogic(transcript);
        };

        this.recognition.onend = () => { if (this.isActive) this.recognition.start(); };
        this.setupButton();
    }

    handleLogic(cmd) {
        let reply = "";

        // নাম মনে রাখার লজিক
        if (cmd.includes('my name is')) {
            const words = cmd.split(' ');
            this.userName = words[words.length - 1]; // শেষ শব্দটি নাম হিসেবে নেবে
            localStorage.setItem('jarvis_user_name', this.userName);
            reply = `Understood. I will remember your name, ${this.userName} sir.`;
        } 
        else if (cmd.includes('what is my name')) {
            reply = this.userName ? `Your name is ${this.userName}, sir.` : "You haven't told me your name yet, sir.";
        }
        else if (cmd.includes('hello') || cmd.includes('hi')) {
            reply = this.userName ? `Hello ${this.userName} sir, how can I assist you?` : "Hello sir, how can I help you today?";
        }
        else if (cmd.includes('time')) {
            reply = "The time is " + new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        }
        else if (cmd.includes('offline') || cmd.includes('stop')) {
            this.isActive = false;
            this.recognition.stop();
            reply = "Shutting down systems. Goodbye sir.";
        } else {
            return;
        }

        this.speak(reply);
    }

    speak(text) {
        this.synthesis.cancel();
        const msg = new SpeechSynthesisUtterance(text);
        msg.pitch = 0.85;
        msg.onstart = () => { document.getElementById('assistantResponse').textContent = text; };
        this.synthesis.speak(msg);
    }

    setupButton() {
        document.getElementById('voiceBtn').onclick = () => {
            if (!this.isActive) {
                this.isActive = true;
                this.recognition.start();
                let welcome = this.userName ? `Welcome back, ${this.userName} sir. I am online.` : "Jarvis is online. How can I assist you?";
                this.speak(welcome);
            } else {
                this.isActive = false;
                this.recognition.stop();
                this.speak("Going offline.");
            }
        };
    }
}

window.onload = () => { new JarvisAssistant(); };
