import type {
  InviteCrewUserBody,
  InviteCrewUserParams,
  InviteCrewUserResponse,
  ListCrewInvitationsResponse,
} from '@strong-together/shared';
import api from '../../../../infrastructure/api/api-config/api';

export const getCrewInvitations = async (): Promise<ListCrewInvitationsResponse> => {
  const { data } = await api.get<ListCrewInvitationsResponse>('/api/social/crews/invitations');
  return data;
};

export const inviteUserToCrew = async (
  crewId: InviteCrewUserParams['crewId'],
  body: InviteCrewUserBody,
): Promise<InviteCrewUserResponse> => {
  const pathParams = { crewId } satisfies InviteCrewUserParams;
  const { data } = await api.post<InviteCrewUserResponse>(`/api/social/crews/${pathParams.crewId}/invitations`, body);
  return data;
};
