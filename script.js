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
