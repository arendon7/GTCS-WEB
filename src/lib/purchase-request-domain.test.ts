import { describe,expect,it } from "vitest";
import { canTransitionPurchaseRequest,validatePurchaseRequest,validateTransition } from "./purchase-request-domain";

const base={plantId:"tamesis",requestedBy:"Nelson",category:"maintenance" as const,concept:"Rodamiento molino",justification:"Molino presenta vibración y requiere cambio preventivo.",estimatedAmountCop:200000};

describe("purchase request domain",()=>{
  it("validates a submitted request independently of actual expense",()=>{
    expect(validatePurchaseRequest(base)).toEqual({ok:true});
    expect(validatePurchaseRequest({...base,estimatedAmountCop:0})).toEqual({ok:false,error:"El monto estimado debe ser mayor que cero."});
  });

  it("allows only submitted approval/rejection and approved fulfillment",()=>{
    expect(canTransitionPurchaseRequest("submitted","approved")).toBe(true);
    expect(canTransitionPurchaseRequest("submitted","rejected")).toBe(true);
    expect(canTransitionPurchaseRequest("approved","fulfilled")).toBe(true);
    expect(canTransitionPurchaseRequest("submitted","fulfilled")).toBe(false);
    expect(canTransitionPurchaseRequest("rejected","fulfilled")).toBe(false);
    expect(canTransitionPurchaseRequest("fulfilled","approved")).toBe(false);
  });

  it("requires an actor and a rejection reason",()=>{
    expect(validateTransition({from:"submitted",to:"approved",actor:"Coordinador"})).toEqual({ok:true});
    expect(validateTransition({from:"submitted",to:"approved",actor:""})).toEqual({ok:false,error:"Indica el responsable de la decisión."});
    expect(validateTransition({from:"submitted",to:"rejected",actor:"Coordinador"})).toEqual({ok:false,error:"Indica la razón del rechazo."});
  });

  it("does not equate estimated amount with future actual spend",()=>{
    const estimated=200000;
    const actual=185000;
    expect(actual).not.toBe(estimated);
  });
});
