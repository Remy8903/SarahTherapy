import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">TherapySarah</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Interactive Speech Sound Therapy
        </p>
      </div>
      <div className="flex gap-4">
        <Link href="/login" className={buttonVariants()}>
          Sign In
        </Link>
        <Link href="/register" className={buttonVariants({ variant: "outline" })}>
          Create Account
        </Link>
      </div>
    </div>
  );
}