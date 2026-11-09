"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Field, FormMessage, describedBy, textareaClass } from "@/components/ui/form";
import { callApi } from "@/lib/client-api";

/** POST /v1/me/notices/:id/appeal { statement }. One appeal per decision. */
export function AppealForm({ noticeId, deadline }: { noticeId: string; deadline: string | null }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [statement, setStatement] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const id = `appeal-${noticeId}`;
  const tooShort = statement.trim().length < 10;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (tooShort) return setError("Explain in at least 10 characters why the decision should change.");
    setBusy(true);
    setError(null);
    const res = await callApi("POST", `/v1/me/notices/${encodeURIComponent(noticeId)}/appeal`, { statement: statement.trim() });
    setBusy(false);
    if (!res.ok) return setError(res.message);
    router.refresh();
  }

  if (!open)
    return (
      <div className="flex flex-wrap items-center gap-3">
        <Button size="sm" onClick={() => setOpen(true)}>
          Appeal this decision
        </Button>
        {deadline ? <span className="text-[13px] text-ink-3">Open until {deadline}.</span> : null}
      </div>
    );

  return (
    <form onSubmit={submit} noValidate className="grid grid-cols-1 gap-3 rounded-[10px] border-2 border-line bg-surface p-4">
      <Field
        id={id}
        label="Your appeal"
        hint="Say what you think is wrong with the decision and add any facts the reviewer didn't have (for example a license or written permission). A different reviewer decides. You can appeal once."
        error={error}
      >
        <textarea id={id} value={statement} onChange={(e) => setStatement(e.target.value)} maxLength={10000} required className={textareaClass} {...describedBy(id, true, error)} />
      </Field>
      <p className="tabular text-[12.5px] text-ink-3">{statement.trim().length.toLocaleString("en-GB")} / 10,000</p>
      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={busy}>
          {busy ? "Sending…" : "Send appeal"}
        </Button>
        <Button variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
      {error && !tooShort ? <FormMessage tone="error">{error}</FormMessage> : null}
    </form>
  );
}
