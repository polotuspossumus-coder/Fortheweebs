/**
 * Quick Owner Access Test
 * Paste this in browser console (F12) to verify your access
 */

console.log('🔍 OWNER ACCESS CHECK');
console.log('====================');
console.log('Email:', localStorage.getItem('userEmail'));
console.log('Owner Email:', localStorage.getItem('ownerEmail'));
console.log('User ID:', localStorage.getItem('userId'));
console.log('User Tier:', localStorage.getItem('userTier'));
console.log('Admin Auth:', localStorage.getItem('adminAuthenticated'));
console.log('');

// Check if owner
const isOwner = localStorage.getItem('userId') === 'owner' || 
                localStorage.getItem('ownerEmail') === 'polotuspossumus@gmail.com' ||
                localStorage.getItem('userEmail') === 'polotuspossumus@gmail.com';

if (isOwner) {
  console.log('✅ OWNER STATUS: CONFIRMED');
  console.log('👑 You have unlimited access to all features');
} else {
  console.log('❌ NOT LOGGED IN AS OWNER');
  console.log('');
  console.log('To fix, paste this:');
  console.log('localStorage.setItem("userEmail", "polotuspossumus@gmail.com");');
  console.log('localStorage.setItem("ownerEmail", "polotuspossumus@gmail.com");');
  console.log('localStorage.setItem("userId", "owner");');
  console.log('localStorage.setItem("userTier", "OWNER");');
  console.log('localStorage.setItem("adminAuthenticated", "true");');
  console.log('location.reload();');
}
