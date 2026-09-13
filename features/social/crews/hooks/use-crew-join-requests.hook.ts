import type {
  GetCrewParams,
  UpdateCrewParticipationRequestStatusBody,
  UpdateCrewParticipationRequestStatusParams,
} from '@strong-together/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../auth/providers/AuthProvider';
import { crewQueryKeys } from '../query-keys';
import {
  getPendingCrewJoinRequests,
  requestToJoinCrew,
  updateCrewParticipationRequestStatus,
} from '../services/crews.service';
import { CrewJoinRequests } from '../types/crews.types';

/**
 * Provides join-request server state and mutations for a crew.
 *
 * Pending requests load only after authentication and when a crew ID exists.
 * Users can request membership, while authorized crew leaders can accept or
 * decline pending requests and refresh affected membership caches.
 *
 * @param crewId - Optional crew identifier used for all join-request operations.
 * @returns Join requests, loading states, and join-request actions.
 */
export const useCrewJoinRequests = (crewId?: GetCrewParams['id']) => {
  const { isValidatedWithServer, userIdCache: userId } = useAuth();
  const queryClient = useQueryClient();

  const joinRequestsQuery = useQuery({
    queryKey: crewQueryKeys.joinRequests(crewId, userId),
    queryFn: () => {
      if (!crewId) throw new Error('Crew ID is required');
      return getPendingCrewJoinRequests(crewId);
    },
    enabled: Boolean(isValidatedWithServer && userId && crewId),
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  const requestToJoinMutation = useMutation({
    mutationFn: () => {
      if (!userId) throw new Error('User is not authenticated');
      if (!crewId) throw new Error('Crew ID is required');
      return requestToJoinCrew(crewId);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: crewQueryKeys.discoverable() }),
  });

  const updateJoinRequestStatusMutation = useMutation({
    mutationFn: ([requestId, body]: [
      UpdateCrewParticipationRequestStatusParams['requestId'],
      UpdateCrewParticipationRequestStatusBody,
    ]) => {
      if (!userId) throw new Error('User is not authenticated');
      return updateCrewParticipationRequestStatus(requestId, body);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: crewQueryKeys.joinRequests(crewId, userId) }),
        queryClient.invalidateQueries({ queryKey: crewQueryKeys.participants(crewId) }),
        queryClient.invalidateQueries({ queryKey: crewQueryKeys.detail(crewId) }),
        queryClient.invalidateQueries({ queryKey: crewQueryKeys.discoverable() }),
      ]);
    },
  });

  const joinRequests: CrewJoinRequests = joinRequestsQuery.data?.requests ?? [];

  return {
    data: { joinRequests },
    loadingStates: {
      isLoading: joinRequestsQuery.isLoading,
      isFetching: joinRequestsQuery.isFetching,
      isRequestingToJoin: requestToJoinMutation.isPending,
      isUpdating: updateJoinRequestStatusMutation.isPending,
    },
    actions: {
      refetch: joinRequestsQuery.refetch,
      requestToJoinCrew: requestToJoinMutation.mutateAsync,
      updateJoinRequestStatus: (
        requestId: UpdateCrewParticipationRequestStatusParams['requestId'],
        body: UpdateCrewParticipationRequestStatusBody,
      ) => updateJoinRequestStatusMutation.mutateAsync([requestId, body]),
    },
  };
};
