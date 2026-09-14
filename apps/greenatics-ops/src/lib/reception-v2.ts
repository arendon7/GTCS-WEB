import type { AcceptanceStatus } from "@/lib/domain";
export type ReceptionDecision = Exclude<AcceptanceStatus,"unknown">;
export function acceptedMassKg(received:number,rejected:number){return Number.isFinite(received)&&Number.isFinite(rejected)?Math.max(0,received-rejected):0;}
export function normalizeVehiclePlate(value:string){return value.trim().toUpperCase().replace(/[^A-Z0-9]/g,"");}
export function validateReceptionV2(input:{received:number;rejected:number;improper:number;acceptance:ReceptionDecision}){
 const {received,rejected,improper,acceptance}=input;
 if(!Number.isFinite(received)||received<=0)return"La masa recibida debe ser mayor que cero.";
 if(!Number.isFinite(rejected)||rejected<0||rejected>received)return"La masa rechazada debe estar entre 0 y la masa recibida.";
 if(!Number.isFinite(improper)||improper<0||improper>rejected)return"Los impropios deben estar dentro de la masa rechazada.";
 const accepted=acceptedMassKg(received,rejected);
 if(acceptance==="rejected"&&accepted!==0)return"Para rechazo total, la masa rechazada debe ser igual a la recibida.";
 if(acceptance!=="rejected"&&accepted<=0)return"Una recepción aceptada debe dejar masa física mayor que cero.";
 if(acceptance==="accepted"&&rejected>0)return"Si existe rechazo, usa Rechazo parcial o Aceptado condicionado.";
 if(acceptance==="partial_rejection"&&rejected<=0)return"Rechazo parcial requiere registrar una masa rechazada mayor que cero.";
 return null;
}
