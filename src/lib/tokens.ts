import { randomBytes } from "crypto";

export function randomToken() {
  return randomBytes(32).toString("base64url");
}

export function temporaryPassword() {
  return `Aj${randomBytes(9).toString("base64url")}9`;
}
