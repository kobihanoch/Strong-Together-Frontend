export const socialUserQueryKeys = {
  all: ['social', 'users'] as const,
  search: (authenticatedUserId: string | null, search: string, limit: number) =>
    [...socialUserQueryKeys.all, 'search', authenticatedUserId, search, limit] as const,
  detail: (userId: string | undefined) => [...socialUserQueryKeys.all, 'detail', userId] as const,
  detailByUser: (userId: string | undefined, authenticatedUserId: string | null) =>
    [...socialUserQueryKeys.detail(userId), authenticatedUserId] as const,
};
