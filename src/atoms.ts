import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

const credentialKey = "vt-admin:google-credential";

export const credentialAtom = atomWithStorage(credentialKey, "");

export const credentialValidAtom = atom((get) => {
  const token = get(credentialAtom);
  if (!token) return false;

  try {
    const parsed = JSON.parse(atob(token.split(".")[1]));
    return typeof parsed.exp === "number" && parsed.exp * 1000 > Date.now();
  } catch {
    return false;
  }
});
