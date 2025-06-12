import { Platform } from 'react-native';
import * as Speech from 'expo-speech';
import { TTSConfig, Voice } from '@/types'; // Assuming Voice is part of your types

class TTSService {
  private static instance: TTSService;
  private isInitialized: boolean = false;
  private isInitializing: boolean = false; // To prevent multiple initializations
  private webVoices: SpeechSynthesisVoice[] = []; // Cache web voices

  private constructor() {}

  static getInstance(): TTSService {
    if (!TTSService.instance) {
      TTSService.instance = new TTSService();
    }
    return TTSService.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return Promise.resolve();
    if (this.isInitializing) { // If already initializing, wait for it to complete
        return new Promise((resolve, reject) => {
            const checkInitialization = () => {
                if (this.isInitialized) {
                    resolve();
                } else if (!this.isInitializing) { // If isInitializing became false without success
                    reject(new Error("TTS initialization was attempted but did not complete successfully."));
                } else {
                    setTimeout(checkInitialization, 100);
                }
            };
            checkInitialization();
        });
    }

    this.isInitializing = true;

    if (Platform.OS === 'web') {
      return new Promise<void>((resolve, reject) => {
        if (typeof window.speechSynthesis === 'undefined') {
          console.error('Web Speech API not supported.');
          this.isInitialized = false;
          this.isInitializing = false;
          reject(new Error('Web Speech API not supported.'));
          return;
        }

        const loadVoices = () => {
          const voices = window.speechSynthesis.getVoices();
          if (voices.length > 0) {
            this.webVoices = voices;
            this.isInitialized = true;
            this.isInitializing = false;
            if (window.speechSynthesis.onvoiceschanged === loadVoices) { // Check to prevent issues if called manually
                window.speechSynthesis.onvoiceschanged = null; // Clean up listener
            }
            resolve();
            return true; // Voices loaded
          }
          return false; // Voices not loaded
        };

        // Attempt to load voices immediately
        if (loadVoices()) {
          return; // Already resolved
        }

        // If not loaded, set up the event listener
        window.speechSynthesis.onvoiceschanged = loadVoices;

        // Fallback timeout if onvoiceschanged is not reliable or doesn't fire
        const timeoutId = setTimeout(() => {
          if (!this.isInitialized) { // Check if still not initialized
            if (loadVoices()) { // Try one more time
                clearTimeout(timeoutId);
                return;
            }
            console.warn('Web voices could not be loaded reliably after timeout. TTS might use default system voice or fail for specific voice requests.');
            this.isInitialized = true; // Mark as initialized to allow speak attempts (might use default voice)
            this.isInitializing = false;
            resolve(); // Resolve even if voices aren't loaded, to not block indefinitely
          }
        }, 1500); // Timeout of 1.5 seconds
      });
    } else { // Native platforms
      try {
        // Expo Speech generally initializes itself when first used.
        // We can consider it "initialized" for the service's purpose.
        this.isInitialized = true;
        this.isInitializing = false;
        return Promise.resolve();
      } catch (error) {
        console.error('Failed to initialize native TTS interface:', error);
        this.isInitialized = false;
        this.isInitializing = false;
        return Promise.reject(error);
      }
    }
  }

  async speak(text: string, config?: TTSConfig): Promise<void> {
    if (!text || text.trim() === "") {
        console.warn("TTS speak: Received empty text. Nothing to speak.");
        return Promise.resolve();
    }

    if (!this.isInitialized) {
      try {
        await this.initialize();
      } catch (initError) {
        console.error('TTS Initialization failed during speak, cannot speak:', initError);
        throw initError;
      }
    }

    // Specific check for web after attempting initialization
    if (Platform.OS === 'web' && typeof window.speechSynthesis === 'undefined') {
        const noSupportError = new Error('Web Speech API not supported, cannot speak.');
        console.error(noSupportError.message);
        throw noSupportError;
    }

    try {
      if (Platform.OS === 'web') {
        // It's good practice to ensure speech synthesis is not already in a "stuck" state.
        if (window.speechSynthesis.pending || window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel(); // Stop previous speech, ensuring it's ready for a new one.
            // A small delay might be needed for cancel to fully take effect on some browsers
            await new Promise(resolve => setTimeout(resolve, 50));
        }

        const utterance = new SpeechSynthesisUtterance(text);
        if (config) {
          if (config.language) utterance.lang = config.language;
          if (config.pitch) utterance.pitch = config.pitch;
          if (config.rate) utterance.rate = config.rate;
          if (config.volume) utterance.volume = config.volume;

          if (config.voiceIdentifier && this.webVoices.length > 0) {
            const voice = this.webVoices.find(v => v.name === config.voiceIdentifier || v.voiceURI === config.voiceIdentifier);
            if (voice) {
              utterance.voice = voice;
            } else {
              console.warn(`Web voice not found for identifier: ${config.voiceIdentifier}. Using default voice for the language if set.`);
            }
          } else if (config.voiceIdentifier) {
            console.warn('Web voices array is empty or not yet loaded, cannot set specific voice. Using default.');
          }
        }
        // Add event listeners for debugging
        // utterance.onstart = () => console.log('TTS Web: Speech started');
        // utterance.onend = () => console.log('TTS Web: Speech ended');
        // utterance.onerror = (event) => console.error('TTS Web: Speech error', event);

        window.speechSynthesis.speak(utterance);
      } else { // Native
        const options: Speech.SpeechOptions = {};
        if (config?.language) options.language = config.language;
        if (config?.pitch) options.pitch = config.pitch;
        if (config?.rate) options.rate = config.rate;
        if (config?.volume) options.volume = config.volume; // Expo Speech also supports volume

        if (config?.voiceIdentifier && Platform.OS === 'ios') {
            options.voice = config.voiceIdentifier;
        }
        // For Android, voice selection is typically done at the OS level,
        // but `language` can influence it. Expo Speech doesn't have an explicit
        // `voice` option for Android in the same way as iOS.

        // Stop any ongoing speech before starting new, if desired behavior
        // if (await Speech.isSpeakingAsync()) {
        //    await Speech.stop();
        // }
        await Speech.speak(text, options);
      }
    } catch (error) {
      console.error('TTS speak error:', error);
      throw error;
    }
  }

  async stop(): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        if (typeof window.speechSynthesis !== 'undefined') {
            window.speechSynthesis.cancel();
        }
      } else {
        if (await Speech.isSpeakingAsync()) {
            await Speech.stop();
        }
      }
    } catch (error) {
        console.error('TTS stop error:', error);
        // Decide if this should throw or just log
    }
  }

  async getAvailableVoices(): Promise<Voice[]> {
    if (!this.isInitialized) {
      try {
        await this.initialize();
      } catch (initError) {
        console.error('TTS Initialization failed, cannot get voices:', initError);
        return [];
      }
    }

    if (Platform.OS === 'web') {
      // Attempt to refresh voices if they were not available during initialization or are empty
      if (this.webVoices.length === 0 && typeof window.speechSynthesis !== 'undefined' && window.speechSynthesis.getVoices) {
        this.webVoices = window.speechSynthesis.getVoices();
      }
      return this.webVoices.map(v => ({
        id: v.voiceURI,
        name: v.name,
        language: v.lang,
        // Web API doesn't usually provide these, default them
        quality: 'Normal', // Or some default
        networkConnectionRequired: v.localService === false, // if localService is true, network is not required
      }));
    } else { // Native
      try {
        const availableVoices = await Speech.getAvailableVoicesAsync();
        return availableVoices.map(v => ({
          id: v.identifier,
          name: v.name,
          language: v.language,
          quality: v.quality || 'Normal',
          // Native voices are typically local
          networkConnectionRequired: false,
        }));
      } catch (error) {
        console.error('Error getting native voices:', error);
        return [];
      }
    }
  }
}

export const ttsService = TTSService.getInstance();

// --- Example Usage for Testing ---
// (Remember to trigger this via a user interaction, e.g., a button press)
//
// async function testTTS() {
//   console.log("Testing TTS Service...");
//   try {
//     // Initialization is now handled lazily by speak/getAvailableVoices,
//     // but you can call it explicitly if you want to ensure voices are loaded upfront.
//     // await ttsService.initialize();
//
//     const voices = await ttsService.getAvailableVoices();
//     console.log('Available voices:', JSON.stringify(voices, null, 2));
//
//     const textToSpeak = 'Hello from CulturaPulse! Testing text to speech functionality.';
//
//     if (voices.length > 0) {
//       // Try to find an English voice, or use the first available
//       let voiceToUse = voices.find(v => v.language.startsWith('en'));
//       if (!voiceToUse) {
//         voiceToUse = voices[0];
//       }
//       console.log(`Attempting to use voice: ${voiceToUse.name} (${voiceToUse.id}) for language ${voiceToUse.language}`);
//       await ttsService.speak(textToSpeak, {
//         language: voiceToUse.language,
//         voiceIdentifier: voiceToUse.id,
//         rate: 0.9,
//         pitch: 1.0,
//         volume: 1.0
//       });
//     } else {
//       console.log('No specific voices found, using default system voice.');
//       await ttsService.speak(textToSpeak, { language: 'en-US' }); // Default to a common language
//     }
//     console.log("TTS speak call initiated.");
//   } catch (e) {
//     console.error("TTS test failed catastrophically:", e);
//   }
// }
//
// // To test, you would call testTTS() from a button press handler in your UI.
// // For example, in a React component:
// // import { Button } from 'react-native';
// // <Button title="Test TTS" onPress={testTTS} />