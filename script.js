class JarvisAssistant {
    constructor() {
        this.recognition = null;
        this.synthesis = null;
        this.isListening = false;
        this.isActive = false;
        this.wakeWord = 'hey jarvis';
        this.useWakeWord = true;
        this.volume = 1;
        this.soundEffects = true;
        
        this.init();
    }

    init() {
        this.cacheElements();
        this.initSpeechRecognition();
        this.initSpeechSynthesis();
        this.bindEvents();
        this.updateTime();
        this.checkPWAInstall();
        
        // Auto-start if previously enabled
        if (localStorage.getItem('jarvisAutoStart') === 'true') {
            setTimeout(() => this.startListening(), 1000);
        }
    }

    cacheElements() {
        this.elements = {
            voiceBtn: document.getElementById('voiceBtn'),
            commandsBtn: document.getElementById('commandsBtn'),
            settingsBtn: document.getElementById('settingsBtn'),
            closeCommands: document.getElementById('closeCommands'),
            closeSettings: document.getElementById('closeSettings'),
            commandsModal: document.getElementById('commandsModal'),
            settingsModal: document.getElementById('settingsModal'),
            listeningIndicator: document.getElementById('listeningIndicator'),
            userTranscript: document.getElementById('userTranscript'),
            assistantResponse: document.getElementById('assistantResponse'),
            pulseRing: document.getElementById('pulseRing'),
            mouth: document.getElementById('mouth'),
            assistantFace: document.getElementById('assistantFace'),
            wakeWordToggle: document.getElementById('wakeWordToggle'),
            voiceSelect: document.getElementById('voiceSelect'),
            volumeControl: document.getElementById('volumeControl'),
            soundEffectsToggle: document.getElementById('soundEffectsToggle'),
            autoStartToggle: document.getElementById('autoStartToggle'),
            currentTime: document.getElementById('currentTime'),
            notification: document.getElementById('notification'),
            notificationText: document.getElementById('notificationText'),
            activationSound: document.getElementById('activationSound'),
            notificationSound: document.getElementById('notificationSound'),
            installPrompt: document.getElementById('installPrompt'),
            installBtn: document.getElementById('installBtn'),
            dismissBtn: document.getElementById('dismissBtn'),
            weatherBtn: document.getElementById('weatherBtn'),
            timeBtn: document.getElementById('timeBtn'),
            newsBtn: document.getElementById('newsBtn'),
            reminderBtn: document.getElementById('reminderBtn'),
            micStatusIcon: document.getElementById('micStatusIcon')
        };
    }

    initSpeechRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            
            this.recognition.continuous = true;
            this.recognition.interimResults = true;
            this.recognition.lang = 'en-US';
            
            this.recognition.onstart = () => {
                this.isListening = true;
                this.updateUIListening(true);
                this.showNotification('Listening...');
            };
            
            this.recognition.onend = () => {
                this.isListening = false;
                this.updateUIListening(false);
                if (this.isActive) {
                    setTimeout(() => this.recognition.start(), 100);
                }
            };
            
            this.recognition.onresult = (event) => {
                let interimTranscript = '';
                let finalTranscript = '';
                
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        finalTranscript += transcript;
                    } else {
                        interimTranscript += transcript;
                    }
                }
                
                this.elements.userTranscript.textContent = interimTranscript || finalTranscript;
                
                if (finalTranscript) {
                    this.processCommand(finalTranscript.toLowerCase().trim());
                }
            };
            
            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                this.showNotification(`Error: ${event.error}`, 'error');
            };
        } else {
            this.showNotification('Speech recognition not supported', 'error');
            this.elements.voiceBtn.disabled = true;
        }
    }

    initSpeechSynthesis() {
        if ('speechSynthesis' in window) {
            this.synthesis = window.speechSynthesis;
            this.loadVoices();
            
            speechSynthesis.onvoiceschanged = () => {
                this.loadVoices();
            };
        }
    }

    loadVoices() {
        if (!this.synthesis) return;
        
        const voices = this.synthesis.getVoices();
        const voiceSelect = this.elements.voiceSelect;
        voiceSelect.innerHTML = '<option value="">Default</option>';
        
        voices.forEach(voice => {
            if (voice.lang.includes('en')) {
                const option = document.createElement('option');
                option.value = voice.name;
                option.textContent = `${voice.name} (${voice.lang})`;
                voiceSelect.appendChild(option);
            }
        });
        
        const savedVoice = localStorage.getItem('jarvisVoice');
        if (savedVoice) {
            voiceSelect.value = savedVoice;
        }
    }

    bindEvents() {
        // Voice button
        this.elements.voiceBtn.addEventListener('click', () => {
            if (this.isListening) {
                this.stopListening();
            } else {
                this.startListening();
            }
        });

        // Modals
        this.elements.commandsBtn.addEventListener('click', () => {
            this.elements.commandsModal.classList.add('active');
        });

        this.elements.settingsBtn.addEventListener('click', () => {
            this.elements.settingsModal.classList.add('active');
        });

        this.elements.closeCommands.addEventListener('click', () => {
            this.elements.commandsModal.classList.remove('active');
        });

        this.elements.closeSettings.addEventListener('click', () => {
            this.elements.settingsModal.classList.remove('active');
        });

        // Quick actions
        this.elements.weatherBtn.addEventListener('click', () => this.getWeather());
        this.elements.timeBtn.addEventListener('click', () => this.tellTime());
        this.elements.newsBtn.addEventListener('click', () => this.getNews());
        this.elements.reminderBtn.addEventListener('click', () => this.setReminder());

        // Settings
        this.elements.wakeWordToggle.addEventListener('change', (e) => {
            this.useWakeWord = e.target.checked;
            localStorage.setItem('jarvisWakeWord', e.target.checked);
        });

        this.elements.voiceSelect.addEventListener('change', (e) => {
            localStorage.setItem('jarvisVoice', e.target.value);
        });

        this.elements.volumeControl.addEventListener('input', (e) => {
            this.volume = parseFloat(e.target.value);
            localStorage.setItem('jarvisVolume', this.volume);
        });

        this.elements.soundEffectsToggle.addEventListener('change', (e) => {
            this.soundEffects = e.target.checked;
            localStorage.setItem('jarvisSoundEffects', e.target.checked);
        });

        this.elements.autoStartToggle.addEventListener('change', (e) => {
            localStorage.setItem('jarvisAutoStart', e.target.checked);
        });

        // PWA Install
        this.elements.installBtn.addEventListener('click', () => this.installPWA());
        this.elements.dismissBtn.addEventListener('click', () => {
            this.elements.installPrompt.classList.remove('active');
        });

        // Load saved settings
        this.loadSettings();
    }

    loadSettings() {
        this.useWakeWord = localStorage.getItem('jarvisWakeWord') !== 'false';
        this.elements.wakeWordToggle.checked = this.useWakeWord;
        
        this.volume = parseFloat(localStorage.getItem('jarvisVolume')) || 1;
        this.elements.volumeControl.value = this.volume;
        
        this.soundEffects = localStorage.getItem('jarvisSoundEffects') !== 'false';
        this.elements.soundEffectsToggle.checked = this.soundEffects;
        
        const autoStart = localStorage.getItem('jarvisAutoStart') === 'true';
        this.elements.autoStartToggle.checked = autoStart;
    }

    startListening() {
        if (this.recognition && !this.isListening) {
            this.isActive = true;
            this.recognition.start();
            this.playSound('activation');
        }
    }

    stopListening() {
        if (this.recognition && this.isListening) {
            this.isActive = false;
            this.recognition.stop();
            this.elements.assistantResponse.textContent = 'Deactivated';
            this.updateUIListening(false);
        }
    }

    processCommand(command) {
        console.log('Processing command:', command);
        
        if (this.useWakeWord) {
            if (command.includes(this.wakeWord)) {
                this.activateAssistant();
                command = command.replace(this.wakeWord, '').trim();
                if (!command) return;
            } else if (!this.isActive) {
                return;
            }
        }
        
        this.executeCommand(command);
    }

    activateAssistant() {
        this.isActive = true;
        this.elements.assistantResponse.textContent = 'Yes sir?';
        this.speak('Yes sir?');
        this.animateFace('listening');
        this.playSound('notification');
    }

    executeCommand(command) {
        let response = '';
        
        // Time commands
        if (command.includes('time') || command.includes('clock')) {
            response = this.tellTime();
        }
        // Weather commands
        else if (command.includes('weather')) {
            response = this.getWeather();
        }
        // Greeting
        else if (command.includes('hello') || command.includes('hi')) {
            response = 'Hello! How can I assist you today?';
        }
        // Joke
        else if (command.includes('joke')) {
            response = this.tellJoke();
        }
        // Help
        else if (command.includes('help') || command.includes('what can you do')) {
            response = 'I can tell you the time, weather, set reminders, tell jokes, and more. Try saying "what time is it?" or "tell me a joke"';
        }
        // Goodbye
        else if (command.includes('goodbye') || command.includes('bye') || command.includes('deactivate')) {
            response = 'Goodbye sir. Have a great day.';
            this.isActive = false;
            setTimeout(() => this.stopListening(), 2000);
        }
        // Default
        else {
            response = "I'm sorry, I didn't understand that command. Try asking for the time or weather.";
        }
        
        if (response) {
            this.elements.assistantResponse.textContent = response;
            this.speak(response);
            this.animateFace('speaking');
        }
    }

    tellTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
        });
        const response = `The time is ${timeString}`;
        this.speak(response);
        return response;
    }

    getWeather() {
        // In a real app, you would call a weather API here
        const responses = [
            "It's sunny and 72 degrees outside. Perfect weather for a walk.",
            "Currently cloudy with a chance of rain. You might want to take an umbrella.",
            "The weather is clear and mild, about 68 degrees.",
            "It's quite warm today, around 85 degrees. Stay hydrated!"
        ];
        const response = responses[Math.floor(Math.random() * responses.length)];
        this.speak(response);
        return response;
    }

    getNews() {
        const response = "Here are today's top headlines: AI assistants are becoming more advanced every day. In other news, scientists have made breakthroughs in renewable energy technology.";
        this.speak(response);
        return response;
    }

    setReminder() {
        const response = "Reminder set for 3 PM tomorrow. Would you like me to set another?";
        this.speak(response);
        return response;
    }

    tellJoke() {
        const jokes = [
            "Why don't scientists trust atoms? Because they make up everything!",
            "Why did the scarecrow win an award? He was outstanding in his field!",
            "What do you call a fake noodle? An impasta!",
            "Why don't skeletons fight each other? They don't have the guts!",
            "What do you call a bear with no teeth? A gummy bear!"
        ];
        const joke = jokes[Math.floor(Math.random() * jokes.length)];
        this.speak(joke);
        return joke;
    }

    speak(text) {
        if (!this.synthesis) {
            console.log('Text to speech not supported');
            return;
        }
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.volume = this.volume;
        utterance.rate = 0.9;
        utterance.pitch = 0.8;
        
        const selectedVoice = this.elements.voiceSelect.value;
        if (selectedVoice) {
            const voices = this.synthesis.getVoices();
            const voice = voices.find(v => v.name === selectedVoice);
            if (voice) utterance.voice = voice;
        }
        
        utterance.onstart = () => {
            this.animateFace('speaking');
        };
        
        utterance.onend = () => {
            this.animateFace('idle');
        };
        
        this.synthesis.speak(utterance);
    }

    animateFace(state) {
        const mouth = this.elements.mouth;
        const face = this.elements.assistantFace;
        
        mouth.style.transition = 'all 0.3s ease';
        
        switch(state) {
            case 'listening':
                mouth.style.height = '30px';
                mouth.style.borderRadius = '10px';
                face.style.boxShadow = '0 0 40px rgba(0, 180, 216, 0.5)';
                break;
            case 'speaking':
                mouth.style.height = '15px';
                mouth.style.borderRadius = '50%';
                face.style.boxShadow = '0 0 40px rgba(0, 255, 136, 0.5)';
                break;
            case 'idle':
                mouth.style.height = '20px';
                mouth.style.borderRadius = '0 0 30px 30px';
                face.style.boxShadow = '0 0 30px rgba(0, 180, 216, 0.3)';
                break;
        }
    }

    updateUIListening(listening) {
        const voiceBtn = this.elements.voiceBtn;
        const micIcon = voiceBtn.querySelector('i');
        const btnText = voiceBtn.querySelector('span');
        const pulseRing = this.elements.pulseRing;
        const listeningIndicator = this.elements.listeningIndicator;
        const micStatusIcon = this.elements.micStatusIcon;
        
        if (listening) {
            voiceBtn.style.background = 'var(--highlight-color)';
            micIcon.className = 'fas fa-microphone-slash';
            btnText.textContent = 'Stop Listening';
            pulseRing.classList.add('active');
            listeningIndicator.classList.add('active');
            micStatusIcon.style.color = 'var(--success-color)';
            micStatusIcon.className = 'fas fa-microphone';
        } else {
            voiceBtn.style.background = 'var(--accent-color)';
            micIcon.className = 'fas fa-microphone';
            btnText.textContent = 'Voice Command';
            pulseRing.classList.remove('active');
            listeningIndicator.classList.remove('active');
            micStatusIcon.style.color = 'var(--highlight-color)';
            micStatusIcon.className = 'fas fa-microphone-slash';
        }
    }

    updateTime() {
        const update = () => {
            const now = new Date();
            const timeString = now.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: false 
            });
            this.elements.currentTime.textContent = timeString;
        };
        
        update();
        setInterval(update, 60000); // Update every minute
    }

    playSound(type) {
        if (!this.soundEffects) return;
        
        const sound = this.elements[`${type}Sound`];
        if (sound) {
            sound.currentTime = 0;
            sound.volume = this.volume;
            sound.play().catch(e => console.log('Audio play failed:', e));
        }
    }

    showNotification(message, type = 'info') {
        const notification = this.elements.notification;
        const text = this.elements.notificationText;
        
        text.textContent = message;
        notification.classList.add('active');
        
        if (type === 'error') {
            notification.style.background = 'var(--danger-color)';
        } else if (type === 'success') {
            notification.style.background = 'var(--success-color)';
        } else {
            notification.style.background = 'var(--accent-color)';
        }
        
        setTimeout(() => {
            notification.classList.remove('active');
        }, 3000);
    }

    checkPWAInstall() {
        let deferredPrompt;
        
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            this.elements.installPrompt.classList.add('active');
        });
        
        window.addEventListener('appinstalled', () => {
            this.elements.installPrompt.classList.remove('active');
            deferredPrompt = null;
            this.showNotification('JARVIS installed successfully!', 'success');
        });
    }

    installPWA() {
        if (window.deferredPrompt) {
            window.deferredPrompt.prompt();
            window.deferredPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('User accepted the install prompt');
                }
                window.deferredPrompt = null;
                this.elements.installPrompt.classList.remove('active');
            });
        }
    }
}

// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('service-worker.js')
            .then(registration => {
                console.log('ServiceWorker registered:', registration);
            })
            .catch(error => {
                console.log('ServiceWorker registration failed:', error);
            });
    });
}

// Initialize Jarvis when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.jarvis = new JarvisAssistant();
});
