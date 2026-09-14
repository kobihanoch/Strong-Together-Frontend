import type { GetSocialUserParams } from '@strong-together/shared';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../../auth/providers/AuthProvider';
import { socialUserQueryKeys } from '../query-keys';
import { getSocialUser } from '../services/social-users.service';

/**
 * Loads a public social profile after the authenticated session is
 * server-validated and a target user identifier is available.
 *
 * The profile is cached by both the target and authenticated user so
 * relationship-specific fields cannot leak between authenticated sessions.
 *
 * @param userId - Optional identifier of the public user profile to load.
 * @returns The public user profile, query loading states, and a manual refetch action.
 */
export const useSocialUser = (userId?: GetSocialUserParams['userId']) => {
  const { isValidatedWithServer, userIdCache: authenticatedUserId } = useAuth();
  const query = useQuery({
    queryKey: socialUserQueryKeys.detailByUser(userId, authenticatedUserId),
    queryFn: () => {
      if (!userId) throw new Error('User ID is required');
      return getSocialUser(userId);
    },
    enabled: Boolean(isValidatedWithServer && authenticatedUserId && userId),
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  return {
    data: { user: query.data },
    loadingStates: {
      isPending: query.isPending,
      isLoading: query.isLoading,
      isFetching: query.isFetching,
    },
    actions: { refetch: query.refetch },
  };
};
