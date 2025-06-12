import { StyleSheet, View, TouchableOpacity, Linking, Platform } from 'react-native';
import { Image, ImageSource } from 'expo-image'; // Import ImageSource if using image placeholder
import { Text } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';
import { NewsArticle } from '@/types';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZE } from '@/utils/theme';
import { formatDistanceToNow } from '@/utils/formatters';
import { ExternalLink } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

interface NewsCardProps {
  article: NewsArticle;
}

export function NewsCard({ article }: NewsCardProps) {
  const handlePress = async () => {
    if ((Platform.OS as string) !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if (article.url && await Linking.canOpenURL(article.url)) { // Check if article.url is defined
      try {
        await Linking.openURL(article.url);
      } catch (error) {
        console.error('Error opening URL:', error);
      }
    } else {
        console.warn(`Cannot open URL: ${article.url}`);
    }
  };

  const sourceColor = COLORS.primary?.[400] || '#AB47BC';
  const dateColor = COLORS.neutral?.[500] || '#757575';
  const iconColor = COLORS.neutral?.[500] || '#757575';

  // Example of a blurhash placeholder (you'd generate this for your images)
  // const blurhashPlaceholder = 'L6PZfSi_.AyE_3t7t7Rण्यास~p%Ft7';
  // Example of a local image placeholder
  // const localImagePlaceholder = require('@/assets/images/news-placeholder.png');


  return (
    <Card style={styles.cardContainer} padding="medium" elevation="medium">
      <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
        <View style={styles.content}>
          {article.imageUrl ? (
            <Image
              source={{ uri: article.imageUrl }}
              style={styles.image}
              contentFit="cover"
              transition={300}
              // Correct way to use placeholder:
              // placeholder={blurhashPlaceholder}
              // or
              // placeholder={localImagePlaceholder}
              // The backgroundColor of styles.image will show if no placeholder prop is set
            />
          ) : (
            <View style={[styles.image, styles.imagePlaceholder]}>
              <Text variant="caption" colorKey="secondary">No Image</Text>
            </View>
          )}
          <View style={styles.textContainer}>
            <Text variant="subheading" weight="semibold" style={styles.title} numberOfLines={3}>
              {article.title}
            </Text>
            {article.description && (
              <Text variant="body" numberOfLines={2} style={styles.description}>
                {article.description}
              </Text>
            )}
            <View style={styles.footer}>
              <Text variant="caption" weight="medium" style={[styles.source, { color: sourceColor }]}>
                {article.source}
              </Text>
              {article.publishedAt && ( // Check if publishedAt exists
                <Text variant="caption" style={[styles.date, { color: dateColor }]}>
                  {formatDistanceToNow(new Date(article.publishedAt))}
                </Text>
              )}
              <ExternalLink size={16} color={iconColor} style={styles.externalLinkIcon} />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Card>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    marginBottom: SPACING.lg,
  },
  content: {
    flexDirection: 'row',
  },
  image: {
    width: 90,
    height: 90,
    borderRadius: BORDER_RADIUS.md,
    marginRight: SPACING.md,
    backgroundColor: COLORS.neutral?.[200] || '#2A2A2A', // Shows during image load if no placeholder prop
  },
  imagePlaceholder: { // This style is for the <View> when article.imageUrl is missing
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  title: {
    marginBottom: SPACING.xs,
    lineHeight: (FONT_SIZE?.xl || 20) * 1.3,
  },
  description: {
    marginBottom: SPACING.sm,
    lineHeight: (FONT_SIZE?.md || 16) * 1.5,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  source: {
    marginRight: SPACING.sm,
    flexShrink: 1,
  },
  date: {
    marginRight: SPACING.xs,
    flexShrink: 1,
  },
  externalLinkIcon: {
    marginLeft: 'auto',
  },
});