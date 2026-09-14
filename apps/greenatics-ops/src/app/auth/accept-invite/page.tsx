"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  completeInviteAcceptance,
  INVITE_FAILURE_PATH,
} from "@/lib/invite-acceptance";

function scrubCurrentUrl() {
  window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
}

export default function AcceptInvitePage() {
  useEffect(() => {
    let active = true;

    void (async () => {
      try {
        const supabase = createClient();
        await completeInviteAcceptance({
          readSession: () => supabase.auth.getSession(),
          scrubUrl: scrubCurrentUrl,
          replaceLocation: (target) => {
            if (active) window.location.replace(target);
          },
        });
      } catch {
        scrubCurrentUrl();
        if (active) window.location.replace(INVITE_FAILURE_PATH);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="mx-auto flex min-h-screen max-w-xl items-center px-6 py-16">
      <section className="w-full rounded-3xl border border-black/10 bg-white p-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/50">GREENATICS OPS</p>
        <h1 className="mt-3 text-2xl font-semibold text-black">Activando tu acceso</h1>
        <p className="mt-3 text-sm leading-6 text-black/65">
          Estamos validando la invitación y preparando tu sesión segura. Al terminar podrás definir tu contraseña.
        </p>
      </section>
    </main>
  );
}
