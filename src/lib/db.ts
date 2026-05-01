import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { OrderRow, TableSessionRow } from "./types";

const DB_NAME = "restaurant-pos-meetup";
const DB_VERSION = 1;

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
}

let dbPromise: Promise<IDBPDatabase<PosDBSchema>> | null = null;

export function getDB(): Promise<IDBPDatabase<PosDBSchema>> {
  if (!dbPromise) {
    dbPromise = openDB<PosDBSchema>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        db.createObjectStore("sessions", { keyPath: "tableId" });
        const orderStore = db.createObjectStore("orders", { keyPath: "id" });
        orderStore.createIndex("by-table", "tableId");
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

export async function resetAllPosData(): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(["sessions", "orders"], "readwrite");
  await tx.objectStore("sessions").clear();
  await tx.objectStore("orders").clear();
  await tx.done;
}
