import { useState, useEffect } from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  Platform,
  ViewStyle,  // <-- Added ViewStyle
  StyleProp   // <-- Added StyleProp
} from 'react-native';
import { Bookmark, BookmarkCheck } from 'lucide-react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '@/utils/theme'; // <-- Added BORDER_RADIUS
import * as Haptics from 'expo-haptics';
import { useAuth } from '@/hooks/useAuth';

interface BookmarkButtonProps {
  countryId: string;
  isBookmarked?: boolean;
  size?: number;
  color?: string;
  bookmarkedColor?: string;
  style?: StyleProp<ViewStyle>; // Uses StyleProp and ViewStyle
}

export function BookmarkButton({
  countryId,
  isBookmarked = false,
  size = 28,
  color = COLORS.neutral?.[700] || '#E0E0E0',
  bookmarkedColor = COLORS.primary?.[500] || '#BB86FC',
  style,
}: BookmarkButtonProps) {
  const [marked, setMarked] = useState(isBookmarked);
  const { user, updateUser } = useAuth();

  useEffect(() => {
    setMarked(isBookmarked);
  }, [isBookmarked]);

  const handlePress = async () => {
    const newState = !marked;
    setMarked(newState);

    if ((Platform.OS as string) !== 'web') {
      Haptics.impactAsync(
        newState
          ? Haptics.ImpactFeedbackStyle.Medium
          : Haptics.ImpactFeedbackStyle.Light
      );
    }

    if (user && updateUser) {
      const currentBookmarks = user.bookmarkedCountries || [];
      let updatedBookmarks;
      
      if (newState) {
        updatedBookmarks = Array.from(new Set([...currentBookmarks, countryId]));
      } else {
        updatedBookmarks = currentBookmarks.filter(id => id !== countryId);
      }
      
      try {
        await updateUser({ bookmarkedCountries: updatedBookmarks });
      } catch (error) {
        console.error('Failed to update bookmarks:', error);
        setMarked(!newState);
      }
    } else if (!user) {
        console.warn('BookmarkButton: User not logged in. Bookmark state is local.');
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[styles.button, style]}
      activeOpacity={0.7}
    >
      {marked ? (
        <BookmarkCheck size={size} color={bookmarkedColor} strokeWidth={2.5} />
      ) : (
        <Bookmark size={size} color={color} strokeWidth={2.5} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: SPACING.xs,
    borderRadius: BORDER_RADIUS.full, // Uses BORDER_RADIUS
  },
});