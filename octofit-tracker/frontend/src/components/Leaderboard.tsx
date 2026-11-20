import { CapabilityCard } from './CapabilityCard.js';

type LeaderboardEntry = { teamName: string; totalPoints: number; rank: number };
type LeaderboardResponse = { leaderboard: LeaderboardEntry[] };

export default function Leaderboard() {
  return (
    <CapabilityCard<LeaderboardResponse>
      title="Leaderboard"
      description="Compare team point totals."
      endpoint="/api/leaderboard"
      emptyMessage="No leaderboard rankings yet."
      isEmpty={(data) => data.leaderboard.length === 0}
    >
      {(data) => (
        <ol className="list-group list-group-numbered">
          {data.leaderboard.map(({ teamName, totalPoints, rank }) => (
            <li className="list-group-item d-flex justify-content-between" key={teamName}>
              <span>{rank}. {teamName}</span>
              <strong>{totalPoints} points</strong>
            </li>
          ))}
        </ol>
      )}
    </CapabilityCard>
  );
}
