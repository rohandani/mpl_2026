import teams from "@/data/teams.json";
import type { Team } from "@/types/team";
import { TeamCard } from "./team-card";

export default function TeamsPage() {
  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold">Teams</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(teams as Team[]).map((team) => (
          <TeamCard key={team.id} team={team} />
        ))}
      </div>
    </div>
  );
}
