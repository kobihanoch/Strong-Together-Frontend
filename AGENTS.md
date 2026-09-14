## Social UX Architecture

Treat this architecture as locked unless the user explicitly asks to change it.

### Product and navigation model

- The core flow is `Home -> Community -> Crews -> Crew`.
- Home remains workout-first. Place only a compact Community entry below the main workout card; Social must not compete with the workout task.
- Community is the Social hub, with two primary destinations: `Feed` and `Crews`. Search and Invitations are secondary destinations reached from Community.
- Feed means all posts visible to the current user: public posts plus accessible crew-only posts. Do not label it `Global`.
- Crews contains `My Crews` and `Discover`. My Crews means every crew in which the current user has an active membership; never assume a user has only one crew. Discover finds additional crews.
- Crew is the primary interaction space for members, non-members, leaders, and admins. Adjust available content and actions to the caller's actual relationship and permissions instead of creating separate crew architectures.
- Search covers Users and Crews. A user result opens the public Social profile; a crew result opens Crew.
- Invitations lists invitations addressed to the user and may lead to the related Crew when the API provides enough display/access data.
- Create/Edit Crew is a supporting flow reached from Community or Crew management, not a top-level destination.
- Keep the existing Home, Plan, Progress, and Profile bottom navigation unchanged. Community is not a permanent bottom-navigation tab.

Navigation hierarchy:

```text
Home
`-- Community
    |-- Feed
    |   `-- Post / Comments
    |-- Crews
    |   |-- My Crews
    |   |   `-- Crew
    |   `-- Discover
    |       `-- Crew
    |-- Search
    |   |-- User Profile
    |   `-- Crew
    `-- Invitations
        `-- Crew
```

Avoid unnecessary navigation levels and do not create screens only for symmetry.

### Current Social capability boundaries

The backend controllers, current shared contracts, services, queries, and authorization policies are the source of truth. A missing frontend hook does not imply that the backend capability is missing. The Client currently installs `@strong-together/shared` 3.20.1, whose Social response declarations match the current Server shared source for crew participant counts and post author identity.

Backend-supported and wired through a frontend service and hook:

- Discover/search crews: `GET /api/social/crews`, cursor pagination, optional name search, participant count and up to five participant previews. `useDiscoverableCrews` consumes this endpoint.
- Crew detail: `GET /api/social/crews/:id`, including active participant count; `useCrew` consumes it.
- Crew create/update/delete/leave and leader-controlled profile-picture replacement/deletion: `POST/PATCH/DELETE /api/social/crews`, `POST /:id/leave`, and `PUT/DELETE /:id/profile-picture`, exposed by `useCrew`.
- Crew participants: `GET /api/social/crews/:crewId/participants`, cursor-paginated active memberships with user identity, role (`leader`, `admin`, `member`) and status; exposed by `useCrewParticipants`. Public crew participants are visible to any authenticated user; private crew participants require active membership.
- Invitations and join requests: invitation create/list/status update and join create/list/status update endpoints are exposed by `useCrewInvitations` and `useCrewJoinRequests`. Public self-join is immediately accepted and creates active membership; private self-join remains pending. Only an active leader can invite users or review join requests. Invitees can accept/decline invitations.
- Crew feed loading and reaction/comment writes: `useCrewPosts` loads `GET /api/social/posts/crew/:crewId` and exposes add/edit/delete comment plus add/replace/delete reaction mutations.
- Social user search/detail: `GET /api/social/users` and `GET /api/social/users/:userId`, cursor-paginated public identity fields, exposed by `useDiscoverableSocialUsers` and `useSocialUser`.

Backend-supported and available through a frontend service, but missing or incomplete at hook/UI level:

- Visible Feed: `GET /api/social/posts` returns public posts, the caller's own posts, and crew-only posts placed in a crew the caller can access. `getVisiblePosts` exists, but there is no visible-feed hook or screen.
- Post creation/edit/deletion: `POST/PATCH/DELETE /api/social/posts` supports public posts and crew-only posts placed into one or multiple authorized crews; only authors edit/delete. Client service functions exist, but no hook/UI exposes them.
- Comment/reaction lists: `GET /api/social/posts/:postId/comments` and `/reactions` are cursor-paginated and have client service functions, but no hooks/UI load the collections. The crew-post hook currently only performs their mutations.
- Visible-feed and crew-post responses include author `username`, `fullName`, and `profilePicPath` in both the current Server contract and installed client types.

Partially represented and not sufficient for truthful UX:

- `GET /api/social/crews` is a discovery collection of all crews, not a dedicated current-user membership collection. Its response has no viewer membership/role/request state, so it cannot truthfully power `My Crews`, `Open`, or `Requested` states by itself.
- Invitation and join-request responses contain raw request and user/crew IDs and status, but no crew name/picture or participant profile. Friendly invitation/request rows require enrichment or additional permitted fetches.
- Crew profile-picture upload exists, but current crew read DTOs deliberately omit the crew `profilePicPath`; uploaded pictures cannot be displayed from crew list/detail responses.
- Post rows have author identity but no comment count, reaction aggregates, viewer reaction, or crew-placement metadata. These require additional collection calls or richer backend responses.
- The backend stores an `admin` role, but current crew management, invitations, and request review are leader-only. Do not show admin management controls that the API will reject.

Not currently supported by the API:

- A dedicated `My Crews` endpoint or membership filter.
- Viewer-specific crew relationship and pending-request state on crew list/detail responses.
- Social Home summary, unread Social activity, or pending-invitation count endpoint.
- Live workout presence, `Training Now`, or counts of people currently training.
- Crew descriptions or other extended crew metadata beyond name, privacy, leader, timestamps, participant count/previews, and participant records.
- Removing/banning/promoting participants through HTTP endpoints, invitation cancellation, or request cancellation.
- Media attachments on posts, workout-linked post metadata, post-detail endpoint, or Social follow/friend relationships.

Do not invent absent fields or infer capabilities from database columns that no response contract exposes. Keep three statuses explicit in plans and reviews: supported by backend, wired in frontend, and not supported.

### Implementation guardrails

- Treat locked UX concepts separately from current API availability. A missing endpoint does not justify changing the product architecture.
- When determining whether a Social UI state is possible, inspect in this order:

  1. Current Server response contract
  2. Published/shared client types
  3. Frontend service
  4. Frontend hook
  5. Existing UI

- Do not compensate for missing aggregate or viewer-specific API data with N+1 client requests.
- Do not implement `My Crews` by loading all discoverable crews and checking membership crew-by-crew.
- Do not load comments or reactions for every post merely to derive counts for the Feed.
- Prefer adding or enriching a backend response when the UX requires collection-level aggregate or viewer-specific state.

### UX constraints

Preserve the existing app's typography, spacing philosophy, hierarchy, colors, button language, icon treatment, density, headers, separators, selective card use, and bottom navigation.

Do not introduce:

- `Your Crew` as a permanent single-crew concept.
- Nested tab systems without strong justification, tabs inside tabs inside tabs, or excessive segmented controls.
- Inconsistent action patterns, arbitrary clickable text serving the same role as a nearby CTA, or duplicate navigation paths.
- Excessive cards or card-inside-card layouts.
- Visual language disconnected from the existing application.
- Fake Social metrics, fake presence/`Training Now` state, or UI states the API cannot truthfully support.
