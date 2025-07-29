import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { 
  getProfile, 
  getStatistics, 
  getFriends, 
  sendFriendRequest, 
  acceptFriendRequest, 
  rejectFriendRequest, 
  removeFriend, 
  getLeaderboard 
} from '../controllers/userController';

const router = Router();

router.use(authenticateToken);

router.get('/profile', getProfile);
router.get('/statistics', getStatistics);
router.get('/friends', getFriends);
router.post('/friends', sendFriendRequest);
router.put('/friends/:friendshipId/accept', acceptFriendRequest);
router.put('/friends/:friendshipId/reject', rejectFriendRequest);
router.delete('/friends/:friendshipId', removeFriend);
router.get('/leaderboard', getLeaderboard);

export default router;
