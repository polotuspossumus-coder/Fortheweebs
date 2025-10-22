// src/utils/accessOverride.ts
// Special access override for Polotus (Jacob Morris)

export interface User {
  id: string;
  email: string;
  hasPaid?: boolean;
  accountCreated?: boolean;
  role?: string;
}

export const isPolotus = (user: User) =>
  user.id === 'jacob.morris' || user.email === 'polotus@vanguard.tools';

export function handleAccess(user: User) {
  if (isPolotus(user)) {
    return {
      status: 'active',
      account: {
        id: 'jacob.morris',
        role: 'MythicFounder',
        paymentStatus: 'bypassed',
        profileAccess: true,
        creationBlocked: false,
      },
    };
  }

  // Default flow for all other users
  if (!user.hasPaid || !user.accountCreated) {
    return {
      status: 'blocked',
      reason: 'Account creation and payment required',
    };
  }

  return {
    status: 'active',
    account: {
      id: user.id,
      role: user.role,
      paymentStatus: 'verified',
      profileAccess: true,
      creationBlocked: false,
    },
  };
}
