import type { GetSocialUserResponse, SearchSocialUsersResponse } from '@strong-together/shared';

export type SocialUsers = SearchSocialUsersResponse['users'];
export type SocialUserSearchResult = SocialUsers[number];
export type SocialUser = GetSocialUserResponse;
