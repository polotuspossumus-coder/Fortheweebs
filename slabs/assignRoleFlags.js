export function assignRoleFlags(user) {
  if (user.payment === 100 && user.index <= 25) {
    user.role = 'founding';
    user.perks = ['cosmetic', 'priority'];
  } else if (user.payment === 100) {
    user.role = 'influencer';
    user.perks = ['priority'];
  } else if (user.payment === 50) {
    user.role = 'techcrew';
    user.perks = ['backstage'];
  } else {
    user.role = 'subscriber';
    user.perks = ['access'];
  }
  return user;
}
