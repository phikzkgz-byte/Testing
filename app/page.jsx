"use client";
import { useState, useEffect, useRef, useCallback } from "react";

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const ADMIN_PASSWORD_KEY = "pg_admin_pass";
const DEFAULT_PASS = "admin123";

const DEFAULT_GAMES = [
  { id: 1, name: "Fortune Tiger",  color: "#D4AF37", img: "https://img.freepik.com/free-vector/tiger-mascot-logo-esports-gaming_138676-551.jpg" },
  { id: 2, name: "Fortune Ox",     color: "#C0392B", img: "https://img.freepik.com/free-vector/golden-ox-bull-logo_1634-162.jpg" },
  { id: 3, name: "Fortune Mouse",  color: "#8E44AD", img: "https://img.freepik.com/free-vector/cute-mouse-cartoon_1308-130958.jpg" },
  { id: 4, name: "Mahjong Ways",   color: "#1A8A5A", img: "https://img.freepik.com/free-vector/mahjong-tile-isolated_23-2148155698.jpg" },
  { id: 5, name: "Wild Bandito",   color: "#E67E22", img: "https://img.freepik.com/free-vector/bandit-mascot-logo_1277-177.jpg" },
  { id: 6, name: "Ganesha Gold",   color: "#2980B9", img: "https://img.freepik.com/free-vector/golden-ganesha-illustration_1284-42537.jpg" },
];

const G = {
  bg: "#060810", bgCard: "#0d1117", bgCard2: "#111827",
  gold: "#D4AF37", goldLight: "#FFE87C", goldDim: "rgba(212,175,55,0.15)", goldBorder: "rgba(212,175,55,0.25)",
  blue: "#3B82F6", blueLight: "#93C5FD", blueDim: "rgba(59,130,246,0.12)", blueBorder: "rgba(59,130,246,0.25)",
  green: "#10B981", greenDim: "rgba(16,185,129,0.12)",
  red: "#EF4444", redDim: "rgba(239,68,68,0.12)",
  amber: "#F59E0B", amberDim: "rgba(245,158,11,0.12)",
  text: "#F1F5F9", textMuted: "#64748B", textDim: "#334155",
  border: "rgba(255,255,255,0.06)",
  teal: "#32BCAD",
};

const ADMIN_TABS = [
  { id: "dashboard", label: "Dashboard", icon: "📊" },
  { id: "bank",      label: "Banca",     icon: "💰" },
  { id: "games",     label: "Jogos",     icon: "🎮" },
  { id: "pix",       label: "PIX",       icon: "📱" },
  { id: "deposits",  label: "Depósitos", icon: "📋" },
  { id: "settings",  label: "Config",    icon: "⚙️" },
];

// ─── SHARED UI HELPERS ───────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, accent = G.gold }) {
  return (
    <div style={{ background: G.bgCard, border: `1px solid ${G.border}`, borderRadius: 14, padding: "18px 20px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }} />
      <div style={{ fontSize: 22, marginBottom: 8 }}>{icon}</div>
      <div style={{ color: G.textMuted, fontSize: 11, letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>{label}</div>
      <div style={{ color: accent, fontSize: 26, fontWeight: 800, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ color: G.textMuted, fontSize: 11, marginTop: 6 }}>{sub}</div>}
    </div>
  );
}

function Section({ title, icon, children }) {
  return (
    <div style={{ background: G.bgCard, border: `1px solid ${G.border}`, borderRadius: 16, padding: "22px 24px", marginBottom: 18 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, paddingBottom: 14, borderBottom: `1px solid ${G.border}` }}>
        <span style={{ fontSize: 18 }}>{icon}</span>
        <span style={{ color: G.goldLight, fontWeight: 700, fontSize: 15, letterSpacing: 0.5 }}>{title}</span>
      </div>
      {children}
    </div>
  );
}

function AInput({ label, value, onChange, type = "text", placeholder }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <div style={{ color: G.textMuted, fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 }}>{label}</div>}
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ width: "100%", background: "#0a0f1a", border: `1px solid ${G.border}`, borderRadius: 10, padding: "10px 14px", color: G.text, fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
    </div>
  );
}

function Btn({ children, onClick, color = G.gold, variant = "filled", disabled, small }) {
  const base = { border: "none", borderRadius: 9, cursor: disabled ? "not-allowed" : "pointer", fontWeight: 700, letterSpacing: 0.5, transition: "opacity 0.2s", opacity: disabled ? 0.4 : 1, fontFamily: "inherit" };
  const filled  = { ...base, background: `linear-gradient(135deg, ${color}, ${color}99)`, color: "#0a0f1a", padding: small ? "7px 14px" : "11px 22px", fontSize: small ? 12 : 13 };
  const outline = { ...base, background: "transparent", border: `1px solid ${color}55`, color, padding: small ? "6px 13px" : "10px 21px", fontSize: small ? 12 : 13 };
  const danger  = { ...base, background: G.redDim, border: `1px solid ${G.red}44`, color: G.red, padding: small ? "6px 13px" : "10px 21px", fontSize: small ? 12 : 13 };
  const style = variant === "outline" ? outline : variant === "danger" ? danger : filled;
  return <button style={style} onClick={onClick} disabled={disabled}>{children}</button>;
}

function Toggle({ value, onChange, label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: `1px solid ${G.border}` }}>
      <span style={{ color: G.text, fontSize: 14 }}>{label}</span>
      <div onClick={() => onChange(!value)} style={{ width: 44, height: 24, borderRadius: 12, background: value ? G.green : G.textDim, cursor: "pointer", position: "relative", transition: "background 0.3s" }}>
        <div style={{ position: "absolute", top: 3, left: value ? 23 : 3, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left 0.3s" }} />
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState("roulette"); // "roulette" | "admin"

  // ── Shared state ──
  const [bank,       setBank]       = useState(0);
  const [deposits,   setDeposits]   = useState([]);
  const [games,      setGames]      = useState(DEFAULT_GAMES);
  const [pixConfig,  setPixConfig]  = useState({ key: "roleta@pgsoft.com", beneficiary: "PGSOFT ROLETA", bank: "260 - Nubank", minDeposit: 10, maxDeposit: 500 });
  const [settings,   setSettings]   = useState({ title: "Roleta PG Soft", locked: false, showBank: true, autoSpin: false, winnerSound: true });
  const [adminPass,  setAdminPass]  = useState(DEFAULT_PASS);

  useEffect(() => {
    try {
      const bankStored     = localStorage.getItem("pgbank");
      const depositsStored = localStorage.getItem("pgdeposits");
      const gamesStored    = localStorage.getItem("pggames");
      const pixStored      = localStorage.getItem("pg_pix_config");
      const settingsStored = localStorage.getItem("pg_settings");
      const passStored     = localStorage.getItem(ADMIN_PASSWORD_KEY);

      if (bankStored)     setBank(parseFloat(bankStored) || 0);
      if (depositsStored) setDeposits(JSON.parse(depositsStored) || []);
      if (gamesStored) {
        const g = JSON.parse(gamesStored);
        if (g?.length) setGames(g);
      }
      if (pixStored)      setPixConfig(p => ({ ...p, ...JSON.parse(pixStored) }));
      if (settingsStored) setSettings(s => ({ ...s, ...JSON.parse(settingsStored) }));
      if (passStored)     setAdminPass(passStored);
    } catch (e) {
      console.error("Erro ao carregar storage:", e);
    }
  }, []);

  function persist(key, val) {
    try {
      localStorage.setItem(key, typeof val === "string" ? val : JSON.stringify(val));
    } catch (e) {
      console.error("Erro ao salvar:", e);
    }
  }

  if (view === "admin") {
    return <AdminPanel
      bank={bank} setBank={setBank}
      deposits={deposits} setDeposits={setDeposits}
      games={games} setGames={setGames}
      pixConfig={pixConfig} setPixConfig={setPixConfig}
      settings={settings} setSettings={setSettings}
      adminPass={adminPass} setAdminPass={setAdminPass}
      persist={persist}
      onBack={() => setView("roulette")}
    />;
  }

  return <Roulette
    bank={bank} setBank={setBank}
    deposits={deposits} setDeposits={setDeposits}
    games={games} setGames={setGames}
    pixConfig={pixConfig}
    settings={settings}
    persist={persist}
    onAdmin={() => setView("admin")}
  />;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROULETTE VIEW
// ═══════════════════════════════════════════════════════════════════════════════
function Roulette({ bank, setBank, deposits, setDeposits, games, setGames, pixConfig, settings, persist, onAdmin }) {
  const canvasRef        = useRef(null);
  const animRef          = useRef(null);
  const currentRotRef    = useRef(0);

  const [spinning,       setSpinning]       = useState(false);
  const [winner,         setWinner]         = useState(null);
  const [showWinner,     setShowWinner]     = useState(false);
  const [showDeposit,    setShowDeposit]    = useState(false);
  const [showPixModal,   setShowPixModal]   = useState(false);
  const [showAddGame,    setShowAddGame]    = useState(false);
  const [depositAmount,  setDepositAmount]  = useState("");
  const [depositorName,  setDepositorName]  = useState("");
  const [pendingDeposit, setPendingDeposit] = useState(null);
  const [newGame,        setNewGame]        = useState({ name: "", img: "", color: "#D4AF37" });

  function shadeColor(hex, amount) {
    try {
      let r = parseInt(hex.slice(1,3),16), g2 = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
      r = Math.max(0,Math.min(255,r+amount)); g2 = Math.max(0,Math.min(255,g2+amount)); b = Math.max(0,Math.min(255,b+amount));
      return `#${r.toString(16).padStart(2,"0")}${g2.toString(16).padStart(2,"0")}${b.toString(16).padStart(2,"0")}`;
    } catch { return hex; }
  }

  const drawWheel = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || games.length === 0) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    const cx = W/2, cy = H/2;
    const R = Math.min(W,H)/2 - 10;
    const arc = (2*Math.PI)/games.length;

    ctx.clearRect(0,0,W,H);

    const grad = ctx.createRadialGradient(cx,cy,R-15,cx,cy,R+5);
    grad.addColorStop(0,"rgba(212,175,55,0.6)");
    grad.addColorStop(1,"rgba(212,175,55,0)");
    ctx.beginPath(); ctx.arc(cx,cy,R+5,0,2*Math.PI); ctx.fillStyle=grad; ctx.fill();

    games.forEach((g,i) => {
      const startAngle = currentRotRef.current + i*arc;
      const endAngle   = startAngle + arc;
      ctx.beginPath(); ctx.moveTo(cx,cy); ctx.arc(cx,cy,R,startAngle,endAngle); ctx.closePath();
      ctx.fillStyle = i%2===0 ? g.color : shadeColor(g.color,-30);
      ctx.fill(); ctx.strokeStyle="#D4AF37"; ctx.lineWidth=2; ctx.stroke();

      const midAngle = startAngle + arc/2;
      const imgX = cx + (R*0.6)*Math.cos(midAngle);
      const imgY = cy + (R*0.6)*Math.sin(midAngle);
      const imgSize = Math.min(R*0.28,44);

      ctx.save(); ctx.translate(imgX,imgY); ctx.rotate(midAngle+Math.PI/2);
      ctx.beginPath(); ctx.arc(0,0,imgSize/2,0,2*Math.PI); ctx.clip();
      ctx.fillStyle="rgba(0,0,0,0.4)"; ctx.fill();
      if (g._imgEl && g._imgEl.complete && g._imgEl.naturalWidth>0) {
        try { ctx.drawImage(g._imgEl,-imgSize/2,-imgSize/2,imgSize,imgSize); } catch {}
      }
      ctx.restore();

      ctx.save(); ctx.translate(imgX,imgY); ctx.rotate(midAngle+Math.PI/2);
      ctx.fillStyle="#fff";
      ctx.font=`bold ${Math.max(9,Math.min(12,R*0.06))}px 'Segoe UI', sans-serif`;
      ctx.textAlign="center"; ctx.textBaseline="middle";
      ctx.shadowColor="rgba(0,0,0,0.8)"; ctx.shadowBlur=4;
      ctx.fillText(g.name.length>12 ? g.name.slice(0,10)+"…" : g.name, 0, imgSize/2+10);
      ctx.restore();
    });

    const hubGrad = ctx.createRadialGradient(cx-5,cy-5,2,cx,cy,28);
    hubGrad.addColorStop(0,"#FFE87C"); hubGrad.addColorStop(0.5,"#D4AF37"); hubGrad.addColorStop(1,"#8B6914");
    ctx.beginPath(); ctx.arc(cx,cy,28,0,2*Math.PI); ctx.fillStyle=hubGrad; ctx.fill();
    ctx.strokeStyle="#FFE87C"; ctx.lineWidth=2; ctx.stroke();
    ctx.fillStyle="#1a0a00"; ctx.font="bold 10px 'Segoe UI', sans-serif";
    ctx.textAlign="center"; ctx.textBaseline="middle";
    ctx.fillText("PG",cx,cy-5); ctx.fillText("SOFT",cx,cy+6);

    ctx.save(); ctx.translate(cx,8);
    ctx.beginPath(); ctx.moveTo(-14,0); ctx.lineTo(14,0); ctx.lineTo(0,28); ctx.closePath();
    ctx.fillStyle="#D4AF37"; ctx.fill(); ctx.strokeStyle="#FFE87C"; ctx.lineWidth=1.5; ctx.stroke();
    ctx.restore();
  }, [games]);

  useEffect(() => {
    games.forEach(g => {
      if (!g._imgEl) {
        const img = new Image(); img.crossOrigin="anonymous";
        img.onload = () => { g._imgEl = img; drawWheel(); };
        img.onerror = () => { g._imgEl = { complete: false }; };
        img.src = g.img; g._imgEl = img;
      }
    });
    drawWheel();
  }, [games, drawWheel]);

  function spin() {
    if (spinning || games.length < 2 || settings.locked) return;
    setSpinning(true); setWinner(null); setShowWinner(false);
    const totalSpin = 2*Math.PI*(8+Math.random()*6);
    const targetRot = currentRotRef.current + totalSpin;
    const duration  = 4500 + Math.random()*1500;
    const start = performance.now();
    const startRot = currentRotRef.current;
    function easeOut(t) { return 1-Math.pow(1-t,4); }
    function frame(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed/duration,1);
      currentRotRef.current = startRot + totalSpin*easeOut(progress);
      drawWheel();
      if (progress < 1) { animRef.current = requestAnimationFrame(frame); }
      else {
        currentRotRef.current = targetRot % (2*Math.PI);
        drawWheel(); setSpinning(false);
        const arc = (2*Math.PI)/games.length;
        let angle = ((-currentRotRef.current % (2*Math.PI)) + 2*Math.PI) % (2*Math.PI);
        const winIdx = Math.floor(angle/arc) % games.length;
        setWinner(games[winIdx]); setShowWinner(true);
      }
    }
    animRef.current = requestAnimationFrame(frame);
  }

  async function confirmDeposit() {
    if (!depositAmount || !depositorName) return;
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount<=0) return;
    setPendingDeposit({ amount, name: depositorName });
    setShowDeposit(false); setShowPixModal(true);
  }

  async function finalizeDeposit() {
    if (!pendingDeposit) return;
    const newBank = bank + pendingDeposit.amount;
    const newDep = { id: Date.now(), name: pendingDeposit.name, amount: pendingDeposit.amount, time: new Date().toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"}) };
    const newDeposits = [newDep, ...deposits].slice(0,20);
    setBank(newBank); setDeposits(newDeposits);
    setShowPixModal(false); setPendingDeposit(null); setDepositAmount(""); setDepositorName("");
    await persist("pgbank", String(newBank));
    await persist("pgdeposits", newDeposits);
  }

  async function addGame() {
    if (!newGame.name.trim()) return;
    const g = { id: Date.now(), name: newGame.name, img: newGame.img || "https://via.placeholder.com/100/D4AF37/000?text=PG", color: newGame.color };
    const updated = [...games, g];
    setGames(updated); setNewGame({ name:"", img:"", color:"#D4AF37" }); setShowAddGame(false);
    await persist("pggames", updated.map(x => ({ ...x, _imgEl: undefined })));
  }

  function generatePixKey(amount) {
    return `Chave PIX: ${pixConfig.key}\nBeneficiário: ${pixConfig.beneficiary}\nBanco: ${pixConfig.bank}\nValor: R$ ${Number(amount).toFixed(2)}`;
  }

  const rS = {
    app: { minHeight:"100vh", background:"linear-gradient(135deg, #0a0500 0%, #1a0d00 50%, #0d0500 100%)", fontFamily:"'Segoe UI', sans-serif", padding:"0 0 40px 0", position:"relative" },
    header: { textAlign:"center", padding:"20px 20px 14px", borderBottom:"1px solid rgba(212,175,55,0.2)", display:"flex", alignItems:"center", justifyContent:"space-between" },
    logo: { fontSize:24, fontWeight:800, background:"linear-gradient(135deg, #FFE87C, #D4AF37, #8B6914)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", letterSpacing:2 },
    subtitle: { color:"rgba(212,175,55,0.6)", fontSize:11, letterSpacing:3 },
    adminBtn: { background:"rgba(212,175,55,0.1)", color:"#D4AF37", border:"1px solid rgba(212,175,55,0.35)", borderRadius:9, padding:"8px 14px", fontSize:12, fontWeight:700, cursor:"pointer", letterSpacing:1 },
    bankCard: { margin:"16px auto", maxWidth:600, background:"linear-gradient(135deg, rgba(212,175,55,0.15), rgba(139,105,20,0.1))", border:"1px solid rgba(212,175,55,0.4)", borderRadius:16, padding:"16px 24px", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 },
    bankLabel: { color:"rgba(212,175,55,0.7)", fontSize:12, letterSpacing:2, textTransform:"uppercase" },
    bankValue: { fontSize:34, fontWeight:800, color:"#FFE87C", textShadow:"0 0 20px rgba(212,175,55,0.5)" },
    pixBtn: { background:"linear-gradient(135deg, #32BCAD, #1d8f83)", color:"#fff", border:"none", borderRadius:10, padding:"10px 20px", cursor:"pointer", fontWeight:700, fontSize:13, letterSpacing:1 },
    wheelWrap: { display:"flex", justifyContent:"center", alignItems:"center", padding:"10px 20px" },
    canvas: { borderRadius:"50%", boxShadow:"0 0 60px rgba(212,175,55,0.3), 0 0 120px rgba(212,175,55,0.1)", maxWidth:"100%" },
    controls: { display:"flex", justifyContent:"center", gap:12, margin:"14px auto", flexWrap:"wrap", maxWidth:600, padding:"0 20px" },
    spinBtn: { background: spinning||settings.locked ? "rgba(100,100,100,0.3)" : "linear-gradient(135deg, #D4AF37, #8B6914)", color: spinning||settings.locked ? "#666" : "#1a0d00", border:"none", borderRadius:12, padding:"14px 40px", fontSize:16, fontWeight:800, cursor: spinning||settings.locked ? "not-allowed" : "pointer", letterSpacing:2, textTransform:"uppercase", transition:"all 0.3s" },
    addBtn: { background:"rgba(212,175,55,0.1)", color:"#D4AF37", border:"1px solid rgba(212,175,55,0.4)", borderRadius:12, padding:"14px 24px", fontSize:13, fontWeight:700, cursor:"pointer", letterSpacing:1 },
    gameList: { maxWidth:600, margin:"0 auto", padding:"0 20px" },
    // ✅ Sem botão de remover — apenas exibe o jogo
    gameItem: { display:"flex", alignItems:"center", gap:12, padding:"10px 14px", borderRadius:10, marginBottom:8, background:"rgba(212,175,55,0.05)", border:"1px solid rgba(212,175,55,0.15)" },
    gameImg: { width:40, height:40, borderRadius:8, objectFit:"cover", background:"#222" },
    gameName: { color:"#FFE87C", fontWeight:600, fontSize:14, flex:1 },
    depSec: { maxWidth:600, margin:"20px auto 0", padding:"0 20px" },
    depTitle: { color:"rgba(212,175,55,0.6)", fontSize:11, letterSpacing:2, textTransform:"uppercase", marginBottom:10 },
    depItem: { display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 12px", borderRadius:8, marginBottom:6, background:"rgba(50,188,173,0.08)", border:"1px solid rgba(50,188,173,0.2)" },
    overlay: { position:"fixed", top:0, left:0, right:0, bottom:0, background:"rgba(0,0,0,0.85)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, padding:20 },
    modal: { background:"linear-gradient(135deg, #1a0d00, #2a1500)", border:"1px solid rgba(212,175,55,0.4)", borderRadius:20, padding:28, maxWidth:400, width:"100%", boxShadow:"0 0 60px rgba(0,0,0,0.8)" },
    modalTitle: { color:"#FFE87C", fontSize:20, fontWeight:800, marginBottom:20, textAlign:"center" },
    input: { width:"100%", padding:"12px 14px", borderRadius:10, border:"1px solid rgba(212,175,55,0.3)", background:"rgba(212,175,55,0.05)", color:"#FFE87C", fontSize:14, boxSizing:"border-box", marginBottom:12, outline:"none" },
    confirmBtn: { width:"100%", padding:"13px", borderRadius:10, border:"none", background:"linear-gradient(135deg, #D4AF37, #8B6914)", color:"#1a0d00", fontSize:15, fontWeight:800, cursor:"pointer", marginTop:8 },
    cancelBtn: { width:"100%", padding:"11px", borderRadius:10, border:"1px solid rgba(212,175,55,0.3)", background:"transparent", color:"#D4AF37", fontSize:13, cursor:"pointer", marginTop:8 },
    pixBox: { background:"rgba(0,0,0,0.4)", borderRadius:12, padding:16, margin:"16px 0", border:"1px solid rgba(50,188,173,0.3)" },
    pixText: { color:"#32BCAD", fontSize:12, fontFamily:"monospace", lineHeight:1.8, whiteSpace:"pre-wrap" },
    adminHint: { color:"rgba(212,175,55,0.35)", fontSize:10, letterSpacing:1, textAlign:"center", marginTop:4 },
  };

  return (
    <div style={rS.app}>
      {/* Header */}
      <div style={rS.header}>
        <div>
          <div style={rS.logo}>🎰 {settings.title || "ROLETA PG SOFT"}</div>
          <div style={rS.subtitle}>BANCA ACUMULATIVA COMPARTILHADA</div>
        </div>
        <button style={rS.adminBtn} onClick={onAdmin}>⚙️ Admin</button>
      </div>

      {/* Bank */}
      {settings.showBank && (
        <div style={rS.bankCard}>
          <div>
            <div style={rS.bankLabel}>💰 Banca Acumulada</div>
            <div style={rS.bankValue}>R$ {bank.toFixed(2).replace(".",",")}</div>
            <div style={{ color:"rgba(212,175,55,0.4)", fontSize:11, marginTop:4 }}>{deposits.length} depósito{deposits.length!==1?"s":""} realizados</div>
          </div>
          <button style={rS.pixBtn} onClick={() => setShowDeposit(true)}>+ Depositar via PIX</button>
        </div>
      )}
      {!settings.showBank && (
        <div style={{ ...rS.bankCard, justifyContent:"center" }}>
          <button style={rS.pixBtn} onClick={() => setShowDeposit(true)}>+ Depositar via PIX</button>
        </div>
      )}

      {/* Wheel */}
      <div style={rS.wheelWrap}>
        <canvas ref={canvasRef} width={400} height={400} style={rS.canvas} />
      </div>

      {/* Controls */}
      <div style={rS.controls}>
        <button style={rS.spinBtn} onClick={spin} disabled={spinning||settings.locked}>
          {settings.locked ? "🔒 ROLETA BLOQUEADA" : spinning ? "⏳ GIRANDO..." : "🎯 GIRAR ROLETA"}
        </button>
        <button style={rS.addBtn} onClick={() => setShowAddGame(true)}>＋ Adicionar Jogo</button>
      </div>

      {/* Games list — SEM botão de remover para usuários comuns */}
      <div style={rS.gameList}>
        <div style={rS.depTitle}>Jogos na Roleta ({games.length})</div>
        {games.map(g => (
          <div key={g.id} style={rS.gameItem}>
            <div style={{ ...rS.gameImg, background:g.color, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <img src={g.img} alt={g.name} style={{ width:"100%", height:"100%", borderRadius:8, objectFit:"cover" }} onError={e => { e.target.style.display="none"; }} />
            </div>
            <div style={rS.gameName}>{g.name}</div>
            <div style={{ width:16, height:16, borderRadius:4, background:g.color }} />
            {/* ✅ Botão de remover REMOVIDO da view pública — disponível apenas no Admin */}
          </div>
        ))}
        <div style={rS.adminHint}>🔒 Remoção de jogos disponível apenas no painel Admin</div>
      </div>

      {/* Deposit history */}
      {deposits.length > 0 && (
        <div style={rS.depSec}>
          <div style={rS.depTitle}>Últimos Depósitos</div>
          {deposits.slice(0,8).map(d => (
            <div key={d.id} style={rS.depItem}>
              <div>
                <div style={{ color:"#a0f0e8", fontSize:13, fontWeight:600 }}>{d.name}</div>
                <div style={{ color:"rgba(50,188,173,0.5)", fontSize:11 }}>{d.time}</div>
              </div>
              <div style={{ color:"#32BCAD", fontSize:14, fontWeight:700 }}>+R$ {d.amount.toFixed(2).replace(".",",")}</div>
            </div>
          ))}
        </div>
      )}

      {/* Winner modal */}
      {showWinner && winner && (
        <div style={rS.overlay} onClick={() => setShowWinner(false)}>
          <div style={rS.modal} onClick={e => e.stopPropagation()}>
            <div style={{ textAlign:"center", padding:"10px 0" }}>
              <div style={{ fontSize:40, marginBottom:8 }}>🎉</div>
              <div style={{ color:"rgba(212,175,55,0.7)", fontSize:12, letterSpacing:3, marginBottom:8 }}>PARABÉNS! O SORTEADO FOI:</div>
              <img src={winner.img} alt={winner.name} style={{ width:80, height:80, borderRadius:12, objectFit:"cover", margin:"0 auto 12px", display:"block", border:"3px solid #D4AF37" }} onError={e => { e.target.style.display="none"; }} />
              <div style={{ color:"#FFE87C", fontSize:28, fontWeight:800, textShadow:"0 0 20px rgba(212,175,55,0.6)" }}>{winner.name}</div>
              {settings.showBank && (
                <div style={{ color:"rgba(212,175,55,0.5)", fontSize:13, marginTop:8 }}>
                  Banca atual: <span style={{ color:"#FFE87C", fontWeight:700 }}>R$ {bank.toFixed(2).replace(".",",")}</span>
                </div>
              )}
            </div>
            <button style={{ ...rS.confirmBtn, marginTop:20 }} onClick={() => setShowWinner(false)}>Fechar</button>
          </div>
        </div>
      )}

      {/* Deposit form */}
      {showDeposit && (
        <div style={rS.overlay}>
          <div style={rS.modal}>
            <div style={rS.modalTitle}>💳 Depositar na Banca</div>
            <input style={rS.input} placeholder="Seu nome" value={depositorName} onChange={e => setDepositorName(e.target.value)} />
            <input style={rS.input} placeholder={`Valor (mín R$ ${pixConfig.minDeposit})`} type="number" min={pixConfig.minDeposit} max={pixConfig.maxDeposit} value={depositAmount} onChange={e => setDepositAmount(e.target.value)} />
            <button style={rS.confirmBtn} onClick={confirmDeposit}>Gerar PIX →</button>
            <button style={rS.cancelBtn} onClick={() => { setShowDeposit(false); setDepositAmount(""); setDepositorName(""); }}>Cancelar</button>
          </div>
        </div>
      )}

      {/* PIX modal */}
      {showPixModal && pendingDeposit && (
        <div style={rS.overlay}>
          <div style={rS.modal}>
            <div style={rS.modalTitle}>📱 Pagar via PIX</div>
            <div style={{ color:"rgba(212,175,55,0.7)", textAlign:"center", marginBottom:16, fontSize:14 }}>
              Valor: <span style={{ color:"#FFE87C", fontWeight:800, fontSize:20 }}>R$ {pendingDeposit.amount.toFixed(2).replace(".",",")}</span>
            </div>
            <div style={rS.pixBox}>
              <div style={{ color:"rgba(50,188,173,0.6)", fontSize:10, letterSpacing:2, marginBottom:8 }}>DADOS DO PIX</div>
              <div style={rS.pixText}>{generatePixKey(pendingDeposit.amount)}</div>
            </div>
            <div style={{ color:"rgba(255,255,255,0.4)", fontSize:11, textAlign:"center", marginBottom:12 }}>Após realizar o pagamento, clique em "Confirmar Pagamento"</div>
            <button style={rS.confirmBtn} onClick={finalizeDeposit}>✅ Confirmar Pagamento</button>
            <button style={rS.cancelBtn} onClick={() => { setShowPixModal(false); setPendingDeposit(null); }}>Cancelar</button>
          </div>
        </div>
      )}

      {/* Add game modal */}
      {showAddGame && (
        <div style={rS.overlay}>
          <div style={rS.modal}>
            <div style={rS.modalTitle}>🎮 Adicionar Jogo PG SOFT</div>
            <input style={rS.input} placeholder="Nome do jogo (ex: Fortune Tiger)" value={newGame.name} onChange={e => setNewGame({...newGame, name:e.target.value})} />
            <input style={rS.input} placeholder="URL da imagem (opcional)" value={newGame.img} onChange={e => setNewGame({...newGame, img:e.target.value})} />
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
              <span style={{ color:"rgba(212,175,55,0.7)", fontSize:13 }}>Cor da fatia:</span>
              <input type="color" value={newGame.color} onChange={e => setNewGame({...newGame, color:e.target.value})} style={{ width:48, height:36, borderRadius:8, border:"1px solid rgba(212,175,55,0.3)", background:"none", cursor:"pointer" }} />
            </div>
            <button style={rS.confirmBtn} onClick={addGame}>＋ Adicionar à Roleta</button>
            <button style={rS.cancelBtn} onClick={() => { setShowAddGame(false); setNewGame({name:"",img:"",color:"#D4AF37"}); }}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN VIEW
// ═══════════════════════════════════════════════════════════════════════════════
function AdminPanel({ bank, setBank, deposits, setDeposits, games, setGames, pixConfig, setPixConfig, settings, setSettings, adminPass, setAdminPass, persist, onBack }) {
  const [authed,       setAuthed]       = useState(false);
  const [passInput,    setPassInput]    = useState("");
  const [loginError,   setLoginError]   = useState("");
  const [tab,          setTab]          = useState("dashboard");
  const [newPass,      setNewPass]      = useState("");
  const [confirmPass,  setConfirmPass]  = useState("");
  const [passMsg,      setPassMsg]      = useState("");
  const [adjustAmount, setAdjustAmount] = useState("");
  const [adjustMode,   setAdjustMode]   = useState("add");
  const [saved,        setSaved]        = useState({});
  const [newGame,      setNewGame]      = useState({ name:"", img:"", color:"#D4AF37" });

  function flash(key) { setSaved(s => ({...s, [key]:true})); setTimeout(() => setSaved(s => ({...s,[key]:false})),2000); }
  async function save(key, val) { await persist(key, val); flash(key); }

  function tryLogin() {
    if (passInput === adminPass) { setAuthed(true); setLoginError(""); }
    else setLoginError("Senha incorreta. Tente novamente.");
  }

  async function adjustBank() {
    const amt = parseFloat(adjustAmount);
    if (isNaN(amt) || amt<=0) return;
    const next = adjustMode==="add" ? bank+amt : adjustMode==="sub" ? Math.max(0,bank-amt) : amt;
    setBank(next); setAdjustAmount("");
    await save("pgbank", String(next));
  }

  async function resetBank() {
    if (!confirm("Zerar a banca? Esta ação não pode ser desfeita.")) return;
    setBank(0); await save("pgbank","0");
  }

  async function clearDeposits() {
    if (!confirm("Apagar todo o histórico de depósitos?")) return;
    setDeposits([]); await save("pgdeposits",[]);
  }

  async function removeDeposit(id) {
    const updated = deposits.filter(d => d.id!==id);
    setDeposits(updated); await save("pgdeposits",updated);
  }

  async function savePixConfig() { await save("pg_pix_config", pixConfig); }
  async function saveSettings()  { await save("pg_settings",   settings);  }

  async function changePass() {
    if (!newPass || newPass.length<4) { setPassMsg("Mínimo 4 caracteres."); return; }
    if (newPass!==confirmPass) { setPassMsg("As senhas não coincidem."); return; }
    setAdminPass(newPass);
    await save(ADMIN_PASSWORD_KEY, newPass);
    setNewPass(""); setConfirmPass("");
    setPassMsg("✅ Senha alterada com sucesso!");
    setTimeout(() => setPassMsg(""),3000);
  }

  async function addGameAdmin() {
    if (!newGame.name.trim()) return;
    const g = { id:Date.now(), name:newGame.name, img:newGame.img||"https://via.placeholder.com/80/D4AF37/000?text=PG", color:newGame.color };
    const updated = [...games, g];
    setGames(updated); setNewGame({name:"",img:"",color:"#D4AF37"});
    await save("pggames", updated.map(x => ({...x,_imgEl:undefined})));
  }

  // ✅ Remoção de jogos exclusiva do Admin
  async function removeGameAdmin(id) {
    if (!confirm("Remover este jogo da roleta?")) return;
    const updated = games.filter(g => g.id!==id);
    setGames(updated);
    await save("pggames", updated.map(x => ({...x,_imgEl:undefined})));
  }

  const totalDeposited = deposits.reduce((a,d) => a+d.amount, 0);
  const avgDeposit = deposits.length ? totalDeposited/deposits.length : 0;

  // LOGIN
  if (!authed) {
    return (
      <div style={{ minHeight:"100vh", background:G.bg, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Segoe UI', sans-serif" }}>
        <div style={{ background:G.bgCard, border:`1px solid ${G.goldBorder}`, borderRadius:20, padding:40, width:340, boxShadow:`0 0 60px rgba(212,175,55,0.1)` }}>
          <div style={{ textAlign:"center", marginBottom:32 }}>
            <div style={{ fontSize:40, marginBottom:12 }}>🔐</div>
            <div style={{ fontSize:22, fontWeight:800, color:G.goldLight, letterSpacing:1 }}>ADMIN PANEL</div>
            <div style={{ color:G.textMuted, fontSize:12, letterSpacing:2, marginTop:4 }}>PG SOFT ROLETA</div>
          </div>
          <AInput label="Senha de Acesso" value={passInput} onChange={setPassInput} type="password" placeholder="••••••••" />
          {loginError && <div style={{ color:G.red, fontSize:12, marginBottom:12, textAlign:"center" }}>{loginError}</div>}
          <Btn onClick={tryLogin} color={G.gold}>Entrar no Painel →</Btn>
          <div style={{ color:G.textMuted, fontSize:11, textAlign:"center", marginTop:16 }}>Senha padrão: admin123</div>
          <div style={{ textAlign:"center", marginTop:12 }}>
            <button onClick={onBack} style={{ background:"none", border:"none", color:G.textMuted, cursor:"pointer", fontSize:12, textDecoration:"underline" }}>← Voltar à Roleta</button>
          </div>
        </div>
      </div>
    );
  }

  // MAIN ADMIN
  return (
    <div style={{ minHeight:"100vh", background:G.bg, fontFamily:"'Segoe UI', sans-serif", display:"flex" }}>

      {/* Sidebar */}
      <div style={{ width:220, background:G.bgCard, borderRight:`1px solid ${G.border}`, padding:"24px 0", display:"flex", flexDirection:"column", flexShrink:0 }}>
        <div style={{ padding:"0 20px 24px", borderBottom:`1px solid ${G.border}` }}>
          <div style={{ fontSize:16, fontWeight:800, color:G.goldLight }}>🎰 PG ADMIN</div>
          <div style={{ color:G.textMuted, fontSize:11, marginTop:2 }}>Painel de Controle</div>
        </div>
        <div style={{ padding:"16px 12px", flex:1 }}>
          {ADMIN_TABS.map(t => (
            <div key={t.id} onClick={() => setTab(t.id)} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", borderRadius:10, marginBottom:4, cursor:"pointer", background:tab===t.id?G.goldDim:"transparent", border:tab===t.id?`1px solid ${G.goldBorder}`:"1px solid transparent", color:tab===t.id?G.goldLight:G.textMuted, fontWeight:tab===t.id?700:400, fontSize:14, transition:"all 0.2s" }}>
              <span style={{ fontSize:16 }}>{t.icon}</span>{t.label}
            </div>
          ))}
        </div>
        <div style={{ padding:"16px 20px", borderTop:`1px solid ${G.border}` }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
            <div style={{ width:8, height:8, borderRadius:"50%", background:settings.locked?G.red:G.green }} />
            <span style={{ color:G.textMuted, fontSize:12 }}>{settings.locked?"Roleta Bloqueada":"Roleta Ativa"}</span>
          </div>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            <Btn onClick={onBack} variant="outline" color={G.teal} small>🎰 Roleta</Btn>
            <Btn onClick={() => setAuthed(false)} variant="outline" color={G.textMuted} small>Sair</Btn>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex:1, padding:"28px 32px", overflowY:"auto" }}>

        {/* DASHBOARD */}
        {tab==="dashboard" && (
          <>
            <div style={{ color:G.goldLight, fontSize:22, fontWeight:800, marginBottom:6 }}>Dashboard</div>
            <div style={{ color:G.textMuted, fontSize:13, marginBottom:24 }}>Visão geral do sistema em tempo real</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(160px, 1fr))", gap:14, marginBottom:24 }}>
              <StatCard icon="💰" label="Banca Atual"      value={`R$ ${bank.toFixed(2).replace(".",",")}`}          sub="Acumulado total"   accent={G.gold}  />
              <StatCard icon="📥" label="Total Depositado" value={`R$ ${totalDeposited.toFixed(2).replace(".",",")}`} sub={`${deposits.length} depósitos`} accent={G.blue}  />
              <StatCard icon="🎮" label="Jogos Ativos"     value={games.length}                                        sub="Na roleta agora"   accent={G.green} />
              <StatCard icon="📊" label="Ticket Médio"     value={`R$ ${avgDeposit.toFixed(2).replace(".",",")}`}     sub="Por depósito"      accent={G.amber} />
            </div>
            <Section title="Últimos Depósitos" icon="📋">
              {deposits.length===0 && <div style={{ color:G.textMuted, fontSize:13 }}>Nenhum depósito registrado.</div>}
              {deposits.slice(0,5).map(d => (
                <div key={d.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom:`1px solid ${G.border}` }}>
                  <div><div style={{ color:G.text, fontSize:14, fontWeight:600 }}>{d.name}</div><div style={{ color:G.textMuted, fontSize:11 }}>{d.time}</div></div>
                  <div style={{ color:G.green, fontWeight:700, fontSize:16 }}>+R$ {d.amount.toFixed(2).replace(".",",")}</div>
                </div>
              ))}
            </Section>
            <Section title="Status do Sistema" icon="🔧">
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                {[["Roleta",settings.locked?"🔴 Bloqueada":"🟢 Online",settings.locked?G.red:G.green],
                  ["Banca",`R$ ${bank.toFixed(2).replace(".",",")}`,G.gold],
                  ["PIX Key",pixConfig.key,G.blue],
                  ["Jogos",`${games.length} cadastrados`,G.green]].map(([k,v,c]) => (
                  <div key={k} style={{ background:G.bgCard2, borderRadius:10, padding:"12px 14px" }}>
                    <div style={{ color:G.textMuted, fontSize:11, letterSpacing:1 }}>{k}</div>
                    <div style={{ color:c, fontSize:13, fontWeight:600, marginTop:4 }}>{v}</div>
                  </div>
                ))}
              </div>
            </Section>
          </>
        )}

        {/* BANK */}
        {tab==="bank" && (
          <>
            <div style={{ color:G.goldLight, fontSize:22, fontWeight:800, marginBottom:24 }}>Gerenciar Banca</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(180px, 1fr))", gap:14, marginBottom:24 }}>
              <StatCard icon="💰" label="Saldo Atual"    value={`R$ ${bank.toFixed(2).replace(".",",")}`}            accent={G.gold}  />
              <StatCard icon="📥" label="Total Entradas" value={`R$ ${totalDeposited.toFixed(2).replace(".",",")}`}  accent={G.green} />
              <StatCard icon="👥" label="Depositantes"   value={deposits.length}                                      accent={G.blue}  />
            </div>
            <Section title="Ajustar Saldo Manualmente" icon="🛠️">
              <div style={{ display:"flex", gap:10, marginBottom:16, flexWrap:"wrap" }}>
                {[["add","Adicionar",G.green],["sub","Subtrair",G.red],["set","Definir",G.blue]].map(([m,l,c]) => (
                  <div key={m} onClick={() => setAdjustMode(m)} style={{ padding:"8px 18px", borderRadius:8, cursor:"pointer", background:adjustMode===m?`${c}22`:G.bgCard2, border:`1px solid ${adjustMode===m?c:G.border}`, color:adjustMode===m?c:G.textMuted, fontWeight:adjustMode===m?700:400, fontSize:13 }}>{l}</div>
                ))}
              </div>
              <div style={{ display:"flex", gap:10, alignItems:"flex-end" }}>
                <div style={{ flex:1 }}>
                  <AInput label={adjustMode==="set"?"Novo saldo (R$)":adjustMode==="add"?"Valor a adicionar (R$)":"Valor a subtrair (R$)"} value={adjustAmount} onChange={setAdjustAmount} type="number" placeholder="0.00" />
                </div>
                <div style={{ marginBottom:14 }}>
                  <Btn onClick={adjustBank} color={adjustMode==="add"?G.green:adjustMode==="sub"?G.red:G.blue}>
                    {saved["pgbank"]?"✅ Salvo!":"Aplicar"}
                  </Btn>
                </div>
              </div>
            </Section>
            <Section title="Ações Críticas" icon="⚠️">
              <div style={{ color:G.textMuted, fontSize:13, marginBottom:16 }}>Estas ações são irreversíveis. Proceda com cuidado.</div>
              <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                <Btn onClick={resetBank} variant="danger">🗑️ Zerar Banca</Btn>
                <Btn onClick={clearDeposits} variant="danger">🗑️ Limpar Histórico</Btn>
              </div>
            </Section>
          </>
        )}

        {/* GAMES */}
        {tab==="games" && (
          <>
            <div style={{ color:G.goldLight, fontSize:22, fontWeight:800, marginBottom:24 }}>Gerenciar Jogos</div>
            <Section title="Adicionar Novo Jogo" icon="➕">
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <AInput label="Nome do Jogo"  value={newGame.name} onChange={v => setNewGame(g => ({...g,name:v}))} placeholder="Fortune Tiger" />
                <AInput label="URL da Imagem" value={newGame.img}  onChange={v => setNewGame(g => ({...g,img:v}))}  placeholder="https://..." />
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
                <div style={{ color:G.textMuted, fontSize:11, letterSpacing:1, textTransform:"uppercase" }}>Cor da Fatia</div>
                <input type="color" value={newGame.color} onChange={e => setNewGame(g => ({...g,color:e.target.value}))} style={{ width:44, height:36, borderRadius:8, border:`1px solid ${G.border}`, background:"none", cursor:"pointer" }} />
                <div style={{ width:36, height:36, borderRadius:8, background:newGame.color }} />
              </div>
              <Btn onClick={addGameAdmin} color={G.gold}>{saved["pggames"]?"✅ Adicionado!":"➕ Adicionar à Roleta"}</Btn>
            </Section>
            <Section title={`Jogos Cadastrados (${games.length})`} icon="🎮">
              {games.length===0 && <div style={{ color:G.textMuted, fontSize:13 }}>Nenhum jogo cadastrado.</div>}
              {games.map((g,i) => (
                <div key={g.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 12px", borderRadius:10, marginBottom:8, background:G.bgCard2, border:`1px solid ${G.border}` }}>
                  <div style={{ color:G.textMuted, fontSize:12, width:20, textAlign:"center" }}>{i+1}</div>
                  <div style={{ width:36, height:36, borderRadius:8, background:g.color, overflow:"hidden", flexShrink:0 }}>
                    <img src={g.img} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} onError={e => { e.target.style.display="none"; }} />
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ color:G.text, fontSize:14, fontWeight:600 }}>{g.name}</div>
                    <div style={{ color:G.textMuted, fontSize:11, maxWidth:200, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{g.img||"sem imagem"}</div>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <div style={{ width:14, height:14, borderRadius:3, background:g.color }} />
                    {/* ✅ Botão de remover disponível SOMENTE aqui no Admin */}
                    <Btn onClick={() => removeGameAdmin(g.id)} variant="danger" small>✕ Remover</Btn>
                  </div>
                </div>
              ))}
            </Section>
          </>
        )}

        {/* PIX */}
        {tab==="pix" && (
          <>
            <div style={{ color:G.goldLight, fontSize:22, fontWeight:800, marginBottom:24 }}>Configuração PIX</div>
            <Section title="Dados do Recebedor" icon="🏦">
              <AInput label="Chave PIX"            value={pixConfig.key}         onChange={v => setPixConfig(p => ({...p,key:v}))}         placeholder="email@dominio.com / CPF / telefone" />
              <AInput label="Nome do Beneficiário"  value={pixConfig.beneficiary} onChange={v => setPixConfig(p => ({...p,beneficiary:v}))} placeholder="NOME COMPLETO" />
              <AInput label="Banco"                 value={pixConfig.bank}        onChange={v => setPixConfig(p => ({...p,bank:v}))}         placeholder="260 - Nubank" />
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <AInput label="Depósito Mínimo (R$)" value={pixConfig.minDeposit} onChange={v => setPixConfig(p => ({...p,minDeposit:v}))} type="number" />
                <AInput label="Depósito Máximo (R$)" value={pixConfig.maxDeposit} onChange={v => setPixConfig(p => ({...p,maxDeposit:v}))} type="number" />
              </div>
              <Btn onClick={savePixConfig} color={G.blue}>{saved["pg_pix_config"]?"✅ Salvo!":"💾 Salvar Configurações PIX"}</Btn>
            </Section>
            <Section title="Preview do PIX" icon="👁️">
              <div style={{ background:"#0a0f1a", border:`1px solid ${G.blueBorder}`, borderRadius:12, padding:16, fontFamily:"monospace", fontSize:13, color:"#93C5FD", lineHeight:2 }}>
                <div>🔑 Chave: <span style={{ color:G.text }}>{pixConfig.key||"—"}</span></div>
                <div>👤 Beneficiário: <span style={{ color:G.text }}>{pixConfig.beneficiary||"—"}</span></div>
                <div>🏦 Banco: <span style={{ color:G.text }}>{pixConfig.bank||"—"}</span></div>
                <div>⬇️ Mín: <span style={{ color:G.green }}>R$ {Number(pixConfig.minDeposit).toFixed(2)}</span> &nbsp;⬆️ Máx: <span style={{ color:G.amber }}>R$ {Number(pixConfig.maxDeposit).toFixed(2)}</span></div>
              </div>
            </Section>
          </>
        )}

        {/* DEPOSITS */}
        {tab==="deposits" && (
          <>
            <div style={{ color:G.goldLight, fontSize:22, fontWeight:800, marginBottom:8 }}>Histórico de Depósitos</div>
            <div style={{ color:G.textMuted, fontSize:13, marginBottom:24 }}>{deposits.length} registros · Total: R$ {totalDeposited.toFixed(2).replace(".",",")}</div>
            {deposits.length===0 && (
              <div style={{ textAlign:"center", padding:60, color:G.textMuted }}>
                <div style={{ fontSize:40, marginBottom:12 }}>📭</div>
                <div>Nenhum depósito registrado ainda.</div>
              </div>
            )}
            {deposits.map((d,i) => (
              <div key={d.id} style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 18px", borderRadius:12, marginBottom:8, background:G.bgCard, border:`1px solid ${G.border}` }}>
                <div style={{ width:36, height:36, borderRadius:"50%", background:G.goldDim, display:"flex", alignItems:"center", justifyContent:"center", color:G.gold, fontWeight:800, fontSize:14, flexShrink:0 }}>{d.name?.[0]?.toUpperCase()||"?"}</div>
                <div style={{ flex:1 }}>
                  <div style={{ color:G.text, fontSize:14, fontWeight:600 }}>{d.name}</div>
                  <div style={{ color:G.textMuted, fontSize:11 }}>#{deposits.length-i} · {d.time}</div>
                </div>
                <div style={{ color:G.green, fontWeight:800, fontSize:18 }}>+R$ {d.amount.toFixed(2).replace(".",",")}</div>
                <Btn onClick={() => removeDeposit(d.id)} variant="danger" small>✕</Btn>
              </div>
            ))}
            {deposits.length>0 && (
              <div style={{ marginTop:20 }}>
                <Btn onClick={clearDeposits} variant="danger">🗑️ Limpar Todo Histórico</Btn>
              </div>
            )}
          </>
        )}

        {/* SETTINGS */}
        {tab==="settings" && (
          <>
            <div style={{ color:G.goldLight, fontSize:22, fontWeight:800, marginBottom:24 }}>Configurações Gerais</div>
            <Section title="Interface da Roleta" icon="🎨">
              <AInput label="Título da Roleta" value={settings.title} onChange={v => setSettings(s => ({...s,title:v}))} placeholder="Roleta PG Soft" />
              <Toggle value={settings.locked}      onChange={v => setSettings(s => ({...s,locked:v}))}      label="🔒 Bloquear Roleta (impede giro)" />
              <Toggle value={settings.showBank}    onChange={v => setSettings(s => ({...s,showBank:v}))}    label="💰 Mostrar Banca para Jogadores" />
              <Toggle value={settings.winnerSound} onChange={v => setSettings(s => ({...s,winnerSound:v}))} label="🔊 Som ao Sortear Vencedor" />
              <div style={{ marginTop:16 }}>
                <Btn onClick={saveSettings} color={G.green}>{saved["pg_settings"]?"✅ Salvo!":"💾 Salvar Configurações"}</Btn>
              </div>
            </Section>
            <Section title="Alterar Senha do Admin" icon="🔐">
              <AInput label="Nova Senha"           value={newPass}      onChange={setNewPass}      type="password" placeholder="••••••••" />
              <AInput label="Confirmar Nova Senha" value={confirmPass}  onChange={setConfirmPass}  type="password" placeholder="••••••••" />
              {passMsg && <div style={{ color:passMsg.startsWith("✅")?G.green:G.red, fontSize:13, marginBottom:12 }}>{passMsg}</div>}
              <Btn onClick={changePass} color={G.amber}>🔑 Alterar Senha</Btn>
            </Section>
            <Section title="Informações do Sistema" icon="ℹ️">
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                {[["Versão","1.0.0"],["Storage","Compartilhado"],["Jogos",`${games.length} ativos`],["Depósitos",`${deposits.length} registros`]].map(([k,v]) => (
                  <div key={k} style={{ background:G.bgCard2, borderRadius:8, padding:"10px 14px" }}>
                    <div style={{ color:G.textMuted, fontSize:11 }}>{k}</div>
                    <div style={{ color:G.text, fontSize:13, fontWeight:600, marginTop:3 }}>{v}</div>
                  </div>
                ))}
              </div>
            </Section>
          </>
        )}

      </div>
    </div>
  );
}
