import type { SearchSocialUsersQuery } from '@strong-together/shared';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useAuth } from '../../../auth/providers/AuthProvider';
import { socialUserQueryKeys } from '../query-keys';
import { searchSocialUsers } from '../services/social-users.service';
import type { SocialUsers } from '../types/social-users.types';

const DEFAULT_PAGE_SIZE = 20;

/**
 * Searches public user profiles after the authenticated session is
 * server-validated and the normalized search term is non-empty.
 *
 * Results are cached by authenticated user, search term, and page size. Each
 * fetched cursor page is flattened into one user collection for consumers.
 *
 * @param search - Text used to match public user profiles.
 * @param limit - Maximum number of users requested per page. Defaults to 20.
 * @returns Matching users, pagination/loading state, and query actions.
 */
export const useDiscoverableSocialUsers = (search: SearchSocialUsersQuery['search'], limit = DEFAULT_PAGE_SIZE) => {
  const { isValidatedWithServer, userIdCache: authenticatedUserId } = useAuth();
  const query = useInfiniteQuery({
    queryKey: socialUserQueryKeys.search(authenticatedUserId, search, limit),
    queryFn: ({ pageParam }) => searchSocialUsers({ search, limit, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: Boolean(isValidatedWithServer && authenticatedUserId && search.trim()),
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  const users: SocialUsers = query.data?.pages.flatMap((page) => page.users) ?? [];

  return {
    data: { users },
    loadingStates: {
      isPending: query.isPending,
      isLoading: query.isLoading,
      isFetching: query.isFetching,
      isFetchingNextPage: query.isFetchingNextPage,
    },
    pagination: { hasNextPage: query.hasNextPage },
    actions: { fetchNextPage: query.fetchNextPage, refetch: query.refetch },
  };
};
