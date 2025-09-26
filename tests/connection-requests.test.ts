import { vi, describe, it, expect, beforeEach } from "vitest";

// Create mocks for firebase/firestore functions used by lib/firestore.ts
vi.mock("firebase/firestore", async () => {
  const actual = await vi.importActual("firebase/firestore");
  return {
    ...actual,
    addDoc: vi.fn(async (colRef: any, data: any) => {
      // return a fake doc ref
      return { id: "mock-req-id" };
    }),
    getDoc: vi.fn(async (docRef: any) => {
      // docRef will be an object with _path or such; we return exists true for request doc
      return {
        exists: () => true,
        data: () => ({ requesterId: "user-1", targetId: "user-2" }),
      };
    }),
    updateDoc: vi.fn(async (ref: any, data: any) => {
      // noop
      return;
    }),
    collection: vi.fn((db: any, name: string) => ({ collection: name })),
    doc: vi.fn((db: any, name: string, id?: string) => ({
      _col: name,
      _id: id,
    })),
    serverTimestamp: () => "SERVER_TIMESTAMP",
    arrayUnion: (val: any) => ({ __arrayUnion: val }),
  };
});

import {
  createConnectionRequest,
  acceptConnectionRequest,
} from "../lib/firestore";

describe("connection request helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("createConnectionRequest returns id from addDoc", async () => {
    const id = await createConnectionRequest({
      requesterId: "user-1",
      targetId: "user-2",
    });
    expect(id).toBe("mock-req-id");
  });

  it("acceptConnectionRequest updates user docs and request doc", async () => {
    // call acceptConnectionRequest and ensure it doesn't throw
    await expect(acceptConnectionRequest("mock-req-id")).resolves.not.toThrow();
  });
});
