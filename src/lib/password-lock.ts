const lockedPasswordEmails = new Set(["juan@ajoiabrasil.com.br"]);

export function passwordChangeLocked(email: string | null | undefined) {
  return lockedPasswordEmails.has((email || "").trim().toLowerCase());
}
