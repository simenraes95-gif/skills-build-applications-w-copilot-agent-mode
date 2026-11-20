import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

type Activity = { _id?: string; type: string; minutes: number; points: number };
type ActivityResponse = { activities: Activity[] };

export default function Activities() {
  return (
    <CapabilityCard<ActivityResponse>
      title="Activities"
      description="Track student activity minutes and points."
      load={() => getJson<ActivityResponse>('/api/activities')}
      emptyMessage="No activities yet."
      isEmpty={(data) => data.activities.length === 0}
    >
      {(data) => (
        <ul className="list-group">
          {data.activities.map((activity, index) => (
            <li className="list-group-item" key={activity._id ?? `${activity.type}-${index}`}>
              {activity.type} · {activity.minutes} minutes · {activity.points} points
            </li>
          ))}
        </ul>
      )}
    </CapabilityCard>
  );
}
