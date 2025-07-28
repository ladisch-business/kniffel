import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { GameModel } from '../models/Game';
import { GameSettings } from '../types';
import Joi from 'joi';

const createGameSchema = Joi.object({
  mode: Joi.string().valid('classic', 'eins_muss_weg', 'multi_block').required(),
  maxPlayers: Joi.number().min(2).max(10).required(),
  aiPlayers: Joi.number().min(0).required(),
  isPublic: Joi.boolean().default(true),
  tournamentMode: Joi.boolean().default(false),
  jokerKniffel: Joi.boolean().default(false),
  fastGame: Joi.boolean().default(false),
  timeLimit: Joi.number().min(60).max(120).optional(),
  multiBlocks: Joi.number().min(1).max(10).optional()
});

export const createGame = async (req: AuthRequest, res: Response) => {
  try {
    const { error, value } = createGameSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    if (value.tournamentMode && value.maxPlayers > 10) {
      return res.status(400).json({ error: 'Tournament mode supports max 10 players' });
    }

    if (value.fastGame && !value.timeLimit) {
      return res.status(400).json({ error: 'Time limit required for fast game' });
    }

    const game = await GameModel.create(value as GameSettings, req.user!.id);
    
    const gamePlayer = await GameModel.addPlayer(game.id, req.user!.id, 0);
    await GameModel.createScoreBlocks(gamePlayer.id, game.multi_blocks);

    for (let i = 0; i < value.aiPlayers; i++) {
      const aiPlayer = await GameModel.addPlayer(
        game.id, 
        null, 
        i + 1, 
        true, 
        `AI Player ${i + 1}`
      );
      await GameModel.createScoreBlocks(aiPlayer.id, game.multi_blocks);
    }

    res.status(201).json(game);
  } catch (error) {
    console.error('Create game error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getPublicGames = async (req: AuthRequest, res: Response) => {
  try {
    const games = await GameModel.findPublicGames();
    res.json(games);
  } catch (error) {
    console.error('Get public games error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getGame = async (req: AuthRequest, res: Response) => {
  try {
    const { gameId } = req.params;
    const game = await GameModel.findById(gameId);
    
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    const players = await GameModel.getPlayers(gameId);
    
    res.json({
      ...game,
      players
    });
  } catch (error) {
    console.error('Get game error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const joinGame = async (req: AuthRequest, res: Response) => {
  try {
    const { gameId } = req.params;
    const game = await GameModel.findById(gameId);
    
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    if (game.status !== 'waiting') {
      return res.status(400).json({ error: 'Game already started' });
    }

    const players = await GameModel.getPlayers(gameId);
    
    if (players.length >= game.max_players) {
      return res.status(400).json({ error: 'Game is full' });
    }

    const existingPlayer = players.find(p => p.user_id === req.user!.id);
    if (existingPlayer) {
      return res.status(400).json({ error: 'Already joined this game' });
    }

    const gamePlayer = await GameModel.addPlayer(
      gameId, 
      req.user!.id, 
      players.length
    );
    
    await GameModel.createScoreBlocks(gamePlayer.id, game.multi_blocks);

    res.json({ message: 'Joined game successfully' });
  } catch (error) {
    console.error('Join game error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
