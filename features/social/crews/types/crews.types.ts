import type {
  GetCrewResponse,
  ListCrewInvitationsResponse,
  ListCrewParticipantsResponse,
  ListCrewsResponse,
  ListPendingCrewJoinRequestsResponse,
} from '@strong-together/shared';

export type DiscoverableCrews = ListCrewsResponse['crews'];
export type DiscoverableCrew = DiscoverableCrews[number];
export type CrewParticipants = ListCrewParticipantsResponse['participants'];
export type CrewParticipant = CrewParticipants[number];
export type Crew = GetCrewResponse;
export type CrewInvitations = ListCrewInvitationsResponse['invitations'];
export type CrewInvitation = CrewInvitations[number];
export type CrewJoinRequests = ListPendingCrewJoinRequestsResponse['requests'];
export type CrewJoinRequest = CrewJoinRequests[number];
