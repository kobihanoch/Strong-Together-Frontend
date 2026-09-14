export const socialSummaryQueryKeys = {
  all: ['social', 'summary'] as const,
  byUser: (userId: string | null) => [...socialSummaryQueryKeys.all, userId] as const,
};

