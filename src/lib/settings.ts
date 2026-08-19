import { getDB } from './db';
import { DEFAULT_SETTINGS, COMPONENT_TOGGLES, type SettingsMap } from './types';

/** 读取全部设置；首次为空时写入默认值 */
export async function getSettings(forceDefaults = true): Promise<SettingsMap> {
  const db = getDB();
  const res = await db.prepare('SELECT key, value FROM settings').all<{ key: string; value: string }>();
  const map: SettingsMap = {};
  for (const r of res.results ?? []) map[r.key] = r.value;
  if (forceDefaults) {
    let changed = false;
    for (const [k, v] of Object.entries(DEFAULT_SETTINGS)) {
      if (!(k in map)) {
        map[k] = v;
        changed = true;
      }
    }
    if (changed) await setSettingsBatch(map);
  }
  return map;
}

export async function getSetting(key: string, def = ''): string {
  const s = await getSettings();
  return key in s ? s[key] : def;
}

export async function setSetting(key: string, value: string): Promise<void> {
  const db = getDB();
  await db
    .prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value')
    .bind(key, value)
    .run();
}

export async function setSettingsBatch(map: SettingsMap): Promise<void> {
  const db = getDB();
  for (const [k, v] of Object.entries(map)) {
    await db
      .prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value')
      .bind(k, v)
      .run();
  }
}

/** 组件开关：返回 key → boolean */
export async function getToggles(): Promise<Record<string, boolean>> {
  const s = await getSettings();
  const out: Record<string, boolean> = {};
  for (const t of COMPONENT_TOGGLES) out[t.key] = s[t.key] !== '0';
  return out;
}
