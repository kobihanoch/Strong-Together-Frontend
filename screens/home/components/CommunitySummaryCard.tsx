/* eslint-disable @typescript-eslint/no-require-imports */
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import type { GetSocialSummaryResponse } from '@strong-together/shared';
import { AppThemeColors } from '../../../shared/constants/theme';
import { fontFamilies, fontSizes } from '../../../shared/constants/typography';

type Props = {
  summary: GetSocialSummaryResponse | null;
  theme: AppThemeColors;
};

const clamp = (value: number, minimum: number, maximum: number) => Math.max(minimum, Math.min(value, maximum));

const communityPortraits = [
  require('../../../assets/mocked-profiles/u0.png'),
  require('../../../assets/mocked-profiles/u1.png'),
  require('../../../assets/mocked-profiles/u4.png'),
];

const CommunitySummaryCard = ({ summary, theme }: Props) => {
  const { width, height } = useWindowDimensions();
  const styles = createStyles(width, height, theme);
  const hasCrews = Boolean(summary && summary.activeCrewCount > 0);

  return (
    <View>
      <Text style={[styles.heading, { color: theme.textPrimary }]}>Community</Text>
      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        {hasCrews ? (
          <View style={styles.avatars} accessibilityLabel="Community illustration">
            {communityPortraits.map((source, index) => (
              <Image
                key={index}
                source={source}
                contentFit="cover"
                style={[styles.avatar, { borderColor: theme.surface, backgroundColor: theme.surfaceMuted }]}
              />
            ))}
          </View>
        ) : (
          <View style={[styles.peopleIcon, { backgroundColor: theme.surfaceMuted }]}>
            <MaterialCommunityIcons name="account-group-outline" size={styles.peopleIconGlyph.width} color={theme.textSecondary} />
          </View>
        )}

        <View style={styles.copy}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>
            {!summary ? 'Open community' : hasCrews ? 'Open community' : 'Discover crews'}
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]} numberOfLines={1}>
            {!summary || hasCrews ? 'Train, share, progress together' : 'Find people to train with'}
          </Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={styles.chevron.width} color={theme.textSecondary} />
      </View>
    </View>
  );
};

const createStyles = (width: number, height: number, theme: AppThemeColors) => {
  const avatarSize = clamp(width * 0.095, 34, 42);
  const peopleIconSize = clamp(width * 0.11, 40, 48);

  return StyleSheet.create({
    heading: {
      marginBottom: clamp(height * 0.012, 8, 12),
      fontFamily: fontFamilies.bold,
      fontSize: fontSizes.title,
    },
    card: {
      minHeight: clamp(height * 0.1, 76, 94),
      paddingHorizontal: clamp(width * 0.04, 14, 20),
      borderWidth: StyleSheet.hairlineWidth,
      borderRadius: clamp(width * 0.045, 16, 20),
      flexDirection: 'row',
      alignItems: 'center',
      shadowColor: theme.textPrimary,
      shadowOpacity: 0.04,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 },
      elevation: 1,
    },
    avatars: { minWidth: avatarSize, flexDirection: 'row', paddingRight: clamp(width * 0.02, 6, 10) },
    avatar: {
      width: avatarSize,
      height: avatarSize,
      marginRight: -clamp(width * 0.026, 9, 12),
      borderRadius: avatarSize / 2,
      borderWidth: 2,
    },
    peopleIcon: {
      width: peopleIconSize,
      height: peopleIconSize,
      borderRadius: peopleIconSize / 2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    peopleIconGlyph: { width: clamp(width * 0.052, 18, 22) },
    copy: { flex: 1, minWidth: 0, marginLeft: clamp(width * 0.035, 12, 16) },
    title: { fontFamily: fontFamilies.semiBold, fontSize: fontSizes.body },
    subtitle: { marginTop: clamp(height * 0.004, 2, 4), fontFamily: fontFamilies.regular, fontSize: fontSizes.bodySmall },
    chevron: { width: clamp(width * 0.055, 20, 24) },
  });
};

export default CommunitySummaryCard;
