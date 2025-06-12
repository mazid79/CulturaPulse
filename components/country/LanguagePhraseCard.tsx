import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Platform,
  ViewStyle, // <-- Error 3 Fix: Added ViewStyle import
} from 'react-native';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { LanguagePhrase } from '@/types';
import { COLORS, SPACING, BORDER_RADIUS, FONT_FAMILY, FONT_SIZE } from '@/utils/theme';
import { Play, Pause, Volume2 as LoadingSpeakerIcon, MessageCircleMore as TTSFallbackIcon } from 'lucide-react-native';
import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { ttsService } from '@/services/tts';

interface LanguagePhraseCardProps {
  phrase: LanguagePhrase;
}

// Moved playButtonBaseStyle outside the component for clarity and to ensure it's a const
const playButtonBaseStyle: ViewStyle = { // Error 3 Fix: Explicitly typed with ViewStyle
  width: 52,
  height: 52,
  borderRadius: BORDER_RADIUS.full,
  justifyContent: 'center',
  alignItems: 'center',
  marginLeft: SPACING.md,
  // Adding a subtle shadow to the button itself for 3D pop
  shadowColor: COLORS.black,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.2,
  shadowRadius: 3,
  elevation: 4,
};


export function LanguagePhraseCard({ phrase }: LanguagePhraseCardProps) {
  const soundRef = useRef<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const unloadSound = async () => {
    if (soundRef.current) {
      // console.log('Unloading sound for phrase:', phrase.text);
      try {
        await soundRef.current.unloadAsync();
      } catch (error) {
        // console.warn('Error unloading sound:', error);
      }
      soundRef.current = null;
    }
  };

  const playAudioFromUrl = async () => {
    if ((Platform.OS as string) === 'web') {
      console.log('Audio file playback on web is currently skipped.');
      return;
    }
    if (!phrase.audioUrl) return;
    if (isLoading) return;

    if (isPlaying) {
      if (soundRef.current) {
        await soundRef.current.stopAsync();
      }
      setIsPlaying(false); // Set immediately after stop command
      await unloadSound(); // Unload fully
      return;
    }

    setIsLoading(true);
    if ((Platform.OS as string) !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      await unloadSound(); // Unload any existing sound first
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        interruptionModeIOS: InterruptionModeIOS.DoNotMix,
        shouldDuckAndroid: true,
        interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
        playThroughEarpieceAndroid: false,
      });

      console.log('Loading sound from URL:', phrase.audioUrl);
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: phrase.audioUrl }, { shouldPlay: true }
      );
      soundRef.current = newSound;
      setIsPlaying(true); 
      setIsLoading(false);

      newSound.setOnPlaybackStatusUpdate(async (status) => { // Make callback async for await unload
        if (!status.isLoaded) {
          if (status.error) {
            console.error(`Playback Error for ${phrase.audioUrl}: ${status.error}`);
            setIsPlaying(false); setIsLoading(false); 
            await unloadSound(); // Use await here
          }
        } else {
          if (status.didJustFinish && !status.isLooping) {
            // console.log('Playback finished for phrase:', phrase.text);
            setIsPlaying(false); 
            await unloadSound(); // Use await here
          }
          // Update isPlaying based on status if it's not already set by didJustFinish
          // This handles cases like system interruptions pausing the sound
          else if (isPlaying !== status.isPlaying && !status.didJustFinish) {
             setIsPlaying(status.isPlaying);
          }
        }
      });
    } catch (error) {
      console.error(`Error playing sound for ${phrase.audioUrl}:`, error);
      setIsPlaying(false); setIsLoading(false); 
      await unloadSound();
    }
  };

  const handlePlayTTS = async () => {
    const langToSpeak = phrase.languageCode || 'en-US';
    try {
      await ttsService.speak(phrase.text, { language: langToSpeak });
    } catch (error) { console.error("Error speaking phrase with TTS:", error); }
  };

  useEffect(() => {
    // Error 1 Fix: The cleanup function should not be async and should not return a promise.
    // Call unloadSound but don't make the cleanup function itself async.
    return () => {
      // `void` operator can be used to explicitly show we're ignoring the promise
      void unloadSound(); 
    };
  }, []); // Empty dependency array ensures this runs only on mount and unmount

  const AudioIcon = isPlaying ? Pause : (isLoading ? LoadingSpeakerIcon : Play);
  const audioIconColor = isLoading ? (COLORS.neutral?.[500] || '#757575') : (COLORS.white);
  const ttsIconColor = COLORS.white;

  return (
    <Card style={languagePhraseCardStyles.container} padding="large" elevation="medium">
      <View style={languagePhraseCardStyles.header}>
        <Text variant="label" weight="semibold" style={languagePhraseCardStyles.category}>
          {phrase.category?.charAt(0).toUpperCase() + phrase.category?.slice(1) || 'Phrase'}
        </Text>
      </View>
      <View style={languagePhraseCardStyles.content}>
        <View style={languagePhraseCardStyles.phraseContainer}>
          <Text variant="subheading" weight="medium" style={languagePhraseCardStyles.translation}>
            {phrase.translation}
          </Text>
          <Text variant="body" style={languagePhraseCardStyles.text}>
            {phrase.text}
          </Text>
          {phrase.pronunciation && (
            <Text variant="caption" style={languagePhraseCardStyles.pronunciation}>
              {phrase.pronunciation}
            </Text>
          )}
        </View>

        {phrase.audioUrl ? (
          <TouchableOpacity
            style={[
                languagePhraseCardStyles.playButton, // Error 2 Fix: Using correctly defined styles
                isLoading && languagePhraseCardStyles.loadingButton,
                isPlaying && languagePhraseCardStyles.playingButton
            ]}
            onPress={playAudioFromUrl}
            activeOpacity={0.7}
            disabled={isLoading}
          >
            <AudioIcon size={24} color={audioIconColor} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={languagePhraseCardStyles.ttsButton} // Error 2 Fix: Using correctly defined styles
            onPress={handlePlayTTS}
            activeOpacity={0.7}
          >
            <TTSFallbackIcon size={24} color={ttsIconColor} />
          </TouchableOpacity>
        )}
      </View>
    </Card>
  );
}

// Error 2 Fix: Define styles using the playButtonBaseStyle const correctly
const languagePhraseCardStyles = StyleSheet.create({
  container: { marginBottom: SPACING.lg },
  header: { marginBottom: SPACING.sm },
  category: {
    color: COLORS.secondary?.[400] || '#F06292',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontFamily: FONT_FAMILY?.semibold,
  },
  content: { flexDirection: 'row', alignItems: 'center' },
  phraseContainer: { flex: 1 },
  translation: { marginBottom: SPACING.xs },
  text: { marginBottom: SPACING.xs },
  pronunciation: { fontStyle: 'italic' },
  playButton: { 
    ...playButtonBaseStyle, // Spread the base style
    backgroundColor: COLORS.primary?.[500] || '#BB86FC',
  },
  loadingButton: { // This style will be merged if isLoading is true
    ...playButtonBaseStyle,
    backgroundColor: COLORS.primary?.[700] || '#8A5DC5', // Darker for loading
  },
  playingButton: { // This style will be merged if isPlaying is true
    ...playButtonBaseStyle,
    backgroundColor: COLORS.primary?.[600] || '#8E24AA', 
  },
  ttsButton: { 
    ...playButtonBaseStyle,
    backgroundColor: COLORS.secondary?.[500] || '#E91E63',
  },
});