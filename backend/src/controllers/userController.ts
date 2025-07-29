import { Response } from 'express';
import { UserModel } from '../models/User';
import { AuthRequest } from '../middleware/auth';
import Joi from 'joi';

const sendFriendRequestSchema = Joi.object({
  username: Joi.string().required()
});

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await UserModel.findById(req.user!.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.id,
      username: user.username,
      created_at: user.created_at
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getStatistics = async (req: AuthRequest, res: Response) => {
  try {
    const statistics = await UserModel.getStatistics(req.user!.id);
    res.json(statistics);
  } catch (error) {
    console.error('Get statistics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getFriends = async (req: AuthRequest, res: Response) => {
  try {
    const friends = await UserModel.getFriends(req.user!.id);
    res.json(friends);
  } catch (error) {
    console.error('Get friends error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const sendFriendRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { error, value } = sendFriendRequestSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const targetUser = await UserModel.findByUsername(value.username);
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (targetUser.id === req.user!.id) {
      return res.status(400).json({ error: 'Cannot send friend request to yourself' });
    }

    await UserModel.sendFriendRequest(req.user!.id, targetUser.id);
    res.json({ message: 'Friend request sent successfully' });
  } catch (error) {
    console.error('Send friend request error:', error);
    if (error instanceof Error && error.message.includes('already exists')) {
      return res.status(409).json({ error: 'Friend request already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const acceptFriendRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { friendshipId } = req.params;
    await UserModel.acceptFriendRequest(friendshipId, req.user!.id);
    res.json({ message: 'Friend request accepted' });
  } catch (error) {
    console.error('Accept friend request error:', error);
    if (error instanceof Error && error.message.includes('not found')) {
      return res.status(404).json({ error: 'Friend request not found' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const rejectFriendRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { friendshipId } = req.params;
    await UserModel.rejectFriendRequest(friendshipId, req.user!.id);
    res.json({ message: 'Friend request rejected' });
  } catch (error) {
    console.error('Reject friend request error:', error);
    if (error instanceof Error && error.message.includes('not found')) {
      return res.status(404).json({ error: 'Friend request not found' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const removeFriend = async (req: AuthRequest, res: Response) => {
  try {
    const { friendshipId } = req.params;
    await UserModel.removeFriend(friendshipId, req.user!.id);
    res.json({ message: 'Friend removed successfully' });
  } catch (error) {
    console.error('Remove friend error:', error);
    if (error instanceof Error && error.message.includes('not found')) {
      return res.status(404).json({ error: 'Friendship not found' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getLeaderboard = async (req: AuthRequest, res: Response) => {
  try {
    const { filter = 'total' } = req.query;
    const leaderboard = await UserModel.getLeaderboard(filter as string);
    res.json(leaderboard);
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
