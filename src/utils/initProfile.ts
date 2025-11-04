// src/utils/initProfile.ts
// Profile builder initializer for user onboarding and dashboard

export interface User {
  id: string;
  profileAccess?: boolean;
}

export interface Profile {
  id: string;
  username: string;
  avatar: string;
  bio: string;
  modules: string[];
  legacyStatus: string;
  artifactLog: any[];
}

export const initProfile = (user: User): Profile => {
  if (!user.profileAccess) throw new Error('Profile access denied');

  return {
    id: user.id,
    username: 'Polotus',
    avatar: '/avatars/polotus.png',
    bio: 'Sovereign founder of Vanguard and Fortheweebs. Architect of creator-first infrastructure.',
    modules: ['Canvas Forge', 'Sound Forge', 'Video Forge', 'CGI Generator', 'Analytics', 'Campaign Triggers'],
    legacyStatus: 'MythicFounder',
    artifactLog: [],
  };
};
