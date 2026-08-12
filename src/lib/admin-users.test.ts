import { describe,expect,it } from "vitest";
import { validateInviteUserInput,validateUpdateUserInput } from "@/lib/admin-users";

const plantId="11111111-1111-4111-8111-111111111111";

describe("admin user contracts",()=>{
  it("normalizes a valid invitation",()=>{
    const result=validateInviteUserInput({email:" Operario@Greenatics.com.co ",displayName:"  Operario   Piloto ",assignments:[{plantId,role:"operator"}]});
    expect(result).toEqual({ok:true,value:{email:"operario@greenatics.com.co",displayName:"Operario Piloto",assignments:[{plantId,role:"operator",active:true}]}});
  });

  it("rejects duplicate plant assignments",()=>{
    const result=validateInviteUserInput({email:"a@greenatics.com.co",displayName:"Usuario",assignments:[{plantId,role:"operator"},{plantId,role:"supervisor"}]});
    expect(result).toEqual({ok:false,error:"Una planta no puede aparecer dos veces."});
  });

  it("rejects invalid role and invalid update user id",()=>{
    expect(validateInviteUserInput({email:"a@greenatics.com.co",displayName:"Usuario",assignments:[{plantId,role:"owner"}]}).ok).toBe(false);
    expect(validateUpdateUserInput({userId:"not-uuid",displayName:"Usuario",assignments:[{plantId,role:"operator"}]}).ok).toBe(false);
  });
});
