/// <reference types="node" />

import assert from "node:assert/strict";
import test from "node:test";
import { SocketIOService } from "./websocket-service.ts";

test("stopRecording sends sessionId, doctorId, and provided noteId to backend", () => {
  const service = new SocketIOService("http://localhost:3000");
  const emitted: Array<{ event: string; data: unknown }> = [];

  (service as unknown as { socket: { connected: boolean; emit: (event: string, data: unknown) => void } }).socket = {
    connected: true,
    emit: (event, data) => emitted.push({ event, data }),
  };

  const returnedNoteId = service.stopRecording(
    "session-123",
    "doctor-456",
    "note-789",
  );

  assert.equal(returnedNoteId, "note-789");
  assert.deepEqual(emitted, [
    {
      event: "stop_recording",
      data: {
        sessionId: "session-123",
        noteId: "note-789",
        doctorId: "doctor-456",
      },
    },
  ]);
});
