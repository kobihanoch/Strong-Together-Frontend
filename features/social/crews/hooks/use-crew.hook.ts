import type {
  CreateCrewBody,
  GetCrewParams,
  UpdateCrewBody,
} from '@strong-together/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../auth/providers/AuthProvider';
import { crewQueryKeys } from '../query-keys';
import {
  createCrew,
  deleteCrew,
  getCrew,
  leaveCrew,
  updateCrew,
} from '../services/crews.service';
import { Crew } from '../types/crews.types';

/**
 * Loads one crew when an ID is provided and exposes authenticated crew mutations.
 *
 * The detail query remains disabled until authentication is validated and a
 * crew ID is available. Create, update, delete, and leave operations invalidate
 * affected crew caches so active lists and detail consumers refresh together.
 *
 * @param crewId - Optional identifier of the crew to load and mutate.
 * @returns Crew data, query/mutation loading states, and asynchronous crew actions.
 */
export const useCrew = (crewId?: GetCrewParams['id']) => {
  const { isValidatedWithServer, userIdCache: userId } = useAuth();
  const queryClient = useQueryClient();
  const detailQueryKey = crewQueryKeys.detailByUser(crewId, userId);

  const crewQuery = useQuery({
    queryKey: detailQueryKey,
    queryFn: () => {
      if (!crewId) throw new Error('Crew ID is required');
      return getCrew(crewId);
    },
    enabled: Boolean(isValidatedWithServer && userId && crewId),
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  const invalidateCrewQueries = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: crewQueryKeys.discoverable() }),
      queryClient.invalidateQueries({ queryKey: crewQueryKeys.detail(crewId) }),
    ]);
  };

  const removeCrewMembershipQueries = async () => {
    queryClient.removeQueries({ queryKey: crewQueryKeys.detail(crewId) });
    queryClient.removeQueries({ queryKey: crewQueryKeys.participants(crewId) });
    await queryClient.invalidateQueries({ queryKey: crewQueryKeys.discoverable() });
  };

  const createCrewMutation = useMutation({
    mutationFn: (body: CreateCrewBody) => {
      if (!userId) throw new Error('User is not authenticated');
      return createCrew(body);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: crewQueryKeys.discoverable() }),
  });

  const updateCrewMutation = useMutation({
    mutationFn: (body: UpdateCrewBody) => {
      if (!userId) throw new Error('User is not authenticated');
      if (!crewId) throw new Error('Crew ID is required');
      return updateCrew(crewId, body);
    },
    onSuccess: invalidateCrewQueries,
  });

  const deleteCrewMutation = useMutation({
    mutationFn: () => {
      if (!userId) throw new Error('User is not authenticated');
      if (!crewId) throw new Error('Crew ID is required');
      return deleteCrew(crewId);
    },
    onSuccess: removeCrewMembershipQueries,
  });

  const leaveCrewMutation = useMutation({
    mutationFn: () => {
      if (!userId) throw new Error('User is not authenticated');
      if (!crewId) throw new Error('Crew ID is required');
      return leaveCrew(crewId);
    },
    onSuccess: removeCrewMembershipQueries,
  });

  const crew: Crew | undefined = crewQuery.data;

  return {
    data: { crew },
    loadingStates: {
      isPending: crewQuery.isPending,
      isLoading: crewQuery.isLoading,
      isFetching: crewQuery.isFetching,
      isCreating: createCrewMutation.isPending,
      isUpdating: updateCrewMutation.isPending,
      isDeleting: deleteCrewMutation.isPending,
      isLeaving: leaveCrewMutation.isPending,
    },
    actions: {
      refetch: crewQuery.refetch,
      createCrew: createCrewMutation.mutateAsync,
      updateCrew: updateCrewMutation.mutateAsync,
      deleteCrew: deleteCrewMutation.mutateAsync,
      leaveCrew: leaveCrewMutation.mutateAsync,
    },
  };
};
