import type { GetSocialUserParams } from '@strong-together/shared';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../../auth/providers/AuthProvider';
import { socialUserQueryKeys } from '../query-keys';
import { getSocialUser } from '../services/social-users.service';

/** Loads one user's public social profile. */
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
