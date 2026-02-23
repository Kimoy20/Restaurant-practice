/**
 * tablePins.js
 * Saves/reads table PINs through Supabase so they work across ALL devices.
 * Falls back to localStorage if Supabase is unavailable.
 *
 * Supabase table needed:
 *   CREATE TABLE table_pins (
 *     table_id TEXT PRIMARY KEY,
 *     pin TEXT NOT NULL
 *   );
 *   ALTER TABLE table_pins ENABLE ROW LEVEL SECURITY;
 *   CREATE POLICY "Allow all" ON table_pins FOR ALL USING (true) WITH CHECK (true);
 */

import { supabase } from './supabase';

const LS_KEY = 'table_passwords';

// ---------- helpers ----------

function lsGet() {
  return JSON.parse(localStorage.getItem(LS_KEY) || '{}');
}

function lsSet(data) {
  localStorage.setItem(LS_KEY, JSON.stringify(data));
}

// ---------- public API ----------

/**
 * Fetch ALL pins: tries Supabase first, falls back to localStorage.
 * Returns an object like { "1": "42", "3": "7" }
 */
export async function fetchAllPins() {
  try {
    const { data, error } = await supabase
      .from('table_pins')
      .select('table_id, pin');

    if (!error && data && data.length >= 0) {
      const map = {};
      data.forEach(row => { map[row.table_id] = row.pin; });
      // Keep localStorage in sync for offline use
      lsSet(map);
      return map;
    }
  } catch (_) { /* fall through */ }

  // Supabase unavailable – use localStorage
  return lsGet();
}

/**
 * Save a PIN for a specific table.
 * Tries Supabase first, always updates localStorage too.
 */
export async function savePin(tableId, pin) {
  // Always save locally immediately
  const local = lsGet();
  local[tableId] = String(pin);
  lsSet(local);

  try {
    const { error } = await supabase
      .from('table_pins')
      .upsert({ table_id: tableId, pin: String(pin) }, { onConflict: 'table_id' });

    if (error) throw error;
    return { ok: true, source: 'supabase' };
  } catch (_) {
    return { ok: true, source: 'localStorage' };
  }
}

/**
 * Remove a PIN for a specific table.
 */
export async function clearPin(tableId) {
  const local = lsGet();
  delete local[tableId];
  lsSet(local);

  try {
    await supabase.from('table_pins').delete().eq('table_id', tableId);
  } catch (_) { /* ignore */ }
}
