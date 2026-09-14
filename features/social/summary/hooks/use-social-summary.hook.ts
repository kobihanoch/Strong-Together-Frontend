import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../../auth/providers/AuthProvider';
import { socialSummaryQueryKeys } from '../query-keys';
import { getSocialSummary } from '../services/social-summary.service';

export const useSocialSummary = () => {
  const { isValidatedWithServer, userIdCache: userId } = useAuth();
  const query = useQuery({
    queryKey: socialSummaryQueryKeys.byUser(userId),
    queryFn: getSocialSummary,
    enabled: Boolean(isValidatedWithServer && userId),
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  return {
    data: query.data,
    loadingStates: {
      isPending: query.isPending,
      isFetching: query.isFetching,
    },
    actions: { refetch: query.refetch },
  };
};

