import { redirect } from "next/navigation";
import LoginForm from "@/components/admin/LoginForm";
import { isAuthed, authConfigured } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  if (await isAuthed()) redirect(next || "/admin/");

  return (
    <div className="mx-auto mt-10 max-w-sm">
      <div className="mb-8 text-center">
        <h1 className="font-display text-3xl tracking-[0.18em] text-gold">
          The Backoffice
        </h1>
        <div className="rule-ornament mx-auto mt-4 max-w-[10rem]">✦</div>
        <p className="mt-4 text-sm text-parchment-muted">
          Enter to tend the codex.
        </p>
      </div>

      {authConfigured() ? (
        <LoginForm next={next || "/admin/"} />
      ) : (
        <p className="panel p-4 text-sm text-parchment-muted">
          No credentials are configured. Set <code>ADMIN_USERNAME</code> and{" "}
          <code>ADMIN_PASSWORD</code> in your environment to enable editing.
        </p>
      )}
    </div>
  );
}
