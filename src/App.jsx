import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Crown, Shield, Lock, Sparkles, Plus, Trash2, X, Check, Settings, Users, RefreshCw, LogOut, ScrollText, Copy, Zap, Droplet, Map, Package } from 'lucide-react';
import { supabase } from './supabaseClient';

/* ============================================================
   CONSTANTS
   ============================================================ */

const TREE_COLORS = {
  gold:    { name: 'Gold',    hex: '#d4a843', rgb: '212,168,67' },
  crimson: { name: 'Crimson', hex: '#c4453c', rgb: '196,69,60' },
  azure:   { name: 'Azure',   hex: '#3d8fc4', rgb: '61,143,196' },
  violet:  { name: 'Violet',  hex: '#8b5fbf', rgb: '139,95,191' },
  emerald: { name: 'Emerald', hex: '#4f9d6e', rgb: '79,157,110' },
  silver:  { name: 'Silver',  hex: '#9aa5b8', rgb: '154,165,184' },
};

const ICONS = ['⚔️','🔥','❄️','🌿','🛡️','✨','💀','🌙','☀️','🩸','🕸️','👁️','⚡','🌊','🪨','🦴'];

function uid(prefix) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 32);
}

function campaignSlug(name) {
  const base = slugify(name) || 'campaign';
  return `${base}-${Math.random().toString(36).slice(2, 6)}`;
}

/* ============================================================
   STYLES
   ============================================================ */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');

.rf-root {
  --bg: #14171f;
  --surface: #1c212d;
  --surface-2: #262c3a;
  --border: #383f52;
  --text: #e9e3d6;
  --text-muted: #8b8fa3;
  --gold: #4f9d6e;
  --danger: #c4453c;
  --radius: 14px;
  font-family: 'Inter', -apple-system, sans-serif;
  color: var(--text);
  background:
    radial-gradient(ellipse 900px 500px at 15% -10%, rgba(212,168,67,0.07), transparent 60%),
    radial-gradient(ellipse 700px 500px at 100% 10%, rgba(139,95,191,0.06), transparent 60%),
    var(--bg);
  min-height: 100vh;
  line-height: 1.4;
}
.rf-root * { box-sizing: border-box; }
.rf-root button { font-family: inherit; cursor: pointer; }
.rf-root input, .rf-root textarea, .rf-root select { font-family: inherit; }

.rf-center { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; }
.rf-loading { font-family: 'Cinzel', serif; color: var(--text-muted); letter-spacing: .05em; }

.rf-login-card { width: 100%; max-width: 460px; background: var(--surface); border: 1px solid var(--border); border-radius: 18px; padding: 36px 32px; box-shadow: 0 20px 60px rgba(0,0,0,0.4); }
.rf-login-title { font-family: 'Cinzel', serif; font-weight: 700; font-size: 26px; text-align: center; margin-bottom: 6px; }
.rf-login-sub { text-align: center; color: var(--text-muted); font-size: 13.5px; margin-bottom: 28px; }
.rf-login-choices { display: flex; flex-direction: column; gap: 12px; }
.rf-choice-card { display: flex; flex-direction: column; align-items: center; gap: 8px; text-align: center; background: var(--surface-2); border: 1px solid var(--border); border-radius: var(--radius); padding: 22px 18px; color: var(--text); transition: all .15s ease; }
.rf-choice-card:hover { border-color: var(--gold); box-shadow: 0 0 0 1px var(--gold), 0 8px 24px rgba(212,168,67,0.12); transform: translateY(-1px); }
.rf-choice-title { font-family: 'Cinzel', serif; font-size: 15px; font-weight: 600; }
.rf-choice-sub { font-size: 12.5px; color: var(--text-muted); line-height: 1.45; }

.rf-passcode-form, .rf-setup-form, .rf-join-form { display: flex; flex-direction: column; gap: 4px; margin-top: 8px; }
.rf-passcode-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 14px; }

.rf-label { font-size: 11.5px; text-transform: uppercase; letter-spacing: .07em; color: var(--text-muted); margin: 14px 0 6px; font-weight: 600; }
.rf-label:first-child { margin-top: 0; }
.rf-input, .rf-textarea {
  width: 100%; background: var(--bg); border: 1px solid var(--border); border-radius: 9px;
  padding: 10px 12px; color: var(--text); font-size: 14px; outline: none; transition: border-color .15s;
}
.rf-input:focus, .rf-textarea:focus { border-color: var(--gold); }
.rf-input-sm { font-size: 13px; padding: 8px 10px; margin-bottom: 6px; }
.rf-textarea { resize: vertical; }
.rf-textarea-sm { font-size: 12.5px; padding: 7px 10px; }
.rf-error { color: var(--danger); font-size: 12.5px; margin-top: 8px; }
.rf-hint { font-size: 12.5px; color: var(--text-muted); margin-top: 6px; line-height: 1.5; }

.rf-btn-primary, .rf-btn-ghost, .rf-btn-danger {
  display: inline-flex; align-items: center; gap: 6px; justify-content: center;
  border-radius: 9px; padding: 10px 16px; font-size: 13.5px; font-weight: 600; border: 1px solid transparent; transition: all .15s;
}
.rf-btn-primary { background: var(--gold); color: #1a1308; border-color: var(--gold); }
.rf-btn-primary:hover { filter: brightness(1.08); }
.rf-btn-primary:disabled { opacity: .5; cursor: not-allowed; }
.rf-btn-ghost { background: transparent; color: var(--text-muted); border-color: var(--border); }
.rf-btn-ghost:hover { color: var(--text); border-color: var(--text-muted); }
.rf-btn-danger { background: transparent; color: var(--danger); border-color: var(--danger); }
.rf-btn-danger:hover { background: rgba(196,69,60,0.12); }
.rf-btn-ghost-sm { display: inline-flex; align-items: center; gap: 5px; background: transparent; border: 1px solid var(--border); color: var(--text-muted); border-radius: 7px; padding: 6px 10px; font-size: 12px; font-weight: 600; }
.rf-btn-ghost-sm:hover { color: var(--text); border-color: var(--text-muted); }
.rf-btn-ghost-sm:disabled { opacity: .4; cursor: not-allowed; }

.rf-icon-btn { background: transparent; border: 1px solid var(--border); color: var(--text-muted); width: 34px; height: 34px; border-radius: 9px; display: flex; align-items: center; justify-content: center; }
.rf-icon-btn:hover { color: var(--text); border-color: var(--text-muted); }
.rf-icon-btn-danger { background: transparent; border: 1px solid var(--border); color: var(--text-muted); height: 30px; border-radius: 7px; display: flex; align-items: center; justify-content: center; font-size: 10.5px; white-space: nowrap; padding: 0 8px; }
.rf-icon-btn-danger:hover { color: var(--danger); border-color: var(--danger); }
.rf-icon-btn-danger--armed { color: var(--danger); border-color: var(--danger); background: rgba(196,69,60,0.12); }

.rf-page { max-width: 920px; margin: 0 auto; padding: 22px 20px 60px; }
.rf-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; padding-bottom: 16px; border-bottom: 1px solid var(--border); flex-wrap: wrap; gap: 10px; }
.rf-header-title { font-family: 'Cinzel', serif; font-weight: 700; font-size: 21px; }
.rf-header-sub { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--text-muted); margin-top: 3px; text-transform: uppercase; letter-spacing: .06em; }
.rf-header-actions { display: flex; align-items: center; gap: 8px; }

.rf-live-dot { display: inline-flex; align-items: center; gap: 5px; font-size: 11px; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
.rf-live-dot::before { content: ''; width: 7px; height: 7px; border-radius: 50%; background: #4f9d6e; box-shadow: 0 0 6px #4f9d6e; }
.rf-live-dot--off::before { background: var(--text-muted); box-shadow: none; }

.rf-tabs { display: flex; gap: 6px; margin-bottom: 22px; border-bottom: 1px solid var(--border); overflow-x: auto; }
.rf-tab { display: flex; align-items: center; gap: 6px; background: transparent; border: none; color: var(--text-muted); padding: 10px 14px; font-size: 13.5px; font-weight: 600; border-bottom: 2px solid transparent; margin-bottom: -1px; white-space: nowrap; }
.rf-tab--active { color: var(--gold); border-bottom-color: var(--gold); }

.rf-section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.rf-section-title { font-family: 'Cinzel', serif; font-size: 18px; font-weight: 600; margin: 0; }

.rf-empty-state { background: var(--surface); border: 1px dashed var(--border); border-radius: var(--radius); padding: 28px 20px; text-align: center; color: var(--text-muted); font-size: 13.5px; }
.rf-empty-mini { color: var(--text-muted); font-size: 12.5px; padding: 6px 2px; }

.rf-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); gap: 14px; margin-bottom: 8px; }
.rf-tree-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 18px 14px; text-align: center; transition: all .15s; }
.rf-tree-card:hover { border-color: var(--tc); box-shadow: 0 0 0 1px var(--tc), 0 10px 24px rgba(0,0,0,0.35); transform: translateY(-2px); }
.rf-tree-card-icon { font-size: 30px; margin-bottom: 8px; }
.rf-tree-card-name { font-family: 'Cinzel', serif; font-weight: 600; font-size: 14.5px; margin-bottom: 4px; }
.rf-tree-card-meta { font-size: 11.5px; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; }

.rf-add-player-row { display: flex; gap: 10px; margin-bottom: 18px; }
.rf-add-player-row .rf-input { flex: 1; }
.rf-player-list { display: flex; flex-direction: column; gap: 10px; }
.rf-player-row { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 14px 16px; }
.rf-player-row-name { font-family: 'Cinzel', serif; font-weight: 600; font-size: 14.5px; min-width: 120px; }
.rf-player-row-meta { font-size: 12px; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; flex: 1; }
.rf-player-row-actions { display: flex; gap: 8px; }

.rf-modal-overlay { position: fixed; inset: 0; background: rgba(8,9,13,0.7); backdrop-filter: blur(3px); display: flex; align-items: flex-start; justify-content: center; padding: 5vh 16px; z-index: 50; overflow-y: auto; }
.rf-modal { width: 100%; max-width: 560px; background: var(--surface); border: 1px solid var(--border); border-radius: 16px; box-shadow: 0 30px 80px rgba(0,0,0,0.5); margin-bottom: 5vh; }
.rf-modal-wide { max-width: 680px; }
.rf-modal-header { display: flex; align-items: center; justify-content: space-between; padding: 18px 22px; border-bottom: 1px solid var(--border); }
.rf-modal-header h3 { font-family: 'Cinzel', serif; font-size: 17px; margin: 0; font-weight: 600; }
.rf-modal-body { padding: 18px 22px; max-height: 64vh; overflow-y: auto; }
.rf-modal-footer { display: flex; align-items: center; gap: 10px; padding: 16px 22px; border-top: 1px solid var(--border); }
.rf-modal-hint { font-size: 12.5px; color: var(--text-muted); margin: 0 0 16px; line-height: 1.5; }

.rf-icon-pick-row, .rf-color-row { display: flex; flex-wrap: wrap; gap: 8px; }
.rf-icon-pick { width: 36px; height: 36px; border-radius: 9px; background: var(--surface-2); border: 1px solid var(--border); font-size: 17px; display: flex; align-items: center; justify-content: center; }
.rf-icon-pick--active { border-color: var(--gold); box-shadow: 0 0 0 1px var(--gold); }
.rf-color-swatch { width: 30px; height: 30px; border-radius: 50%; border: 2px solid var(--border); background: var(--sw); }
.rf-color-swatch--active { border-color: var(--text); box-shadow: 0 0 0 2px var(--bg), 0 0 0 4px var(--sw); }

.rf-tier-editor-header { display: flex; align-items: center; justify-content: space-between; margin-top: 20px; margin-bottom: 10px; padding-top: 14px; border-top: 1px solid var(--border); }
.rf-tier-edit-block { background: var(--surface-2); border: 1px solid var(--border); border-radius: 11px; padding: 12px 14px; margin-bottom: 12px; }
.rf-tier-edit-label { display: flex; align-items: center; justify-content: space-between; font-family: 'JetBrains Mono', monospace; font-size: 11.5px; text-transform: uppercase; letter-spacing: .07em; color: var(--text-muted); margin-bottom: 10px; }
.rf-rune-edit-row { display: grid; grid-template-columns: 1fr 1fr auto; grid-template-areas: "name effect del" "desc desc desc"; gap: 6px 8px; align-items: start; margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid var(--border); }
.rf-rune-edit-row:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
.rf-rune-edit-row input:nth-child(1) { grid-area: name; }
.rf-rune-edit-row input:nth-child(2) { grid-area: effect; }
.rf-rune-edit-row textarea { grid-area: desc; }
.rf-rune-edit-row button { grid-area: del; align-self: start; }

.rf-tree { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 20px 22px; margin-bottom: 18px; }
.rf-tree-header { display: flex; align-items: center; gap: 12px; margin-bottom: 18px; padding-bottom: 14px; border-bottom: 1px solid var(--border); }
.rf-tree-icon { font-size: 26px; }
.rf-tree-name { font-family: 'Cinzel', serif; font-weight: 700; font-size: 16.5px; color: var(--tc); }
.rf-tree-desc { font-size: 12px; color: var(--text-muted); margin-top: 2px; }

.rf-tree-tiers { position: relative; padding-left: 24px; }
.rf-tree-tiers::before { content: ''; position: absolute; left: 7px; top: 8px; bottom: 8px; width: 2px; background: linear-gradient(to bottom, transparent, rgba(var(--tc-rgb),0.5) 12%, rgba(var(--tc-rgb),0.5) 88%, transparent); }
.rf-tier-row { position: relative; margin-bottom: 22px; }
.rf-tier-row:last-child { margin-bottom: 0; }
.rf-tier-row::before { content: ''; position: absolute; left: -24px; top: 24px; width: 9px; height: 9px; border-radius: 50%; background: var(--tc); box-shadow: 0 0 8px rgba(var(--tc-rgb),0.8); }
.rf-tier-label { font-family: 'JetBrains Mono', monospace; font-size: 10.5px; text-transform: uppercase; letter-spacing: .1em; color: var(--text-muted); margin-bottom: 10px; }
.rf-tier-nodes { display: flex; flex-wrap: wrap; gap: 16px; }

.rf-node-wrap { display: flex; flex-direction: column; align-items: center; gap: 7px; width: 86px; text-align: center; }
.rf-node { width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; position: relative; background: var(--surface-2); border: 2px solid var(--border); font-size: 22px; transition: all .18s ease; }
.rf-node-name { font-size: 11px; color: var(--text-muted); line-height: 1.25; }
.rf-node--locked, .rf-node--ungranted { opacity: .42; filter: grayscale(0.7); }
.rf-node--unlocked, .rf-node--granted { border-color: var(--tc); background: rgba(var(--tc-rgb), 0.1); box-shadow: 0 0 14px rgba(var(--tc-rgb), 0.35); }
.rf-node--equipped { border-color: var(--tc); border-width: 3px; background: rgba(var(--tc-rgb), 0.18); animation: rf-pulse 2.6s ease-in-out infinite; }
.rf-node--selected { outline: 2px solid var(--text); outline-offset: 3px; }
@keyframes rf-pulse {
  0%, 100% { box-shadow: 0 0 0 3px rgba(var(--tc-rgb),0.22), 0 0 14px rgba(var(--tc-rgb),0.5); }
  50% { box-shadow: 0 0 0 5px rgba(var(--tc-rgb),0.3), 0 0 24px rgba(var(--tc-rgb),0.75); }
}
.rf-lock-badge, .rf-equip-badge { position: absolute; bottom: -3px; right: -3px; width: 19px; height: 19px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 1px solid var(--border); background: var(--surface); color: var(--text-muted); }
.rf-equip-badge { background: var(--tc); color: #11141c; border-color: var(--tc); }

.rf-detail { background: var(--surface); border: 1px solid var(--border); border-left: 4px solid var(--tc); border-radius: 12px; padding: 16px 20px; margin-top: 4px; margin-bottom: 18px; }
.rf-detail-title { font-family: 'Cinzel', serif; font-size: 16.5px; font-weight: 600; }
.rf-detail-tier { font-family: 'JetBrains Mono', monospace; font-size: 10.5px; text-transform: uppercase; letter-spacing: .08em; color: var(--text-muted); margin: 3px 0 10px; }
.rf-detail-effect { font-family: 'JetBrains Mono', monospace; font-size: 12.5px; color: var(--tc); background: rgba(var(--tc-rgb),0.12); padding: 8px 11px; border-radius: 8px; margin-bottom: 10px; display: inline-block; }
.rf-detail-desc { font-size: 13.5px; color: var(--text-muted); line-height: 1.55; }
.rf-detail-desc--muted { font-style: italic; opacity: .7; }

.rf-loadout { background: linear-gradient(135deg, var(--surface), var(--surface-2)); border: 1px solid var(--border); border-radius: var(--radius); padding: 18px 20px; margin-bottom: 22px; }
.rf-loadout-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 12px; }
.rf-loadout-title { font-family: 'Cinzel', serif; font-size: 15.5px; font-weight: 600; letter-spacing: .02em; }
.rf-loadout-count { font-family: 'JetBrains Mono', monospace; font-size: 11.5px; color: var(--text-muted); }
.rf-loadout-list { display: flex; flex-direction: column; gap: 8px; }
.rf-loadout-item { display: flex; align-items: center; gap: 11px; padding: 9px 12px; border-radius: 9px; background: var(--bg); border-left: 3px solid var(--tc); }
.rf-loadout-item-name { font-size: 13.5px; font-weight: 600; }
.rf-loadout-item-effect { font-size: 11.5px; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; margin-top: 1px; }

.rf-picker-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px,1fr)); gap: 12px; }
.rf-picker-card { display: flex; flex-direction: column; align-items: center; gap: 8px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 20px 14px; color: var(--text); font-family: 'Cinzel', serif; font-weight: 600; font-size: 14px; transition: all .15s; }
.rf-picker-card:hover { border-color: var(--gold); box-shadow: 0 0 0 1px var(--gold); transform: translateY(-2px); }

.rf-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 18px 20px; }
.rf-settings-card { max-width: 480px; }
.rf-settings-danger { border-color: rgba(196,69,60,0.4); }

.rf-share-row { display: flex; gap: 8px; margin-top: 10px; }
.rf-share-row .rf-input { flex: 1; font-family: 'JetBrains Mono', monospace; font-size: 12.5px; }

.rf-lobby-list { display: flex; flex-direction: column; gap: 8px; max-height: 320px; overflow-y: auto; }
.rf-lobby-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; width: 100%; text-align: left; background: var(--surface-2); border: 1px solid var(--border); border-radius: 11px; padding: 12px 14px; color: var(--text); transition: all .15s; }
.rf-lobby-row:hover { border-color: var(--gold); box-shadow: 0 0 0 1px var(--gold); }
.rf-lobby-row-name { font-family: 'Cinzel', serif; font-weight: 600; font-size: 14px; }
.rf-lobby-row-id { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: var(--text-muted); margin-top: 2px; }
.rf-lobby-row-count { display: flex; align-items: center; gap: 5px; font-size: 12px; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; white-space: nowrap; }

.rf-toast { position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%); background: var(--surface-2); border: 1px solid var(--gold); color: var(--text); padding: 11px 18px; border-radius: 10px; font-size: 13px; box-shadow: 0 10px 30px rgba(0,0,0,0.4); z-index: 100; max-width: 90vw; text-align: center; }


/* ===== MANA SYSTEM ===== */
.rf-mana-section {
  background: linear-gradient(135deg, rgba(139,127,245,0.07), rgba(139,95,191,0.05));
  border: 1px solid rgba(139,127,245,0.28);
  border-radius: var(--radius);
  padding: 16px 20px;
  margin-bottom: 18px;
}
.rf-mana-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
.rf-mana-title { display: flex; align-items: center; gap: 7px; font-family: 'Cinzel', serif; font-size: 13.5px; font-weight: 600; color: #8b7ff5; }
.rf-mana-count { font-family: 'JetBrains Mono', monospace; font-size: 14px; font-weight: 700; color: #8b7ff5; }
.rf-mana-track { height: 8px; border-radius: 4px; background: var(--surface-2); overflow: hidden; margin-bottom: 12px; }
.rf-mana-fill { height: 100%; border-radius: 4px; background: linear-gradient(90deg, #8b7ff5, #a594f9); transition: width .4s ease; }
.rf-mana-actions { display: flex; align-items: center; gap: 8px; }
.rf-mana-adj { width: 32px; height: 32px; border-radius: 8px; border: 1px solid rgba(139,127,245,0.35); background: transparent; color: #8b7ff5; font-size: 18px; font-weight: 700; display: flex; align-items: center; justify-content: center; line-height: 1; }
.rf-mana-adj:hover:not(:disabled) { background: rgba(139,127,245,0.12); border-color: #8b7ff5; }
.rf-mana-adj:disabled { opacity: .3; cursor: not-allowed; }
.rf-mana-restore { display: flex; align-items: center; gap: 5px; border: 1px solid rgba(139,127,245,0.35); color: #8b7ff5; background: transparent; border-radius: 8px; padding: 6px 12px; font-size: 12px; font-weight: 600; margin-left: auto; }
.rf-mana-restore:hover:not(:disabled) { background: rgba(139,127,245,0.12); border-color: #8b7ff5; }
.rf-mana-restore:disabled { opacity: .3; cursor: not-allowed; }
.rf-mana-pill { display: inline-flex; align-items: center; gap: 4px; color: #8b7ff5; background: rgba(139,127,245,0.12); border: 1px solid rgba(139,127,245,0.25); border-radius: 6px; padding: 2px 7px; font-size: 11px; }

/* ===== ABILITIES (player view) ===== */
.rf-abilities-wrap { margin-bottom: 22px; }
.rf-ability-set-block { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 18px 20px; margin-bottom: 14px; }
.rf-ability-set-head { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; padding-bottom: 12px; border-bottom: 1px solid var(--border); }
.rf-ability-set-dot { width: 9px; height: 9px; border-radius: 50%; flex-shrink: 0; }
.rf-ability-set-label { font-family: 'Cinzel', serif; font-size: 15px; font-weight: 600; }
.rf-ability-set-desc { font-size: 12px; color: var(--text-muted); margin-top: 2px; }
.rf-ability-items { display: flex; flex-direction: column; gap: 10px; }
.rf-ability-item { display: flex; align-items: flex-start; gap: 14px; padding: 13px 15px; border-radius: 11px; border: 1px solid rgba(139,127,245,0.22); background: rgba(139,127,245,0.05); border-left: 3px solid #8b7ff5; }
.rf-ability-item-body { flex: 1; min-width: 0; }
.rf-ability-item-name { font-size: 14px; font-weight: 600; margin-bottom: 3px; }
.rf-ability-item-effect { font-family: 'JetBrains Mono', monospace; font-size: 11.5px; color: #8b7ff5; margin-bottom: 5px; }
.rf-ability-item-desc { font-size: 12.5px; color: var(--text-muted); line-height: 1.45; }
.rf-ability-side { display: flex; flex-direction: column; align-items: flex-end; gap: 8px; flex-shrink: 0; }
.rf-ability-cost { display: flex; align-items: center; gap: 4px; font-family: 'JetBrains Mono', monospace; font-size: 13px; font-weight: 700; color: #8b7ff5; }
.rf-ability-use { display: flex; align-items: center; gap: 5px; border: 1px solid rgba(139,127,245,0.4); color: #8b7ff5; background: transparent; border-radius: 7px; padding: 7px 11px; font-size: 12px; font-weight: 600; white-space: nowrap; }
.rf-ability-use:hover:not(:disabled) { background: rgba(139,127,245,0.12); border-color: #8b7ff5; }
.rf-ability-use:disabled { opacity: .3; cursor: not-allowed; }

/* ===== ABILITY SETS (DM view) ===== */
.rf-abset-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(170px,1fr)); gap: 14px; }
.rf-abset-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 18px 14px; text-align: center; transition: all .15s; cursor: pointer; }
.rf-abset-card:hover { border-color: #8b7ff5; box-shadow: 0 0 0 1px #8b7ff5, 0 10px 24px rgba(139,127,245,0.15); transform: translateY(-2px); }
.rf-abset-card-icon { font-size: 30px; margin-bottom: 8px; }
.rf-abset-card-name { font-family: 'Cinzel', serif; font-weight: 600; font-size: 14.5px; margin-bottom: 4px; }
.rf-abset-card-meta { font-size: 11.5px; color: #8b7ff5; font-family: 'JetBrains Mono', monospace; }

/* Ability editor */
.rf-ab-block { background: var(--surface-2); border: 1px solid var(--border); border-radius: 11px; padding: 12px 14px; margin-bottom: 10px; }
.rf-ab-row1 { display: grid; grid-template-columns: 1fr 80px auto; gap: 8px; align-items: center; margin-bottom: 8px; }
.rf-ab-row2 { margin-bottom: 6px; }
.rf-mana-input { text-align: center; }

/* Grant ability modal */
.rf-grant-ab-row { display: flex; align-items: flex-start; gap: 10px; padding: 10px 12px; border-radius: 9px; border: 1px solid var(--border); margin-bottom: 7px; cursor: pointer; transition: all .15s; }
.rf-grant-ab-row:hover { border-color: rgba(139,127,245,0.5); background: rgba(139,127,245,0.08); }
.rf-grant-ab-row--granted { border-color: #8b7ff5; background: rgba(139,127,245,0.1); }
.rf-grant-ab-check { width: 22px; height: 22px; border-radius: 6px; border: 2px solid var(--border); display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 2px; transition: all .15s; }
.rf-grant-ab-check--on { background: #8b7ff5; border-color: #8b7ff5; color: #fff; }
.rf-grant-ab-name { font-size: 13.5px; font-weight: 600; margin-bottom: 2px; }
.rf-grant-ab-sub { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #8b7ff5; }
.rf-mana-setter { display: flex; align-items: center; gap: 12px; background: rgba(139,127,245,0.08); border: 1px solid rgba(139,127,245,0.25); border-radius: 11px; padding: 12px 16px; margin-bottom: 18px; flex-wrap: wrap; }
.rf-mana-setter-label { display: flex; align-items: center; gap: 7px; font-size: 13px; font-weight: 600; color: #8b7ff5; flex: 1; }

.rf-btn-mana { display: inline-flex; align-items: center; gap: 5px; background: transparent; border: 1px solid rgba(139,127,245,0.4); color: #8b7ff5; border-radius: 7px; padding: 6px 10px; font-size: 12px; font-weight: 600; }
.rf-btn-mana:hover { background: rgba(139,127,245,0.12); border-color: #8b7ff5; }


/* ===== VTT ===== */
.rf-vtt-empty { border: 2px dashed var(--border); border-radius: 12px; padding: 60px 20px; text-align: center; color: var(--text-muted); }
.rf-vtt-map-wrap { position: relative; width: 100%; user-select: none; border-radius: 12px; overflow: hidden; background: #0a0c12; }
.rf-vtt-map-img { width: 100%; height: auto; display: block; pointer-events: none; }
.rf-vtt-token { position: absolute; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2.5px solid rgba(255,255,255,0.85); box-shadow: 0 2px 12px rgba(0,0,0,0.65); transform: translate(-50%,-50%); z-index: 5; transition: box-shadow .15s; }
.rf-vtt-token-label { position: absolute; top: calc(100% + 4px); left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.82); color:#fff; font-size:10px; font-weight:600; white-space:nowrap; padding:2px 5px; border-radius:4px; pointer-events:none; z-index:6; }
.rf-token-list { display: flex; flex-direction: column; gap: 8px; margin-top: 14px; }
.rf-token-row { display: flex; align-items: center; gap: 10px; background: var(--surface-2); border: 1px solid var(--border); border-radius: 9px; padding: 9px 12px; }
.rf-token-swatch { width: 30px; height: 30px; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 15px; }
/* ===== INVENTORY ===== */
.rf-item-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(210px,1fr)); gap: 12px; }
.rf-item-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 14px 16px; cursor: pointer; transition: all .15s; }
.rf-item-card:hover { border-color: var(--gold); transform: translateY(-1px); box-shadow: 0 6px 18px rgba(0,0,0,0.3); }
.rf-item-cat { font-size: 10.5px; text-transform: uppercase; letter-spacing: .07em; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; margin-bottom: 3px; }
.rf-item-name { font-weight: 600; font-size: 14px; margin-bottom: 5px; }
.rf-item-desc-sm { font-size: 12px; color: var(--text-muted); margin-bottom: 6px; line-height: 1.4; }
.rf-item-stats { display: flex; gap: 10px; flex-wrap: wrap; }
.rf-item-stat { font-family: 'JetBrains Mono', monospace; font-size: 11.5px; color: var(--text-muted); }
.rf-item-stat b { color: var(--gold); font-weight: 700; }
.rf-inv-section { background: linear-gradient(135deg, var(--surface), var(--surface-2)); border: 1px solid var(--border); border-radius: var(--radius); padding: 18px 20px; margin-bottom: 18px; }
.rf-inv-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
.rf-inv-title { font-family: 'Cinzel', serif; font-size: 15.5px; font-weight: 600; display: flex; align-items: center; gap: 8px; }
.rf-inv-totals { display: flex; gap: 14px; }
.rf-inv-total { font-family: 'JetBrains Mono', monospace; font-size: 11.5px; color: var(--gold); }
.rf-inv-list { display: flex; flex-direction: column; gap: 8px; }
.rf-inv-item { display: flex; align-items: center; gap: 12px; padding: 9px 12px; background: var(--bg); border-radius: 9px; border-left: 3px solid var(--gold); }
.rf-inv-item-icon { font-size: 18px; flex-shrink: 0; }
.rf-inv-item-body { flex: 1; min-width: 0; }
.rf-inv-item-name { font-size: 13.5px; font-weight: 600; }
.rf-inv-item-desc { font-size: 11.5px; color: var(--text-muted); margin-top: 1px; }
.rf-inv-item-meta { display: flex; gap: 10px; margin-top: 2px; }
.rf-inv-item-meta span { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: var(--text-muted); }
.rf-inv-item-qty { font-family: 'JetBrains Mono', monospace; font-size: 14px; font-weight: 700; color: var(--gold); white-space: nowrap; }
.rf-inv-manage-list { display: flex; flex-direction: column; gap: 8px; max-height: 380px; overflow-y: auto; }
.rf-inv-manage-row { display: flex; align-items: center; gap: 10px; padding: 9px 12px; background: var(--surface-2); border: 1px solid var(--border); border-radius: 9px; }
.rf-qty-ctrl { display: flex; align-items: center; gap: 7px; flex-shrink: 0; }
.rf-qty-btn { width: 28px; height: 28px; border-radius: 7px; border: 1px solid var(--border); background: transparent; color: var(--text-muted); font-size: 16px; font-weight: 700; display: flex; align-items: center; justify-content: center; line-height:1; }
.rf-qty-btn:hover { border-color: var(--gold); color: var(--gold); }
.rf-qty-val { font-family: 'JetBrains Mono', monospace; font-size: 14px; font-weight: 700; color: var(--gold); min-width: 28px; text-align: center; }
.rf-qty-val--zero { color: var(--text-muted); }


/* ===== NOTEPAD ===== */
.rf-notepad { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 18px 20px; margin-bottom: 18px; }
.rf-notepad-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.rf-notepad-title { font-family: 'Cinzel', serif; font-size: 15.5px; font-weight: 600; }
.rf-notepad-saved { font-size: 11.5px; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; transition: opacity .3s; }
.rf-notepad-area { width: 100%; background: var(--bg); border: 1px solid var(--border); border-radius: 9px; padding: 12px 14px; color: var(--text); font-size: 13.5px; font-family: 'Inter', sans-serif; outline: none; resize: vertical; min-height: 160px; line-height: 1.65; }
.rf-notepad-area:focus { border-color: var(--gold); }
.rf-notepad-area::placeholder { color: var(--text-muted); font-style: italic; }

@media (max-width: 600px) {
  .rf-login-card { padding: 26px 20px; }
  .rf-page { padding: 16px 14px 50px; }
  .rf-rune-edit-row { grid-template-columns: 1fr; grid-template-areas: "name" "effect" "desc" "del"; }
  .rf-player-row-name { width: 100%; }
}
`;

/* ============================================================
   SUPABASE DATA LAYER
   All reads/writes for a campaign live here. Row shapes:
     campaigns:  { id, campaign_name, dm_passcode, max_equip_slots }
     rune_trees: { id, campaign_id, name, color, icon, description, tier_count, runes (jsonb[]) }
     players:    { id, campaign_id, name, unlocked_runes (jsonb[] of ids), equipped_runes (jsonb[] of ids) }
   ============================================================ */

async function fetchCampaign(campaignId) {
  const { data, error } = await supabase.from('campaigns').select('*').eq('id', campaignId).maybeSingle();
  if (error) throw error;
  return data;
}

async function fetchTrees(campaignId) {
  const { data, error } = await supabase.from('rune_trees').select('*').eq('campaign_id', campaignId);
  if (error) throw error;
  return data || [];
}

async function fetchPlayers(campaignId) {
  const { data, error } = await supabase.from('players').select('*').eq('campaign_id', campaignId);
  if (error) throw error;
  return data || [];
}


async function fetchAbilitySets(campaignId) {
  const { data, error } = await supabase.from('ability_sets').select('*').eq('campaign_id', campaignId);
  if (error) throw error;
  return data || [];
}


async function fetchItems(campaignId) {
  const { data, error } = await supabase.from('items').select('*').eq('campaign_id', campaignId);
  if (error) throw error;
  return data || [];
}

async function fetchVttState(campaignId) {
  const { data, error } = await supabase.from('vtt_state').select('*').eq('campaign_id', campaignId);
  if (error) throw error;
  return (data && data[0]) || { campaign_id: campaignId, map_image: null, tokens: [] };
}

function compressImage(file) {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX = 1600; let w = img.width, h = img.height;
        if (w > MAX) { h = Math.round(h * MAX / w); w = MAX; }
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.80));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

const CATEGORIES   = ['weapon','armor','consumable','tool','magic','currency','misc'];
const CAT_ICONS    = { weapon:'\u2694\uFE0F', armor:'\uD83D\uDEE1\uFE0F', consumable:'\uD83E\uDDEA', tool:'\uD83D\uDD27', magic:'\u2728', currency:'\uD83E\uDE99', misc:'\uD83D\uDCE6' };
const TOKEN_COLORS = ['#c4453c','#3d8fc4','#4f9d6e','#8b5fbf','#d4a843','#d47843','#3dabb8','#c8ccd8'];
const TICONS       = ['\uD83D\uDC64','\uD83D\uDC79','\uD83D\uDC32','\uD83D\uDC3A','\uD83D\uDC80','\uD83E\uDDD9','\u2694\uFE0F','\uD83D\uDEE1\uFE0F','\uD83D\uDC3B','\uD83E\uDDA5','\uD83E\uDDDD','\uD83D\uDC17','\uD83D\uDC0D','\uD83E\uDD81','\uD83D\uDC51','\uD83D\uDC15'];

/* ============================================================
   SMALL REUSABLE PIECES
   ============================================================ */

function DeleteConfirmButton({ onConfirm, label }) {
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (!armed) return;
    const t = setTimeout(() => setArmed(false), 3000);
    return () => clearTimeout(t);
  }, [armed]);
  return (
    <button
      className={`rf-icon-btn-danger${armed ? ' rf-icon-btn-danger--armed' : ''}`}
      onClick={() => { if (armed) { onConfirm(); setArmed(false); } else { setArmed(true); } }}
    >
      {armed ? `Confirm ${label || 'delete'}?` : <Trash2 size={14} />}
    </button>
  );
}

function RuneNode({ rune, icon, status, selected, onClick }) {
  const locked = status === 'locked' || status === 'ungranted';
  const equipped = status === 'equipped';
  return (
    <div className="rf-node-wrap" onClick={onClick}>
      <div className={`rf-node rf-node--${status}${selected ? ' rf-node--selected' : ''}`}>
        <span>{icon}</span>
        {locked && <div className="rf-lock-badge"><Lock size={10} /></div>}
        {equipped && <div className="rf-equip-badge"><Check size={11} /></div>}
      </div>
      <div className="rf-node-name">{rune.name}</div>
    </div>
  );
}

function RuneTreeView({ tree, mode, unlockedIds, equippedIds, selectedRuneId, onRuneClick }) {
  const color = TREE_COLORS[tree.color] || TREE_COLORS.gold;
  const tiers = Array.from({ length: tree.tier_count || 1 }, (_, i) => i + 1);
  const runes = tree.runes || [];
  return (
    <div className="rf-tree" style={{ '--tc': color.hex, '--tc-rgb': color.rgb }}>
      <div className="rf-tree-header">
        <span className="rf-tree-icon">{tree.icon}</span>
        <div>
          <div className="rf-tree-name">{tree.name}</div>
          {tree.description && <div className="rf-tree-desc">{tree.description}</div>}
        </div>
      </div>
      <div className="rf-tree-tiers">
        {tiers.map((tierNum) => {
          const tierRunes = runes.filter((r) => r.tier === tierNum);
          if (tierRunes.length === 0) return null;
          return (
            <div className="rf-tier-row" key={tierNum}>
              <div className="rf-tier-label">Tier {tierNum}</div>
              <div className="rf-tier-nodes">
                {tierRunes.map((rune) => {
                  let status;
                  if (mode === 'grant') {
                    status = unlockedIds.includes(rune.id) ? 'granted' : 'ungranted';
                  } else {
                    status = equippedIds && equippedIds.includes(rune.id)
                      ? 'equipped'
                      : (unlockedIds.includes(rune.id) ? 'unlocked' : 'locked');
                  }
                  return (
                    <RuneNode
                      key={rune.id}
                      rune={rune}
                      icon={tree.icon}
                      status={status}
                      selected={selectedRuneId === rune.id}
                      onClick={() => onRuneClick(rune, tree, status)}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DetailPanel({ rune, tree }) {
  const color = TREE_COLORS[tree.color] || TREE_COLORS.gold;
  return (
    <div className="rf-detail" style={{ '--tc': color.hex, '--tc-rgb': color.rgb }}>
      <div className="rf-detail-title">{tree.icon} {rune.name}</div>
      <div className="rf-detail-tier">{tree.name} · Tier {rune.tier}</div>
      {rune.effect && <div className="rf-detail-effect">{rune.effect}</div>}
      {rune.description
        ? <div className="rf-detail-desc">{rune.description}</div>
        : <div className="rf-detail-desc rf-detail-desc--muted">No lore written for this rune yet.</div>}
    </div>
  );
}

function TopHeader({ meta, role, playerName, onExit, onRefresh, onSwitchPlayer, live }) {
  return (
    <div className="rf-header">
      <div>
        <div className="rf-header-title">{meta.campaign_name}</div>
        <div className="rf-header-sub">
          {role === 'dm' ? <><Crown size={13} /> Dungeon Master</> : <><Shield size={13} /> {playerName}</>}
        </div>
      </div>
      <div className="rf-header-actions">
        <span className={`rf-live-dot${live ? '' : ' rf-live-dot--off'}`}>{live ? 'Live' : 'Reconnecting…'}</span>
        <button className="rf-icon-btn" onClick={onRefresh} title="Refresh"><RefreshCw size={16} /></button>
        {role === 'player' && onSwitchPlayer && (
          <button className="rf-btn-ghost-sm" onClick={onSwitchPlayer}>Switch player</button>
        )}
        <button className="rf-icon-btn" onClick={onExit} title="Log out"><LogOut size={16} /></button>
      </div>
    </div>
  );
}


/* ============================================================
   MANA BAR
   ============================================================ */

function ManaBar({ currentMana, maxMana, onAdjust, onRestore }) {
  const pct = maxMana > 0 ? Math.max(0, Math.min(100, (currentMana / maxMana) * 100)) : 0;
  return (
    <div className="rf-mana-section">
      <div className="rf-mana-header">
        <div className="rf-mana-title"><Droplet size={14} /> Mana</div>
        <div className="rf-mana-count">{currentMana} / {maxMana}</div>
      </div>
      <div className="rf-mana-track">
        <div className="rf-mana-fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="rf-mana-actions">
        <button className="rf-mana-adj" onClick={() => onAdjust(-1)} disabled={currentMana <= 0}>−</button>
        <button className="rf-mana-adj" onClick={() => onAdjust(+1)} disabled={currentMana >= maxMana}>+</button>
        <button className="rf-mana-restore" onClick={onRestore} disabled={currentMana >= maxMana}>
          <RefreshCw size={12} /> Restore All
        </button>
      </div>
    </div>
  );
}

function AbilityItem({ ability, currentMana, onUse }) {
  const canAfford = currentMana >= ability.mana_cost;
  return (
    <div className="rf-ability-item">
      <div className="rf-ability-item-body">
        <div className="rf-ability-item-name">{ability.name}</div>
        {ability.effect && <div className="rf-ability-item-effect">{ability.effect}</div>}
        {ability.description && <div className="rf-ability-item-desc">{ability.description}</div>}
      </div>
      <div className="rf-ability-side">
        <div className="rf-ability-cost"><Droplet size={12} /> {ability.mana_cost}</div>
        <button className="rf-ability-use" disabled={!canAfford} onClick={() => onUse(ability)}>
          <Zap size={12} /> Use
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   DM: TREE EDITOR
   ============================================================ */

function TreeEditorModal({ tree, onClose, onSave, onDelete }) {
  const isNew = !tree;
  const [name, setName] = useState(tree ? tree.name : '');
  const [color, setColor] = useState(tree ? tree.color : 'gold');
  const [icon, setIcon] = useState(tree ? tree.icon : ICONS[0]);
  const [description, setDescription] = useState(tree ? tree.description : '');
  const [tierCount, setTierCount] = useState(tree ? tree.tier_count : 2);
  const [runes, setRunes] = useState(tree ? [...tree.runes] : []);

  const addRune = (tierNum) => {
    setRunes((r) => [...r, { id: uid('rune'), name: 'New Rune', tier: tierNum, effect: '', description: '' }]);
  };
  const updateRune = (id, patch) => {
    setRunes((r) => r.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  };
  const removeRune = (id) => {
    setRunes((r) => r.filter((x) => x.id !== id));
  };
  const addTier = () => setTierCount((c) => c + 1);
  const removeLastTier = () => {
    const hasRunesInLastTier = runes.some((r) => r.tier === tierCount);
    if (hasRunesInLastTier || tierCount <= 1) return;
    setTierCount((c) => c - 1);
  };

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({
      id: tree ? tree.id : uid('tree'),
      name: name.trim(),
      color,
      icon,
      description: description.trim(),
      tier_count: tierCount,
      runes,
    });
  };

  return (
    <div className="rf-modal-overlay" onClick={onClose}>
      <div className="rf-modal" onClick={(e) => e.stopPropagation()}>
        <div className="rf-modal-header">
          <h3>{isNew ? 'New Rune Path' : 'Edit Rune Path'}</h3>
          <button className="rf-icon-btn" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="rf-modal-body">
          <label className="rf-label">Path name</label>
          <input className="rf-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Shadow Arts" />

          <label className="rf-label">Icon</label>
          <div className="rf-icon-pick-row">
            {ICONS.map((ic) => (
              <button
                key={ic}
                type="button"
                className={`rf-icon-pick${icon === ic ? ' rf-icon-pick--active' : ''}`}
                onClick={() => setIcon(ic)}
              >{ic}</button>
            ))}
          </div>

          <label className="rf-label">Color</label>
          <div className="rf-color-row">
            {Object.entries(TREE_COLORS).map(([key, val]) => (
              <button
                key={key}
                type="button"
                className={`rf-color-swatch${color === key ? ' rf-color-swatch--active' : ''}`}
                style={{ '--sw': val.hex }}
                onClick={() => setColor(key)}
                title={val.name}
              />
            ))}
          </div>

          <label className="rf-label">Path description (optional flavor)</label>
          <textarea className="rf-textarea" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What is this path about?" />

          <div className="rf-tier-editor-header">
            <label className="rf-label" style={{ margin: 0 }}>Tiers &amp; Runes</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" className="rf-btn-ghost-sm" onClick={removeLastTier} disabled={tierCount <= 1}>− Tier</button>
              <button type="button" className="rf-btn-ghost-sm" onClick={addTier}>+ Tier</button>
            </div>
          </div>

          {Array.from({ length: tierCount }, (_, i) => i + 1).map((tierNum) => (
            <div className="rf-tier-edit-block" key={tierNum}>
              <div className="rf-tier-edit-label">
                <span>Tier {tierNum}</span>
                <button type="button" className="rf-btn-ghost-sm" onClick={() => addRune(tierNum)}><Plus size={12} /> Add rune</button>
              </div>
              {runes.filter((r) => r.tier === tierNum).map((rune) => (
                <div className="rf-rune-edit-row" key={rune.id}>
                  <input className="rf-input rf-input-sm" value={rune.name} onChange={(e) => updateRune(rune.id, { name: e.target.value })} placeholder="Rune name" />
                  <input className="rf-input rf-input-sm" value={rune.effect} onChange={(e) => updateRune(rune.id, { effect: e.target.value })} placeholder="Mechanical effect, e.g. +1 to saving throws" />
                  <textarea className="rf-textarea rf-textarea-sm" rows={1} value={rune.description} onChange={(e) => updateRune(rune.id, { description: e.target.value })} placeholder="Flavor / lore (optional)" />
                  <button type="button" className="rf-icon-btn-danger" onClick={() => removeRune(rune.id)}><Trash2 size={14} /></button>
                </div>
              ))}
              {runes.filter((r) => r.tier === tierNum).length === 0 && (
                <div className="rf-empty-mini">No runes in this tier yet.</div>
              )}
            </div>
          ))}
        </div>
        <div className="rf-modal-footer">
          {!isNew && <DeleteConfirmButton onConfirm={() => onDelete(tree.id)} label="delete path" />}
          <div style={{ flex: 1 }} />
          <button className="rf-btn-ghost" onClick={onClose}>Cancel</button>
          <button className="rf-btn-primary" onClick={handleSave} disabled={!name.trim()}>Save Path</button>
        </div>
      </div>
    </div>
  );
}

function TreesTab({ trees, onOpenEditor }) {
  return (
    <div>
      <div className="rf-section-header">
        <h2 className="rf-section-title">Rune Paths</h2>
        <button className="rf-btn-primary" onClick={() => onOpenEditor(null)}><Plus size={15} /> New Path</button>
      </div>
      {trees.length === 0 ? (
        <div className="rf-empty-state">No rune paths yet. Create one to start building your players' progression system.</div>
      ) : (
        <div className="rf-grid">
          {trees.map((tree) => {
            const color = TREE_COLORS[tree.color] || TREE_COLORS.gold;
            const runeCount = (tree.runes || []).length;
            return (
              <div key={tree.id} className="rf-tree-card" style={{ '--tc': color.hex }} onClick={() => onOpenEditor(tree)}>
                <div className="rf-tree-card-icon">{tree.icon}</div>
                <div className="rf-tree-card-name">{tree.name}</div>
                <div className="rf-tree-card-meta">{runeCount} rune{runeCount !== 1 ? 's' : ''} · {tree.tier_count} tier{tree.tier_count !== 1 ? 's' : ''}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   DM: PLAYERS & RUNE GRANTING
   ============================================================ */

function RuneGrantModal({ player, trees, onClose, onToggleUnlock }) {
  const [selected, setSelected] = useState(null);
  const handleClick = (rune, tree) => {
    setSelected({ rune, tree });
    onToggleUnlock(player.id, rune.id);
  };
  return (
    <div className="rf-modal-overlay" onClick={onClose}>
      <div className="rf-modal rf-modal-wide" onClick={(e) => e.stopPropagation()}>
        <div className="rf-modal-header">
          <h3>Runes for {player.name}</h3>
          <button className="rf-icon-btn" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="rf-modal-body">
          <p className="rf-modal-hint">Click a rune to grant or revoke it. Granted runes glow and become available for {player.name} to equip, live, the moment you click.</p>
          {trees.length === 0 && <div className="rf-empty-state">Create a rune path first.</div>}
          {trees.map((tree) => (
            <RuneTreeView
              key={tree.id}
              tree={tree}
              mode="grant"
              unlockedIds={player.unlocked_runes || []}
              selectedRuneId={selected ? selected.rune.id : null}
              onRuneClick={handleClick}
            />
          ))}
          {selected && <DetailPanel rune={selected.rune} tree={selected.tree} />}
        </div>
        <div className="rf-modal-footer">
          <div style={{ flex: 1 }} />
          <button className="rf-btn-primary" onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  );
}


/* ============================================================
   DM: ABILITY SET EDITOR
   ============================================================ */

function AbilitySetEditorModal({ set, onClose, onSave, onDelete }) {
  const isNew = !set;
  const [name, setName] = useState(set ? set.name : '');
  const [color, setColor] = useState(set ? set.color : 'violet');
  const [icon, setIcon] = useState(set ? set.icon : '\u26a1');
  const [description, setDescription] = useState(set ? set.description : '');
  const [abilities, setAbilities] = useState(set ? [...set.abilities] : []);

  const addAbility = () => setAbilities(a => [...a, { id: uid('ab'), name: 'New Ability', mana_cost: 2, effect: '', description: '' }]);
  const updateAbility = (id, patch) => setAbilities(a => a.map(x => x.id === id ? { ...x, ...patch } : x));
  const removeAbility = (id) => setAbilities(a => a.filter(x => x.id !== id));

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({ id: set ? set.id : uid('abset'), name: name.trim(), color, icon, description: description.trim(), abilities });
  };

  return (
    <div className="rf-modal-overlay" onClick={onClose}>
      <div className="rf-modal" onClick={e => e.stopPropagation()}>
        <div className="rf-modal-header">
          <h3>{isNew ? 'New Ability Set' : 'Edit Ability Set'}</h3>
          <button className="rf-icon-btn" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="rf-modal-body">
          <label className="rf-label">Set name</label>
          <input className="rf-input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Arcane Arts" />
          <label className="rf-label">Icon</label>
          <div className="rf-icon-pick-row">
            {ICONS.map(ic => <button key={ic} type="button" className={`rf-icon-pick${icon === ic ? ' rf-icon-pick--active' : ''}`} onClick={() => setIcon(ic)}>{ic}</button>)}
          </div>
          <label className="rf-label">Color</label>
          <div className="rf-color-row">
            {Object.entries(TREE_COLORS).map(([key, val]) => (
              <button key={key} type="button" className={`rf-color-swatch${color === key ? ' rf-color-swatch--active' : ''}`} style={{ '--sw': val.hex }} onClick={() => setColor(key)} title={val.name} />
            ))}
          </div>
          <label className="rf-label">Description (optional)</label>
          <textarea className="rf-textarea" rows={2} value={description} onChange={e => setDescription(e.target.value)} placeholder="What theme do these abilities share?" />
          <div className="rf-tier-editor-header">
            <label className="rf-label" style={{ margin: 0 }}>Abilities</label>
            <button type="button" className="rf-btn-mana" onClick={addAbility}><Plus size={12} /> Add ability</button>
          </div>
          {abilities.length === 0 && <div className="rf-empty-mini">No abilities yet.</div>}
          {abilities.map(ab => (
            <div className="rf-ab-block" key={ab.id}>
              <div className="rf-ab-row1">
                <input className="rf-input rf-input-sm" value={ab.name} onChange={e => updateAbility(ab.id, { name: e.target.value })} placeholder="Ability name" />
                <input className="rf-input rf-input-sm rf-mana-input" type="number" min="0" value={ab.mana_cost}
                  onChange={e => updateAbility(ab.id, { mana_cost: Math.max(0, Number(e.target.value) || 0) })} placeholder="Mana" />
                <button type="button" className="rf-icon-btn-danger" onClick={() => removeAbility(ab.id)}><Trash2 size={14} /></button>
              </div>
              <div className="rf-ab-row2">
                <input className="rf-input rf-input-sm" value={ab.effect} onChange={e => updateAbility(ab.id, { effect: e.target.value })} placeholder="Mechanical effect" />
              </div>
              <div>
                <textarea className="rf-textarea rf-textarea-sm" rows={2} value={ab.description} onChange={e => updateAbility(ab.id, { description: e.target.value })} placeholder="Flavor / lore (optional)" />
              </div>
            </div>
          ))}
        </div>
        <div className="rf-modal-footer">
          {!isNew && <DeleteConfirmButton onConfirm={() => onDelete(set.id)} label="delete set" />}
          <div style={{ flex: 1 }} />
          <button className="rf-btn-ghost" onClick={onClose}>Cancel</button>
          <button className="rf-btn-primary" onClick={handleSave} disabled={!name.trim()}>Save Set</button>
        </div>
      </div>
    </div>
  );
}

function AbilityGrantModal({ player, abilitySets, onClose, onToggleGrant, onSetMaxMana }) {
  const [localMax, setLocalMax] = useState(player.max_mana ?? 10);
  const handleMaxBlur = () => onSetMaxMana(player.id, Math.max(0, Number(localMax) || 0));

  return (
    <div className="rf-modal-overlay" onClick={onClose}>
      <div className="rf-modal rf-modal-wide" onClick={e => e.stopPropagation()}>
        <div className="rf-modal-header">
          <h3>Abilities for {player.name}</h3>
          <button className="rf-icon-btn" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="rf-modal-body">
          <div className="rf-mana-setter">
            <div className="rf-mana-setter-label"><Droplet size={15} /> Max Mana for {player.name}</div>
            <input className="rf-input" type="number" min="0" value={localMax}
              onChange={e => setLocalMax(e.target.value)} onBlur={handleMaxBlur}
              style={{ width: 90, textAlign: 'center' }} />
          </div>
          <p className="rf-modal-hint">Click an ability to grant or revoke it. Changes are live.</p>
          {abilitySets.length === 0 && <div className="rf-empty-state">Create an ability set first from the Abilities tab.</div>}
          {abilitySets.map(abSet => {
            const color = TREE_COLORS[abSet.color] || TREE_COLORS.violet;
            return (
              <div key={abSet.id} style={{ marginBottom: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 10 }}>
                  <div style={{ width: 9, height: 9, borderRadius: '50%', background: color.hex, flexShrink: 0 }} />
                  <span style={{ fontFamily: "'Cinzel',serif", fontWeight: 600, fontSize: 14 }}>{abSet.icon} {abSet.name}</span>
                </div>
                {(abSet.abilities || []).length === 0 && <div className="rf-empty-mini">No abilities in this set.</div>}
                {(abSet.abilities || []).map(ab => {
                  const granted = (player.granted_abilities || []).includes(ab.id);
                  return (
                    <div key={ab.id} className={`rf-grant-ab-row${granted ? ' rf-grant-ab-row--granted' : ''}`}
                      onClick={() => onToggleGrant(player.id, ab.id)}>
                      <div className={`rf-grant-ab-check${granted ? ' rf-grant-ab-check--on' : ''}`}>
                        {granted && <Check size={13} />}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div className="rf-grant-ab-name">{ab.name}</div>
                        <div className="rf-grant-ab-sub">
                          {ab.mana_cost} mana{ab.effect ? ` · ${ab.effect}` : ''}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
        <div className="rf-modal-footer">
          <div style={{ flex: 1 }} />
          <button className="rf-btn-primary" onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  );
}

function AbilitiesTab({ abilitySets, onOpenEditor }) {
  return (
    <div>
      <div className="rf-section-header">
        <h2 className="rf-section-title">Ability Sets</h2>
        <button className="rf-btn-primary" onClick={() => onOpenEditor(null)}><Plus size={15} /> New Set</button>
      </div>
      {abilitySets.length === 0 ? (
        <div className="rf-empty-state">No ability sets yet. Create one to define mana-costed abilities you can unlock for players.</div>
      ) : (
        <div className="rf-abset-grid">
          {abilitySets.map(s => (
            <div key={s.id} className="rf-abset-card" onClick={() => onOpenEditor(s)}>
              <div className="rf-abset-card-icon">{s.icon}</div>
              <div className="rf-abset-card-name">{s.name}</div>
              <div className="rf-abset-card-meta">{(s.abilities || []).length} abilit{(s.abilities || []).length === 1 ? 'y' : 'ies'}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


/* ============================================================
   VTT
   ============================================================ */

function VTTMapArea({ vttState, canDragAll, ownPlayerId, onMoveToken }) {
  const mapRef = useRef(null);
  const [dragging, setDragging] = useState(null);
  const [localPos, setLocalPos] = useState({});

  useEffect(() => {
    const up = () => setDragging(null);
    window.addEventListener('mouseup', up);
    return () => window.removeEventListener('mouseup', up);
  }, []);

  const pct = useCallback((e) => {
    if (!mapRef.current) return { x: 50, y: 50 };
    const r = mapRef.current.getBoundingClientRect();
    return {
      x: Math.max(1, Math.min(99, ((e.clientX - r.left) / r.width)  * 100)),
      y: Math.max(1, Math.min(99, ((e.clientY - r.top)  / r.height) * 100)),
    };
  }, []);

  const onMouseDown = useCallback((e, token) => {
    const mine = canDragAll || (ownPlayerId && token.player_id === ownPlayerId);
    if (!mine) return;
    e.preventDefault(); e.stopPropagation();
    setDragging(token.id);
    setLocalPos(prev => ({ ...prev, [token.id]: { x: token.x, y: token.y } }));
  }, [canDragAll, ownPlayerId]);

  const onMouseMove = useCallback((e) => {
    if (!dragging) return;
    const { x, y } = pct(e);
    setLocalPos(prev => ({ ...prev, [dragging]: { x, y } }));
  }, [dragging, pct]);

  const onMouseUp = useCallback((e) => {
    if (!dragging) return;
    const { x, y } = pct(e);
    onMoveToken(dragging, x, y);
    setDragging(null);
  }, [dragging, pct, onMoveToken]);

  if (!vttState || !vttState.map_image) return null;
  const sz = s => s === 'large' ? 58 : s === 'small' ? 30 : 44;

  return (
    <div ref={mapRef} className="rf-vtt-map-wrap"
      style={{ cursor: dragging ? 'grabbing' : 'default' }}
      onMouseMove={onMouseMove} onMouseUp={onMouseUp}
      onMouseLeave={() => { if (dragging) setDragging(null); }}>
      <img src={vttState.map_image} alt="Battle map" className="rf-vtt-map-img" draggable={false}/>
      {(vttState.tokens || []).map(token => {
        const pos = localPos[token.id] || { x: token.x, y: token.y };
        const canDrag = canDragAll || (ownPlayerId && token.player_id === ownPlayerId);
        const s = sz(token.size);
        return (
          <div key={token.id} className="rf-vtt-token"
            style={{ left:`${pos.x}%`, top:`${pos.y}%`, width:s, height:s,
              background:token.color, fontSize:Math.round(s*0.44),
              cursor: canDrag ? (dragging===token.id ? 'grabbing' : 'grab') : 'default',
              transition: dragging===token.id ? 'none' : 'left .12s,top .12s',
              zIndex: dragging===token.id ? 20 : 5 }}
            onMouseDown={e => onMouseDown(e, token)}>
            {token.icon}
            <div className="rf-vtt-token-label">{token.name}</div>
          </div>
        );
      })}
    </div>
  );
}

function AddTokenModal({ players, onClose, onAdd }) {
  const [name, setName]   = useState('');
  const [type, setType]   = useState('monster');
  const [color, setColor] = useState(TOKEN_COLORS[0]);
  const [icon, setIcon]   = useState('\uD83D\uDC79');
  const [size, setSize]   = useState('medium');
  const [linked, setLinked] = useState('');

  const handleAdd = () => {
    if (!name.trim()) return;
    onAdd({ id: uid('tok'), name: name.trim(), type, color, icon, size, x: 50, y: 50, player_id: linked || null });
  };

  return (
    <div className="rf-modal-overlay" onClick={onClose}>
      <div className="rf-modal" onClick={e => e.stopPropagation()}>
        <div className="rf-modal-header">
          <h3>Add Token</h3>
          <button className="rf-icon-btn" onClick={onClose}><X size={18}/></button>
        </div>
        <div className="rf-modal-body">
          <label className="rf-label">Name</label>
          <input className="rf-input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Goblin, Thorin…"/>
          <label className="rf-label">Type</label>
          <div style={{ display:'flex', gap:8 }}>
            {['player','monster','npc'].map(t => (
              <button key={t} type="button" style={{ flex:1, fontSize:12, padding:'7px 8px', textTransform:'capitalize' }}
                className={type===t ? 'rf-btn-primary' : 'rf-btn-ghost'}
                onClick={() => { setType(t); setIcon(t==='player'?'\uD83D\uDC64':t==='monster'?'\uD83D\uDC79':'\uD83D\uDD35'); }}>
                {t}
              </button>
            ))}
          </div>
          {type === 'player' && players.length > 0 && (
            <>
              <label className="rf-label">Link to player (lets them drag it)</label>
              <select className="rf-input" value={linked}
                onChange={e => { setLinked(e.target.value); if (e.target.value) setName(players.find(p=>p.id===e.target.value)?.name||name); }}>
                <option value="">— unlinked —</option>
                {players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </>
          )}
          <label className="rf-label">Icon</label>
          <div className="rf-icon-pick-row">
            {TICONS.map(ic => <button key={ic} type="button" className={`rf-icon-pick${icon===ic?' rf-icon-pick--active':''}`} onClick={()=>setIcon(ic)}>{ic}</button>)}
          </div>
          <label className="rf-label">Color</label>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginTop:4 }}>
            {TOKEN_COLORS.map(c => (
              <button key={c} type="button" onClick={()=>setColor(c)}
                style={{ width:28, height:28, borderRadius:'50%', background:c,
                  border:`3px solid ${color===c?'#fff':'transparent'}`,
                  boxShadow: color===c ? `0 0 0 2px ${c}` : undefined }}/>
            ))}
          </div>
          <label className="rf-label">Size</label>
          <div style={{ display:'flex', gap:8 }}>
            {['small','medium','large'].map(s => (
              <button key={s} type="button" style={{ flex:1, fontSize:12, padding:'7px 8px', textTransform:'capitalize' }}
                className={size===s ? 'rf-btn-primary' : 'rf-btn-ghost'}
                onClick={()=>setSize(s)}>{s}</button>
            ))}
          </div>
        </div>
        <div className="rf-modal-footer">
          <div style={{flex:1}}/>
          <button className="rf-btn-ghost" onClick={onClose}>Cancel</button>
          <button className="rf-btn-primary" disabled={!name.trim()} onClick={handleAdd}>Place on Map</button>
        </div>
      </div>
    </div>
  );
}

function VTTTab({ vttState, players, onUploadMap, onMoveToken, onAddToken, onRemoveToken }) {
  const [addingToken, setAddingToken] = useState(false);
  const fileRef = useRef(null);
  return (
    <div>
      <div className="rf-section-header">
        <h2 className="rf-section-title">Battle Map</h2>
        <div style={{ display:'flex', gap:8 }}>
          <button className="rf-btn-ghost-sm" onClick={() => fileRef.current?.click()}>
            <Map size={13}/> {vttState.map_image ? 'Replace Map' : 'Upload Map'}
          </button>
          <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={onUploadMap}/>
          {vttState.map_image && (
            <button className="rf-btn-primary" onClick={()=>setAddingToken(true)}><Plus size={14}/> Add Token</button>
          )}
        </div>
      </div>
      {!vttState.map_image ? (
        <div className="rf-vtt-empty">
          <Map size={40} style={{ margin:'0 auto 12px', display:'block', opacity:.25 }}/>
          <div style={{ fontSize:14, marginBottom:6 }}>No map uploaded yet</div>
          <div style={{ fontSize:12.5 }}>Upload a PNG or JPG — it will be compressed automatically</div>
        </div>
      ) : (
        <>
          <VTTMapArea vttState={vttState} canDragAll={true} ownPlayerId={null} onMoveToken={onMoveToken}/>
          {(vttState.tokens||[]).length > 0 && (
            <div className="rf-token-list">
              {(vttState.tokens||[]).map(t => (
                <div key={t.id} className="rf-token-row">
                  <div className="rf-token-swatch" style={{ background:t.color }}>{t.icon}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:600, fontSize:13.5 }}>{t.name}</div>
                    <div style={{ fontSize:11.5, color:'var(--text-muted)', textTransform:'capitalize' }}>{t.type} · {t.size}</div>
                  </div>
                  <DeleteConfirmButton onConfirm={()=>onRemoveToken(t.id)} label="remove"/>
                </div>
              ))}
            </div>
          )}
        </>
      )}
      {addingToken && (
        <AddTokenModal players={players} onClose={()=>setAddingToken(false)}
          onAdd={token => { onAddToken(token); setAddingToken(false); }}/>
      )}
    </div>
  );
}

function PlayerVTTSection({ vttState, currentPlayerId, onMoveToken }) {
  if (!vttState || !vttState.map_image) return null;
  return (
    <div style={{ marginBottom:22 }}>
      <div className="rf-section-header" style={{ marginBottom:12 }}>
        <h2 className="rf-section-title" style={{ fontSize:16, display:'flex', alignItems:'center', gap:8 }}>
          <Map size={16}/>Battle Map
        </h2>
        <span style={{ fontSize:12, color:'var(--text-muted)' }}>Drag your token to move</span>
      </div>
      <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:14, overflow:'hidden' }}>
        <VTTMapArea vttState={vttState} canDragAll={false} ownPlayerId={currentPlayerId} onMoveToken={onMoveToken}/>
      </div>
    </div>
  );
}

/* ============================================================
   INVENTORY
   ============================================================ */

function ItemEditorModal({ item, onClose, onSave, onDelete }) {
  const isNew = !item;
  const [name,    setName]    = useState(item?.name || '');
  const [desc,    setDesc]    = useState(item?.description || '');
  const [cat,     setCat]     = useState(item?.category || 'misc');
  const [weight,  setWeight]  = useState(item?.weight ?? 0);
  const [goldVal, setGoldVal] = useState(item?.gold_value ?? 0);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({ id: item ? item.id : uid('item'), name:name.trim(), description:desc.trim(), category:cat, weight:Number(weight)||0, gold_value:Number(goldVal)||0 });
  };
  return (
    <div className="rf-modal-overlay" onClick={onClose}>
      <div className="rf-modal" onClick={e => e.stopPropagation()}>
        <div className="rf-modal-header">
          <h3>{isNew ? 'New Item' : 'Edit Item'}</h3>
          <button className="rf-icon-btn" onClick={onClose}><X size={18}/></button>
        </div>
        <div className="rf-modal-body">
          <label className="rf-label">Name</label>
          <input className="rf-input" value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Longsword +1"/>
          <label className="rf-label">Category</label>
          <div style={{ display:'flex', flexWrap:'wrap', gap:7 }}>
            {CATEGORIES.map(c => (
              <button key={c} type="button" style={{ fontSize:12, padding:'5px 10px', textTransform:'capitalize' }}
                className={cat===c ? 'rf-btn-primary' : 'rf-btn-ghost'} onClick={()=>setCat(c)}>
                {CAT_ICONS[c]} {c}
              </button>
            ))}
          </div>
          <label className="rf-label">Description</label>
          <textarea className="rf-textarea" rows={2} value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Magical properties or lore"/>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginTop:14 }}>
            <div>
              <label className="rf-label" style={{ marginTop:0 }}>Weight (lb)</label>
              <input className="rf-input" type="number" min="0" step="0.1" value={weight} onChange={e=>setWeight(e.target.value)}/>
            </div>
            <div>
              <label className="rf-label" style={{ marginTop:0 }}>Gold value (gp)</label>
              <input className="rf-input" type="number" min="0" step="0.5" value={goldVal} onChange={e=>setGoldVal(e.target.value)}/>
            </div>
          </div>
        </div>
        <div className="rf-modal-footer">
          {!isNew && <DeleteConfirmButton onConfirm={()=>onDelete(item.id)} label="delete item"/>}
          <div style={{flex:1}}/>
          <button className="rf-btn-ghost" onClick={onClose}>Cancel</button>
          <button className="rf-btn-primary" disabled={!name.trim()} onClick={handleSave}>Save Item</button>
        </div>
      </div>
    </div>
  );
}

function PlayerInventoryModal({ player, items, onClose, onSetItemQty }) {
  const getQty = id => (player.inventory||[]).find(e=>e.item_id===id)?.quantity || 0;
  const [qtys, setQtys] = useState(() => {
    const m = {};
    items.forEach(i => { m[i.id] = getQty(i.id); });
    return m;
  });
  const adj = (id, delta) => setQtys(prev => ({ ...prev, [id]: Math.max(0, (prev[id]||0)+delta) }));
  const handleSave = () => {
    items.forEach(item => { if ((qtys[item.id]||0) !== getQty(item.id)) onSetItemQty(player.id, item.id, qtys[item.id]||0); });
    onClose();
  };
  return (
    <div className="rf-modal-overlay" onClick={onClose}>
      <div className="rf-modal rf-modal-wide" onClick={e=>e.stopPropagation()}>
        <div className="rf-modal-header">
          <h3>Inventory — {player.name}</h3>
          <button className="rf-icon-btn" onClick={onClose}><X size={18}/></button>
        </div>
        <div className="rf-modal-body">
          <p className="rf-modal-hint">Adjust quantities. Setting to 0 removes the item from the player.</p>
          {items.length === 0 && <div className="rf-empty-state">No items in catalog yet. Create some in the Items tab first.</div>}
          <div className="rf-inv-manage-list">
            {items.map(item => (
              <div key={item.id} className="rf-inv-manage-row">
                <span style={{ fontSize:18, flexShrink:0 }}>{CAT_ICONS[item.category]||'\uD83D\uDCE6'}</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:600, fontSize:13.5 }}>{item.name}</div>
                  <div style={{ fontSize:11.5, color:'var(--text-muted)', fontFamily:"'JetBrains Mono',monospace" }}>
                    {[item.weight>0&&`${item.weight}lb`, item.gold_value>0&&`${item.gold_value}gp`].filter(Boolean).join(' · ')}
                  </div>
                </div>
                <div className="rf-qty-ctrl">
                  <button className="rf-qty-btn" onClick={()=>adj(item.id,-1)}>-</button>
                  <div className={`rf-qty-val${(qtys[item.id]||0)===0?' rf-qty-val--zero':''}`}>{qtys[item.id]||0}</div>
                  <button className="rf-qty-btn" onClick={()=>adj(item.id,+1)}>+</button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rf-modal-footer">
          <div style={{flex:1}}/>
          <button className="rf-btn-ghost" onClick={onClose}>Cancel</button>
          <button className="rf-btn-primary" onClick={handleSave}>Save Changes</button>
        </div>
      </div>
    </div>
  );
}

function ItemsTab({ items, onOpenEditor }) {
  return (
    <div>
      <div className="rf-section-header">
        <h2 className="rf-section-title">Item Catalog</h2>
        <button className="rf-btn-primary" onClick={()=>onOpenEditor(null)}><Plus size={15}/> New Item</button>
      </div>
      {items.length === 0 ? (
        <div className="rf-empty-state">No items yet. Create items here, then give them to players from the Players tab.</div>
      ) : (
        <div className="rf-item-grid">
          {items.map(item => (
            <div key={item.id} className="rf-item-card" onClick={()=>onOpenEditor(item)}>
              <div className="rf-item-cat">{CAT_ICONS[item.category]||'\uD83D\uDCE6'} {item.category}</div>
              <div className="rf-item-name">{item.name}</div>
              {item.description && <div className="rf-item-desc-sm">{item.description}</div>}
              <div className="rf-item-stats">
                {item.weight>0 && <div className="rf-item-stat">{item.weight}<b>lb</b></div>}
                {item.gold_value>0 && <div className="rf-item-stat">{item.gold_value}<b>gp</b></div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PlayerInventorySection({ player, items }) {
  const inv = (player.inventory||[])
    .map(e => ({ ...e, item: items.find(i=>i.id===e.item_id) }))
    .filter(e => e.item && e.quantity>0);
  if (inv.length === 0) return null;
  const totalW = inv.reduce((s,e)=>s+e.item.weight*e.quantity,0);
  const totalG = inv.reduce((s,e)=>s+e.item.gold_value*e.quantity,0);
  return (
    <div className="rf-inv-section">
      <div className="rf-inv-header">
        <div className="rf-inv-title"><Package size={16}/>Inventory</div>
        <div className="rf-inv-totals">
          {totalW>0 && <span className="rf-inv-total">\u2696\uFE0F {totalW%1===0?totalW:totalW.toFixed(1)} lb</span>}
          {totalG>0 && <span className="rf-inv-total">\uD83E\uDE99 {totalG%1===0?totalG:totalG.toFixed(1)} gp</span>}
        </div>
      </div>
      <div className="rf-inv-list">
        {inv.map(e => (
          <div key={e.item_id} className="rf-inv-item">
            <div className="rf-inv-item-icon">{CAT_ICONS[e.item.category]||'\uD83D\uDCE6'}</div>
            <div className="rf-inv-item-body">
              <div className="rf-inv-item-name">{e.item.name}</div>
              {e.item.description && <div className="rf-inv-item-desc">{e.item.description}</div>}
              {(e.item.weight>0||e.item.gold_value>0) && (
                <div className="rf-inv-item-meta">
                  {e.item.weight>0 && <span>{e.item.weight}lb ea</span>}
                  {e.item.gold_value>0 && <span>{e.item.gold_value}gp ea</span>}
                </div>
              )}
            </div>
            <div className="rf-inv-item-qty">\xD7{e.quantity}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PlayersTab({ players, trees, abilitySets, onAddPlayer, onDeletePlayer, onOpenGrant, onOpenAbilityGrant, onOpenInventory }) {
  const [newName, setNewName] = useState('');
  const totalRunes = trees.reduce((sum, t) => sum + (t.runes || []).length, 0);
  const totalAbilities = abilitySets.reduce((sum, s) => sum + (s.abilities || []).length, 0);
  const submit = () => {
    if (!newName.trim()) return;
    onAddPlayer(newName.trim());
    setNewName('');
  };
  return (
    <div>
      <div className="rf-section-header">
        <h2 className="rf-section-title">Players</h2>
      </div>
      <div className="rf-add-player-row">
        <input
          className="rf-input"
          placeholder="Player or character name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
        />
        <button className="rf-btn-primary" onClick={submit}><Plus size={15} /> Add Player</button>
      </div>
      {players.length === 0 ? (
        <div className="rf-empty-state">No players added yet. Add your party members, or share the campaign link and let them join themselves from the player screen.</div>
      ) : (
        <div className="rf-player-list">
          {players.map((p) => (
            <div key={p.id} className="rf-player-row">
              <div className="rf-player-row-name">{p.name}</div>
              <div className="rf-player-row-meta" style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>{(p.unlocked_runes || []).length}/{totalRunes} runes · {(p.granted_abilities || []).length}/{totalAbilities} abilities <span className="rf-mana-pill"><Droplet size={10}/> {p.current_mana ?? p.max_mana ?? 10}/{p.max_mana ?? 10}</span></div>
              <div className="rf-player-row-actions">
                <button className="rf-btn-ghost-sm" onClick={() => onOpenGrant(p)}><Sparkles size={13} /> Runes</button>
                <button className="rf-btn-mana" onClick={() => onOpenAbilityGrant(p)}><Zap size={13} /> Abilities</button>
                <button className="rf-btn-ghost-sm" onClick={() => onOpenInventory(p)}><Package size={13}/> Items</button>
                <DeleteConfirmButton onConfirm={() => onDeletePlayer(p.id)} label="remove" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SettingsTab({ meta, shareUrl, onSave, onExit, onReset }) {
  const [campaignName, setCampaignName] = useState(meta.campaign_name);
  const [maxSlots, setMaxSlots] = useState(meta.max_equip_slots ?? 5);
  const [newPasscode, setNewPasscode] = useState('');
  const [savedFlash, setSavedFlash] = useState(false);
  const [copied, setCopied] = useState(false);

  const save = () => {
    onSave({
      ...meta,
      campaign_name: campaignName.trim() || meta.campaign_name,
      max_equip_slots: Math.max(0, Number(maxSlots) || 0),
      dm_passcode: newPasscode.trim() ? newPasscode.trim() : meta.dm_passcode,
    });
    setNewPasscode('');
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 2000);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard may be unavailable, the input is still selectable */
    }
  };

  return (
    <div>
      <div className="rf-section-header"><h2 className="rf-section-title">Settings</h2></div>
      <div className="rf-card rf-settings-card">
        <label className="rf-label">Campaign name</label>
        <input className="rf-input" value={campaignName} onChange={(e) => setCampaignName(e.target.value)} />

        <label className="rf-label">Max equipped runes per player</label>
        <input className="rf-input" type="number" min="0" value={maxSlots} onChange={(e) => setMaxSlots(e.target.value)} />
        <div className="rf-hint">Set to 0 for unlimited equipped runes.</div>

        <label className="rf-label">Change DM passcode</label>
        <input className="rf-input" type="text" value={newPasscode} onChange={(e) => setNewPasscode(e.target.value)} placeholder="Leave blank to keep current passcode" />

        <button className="rf-btn-primary" style={{ marginTop: 14 }} onClick={save}>{savedFlash ? 'Saved ✓' : 'Save Settings'}</button>
      </div>

      <div className="rf-card rf-settings-card" style={{ marginTop: 18 }}>
        <div className="rf-label" style={{ marginTop: 0 }}>Sharing this campaign</div>
        <div className="rf-hint">Send this link to your players. They'll choose "I'm a Player," pick or type their name, and everything updates live for everyone — no passcode needed.</div>
        <div className="rf-share-row">
          <input className="rf-input" readOnly value={shareUrl} onFocus={(e) => e.target.select()} />
          <button className="rf-btn-ghost-sm" onClick={copyLink}><Copy size={13} /> {copied ? 'Copied' : 'Copy'}</button>
        </div>
      </div>

      <div className="rf-card rf-settings-card rf-settings-danger" style={{ marginTop: 18 }}>
        <div className="rf-label" style={{ marginTop: 0 }}>Danger zone</div>
        <div className="rf-hint" style={{ marginBottom: 10 }}>This permanently deletes the campaign: all rune paths, players, and progress, for everyone.</div>
        <DeleteConfirmButton onConfirm={onReset} label="delete entire campaign" />
      </div>

      <button className="rf-btn-ghost" style={{ marginTop: 18 }} onClick={onExit}><LogOut size={14} /> Exit DM mode</button>
    </div>
  );
}

function DMDashboard({ meta, shareUrl, trees, players, abilitySets, items, vttState, live, onSaveTree, onDeleteTree, onAddPlayer, onDeletePlayer, onToggleUnlock, onSaveAbilitySet, onDeleteAbilitySet, onToggleGrantAbility, onSetPlayerMaxMana, onSaveItem, onDeleteItem, onSetItemQty, onUploadMap, onMoveToken, onAddToken, onRemoveToken, onSaveMeta, onExit, onReset, onRefresh }) {
  const [tab, setTab] = useState('trees');
  const [editingTree, setEditingTree] = useState(undefined);
  const [grantingPlayer, setGrantingPlayer] = useState(null);
  const [editingAbilitySet, setEditingAbilitySet] = useState(undefined);
  const [grantingAbilitiesFor, setGrantingAbilitiesFor] = useState(null);
  const [editingItem, setEditingItem] = useState(undefined);
  const [inventoryFor, setInventoryFor] = useState(null);

  const livePlayer = grantingPlayer ? (players.find((p) => p.id === grantingPlayer.id) || grantingPlayer) : null;
  const liveAbilityPlayer = grantingAbilitiesFor ? (players.find((p) => p.id === grantingAbilitiesFor.id) || grantingAbilitiesFor) : null;

  return (
    <div className="rf-page">
      <TopHeader meta={meta} role="dm" onExit={onExit} onRefresh={onRefresh} live={live} />
      <div className="rf-tabs">
        <button className={`rf-tab${tab === 'trees' ? ' rf-tab--active' : ''}`} onClick={() => setTab('trees')}><ScrollText size={15} /> Rune Paths</button>
        <button className={`rf-tab${tab === 'abilities' ? ' rf-tab--active' : ''}`} onClick={() => setTab('abilities')}><Zap size={15} /> Abilities</button>
        <button className={`rf-tab${tab === 'players' ? ' rf-tab--active' : ''}`} onClick={() => setTab('players')}><Users size={15} /> Players</button>
        <button className={`rf-tab${tab === 'items' ? ' rf-tab--active' : ''}`} onClick={() => setTab('items')}><Package size={15}/> Items</button>
        <button className={`rf-tab${tab === 'vtt' ? ' rf-tab--active' : ''}`} onClick={() => setTab('vtt')}><Map size={15}/> VTT</button>
        <button className={`rf-tab${tab === 'settings' ? ' rf-tab--active' : ''}`} onClick={() => setTab('settings')}><Settings size={15} /> Settings</button>
      </div>
      <div>
        {tab === 'trees' && <TreesTab trees={trees} onOpenEditor={setEditingTree} />}
        {tab === 'abilities' && <AbilitiesTab abilitySets={abilitySets} onOpenEditor={setEditingAbilitySet} />}
        {tab === 'players' && <PlayersTab players={players} trees={trees} abilitySets={abilitySets} onAddPlayer={onAddPlayer} onDeletePlayer={onDeletePlayer} onOpenGrant={setGrantingPlayer} onOpenAbilityGrant={setGrantingAbilitiesFor} onOpenInventory={setInventoryFor}/>}
        {tab === 'items' && <ItemsTab items={items} onOpenEditor={setEditingItem}/>}
        {tab === 'vtt' && <VTTTab vttState={vttState} players={players} onUploadMap={onUploadMap} onMoveToken={onMoveToken} onAddToken={onAddToken} onRemoveToken={onRemoveToken}/>}
        {tab === 'settings' && <SettingsTab meta={meta} shareUrl={shareUrl} onSave={onSaveMeta} onExit={onExit} onReset={onReset} />}
      </div>
      {editingTree !== undefined && (
        <TreeEditorModal
          tree={editingTree}
          onClose={() => setEditingTree(undefined)}
          onSave={(t) => { onSaveTree(t); setEditingTree(undefined); }}
          onDelete={(id) => { onDeleteTree(id); setEditingTree(undefined); }}
        />
      )}
      {livePlayer && (
        <RuneGrantModal
          player={livePlayer}
          trees={trees}
          onClose={() => setGrantingPlayer(null)}
          onToggleUnlock={onToggleUnlock}
        />
      )}
      {editingAbilitySet !== undefined && (
        <AbilitySetEditorModal
          set={editingAbilitySet}
          onClose={() => setEditingAbilitySet(undefined)}
          onSave={s => { onSaveAbilitySet(s); setEditingAbilitySet(undefined); }}
          onDelete={id => { onDeleteAbilitySet(id); setEditingAbilitySet(undefined); }}
        />
      )}
      {editingItem !== undefined && (
        <ItemEditorModal item={editingItem} onClose={()=>setEditingItem(undefined)}
          onSave={i=>{onSaveItem(i);setEditingItem(undefined);}}
          onDelete={id=>{onDeleteItem(id);setEditingItem(undefined);}}/>
      )}
      {inventoryFor && (
        <PlayerInventoryModal
          player={players.find(p=>p.id===inventoryFor.id)||inventoryFor}
          items={items} onClose={()=>setInventoryFor(null)}
          onSetItemQty={onSetItemQty}/>
      )}
      {liveAbilityPlayer && (
        <AbilityGrantModal
          player={liveAbilityPlayer}
          abilitySets={abilitySets}
          onClose={() => setGrantingAbilitiesFor(null)}
          onToggleGrant={onToggleGrantAbility}
          onSetMaxMana={onSetPlayerMaxMana}
        />
      )}
    </div>
  );
}

/* ============================================================
   PLAYER SIDE
   ============================================================ */

function PlayerPicker({ players, meta, onSelect, onJoinAsNew, live, onExit }) {
  const [joinName, setJoinName] = useState('');
  const submitJoin = () => {
    if (!joinName.trim()) return;
    onJoinAsNew(joinName.trim());
    setJoinName('');
  };
  return (
    <div className="rf-page">
      <TopHeader meta={meta} role="player" playerName="Choose your character" onExit={onExit} onRefresh={() => {}} live={live} />
      <div>
        <div className="rf-section-header"><h2 className="rf-section-title">Who are you?</h2></div>
        {players.length === 0 ? (
          <div className="rf-empty-state">No players in this campaign yet. Type your name below to join.</div>
        ) : (
          <div className="rf-picker-grid">
            {players.map((p) => (
              <button key={p.id} className="rf-picker-card" onClick={() => onSelect(p.id)}>
                <Shield size={20} />
                <span>{p.name}</span>
              </button>
            ))}
          </div>
        )}
        <div className="rf-card" style={{ marginTop: 18, maxWidth: 420 }}>
          <label className="rf-label" style={{ marginTop: 0 }}>Not on the list?</label>
          <div style={{ display: 'flex', gap: 10 }}>
            <input
              className="rf-input"
              placeholder="Your character's name"
              value={joinName}
              onChange={(e) => setJoinName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') submitJoin(); }}
            />
            <button className="rf-btn-primary" onClick={submitJoin}>Join</button>
          </div>
        </div>
      </div>
    </div>
  );
}


/* ============================================================
   PLAYER NOTEPAD
   ============================================================ */

function PlayerNotepad({ player, onSave }) {
  const [text, setText] = useState(player.notes || '');
  const [status, setStatus] = useState('saved');
  const timer = useRef(null);

  useEffect(() => {
    setText(player.notes || '');
    setStatus('saved');
  }, [player.id]);

  const handleChange = (e) => {
    const val = e.target.value;
    setText(val);
    setStatus('unsaved');
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      onSave(player.id, val);
      setStatus('saved');
    }, 700);
  };

  return (
    <div className="rf-notepad">
      <div className="rf-notepad-header">
        <div className="rf-notepad-title">📝 My Notes</div>
        <div className="rf-notepad-saved" style={{ opacity: status === 'saved' ? 1 : 0.4 }}>
          {status === 'saved' ? '✓ Saved' : 'Saving…'}
        </div>
      </div>
      <textarea
        className="rf-notepad-area"
        value={text}
        onChange={handleChange}
        placeholder="Jot anything down — quest clues, NPC names, loot lists… only you can see this."
      />
    </div>
  );
}

function PlayerDashboard({ meta, trees, players, abilitySets, items, vttState, currentPlayerId, live, onSelectPlayer, onJoinAsNew, onToggleEquip, onAdjustMana, onUseAbility, onMoveToken, onSaveNotes, onExit, onRefresh }) {
  const [selected, setSelected] = useState(null);
  const player = players.find((p) => p.id === currentPlayerId);

  if (!player) {
    return <PlayerPicker players={players} meta={meta} onSelect={onSelectPlayer} onJoinAsNew={onJoinAsNew} live={live} onExit={onExit} />;
  }

  const maxSlots = meta.max_equip_slots ?? 5;
  const unlocked = player.unlocked_runes || [];
  const equipped = player.equipped_runes || [];
  const maxMana = player.max_mana ?? 10;
  const currentMana = Math.min(player.current_mana ?? maxMana, maxMana);
  const grantedAbilitySets = abilitySets
    .map(s => ({ ...s, abilities: (s.abilities || []).filter(ab => (player.granted_abilities || []).includes(ab.id)) }))
    .filter(s => s.abilities.length > 0);
  const equippedRuneObjs = trees.flatMap((t) =>
    (t.runes || []).filter((r) => equipped.includes(r.id)).map((r) => ({ ...r, _tree: t }))
  );

  const handleRuneClick = (rune, tree, status) => {
    setSelected({ rune, tree });
    if (status === 'locked') return;
    onToggleEquip(player.id, rune.id);
  };

  return (
    <div className="rf-page">
      <TopHeader meta={meta} role="player" playerName={player.name} onExit={onExit} onRefresh={onRefresh} onSwitchPlayer={() => onSelectPlayer(null)} live={live} />
      <div>
        <div className="rf-loadout">
          <div className="rf-loadout-header">
            <div className="rf-loadout-title">Current Loadout</div>
            <div className="rf-loadout-count">{equipped.length}{maxSlots > 0 ? `/${maxSlots}` : ''} equipped</div>
          </div>
          {equippedRuneObjs.length === 0 ? (
            <div className="rf-empty-mini">No runes equipped yet. Click an unlocked rune below to equip it.</div>
          ) : (
            <div className="rf-loadout-list">
              {equippedRuneObjs.map((r) => {
                const tc = (TREE_COLORS[r._tree.color] || TREE_COLORS.gold).hex;
                return (
                  <div className="rf-loadout-item" key={r.id} style={{ '--tc': tc }}>
                    <span>{r._tree.icon}</span>
                    <div>
                      <div className="rf-loadout-item-name">{r.name}</div>
                      {r.effect && <div className="rf-loadout-item-effect">{r.effect}</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {maxMana > 0 && (
          <ManaBar
            currentMana={currentMana}
            maxMana={maxMana}
            onAdjust={delta => onAdjustMana(player.id, delta)}
            onRestore={() => onAdjustMana(player.id, maxMana - currentMana)}
          />
        )}

        <PlayerInventorySection player={player} items={items}/>
        <PlayerVTTSection vttState={vttState} currentPlayerId={currentPlayerId} onMoveToken={onMoveToken}/>
        {grantedAbilitySets.length > 0 && (
          <div className="rf-abilities-wrap">
            <div className="rf-section-header" style={{ marginBottom: 14 }}>
              <h2 className="rf-section-title" style={{ fontSize: 16 }}><Zap size={16} style={{ display:'inline', verticalAlign:'middle', marginRight:6 }} />Abilities</h2>
            </div>
            {grantedAbilitySets.map(s => {
              const color = TREE_COLORS[s.color] || TREE_COLORS.violet;
              return (
                <div key={s.id} className="rf-ability-set-block">
                  <div className="rf-ability-set-head">
                    <div className="rf-ability-set-dot" style={{ background: color.hex }} />
                    <div>
                      <div className="rf-ability-set-label">{s.icon} {s.name}</div>
                      {s.description && <div className="rf-ability-set-desc">{s.description}</div>}
                    </div>
                  </div>
                  <div className="rf-ability-items">
                    {s.abilities.map(ab => (
                      <AbilityItem key={ab.id} ability={ab} currentMana={currentMana}
                        onUse={() => onUseAbility(player.id, ab)} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {trees.length === 0 ? (
          <div className="rf-empty-state">Your DM hasn't created any rune paths yet. Check back later.</div>
        ) : (
          trees.map((tree) => (
            <RuneTreeView
              key={tree.id}
              tree={tree}
              mode="equip"
              unlockedIds={unlocked}
              equippedIds={equipped}
              selectedRuneId={selected ? selected.rune.id : null}
              onRuneClick={handleRuneClick}
            />
          ))
        )}
        {selected && <DetailPanel rune={selected.rune} tree={selected.tree} />}
        <PlayerNotepad player={player} onSave={onSaveNotes}/>
      </div>
    </div>
  );
}

/* ============================================================
   LOGIN / SETUP
   ============================================================ */

function DMPasscodeForm({ meta, onSuccess, onBack }) {
  const [val, setVal] = useState('');
  const [err, setErr] = useState(false);
  const submit = () => {
    if (val === meta.dm_passcode) onSuccess();
    else setErr(true);
  };
  return (
    <div className="rf-passcode-form">
      <label className="rf-label">DM Passcode</label>
      <input
        className="rf-input"
        type="password"
        autoFocus
        value={val}
        onChange={(e) => { setVal(e.target.value); setErr(false); }}
        onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
      />
      {err && <div className="rf-error">Incorrect passcode.</div>}
      <div className="rf-passcode-actions">
        <button className="rf-btn-ghost" onClick={onBack}>Back</button>
        <button className="rf-btn-primary" onClick={submit}>Enter</button>
      </div>
    </div>
  );
}

function LoginScreen({ meta, onChooseDM, onChoosePlayer }) {
  const [showPasscode, setShowPasscode] = useState(false);
  return (
    <div className="rf-center">
      <div className="rf-login-card">
        <div className="rf-login-title">{meta.campaign_name}</div>
        <div className="rf-login-sub">A rune system for your table</div>
        {!showPasscode ? (
          <div className="rf-login-choices">
            <button className="rf-choice-card" onClick={() => setShowPasscode(true)}>
              <Crown size={26} />
              <div className="rf-choice-title">I'm the Dungeon Master</div>
              <div className="rf-choice-sub">Manage rune paths and unlock runes for your players</div>
            </button>
            <button className="rf-choice-card" onClick={onChoosePlayer}>
              <Shield size={26} />
              <div className="rf-choice-title">I'm a Player</div>
              <div className="rf-choice-sub">View and equip the runes your DM has unlocked for you</div>
            </button>
          </div>
        ) : (
          <DMPasscodeForm meta={meta} onSuccess={onChooseDM} onBack={() => setShowPasscode(false)} />
        )}
      </div>
    </div>
  );
}

function SetupScreen({ onCreate, onShowJoin, onBack, creating, createErr }) {
  const [campaignName, setCampaignName] = useState('');
  const [passcode, setPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [err, setErr] = useState('');

  const submit = () => {
    if (!campaignName.trim()) { setErr('Give your campaign a name.'); return; }
    if (!passcode.trim()) { setErr('Choose a DM passcode.'); return; }
    if (passcode !== confirmPasscode) { setErr('Passcodes do not match.'); return; }
    setErr('');
    onCreate(campaignName.trim(), passcode.trim());
  };

  return (
    <div className="rf-center">
      <div className="rf-login-card">
        <div className="rf-login-title">Forge a Rune System</div>
        <div className="rf-login-sub">Create your campaign once, then share the link with your players. Everything syncs live.</div>
        <div className="rf-setup-form">
          <label className="rf-label">Campaign name</label>
          <input className="rf-input" value={campaignName} onChange={(e) => setCampaignName(e.target.value)} placeholder="e.g. The Sundered Coast" />
          <label className="rf-label">DM passcode</label>
          <input className="rf-input" type="password" value={passcode} onChange={(e) => setPasscode(e.target.value)} placeholder="Only you should know this" />
          <label className="rf-label">Confirm passcode</label>
          <input
            className="rf-input"
            type="password"
            value={confirmPasscode}
            onChange={(e) => setConfirmPasscode(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
          />
          {(err || createErr) && <div className="rf-error">{err || createErr}</div>}
          <button className="rf-btn-primary" style={{ marginTop: 14, width: '100%' }} onClick={submit} disabled={creating}>
            {creating ? 'Forging…' : 'Create Campaign'}
          </button>
          <button className="rf-btn-ghost" style={{ marginTop: 10, width: '100%' }} onClick={onShowJoin}>
            I already have a campaign link
          </button>
          {onBack && (
            <button className="rf-btn-ghost" style={{ marginTop: 6, width: '100%' }} onClick={onBack}>
              ← Back to campaign list
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function LobbyBrowser({ onSelectCampaign, onCreate, onShowJoin }) {
  const [campaigns, setCampaigns] = useState([]);
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const [{ data: campaignRows, error: campaignErr }, { data: playerRows, error: playerErr }] = await Promise.all([
          supabase.from('campaigns').select('id, campaign_name').order('campaign_name', { ascending: true }),
          supabase.from('players').select('campaign_id'),
        ]);
        if (campaignErr) throw campaignErr;
        if (playerErr) throw playerErr;
        if (!active) return;

        setCampaigns(campaignRows || []);
        const tally = {};
        (playerRows || []).forEach((p) => { tally[p.campaign_id] = (tally[p.campaign_id] || 0) + 1; });
        setCounts(tally);
        setErr('');
      } catch (e) {
        console.error(e);
        if (active) setErr('Could not load the campaign list. Check your connection and Supabase setup.');
      } finally {
        if (active) setLoading(false);
      }
    }

    load();

    // Keep the lobby list live: new campaigns appear, deleted ones vanish, player counts update.
    const channel = supabase
      .channel('lobby-browser')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'campaigns' }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'players' }, load)
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="rf-center">
      <div className="rf-login-card" style={{ maxWidth: 520 }}>
        <div className="rf-login-title">Rune Forge</div>
        <div className="rf-login-sub">Browse open campaigns below, or start your own.</div>

        <button className="rf-btn-primary" style={{ width: '100%', marginBottom: 18 }} onClick={onCreate}>
          <Plus size={15} /> Create New Campaign
        </button>

        <div className="rf-label" style={{ marginTop: 0 }}>Open Campaigns</div>
        {loading && <div className="rf-empty-mini">Loading campaigns…</div>}
        {err && <div className="rf-error">{err}</div>}
        {!loading && !err && campaigns.length === 0 && (
          <div className="rf-empty-state">No campaigns yet. Be the first to create one.</div>
        )}
        {!loading && campaigns.length > 0 && (
          <div className="rf-lobby-list">
            {campaigns.map((c) => (
              <button key={c.id} className="rf-lobby-row" onClick={() => onSelectCampaign(c.id)}>
                <div>
                  <div className="rf-lobby-row-name">{c.campaign_name}</div>
                  <div className="rf-lobby-row-id">{c.id}</div>
                </div>
                <div className="rf-lobby-row-count"><Users size={13} /> {counts[c.id] || 0}</div>
              </button>
            ))}
          </div>
        )}

        <button className="rf-btn-ghost" style={{ marginTop: 16, width: '100%' }} onClick={onShowJoin}>
          Have a direct campaign link instead?
        </button>
      </div>
    </div>
  );
}

function JoinScreen({ onJoin, onBack, joinErr, joining }) {
  const [campaignIdInput, setCampaignIdInput] = useState('');
  const submit = () => {
    if (!campaignIdInput.trim()) return;
    onJoin(campaignIdInput.trim());
  };
  return (
    <div className="rf-center">
      <div className="rf-login-card">
        <div className="rf-login-title">Join a Campaign</div>
        <div className="rf-login-sub">Paste the campaign ID your DM shared with you.</div>
        <div className="rf-join-form">
          <label className="rf-label">Campaign ID</label>
          <input
            className="rf-input"
            value={campaignIdInput}
            onChange={(e) => setCampaignIdInput(e.target.value)}
            placeholder="e.g. sundered-coast-x7k2"
            onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
            autoFocus
          />
          {joinErr && <div className="rf-error">{joinErr}</div>}
          <div className="rf-passcode-actions">
            <button className="rf-btn-ghost" onClick={onBack}>Back</button>
            <button className="rf-btn-primary" onClick={submit} disabled={joining}>{joining ? 'Looking…' : 'Continue'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   ROOT
   ============================================================ */

const STARTER_TREE = () => ({
  id: uid('tree'),
  name: 'Elemental Mastery',
  color: 'crimson',
  icon: '🔥',
  description: 'An example path — edit or delete this to make it your own.',
  tier_count: 2,
  runes: [
    { id: uid('rune'), name: 'Ember Touch', tier: 1, effect: '+1d4 fire damage on your next attack, once per short rest', description: 'A faint heat lingers in the fingertips of those who carry this rune.' },
    { id: uid('rune'), name: 'Frostward', tier: 1, effect: 'Resistance to cold damage for 1 minute, once per long rest', description: 'Carved from a shard of glacier that never fully melts.' },
    { id: uid('rune'), name: 'Wildfire Heart', tier: 2, effect: 'Once per long rest, add +2 to a damage roll', description: 'Said to beat in time with a forest fire.' },
  ],
});

function getCampaignIdFromUrl() {
  try {
    return new URLSearchParams(window.location.search).get('c');
  } catch {
    return null;
  }
}

function setCampaignIdInUrl(campaignId) {
  try {
    const url = new URL(window.location.href);
    url.searchParams.set('c', campaignId);
    window.history.replaceState({}, '', url.toString());
  } catch {
    /* no-op in non-browser environments */
  }
}

function buildShareUrl(campaignId) {
  try {
    const url = new URL(window.location.href);
    url.searchParams.set('c', campaignId);
    return url.toString();
  } catch {
    return campaignId;
  }
}

export default function App() {
  const [campaignId, setCampaignId] = useState(null);
  const [meta, setMeta] = useState(null);
  const [trees, setTrees] = useState([]);
  const [players, setPlayers] = useState([]);
  const [abilitySets, setAbilitySets] = useState([]);
  const [items, setItems] = useState([]);
  const [vttState, setVttState] = useState({ map_image: null, tokens: [] });
  const [currentPlayerId, setCurrentPlayerId] = useState(null);
  const [phase, setPhase] = useState('loading'); // loading | home | setup | join | login | dm | player
  const [live, setLive] = useState(false);
  const [toast, setToast] = useState(null);
  const [creating, setCreating] = useState(false);
  const [createErr, setCreateErr] = useState('');
  const [joining, setJoining] = useState(false);
  const [joinErr, setJoinErr] = useState('');

  const showToast = (msg) => setToast(msg);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  /* ---- bootstrap: read campaign id from URL on first load ---- */
  useEffect(() => {
    const idFromUrl = getCampaignIdFromUrl();
    if (idFromUrl) {
      openCampaign(idFromUrl);
    } else {
      setPhase('home');
    }
  }, []);

  /* ---- load a campaign's data and switch into its login screen ---- */
  const openCampaign = useCallback(async (id) => {
    setPhase('loading');
    try {
      const campaign = await fetchCampaign(id);
      if (!campaign) {
        setJoinErr('No campaign found with that ID.');
        setPhase('join');
        return;
      }
      const [treeRows, playerRows, abilitySetRows, itemRows, vttRow] = await Promise.all([fetchTrees(id), fetchPlayers(id), fetchAbilitySets(id), fetchItems(id), fetchVttState(id)]);
      setCampaignId(id);
      setMeta(campaign);
      setTrees(treeRows);
      setPlayers(playerRows);
      setAbilitySets(abilitySetRows);
      setItems(itemRows);
      setVttState(vttRow || { map_image: null, tokens: [] });
      setCampaignIdInUrl(id);
      const savedPlayerId = window.localStorage ? window.localStorage.getItem(`rf-player-${id}`) : null;
      if (savedPlayerId) setCurrentPlayerId(savedPlayerId);
      setPhase('login');
    } catch (e) {
      console.error(e);
      setJoinErr('Could not reach the campaign database. Check your connection and try again.');
      setPhase('join');
    }
  }, []);

  /* ---- realtime subscriptions, live for the duration of an open campaign ---- */
  useEffect(() => {
    if (!campaignId) return;

    const treesChannel = supabase
      .channel(`rune_trees-${campaignId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rune_trees', filter: `campaign_id=eq.${campaignId}` }, (payload) => {
        setTrees((prev) => {
          if (payload.eventType === 'DELETE') return prev.filter((t) => t.id !== payload.old.id);
          const row = payload.new;
          const exists = prev.some((t) => t.id === row.id);
          return exists ? prev.map((t) => (t.id === row.id ? row : t)) : [...prev, row];
        });
      })
      .subscribe((status) => setLive(status === 'SUBSCRIBED'));

    const playersChannel = supabase
      .channel(`players-${campaignId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'players', filter: `campaign_id=eq.${campaignId}` }, (payload) => {
        setPlayers((prev) => {
          if (payload.eventType === 'DELETE') return prev.filter((p) => p.id !== payload.old.id);
          const row = payload.new;
          const exists = prev.some((p) => p.id === row.id);
          return exists ? prev.map((p) => (p.id === row.id ? row : p)) : [...prev, row];
        });
      })
      .subscribe();

    const campaignChannel = supabase
      .channel(`campaigns-${campaignId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'campaigns', filter: `id=eq.${campaignId}` }, (payload) => {
        if (payload.eventType === 'DELETE') {
          showToast('This campaign was deleted.');
          handleExit();
          return;
        }
        setMeta(payload.new);
      })
      .subscribe();

    const abilitySetsChannel = supabase
      .channel(`ability_sets-${campaignId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ability_sets', filter: `campaign_id=eq.${campaignId}` }, (payload) => {
        setAbilitySets((prev) => {
          if (payload.eventType === 'DELETE') return prev.filter((s) => s.id !== payload.old.id);
          const row = payload.new;
          const exists = prev.some((s) => s.id === row.id);
          return exists ? prev.map((s) => (s.id === row.id ? row : s)) : [...prev, row];
        });
      })
      .subscribe();

    const itemsChannel = supabase.channel(`items-${campaignId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'items', filter: `campaign_id=eq.${campaignId}` }, payload => {
        setItems(prev => {
          if (payload.eventType === 'DELETE') return prev.filter(i => i.id !== payload.old.id);
          const row = payload.new;
          return prev.some(i => i.id === row.id) ? prev.map(i => i.id===row.id ? row : i) : [...prev, row];
        });
      }).subscribe();
    const vttChannel = supabase.channel(`vtt-${campaignId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vtt_state', filter: `campaign_id=eq.${campaignId}` }, payload => {
        if (payload.new) setVttState(payload.new);
      }).subscribe();
    return () => {
      supabase.removeChannel(treesChannel);
      supabase.removeChannel(playersChannel);
      supabase.removeChannel(campaignChannel);
      supabase.removeChannel(abilitySetsChannel);
      supabase.removeChannel(itemsChannel);
      supabase.removeChannel(vttChannel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId]);

  const refreshNow = async () => {
    if (!campaignId) return;
    try {
      const [t, p, c, ab, it, vtt] = await Promise.all([fetchTrees(campaignId), fetchPlayers(campaignId), fetchCampaign(campaignId), fetchAbilitySets(campaignId), fetchItems(campaignId), fetchVttState(campaignId)]);
      setTrees(t);
      setPlayers(p);
      setAbilitySets(ab);
      if (c) setMeta(c);
    } catch (e) {
      console.error(e);
      showToast('Could not refresh — check your connection.');
    }
  };

  /* ---- create / join ---- */

  const handleCreateCampaign = async (campaignName, passcode) => {
    setCreating(true);
    setCreateErr('');
    try {
      const id = campaignSlug(campaignName);
      const newMeta = { id, campaign_name: campaignName, dm_passcode: passcode, max_equip_slots: 5 };
      const { error: campaignError } = await supabase.from('campaigns').insert([newMeta]);
      if (campaignError) throw campaignError;

      const starterTree = STARTER_TREE();
      const { error: treeError } = await supabase.from('rune_trees').insert([{ ...starterTree, campaign_id: id }]);
      if (treeError) throw treeError;

      setCampaignId(id);
      setMeta(newMeta);
      setTrees([{ ...starterTree, campaign_id: id }]);
      setPlayers([]);
      setCampaignIdInUrl(id);
      setPhase('login');
    } catch (e) {
      console.error(e);
      setCreateErr('Could not create the campaign. Make sure your Supabase tables are set up, then try again.');
    } finally {
      setCreating(false);
    }
  };

  const handleJoinCampaign = async (id) => {
    setJoining(true);
    setJoinErr('');
    await openCampaign(id);
    setJoining(false);
  };

  /* ---- DM actions (writes go to Supabase; local state updates on the realtime echo,
          but we also optimistically update so the DM's own screen feels instant) ---- */

  const handleSaveTree = async (treeObj) => {
    const exists = trees.some((t) => t.id === treeObj.id);
    const row = { ...treeObj, campaign_id: campaignId };
    setTrees((prev) => (exists ? prev.map((t) => (t.id === row.id ? row : t)) : [...prev, row]));
    const { error } = await supabase.from('rune_trees').upsert([row], { onConflict: 'id' });
    if (error) { console.error(error); showToast('Failed to save rune path.'); }
  };

  const handleDeleteTree = async (treeId) => {
    const dead = trees.find((t) => t.id === treeId);
    const runeIds = new Set((dead ? dead.runes : []).map((r) => r.id));
    setTrees((prev) => prev.filter((t) => t.id !== treeId));

    const { error } = await supabase.from('rune_trees').delete().eq('id', treeId);
    if (error) { console.error(error); showToast('Failed to delete rune path.'); return; }

    // strip the deleted runes from every player who had them
    const affected = players.filter((p) =>
      (p.unlocked_runes || []).some((id) => runeIds.has(id)) || (p.equipped_runes || []).some((id) => runeIds.has(id))
    );
    await Promise.all(affected.map((p) => {
      const unlocked_runes = (p.unlocked_runes || []).filter((id) => !runeIds.has(id));
      const equipped_runes = (p.equipped_runes || []).filter((id) => !runeIds.has(id));
      setPlayers((prev) => prev.map((x) => (x.id === p.id ? { ...x, unlocked_runes, equipped_runes } : x)));
      return supabase.from('players').update({ unlocked_runes, equipped_runes }).eq('id', p.id);
    }));
  };

  const handleAddPlayer = async (name) => {
    const newPlayer = { id: uid('player'), campaign_id: campaignId, name, unlocked_runes: [], equipped_runes: [], granted_abilities: [], max_mana: 10, current_mana: 10, inventory: [] };
    setPlayers((prev) => [...prev, newPlayer]);
    const { error } = await supabase.from('players').insert([newPlayer]);
    if (error) { console.error(error); showToast('Failed to add player.'); }
  };

  const handleDeletePlayer = async (id) => {
    setPlayers((prev) => prev.filter((p) => p.id !== id));
    if (currentPlayerId === id) setCurrentPlayerId(null);
    const { error } = await supabase.from('players').delete().eq('id', id);
    if (error) { console.error(error); showToast('Failed to remove player.'); }
  };

  const handleToggleUnlock = async (playerId, runeId) => {
    const player = players.find((p) => p.id === playerId);
    if (!player) return;
    const has = (player.unlocked_runes || []).includes(runeId);
    const unlocked_runes = has
      ? (player.unlocked_runes || []).filter((id) => id !== runeId)
      : [...(player.unlocked_runes || []), runeId];
    const equipped_runes = has
      ? (player.equipped_runes || []).filter((id) => id !== runeId)
      : (player.equipped_runes || []);
    setPlayers((prev) => prev.map((p) => (p.id === playerId ? { ...p, unlocked_runes, equipped_runes } : p)));
    const { error } = await supabase.from('players').update({ unlocked_runes, equipped_runes }).eq('id', playerId);
    if (error) { console.error(error); showToast('Failed to update rune.'); }
  };

  const handleToggleEquip = async (playerId, runeId) => {
    const player = players.find((p) => p.id === playerId);
    if (!player || !(player.unlocked_runes || []).includes(runeId)) return;
    const isEquipped = (player.equipped_runes || []).includes(runeId);
    const maxSlots = meta ? (meta.max_equip_slots ?? 5) : 5;
    if (!isEquipped && maxSlots > 0 && (player.equipped_runes || []).length >= maxSlots) {
      showToast(`Max ${maxSlots} runes equipped. Unequip one first.`);
      return;
    }
    const equipped_runes = isEquipped
      ? (player.equipped_runes || []).filter((id) => id !== runeId)
      : [...(player.equipped_runes || []), runeId];
    setPlayers((prev) => prev.map((p) => (p.id === playerId ? { ...p, equipped_runes } : p)));
    const { error } = await supabase.from('players').update({ equipped_runes }).eq('id', playerId);
    if (error) { console.error(error); showToast('Failed to update loadout.'); }
  };


  const handleSaveAbilitySet = async (setObj) => {
    const exists = abilitySets.some((s) => s.id === setObj.id);
    const row = { ...setObj, campaign_id: campaignId };
    setAbilitySets((prev) => exists ? prev.map((s) => (s.id === row.id ? row : s)) : [...prev, row]);
    const { error } = await supabase.from('ability_sets').upsert([row], { onConflict: 'id' });
    if (error) { console.error(error); showToast('Failed to save ability set.'); }
  };

  const handleDeleteAbilitySet = async (setId) => {
    const dead = abilitySets.find((s) => s.id === setId);
    const abilityIds = new Set((dead ? dead.abilities : []).map((a) => a.id));
    setAbilitySets((prev) => prev.filter((s) => s.id !== setId));
    const { error } = await supabase.from('ability_sets').delete().eq('id', setId);
    if (error) { console.error(error); showToast('Failed to delete ability set.'); return; }
    const affected = players.filter((p) => (p.granted_abilities || []).some((id) => abilityIds.has(id)));
    await Promise.all(affected.map((p) => {
      const granted_abilities = (p.granted_abilities || []).filter((id) => !abilityIds.has(id));
      setPlayers((prev) => prev.map((x) => (x.id === p.id ? { ...x, granted_abilities } : x)));
      return supabase.from('players').update({ granted_abilities }).eq('id', p.id);
    }));
  };

  const handleToggleGrantAbility = async (playerId, abilityId) => {
    const player = players.find((p) => p.id === playerId);
    if (!player) return;
    const has = (player.granted_abilities || []).includes(abilityId);
    const granted_abilities = has
      ? (player.granted_abilities || []).filter((id) => id !== abilityId)
      : [...(player.granted_abilities || []), abilityId];
    setPlayers((prev) => prev.map((p) => (p.id === playerId ? { ...p, granted_abilities } : p)));
    const { error } = await supabase.from('players').update({ granted_abilities }).eq('id', playerId);
    if (error) { console.error(error); showToast('Failed to update ability.'); }
  };

  const handleSetPlayerMaxMana = async (playerId, max_mana) => {
    const player = players.find((p) => p.id === playerId);
    if (!player) return;
    const current_mana = Math.min(player.current_mana ?? max_mana, max_mana);
    setPlayers((prev) => prev.map((p) => (p.id === playerId ? { ...p, max_mana, current_mana } : p)));
    const { error } = await supabase.from('players').update({ max_mana, current_mana }).eq('id', playerId);
    if (error) { console.error(error); showToast('Failed to update mana.'); }
  };

  const handleAdjustMana = async (playerId, delta) => {
    const player = players.find((p) => p.id === playerId);
    if (!player) return;
    const max_mana = player.max_mana ?? 10;
    const current_mana = Math.max(0, Math.min(max_mana, (player.current_mana ?? max_mana) + delta));
    setPlayers((prev) => prev.map((p) => (p.id === playerId ? { ...p, current_mana } : p)));
    const { error } = await supabase.from('players').update({ current_mana }).eq('id', playerId);
    if (error) { console.error(error); showToast('Failed to update mana.'); }
  };

  const handleUseAbility = async (playerId, ability) => {
    const player = players.find((p) => p.id === playerId);
    if (!player) return;
    const max_mana = player.max_mana ?? 10;
    const cur = player.current_mana ?? max_mana;
    if (cur < ability.mana_cost) return;
    const current_mana = cur - ability.mana_cost;
    setPlayers((prev) => prev.map((p) => (p.id === playerId ? { ...p, current_mana } : p)));
    const { error } = await supabase.from('players').update({ current_mana }).eq('id', playerId);
    if (error) { console.error(error); showToast('Failed to use ability.'); return; }
    showToast(`\u{1F52E} Used ${ability.name} \u00B7 \u2212${ability.mana_cost} mana`);
  };


  /* ── ITEM HANDLERS ── */
  const handleSaveItem = async (itemObj) => {
    const row = { ...itemObj, campaign_id: campaignId };
    setItems(prev => prev.some(i=>i.id===row.id) ? prev.map(i=>i.id===row.id?row:i) : [...prev, row]);
    const { error } = await supabase.from('items').upsert([row], { onConflict: 'id' });
    if (error) { console.error(error); showToast('Failed to save item.'); }
  };
  const handleDeleteItem = async (itemId) => {
    setItems(prev => prev.filter(i=>i.id!==itemId));
    await supabase.from('items').delete().eq('id', itemId);
    const affected = players.filter(p=>(p.inventory||[]).some(e=>e.item_id===itemId));
    await Promise.all(affected.map(p => {
      const inventory = (p.inventory||[]).filter(e=>e.item_id!==itemId);
      setPlayers(prev => prev.map(x=>x.id===p.id?{...x,inventory}:x));
      return supabase.from('players').update({ inventory }).eq('id', p.id);
    }));
  };
  const handleSetItemQty = async (playerId, itemId, quantity) => {
    const player = players.find(p=>p.id===playerId);
    if (!player) return;
    const inventory = [...(player.inventory||[])];
    const idx = inventory.findIndex(e=>e.item_id===itemId);
    if (quantity <= 0) { if (idx>=0) inventory.splice(idx,1); }
    else if (idx>=0) { inventory[idx] = {...inventory[idx], quantity}; }
    else { inventory.push({ item_id:itemId, quantity }); }
    setPlayers(prev => prev.map(p=>p.id===playerId?{...p,inventory}:p));
    const { error } = await supabase.from('players').update({ inventory }).eq('id', playerId);
    if (error) { console.error(error); showToast('Failed to update inventory.'); }
  };

  /* ── VTT HANDLERS ── */
  const handleUploadMap = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    showToast('Compressing image…');
    try {
      const base64 = await compressImage(file);
      const newState = { campaign_id: campaignId, map_image: base64, tokens: vttState.tokens||[] };
      setVttState(newState);
      const { error } = await supabase.from('vtt_state').upsert([newState], { onConflict: 'campaign_id' });
      if (error) throw error;
      showToast('Map uploaded!');
    } catch (err) { console.error(err); showToast('Failed to upload map.'); }
    e.target.value = '';
  };
  const handleMoveToken = async (tokenId, x, y) => {
    const tokens = (vttState.tokens||[]).map(t=>t.id===tokenId?{...t,x,y}:t);
    setVttState(prev => ({ ...prev, tokens }));
    await supabase.from('vtt_state').update({ tokens }).eq('campaign_id', campaignId);
  };
  const handleAddToken = async (token) => {
    const tokens = [...(vttState.tokens||[]), token];
    const newState = { campaign_id: campaignId, map_image: vttState.map_image||null, tokens };
    setVttState(newState);
    const { error } = await supabase.from('vtt_state').upsert([newState], { onConflict: 'campaign_id' });
    if (error) { console.error(error); showToast('Failed to add token.'); }
  };
  const handleRemoveToken = async (tokenId) => {
    const tokens = (vttState.tokens||[]).filter(t=>t.id!==tokenId);
    setVttState(prev => ({ ...prev, tokens }));
    await supabase.from('vtt_state').update({ tokens }).eq('campaign_id', campaignId);
  };


  const handleSaveNotes = async (playerId, notes) => {
    setPlayers(prev => prev.map(p => p.id === playerId ? { ...p, notes } : p));
    await supabase.from('players').update({ notes }).eq('id', playerId);
  };

  const handleSaveMeta = async (newMeta) => {
    setMeta(newMeta);
    const { error } = await supabase
      .from('campaigns')
      .update({ campaign_name: newMeta.campaign_name, max_equip_slots: newMeta.max_equip_slots, dm_passcode: newMeta.dm_passcode })
      .eq('id', campaignId);
    if (error) { console.error(error); showToast('Failed to save settings.'); }
  };

  const handleReset = async () => {
    try {
      await supabase.from('players').delete().eq('campaign_id', campaignId);
      await supabase.from('rune_trees').delete().eq('campaign_id', campaignId);
      await supabase.from('ability_sets').delete().eq('campaign_id', campaignId);
      await supabase.from('items').delete().eq('campaign_id', campaignId);
      await supabase.from('vtt_state').delete().eq('campaign_id', campaignId);
      await supabase.from('campaigns').delete().eq('id', campaignId);
    } catch (e) {
      console.error(e);
    }
    handleExit();
  };

  /* ---- player identity ---- */

  const handleSelectPlayer = (id) => {
    setCurrentPlayerId(id);
    try {
      if (id) window.localStorage.setItem(`rf-player-${campaignId}`, id);
      else window.localStorage.removeItem(`rf-player-${campaignId}`);
    } catch {
      /* localStorage may be unavailable */
    }
  };

  const handleJoinAsNew = async (name) => {
    const existing = players.find((p) => p.name.toLowerCase() === name.toLowerCase());
    if (existing) {
      handleSelectPlayer(existing.id);
      return;
    }
    const newPlayer = { id: uid('player'), campaign_id: campaignId, name, unlocked_runes: [], equipped_runes: [], granted_abilities: [], max_mana: 10, current_mana: 10, inventory: [] };
    setPlayers((prev) => [...prev, newPlayer]);
    const { error } = await supabase.from('players').insert([newPlayer]);
    if (error) { console.error(error); showToast('Failed to join. Try again.'); return; }
    handleSelectPlayer(newPlayer.id);
  };

  /* ---- navigation ---- */

  const handleExit = () => {
    setCampaignId(null);
    setMeta(null);
    setTrees([]);
    setPlayers([]);
    setCurrentPlayerId(null);
    setCreateErr('');
    setJoinErr('');
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('c');
      window.history.replaceState({}, '', url.toString());
    } catch {
      /* no-op */
    }
    setPhase('home');
  };

  const shareUrl = campaignId ? buildShareUrl(campaignId) : '';

  return (
    <div className="rf-root">
      <style>{CSS}</style>
      {toast && <div className="rf-toast">{toast}</div>}

      {phase === 'loading' && <div className="rf-center"><div className="rf-loading">Unsealing the rune vault…</div></div>}

      {phase === 'home' && (
        <LobbyBrowser
          onSelectCampaign={openCampaign}
          onCreate={() => { setCreateErr(''); setPhase('setup'); }}
          onShowJoin={() => { setJoinErr(''); setPhase('join'); }}
        />
      )}

      {phase === 'setup' && (
        <SetupScreen
          onCreate={handleCreateCampaign}
          onShowJoin={() => { setJoinErr(''); setPhase('join'); }}
          onBack={() => setPhase('home')}
          creating={creating}
          createErr={createErr}
        />
      )}

      {phase === 'join' && (
        <JoinScreen onJoin={handleJoinCampaign} onBack={() => setPhase('home')} joinErr={joinErr} joining={joining} />
      )}

      {phase === 'login' && meta && (
        <LoginScreen meta={meta} onChooseDM={() => setPhase('dm')} onChoosePlayer={() => setPhase('player')} />
      )}

      {phase === 'dm' && meta && (
        <DMDashboard
          meta={meta}
          shareUrl={shareUrl}
          trees={trees}
          players={players}
          abilitySets={abilitySets}
          items={items}
          vttState={vttState}
          live={live}
          onSaveTree={handleSaveTree}
          onDeleteTree={handleDeleteTree}
          onAddPlayer={handleAddPlayer}
          onDeletePlayer={handleDeletePlayer}
          onToggleUnlock={handleToggleUnlock}
          onSaveAbilitySet={handleSaveAbilitySet}
          onDeleteAbilitySet={handleDeleteAbilitySet}
          onToggleGrantAbility={handleToggleGrantAbility}
          onSetPlayerMaxMana={handleSetPlayerMaxMana}
          onSaveItem={handleSaveItem}
          onDeleteItem={handleDeleteItem}
          onSetItemQty={handleSetItemQty}
          onUploadMap={handleUploadMap}
          onMoveToken={handleMoveToken}
          onAddToken={handleAddToken}
          onRemoveToken={handleRemoveToken}
          onSaveMeta={handleSaveMeta}
          onExit={handleExit}
          onReset={handleReset}
          onRefresh={refreshNow}
        />
      )}

      {phase === 'player' && meta && (
        <PlayerDashboard
          meta={meta}
          trees={trees}
          players={players}
          abilitySets={abilitySets}
          items={items}
          vttState={vttState}
          currentPlayerId={currentPlayerId}
          live={live}
          onSelectPlayer={handleSelectPlayer}
          onJoinAsNew={handleJoinAsNew}
          onToggleEquip={handleToggleEquip}
          onAdjustMana={handleAdjustMana}
          onUseAbility={handleUseAbility}
          onMoveToken={handleMoveToken}
          onSaveNotes={handleSaveNotes}
          onExit={handleExit}
          onRefresh={refreshNow}
        />
      )}
    </div>
  );
}
