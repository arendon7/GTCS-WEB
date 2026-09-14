import { describe,expect,it } from "vitest";
import { acceptedMassKg,normalizeVehiclePlate,validateReceptionV2 } from "@/lib/reception-v2";
describe("Reception 2.0 domain",()=>{
 it("derives physical accepted mass from the mass balance",()=>expect(acceptedMassKg(1000,60)).toBe(940));
 it("normalizes a Colombian-style plate without punctuation",()=>expect(normalizeVehiclePlate(" wlx-212 ")).toBe("WLX212"));
 it("rejects inconsistent partial-rejection semantics",()=>expect(validateReceptionV2({received:100,rejected:0,improper:0,acceptance:"partial_rejection"})).toMatch(/requiere/));
 it("allows a fully rejected auditable receipt",()=>expect(validateReceptionV2({received:100,rejected:100,improper:20,acceptance:"rejected"})).toBeNull());
});
