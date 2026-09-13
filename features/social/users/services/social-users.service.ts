import type {
  GetSocialUserParams,
  GetSocialUserResponse,
  SearchSocialUsersQuery,
  SearchSocialUsersResponse,
} from '@strong-together/shared';
import api from '../../../../infrastructure/api/api-config/api';

export const searchSocialUsers = async (query: SearchSocialUsersQuery): Promise<SearchSocialUsersResponse> => {
  const { data } = await api.get<SearchSocialUsersResponse>('/api/social/users', { params: query });
  return data;
};

export const getSocialUser = async (userId: GetSocialUserParams['userId']): Promise<GetSocialUserResponse> => {
  const pathParams = { userId } satisfies GetSocialUserParams;
  const { data } = await api.get<GetSocialUserResponse>(`/api/social/users/${pathParams.userId}`);
  return data;
};
