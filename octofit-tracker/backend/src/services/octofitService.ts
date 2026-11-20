import mongoose from 'mongoose';
import { Activity, Team, User, Workout } from '../models/index.js';

export async function listActivities() {
  return Activity.find().lean();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function invalidRequest(message: string) {
  return Object.assign(new Error(message), { status: 400 });
}

export async function createActivity(input: unknown) {
  if (!isRecord(input)) {
    throw invalidRequest('Activity must be an object');
  }

  const { userId, teamId, type, minutes } = input;
  if (typeof userId !== 'string' || !mongoose.isValidObjectId(userId)) {
    throw invalidRequest('A valid userId is required');
  }
  if (typeof teamId !== 'string' || !mongoose.isValidObjectId(teamId)) {
    throw invalidRequest('A valid teamId is required');
  }
  if (typeof type !== 'string' || !type.trim()) {
    throw invalidRequest('Activity type is required');
  }
  if (typeof minutes !== 'number' || !Number.isFinite(minutes) || minutes <= 0) {
    throw invalidRequest('Activity minutes must be a positive number');
  }

  const [user, team] = await Promise.all([
    User.findById(userId).select('_id').lean(),
    Team.findById(teamId).select('_id').lean(),
  ]);
  if (!user || !team) {
    throw invalidRequest('User or team does not exist');
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

export async function createTeam(input: unknown) {
  if (!isRecord(input)) {
    throw invalidRequest('Team must be an object');
  }

  const { name, mascot } = input;
  const members = input.members ?? [];
  if (typeof name !== 'string' || !name.trim()) {
    throw invalidRequest('Team name is required');
  }
  if (typeof mascot !== 'string' || !mascot.trim()) {
    throw invalidRequest('Team mascot is required');
  }
  if (!Array.isArray(members)) {
    throw invalidRequest('Team members must be valid user IDs');
  }

  const memberIds: string[] = [];
  for (const member of members) {
    if (typeof member !== 'string' || !mongoose.isValidObjectId(member)) {
      throw invalidRequest('Team members must be valid user IDs');
    }
    memberIds.push(member);
  }
  const uniqueMemberIds = [...new Set(memberIds)];
  const users = await User.find({ _id: { $in: uniqueMemberIds } }).select('_id').lean();
  if (users.length !== uniqueMemberIds.length) {
    throw invalidRequest('One or more team members do not exist');
  }

  return Team.create({ name: name.trim(), mascot: mascot.trim(), members: uniqueMemberIds });
}

export async function getLeaderboard() {
  const totals = await Activity.aggregate<{ _id: mongoose.Types.ObjectId; totalPoints: number }>([
    { $group: { _id: '$team', totalPoints: { $sum: '$points' } } },
  ]);
  if (totals.length === 0) return [];

  const teams = await Team.find({ _id: { $in: totals.map(({ _id }) => _id) } }).select('_id name').lean();
  const teamNames = new Map(teams.map((team) => [team._id.toString(), team.name]));
  return totals
    .flatMap(({ _id, totalPoints }) => {
      const teamName = teamNames.get(_id.toString());
      return teamName === undefined ? [] : [{ teamName, totalPoints }];
    })
    .sort((left, right) => right.totalPoints - left.totalPoints || left.teamName.localeCompare(right.teamName))
    .map((entry, index) => ({ ...entry, rank: index + 1 }));
}

export async function suggestWorkouts(userEmail: string) {
  const user = await User.findOne({ email: userEmail }).select('_id fitnessGoal').lean();
  if (!user) {
    throw Object.assign(new Error('User not found'), { status: 404 });
  }

  const [activities, workouts] = await Promise.all([
    Activity.find({ user: user._id }).select('type').lean(),
    Workout.find().lean(),
  ]);
  const activityTypes = [...new Set(activities.map(({ type }) => type.toLowerCase()))];
  const goal = user.fitnessGoal.toLowerCase();

  return workouts
    .map((workout) => {
      const matchesGoal = workout.focus.toLowerCase() === goal;
      const matchingActivities = activityTypes.filter((type) => type === workout.focus.toLowerCase());
      const score = Number(matchesGoal) + matchingActivities.length;
      const reason = matchesGoal
        ? `Matches your ${user.fitnessGoal} goal${activityTypes.length ? ` and ${activityTypes.join(', ')} activity` : ''}`
        : matchingActivities.length
          ? `Matches your ${matchingActivities.join(', ')} activity`
          : 'Suggested workout';
      return { workout, score, reason };
    })
    .sort((left, right) => right.score - left.score || String(left.workout.title ?? '').localeCompare(String(right.workout.title ?? '')))
    .map(({ workout, reason }) => ({ ...workout, reason }));
}

export { User };
