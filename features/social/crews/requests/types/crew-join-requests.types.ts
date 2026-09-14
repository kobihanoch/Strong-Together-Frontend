import type { ListPendingCrewJoinRequestsResponse } from '@strong-together/shared';

export type CrewJoinRequests = ListPendingCrewJoinRequestsResponse['requests'];
export type CrewJoinRequest = CrewJoinRequests[number];
