// src/utils/accessOverride.ts
// Special access override for Polotus (Jacob Morris)

export interface User {
  id: string;
  email: string;
  hasPaid?: boolean;
  accountCreated?: boolean;
  role?: string;
}


// Secure: check for override email from environment variable
export const isPolotus = (user: User) => {
  const overrideEmail = typeof process !== 'undefined' ? process.env.OVERRIDE_EMAIL : undefined;
  return overrideEmail && user.email === overrideEmail;
};

export function handleAccess(user: User) {
  if (isPolotus(user)) {
    return {
      status: 'active',
      account: {
        id: user.id,
        role: user.role || 'MythicFounder',
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
