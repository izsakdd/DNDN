import React, { useState, useEffect } from 'react';
import { Crown, Shield, Lock, Sparkles, Plus, Trash2, X, Check, Settings, Users, RefreshCw, LogOut, ScrollText } from 'lucide-react';

/* ---------- constants & storage helpers ---------- */

const TREE_COLORS = {
  gold:    { name: 'Gold',    hex: '#d4a843', rgb: '212,168,67' },
  crimson: { name: 'Crimson', hex: '#c4453c', rgb: '196,69,60' },
  azure:   { name: 'Azure',   hex: '#3d8fc4', rgb: '61,143,196' },
  violet:  { name: 'Violet',  hex: '#8b5fbf', rgb: '139,95,191' },
  emerald: { name: 'Emerald', hex: '#4f9d6e', rgb: '79,157,110' },
  silver:  { name: 'Silver',  hex: '#9aa5b8', rgb: '154,165,184' },
};

const ICONS = ['⚔️','🔥','❄️','🌿','🛡️','✨','💀','🌙','☀️','🩸','🕸️','👁️','⚡','🌊','🪨','🦴'];

const META_KEY = 'campaign-meta';
const TREES_KEY = 'campaign-trees';
const PLAYERS_KEY = 'campaign-players';

function uid(prefix) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

async function getKey(key) {
  try {
    const res = await window.storage.get(key, true);
    return res ? JSON.parse(res.value) : null;
  } catch (e) {
    return null;
  }
}
async function setKey(key, value) {
  try {
    await window.storage.set(key, JSON.stringify(value), true);
    return true;
  } catch (e) {
    return false;
  }
}

/* ---------- styles ---------- */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');

.rf-root {
  --bg: #14171f;
  --surface: #1c212d;
  --surface-2: #262c3a;
  --border: #383f52;
  --text: #e9e3d6;
  --text-muted: #8b8fa3;
  --gold: #d4a843;
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
.rf-root input, .rf-root textarea { font-family: inherit; }

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

.rf-passcode-form, .rf-setup-form { display: flex; flex-direction: column; gap: 4px; margin-top: 8px; }
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
.rf-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; padding-bottom: 16px; border-bottom: 1px solid var(--border); }
.rf-header-title { font-family: 'Cinzel', serif; font-weight: 700; font-size: 21px; }
.rf-header-sub { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--text-muted); margin-top: 3px; text-transform: uppercase; letter-spacing: .06em; }
.rf-header-actions { display: flex; align-items: center; gap: 8px; }

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

.rf-toast { position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%); background: var(--surface-2); border: 1px solid var(--gold); color: var(--text); padding: 11px 18px; border-radius: 10px; font-size: 13px; box-shadow: 0 10px 30px rgba(0,0,0,0.4); z-index: 100; max-width: 90vw; text-align: center; }

@media (max-width: 600px) {
  .rf-login-card { padding: 26px 20px; }
  .rf-page { padding: 16px 14px 50px; }
  .rf-rune-edit-row { grid-template-columns: 1fr; grid-template-areas: "name" "effect" "desc" "del"; }
  .rf-player-row-name { width: 100%; }
}
`;

/* ---------- small reusable pieces ---------- */

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
  const tiers = Array.from({ length: tree.tierCount || 1 }, (_, i) => i + 1);
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
          const runes = tree.runes.filter((r) => r.tier === tierNum);
          if (runes.length === 0) return null;
          return (
            <div className="rf-tier-row" key={tierNum}>
              <div className="rf-tier-label">Tier {tierNum}</div>
              <div className="rf-tier-nodes">
                {runes.map((rune) => {
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

function TopHeader({ meta, role, playerName, onExit, onRefresh, onSwitchPlayer }) {
  return (
    <div className="rf-header">
      <div>
        <div className="rf-header-title">{meta.campaignName}</div>
        <div className="rf-header-sub">
          {role === 'dm' ? <><Crown size={13} /> Dungeon Master</> : <><Shield size={13} /> {playerName}</>}
        </div>
      </div>
      <div className="rf-header-actions">
        <button className="rf-icon-btn" onClick={onRefresh} title="Refresh"><RefreshCw size={16} /></button>
        {role === 'player' && onSwitchPlayer && (
          <button className="rf-btn-ghost-sm" onClick={onSwitchPlayer}>Switch player</button>
        )}
        <button className="rf-icon-btn" onClick={onExit} title="Log out"><LogOut size={16} /></button>
      </div>
    </div>
  );
}

/* ---------- DM: tree editor ---------- */

function TreeEditorModal({ tree, onClose, onSave, onDelete }) {
  const isNew = !tree;
  const [name, setName] = useState(tree ? tree.name : '');
  const [color, setColor] = useState(tree ? tree.color : 'gold');
  const [icon, setIcon] = useState(tree ? tree.icon : ICONS[0]);
  const [description, setDescription] = useState(tree ? tree.description : '');
  const [tierCount, setTierCount] = useState(tree ? tree.tierCount : 2);
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
      tierCount,
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
            return (
              <div key={tree.id} className="rf-tree-card" style={{ '--tc': color.hex }} onClick={() => onOpenEditor(tree)}>
                <div className="rf-tree-card-icon">{tree.icon}</div>
                <div className="rf-tree-card-name">{tree.name}</div>
                <div className="rf-tree-card-meta">{tree.runes.length} rune{tree.runes.length !== 1 ? 's' : ''} · {tree.tierCount} tier{tree.tierCount !== 1 ? 's' : ''}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ---------- DM: players & rune granting ---------- */

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
          <p className="rf-modal-hint">Click a rune to grant or revoke it. Granted runes glow and become available for {player.name} to equip.</p>
          {trees.length === 0 && <div className="rf-empty-state">Create a rune path first.</div>}
          {trees.map((tree) => (
            <RuneTreeView
              key={tree.id}
              tree={tree}
              mode="grant"
              unlockedIds={player.unlocked}
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

function PlayersTab({ players, trees, onAddPlayer, onDeletePlayer, onOpenGrant }) {
  const [newName, setNewName] = useState('');
  const totalRunes = trees.reduce((sum, t) => sum + t.runes.length, 0);
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
        <div className="rf-empty-state">No players added yet. Add your party members so you can start unlocking runes for them.</div>
      ) : (
        <div className="rf-player-list">
          {players.map((p) => (
            <div key={p.id} className="rf-player-row">
              <div className="rf-player-row-name">{p.name}</div>
              <div className="rf-player-row-meta">{p.unlocked.length}/{totalRunes} unlocked · {p.equipped.length} equipped</div>
              <div className="rf-player-row-actions">
                <button className="rf-btn-ghost-sm" onClick={() => onOpenGrant(p)}><Sparkles size={13} /> Manage Runes</button>
                <DeleteConfirmButton onConfirm={() => onDeletePlayer(p.id)} label="remove" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SettingsTab({ meta, onSave, onExit, onReset }) {
  const [campaignName, setCampaignName] = useState(meta.campaignName);
  const [maxSlots, setMaxSlots] = useState(meta.maxEquipSlots ?? 5);
  const [newPasscode, setNewPasscode] = useState('');
  const [savedFlash, setSavedFlash] = useState(false);

  const save = () => {
    onSave({
      ...meta,
      campaignName: campaignName.trim() || meta.campaignName,
      maxEquipSlots: Math.max(0, Number(maxSlots) || 0),
      dmPasscode: newPasscode.trim() ? newPasscode.trim() : meta.dmPasscode,
    });
    setNewPasscode('');
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 2000);
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
        <div className="rf-hint">Send this same artifact link to your players. They'll choose "I'm a Player" and pick their name from the list — no passcode needed.</div>
      </div>

      <div className="rf-card rf-settings-card rf-settings-danger" style={{ marginTop: 18 }}>
        <div className="rf-label" style={{ marginTop: 0 }}>Danger zone</div>
        <div className="rf-hint" style={{ marginBottom: 10 }}>This permanently deletes all rune paths, players, and progress.</div>
        <DeleteConfirmButton onConfirm={onReset} label="reset entire campaign" />
      </div>

      <button className="rf-btn-ghost" style={{ marginTop: 18 }} onClick={onExit}><LogOut size={14} /> Exit DM mode</button>
    </div>
  );
}

function DMDashboard({ meta, trees, players, onSaveTree, onDeleteTree, onAddPlayer, onDeletePlayer, onToggleUnlock, onSaveMeta, onExit, onReset, onRefresh, setModalOpen }) {
  const [tab, setTab] = useState('trees');
  const [editingTree, setEditingTree] = useState(undefined);
  const [grantingPlayer, setGrantingPlayer] = useState(null);

  useEffect(() => {
    setModalOpen(editingTree !== undefined || grantingPlayer !== null);
  }, [editingTree, grantingPlayer]);

  const livePlayer = grantingPlayer ? (players.find((p) => p.id === grantingPlayer.id) || grantingPlayer) : null;

  return (
    <div className="rf-page">
      <TopHeader meta={meta} role="dm" onExit={onExit} onRefresh={onRefresh} />
      <div className="rf-tabs">
        <button className={`rf-tab${tab === 'trees' ? ' rf-tab--active' : ''}`} onClick={() => setTab('trees')}><ScrollText size={15} /> Rune Paths</button>
        <button className={`rf-tab${tab === 'players' ? ' rf-tab--active' : ''}`} onClick={() => setTab('players')}><Users size={15} /> Players</button>
        <button className={`rf-tab${tab === 'settings' ? ' rf-tab--active' : ''}`} onClick={() => setTab('settings')}><Settings size={15} /> Settings</button>
      </div>
      <div>
        {tab === 'trees' && <TreesTab trees={trees} onOpenEditor={setEditingTree} />}
        {tab === 'players' && <PlayersTab players={players} trees={trees} onAddPlayer={onAddPlayer} onDeletePlayer={onDeletePlayer} onOpenGrant={setGrantingPlayer} />}
        {tab === 'settings' && <SettingsTab meta={meta} onSave={onSaveMeta} onExit={onExit} onReset={onReset} />}
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
    </div>
  );
}

/* ---------- Player side ---------- */

function PlayerPicker({ players, meta, onSelect, onExit }) {
  return (
    <div className="rf-page">
      <TopHeader meta={meta} role="player" playerName="Choose your character" onExit={onExit} onRefresh={() => {}} />
      <div>
        <div className="rf-section-header"><h2 className="rf-section-title">Who are you?</h2></div>
        {players.length === 0 ? (
          <div className="rf-empty-state">Your DM hasn't added any players yet. Ask them to add you from the Players tab.</div>
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
      </div>
    </div>
  );
}

function PlayerDashboard({ meta, trees, players, currentPlayerId, onSelectPlayer, onToggleEquip, onExit, onRefresh }) {
  const [selected, setSelected] = useState(null);
  const player = players.find((p) => p.id === currentPlayerId);

  if (!player) {
    return <PlayerPicker players={players} meta={meta} onSelect={onSelectPlayer} onExit={onExit} />;
  }

  const maxSlots = meta.maxEquipSlots ?? 5;
  const equippedRuneObjs = trees.flatMap((t) =>
    t.runes.filter((r) => player.equipped.includes(r.id)).map((r) => ({ ...r, _tree: t }))
  );

  const handleRuneClick = (rune, tree, status) => {
    setSelected({ rune, tree });
    if (status === 'locked') return;
    onToggleEquip(player.id, rune.id);
  };

  return (
    <div className="rf-page">
      <TopHeader meta={meta} role="player" playerName={player.name} onExit={onExit} onRefresh={onRefresh} onSwitchPlayer={() => onSelectPlayer(null)} />
      <div>
        <div className="rf-loadout">
          <div className="rf-loadout-header">
            <div className="rf-loadout-title">Current Loadout</div>
            <div className="rf-loadout-count">{player.equipped.length}{maxSlots > 0 ? `/${maxSlots}` : ''} equipped</div>
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

        {trees.length === 0 ? (
          <div className="rf-empty-state">Your DM hasn't created any rune paths yet. Check back later.</div>
        ) : (
          trees.map((tree) => (
            <RuneTreeView
              key={tree.id}
              tree={tree}
              mode="equip"
              unlockedIds={player.unlocked}
              equippedIds={player.equipped}
              selectedRuneId={selected ? selected.rune.id : null}
              onRuneClick={handleRuneClick}
            />
          ))
        )}
        {selected && <DetailPanel rune={selected.rune} tree={selected.tree} />}
      </div>
    </div>
  );
}

/* ---------- login / setup ---------- */

function DMPasscodeForm({ meta, onSuccess, onBack }) {
  const [val, setVal] = useState('');
  const [err, setErr] = useState(false);
  const submit = () => {
    if (val === meta.dmPasscode) onSuccess();
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
        <div className="rf-login-title">{meta.campaignName}</div>
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

function SetupScreen({ onCreate }) {
  const [campaignName, setCampaignName] = useState('');
  const [passcode, setPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [err, setErr] = useState('');

  const submit = () => {
    if (!campaignName.trim()) { setErr('Give your campaign a name.'); return; }
    if (!passcode.trim()) { setErr('Choose a DM passcode.'); return; }
    if (passcode !== confirmPasscode) { setErr('Passcodes do not match.'); return; }
    onCreate(campaignName.trim(), passcode.trim());
  };

  return (
    <div className="rf-center">
      <div className="rf-login-card">
        <div className="rf-login-title">Forge a Rune System</div>
        <div className="rf-login-sub">Set this up once. Share this same artifact link with your players afterward.</div>
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
          {err && <div className="rf-error">{err}</div>}
          <button className="rf-btn-primary" style={{ marginTop: 14, width: '100%' }} onClick={submit}>Create Campaign</button>
        </div>
      </div>
    </div>
  );
}

/* ---------- root ---------- */

export default function App() {
  const [phase, setPhase] = useState('loading');
  const [meta, setMeta] = useState(null);
  const [trees, setTrees] = useState([]);
  const [players, setPlayers] = useState([]);
  const [currentPlayerId, setCurrentPlayerId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    (async () => {
      const m = await getKey(META_KEY);
      if (!m) { setPhase('setup'); return; }
      setMeta(m);
      const [t, p] = await Promise.all([getKey(TREES_KEY), getKey(PLAYERS_KEY)]);
      setTrees(t || []);
      setPlayers(p || []);
      setPhase('login');
    })();
  }, []);

  useEffect(() => {
    if (phase !== 'dm' && phase !== 'player') return;
    const interval = setInterval(async () => {
      if (modalOpen) return;
      const [t, p] = await Promise.all([getKey(TREES_KEY), getKey(PLAYERS_KEY)]);
      if (t) setTrees(t);
      if (p) setPlayers(p);
    }, 9000);
    return () => clearInterval(interval);
  }, [phase, modalOpen]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  const refreshNow = async () => {
    const [t, p] = await Promise.all([getKey(TREES_KEY), getKey(PLAYERS_KEY)]);
    if (t) setTrees(t);
    if (p) setPlayers(p);
  };

  const handleCreateCampaign = async (campaignName, passcode) => {
    const newMeta = { campaignName, dmPasscode: passcode, maxEquipSlots: 5 };
    const starterTree = {
      id: uid('tree'),
      name: 'Elemental Mastery',
      color: 'crimson',
      icon: '🔥',
      description: 'An example path — edit or delete this to make it your own.',
      tierCount: 2,
      runes: [
        { id: uid('rune'), name: 'Ember Touch', tier: 1, effect: '+1d4 fire damage on your next attack, once per short rest', description: 'A faint heat lingers in the fingertips of those who carry this rune.' },
        { id: uid('rune'), name: 'Frostward', tier: 1, effect: 'Resistance to cold damage for 1 minute, once per long rest', description: 'Carved from a shard of glacier that never fully melts.' },
        { id: uid('rune'), name: 'Wildfire Heart', tier: 2, effect: 'Once per long rest, add +2 to a damage roll', description: 'Said to beat in time with a forest fire.' },
      ],
    };
    setMeta(newMeta);
    setTrees([starterTree]);
    setPlayers([]);
    await setKey(META_KEY, newMeta);
    await setKey(TREES_KEY, [starterTree]);
    await setKey(PLAYERS_KEY, []);
    setPhase('login');
  };

  const handleSaveTree = (treeObj) => {
    const exists = trees.some((t) => t.id === treeObj.id);
    const next = exists ? trees.map((t) => (t.id === treeObj.id ? treeObj : t)) : [...trees, treeObj];
    setTrees(next);
    setKey(TREES_KEY, next);
  };

  const handleDeleteTree = (treeId) => {
    const dead = trees.find((t) => t.id === treeId);
    const runeIds = new Set((dead ? dead.runes : []).map((r) => r.id));
    const next = trees.filter((t) => t.id !== treeId);
    setTrees(next);
    setKey(TREES_KEY, next);
    const nextPlayers = players.map((p) => ({
      ...p,
      unlocked: p.unlocked.filter((id) => !runeIds.has(id)),
      equipped: p.equipped.filter((id) => !runeIds.has(id)),
    }));
    setPlayers(nextPlayers);
    setKey(PLAYERS_KEY, nextPlayers);
  };

  const handleAddPlayer = (name) => {
    const next = [...players, { id: uid('player'), name, unlocked: [], equipped: [] }];
    setPlayers(next);
    setKey(PLAYERS_KEY, next);
  };

  const handleDeletePlayer = (id) => {
    const next = players.filter((p) => p.id !== id);
    setPlayers(next);
    setKey(PLAYERS_KEY, next);
    if (currentPlayerId === id) setCurrentPlayerId(null);
  };

  const handleToggleUnlock = (playerId, runeId) => {
    const next = players.map((p) => {
      if (p.id !== playerId) return p;
      const has = p.unlocked.includes(runeId);
      return {
        ...p,
        unlocked: has ? p.unlocked.filter((id) => id !== runeId) : [...p.unlocked, runeId],
        equipped: has ? p.equipped.filter((id) => id !== runeId) : p.equipped,
      };
    });
    setPlayers(next);
    setKey(PLAYERS_KEY, next);
  };

  const handleToggleEquip = (playerId, runeId) => {
    const player = players.find((p) => p.id === playerId);
    if (!player || !player.unlocked.includes(runeId)) return;
    const isEquipped = player.equipped.includes(runeId);
    const maxSlots = meta ? (meta.maxEquipSlots ?? 5) : 5;
    if (!isEquipped && maxSlots > 0 && player.equipped.length >= maxSlots) {
      setToast(`Max ${maxSlots} runes equipped. Unequip one first.`);
      return;
    }
    const next = players.map((p) => (p.id === playerId
      ? { ...p, equipped: isEquipped ? p.equipped.filter((id) => id !== runeId) : [...p.equipped, runeId] }
      : p));
    setPlayers(next);
    setKey(PLAYERS_KEY, next);
  };

  const handleSaveMeta = (newMeta) => {
    setMeta(newMeta);
    setKey(META_KEY, newMeta);
  };

  const handleReset = async () => {
    await window.storage.delete(META_KEY, true).catch(() => {});
    await window.storage.delete(TREES_KEY, true).catch(() => {});
    await window.storage.delete(PLAYERS_KEY, true).catch(() => {});
    setMeta(null);
    setTrees([]);
    setPlayers([]);
    setCurrentPlayerId(null);
    setPhase('setup');
  };

  const handleExit = () => {
    setCurrentPlayerId(null);
    setPhase('login');
  };

  return (
    <div className="rf-root">
      <style>{CSS}</style>
      {toast && <div className="rf-toast">{toast}</div>}
      {phase === 'loading' && <div className="rf-center"><div className="rf-loading">Unsealing the rune vault…</div></div>}
      {phase === 'setup' && <SetupScreen onCreate={handleCreateCampaign} />}
      {phase === 'login' && meta && (
        <LoginScreen meta={meta} onChooseDM={() => setPhase('dm')} onChoosePlayer={() => setPhase('player')} />
      )}
      {phase === 'dm' && meta && (
        <DMDashboard
          meta={meta}
          trees={trees}
          players={players}
          onSaveTree={handleSaveTree}
          onDeleteTree={handleDeleteTree}
          onAddPlayer={handleAddPlayer}
          onDeletePlayer={handleDeletePlayer}
          onToggleUnlock={handleToggleUnlock}
          onSaveMeta={handleSaveMeta}
          onExit={handleExit}
          onReset={handleReset}
          onRefresh={refreshNow}
          setModalOpen={setModalOpen}
        />
      )}
      {phase === 'player' && meta && (
        <PlayerDashboard
          meta={meta}
          trees={trees}
          players={players}
          currentPlayerId={currentPlayerId}
          onSelectPlayer={setCurrentPlayerId}
          onToggleEquip={handleToggleEquip}
          onExit={handleExit}
          onRefresh={refreshNow}
        />
      )}
    </div>
  );
}