import mongoose from 'mongoose';
import { Activity, Team, User, Workout } from '../models/index.js';

export async function listActivities() {
  return Activity.find().lean();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function invalidActivityRequest(message: string) {
  return Object.assign(new Error(message), { status: 400 });
}

export async function createActivity(input: unknown) {
  if (!isRecord(input)) {
    throw invalidActivityRequest('Activity must be an object');
  }

  const { userId, teamId, type, minutes } = input;
  if (typeof userId !== 'string' || !mongoose.isValidObjectId(userId)) {
    throw invalidActivityRequest('A valid userId is required');
  }
  if (typeof teamId !== 'string' || !mongoose.isValidObjectId(teamId)) {
    throw invalidActivityRequest('A valid teamId is required');
  }
  if (typeof type !== 'string' || !type.trim()) {
    throw invalidActivityRequest('Activity type is required');
  }
  if (typeof minutes !== 'number' || !Number.isFinite(minutes) || minutes <= 0) {
    throw invalidActivityRequest('Activity minutes must be a positive number');
  }

  const [user, team] = await Promise.all([
    User.findById(userId).select('_id').lean(),
    Team.findById(teamId).select('_id').lean(),
  ]);
  if (!user || !team) {
    throw invalidActivityRequest('User or team does not exist');
  }

  return Activity.create({
    user: user._id,
    team: team._id,
    type: type.trim(),
    minutes,
    points: minutes,
    occurredAt: new Date(),
  });
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(_input: unknown) {
  throw Object.assign(new Error('Team validation is not implemented yet'), { status: 501 });
}

export async function getLeaderboard() {
  return [];
}

export async function suggestWorkouts(_userEmail: string) {
  return Workout.find().limit(1).lean();
}

export { User };
