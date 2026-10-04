import type { UnderwritingFormValues } from "@/types/underwriting";

const key = (id: number) => `underwriting-draft:${id}`;

interface StoredDraft {
  basedOn: string | null;
  values: UnderwritingFormValues;
}

function read(id: number): StoredDraft | null {
  try {
    const raw = window.localStorage.getItem(key(id));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredDraft;
    return parsed && typeof parsed === "object" && parsed.values
      ? parsed
      : null;
  } catch {
    return null;
  }
}

export function writeDraftBackup(
  id: number,
  values: UnderwritingFormValues,
  basedOn: string | null,
) {
  try {
    const data: StoredDraft = { basedOn, values };
    window.localStorage.setItem(key(id), JSON.stringify(data));
  } catch {}
}

export function clearDraftBackup(id: number) {
  try {
    window.localStorage.removeItem(key(id));
  } catch {}
}

export function pickInitialValues(
  id: number,
  server: UnderwritingFormValues,
  serverUpdatedAt: string | null,
): UnderwritingFormValues {
  const backup = read(id);
  if (!backup || backup.basedOn !== serverUpdatedAt) return server;
  return { ...server, ...backup.values };
}
