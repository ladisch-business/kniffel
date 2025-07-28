import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { createGame, getPublicGames, getGame, joinGame } from '../controllers/gameController';

const router = Router();

router.use(authenticateToken);

router.post('/', createGame);
router.get('/public', getPublicGames);
router.get('/:gameId', getGame);
router.post('/:gameId/join', joinGame);

export default router;
