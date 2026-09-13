import { useInfiniteQuery } from '@tanstack/react-query';
import { useAuth } from '../../../auth/providers/AuthProvider';
import { crewQueryKeys } from '../query-keys';
import { getDiscoverableCrews } from '../services/crews.service';
import { DiscoverableCrews } from './../types/crews.types';

const DEFAULT_PAGE_SIZE = 20;

/**
 * Loads crews visible to the authenticated user with cursor-based pagination.
 *
 * The hook waits for server-side authentication validation before requesting
 * data, combines all fetched pages into one crew collection, and exposes an
 * action for loading the next page when an infinite list reaches its end.
 *
 * @param limit - Maximum number of crews requested per page. Defaults to 20.
 * @param search - Optional text used to filter crews by name.
 * @returns Discoverable crews, pagination/loading state, and query actions.
 */
export const useDiscoverableCrews = (limit = DEFAULT_PAGE_SIZE, search?: string) => {
  const { isValidatedWithServer, userIdCache: userId } = useAuth();
  const queryKey = crewQueryKeys.discoverableByUser(userId, limit, search);

  const query = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam }) => getDiscoverableCrews({ limit, cursor: pageParam, search }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: Boolean(isValidatedWithServer && userId),
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  const crews: DiscoverableCrews = query.data?.pages.flatMap((page) => page.crews) ?? [];

  return {
    data: { crews },
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
