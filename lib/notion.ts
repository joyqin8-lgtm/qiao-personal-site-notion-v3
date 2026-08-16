const API = "https://api.notion.com/v1";
const VERSION = "2025-09-03";

export type CmsItem = { id: string; title: string; type: string; category: string; summary: string; content: string; published: boolean; sort: number; updatedAt?: string };

function env(name: string) { const value = process.env[name]; if (!value) throw new Error(`${name} is not configured`); return value; }
function rich(value: string) { return value ? [{ type: "text", text: { content: value.slice(0, 2000) } }] : []; }
function plain(value: any[] = []) { return value.map((part) => part?.plain_text ?? "").join(""); }

async function notion(path: string, init: RequestInit = {}) {
  const response = await fetch(`${API}${path}`, { ...init, headers: { Authorization: `Bearer ${env("NOTION_TOKEN")}`, "Notion-Version": VERSION, "Content-Type": "application/json", ...init.headers }, cache: "no-store" });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.message || `Notion API error (${response.status})`);
  return body;
}

export async function dataSourceId() {
  if (process.env.NOTION_DATA_SOURCE_ID) return process.env.NOTION_DATA_SOURCE_ID;
  const database = await notion(`/databases/${env("NOTION_DATABASE_ID")}`);
  const sources = database.data_sources ?? [];
  if (sources.length !== 1) throw new Error(`数据库包含 ${sources.length} 个 data source；请在 Vercel 配置 NOTION_DATA_SOURCE_ID`);
  return sources[0].id as string;
}

export async function ensureSchema() {
  const id = await dataSourceId();
  const source = await notion(`/data_sources/${id}`);
  const existing = source.properties ?? {};
  const desired: Record<string, unknown> = { Name: { title: {} }, Type: { select: { options: [{ name: "项目", color: "blue" }, { name: "笔记", color: "green" }] } }, Category: { select: {} }, Summary: { rich_text: {} }, Content: { rich_text: {} }, Published: { checkbox: {} }, Sort: { number: { format: "number" } } };
  const missing = Object.fromEntries(Object.entries(desired).filter(([name]) => !existing[name]));
  if (Object.keys(missing).length) await notion(`/data_sources/${id}`, { method: "PATCH", body: JSON.stringify({ properties: missing }) });
  return id;
}

function mapPage(page: any): CmsItem {
  const p = page.properties ?? {};
  return { id: page.id, title: plain(p.Name?.title), type: p.Type?.select?.name ?? "笔记", category: p.Category?.select?.name ?? "未分类", summary: plain(p.Summary?.rich_text), content: plain(p.Content?.rich_text), published: Boolean(p.Published?.checkbox), sort: p.Sort?.number ?? 0, updatedAt: page.last_edited_time };
}
function properties(item: Omit<CmsItem, "id">) { return { Name: { title: rich(item.title) }, Type: { select: item.type ? { name: item.type } : null }, Category: { select: item.category ? { name: item.category } : null }, Summary: { rich_text: rich(item.summary) }, Content: { rich_text: rich(item.content) }, Published: { checkbox: item.published }, Sort: { number: Number(item.sort) || 0 } }; }

export async function listItems(includeDrafts: boolean) {
  const id = await dataSourceId();
  let cursor: string | undefined; const items: CmsItem[] = [];
  do { const body: any = { page_size: 100, sorts: [{ property: "Sort", direction: "ascending" }, { timestamp: "last_edited_time", direction: "descending" }] }; if (!includeDrafts) body.filter = { property: "Published", checkbox: { equals: true } }; if (cursor) body.start_cursor = cursor; const result = await notion(`/data_sources/${id}/query`, { method: "POST", body: JSON.stringify(body) }); items.push(...result.results.map(mapPage)); cursor = result.has_more ? result.next_cursor : undefined; } while (cursor);
  return items;
}
export async function createItem(item: Omit<CmsItem, "id">) { const id = await ensureSchema(); return mapPage(await notion("/pages", { method: "POST", body: JSON.stringify({ parent: { type: "data_source_id", data_source_id: id }, properties: properties(item) }) })); }
export async function updateItem(id: string, item: Omit<CmsItem, "id">) { await ensureSchema(); return mapPage(await notion(`/pages/${id}`, { method: "PATCH", body: JSON.stringify({ properties: properties(item) }) })); }
