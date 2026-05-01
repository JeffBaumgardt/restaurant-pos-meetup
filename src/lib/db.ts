import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { DayReceiptRow, OrderRow, TableSessionRow } from "./types";

const DB_NAME = "restaurant-pos-meetup";
const DB_VERSION = 2;

interface PosDBSchema extends DBSchema {
  sessions: {
    key: string;
    value: TableSessionRow;
  };
  orders: {
    key: string;
    value: OrderRow;
    indexes: { "by-table": string };
  };
  dayReceipts: {
    key: string;
    value: DayReceiptRow;
    indexes: { "by-day": string };
  };
}

let dbPromise: Promise<IDBPDatabase<PosDBSchema>> | null = null;

export function getDB(): Promise<IDBPDatabase<PosDBSchema>> {
  if (!dbPromise) {
    dbPromise = openDB<PosDBSchema>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        if (oldVersion < 1) {
          db.createObjectStore("sessions", { keyPath: "tableId" });
          const orderStore = db.createObjectStore("orders", { keyPath: "id" });
          orderStore.createIndex("by-table", "tableId");
        }
        if (oldVersion < 2) {
          const receiptStore = db.createObjectStore("dayReceipts", {
            keyPath: "id",
          });
          receiptStore.createIndex("by-day", "businessDayKey");
        }
      },
    });
  }
  return dbPromise;
}

export async function loadPosState(): Promise<{
  sessions: TableSessionRow[];
  orders: OrderRow[];
}> {
  const db = await getDB();
  const [sessions, orders] = await Promise.all([
    db.getAll("sessions"),
    db.getAll("orders"),
  ]);
  return { sessions, orders };
}

export async function upsertSession(row: TableSessionRow): Promise<void> {
  const db = await getDB();
  await db.put("sessions", row);
}

export async function deleteSession(tableId: string): Promise<void> {
  const db = await getDB();
  await db.delete("sessions", tableId);
}

export async function putOrder(order: OrderRow): Promise<void> {
  const db = await getDB();
  await db.put("orders", order);
}

export async function deleteOrder(orderId: string): Promise<void> {
  const db = await getDB();
  await db.delete("orders", orderId);
}

export async function deleteOrdersForTable(tableId: string): Promise<void> {
  const db = await getDB();
  const tx = db.transaction("orders", "readwrite");
  const idx = tx.store.index("by-table");
  let cursor = await idx.openCursor(IDBKeyRange.only(tableId));
  while (cursor) {
    await cursor.delete();
    cursor = await cursor.continue();
  }
  await tx.done;
}

export async function appendDayReceipt(row: DayReceiptRow): Promise<void> {
  const db = await getDB();
  await db.put("dayReceipts", row);
}

export async function loadReceiptsForBusinessDay(
  businessDayKey: string,
): Promise<DayReceiptRow[]> {
  const db = await getDB();
  const index = db.transaction("dayReceipts").store.index("by-day");
  return index.getAll(businessDayKey);
}

export async function resetAllPosData(): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(
    ["sessions", "orders", "dayReceipts"],
    "readwrite",
  );
  await tx.objectStore("sessions").clear();
  await tx.objectStore("orders").clear();
  await tx.objectStore("dayReceipts").clear();
  await tx.done;
}
