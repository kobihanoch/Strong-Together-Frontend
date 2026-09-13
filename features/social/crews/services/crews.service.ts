import type {
  CreateCrewBody,
  CreateCrewResponse,
  DeleteCrewParams,
  DeleteCrewResponse,
  GetCrewParams,
  GetCrewResponse,
  LeaveCrewParams,
  LeaveCrewResponse,
  ListCrewParticipantsParams,
  ListCrewParticipantsQuery,
  ListCrewParticipantsResponse,
  ListCrewsQuery,
  ListCrewsResponse,
  UpdateCrewBody,
  UpdateCrewParams,
  UpdateCrewResponse,
} from '@strong-together/shared';
import api from '../../../../infrastructure/api/api-config/api';

export const getDiscoverableCrews = async (query: ListCrewsQuery): Promise<ListCrewsResponse> => {
  const { data } = await api.get<ListCrewsResponse>('/api/social/crews', { params: query });
  return data;
};

export const getCrewParticipants = async (
  crewId: ListCrewParticipantsParams['crewId'],
  query: ListCrewParticipantsQuery,
): Promise<ListCrewParticipantsResponse> => {
  const pathParams = { crewId } satisfies ListCrewParticipantsParams;
  const { data } = await api.get<ListCrewParticipantsResponse>(`/api/social/crews/${pathParams.crewId}/participants`, { params: query });
  return data;
};

export const getCrew = async (crewId: GetCrewParams['id']): Promise<GetCrewResponse> => {
  const pathParams = { id: crewId } satisfies GetCrewParams;
  const { data } = await api.get<GetCrewResponse>(`/api/social/crews/${pathParams.id}`);
  return data;
};

export const createCrew = async (body: CreateCrewBody): Promise<CreateCrewResponse> => {
  const { data } = await api.post<CreateCrewResponse>('/api/social/crews', body);
  return data;
};

export const updateCrew = async (crewId: UpdateCrewParams['id'], body: UpdateCrewBody): Promise<UpdateCrewResponse> => {
  const pathParams = { id: crewId } satisfies UpdateCrewParams;
  const { data } = await api.patch<UpdateCrewResponse>(`/api/social/crews/${pathParams.id}`, body);
  return data;
};

export const leaveCrew = async (crewId: LeaveCrewParams['id']): Promise<LeaveCrewResponse> => {
  const pathParams = { id: crewId } satisfies LeaveCrewParams;
  const { data } = await api.post<LeaveCrewResponse>(`/api/social/crews/${pathParams.id}/leave`);
  return data;
};

export const deleteCrew = async (crewId: DeleteCrewParams['id']): Promise<DeleteCrewResponse> => {
  const pathParams = { id: crewId } satisfies DeleteCrewParams;
  const { data } = await api.delete<DeleteCrewResponse>(`/api/social/crews/${pathParams.id}`);
  return data;
};
