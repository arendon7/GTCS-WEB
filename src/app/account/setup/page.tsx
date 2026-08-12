import { redirect } from "next/navigation";
import { PasswordSetupForm } from "@/components/password-setup-form";
import { shouldUseSupabase } from "@/lib/data-mode";
import { createClient } from "@/lib/supabase/server";

export default async function AccountSetupPage(){
  if(!shouldUseSupabase())redirect("/");
  const supabase=await createClient();
  const {data:{user},error}=await supabase.auth.getUser();
  if(error||!user)redirect("/login");
  const {data:profile}=await supabase.from("profiles").select("display_name,active").eq("id",user.id).maybeSingle();
  if(profile&&!profile.active)redirect("/login?auth_error=inactive-profile");
  const displayName=profile?.display_name||String(user.user_metadata?.display_name||user.email||"usuario");
  return <main className="main-area min-h-screen"><PasswordSetupForm displayName={displayName}/></main>;
}
