import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useMemo } from 'react';
import useDashboard from '../../../features/dashboard/hooks/use-dashboard.hook';
import { RootParamList } from '../../../navigation/types/appStackTypes';
import { useAppTheme } from '../../../shared/providers/AppThemeProvider';
import { getStartOfWeek } from '../../../shared/utils/shared-utils';
import { fillCardioGraph, formatNextSchedule, getNextWorkoutSplit, getScheduleWeek, getTodayWorkout } from '../utils/home-page.utils';
import { useUser } from '../../../features/user/hooks/use-user.hook';
import { useMessages } from '../../../features/messages/hooks/use-messages.hook';
import { useWorkoutPlan } from '../../../features/workouts/plan/hooks/use-workout-plan.hook';
import { useCardio } from '../../../features/workouts/cardio/hooks/use-cardio.hook';
import { ExerciseInPlan, WorkoutSplit } from '../../../features/workouts/plan/types/workout-plan.types';
import { useWorkoutHistory } from '../../../features/workouts/history/hooks/use-workout-history.hook';
import { useWorkoutSchedule } from '../../../features/workout-schedule/hooks/use-workout-schedule.hook';
import { getTimeZoneFromStore } from '../../../shared/stores/time-zone.store';
import { getBodyPartsForSplit } from '../../../features/workouts/plan/utils/workout-plan.utils';
import { DateTime } from 'luxon';
import { useSocialSummary } from '../../../features/social/summary/hooks/use-social-summary.hook';
import { useCrewInvitations } from '../../../features/social/crews/invitations/hooks/use-crew-invitations.hook';

/**
 * Composes the Home screen view model from TanStack-backed feature data.
 *
 * It combines dashboard statistics, workout-plan and cardio queries with
 * messages, authenticated-user presentation data, and navigation actions.
 *
 * @returns The Home view model, navigation actions, and aggregate loading state.
 */
const useHomeScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootParamList>>();
  const { colors: theme } = useAppTheme();
  const { data: userData, loadingStates: userLoadingStates } = useUser();
  const { data: messagesData, loadingStates: messagesLoadingStates } = useMessages();
  const { data: workoutPlanData, loadingStates: workoutPlanLoadingStates } = useWorkoutPlan();
  const { data: cardioData, loadingStates: cardioLoadingStates, actions: cardioActions } = useCardio();
  const { data: dashboardData, loadingStates: dashboardLoadingStates } = useDashboard();
  const { data: workoutHistoryData, loadingStates: workoutHistoryLoadingStates } = useWorkoutHistory();
  const { data: scheduleData, loadingStates: scheduleLoadingStates } = useWorkoutSchedule();
  const { data: socialSummary, loadingStates: socialSummaryLoadingStates } = useSocialSummary();
  const { data: invitationsData, loadingStates: invitationLoadingStates } = useCrewInvitations();

  const nextSplit: WorkoutSplit | undefined = getNextWorkoutSplit(
    workoutPlanData.workoutSplits,
    dashboardData?.nextSplitByOrderIndex ?? null,
  );

  const data = useMemo(() => {
    const lastWorkout = dashboardData?.lastWorkoutStats;
    const latestPr = dashboardData?.latestPr?.[0];
    const estimatedOneRepMax = latestPr?.estimatedOneRepMax ? Number(latestPr.estimatedOneRepMax.toFixed(0)) : 0;
    const nextExercises: ExerciseInPlan[] = nextSplit?.exercises ?? [];
    const schedules = scheduleData.workoutSchedules?.schedules ?? [];
    const timeZone = getTimeZoneFromStore();
    const todayWorkout = getTodayWorkout(workoutHistoryData.workoutHistoryMap, timeZone);
    const todayDay = DateTime.now().setZone(timeZone).weekday % 7;
    const todaySchedule = schedules.find((item) => item.dayOfWeek === todayDay);
    const scheduledSplit = workoutPlanData.workoutSplits.find((split) => split.id === todaySchedule?.workoutSplitId);
    const nextScheduled = scheduleData.nextScheduledWorkout;
    const nextScheduledSplit = workoutPlanData.workoutSplits.find((split) => split.id === nextScheduled?.workoutSplitId);

    const workoutDetails = (split: WorkoutSplit | undefined) => ({
      id: split?.id ?? 0,
      name: split?.name ?? '',
      muscleGroup: getBodyPartsForSplit(split?.muscleGroup ?? ''),
      exerciseCount: split?.exercises.length ?? 0,
      setCount: split?.exercises.reduce((total, exercise) => total + exercise.sets.length, 0) ?? 0,
      estimatedDurationMinutes: split?.estimatedDurationMinutes ?? null,
    });

    const hero = todayWorkout
      ? {
          state: 'completed' as const,
          workout: todayWorkout,
          scheduleLabel: '',
          upNext: '',
        }
      : todaySchedule && scheduledSplit
        ? {
            state: 'today' as const,
            workout: workoutDetails(scheduledSplit),
            scheduleLabel: `Today · ${todaySchedule.startTime.slice(0, 5)}`,
            upNext: '',
          }
        : scheduleData.hasScheduledWorkouts && nextScheduled && nextScheduledSplit
          ? {
              state: 'up-next' as const,
              workout: workoutDetails(nextScheduledSplit),
              scheduleLabel: formatNextSchedule(nextScheduled.dayOfWeek, nextScheduled.startTime, timeZone),
              upNext: '',
            }
          : {
              state: 'next-workout' as const,
              workout: workoutDetails(nextSplit),
              scheduleLabel: '',
              upNext: '',
            };

    return {
      theme,
      state: {
        hasWorkout: workoutPlanData.hasWorkoutPlan,
        hasTracking: dashboardData?.hasExerciseTracking ?? false,
        hasTrainedToday: workoutHistoryData.hasTrainedToday,
        hasSchedule: scheduleData.hasScheduledWorkouts,
      },
      community: socialSummary ?? null,
      user: {
        displayName: userData?.name?.trim().split(' ')[0] || userData?.username || 'Athlete',
        profilePicPath: userData?.profilePicPath ?? null,
        gender: userData?.gender ?? null,
        unreadCount: messagesData.unreadMessages.length,
        pendingInvitationCount: invitationsData.invitations.filter((invitation) => invitation.status === 'pending').length,
      },
      nextWorkout: nextSplit
        ? {
            id: nextSplit.id,
            name: nextSplit.name,
            orderIndex: nextSplit.orderIndex,
            muscleGroup: nextSplit.muscleGroup ?? '',
            exerciseCount: nextExercises.length,
            setCount: nextExercises ? nextExercises.reduce((total, exercise) => total + exercise.sets.length, 0) : 0,
          }
        : { id: 0, orderIndex: 0, muscleGroup: '', name: '', exerciseCount: 0, setCount: 0 },
      hero,
      training: dashboardData
        ? {
            completedThisWeek: dashboardData.workoutTargets.workoutCountThisWeek,
            weeklyTarget: dashboardData.workoutTargets.workoutCountScheduledPerWeek,
            totalWorkouts: dashboardData.workoutCount,
            weekDays: getScheduleWeek(schedules, workoutPlanData.workoutSplits, workoutHistoryData.workoutHistoryMap, timeZone),
          }
        : { completedThisWeek: 0, weeklyTarget: 0, totalWorkouts: 0, weekDays: [] },
      lastWorkout: lastWorkout?.workoutDate
        ? {
            name: lastWorkout.workoutSplitName ?? '',
            date: lastWorkout.workoutDate,
            dateLabel: new Date(`${lastWorkout.workoutDate}T00:00:00`).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            }),
            exerciseCount: lastWorkout.exerciseTrackedCount ?? 0,
            setCount: lastWorkout.setTrackedCount ?? 0,
          }
        : { name: '', date: '', dateLabel: '', exerciseCount: 0, setCount: 0 },
      aerobics: {
        totalDurationMins: cardioData.cardioForSelectedWeek(getStartOfWeek())?.totalDurationMins ?? 0,
        totalDurationSecs: cardioData.cardioForSelectedWeek(getStartOfWeek())?.totalDurationSec ?? 0,
        days: fillCardioGraph(cardioData.weeklyCardioMap),
      },
      achievement: {
        exercise: latestPr?.exerciseName ?? '',
        value: latestPr ? `${latestPr.prWeight} kg PR` : '',
        reps: latestPr?.prReps ?? 0,
        estimatedOneRepMax,
        date: latestPr?.workoutStartLocal.slice(0, 10) ?? '',
        dateLabel: latestPr?.workoutStartLocal ? DateTime.fromISO(latestPr.workoutStartLocal).toFormat('MMM d') : '',
      },
    };
  }, [
    dashboardData,
    nextSplit,
    theme,
    workoutPlanData.hasWorkoutPlan,
    workoutHistoryData.hasTrainedToday,
    workoutHistoryData.workoutHistoryMap,
    scheduleData.workoutSchedules,
    scheduleData.hasScheduledWorkouts,
    scheduleData.nextScheduledWorkout,
    workoutPlanData.workoutSplits,
    userData?.name,
    userData?.username,
    userData?.profilePicPath,
    userData?.gender,
    messagesData.unreadMessages.length,
    invitationsData.invitations,
    cardioData,
    socialSummary,
  ]);

  return {
    data,
    actions: {
      openInbox: () => navigation.navigate('Inbox'),
      createWorkout: () => navigation.navigate('CreateWorkout'),
      startWorkout: (workoutSplitId?: number) => {
        const split = workoutPlanData.workoutSplits.find((item) => item.id === workoutSplitId) ?? nextSplit;
        if (split) navigation.navigate('WorkoutSession', { workoutSplit: split });
        else navigation.navigate('MyWorkoutPlan');
      },
      openSchedule: () => navigation.navigate('WorkoutSchedules'),
      openPlan: () => navigation.navigate('MyWorkoutPlan'),
      openTodaySummary: () => navigation.navigate('TrackHistory'),
      openProgress: () => navigation.navigate('TrackHistory', data.achievement.date ? { date: data.achievement.date } : undefined),
      openHistory: () => navigation.navigate('TrackHistory', data.lastWorkout.date ? { date: data.lastWorkout.date } : undefined),
      logCardio: cardioActions.logCardio,
    },
    loadingStates: {
      isPending:
        dashboardLoadingStates.isPending ||
        cardioLoadingStates.isPending ||
        messagesLoadingStates.isPending ||
        workoutPlanLoadingStates.isPending ||
        workoutHistoryLoadingStates.isPending ||
        scheduleLoadingStates.isPending ||
        userLoadingStates.isPending ||
        socialSummaryLoadingStates.isPending ||
        invitationLoadingStates.isLoading,
      isCardioUpdating: cardioLoadingStates.isUpdating,
    },
  };
};

export default useHomeScreen;
