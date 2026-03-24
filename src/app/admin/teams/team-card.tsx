import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import type { Team } from "@/types/team";

export function TeamCard({ team }: { team: Team }) {
  return (
    <Link href={`/admin/teams/${team.id}`}>
      <Card className="pt-0 transition-shadow hover:shadow-md">
        <div className="h-1.5 rounded-t-xl" style={{ backgroundColor: team.color }} />
        <CardContent className="flex items-center gap-4 pt-2">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full"
            style={{ backgroundColor: `${team.color}20` }}
          >
            <Image
              src={team.logo}
              alt={`${team.name} logo`}
              width={40}
              height={40}
              className="object-contain"
            />
          </div>
          <span className="text-base font-semibold">{team.name}</span>
        </CardContent>
      </Card>
    </Link>
  );
}
