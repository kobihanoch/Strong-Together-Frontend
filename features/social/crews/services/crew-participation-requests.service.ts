import type {
  UpdateCrewParticipationRequestStatusBody,
  UpdateCrewParticipationRequestStatusParams,
  UpdateCrewParticipationRequestStatusResponse,
} from '@strong-together/shared';
import api from '../../../../infrastructure/api/api-config/api';

export const updateCrewParticipationRequestStatus = async (
  requestId: UpdateCrewParticipationRequestStatusParams['requestId'],
  body: UpdateCrewParticipationRequestStatusBody,
): Promise<UpdateCrewParticipationRequestStatusResponse> => {
  const pathParams = { requestId } satisfies UpdateCrewParticipationRequestStatusParams;
  const { data } = await api.patch<UpdateCrewParticipationRequestStatusResponse>(
    `/api/social/crews/participation-requests/${pathParams.requestId}`,
    body,
  );
  return data;
};
