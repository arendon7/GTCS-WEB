export type EmployeeMaster = {
  id: string;
  plantId: string;
  code?: string;
  name: string;
  active: boolean;
  historical: boolean;
  provisional: boolean;
};

export function canManageEmployeeMaster(role: string) {
  return role === "admin" || role === "director";
}
