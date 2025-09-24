// backend/src/routes/goals.js
import express from 'express';
import { verifyAuth } from '../middleware/auth.js';
import {
  addGoal,
  listGoals,
  getGoal,
  updateGoal,
  removeGoal
} from '../services/goalService.js';

const router = express.Router();

// POST /api/goals -> create goal
router.post('/', verifyAuth, async (req, res, next) => {
  try {
    const goal = await addGoal(req.user.uid, req.body);
    res.status(201).json(goal);
  } catch (err) {
    next(err);
  }
});

// GET /api/goals -> list all goals
router.get('/', verifyAuth, async (req, res, next) => {
  try {
    const goals = await listGoals(req.user.uid);
    res.json(goals);
  } catch (err) {
    next(err);
  }
});

// GET /api/goals/:goalId -> get goal
router.get('/:goalId', verifyAuth, async (req, res, next) => {
  try {
    const goal = await getGoal(req.user.uid, req.params.goalId);
    res.json(goal);
  } catch (err) {
    next(err);
  }
});

// PUT /api/goals/:goalId -> update goal
router.put('/:goalId', verifyAuth, async (req, res, next) => {
  try {
    const updated = await updateGoal(req.user.uid, req.params.goalId, req.body);
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/goals/:goalId -> delete goal
router.delete('/:goalId', verifyAuth, async (req, res, next) => {
  try {
    const result = await removeGoal(req.user.uid, req.params.goalId);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
