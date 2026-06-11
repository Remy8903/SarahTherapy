import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { ThemeCard } from "@/components/dashboard/theme-card";

async function getThemes(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("themes")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return data ?? [];
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const themes = await getThemes(user.id);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Themes</h1>
          <p className="text-muted-foreground">
            Your speech therapy game boards
          </p>
        </div>
        <Link href="/themes/create" className={buttonVariants()}>
          Create New Theme
        </Link>
      </div>

      {themes.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12">
          <h2 className="text-xl font-semibold">No themes yet</h2>
          <p className="mt-2 text-muted-foreground">
            Create your first interactive therapy board
          </p>
          <Link href="/themes/create" className={`${buttonVariants()} mt-4`}>
            Get Started
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {themes.map((theme) => (
            <ThemeCard key={theme.id} theme={theme} />
          ))}
        </div>
      )}
    </div>
  );
}