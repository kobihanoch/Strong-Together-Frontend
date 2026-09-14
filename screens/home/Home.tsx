import React, { useState } from 'react';
import { Skeleton } from 'moti/skeleton';
import { RefreshControl, ScrollView, StyleSheet, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AchievementCard from './components/AchievementCard';
import AerobicsCard from './components/AerobicsCard';
import AdaptiveWorkoutCard from './components/AdaptiveWorkoutCard';
import HomeHeader from './components/HomeHeader';
import NoTrackingCard from './components/NoTrackingCard';
import NoWorkoutCard from './components/NoWorkoutCard';
import TrainingOverviewCard from './components/TrainingOverviewCard';
import useHomeScreen from './hooks/use-home-screen.hook';
import { colors } from '../../shared/constants/colors';
import { useAppTheme } from '../../shared/providers/AppThemeProvider';
import CardioEntrySheet from '../../features/workouts/cardio/components/CardioEntrySheet';
import { usePullToRefresh } from '../../shared/hooks/use-pull-to-refresh.hook';
import CommunitySummaryCard from './components/CommunitySummaryCard';

const homeQueryNames = ['user', 'messages', 'workout-plan', 'workout-schedules', 'cardio-maps', 'home-dashboard', 'workout-history', 'social'];

const Home = () => {
  const { data, actions, loadingStates } = useHomeScreen();
  const { width, height } = useWindowDimensions();
  const horizontalPadding = Math.max(14, Math.min(width * 0.045, 22));
  const sectionGap = Math.max(22, Math.min(height * 0.034, 30));
  const { mode } = useAppTheme();
  const [cardioOpen, setCardioOpen] = useState(false);
  const { isRefreshing, refresh } = usePullToRefresh(homeQueryNames);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: data.theme.canvas }]} edges={['top']}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refresh}
            tintColor={data.theme.primary}
            colors={[data.theme.primary]}
          />
        }
        contentContainerStyle={[styles.content, { paddingHorizontal: horizontalPadding, gap: sectionGap }]}
        showsVerticalScrollIndicator={false}
      >
        <Skeleton.Group show={loadingStates.isPending}>
          <Skeleton colorMode={mode}>
            <HomeHeader data={data.user} theme={data.theme} onInbox={actions.openInbox} />
          </Skeleton>

          {loadingStates.isPending ? (
            <>
              <Skeleton colorMode={mode}>
                <AdaptiveWorkoutCard
                  {...data.hero}
                  theme={data.theme}
                  onStart={() => actions.startWorkout(data.hero.workout.id)}
                  onManageSchedule={actions.openSchedule}
                  onViewPlan={actions.openPlan}
                  onViewSummary={actions.openTodaySummary}
                />
              </Skeleton>
              <Skeleton colorMode={mode}>
                <TrainingOverviewCard {...data.training} hasSchedule={data.state.hasSchedule} theme={data.theme} onManage={actions.openSchedule} />
              </Skeleton>
              <Skeleton colorMode={mode}>
                <AerobicsCard data={data.aerobics} theme={data.theme} onLog={() => setCardioOpen(true)} />
              </Skeleton>
              <Skeleton colorMode={mode}>
                <AchievementCard data={data.achievement} theme={data.theme} onPress={actions.openProgress} />
              </Skeleton>
            </>
          ) : (
            <>
              {data.state.hasWorkout ? (
                <AdaptiveWorkoutCard
                  {...data.hero}
                  theme={data.theme}
                  onStart={() => actions.startWorkout(data.hero.workout.id)}
                  onManageSchedule={actions.openSchedule}
                  onViewPlan={actions.openPlan}
                  onViewSummary={actions.openTodaySummary}
                />
              ) : (
                <NoWorkoutCard theme={data.theme} onCreate={actions.createWorkout} />
              )}

              <CommunitySummaryCard summary={data.community} theme={data.theme} />

              {data.state.hasWorkout ? (
                <TrainingOverviewCard {...data.training} hasSchedule={data.state.hasSchedule} theme={data.theme} onManage={actions.openSchedule} />
              ) : null}
              <AerobicsCard data={data.aerobics} theme={data.theme} onLog={() => setCardioOpen(true)} />
              {data.state.hasTracking && data.achievement.exercise ? (
                <AchievementCard data={data.achievement} theme={data.theme} onPress={actions.openProgress} />
              ) : data.state.hasWorkout ? (
                <NoTrackingCard theme={data.theme} />
              ) : null}
            </>
          )}
        </Skeleton.Group>
      </ScrollView>
      <CardioEntrySheet
        visible={cardioOpen}
        saving={loadingStates.isCardioUpdating}
        theme={data.theme}
        onClose={() => setCardioOpen(false)}
        onSave={async (entry) => {
          await actions.logCardio(entry);
          setCardioOpen(false);
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.canvas },
  content: { flexGrow: 1, paddingTop: 12, paddingBottom: 28 },
});

export default Home;
