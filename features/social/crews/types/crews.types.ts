import type { GetCrewResponse, ListCrewParticipantsResponse, ListCrewsResponse } from '@strong-together/shared';

export type DiscoverableCrews = ListCrewsResponse['crews'];
export type DiscoverableCrew = DiscoverableCrews[number];
export type CrewParticipants = ListCrewParticipantsResponse['participants'];
export type CrewParticipant = CrewParticipants[number];
export type Crew = GetCrewResponse;
