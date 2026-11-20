import { CapabilityCard } from './CapabilityCard.js';

type Workout = { _id?: string; title: string; focus?: string; minutes?: number; difficulty?: string; reason?: string };
type WorkoutResponse = { suggestions: Workout[] };

const demoUserEmail = 'mona@example.com';

export default function Workouts() {
  return (
    <CapabilityCard<WorkoutResponse>
      title="Workout suggestions"
      description="Recommend workouts from activity patterns."
      endpoint={`/api/workouts/suggestions/${encodeURIComponent(demoUserEmail)}`}
      emptyMessage="No workout suggestions yet."
      isEmpty={(data) => data.suggestions.length === 0}
    >
      {(data) => (
        <ul className="list-group">
          {data.suggestions.map((workout, index) => (
            <li className="list-group-item" key={workout._id ?? `${workout.title}-${index}`}>
              <strong>{workout.title}</strong>
              {workout.reason && <span> · {workout.reason}</span>}
            </li>
          ))}
        </ul>
      )}
    </CapabilityCard>
  );
}
