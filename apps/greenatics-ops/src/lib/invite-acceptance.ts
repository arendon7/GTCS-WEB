export const INVITE_ACCEPTANCE_PATH = "/auth/accept-invite";
export const INVITE_SETUP_PATH = "/account/setup";
export const INVITE_FAILURE_PATH = "/login?reason=invalid-or-expired-link";

type SessionReadResult = {
  data: { session: unknown | null };
  error: unknown | null;
};

type CompleteInviteAcceptanceOptions = {
  readSession: () => Promise<SessionReadResult>;
  scrubUrl: () => void;
  replaceLocation: (target: string) => void;
};

export async function completeInviteAcceptance({
  readSession,
  scrubUrl,
  replaceLocation,
}: CompleteInviteAcceptanceOptions) {
  let target = INVITE_FAILURE_PATH;

  try {
    const result = await readSession();
    if (!result.error && result.data.session) target = INVITE_SETUP_PATH;
  } catch {
    target = INVITE_FAILURE_PATH;
  }

  scrubUrl();
  replaceLocation(target);
  return target;
}
