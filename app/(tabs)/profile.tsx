import { useState } from 'react';
import { StyleSheet, View, Switch, ScrollView, Alert, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import { COLORS, SPACING, BORDER_RADIUS } from '@/utils/theme';
import {
  UserCircle,
  Bell,
  Moon,
  Globe,
  LogOut,
  ChevronRight,
  Settings,
  HelpCircle,
  Mail,
} from 'lucide-react-native';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [pushNotifications, setPushNotifications] = useState(
    user?.preferences?.pushNotifications || false
  );
  const [darkMode, setDarkMode] = useState(
    user?.preferences?.darkMode || false
  );

  const handleSignIn = () => {
    router.push('/auth');
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    try {
      await updateUser({
        displayName,
        preferences: {
          ...user.preferences,
          pushNotifications,
          darkMode,
        },
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    }
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text variant="heading" weight="bold" style={styles.title}>
            Profile
          </Text>
        </View>
        <View style={styles.signInContainer}>
          <UserCircle size={80} color={COLORS.neutral[300]} />
          <Text variant="subheading" weight="medium" style={styles.signInTitle}>
            Sign in to your account
          </Text>
          <Text variant="body" style={styles.signInMessage}>
            Sign in to access your profile, bookmarks, and preferences.
          </Text>
          <Button
            title="Sign In"
            onPress={handleSignIn}
            style={styles.signInButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text variant="heading" weight="bold" style={styles.title}>
          Profile
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            {user.photoUrl ? (
              <Image
                source={{ uri: user.photoUrl }}
                style={styles.avatar}
                contentFit="cover"
              />
            ) : (
              <UserCircle size={80} color={COLORS.primary[500]} />
            )}
          </View>
          <View style={styles.profileInfo}>
            {isEditing ? (
              <Input
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="Your name"
              />
            ) : (
              <Text variant="subheading" weight="medium">
                {user.displayName || 'User'}
              </Text>
            )}
            <Text variant="body" style={styles.email}>
              {user.email}
            </Text>
          </View>
        </View>

        {isEditing ? (
          <View style={styles.editActions}>
            <Button
              title="Cancel"
              variant="outline"
              onPress={() => {
                setIsEditing(false);
                setDisplayName(user.displayName || '');
                setPushNotifications(user.preferences?.pushNotifications || false);
                setDarkMode(user.preferences?.darkMode || false);
              }}
              style={styles.cancelButton}
            />
            <Button
              title="Save"
              onPress={handleSaveProfile}
              style={styles.saveButton}
            />
          </View>
        ) : (
          <Button
            title="Edit Profile"
            variant="outline"
            onPress={() => setIsEditing(true)}
            style={styles.editButton}
          />
        )}

        <Text variant="subheading" weight="medium" style={styles.sectionTitle}>
          Preferences
        </Text>

        <Card style={styles.settingsCard}>
          <View style={styles.settingItem}>
            <View style={styles.settingIconContainer}>
              <Bell size={20} color={COLORS.primary[500]} />
            </View>
            <Text variant="body" style={styles.settingLabel}>
              Push Notifications
            </Text>
            <Switch
              value={pushNotifications}
              onValueChange={value => {
                setPushNotifications(value);
                if (!isEditing) {
                  setIsEditing(true);
                }
              }}
              trackColor={{ false: COLORS.neutral[300], true: COLORS.primary[400] }}
              thumbColor={
                Platform.OS === 'ios'
                  ? COLORS.white
                  : pushNotifications
                  ? COLORS.primary[600]
                  : COLORS.neutral[100]
              }
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingItem}>
            <View style={styles.settingIconContainer}>
              <Moon size={20} color={COLORS.primary[500]} />
            </View>
            <Text variant="body" style={styles.settingLabel}>
              Dark Mode
            </Text>
            <Switch
              value={darkMode}
              onValueChange={value => {
                setDarkMode(value);
                if (!isEditing) {
                  setIsEditing(true);
                }
              }}
              trackColor={{ false: COLORS.neutral[300], true: COLORS.primary[400] }}
              thumbColor={
                Platform.OS === 'ios'
                  ? COLORS.white
                  : darkMode
                  ? COLORS.primary[600]
                  : COLORS.neutral[100]
              }
            />
          </View>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingIconContainer}>
              <Globe size={20} color={COLORS.primary[500]} />
            </View>
            <Text variant="body" style={styles.settingLabel}>
              Language
            </Text>
            <View style={styles.settingValue}>
              <Text variant="body" style={styles.settingValueText}>
                English
              </Text>
              <ChevronRight size={16} color={COLORS.neutral[400]} />
            </View>
          </TouchableOpacity>
        </Card>

        <Text variant="subheading" weight="medium" style={styles.sectionTitle}>
          Support
        </Text>

        <Card style={styles.settingsCard}>
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingIconContainer}>
              <HelpCircle size={20} color={COLORS.primary[500]} />
            </View>
            <Text variant="body" style={styles.settingLabel}>
              Help & Support
            </Text>
            <ChevronRight size={16} color={COLORS.neutral[400]} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingIconContainer}>
              <Settings size={20} color={COLORS.primary[500]} />
            </View>
            <Text variant="body" style={styles.settingLabel}>
              App Settings
            </Text>
            <ChevronRight size={16} color={COLORS.neutral[400]} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingIconContainer}>
              <Mail size={20} color={COLORS.primary[500]} />
            </View>
            <Text variant="body" style={styles.settingLabel}>
              Contact Us
            </Text>
            <ChevronRight size={16} color={COLORS.neutral[400]} />
          </TouchableOpacity>
        </Card>

        <Button
          title="Sign Out"
          variant="outline"
          onPress={handleSignOut}
          leftIcon={<LogOut size={20} color={COLORS.error[500]} />}
          style={styles.signOutButton}
          textStyle={styles.signOutText}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.neutral[50],
  },
  header: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.md,
  },
  title: {
    color: COLORS.primary[700],
  },
  content: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.neutral[200],
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginRight: SPACING.md,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  profileInfo: {
    flex: 1,
  },
  email: {
    color: COLORS.neutral[600],
  },
  editActions: {
    flexDirection: 'row',
    marginBottom: SPACING.lg,
  },
  cancelButton: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  saveButton: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  editButton: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    marginBottom: SPACING.sm,
  },
  settingsCard: {
    marginBottom: SPACING.lg,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  settingIconContainer: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  settingLabel: {
    flex: 1,
  },
  settingValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValueText: {
    color: COLORS.neutral[500],
    marginRight: SPACING.xs,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.neutral[200],
    marginVertical: SPACING.xs,
  },
  signOutButton: {
    marginTop: SPACING.md,
    borderColor: COLORS.error[300],
  },
  signOutText: {
    color: COLORS.error[500],
  },
  signInContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  signInTitle: {
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  signInMessage: {
    textAlign: 'center',
    color: COLORS.neutral[600],
    marginBottom: SPACING.lg,
  },
  signInButton: {
    width: 200,
  },
});