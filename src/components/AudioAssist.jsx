import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const AudioAssist = () => {
    // Persist state: Load from localStorage
    const [isEnabled, setIsEnabled] = useState(() => {
        return localStorage.getItem('audio_assist_enabled') === 'true';
    });

    const location = useLocation();
    const navigate = useNavigate();

    const recognitionRef = useRef(null);
    const isEnabledRef = useRef(false);
    const isSpeakingRef = useRef(false);
    const hasInitialAnnounced = useRef(false);
    const pendingAnnouncement = useRef(null);

    // Keep ref and localStorage in sync
    useEffect(() => {
        isEnabledRef.current = isEnabled;
        localStorage.setItem('audio_assist_enabled', isEnabled);
    }, [isEnabled]);

    const speak = useCallback((text, force = false, mandatory = false) => {
        // If mandatory, we speak even if isEnabled is false (used for toggles)
        if (!mandatory && (!isEnabledRef.current || !window.speechSynthesis)) return;

        if (force) {
            window.speechSynthesis.cancel();
        }

        const utterance = new SpeechSynthesisUtterance(text);

        utterance.onerror = (e) => {
            if (e.error === 'not-allowed') {
                console.warn("Speech blocked. Queuing for interaction.");
                pendingAnnouncement.current = text;
            }
            isSpeakingRef.current = false;
        };

        utterance.onstart = () => {
            isSpeakingRef.current = true;
            pendingAnnouncement.current = null; // Successfully started
        };
        utterance.onend = () => {
            setTimeout(() => { isSpeakingRef.current = false; }, 300);
        };

        window.speechSynthesis.speak(utterance);
    }, []);

    // Handle user interaction to unblock pending speech
    useEffect(() => {
        const handleInteraction = () => {
            if (pendingAnnouncement.current && isEnabledRef.current) {
                console.log("Unblocking pending speech:", pendingAnnouncement.current);
                speak(pendingAnnouncement.current, true);
            }
        };
        window.addEventListener('click', handleInteraction);
        window.addEventListener('keydown', handleInteraction);
        return () => {
            window.removeEventListener('click', handleInteraction);
            window.removeEventListener('keydown', handleInteraction);
        };
    }, [speak]);

    const speakGuide = useCallback(() => {
        const guide = "TrustBallot Audio Assist Guide. " +
            "Basic Controls: Say Audio ON to enable, or Stop Audio to disable. " +
            "Navigation: Say Go to Login to start. " +
            "On the Login Page: Enter voter ID, for example A B C 1 2 3 4 5. I will repeat it back. Then say Submit to log in. " +
            "On the Voting Page: I will automatically read candidates. Say Select followed by a name to choose. Say Vote to finish. " +
            "Confirmation: Say Confirm or Yes to finalize your vote. " +
            "Security: This session has a two minute inactivity timeout. " +
            "At any time, say Help for these instructions.";
        speak(guide, true);
    }, [speak]);

    const toggleAssist = useCallback((forceState = null) => {
        setIsEnabled(prev => {
            const newState = forceState !== null ? forceState : !prev;
            isEnabledRef.current = newState;

            if (newState) {
                speak("Audio Assist ON. Welcome to TrustBallot. To begin, say Go to Login.", true, true);
            } else {
                speak("Audio Assist Disabled", true, true);
            }
            return newState;
        });
    }, [speak]);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return;

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
            if (isSpeakingRef.current || (window.speechSynthesis && window.speechSynthesis.speaking)) return;

            const current = event.resultIndex;
            const transcript = event.results[current][0].transcript.toLowerCase().trim();
            console.log("Voice Input:", transcript);

            // GLOBAL TOGGLE COMMANDS
            const onMatchers = ["audio on", "turn on audio", "enable audio", "start audio", "turn audio on", "turn on the audio"];
            const offMatchers = ["audio off", "stop audio", "disable audio", "turn off audio", "turn audio off", "turn off the audio"];

            if (onMatchers.some(match => transcript.includes(match))) {
                if (!isEnabledRef.current) toggleAssist(true);
                return;
            }
            if (offMatchers.some(match => transcript.includes(match))) {
                if (isEnabledRef.current) toggleAssist(false);
                return;
            }

            if (isEnabledRef.current) {
                if (transcript === "help" || transcript.includes("user guide") || transcript.includes("instructions")) {
                    speakGuide();
                    return;
                }
                if (transcript.includes("go to login")) {
                    speak("Navigating to login.");
                    navigate('/login');
                    return;
                }

                const idInput = document.getElementById('voterIdInput');
                if (idInput) {
                    if (transcript.includes("start over") || transcript.includes("clear id") || transcript.includes("delete")) {
                        const nativeParam = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
                        nativeParam.call(idInput, "");
                        idInput.dispatchEvent(new Event('input', { bubbles: true }));
                        speak("ID cleared. Enter voter ID, for example A B C 1 2 3 4 5.");
                        return;
                    }

                    if (!["submit", "verify", "vote"].some(cmd => transcript.includes(cmd))) {
                        const extractedId = transcript.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
                        if (extractedId.length >= 4) {
                            const nativeParam = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
                            nativeParam.call(idInput, extractedId);
                            idInput.dispatchEvent(new Event('input', { bubbles: true }));
                            speak(`You typed ${extractedId.split('').join(' ')}. Now say Submit or Verify.`);
                            return;
                        }
                    }
                }

                if (transcript.includes("submit") || transcript.includes("verify") || transcript.includes("login")) {
                    const btn = document.querySelector('button[type="submit"]') ||
                        Array.from(document.querySelectorAll('button')).find(b => b.textContent.toLowerCase().includes('submit') || b.textContent.toLowerCase().includes('verify'));
                    if (btn) { speak("Verifying identity."); btn.click(); }
                    return;
                }

                const modal = document.querySelector('.modal-content');
                if (modal) {
                    if (transcript.includes("confirm") || transcript === "vote" || transcript === "yes" || transcript.includes("confirm vote")) {
                        const btn = Array.from(modal.querySelectorAll('button')).find(b => b.textContent.toLowerCase().includes('confirm') || b.textContent.toLowerCase().includes('vote'));
                        if (btn) { speak("Confirmed. Casting ballot securely."); btn.click(); }
                        return;
                    }
                    if (transcript.includes("cancel") || transcript === "no" || transcript.includes("back") || transcript.includes("return")) {
                        const btn = Array.from(modal.querySelectorAll('button')).find(b => b.textContent.toLowerCase().includes('cancel'));
                        if (btn) { speak("Cancelled choice."); btn.click(); }
                        return;
                    }
                } else {
                    if (transcript.includes("read candidate") || transcript.includes("read choices")) {
                        const cards = Array.from(document.querySelectorAll('.candidate-card'));
                        const details = cards.map((c, index) => {
                            const name = c.querySelector('h3')?.innerText;
                            const party = c.querySelector('.party-name')?.innerText;
                            return `Candidate ${index + 1}: ${name} from ${party}`;
                        });
                        speak(`There are ${cards.length} candidates. ${details.join(". ")}. Say Select followed by a name to choose one.`);
                        return;
                    }

                    if (transcript.includes("select") || transcript.includes("vote for")) {
                        const nameToMatch = transcript.replace(/select|vote for/i, '').trim();
                        if (nameToMatch) {
                            const cards = Array.from(document.querySelectorAll('.candidate-card'));
                            let matchedCard = cards.find(c => c.querySelector('h3')?.innerText.toLowerCase().includes(nameToMatch));
                            if (!matchedCard) {
                                const words = nameToMatch.split(' ').filter(w => w.length > 2);
                                matchedCard = cards.find(c => words.some(w => (c.querySelector('h3')?.innerText.toLowerCase() || "").includes(w)));
                            }
                            if (matchedCard) {
                                matchedCard.click();
                                speak(`${matchedCard.querySelector('h3').innerText} selected. Now say Vote.`);
                                return;
                            } else {
                                speak(`Could not find candidate ${nameToMatch}.`);
                            }
                        }
                    }

                    if (transcript.includes("vote") && !transcript.includes("select") && !transcript.includes("vote for")) {
                        const btn = document.getElementById('main-vote-button') ||
                            Array.from(document.querySelectorAll('button')).find(b => {
                                const txt = b.textContent.toLowerCase();
                                return txt === 'vote' || txt.includes('cast vote') || txt.includes('finalize');
                            });
                        if (btn) {
                            if (btn.disabled) speak("Please select a candidate before voting.");
                            else {
                                const selName = document.querySelector('.candidate-card.selected h3')?.innerText || "a candidate";
                                speak(`Opening final confirmation for ${selName} by saying details. Say Confirm to finish.`);
                                btn.click();
                            }
                        }
                        return;
                    }
                }
                if (transcript.includes("go home")) navigate('/');
            }
        };

        recognition.onend = () => {
            // Keep restarting recognition endlessly to listen for toggle events
            setTimeout(() => { if (recognitionRef.current) try { recognition.start(); } catch (e) { } }, 100);
        };

        try { recognition.start(); recognitionRef.current = recognition; } catch (e) { }
        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.onend = null;
                recognitionRef.current.stop();
                recognitionRef.current = null;
            }
        };
    }, [navigate, speak, speakGuide, toggleAssist]);

    // Announcements & Orientation
    useEffect(() => {
        if (!isEnabled) return;
        const path = location.pathname;
        const isRefresh = !hasInitialAnnounced.current;
        hasInitialAnnounced.current = true;

        const refreshPrefix = isRefresh ? "Page refreshed. " : "";

        if (path === '/') {
            const tagline = document.querySelector('h1')?.innerText || "Secure Transparent Verifiable";
            speak(`${refreshPrefix}Home Page. Welcome to TrustBallot. ${tagline}. To begin, say Go to Login.`);
        }
        else if (path === '/login') {
            speak(`${refreshPrefix}Login page. Enter voter ID, for example A B C 1 2 3 4 5.`);
        }
        else if (path === '/vote') {
            const obs = new MutationObserver(() => {
                const voterInfo = document.querySelector('.container > div[style*="font-weight: bold"]')?.innerText;
                const cards = Array.from(document.querySelectorAll('.candidate-card'));
                if (cards.length > 0 && !document.body.hasAttribute('data-voter-final-vrel')) {
                    document.body.setAttribute('data-voter-final-vrel', 'true');
                    const info = voterInfo ? "You are logged in as " + voterInfo.replace('|', '. ') : "";
                    const details = cards.map((c, index) => `${c.querySelector('h3')?.innerText}, from ${c.querySelector('.party-name')?.innerText}`);
                    speak(`${refreshPrefix}Voting page. ${info}. There are ${cards.length} candidates: ${details.join(". ")}. Say Select followed by a name to choose.`);
                }
            });
            obs.observe(document.body, { childList: true, subtree: true });
            return () => { obs.disconnect(); document.body.removeAttribute('data-voter-final-vrel'); };
        }
        else if (path === '/vote-success') {
            speak(`${refreshPrefix}You casted vote successfully, thank you. This is your vote receipt and Q R code. Say Go Home to finish.`);
        }
    }, [location.pathname, isEnabled, speak]);

    // Focus Support
    useEffect(() => {
        if (!isEnabled) return;
        const handleFocus = (e) => {
            const t = e.target;
            if (t.classList.contains('candidate-card')) {
                speak(`${t.querySelector('h3')?.innerText}, ${t.querySelector('.party-name')?.innerText}. Press Enter to choose.`);
            } else if (t.tagName === 'BUTTON' || t.tagName === 'A') {
                speak(t.innerText || 'Action');
            }
        };
        document.addEventListener('focusin', handleFocus);
        return () => document.removeEventListener('focusin', handleFocus);
    }, [isEnabled, speak]);

    return (
        <button
            onClick={() => toggleAssist()}
            aria-label="Toggle Audio Assistance"
            style={{
                padding: '8px 16px', borderRadius: '6px',
                backgroundColor: isEnabled ? '#003366' : '#666666',
                color: 'white', border: 'none', cursor: 'pointer',
                fontWeight: '600', boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                fontSize: '14px', fontFamily: 'inherit',
                marginLeft: '10px'
            }}
        >
            {isEnabled ? '🔊 Audio ON' : '🔈 Audio OFF'}
        </button>
    );
};

export default AudioAssist;
