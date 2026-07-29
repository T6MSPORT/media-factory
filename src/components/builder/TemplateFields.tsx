import { TEMPLATE_FIELDS } from '../../config/templates';
import type {
  Project,
  ResultSessionType,
  ScheduleDay,
  ScheduleDayName,
  ScheduleSessionType,
} from '../../types';
import { TextField } from '../forms/PropertyEditor';

type TemplateFieldsProps = {
  project: Project;
  setDetails: (details: Partial<Project['details']>) => void;
};

export function TemplateFields({ project, setDetails }: TemplateFieldsProps) {
  if (project.template === 'schedule') {
    return <ScheduleFields project={project} setDetails={setDetails} />;
  }

  if (project.template === 'results') {
    return <ResultsFields project={project} setDetails={setDetails} />;
  }

  return (
    <>
      {TEMPLATE_FIELDS[project.template].map(field =>
        field.type === 'textarea' ? (
          <label key={field.key}>
            {field.label}
            <textarea
              value={String(project.details[field.key] ?? '')}
              placeholder={field.placeholder}
              onChange={event =>
                setDetails({
                  [field.key]:
                    project.template === 'announcement'
                      ? event.target.value.toUpperCase()
                      : event.target.value,
                })
              }
            />
          </label>
        ) : (
          <TextField
            key={field.key}
            label={field.label}
            value={String(project.details[field.key] ?? '')}
            type={field.type}
            onChange={value => setDetails({ [field.key]: value })}
          />
        ),
      )}
    </>
  );
}

function ResultsFields({ project, setDetails }: TemplateFieldsProps) {
  const resultSession = project.details.resultSession || 'race';

  return (
    <>
      <label>
        Session
        <select
          value={resultSession}
          onChange={event =>
            setDetails({
              resultSession: event.target.value as ResultSessionType,
            })
          }
        >
          <option value="qualifying">Qualifying</option>
          <option value="race">Race</option>
        </select>
      </label>
      <TextField
        label="Track name"
        value={project.details.circuit}
        onChange={circuit => setDetails({ circuit })}
      />
      {resultSession === 'race' && (
        <TextField
          label="Round(s)"
          value={project.details.round}
          onChange={round => setDetails({ round })}
        />
      )}
      <TextField
        label="Position"
        value={project.details.position}
        onChange={position => setDetails({ position })}
      />
    </>
  );
}

const DAY_OPTIONS: ScheduleDayName[] = ['Friday', 'Saturday', 'Sunday'];
const SESSION_OPTIONS: ScheduleSessionType[] = [
  '',
  'Practice',
  'Qualifying',
  'Race',
];

function makeDay(index: number): ScheduleDay {
  void index;
  return {
    day: '',
    sessions: Array.from({ length: 5 }, () => ({
      type: '' as ScheduleSessionType,
      time: '',
    })),
  };
}

function ScheduleFields({ project, setDetails }: TemplateFieldsProps) {
  const dayCount = Math.min(
    3,
    Math.max(1, project.details.scheduleDayCount || project.details.scheduleDays?.length || 1),
  );
  const days = Array.from(
    { length: dayCount },
    (_, index) => project.details.scheduleDays?.[index] || makeDay(index),
  );

  const updateDays = (nextDays: ScheduleDay[]) =>
    setDetails({
      scheduleDayCount: nextDays.length,
      scheduleDays: nextDays,
    });

  return (
    <div className="schedule-fields">
      <div className="schedule-top-fields">
        <label>
          Schedule days
          <select
            value={dayCount}
            onChange={event => {
              const nextCount = Number(event.target.value);
              updateDays(
                Array.from(
                  { length: nextCount },
                  (_, index) => days[index] || makeDay(index),
                ),
              );
            }}
          >
            <option value="1">1 day</option>
            <option value="2">2 days</option>
            <option value="3">3 days</option>
          </select>
        </label>

        <TextField
          label="Track name"
          value={project.details.circuit}
          onChange={circuit => setDetails({ circuit })}
        />
        <TextField
          label="Round(s)"
          value={project.details.round}
          onChange={round => setDetails({ round })}
        />
      </div>

      <div className="schedule-day-grid" data-days={dayCount}>
        {days.map((scheduleDay, dayIndex) => (
          <fieldset className="schedule-day" key={dayIndex}>
          {dayIndex > 0 && (
            <button
              type="button"
              className="schedule-remove-day"
              onClick={() => updateDays(days.filter((_, index) => index !== dayIndex))}
            >
              Remove day
            </button>
          )}
          <label>
            Day {dayIndex + 1}
            <select
              required
              value={scheduleDay.day}
              onChange={event => {
                const nextDays = [...days];
                nextDays[dayIndex] = {
                  ...scheduleDay,
                  day: event.target.value as ScheduleDayName,
                };
                updateDays(nextDays);
              }}
            >
              <option value="" disabled>
                SELECT DAY
              </option>
              {DAY_OPTIONS.map(day => (
                <option value={day} key={day}>
                  {day}
                </option>
              ))}
            </select>
          </label>

          <div className="schedule-sessions">
            {scheduleDay.sessions.map((session, sessionIndex) => (
              <div className="schedule-session-row" key={sessionIndex}>
                <label>
                  Session {sessionIndex + 1}
                  <select
                    aria-label={`Day ${dayIndex + 1} session ${sessionIndex + 1}`}
                    value={session.type}
                    onChange={event => {
                      const nextDays = [...days];
                      const sessions = [...scheduleDay.sessions];
                      sessions[sessionIndex] = {
                        ...session,
                        type: event.target.value as ScheduleSessionType,
                      };
                      nextDays[dayIndex] = { ...scheduleDay, sessions };
                      updateDays(nextDays);
                    }}
                  >
                    {SESSION_OPTIONS.map(type => (
                      <option value={type} key={type}>
                        {type || 'Select session'}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Time
                  <input
                    aria-label={`Day ${dayIndex + 1} session ${sessionIndex + 1} time`}
                    type="time"
                    value={session.time}
                    onChange={event => {
                      const nextDays = [...days];
                      const sessions = [...scheduleDay.sessions];
                      sessions[sessionIndex] = {
                        ...session,
                        time: event.target.value,
                      };
                      nextDays[dayIndex] = { ...scheduleDay, sessions };
                      updateDays(nextDays);
                    }}
                  />
                </label>
              </div>
            ))}
          </div>
          </fieldset>
        ))}
      </div>
    </div>
  );
}
