// middleware/accessTier.js
const path = require('path');
const { Low, JSONFile } = require('lowdb');

const usersDbFile = path.join(__dirname, '../../media/vanguard-users.json');
const usersAdapter = new JSONFile(usersDbFile);
const usersDb = new Low(usersAdapter);

module.exports = function requireTier(minTier) {
  return async (req, res, next) => {
    await usersDb.read();
    const user = usersDb.data.users.find(u => u.id === req.user.id);
    const tiers = { '100': 4, '95': 3, '85': 2, '80': 1 };
    if (user && tiers[user.tier] >= tiers[minTier]) return next();
    res.status(403).json({ error: 'Insufficient access tier' });
  };
};
