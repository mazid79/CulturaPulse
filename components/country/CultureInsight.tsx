import { StyleSheet, View } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { CulturalTip } from '@/types';
import { COLORS, SPACING, FONT_SIZE } from '@/utils/theme'; // <-- Added FONT_SIZE here
import { Lightbulb } from 'lucide-react-native';

interface CultureInsightProps {
  tip: CulturalTip;
}

export function CultureInsight({ tip }: CultureInsightProps) {
  const accentColor = COLORS.primary?.[400] || '#AB47BC';

  return (
    <Card style={styles.container} padding="large" elevation="medium">
      <View style={styles.header}>
        <Lightbulb size={22} color={accentColor} strokeWidth={2} />
        <Text variant="label" weight="semibold" style={[styles.category, { color: accentColor }]}>
          {tip.category.charAt(0).toUpperCase() + tip.category.slice(1)} Tip
        </Text>
      </View>
      <Text variant="subheading" weight="medium" style={styles.title}>
        {tip.title}
      </Text>
      <Text variant="body" style={styles.content}>
        {tip.content}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  category: {
    marginLeft: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    marginBottom: SPACING.sm,
  },
  content: {
    // FONT_SIZE is used here, so it needs to be imported
    lineHeight: (FONT_SIZE?.md || 16) * 1.7,
  },
});