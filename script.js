class JarvisAssistant {
    constructor() {
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        this.isListening = false;
        this.isActive = false;
        
        // এলিমেন্টগুলো সিলেক্ট করা
        this.userTranscript = document.getElementById('userTranscript');
        this.assistantResponse = document.getElementById('assistantResponse');
        this.voiceBtn = document.getElementById('voiceBtn');
        this.pulseRing = document.getElementById('pulseRing');

        this.init();
    }

    init() {
        this.initSpeechRecognition();
        this.bindEvents();
        console.log("J.A.R.V.I.S. Enhanced System Online");
    }

    initSpeechRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
            alert("Your browser does not support Speech Recognition. Please use Chrome on Android.");
            return;
        }

        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true; // একটানা শুনবে
        this.recognition.interimResults = false;
        this.recognition.lang = 'en-US';

        this.recognition.onstart = () => {
            this.isListening = true;
            this.updateUI(true);
        };

        this.recognition.onresult = (event) => {
            const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
            this.userTranscript.textContent = transcript;
            this.processCommand(transcript);
        };

        this.recognition.onend = () => {
            this.isListening = false;
            // যদি আমরা ম্যানুয়ালি বন্ধ না করি, তবে এটি অটোমেটিক আবার শোনা শুরু করবে
            if (this.isActive) {
                this.recognition.start();
            } else {
                this.updateUI(false);
            }
        };

        this.recognition.onerror = (event) => {
            console.error("Mic Error:", event.error);
            if (event.error === 'not-allowed') {
                alert("Please allow microphone access in your browser settings.");
            }
        };
    }

    processCommand(command) {
        let response = "";

        // কমান্ড লজিক
        if (command.includes('time')) {
            const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            response = `The time is ${time}, sir.`;
        } 
        else if (command.includes('hello') || command.includes('jarvis')) {
            response = "Online and ready, sir. How can I help you today?";
        } 
        else if (command.includes('weather')) {
            response = "Checking the systems... The sky looks clear from my perspective.";
        } 
        else if (command.includes('who are you')) {
            response = "I am J.A.R.V.I.S., your personal artificial intelligence assistant.";
        } 
        else if (command.includes('open google')) {
            response = "Opening Google for you, sir.";
            window.open('https://www.google.com', '_blank');
        } 
        else if (command.includes('stop') || command.includes('deactivate')) {
            response = "System going offline. Goodbye, sir.";
            this.isActive = false;
            this.recognition.stop();
        } 
        else {
            response = "I have recorded the command: " + command + ". However, I don't have a specific protocol for this yet.";
        }

        this.speak(response);
    }

    speak(text) {
        if (!this.synthesis) return;
        
        // আগের কথা থামিয়ে নতুন কথা বলা
        this.synthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.pitch = 0.8; // একটু গম্ভীর গলার জন্য (Jarvis style)
        utterance.rate = 1.0;

        this.assistantResponse.textContent = text;
        this.synthesis.speak(utterance);
    }

    updateUI(listening) {
        if (listening) {
            this.voiceBtn.style.background = "#00ff88"; // সবুজ রং যখন শুনবে
            if (this.pulseRing) this.pulseRing.classList.add('active');
        } else {
            this.voiceBtn.style.background = "#0f4c75"; // সাধারণ নীল রং
            if (this.pulseRing) this.pulseRing.classList.remove('active');
        }
    }

    bindEvents() {
        this.voiceBtn.addEventListener('click', () => {
            if (!this.isActive) {
                this.isActive = true;
                this.recognition.start();
                this.speak("Systems initialized. I am listening.");
            } else {
                this.isActive = false;
                this.recognition.stop();
                this.speak("Systems paused.");
            }
        });
    }
}

// ডোমে লোড হওয়ার পর ইনিশিয়ালাইজ করা
window.onload = () => {
    window.jarvis = new JarvisAssistant();
};
class JarvisAssistant {
    constructor() {
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        this.isActive = false;
        this.lastResponse = ""; // একই কথা বারবার বলা বন্ধ করতে

        this.init();
    }

    init() {
        this.setupSpeech();
        this.setupButtons();
    }

    setupSpeech() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return alert("Chrome ব্যবহার করুন");

        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.lang = 'en-US';

        this.recognition.onresult = (event) => {
            const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
            
            // যদি Jarvis নিজেই কথা বলে, তবে সেই সময় সে শুনবে না (Loop Guard)
            if (this.synthesis.speaking) return;

            document.getElementById('userTranscript').textContent = transcript;
            this.handleCommand(transcript);
        };

        this.recognition.onend = () => { if (this.isActive) this.recognition.start(); };
    }

    handleCommand(cmd) {
        let response = "";

        if (cmd.includes('time')) {
            response = "It is " + new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        } else if (cmd.includes('hello') || cmd.includes('hi')) {
            response = "Hello sir, I am online.";
        } else if (cmd.includes('stop')) {
            this.isActive = false;
            this.recognition.stop();
            response = "Systems shutting down.";
        } else {
            // যদি সে কিছু না বোঝে, তবে সে চুপ থাকবে (বারবার প্রশ্ন করবে না)
            return; 
        }

        // একই উত্তর পরপর দুইবার দেবে না
        if (response !== this.lastResponse) {
            this.speak(response);
            this.lastResponse = response;
        }
    }

    speak(text) {
        this.synthesis.cancel();
        const msg = new SpeechSynthesisUtterance(text);
        msg.onstart = () => { document.getElementById('assistantResponse').textContent = text; };
        this.synthesis.speak(msg);
    }

    setupButtons() {
        document.getElementById('voiceBtn').onclick = () => {
            if (!this.isActive) {
                this.isActive = true;
                this.recognition.start();
                this.speak("Jarvis is ready.");
            } else {
                this.isActive = false;
                this.recognition.stop();
                this.speak("Goodbye.");
            }
        };
    }
}

window.onload = () => { new JarvisAssistant(); };

