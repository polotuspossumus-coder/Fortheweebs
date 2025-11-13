// FIRESTORE DATABASE SCHEMA & UTILITIES

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  increment,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

// ==================== USERS ====================

export const createUser = async (userId, userData) => {
  const userRef = doc(db, 'users', userId);
  await setDoc(userRef, {
    ...userData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
};

export const getUser = async (userId) => {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  return userSnap.exists() ? { id: userSnap.id, ...userSnap.data() } : null;
};

export const updateUser = async (userId, updates) => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    ...updates,
    updatedAt: serverTimestamp()
  });
};

export const updateUserBalance = async (userId, amount) => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    balance: increment(amount),
    updatedAt: serverTimestamp()
  });
};

// ==================== ARTWORKS ====================

export const createArtwork = async (artworkData) => {
  const artworkRef = doc(collection(db, 'artworks'));
  await setDoc(artworkRef, {
    ...artworkData,
    likes: [],
    views: 0,
    comments: [],
    approvalStatus: 'pending', // pending, approved, rejected, flagged
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return artworkRef.id;
};

export const getArtwork = async (artworkId) => {
  const artworkRef = doc(db, 'artworks', artworkId);
  const artworkSnap = await getDoc(artworkRef);
  return artworkSnap.exists() ? { id: artworkSnap.id, ...artworkSnap.data() } : null;
};

export const getUserArtworks = async (userId, filterStatus = 'approved') => {
  const artworksRef = collection(db, 'artworks');
  const q = query(
    artworksRef,
    where('userId', '==', userId),
    where('approvalStatus', '==', filterStatus),
    orderBy('createdAt', 'desc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const updateArtwork = async (artworkId, updates) => {
  const artworkRef = doc(db, 'artworks', artworkId);
  await updateDoc(artworkRef, {
    ...updates,
    updatedAt: serverTimestamp()
  });
};

export const deleteArtwork = async (artworkId) => {
  const artworkRef = doc(db, 'artworks', artworkId);
  await deleteDoc(artworkRef);
};

export const likeArtwork = async (artworkId, userId) => {
  const artworkRef = doc(db, 'artworks', artworkId);
  await updateDoc(artworkRef, {
    likes: arrayUnion(userId),
    updatedAt: serverTimestamp()
  });
};

export const unlikeArtwork = async (artworkId, userId) => {
  const artworkRef = doc(db, 'artworks', artworkId);
  await updateDoc(artworkRef, {
    likes: arrayRemove(userId),
    updatedAt: serverTimestamp()
  });
};

export const incrementArtworkViews = async (artworkId) => {
  const artworkRef = doc(db, 'artworks', artworkId);
  await updateDoc(artworkRef, {
    views: increment(1)
  });
};

// ==================== COMMISSIONS ====================

export const createCommission = async (commissionData) => {
  const commissionRef = doc(collection(db, 'commissions'));
  await setDoc(commissionRef, {
    ...commissionData,
    status: 'open', // open, closed, completed
    rating: 0,
    completedCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return commissionRef.id;
};

export const getCommission = async (commissionId) => {
  const commissionRef = doc(db, 'commissions', commissionId);
  const commissionSnap = await getDoc(commissionRef);
  return commissionSnap.exists() ? { id: commissionSnap.id, ...commissionSnap.data() } : null;
};

export const getUserCommissions = async (userId) => {
  const commissionsRef = collection(db, 'commissions');
  const q = query(
    commissionsRef,
    where('creatorId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getAllCommissions = async (limitCount = 50) => {
  const commissionsRef = collection(db, 'commissions');
  const q = query(
    commissionsRef,
    where('status', '==', 'open'),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// ==================== COMMISSION ORDERS ====================

export const createCommissionOrder = async (orderData) => {
  const orderRef = doc(collection(db, 'commissionOrders'));
  await setDoc(orderRef, {
    ...orderData,
    status: 'pending', // pending, in_progress, completed, cancelled
    paymentStatus: 'pending', // pending, paid, refunded
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return orderRef.id;
};

export const updateCommissionOrder = async (orderId, updates) => {
  const orderRef = doc(db, 'commissionOrders', orderId);
  await updateDoc(orderRef, {
    ...updates,
    updatedAt: serverTimestamp()
  });
};

// ==================== SUBSCRIPTIONS ====================

export const createSubscription = async (subscriptionData) => {
  const subscriptionRef = doc(collection(db, 'subscriptions'));
  await setDoc(subscriptionRef, {
    ...subscriptionData,
    status: 'active', // active, cancelled, expired, past_due
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return subscriptionRef.id;
};

export const getUserSubscription = async (userId) => {
  const subscriptionsRef = collection(db, 'subscriptions');
  const q = query(
    subscriptionsRef,
    where('userId', '==', userId),
    where('status', '==', 'active'),
    limit(1)
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.empty ? null : { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };
};

export const updateSubscription = async (subscriptionId, updates) => {
  const subscriptionRef = doc(db, 'subscriptions', subscriptionId);
  await updateDoc(subscriptionRef, {
    ...updates,
    updatedAt: serverTimestamp()
  });
};

export const cancelSubscription = async (subscriptionId) => {
  const subscriptionRef = doc(db, 'subscriptions', subscriptionId);
  await updateDoc(subscriptionRef, {
    status: 'cancelled',
    cancelledAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
};

// ==================== TIPS ====================

export const createTip = async (tipData) => {
  const tipRef = doc(collection(db, 'tips'));
  await setDoc(tipRef, {
    ...tipData,
    createdAt: serverTimestamp()
  });
  return tipRef.id;
};

export const getUserTips = async (userId, type = 'received') => {
  const tipsRef = collection(db, 'tips');
  const field = type === 'received' ? 'creatorId' : 'senderId';
  const q = query(
    tipsRef,
    where(field, '==', userId),
    orderBy('createdAt', 'desc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// ==================== TRANSACTIONS ====================

export const createTransaction = async (transactionData) => {
  const transactionRef = doc(collection(db, 'transactions'));
  await setDoc(transactionRef, {
    ...transactionData,
    createdAt: serverTimestamp()
  });
  return transactionRef.id;
};

export const getUserTransactions = async (userId, limitCount = 50) => {
  const transactionsRef = collection(db, 'transactions');
  const q = query(
    transactionsRef,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// ==================== COMMENTS ====================

export const createComment = async (commentData) => {
  const commentRef = doc(collection(db, 'comments'));
  await setDoc(commentRef, {
    ...commentData,
    likes: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  
  // Update artwork comment count
  if (commentData.artworkId) {
    const artworkRef = doc(db, 'artworks', commentData.artworkId);
    await updateDoc(artworkRef, {
      commentCount: increment(1)
    });
  }
  
  return commentRef.id;
};

export const getArtworkComments = async (artworkId) => {
  const commentsRef = collection(db, 'comments');
  const q = query(
    commentsRef,
    where('artworkId', '==', artworkId),
    orderBy('createdAt', 'desc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// ==================== FOLLOWS ====================

export const followUser = async (followerId, followingId) => {
  const followerRef = doc(db, 'users', followerId);
  const followingRef = doc(db, 'users', followingId);
  
  await updateDoc(followerRef, {
    following: arrayUnion(followingId),
    updatedAt: serverTimestamp()
  });
  
  await updateDoc(followingRef, {
    followers: arrayUnion(followerId),
    updatedAt: serverTimestamp()
  });
};

export const unfollowUser = async (followerId, followingId) => {
  const followerRef = doc(db, 'users', followerId);
  const followingRef = doc(db, 'users', followingId);
  
  await updateDoc(followerRef, {
    following: arrayRemove(followingId),
    updatedAt: serverTimestamp()
  });
  
  await updateDoc(followingRef, {
    followers: arrayRemove(followerId),
    updatedAt: serverTimestamp()
  });
};

// ==================== ANALYTICS ====================

export const getCreatorAnalytics = async (userId) => {
  const artworks = await getUserArtworks(userId);
  const commissions = await getUserCommissions(userId);
  const tipsReceived = await getUserTips(userId, 'received');
  
  const totalLikes = artworks.reduce((sum, art) => sum + (art.likes?.length || 0), 0);
  const totalViews = artworks.reduce((sum, art) => sum + (art.views || 0), 0);
  const totalEarnings = tipsReceived.reduce((sum, tip) => sum + tip.amount, 0);
  
  return {
    artworkCount: artworks.length,
    commissionCount: commissions.length,
    totalLikes,
    totalViews,
    totalEarnings,
    tipsReceived: tipsReceived.length
  };
};

export default {
  // Users
  createUser,
  getUser,
  updateUser,
  updateUserBalance,
  
  // Artworks
  createArtwork,
  getArtwork,
  getUserArtworks,
  updateArtwork,
  deleteArtwork,
  likeArtwork,
  unlikeArtwork,
  incrementArtworkViews,
  
  // Commissions
  createCommission,
  getCommission,
  getUserCommissions,
  getAllCommissions,
  
  // Commission Orders
  createCommissionOrder,
  updateCommissionOrder,
  
  // Subscriptions
  createSubscription,
  getUserSubscription,
  updateSubscription,
  cancelSubscription,
  
  // Tips
  createTip,
  getUserTips,
  
  // Transactions
  createTransaction,
  getUserTransactions,
  
  // Comments
  createComment,
  getArtworkComments,
  
  // Follows
  followUser,
  unfollowUser,
  
  // Analytics
  getCreatorAnalytics
};
