import { FaTrophy } from "react-icons/fa";

import Page from "src/Shared/Page/Page";
import Section from "src/Shared/Page/Section";
import { useLeaderboard, type LeaderboardEntry } from "src/Sites/Members/Hooks/useLeaderboard";

const medalColors = {
  1: {
    bg: "bg-yellow-400",
    text: "text-yellow-900",
    podium: "bg-gradient-to-t from-yellow-500/30 to-yellow-400/20",
    trophy: "mb-2 text-yellow-400",
  },
  2: {
    bg: "bg-gray-300",
    text: "text-gray-700",
    podium: "bg-gradient-to-t from-gray-400/30 to-gray-300/20",
    trophy: "mb-2 text-gray-400",
  },
  3: {
    bg: "bg-amber-600",
    text: "text-amber-100",
    podium: "bg-gradient-to-t from-amber-700/30 to-amber-600/20",
    trophy: "mb-2 text-amber-600",
  },
};

const podiumHeights = { 1: "80%", 2: "65%", 3: "50%" } as const;

function PodiumSlot({
  entry,
  position,
}: Readonly<{ entry: LeaderboardEntry | null; position: 1 | 2 | 3 }>) {
  const colors = medalColors[position];
  const order = { 1: "order-2", 2: "order-1", 3: "order-3" } as const;

  return (
    <div
      className={`flex w-full h-[80vh] lg:h-full flex-col items-center justify-end gap-2 ${order[position]}`}
    >
      <div className="flex flex-col items-center gap-1 shrink-0">
        {entry ? (
          <>
            <div
              className={`size-16 rounded-full flex items-center justify-center overflow-hidden font-bold text-xl shadow-lg ${
                entry.profile_picture ? "" : `${colors.bg} ${colors.text}`
              }`}
            >
              {entry.profile_picture ? (
                <img
                  src={entry.profile_picture}
                  alt={entry.full_name}
                  className="size-full object-cover object-center"
                />
              ) : (
                entry.full_name
                  .split(" ")
                  .map(n => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()
              )}
            </div>
            <span
              className="max-w-[120px] truncate text-center text-base font-semibold text-(--obs-text-primary)"
              title={entry.full_name}
            >
              {entry.full_name}
            </span>
            <span className="text-lg font-bold text-[#F58134]">{entry.points} pts</span>
          </>
        ) : (
          <span className="text-sm text-(--obs-text-faint)">—</span>
        )}
      </div>
      <div
        className={`flex min-h-16 w-full flex-col items-center justify-end rounded-t-lg border border-(--obs-border) ${colors.podium}`}
        style={{ height: podiumHeights[position] }}
      >
        <span className="mb-1 font-bold text-sm">{position}</span>
        <FaTrophy className={medalColors[position].trophy} />
      </div>
    </div>
  );
}

const Leaderboard = () => {
  const { leaderboard, loading } = useLeaderboard();
  const first = leaderboard.find(e => e.rank === 1) ?? null;
  const second = leaderboard.find(e => e.rank === 2) ?? null;
  const third = leaderboard.find(e => e.rank === 3) ?? null;

  return (
    <Page>
      <Section
        title="Points Leaderboard"
        className="flex flex-col items-center gap-8 py-8!"
      >
        <div className="flex flex-col lg:flex-row items-stretch justify-center gap-6 w-full">
          <div className="obs-panel flex min-w-0 flex-1 flex-col items-center p-8">
            {loading ? (
              <div className="flex gap-12 items-end py-12">
                <div className="loading loading-spinner loading-lg text-primary" />
              </div>
            ) : (
              <div className="flex h-[800px] flex-1 items-end justify-center gap-6 sm:gap-12 w-full">
                <PodiumSlot entry={second} position={2} />
                <PodiumSlot entry={first} position={1} />
                <PodiumSlot entry={third} position={3} />
              </div>
            )}
          </div>
          <div className="obs-panel flex min-w-0 flex-1 flex-col overflow-hidden p-8">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="loading loading-spinner loading-lg text-primary" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table text-xl text-(--obs-text-primary)">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th className="text-right">Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map(entry => (
                      <tr key={entry.rank}>
                        <td className="font-bold">{entry.rank}</td>
                        <td>{entry.full_name}</td>
                        <td className="text-right font-semibold text-[#F58134]">{entry.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </Section>
    </Page>
  );
};

export default Leaderboard;
