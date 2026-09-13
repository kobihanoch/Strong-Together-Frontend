import type {
  CreateCrewBody,
  CreateCrewResponse,
  DeleteCrewParams,
  DeleteCrewProfilePictureParams,
  DeleteCrewProfilePictureResponse,
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
  ReplaceCrewProfilePictureParams,
  ReplaceCrewProfilePictureResponse,
  UpdateCrewBody,
  UpdateCrewParams,
  UpdateCrewResponse,
} from '@strong-together/shared';
import api from '../../../../infrastructure/api/api-config/api';

export type UploadableCrewProfilePicture = {
  uri: string;
  name?: string;
  type?: string;
};

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

export const replaceCrewProfilePicture = async (
  crewId: ReplaceCrewProfilePictureParams['id'],
  file: UploadableCrewProfilePicture,
): Promise<ReplaceCrewProfilePictureResponse> => {
  const pathParams = { id: crewId } satisfies ReplaceCrewProfilePictureParams;
  const formData = new FormData();
  formData.append('file', {
    uri: file.uri,
    name: file.name ?? 'crew-profile.jpg',
    type: file.type ?? 'image/jpeg',
  } as unknown as Blob);

  const { data } = await api.put<ReplaceCrewProfilePictureResponse>(
    `/api/social/crews/${pathParams.id}/profile-picture`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  return data;
};

export const deleteCrewProfilePicture = async (
  crewId: DeleteCrewProfilePictureParams['id'],
): Promise<DeleteCrewProfilePictureResponse> => {
  const pathParams = { id: crewId } satisfies DeleteCrewProfilePictureParams;
  await api.delete(`/api/social/crews/${pathParams.id}/profile-picture`);
};
