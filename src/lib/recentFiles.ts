// Recent-files store backed by IndexedDB so users can re-open artwork they
// recently worked on. Everything stays on-device; nothing is uploaded.

export interface RecentFile {
  id: string;
  name: string;
  type: string;
  ts: number;
  blob: Blob;
  thumb: string; // small data-URL preview (may be empty)
}

const DB_NAME = "emoteforge";
const STORE = "recent";
const MAX_ITEMS = 8;

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const os = db.createObjectStore(STORE, { keyPath: "id" });
        os.createIndex("ts", "ts");
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/** Build a tiny preview data-URL from an image file (best-effort). */
async function makeThumb(file: Blob): Promise<string> {
  try {
    const bmp = await createImageBitmap(file);
    const size = 64;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    const ratio = bmp.width / bmp.height;
    let dw = size;
    let dh = size;
    if (ratio > 1) dh = size / ratio;
    else dw = size * ratio;
    ctx.drawImage(bmp, (size - dw) / 2, (size - dh) / 2, dw, dh);
    bmp.close?.();
    return canvas.toDataURL("image/png");
  } catch {
    return "";
  }
}

export async function saveRecent(file: File): Promise<void> {
  try {
    const thumb = file.type.startsWith("image/") ? await makeThumb(file) : "";
    const db = await openDb();
    const tx = db.transaction(STORE, "readwrite");
    const store = tx.objectStore(STORE);
    const item: RecentFile = {
      id: crypto.randomUUID(),
      name: file.name,
      type: file.type,
      ts: Date.now(),
      blob: file,
      thumb,
    };
    store.put(item);
    // Trim to the newest MAX_ITEMS.
    const all: RecentFile[] = await new Promise((res) => {
      const r = store.getAll();
      r.onsuccess = () => res(r.result as RecentFile[]);
      r.onerror = () => res([]);
    });
    all
      .sort((a, b) => b.ts - a.ts)
      .slice(MAX_ITEMS)
      .forEach((old) => store.delete(old.id));
    db.close();
  } catch {
    /* storage unavailable / private mode */
  }
}

export async function listRecent(): Promise<RecentFile[]> {
  try {
    const db = await openDb();
    const tx = db.transaction(STORE, "readonly");
    const store = tx.objectStore(STORE);
    const all: RecentFile[] = await new Promise((res) => {
      const r = store.getAll();
      r.onsuccess = () => res(r.result as RecentFile[]);
      r.onerror = () => res([]);
    });
    db.close();
    return all.sort((a, b) => b.ts - a.ts);
  } catch {
    return [];
  }
}

export function recentToFile(item: RecentFile): File {
  return new File([item.blob], item.name, { type: item.type });
}

export async function clearRecent(): Promise<void> {
  try {
    const db = await openDb();
    db.transaction(STORE, "readwrite").objectStore(STORE).clear();
    db.close();
  } catch {
    /* ignore */
  }
}
