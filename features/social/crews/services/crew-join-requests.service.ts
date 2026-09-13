import type {
  ListPendingCrewJoinRequestsParams,
  ListPendingCrewJoinRequestsResponse,
  RequestToJoinCrewParams,
  RequestToJoinCrewResponse,
} from '@strong-together/shared';
import api from '../../../../infrastructure/api/api-config/api';

export const getPendingCrewJoinRequests = async (
  crewId: ListPendingCrewJoinRequestsParams['crewId'],
): Promise<ListPendingCrewJoinRequestsResponse> => {
  const pathParams = { crewId } satisfies ListPendingCrewJoinRequestsParams;
  const { data } = await api.get<ListPendingCrewJoinRequestsResponse>(`/api/social/crews/${pathParams.crewId}/join-requests`);
  return data;
};

export const requestToJoinCrew = async (crewId: RequestToJoinCrewParams['crewId']): Promise<RequestToJoinCrewResponse> => {
  const pathParams = { crewId } satisfies RequestToJoinCrewParams;
  const { data } = await api.post<RequestToJoinCrewResponse>(`/api/social/crews/${pathParams.crewId}/join-requests`);
  return data;
};
