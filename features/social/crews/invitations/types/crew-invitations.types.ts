import type { ListCrewInvitationsResponse } from '@strong-together/shared';

export type CrewInvitations = ListCrewInvitationsResponse['invitations'];
export type CrewInvitation = CrewInvitations[number];
