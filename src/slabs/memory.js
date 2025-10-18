import { prisma } from '../lib/prisma';

/**
 * Updates a user's memory (role and perks) in the database.
 * @param {string} userId - The user's ID.
 * @param {object} data - The data to update (role, perks).
 */
export async function updateMemory(userId, data) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      role: data.role,
      perks: data.perks || {},
    },
  });
}
