"use client";

const QUEUE_KEY = "agrolink-offline-queue";
const OFFLINE_QUEUE_EVENT = "agrolink-offline-queue-changed";

type OfflineAction = {
  id: string;
  type: "create-product";
  payload: Record<string, unknown>;
  createdAt: string;
};

function readQueue(): OfflineAction[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(QUEUE_KEY);
    return raw ? (JSON.parse(raw) as OfflineAction[]) : [];
  } catch {
    return [];
  }
}

function writeQueue(items: OfflineAction[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(QUEUE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(OFFLINE_QUEUE_EVENT));
}

export function enqueueCreateProduct(payload: Record<string, unknown>) {
  const items = readQueue();
  items.push({
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    type: "create-product",
    payload,
    createdAt: new Date().toISOString(),
  });
  writeQueue(items);
}

export function getPendingQueueCount() {
  return readQueue().length;
}

export function listenToOfflineQueueChanges(onChange: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const listener = () => onChange();
  window.addEventListener("storage", listener);
  window.addEventListener(OFFLINE_QUEUE_EVENT, listener);

  return () => {
    window.removeEventListener("storage", listener);
    window.removeEventListener(OFFLINE_QUEUE_EVENT, listener);
  };
}

export async function flushOfflineQueue(createProductFn: (payload: Record<string, unknown>) => Promise<unknown>) {
  const items = readQueue();
  if (!items.length) {
    return { processed: 0, failed: 0 };
  }

  let processed = 0;
  const failed: OfflineAction[] = [];

  for (const item of items) {
    try {
      if (item.type === "create-product") {
        await createProductFn(item.payload);
      }
      processed += 1;
    } catch {
      failed.push(item);
    }
  }

  writeQueue(failed);

  return { processed, failed: failed.length };
}
