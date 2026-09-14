import { useMemo } from 'react';

const trimTrailingSlashes = (value: string) => value.replace(/\/+$/, '');
const trimLeadingSlashes = (value: string) => value.replace(/^\/+/, '');

/** Builds the public URL for a stored profile-picture path in the active environment. */
export const useProfilePicture = (profilePicPath: string | null | undefined): string | null =>
  useMemo(() => {
    if (!profilePicPath) return null;
    if (/^https?:\/\//i.test(profilePicPath)) return profilePicPath;

    const baseUrl =
      process.env.EXPO_PUBLIC_ENVIRONMENT === 'production'
        ? process.env.EXPO_PUBLIC_SUPABASE_URL
          ? `${trimTrailingSlashes(process.env.EXPO_PUBLIC_SUPABASE_URL)}/storage/v1/object/public`
          : undefined
        : process.env.EXPO_PUBLIC_DEV_IMAGE_BUCKET;

    if (!baseUrl) return null;
    return `${trimTrailingSlashes(baseUrl)}/${trimLeadingSlashes(profilePicPath)}`;
  }, [profilePicPath]);

