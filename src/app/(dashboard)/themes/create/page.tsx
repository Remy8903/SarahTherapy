import { ThemeForm } from "@/components/creator/theme-form";

export default function CreateThemePage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Create New Theme
        </h1>
        <p className="text-muted-foreground">
          Upload a background and add target words with mystery covers
        </p>
      </div>
      <ThemeForm />
    </div>
  );
}