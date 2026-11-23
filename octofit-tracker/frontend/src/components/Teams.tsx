import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

type Team = { _id?: string; name: string; members: string[]; description?: string; schedule?: string; maxAttendance?: number };
type TeamResponse = { teams: Team[] };

export default function Teams() {
  return (
    <CapabilityCard<TeamResponse>
      title="Teams"
      description="Manage teams and members."
      load={() => getJson<TeamResponse>('/api/teams')}
      emptyMessage="No teams yet."
      isEmpty={(data) => data.teams.length === 0}
    >
      {(data) => (
        <ul className="list-group">
          {data.teams.map((team, index) => (
            <li className="list-group-item" key={team._id ?? `${team.name}-${index}`}>
              <strong>{team.name}</strong>
              {team.description && <div>{team.description}</div>}
              {team.schedule && <div>Schedule: {team.schedule}</div>}
              {team.maxAttendance !== undefined && <div>Max attendance: {team.maxAttendance}</div>}
              {team.members.length > 0 && <span> · {team.members.join(', ')}</span>}
            </li>
          ))}
        </ul>
      )}
    </CapabilityCard>
  );
}
