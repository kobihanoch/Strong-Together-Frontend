import type { GetSocialSummaryResponse } from '@strong-together/shared';
import api from '../../../../infrastructure/api/api-config/api';

export const getSocialSummary = async (): Promise<GetSocialSummaryResponse> => {
  const { data } = await api.get<GetSocialSummaryResponse>('/api/social/summary');
  return data;
};

