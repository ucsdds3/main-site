import { EventTagType, tagColor } from "src/Utils/types";
import { AttendedEvent } from "../Sections/Events";

const AttendedCard = (event: AttendedEvent) => {
  const { start, end, name, description, points, tags, attended_at } = event;

  const formatDate = (date?: string) =>
    date &&
    new Date(date).toLocaleString(undefined, {
      year: "2-digit",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    });

  const formatTime = (date?: string) =>
    date &&
    new Date(date).toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "numeric",
    });

  const startDT = formatDate(start);
  const endDT = formatDate(end);
  const endTime = formatTime(end);
  const attendedDT = formatDate(attended_at);

  const sameDay = end && startDT?.split(",")[0] === endDT?.split(",")[0];
  const eventTime = end ? sameDay ? startDT + " - " + endTime : startDT + " - " + endDT : startDT;

  // AttendedCard.tsx
  return (
    <div className="flex flex-col bg-base-200 p-5 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 text-base">
      {/* name + date (inline) */}
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <h3 className="text-2xl font-semibold text-primary">{name}</h3>
          <div className="badge badge-primary mt-1">{points} points</div>
          {tags?.map(tag => (
            <div className={`badge ${tagColor[tag as EventTagType] || ""} mt-1`} key={tag}>
              {tag}
            </div>
          ))}
        </div>
        <div className="text-sm text-gray-400">
          {eventTime} | Check in: {sameDay ? attendedDT?.split(",")[1] : attendedDT}
        </div>
      </div>

      {/* description — explicitly base-sized */}
      {description && (
        <p className="text-base text-gray-300 mb-3 leading-snug break-words">{description}</p>
      )}
    </div>
  );
};

export default AttendedCard;
