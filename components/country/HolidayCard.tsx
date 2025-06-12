import { StyleSheet, View } from 'react-native';
import { Card } from '@/components/ui/Card';   // Updated Card
import { Text } from '@/components/ui/Text';     // Updated Text
import { Holiday } from '@/types';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZE } from '@/utils/theme';
import { formatDate, isToday } from '@/utils/formatters'; // Assuming these are fine
import { CalendarCheck2, CalendarClock } from 'lucide-react-native'; // Using more specific icons

interface HolidayCardProps {
  holiday: Holiday;
}

export function HolidayCard({ holiday }: HolidayCardProps) {
  const isHolidayToday = isToday(new Date(holiday.date));

  // Define colors based on dark theme
  const accentColor = COLORS.secondary?.[400] || '#EC407A'; // Pink/Magenta accent for "Today"
  const primaryAccentColor = COLORS.primary?.[500] || '#BB86FC'; // Purple for nationwide

  return (
    <Card
      style={[styles.container, isHolidayToday && styles.todayHighlightContainer]}
      padding="large"
      elevation="medium"
    >
      <View style={styles.header}>
        {isHolidayToday ? (
          <CalendarCheck2 size={20} color={accentColor} style={styles.icon} strokeWidth={2.5}/>
        ) : (
          <CalendarClock size={20} color={COLORS.neutral?.[600]} style={styles.icon} strokeWidth={2}/>
        )}
        <Text variant="label" weight="medium" style={styles.dateText}>
          {formatDate(new Date(holiday.date))}
        </Text>
        {isHolidayToday && (
          <View style={[styles.badgeBase, { backgroundColor: accentColor, marginLeft: 'auto' }]}>
            <Text variant="caption" weight="bold" style={styles.badgeTextToday}>
              TODAY
            </Text>
          </View>
        )}
      </View>

      <Text variant="subheading" weight="semibold" style={styles.name}>
        {holiday.name}
      </Text>

      {holiday.description && (
        <Text variant="body" style={styles.description}>
          {holiday.description}
        </Text>
      )}

      <View style={styles.footer}>
        {holiday.type && (
          <View style={[styles.badgeBase, styles.typeBadge]}>
            <Text variant="caption" weight="medium" style={styles.typeBadgeText}>
              {holiday.type}
            </Text>
          </View>
        )}
        {holiday.isNationwide && (
          <View style={[styles.badgeBase, styles.nationwideBadge, { backgroundColor: primaryAccentColor }]}>
            <Text variant="caption" weight="medium" style={styles.badgeText}>
              Nationwide
            </Text>
          </View>
        )}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.lg,
  },
  todayHighlightContainer: {
    // More prominent "3D" feel for today's holiday card
    borderColor: COLORS.secondary?.[400] || '#EC407A', // Pink/Magenta accent border
    borderWidth: 1.5,
    // Optionally, slightly different shadow or background if desired
    // backgroundColor: COLORS.neutral?.[150] || '#2A2A2A', // Slightly different surface if needed
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  icon: {
    marginRight: SPACING.sm,
  },
  dateText: {
    // Color will be inherited from Text component's default (light gray on dark)
    // or can be set explicitly e.g. color: COLORS.neutral[500]
  },
  name: {
    marginBottom: SPACING.sm,
    // Text color via Text component
  },
  description: {
    // Text color via Text component
    marginBottom: SPACING.md,
    lineHeight: (FONT_SIZE?.md || 16) * 1.65,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
    flexWrap: 'wrap', // Allow badges to wrap
  },
  badgeBase: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs / 2,
    borderRadius: BORDER_RADIUS.sm,
    marginRight: SPACING.sm,
    marginBottom: SPACING.xs, // For wrapping
    alignSelf: 'flex-start', // Ensure badges don't stretch
  },
  badgeText: { // Default badge text (e.g., for Nationwide)
    color: COLORS.white, // White text on colored badges
  },
  badgeTextToday: {
      color: COLORS.white,
      letterSpacing: 0.5,
  },
  typeBadge: {
    backgroundColor: COLORS.neutral?.[200], // Darker gray badge background
    // borderWidth: 1,
    // borderColor: COLORS.neutral[300],
  },
  typeBadgeText: {
    color: COLORS.neutral?.[700], // Light text on the gray badge
    fontWeight: '500', // FW_NAME used by Text comp
  },
  nationwideBadge: {
    // backgroundColor is set dynamically using primaryAccentColor
  },
});