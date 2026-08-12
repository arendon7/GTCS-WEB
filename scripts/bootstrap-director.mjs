import { createClient } from "@supabase/supabase-js";

function arg(name){const index=process.argv.indexOf(`--${name}`);return index>=0?process.argv[index+1]:undefined;}
function fail(message){console.error(`BOOTSTRAP_ABORTED: ${message}`);process.exit(1);}

const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
const secret=process.env.SUPABASE_SECRET_KEY;
const baseUrl=(process.env.APP_BASE_URL||"").replace(/\/$/,"");
const email=(arg("email")||"").trim().toLowerCase();
const displayName=(arg("name")||"").trim().replace(/\s+/g," ");
const plantCodes=(arg("plants")||"tamesis,yarumal").split(",").map((value)=>value.trim()).filter(Boolean);

if(!url||!secret)fail("Define NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SECRET_KEY.");
if(!baseUrl)fail("Define APP_BASE_URL para el enlace de invitación.");
if(!email||!email.includes("@"))fail("Usa --email usuario@dominio.");
if(displayName.length<2)fail("Usa --name 'Nombre Apellido'.");
if(!plantCodes.length)fail("Selecciona al menos una planta con --plants.");

const admin=createClient(url,secret,{auth:{autoRefreshToken:false,persistSession:false,detectSessionInUrl:false}});

const {data:directorRows,error:directorError}=await admin.from("plant_memberships").select("user_id").eq("role","director").eq("active",true).limit(1);
if(directorError)fail(`No fue posible verificar directores existentes: ${directorError.message}`);
if(directorRows?.length)fail("Ya existe un director activo. Usa la pantalla Usuarios y accesos; el bootstrap queda cerrado.");

const {data:plants,error:plantError}=await admin.from("plants").select("id,code,name,active").in("code",plantCodes).eq("active",true);
if(plantError)fail(`No fue posible cargar plantas: ${plantError.message}`);
if(!plants||plants.length!==new Set(plantCodes).size){const found=new Set((plants||[]).map((plant)=>plant.code));fail(`No se encontraron todas las plantas solicitadas. Faltan: ${plantCodes.filter((code)=>!found.has(code)).join(", ")}`);}

const {data:userPage,error:listError}=await admin.auth.admin.listUsers({page:1,perPage:1000});
if(listError)fail(`No fue posible buscar usuarios Auth: ${listError.message}`);
let user=userPage.users.find((candidate)=>(candidate.email||"").toLowerCase()===email);
let invited=false;

if(!user){
  const {data,error}=await admin.auth.admin.inviteUserByEmail(email,{data:{display_name:displayName},redirectTo:`${baseUrl}/account/setup`});
  if(error)fail(`No fue posible invitar al primer director: ${error.message}`);
  user=data.user;
  invited=true;
}
if(!user)fail("Supabase no devolvió el usuario objetivo.");

try{
  const {error:profileError}=await admin.from("profiles").upsert({id:user.id,display_name:displayName,active:true},{onConflict:"id"});
  if(profileError)throw profileError;
  const memberships=plants.map((plant)=>({user_id:user.id,plant_id:plant.id,role:"director",active:true}));
  const {error:membershipError}=await admin.from("plant_memberships").upsert(memberships,{onConflict:"user_id,plant_id"});
  if(membershipError)throw membershipError;
}catch(error){
  if(invited)await admin.auth.admin.deleteUser(user.id);
  fail(`No fue posible completar perfil/membresías; ${invited?"la invitación fue revertida":"el usuario existente no fue eliminado"}: ${error instanceof Error?error.message:String(error)}`);
}

console.log(`BOOTSTRAP_OK: ${displayName} (${email}) quedó como director en ${plants.map((plant)=>plant.name).join(" + ")}.`);
console.log("El bootstrap se bloqueará en futuras ejecuciones mientras exista un director activo.");
