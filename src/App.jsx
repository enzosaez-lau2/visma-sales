import { useState, useEffect, useCallback } from "react";

const API_KEY = "cb5a944dadb61a3b7eb51c321a3c4140";
const API_BASE = "https://api.samu.ai";

const USERS = [
  { id: "67d40c57954990bf63d7ebd1", name: "Ana Maria Lagos", email: "ana.lagos@visma.com", image: "https://lh3.googleusercontent.com/a/ACg8ocIdpkw468UHP418KYbF3cknUxDIHW-LU9t_5g6XvGzHMtoVPsY=s96-c", enabled: true },
  { id: "67d40c58954990bf63d7ebd9", name: "Constanza Arriagada", email: "constanza.arriagada@visma.com", image: "https://lh3.googleusercontent.com/a/ACg8ocLtCzaC8JZECcPrEuZFoDz_OuzUMC4a73hvh-d1I3Ddy5DaoKY0=s96-c", enabled: true },
  { id: "68f69d38b5d16150fdf7ed67", name: "Cristian Rodriguez", email: "cristian.rodriguez@visma.com", image: "https://lh3.googleusercontent.com/a/ACg8ocKKzZWZMgclBJNmjVhV12d_tu9kZN2Zj4-ZRwSg5rA9CVuykQ=s96-c", enabled: true },
  { id: "6849c8e7d5012a26ab1fa552", name: "Eduardo Toro", email: "eduardo.toro@visma.com", image: "https://lh3.googleusercontent.com/a/ACg8ocLmDFPtjxwf3SW08HfMGnjugctMWCC31uhldEzVYikFXVNanQ=s96-c", enabled: true },
  { id: "67d40c59954990bf63d7ebdb", name: "José Miguel Guerra", email: "jose.guerra@visma.com", image: "https://lh3.googleusercontent.com/a/ACg8ocKIHSdA130pM7m-nxFYiCaNnJ_eFbkIptKpKW2VcLJ_rVDXBA=s96-c", enabled: true },
  { id: "680bde68f9e4299fec5f0289", name: "Laura Venier", email: "laura.venier+visma_cl@visma.com", image: null, enabled: true },
  { id: "67ec3fde0789c49711daf138", name: "Madeleine Monroy", email: "madeleine.monroy@visma.com", image: "https://lh3.googleusercontent.com/a/ACg8ocLEg8juDejcjTrGbiKjrT20g0cHORmjHuiKbydP-ztABrjV8g=s96-c", enabled: true },
  { id: "6849c94681a8d0d7d7419266", name: "Maria Bermudez", email: "maria.bermudez@visma.com", image: "https://lh3.googleusercontent.com/a/ACg8ocLWs6NzDfPaXnRG2TCFxhemB5z360NufumqAC4erFz4R4tR-A=s96-c", enabled: true },
  { id: "6972718d69acc9a1476ca08a", name: "Maria Jose Muñoz", email: "m.munoz@visma.com", image: "https://lh3.googleusercontent.com/a/ACg8ocIhn7Xu59Q78GuUCzp757N4zyiIGLv-u6ZVtbpMR5vdHw-wDFP4=s96-c", enabled: true },
  { id: "67d40c58954990bf63d7ebd7", name: "Nicole Puelles", email: "nicole.puelles@visma.com", image: "https://lh3.googleusercontent.com/a/ACg8ocJvyW8SU3DeYq08RslU07Es0oGBa04AEHzTlLx6UKTl407IizY=s96-c", enabled: true },
];

const samuFetch = async (path) => {
  const res = await fetch(`${API_BASE}${path}`, { headers: { apiKey: API_KEY } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
};

const claudeAnalyze = async (meetingData, transcription) => {
  const prompt = `Eres un coach experto en ventas B2B analizando una reunión de ventas para el jefe del equipo.

DATOS DE LA REUNIÓN:
- Nombre: ${meetingData.name || "Sin nombre"}
- Duración: ${meetingData.duration ? Math.round(meetingData.duration / 60) + " minutos" : "desconocida"}
- Score: ${meetingData.score?.score ?? "N/A"}
- Feedback Samu: ${meetingData.score?.feedback || "Sin feedback"}
- Extractor: ${JSON.stringify(meetingData.extractor || {})}

TRANSCRIPCIÓN (primeros 8000 chars):
${transcription ? JSON.stringify(transcription).slice(0, 8000) : "No disponible"}

Responde SOLO en JSON sin markdown ni backticks, con esta estructura exacta:
{
  "temasClave": ["tema1", "tema2", "tema3"],
  "preguntasSinRespuesta": ["pregunta1", "pregunta2"],
  "puntosPositivos": ["punto1", "punto2", "punto3"],
  "areasDesMejora": [
    {"area": "nombre del area", "descripcion": "descripcion corta", "tipo": "tecnica|blanda"}
  ],
  "recomendaciones": ["recomendacion1", "recomendacion2", "recomendacion3"],
  "momentoClave": "Una frase corta describiendo el momento más importante de la reunión",
  "nivelEnergia": 75,
  "escuchaActiva": 60,
  "manejo_objeciones": 80,
  "siguientePaso": "Acción concreta recomendada para el vendedor"
}`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  const data = await res.json();
  const text = data.content?.find(b => b.type === "text")?.text || "{}";
  try {
    return JSON.parse(text.replace(/```json|```/g, "").trim());
  } catch {
    return null;
  }
};

const Avatar = ({ user, size = 40 }) => {
  const initials = user.name.split(" ").slice(0, 2).map(n => n[0]).join("");
  const colors = ["#4F46E5","#0891B2","#059669","#D97706","#DC2626","#7C3AED","#DB2777","#0284C7"];
  const color = colors[user.name.charCodeAt(0) % colors.length];
  if (user.image) {
    return <img src={user.image} alt={user.name} style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover" }} onError={e => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }} />;
  }
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: size * 0.38, flexShrink: 0 }}>
      {initials}
    </div>
  );
};

const ScoreRing = ({ score, size = 80 }) => {
  const pct = Math.min(100, Math.max(0, score || 0));
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  const color = pct >= 75 ? "#10B981" : pct >= 50 ? "#F59E0B" : "#EF4444";
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#E5E7EB" strokeWidth={6} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={6} strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round" style={{ transition: "stroke-dasharray 0.8s ease" }} />
      <text x={size/2} y={size/2} textAnchor="middle" dominantBaseline="central" style={{ transform: "rotate(90deg)", transformOrigin: `${size/2}px ${size/2}px`, fontSize: size * 0.26, fontWeight: 700, fill: color, fontFamily: "inherit" }}>
        {pct}
      </text>
    </svg>
  );
};

const SkillBar = ({ label, value, color }) => (
  <div style={{ marginBottom: 10 }}>
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#6B7280", marginBottom: 4 }}>
      <span>{label}</span><span style={{ fontWeight: 600 }}>{value}%</span>
    </div>
    <div style={{ height: 6, borderRadius: 99, background: "#F3F4F6", overflow: "hidden" }}>
      <div style={{ width: `${value}%`, height: "100%", borderRadius: 99, background: color, transition: "width 1s ease" }} />
    </div>
  </div>
);

const Badge = ({ text, type = "default" }) => {
  const styles = {
    tecnica: { background: "#EFF6FF", color: "#1D4ED8", border: "1px solid #BFDBFE" },
    blanda: { background: "#F0FDF4", color: "#15803D", border: "1px solid #BBF7D0" },
    default: { background: "#F9FAFB", color: "#374151", border: "1px solid #E5E7EB" },
  };
  return <span style={{ ...styles[type], borderRadius: 99, padding: "2px 10px", fontSize: 11, fontWeight: 600, display: "inline-block" }}>{text}</span>;
};

export default function App() {
  const [view, setView] = useState("home"); // home | vendor | meeting
  const [selectedUser, setSelectedUser] = useState(null);
  const [dateFrom, setDateFrom] = useState(() => { const d = new Date(); d.setDate(d.getDate() - 30); return d.toISOString().slice(0, 10); });
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().slice(0, 10));
  const [meetings, setMeetings] = useState([]);
  const [loadingMeetings, setLoadingMeetings] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [meetingDetail, setMeetingDetail] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [error, setError] = useState(null);

  const loadMeetings = useCallback(async (user) => {
    setLoadingMeetings(true);
    setError(null);
    setMeetings([]);
    try {
      const data = await samuFetch(`/api/meetings?dateFrom=${dateFrom}T00:00:00Z&dateTo=${dateTo}T23:59:59Z`);
      const filtered = Array.isArray(data) ? data.filter(m => m.hostEmail === user.email || (m.users || []).includes(user.email)) : [];
      setMeetings(filtered);
    } catch (e) {
      setError("No se pudieron cargar las reuniones. La API de Samu puede estar experimentando problemas temporales. Intenta de nuevo.");
    } finally {
      setLoadingMeetings(false);
    }
  }, [dateFrom, dateTo]);

  const loadMeetingDetail = async (meeting) => {
    setSelectedMeeting(meeting);
    setMeetingDetail(null);
    setAnalysis(null);
    setLoadingAnalysis(true);
    setView("meeting");
    try {
      const [detail, transcription] = await Promise.all([
        samuFetch(`/api/meeting/${meeting.id}`).catch(() => meeting),
        samuFetch(`/api/meeting/${meeting.id}/transcription`).catch(() => null),
      ]);
      setMeetingDetail(detail);
      const ai = await claudeAnalyze(detail, transcription);
      setAnalysis(ai);
    } catch (e) {
      setError("Error cargando los detalles de la reunión.");
    } finally {
      setLoadingAnalysis(false);
    }
  };

  const fmt = (iso) => iso ? new Date(iso).toLocaleDateString("es-CL", { day: "2-digit", month: "short", year: "numeric" }) : "—";
  const fmtDur = (secs) => { if (!secs) return "—"; const m = Math.floor(secs / 60); return `${m} min`; };

  const styles = {
    app: { fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", minHeight: "100vh", background: "#F8FAFC", color: "#111827" },
    topbar: { background: "#fff", borderBottom: "1px solid #E5E7EB", padding: "0 24px", height: 56, display: "flex", alignItems: "center", gap: 12, position: "sticky", top: 0, zIndex: 100 },
    logo: { fontWeight: 800, fontSize: 15, color: "#1E3A5F", letterSpacing: -0.5 },
    logoAccent: { color: "#4F46E5" },
    breadcrumb: { display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#6B7280", marginLeft: 12 },
    crumbBtn: { background: "none", border: "none", cursor: "pointer", color: "#4F46E5", fontWeight: 600, fontSize: 13, padding: 0, fontFamily: "inherit" },
    main: { maxWidth: 1100, margin: "0 auto", padding: "28px 20px" },
    sectionTitle: { fontSize: 22, fontWeight: 800, color: "#111827", letterSpacing: -0.5, marginBottom: 6 },
    sectionSub: { fontSize: 14, color: "#6B7280", marginBottom: 24 },
    card: { background: "#fff", border: "1px solid #E5E7EB", borderRadius: 14, padding: 20 },
    userGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14 },
    userCard: { background: "#fff", border: "1px solid #E5E7EB", borderRadius: 14, padding: 18, cursor: "pointer", transition: "all 0.15s", display: "flex", flexDirection: "column", alignItems: "center", gap: 10, textAlign: "center" },
    userName: { fontSize: 14, fontWeight: 700, color: "#111827", lineHeight: 1.3 },
    userEmail: { fontSize: 11, color: "#9CA3AF", lineHeight: 1.4 },
    meetingCard: { background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, padding: 16, cursor: "pointer", transition: "all 0.15s", marginBottom: 10, display: "flex", alignItems: "center", gap: 14 },
    chip: { background: "#EFF6FF", color: "#1D4ED8", borderRadius: 99, padding: "3px 10px", fontSize: 11, fontWeight: 600 },
    grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
    tag: { background: "#FEF3C7", color: "#92400E", borderRadius: 8, padding: "6px 12px", fontSize: 13, borderLeft: "3px solid #F59E0B", marginBottom: 6, display: "block" },
    tagRed: { background: "#FEF2F2", color: "#991B1B", borderRadius: 8, padding: "6px 12px", fontSize: 13, borderLeft: "3px solid #EF4444", marginBottom: 6, display: "block" },
    tagGreen: { background: "#F0FDF4", color: "#166534", borderRadius: 8, padding: "6px 12px", fontSize: 13, borderLeft: "3px solid #10B981", marginBottom: 6, display: "block" },
    tagBlue: { background: "#EFF6FF", color: "#1D4ED8", borderRadius: 8, padding: "6px 12px", fontSize: 13, borderLeft: "3px solid #4F46E5", marginBottom: 6, display: "block" },
    spinner: { display: "inline-block", width: 20, height: 20, border: "3px solid #E5E7EB", borderTopColor: "#4F46E5", borderRadius: "50%", animation: "spin 0.7s linear infinite" },
  };

  return (
    <div style={styles.app}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .anim { animation: fadeIn 0.3s ease; }
        .user-card:hover { border-color: #4F46E5 !important; box-shadow: 0 4px 20px rgba(79,70,229,0.1) !important; transform: translateY(-2px); }
        .meeting-card:hover { border-color: #4F46E5 !important; box-shadow: 0 2px 12px rgba(0,0,0,0.06) !important; }
      `}</style>

      {/* Topbar */}
      <div style={styles.topbar}>
        <div style={styles.logo}>Visma <span style={styles.logoAccent}>Sales Intel</span></div>
        {view !== "home" && (
          <div style={styles.breadcrumb}>
            <span>›</span>
            <button style={styles.crumbBtn} onClick={() => setView("home")}>Vendedores</button>
            {selectedUser && <><span>›</span><span style={{ color: "#374151" }}>{selectedUser.name.split(" ")[0]}</span></>}
            {view === "meeting" && selectedMeeting && <><span>›</span><span style={{ color: "#374151", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{selectedMeeting.name || "Reunión"}</span></>}
          </div>
        )}
        <div style={{ marginLeft: "auto", fontSize: 12, color: "#9CA3AF" }}>Powered by Samu.ai</div>
      </div>

      {/* HOME */}
      {view === "home" && (
        <div style={styles.main} className="anim">
          <div style={styles.sectionTitle}>Panel de Ventas</div>
          <div style={styles.sectionSub}>Selecciona un vendedor para revisar sus reuniones y análisis de desempeño</div>

          {/* Date filter */}
          <div style={{ ...styles.card, marginBottom: 24, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>Rango de fechas</span>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={{ border: "1px solid #E5E7EB", borderRadius: 8, padding: "6px 12px", fontSize: 13, fontFamily: "inherit", color: "#111827" }} />
            <span style={{ fontSize: 13, color: "#9CA3AF" }}>hasta</span>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={{ border: "1px solid #E5E7EB", borderRadius: 8, padding: "6px 12px", fontSize: 13, fontFamily: "inherit", color: "#111827" }} />
          </div>

          <div style={styles.userGrid}>
            {USERS.map(user => (
              <div key={user.id} className="user-card" style={styles.userCard} onClick={() => { setSelectedUser(user); setView("vendor"); loadMeetings(user); }}>
                <Avatar user={user} size={52} />
                <div>
                  <div style={styles.userName}>{user.name}</div>
                  <div style={styles.userEmail}>{user.email.split("@")[0]}</div>
                </div>
                <div style={{ ...styles.chip, marginTop: 4 }}>Ver reuniones →</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VENDOR VIEW */}
      {view === "vendor" && selectedUser && (
        <div style={styles.main} className="anim">
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
            <Avatar user={selectedUser} size={52} />
            <div>
              <div style={styles.sectionTitle}>{selectedUser.name}</div>
              <div style={{ fontSize: 13, color: "#6B7280" }}>{selectedUser.email}</div>
            </div>
          </div>

          {loadingMeetings && (
            <div style={{ textAlign: "center", padding: 48 }}>
              <div style={styles.spinner} /><div style={{ marginTop: 12, color: "#6B7280", fontSize: 14 }}>Cargando reuniones...</div>
            </div>
          )}

          {error && !loadingMeetings && (
            <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 12, padding: 20, color: "#991B1B", fontSize: 14, marginBottom: 16 }}>
              ⚠️ {error}
              <button onClick={() => loadMeetings(selectedUser)} style={{ marginLeft: 12, background: "#EF4444", color: "#fff", border: "none", borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontSize: 13, fontFamily: "inherit" }}>Reintentar</button>
            </div>
          )}

          {!loadingMeetings && !error && meetings.length === 0 && (
            <div style={{ ...styles.card, textAlign: "center", padding: 48, color: "#6B7280" }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>📭</div>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>No hay reuniones en este período</div>
              <div style={{ fontSize: 13 }}>Ajusta el rango de fechas e intenta de nuevo</div>
            </div>
          )}

          {!loadingMeetings && meetings.length > 0 && (
            <div>
              <div style={{ fontSize: 13, color: "#6B7280", marginBottom: 14 }}>{meetings.length} reuniones encontradas</div>
              {meetings.map(m => (
                <div key={m.id} className="meeting-card" style={styles.meetingCard} onClick={() => loadMeetingDetail(m)}>
                  <div style={{ background: "#EFF6FF", borderRadius: 10, width: 42, height: 42, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>🎙</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: "#111827", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.name || "Reunión sin nombre"}</div>
                    <div style={{ fontSize: 12, color: "#9CA3AF" }}>{fmt(m.dateFrom)} · {fmtDur(m.duration)} · {m.provider || "—"}</div>
                  </div>
                  {m.score?.score != null && (
                    <div style={{ textAlign: "center", flexShrink: 0 }}>
                      <ScoreRing score={m.score.score} size={44} />
                    </div>
                  )}
                  <span style={{ color: "#9CA3AF", fontSize: 18 }}>›</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MEETING DETAIL */}
      {view === "meeting" && selectedMeeting && (
        <div style={styles.main} className="anim">
          <div style={{ marginBottom: 20 }}>
            <div style={styles.sectionTitle}>{selectedMeeting.name || "Reunión"}</div>
            <div style={{ fontSize: 13, color: "#6B7280" }}>
              {fmt(selectedMeeting.dateFrom)} · {fmtDur(selectedMeeting.duration)} · {selectedMeeting.provider || "—"}
            </div>
          </div>

          {loadingAnalysis && (
            <div style={{ ...styles.card, textAlign: "center", padding: 48 }}>
              <div style={styles.spinner} />
              <div style={{ marginTop: 14, color: "#6B7280", fontSize: 14, fontWeight: 500 }}>Analizando reunión con IA...</div>
              <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 6 }}>Revisando temas, preguntas sin respuesta y oportunidades de mejora</div>
            </div>
          )}

          {!loadingAnalysis && analysis && (
            <div className="anim">
              {/* Score + momento clave */}
              <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 16, marginBottom: 16 }}>
                <div style={{ ...styles.card, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, minWidth: 140 }}>
                  <ScoreRing score={(meetingDetail || selectedMeeting)?.score?.score ?? 0} size={80} />
                  <div style={{ fontSize: 12, color: "#6B7280", fontWeight: 600 }}>Score Samu</div>
                </div>
                <div style={{ ...styles.card, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#4F46E5", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>💡 Momento clave</div>
                    <div style={{ fontSize: 15, color: "#111827", fontWeight: 500, lineHeight: 1.5 }}>{analysis.momentoClave}</div>
                  </div>
                  {analysis.siguientePaso && (
                    <div style={{ background: "#EFF6FF", borderRadius: 10, padding: "10px 14px", marginTop: 12 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#4F46E5" }}>PRÓXIMO PASO → </span>
                      <span style={{ fontSize: 13, color: "#1E3A5F" }}>{analysis.siguientePaso}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Habilidades */}
              <div style={{ ...styles.card, marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 14 }}>📊 Desempeño en la llamada</div>
                <SkillBar label="Nivel de energía y seguridad" value={analysis.nivelEnergia} color="#4F46E5" />
                <SkillBar label="Escucha activa" value={analysis.escuchaActiva} color="#10B981" />
                <SkillBar label="Manejo de objeciones" value={analysis.manejo_objeciones} color="#F59E0B" />
              </div>

              <div style={styles.grid2}>
                {/* Temas clave */}
                <div style={styles.card}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 12 }}>🎯 Temas clave</div>
                  {analysis.temasClave?.length ? analysis.temasClave.map((t, i) => (
                    <span key={i} style={styles.tag}>• {t}</span>
                  )) : <span style={{ fontSize: 13, color: "#9CA3AF" }}>No se identificaron temas</span>}
                </div>

                {/* Preguntas sin respuesta */}
                <div style={styles.card}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 12 }}>❓ Preguntas sin respuesta</div>
                  {analysis.preguntasSinRespuesta?.length ? analysis.preguntasSinRespuesta.map((p, i) => (
                    <span key={i} style={styles.tagRed}>• {p}</span>
                  )) : <span style={{ fontSize: 13, color: "#10B981", fontWeight: 500 }}>✓ Todas las preguntas fueron respondidas</span>}
                </div>

                {/* Puntos positivos */}
                <div style={styles.card}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 12 }}>✅ Lo que hizo bien</div>
                  {analysis.puntosPositivos?.length ? analysis.puntosPositivos.map((p, i) => (
                    <span key={i} style={styles.tagGreen}>• {p}</span>
                  )) : <span style={{ fontSize: 13, color: "#9CA3AF" }}>Sin datos</span>}
                </div>

                {/* Áreas de mejora */}
                <div style={styles.card}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 12 }}>📈 Áreas de mejora</div>
                  {analysis.areasDesMejora?.length ? analysis.areasDesMejora.map((a, i) => (
                    <div key={i} style={{ marginBottom: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <Badge text={a.tipo === "blanda" ? "Habilidad blanda" : "Técnica de venta"} type={a.tipo === "blanda" ? "blanda" : "tecnica"} />
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>{a.area}</span>
                      </div>
                      <div style={{ fontSize: 12, color: "#6B7280", paddingLeft: 4 }}>{a.descripcion}</div>
                    </div>
                  )) : <span style={{ fontSize: 13, color: "#9CA3AF" }}>Sin áreas identificadas</span>}
                </div>
              </div>

              {/* Recomendaciones */}
              {analysis.recomendaciones?.length > 0 && (
                <div style={{ ...styles.card, marginTop: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 12 }}>🚀 Recomendaciones para el coach</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 10 }}>
                    {analysis.recomendaciones.map((r, i) => (
                      <span key={i} style={styles.tagBlue}>{i + 1}. {r}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Feedback Samu original */}
              {(meetingDetail || selectedMeeting)?.score?.feedback && (
                <div style={{ ...styles.card, marginTop: 16, background: "#FAFAFA" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Feedback original de Samu</div>
                  <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.7 }}>{(meetingDetail || selectedMeeting).score.feedback}</div>
                </div>
              )}
            </div>
          )}

          {!loadingAnalysis && !analysis && (
            <div style={{ ...styles.card, textAlign: "center", padding: 40, color: "#6B7280" }}>
              No se pudo generar el análisis. La reunión puede no tener transcripción disponible aún.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
