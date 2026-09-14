/* eslint-disable @typescript-eslint/no-require-imports */
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { AppThemeColors } from '../../../shared/constants/theme';
import { fontFamilies, fontSizes } from '../../../shared/constants/typography';
import { HomeDashboardData } from '../types/use-home-page.types';
import { useProfilePicture } from '../../../shared/hooks/use-profile-picture.hook';

const HomeHeader = ({ data, theme, onInbox }: { data: HomeDashboardData['user']; theme: AppThemeColors; onInbox: () => void }) => {
  const { width, height } = useWindowDimensions();
  const styles = createStyles(width, height);
  const profilePictureUrl = useProfilePicture(data.profilePicPath);
  const source = profilePictureUrl
    ? { uri: profilePictureUrl }
    : data.gender === 'Female'
      ? require('../../../assets/woman.png')
      : require('../../../assets/man.png');

  return (
    <View style={styles.header}>
      <Image
        source={source}
        cachePolicy="memory-disk"
        style={[styles.avatar, { backgroundColor: theme.surfaceMuted }]}
        contentFit="cover"
      />
      <Text style={[styles.greeting, { color: theme.textPrimary }]} numberOfLines={1}>
        Welcome, {data.displayName}
      </Text>
      <View style={styles.actions}>
        <View style={styles.iconButton} accessibilityLabel="Crew invitations">
          <MaterialCommunityIcons name="email-outline" size={styles.icon.width} color={theme.textPrimary} />
          {data.pendingInvitationCount > 0 && <View style={[styles.notificationDot, { backgroundColor: theme.primary }]} />}
        </View>
        <TouchableOpacity style={styles.iconButton} onPress={onInbox} accessibilityLabel="Open inbox">
          <MaterialCommunityIcons name="bell-outline" size={styles.icon.width} color={theme.textPrimary} />
          {data.unreadCount > 0 && <View style={[styles.notificationDot, { backgroundColor: theme.primary }]} />}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const clamp = (value: number, minimum: number, maximum: number) => Math.max(minimum, Math.min(value, maximum));

const createStyles = (width: number, height: number) => {
  const avatarSize = clamp(width * 0.12, 44, 52);
  const iconButtonSize = clamp(width * 0.11, 40, 46);
  const indicatorSize = clamp(width * 0.02, 7, 9);

  return StyleSheet.create({
    header: { minHeight: clamp(height * 0.068, 54, 64), flexDirection: 'row', alignItems: 'center', gap: clamp(width * 0.03, 10, 14) },
    avatar: { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 },
    greeting: { flex: 1, fontFamily: fontFamilies.semiBold, fontSize: fontSizes.body },
    actions: { flexDirection: 'row', alignItems: 'center', gap: clamp(width * 0.005, 2, 4) },
    iconButton: { width: iconButtonSize, height: iconButtonSize, alignItems: 'center', justifyContent: 'center' },
    icon: { width: clamp(width * 0.058, 21, 25) },
    notificationDot: {
      position: 'absolute',
      top: clamp(iconButtonSize * 0.14, 5, 7),
      right: clamp(iconButtonSize * 0.12, 5, 7),
      width: indicatorSize,
      height: indicatorSize,
      borderRadius: indicatorSize / 2,
    },
  });
};

export default HomeHeader;
