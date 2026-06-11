import Link from "next/link";
import type { Theme } from "@/types/database";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";

export function ThemeCard({ theme }: { theme: Theme }) {
  return (
    <Card className="group relative overflow-hidden">
      {theme.background_url && (
        <div className="aspect-video w-full overflow-hidden">
          <img
            src={theme.background_url}
            alt={theme.title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        </div>
      )}
      <CardHeader>
        <CardTitle className="line-clamp-1">{theme.title}</CardTitle>
        <CardDescription>
          Created {new Date(theme.created_at).toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <Link
            href={`/themes/${theme.id}/session`}
            className={`${buttonVariants({ size: "sm" })} flex-1`}
          >
            Play Session
          </Link>
          <Link
            href={`/themes/${theme.id}/edit`}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Edit
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}