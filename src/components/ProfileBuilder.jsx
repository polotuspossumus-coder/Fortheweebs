// src/components/ProfileBuilder.jsx
import React from 'react';
import ProfileEditor from './ProfileEditor.tsx';

export default function ProfileBuilder({ user }) {
  // You can add more onboarding/profile logic here if needed
  return <ProfileEditor user={user} />;
}
