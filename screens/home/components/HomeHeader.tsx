/* eslint-disable @typescript-eslint/no-require-imports */
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { AppThemeColors } from '../../../shared/constants/theme';
import { fontFamilies, fontSizes } from '../../../shared/constants/typography';
import { HomeDashboardData } from '../types/use-home-page.types';
import { useProfilePicture } from '../../../shared/hooks/use-profile-picture.hook';

const HomeHeader = ({ data, theme, onInbox }: { data: HomeDashboardData['user']; theme: AppThemeColors; onInbox: () => void }) => {
  const profilePictureUrl = useProfilePicture(data.profilePicPath);
  const source = profilePictureUrl
    ? { uri: profilePictureUrl }
    : data.gender === 'Female'
      ? require('../../../assets/woman.png')
      : require('../../../assets/man.png');

  return (
    <View style={styles.header}>
      <Image source={source} cachePolicy="memory-disk" style={[styles.avatar, { backgroundColor: theme.surfaceMuted }]} contentFit="cover" />
      <Text style={[styles.greeting, { color: theme.textPrimary }]} numberOfLines={1}>
        Welcome, {data.displayName}
      </Text>
      <TouchableOpacity style={styles.iconButton} onPress={onInbox} accessibilityLabel="Open inbox">
        <MaterialCommunityIcons name="bell-outline" size={RFValue(23)} color={theme.textPrimary} />
        {data.unreadCount > 0 && <View style={[styles.notificationDot, { backgroundColor: theme.primary }]} />}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: { minHeight: 58, flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 48, height: 48, borderRadius: 24 },
  greeting: { flex: 1, fontFamily: fontFamilies.semiBold, fontSize: fontSizes.body },
  iconButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  notificationDot: { position: 'absolute', top: 7, right: 6, width: 8, height: 8, borderRadius: 4 },
});

export default HomeHeader;
