import type {
  GetCrewParams,
  InviteCrewUserBody,
  UpdateCrewParticipationRequestStatusBody,
  UpdateCrewParticipationRequestStatusParams,
} from '@strong-together/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../../auth/providers/AuthProvider';
import { crewQueryKeys } from '../../query-keys';
import { getCrewInvitations, inviteUserToCrew } from '../services/crew-invitations.service';
import { updateCrewParticipationRequestStatus } from '../../services/crew-participation-requests.service';
import { CrewInvitations } from '../types/crew-invitations.types';

/**
 * Provides invitation server state and mutations for authenticated users.
 *
 * Invitations addressed to the current user load after authentication. A crew
 * ID is required only when inviting another user. Invitation decisions refresh
 * the invitation list and affected crew membership caches.
 *
 * @param crewId - Optional crew identifier used when inviting another user.
 * @returns Invitations, loading states, and invitation actions.
 */
export const useCrewInvitations = (crewId?: GetCrewParams['id']) => {
  const { isValidatedWithServer, userIdCache: userId } = useAuth();
  const queryClient = useQueryClient();

  const invitationsQuery = useQuery({
    queryKey: crewQueryKeys.invitations(userId),
    queryFn: getCrewInvitations,
    enabled: Boolean(isValidatedWithServer && userId),
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  const inviteUserMutation = useMutation({
    mutationFn: (body: InviteCrewUserBody) => {
      if (!userId) throw new Error('User is not authenticated');
      if (!crewId) throw new Error('Crew ID is required');
      return inviteUserToCrew(crewId, body);
    },
  });

  const updateInvitationStatusMutation = useMutation({
    mutationFn: ([requestId, , body]: [
      UpdateCrewParticipationRequestStatusParams['requestId'],
      GetCrewParams['id'],
      UpdateCrewParticipationRequestStatusBody,
    ]) => {
      if (!userId) throw new Error('User is not authenticated');
      return updateCrewParticipationRequestStatus(requestId, body);
    },
    onSuccess: async (_, [, affectedCrewId, body]) => {
      const invalidations = [
        queryClient.invalidateQueries({ queryKey: crewQueryKeys.invitations(userId) }),
      ];

      if (body.status === 'accepted') {
        invalidations.push(
          queryClient.invalidateQueries({ queryKey: crewQueryKeys.participants(affectedCrewId) }),
          queryClient.invalidateQueries({ queryKey: crewQueryKeys.detail(affectedCrewId) }),
          queryClient.invalidateQueries({ queryKey: crewQueryKeys.discoverable() }),
        );
      }

      await Promise.all(invalidations);
    },
  });

  const invitations: CrewInvitations = invitationsQuery.data?.invitations ?? [];

  return {
    data: { invitations },
    loadingStates: {
      isLoading: invitationsQuery.isLoading,
      isFetching: invitationsQuery.isFetching,
      isInviting: inviteUserMutation.isPending,
      isUpdating: updateInvitationStatusMutation.isPending,
    },
    actions: {
      refetch: invitationsQuery.refetch,
      inviteUser: inviteUserMutation.mutateAsync,
      updateInvitationStatus: (
        requestId: UpdateCrewParticipationRequestStatusParams['requestId'],
        affectedCrewId: GetCrewParams['id'],
        body: UpdateCrewParticipationRequestStatusBody,
      ) => updateInvitationStatusMutation.mutateAsync([requestId, affectedCrewId, body]),
    },
  };
};
