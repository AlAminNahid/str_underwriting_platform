"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";

import { AUTOSAVE_DELAY_MS } from "@/constants/underwriting";
import { queryKeys } from "@/constants/query-keys";
import { ApiError } from "@/services/api-client";
import { saveUnderwriting } from "@/services/underwriting.service";
import type { SaveUnderwritingPayloadDto } from "@/types/api";

export type SaveStatus = "saved" | "pending" | "saving" | "error";

export function useAutosave({
  id,
  payload,
  serverPayload,
  serverUpdatedAt,
  enabled = true,
}: {
  id: number;
  enabled?: boolean;
  payload: SaveUnderwritingPayloadDto;
  serverPayload: SaveUnderwritingPayloadDto;
  serverUpdatedAt: string | null;
}) {
  const queryClient = useQueryClient();
  const json = JSON.stringify(payload);

  const [savedJson, setSavedJson] = useState(() =>
    JSON.stringify(serverPayload),
  );
  const [savedVersion, setSavedVersion] = useState(serverUpdatedAt);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  const inFlight = useRef(false);
  const queued = useRef<string | null>(null);
  const latestJson = useRef(json);
  useEffect(() => {
    latestJson.current = json;
  });

  const send = useCallback(
    async (body: string) => {
      if (inFlight.current) {
        queued.current = body;
        return;
      }
      inFlight.current = true;
      setSaving(true);
      let current: string | null = body;
      while (current) {
        try {
          const saved = await saveUnderwriting(id, JSON.parse(current));
          queryClient.setQueryData(queryKeys.underwriting(id), saved);
          setSavedJson(current);
          setSavedVersion(saved.updated_at);
          setSavedAt(new Date());
          setError(null);
        } catch (err) {
          setError(
            err instanceof ApiError
              ? err.message
              : "Couldn't save your changes.",
          );
          queued.current = null;
          break;
        }
        const next: string | null = queued.current;
        queued.current = null;
        current = next !== null && next !== current ? next : null;
      }
      inFlight.current = false;
      setSaving(false);
    },
    [id, queryClient],
  );

  const dirty = json !== savedJson;

  useEffect(() => {
    if (!enabled || !dirty || error) return;
    const timer = setTimeout(() => void send(json), AUTOSAVE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [enabled, json, dirty, error, send]);

  useEffect(() => {
    if (!enabled || (!dirty && !saving)) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [enabled, dirty, saving]);

  const retry = useCallback(() => {
    setError(null);
    void send(latestJson.current);
  }, [send]);

  const status: SaveStatus = saving
    ? "saving"
    : error
      ? "error"
      : dirty
        ? "pending"
        : "saved";

  return { status, error, savedAt, savedVersion, retry };
}
