import React from "react";

type AttendedCardProps = {
  id: number;
  name: string;
  description?: string | null;
  points?: number | null;
  eventDate?: string;      // event datetime from Events table
  attendedAt?: string;     // when the user attended (Attendance.created_at)
};

const AttendedCard: React.FC<AttendedCardProps> = ({
  name,
  description,
  points,
  eventDate,
  attendedAt,
}) => {
  const formattedEventDate = eventDate
    ? new Date(eventDate).toLocaleString(undefined, {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Unknown Date";

  const formattedAttended = attendedAt
    ? new Date(attendedAt).toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  // AttendedCard.tsx
  return (
    <div className="flex flex-col bg-base-200 p-5 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 text-base">
      {/* name + date (inline) */}
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-2xl font-semibold text-primary">{name}</h3>
        <div className="text-sm text-gray-400">{formattedEventDate}</div>
      </div>

      {/* description — explicitly base-sized */}
      {description && (
        <p className="text-base text-gray-300 mb-3 leading-snug break-words">
          {description}
        </p>
      )}

      {/* footer */}
      <div className="flex justify-between text-sm text-gray-400 mt-auto">
        <span>{points ?? 0} pts</span>
        {formattedAttended && <span>Checked in: {formattedAttended}</span>}
      </div>
    </div>
  );

};

export default AttendedCard;
