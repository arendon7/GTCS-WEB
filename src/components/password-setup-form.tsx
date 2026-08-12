"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

function validatePassword(password:string,confirmation:string){
  if(password.length<12)return "Usa una contraseña de al menos 12 caracteres.";
  if(!/[A-Za-z]/.test(password)||!/[0-9]/.test(password))return "Incluye al menos una letra y un número.";
  if(password!==confirmation)return "Las contraseñas no coinciden.";
  return undefined;
}

export function PasswordSetupForm({displayName}:{displayName:string}){
  const router=useRouter();
  const [password,setPassword]=useState("");const [confirmation,setConfirmation]=useState("");const [feedback,setFeedback]=useState("");const [busy,setBusy]=useState(false);
  async function save(){if(busy)return;const validation=validatePassword(password,confirmation);if(validation){setFeedback(validation);return;}setBusy(true);setFeedback("");try{const supabase=createClient();const {error}=await supabase.auth.updateUser({password});if(error){setFeedback("No fue posible establecer la contraseña. Solicita una nueva invitación si el enlace expiró.");return;}router.replace("/");router.refresh();}finally{setBusy(false);}}
  return <section className="panel mx-auto max-w-md"><div className="mb-6"><p className="eyebrow">Activación de cuenta</p><h1 className="text-3xl">Hola, {displayName}</h1><p className="lede">Define tu contraseña para completar el acceso a GREENATICS OPS.</p></div><div className="grid gap-4"><label className="grid gap-2 text-xs font-bold text-[var(--muted)]">Nueva contraseña<input className="min-h-11 rounded-lg border border-[var(--line)] px-3 text-base text-[var(--ink)]" type="password" autoComplete="new-password" value={password} onChange={(event)=>setPassword(event.target.value)} disabled={busy}/></label><label className="grid gap-2 text-xs font-bold text-[var(--muted)]">Confirmar contraseña<input className="min-h-11 rounded-lg border border-[var(--line)] px-3 text-base text-[var(--ink)]" type="password" autoComplete="new-password" value={confirmation} onChange={(event)=>setConfirmation(event.target.value)} disabled={busy}/></label></div><p className="mt-3 text-xs text-[var(--muted)]">Mínimo 12 caracteres, con letras y números.</p>{feedback&&<p role="alert" className="mt-4 rounded-lg bg-[var(--red-soft)] p-3 text-sm font-semibold text-[var(--red)]">{feedback}</p>}<div className="mt-6 flex justify-end"><button className="button primary" type="button" onClick={()=>void save()} disabled={busy}>{busy?"Guardando…":"Activar cuenta"}</button></div></section>;
}
