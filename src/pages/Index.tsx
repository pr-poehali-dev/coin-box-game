import { useState, useEffect, useCallback, useRef } from "react";

/* ─── Types ─── */
type Page = "home" | "game" | "profile" | "rules";

interface Coin {
  id: number;
  x: number;
  delay: number;
  duration: number;
  size: number;
  emoji: string;
}

interface Box {
  id: number;
  emoji: string;
  label: string;
  prize: number;
  rarity: "common" | "rare" | "epic" | "legendary";
  opened: boolean;
  opening: boolean;
  prize_emoji: string;
}

/* ─── Constants ─── */
const RARITIES = {
  common: { color: "#9CA3AF", glow: "rgba(156,163,175,0.3)", label: "Обычный" },
  rare: { color: "#60A5FA", glow: "rgba(96,165,250,0.4)", label: "Редкий" },
  epic: { color: "#A78BFA", glow: "rgba(167,139,250,0.5)", label: "Эпический" },
  legendary: { color: "#F0D080", glow: "rgba(240,208,128,0.6)", label: "Легендарный" },
};

const INITIAL_BOXES: Box[] = [
  { id: 1, emoji: "📦", label: "Простой ящик", prize: 50, rarity: "common", opened: false, opening: false, prize_emoji: "💰" },
  { id: 2, emoji: "🎁", label: "Редкий подарок", prize: 250, rarity: "rare", opened: false, opening: false, prize_emoji: "💎" },
  { id: 3, emoji: "🔮", label: "Магический шар", prize: 750, rarity: "epic", opened: false, opening: false, prize_emoji: "✨" },
  { id: 4, emoji: "👑", label: "Корона удачи", prize: 2500, rarity: "legendary", opened: false, opening: false, prize_emoji: "🏆" },
  { id: 5, emoji: "🎴", label: "Карта судьбы", prize: 120, rarity: "common", opened: false, opening: false, prize_emoji: "🃏" },
  { id: 6, emoji: "🌟", label: "Звёздный кейс", prize: 500, rarity: "rare", opened: false, opening: false, prize_emoji: "⭐" },
  { id: 7, emoji: "🐉", label: "Дракон-ящик", prize: 1500, rarity: "epic", opened: false, opening: false, prize_emoji: "🔥" },
  { id: 8, emoji: "💫", label: "Галактический", prize: 5000, rarity: "legendary", opened: false, opening: false, prize_emoji: "🌌" },
];

const LEADERBOARD = [
  { rank: 1, name: "Александр В.", score: 148500, avatar: "👑" },
  { rank: 2, name: "Мария К.", score: 97200, avatar: "💎" },
  { rank: 3, name: "Дмитрий Н.", score: 82400, avatar: "🌟" },
  { rank: 4, name: "Анна С.", score: 61800, avatar: "🔥" },
  { rank: 5, name: "Игорь П.", score: 54300, avatar: "⚡" },
  { rank: 6, name: "Елена М.", score: 43900, avatar: "🎯" },
  { rank: 7, name: "Сергей Т.", score: 38100, avatar: "🎪" },
];

const ACHIEVEMENTS = [
  { id: 1, icon: "🎯", title: "Первая победа", desc: "Открой первый ящик" },
  { id: 2, icon: "💰", title: "Богач", desc: "Собери 1000 монет" },
  { id: 3, icon: "🏆", title: "Чемпион", desc: "Найди легендарный приз" },
  { id: 4, icon: "⚡", title: "Молния", desc: "Открой 5 ящиков подряд" },
];

/* ─── Coin Rain ─── */
function CoinRain({ active, onDone }: { active: boolean; onDone: () => void }) {
  const [coins, setCoins] = useState<Coin[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!active) return;
    const emojis = ["🪙", "💰", "💎", "⭐", "✨", "🌟"];
    const newCoins = Array.from({ length: 28 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 1.5,
      duration: 1.6 + Math.random() * 1.4,
      size: 16 + Math.random() * 18,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
    }));
    setCoins(newCoins);
    timerRef.current = setTimeout(() => { setCoins([]); onDone(); }, 3500);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [active, onDone]);

  if (coins.length === 0) return null;

  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 50, overflow: "hidden" }}>
      {coins.map((coin) => (
        <div
          key={coin.id}
          className="animate-coin-fall"
          style={{
            position: "absolute",
            left: `${coin.x}%`,
            top: "-60px",
            fontSize: `${coin.size}px`,
            animationDelay: `${coin.delay}s`,
            animationDuration: `${coin.duration}s`,
          }}
        >
          {coin.emoji}
        </div>
      ))}
    </div>
  );
}

/* ─── Triumph Overlay ─── */
function TriumphOverlay({ prize, prizeEmoji, onClose, mult }: { prize: number; prizeEmoji: string; onClose: () => void; mult?: number }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 40,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(0,0,0,0.88)",
      }}
    >
      <div
        className="animate-triumph"
        onClick={(e) => e.stopPropagation()}
        style={{ textAlign: "center", padding: "0 24px" }}
      >
        <div
          className="animate-glow-pulse"
          style={{
            position: "relative", margin: "0 auto 24px",
            width: "160px", height: "160px", borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "radial-gradient(circle, rgba(201,168,76,0.3) 0%, transparent 70%)",
            border: "2px solid var(--gold)",
            fontSize: "80px",
          }}
        >
          {prizeEmoji}
          {[0, 60, 120, 180, 240, 300].map((deg) => (
            <div
              key={deg}
              className="animate-star-spin"
              style={{
                position: "absolute", top: "50%", left: "50%",
                transform: `rotate(${deg}deg) translateX(72px)`,
                transformOrigin: "0 0",
                animationDelay: `${deg / 600}s`,
                fontSize: "18px", color: "var(--gold)",
              }}
            >
              ✦
            </div>
          ))}
        </div>

        <h2
          className="gold-text"
          style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "56px", fontWeight: 700, margin: "0 0 8px" }}
        >
          ПОБЕДА!
        </h2>
        <p style={{ color: "#F5E6C8", fontSize: "16px", marginBottom: "8px", letterSpacing: "0.1em" }}>Вы выиграли</p>
        <p
          className="gold-text"
          style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "60px", fontWeight: 700, lineHeight: 1 }}
        >
          {prize.toLocaleString()} 🪙
        </p>
        {mult !== undefined && (
          <p style={{ color: "#A78BFA", fontSize: "18px", marginTop: "8px", letterSpacing: "0.1em", fontWeight: 700 }}>
            ×{mult.toFixed(2)} к ставке
          </p>
        )}

        <button
          className="luxury-btn"
          onClick={onClose}
          style={{ marginTop: "32px", padding: "14px 40px", borderRadius: "9999px", fontSize: "13px" }}
        >
          Продолжить
        </button>
      </div>
    </div>
  );
}

/* ─── Nav ─── */
function Nav({ page, setPage, balance }: { page: Page; setPage: (p: Page) => void; balance: number }) {
  const labels: Record<Page, string> = { home: "Главная", game: "Игра", profile: "Профиль", rules: "Правила" };
  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 30,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "16px 24px",
      background: "linear-gradient(180deg, rgba(14,6,16,0.98) 0%, rgba(14,6,16,0.9) 100%)",
      borderBottom: "1px solid rgba(201,168,76,0.18)",
      backdropFilter: "blur(20px)",
    }}>
      <button
        onClick={() => setPage("home")}
        style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
      >
        <span style={{ fontSize: "26px", color: "var(--gold)" }}>♠</span>
        <span className="gold-text" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "20px", fontWeight: 700, letterSpacing: "0.08em" }}>
          GRAND ROYAL
        </span>
      </button>

      <div style={{ display: "flex", alignItems: "center", gap: "28px" }}>
        {(["home", "game", "profile", "rules"] as Page[]).map((p) => (
          <button
            key={p}
            onClick={() => setPage(p)}
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: page === p ? "var(--gold)" : "#C4B89A",
              fontFamily: "'Montserrat', sans-serif",
              fontSize: "12px", fontWeight: 600, letterSpacing: "0.1em",
              textTransform: "uppercase", position: "relative", paddingBottom: "4px",
              transition: "color 0.3s",
            }}
          >
            {labels[p]}
            <span style={{
              position: "absolute", bottom: 0, left: 0, height: "2px",
              background: "var(--gold)", width: page === p ? "100%" : "0",
              transition: "width 0.3s ease",
            }} />
          </button>
        ))}
      </div>

      <div style={{
        display: "flex", alignItems: "center", gap: "8px",
        padding: "8px 16px", borderRadius: "9999px",
        border: "1px solid rgba(201,168,76,0.4)",
        background: "rgba(201,168,76,0.07)",
      }}>
        <span style={{ fontSize: "18px" }}>🪙</span>
        <span className="gold-text" style={{ fontSize: "16px", fontWeight: 700, fontFamily: "'Cormorant Garamond', serif" }}>
          {balance.toLocaleString()}
        </span>
      </div>
    </nav>
  );
}

/* ─── Home Page ─── */
function HomePage({ setPage }: { setPage: (p: Page) => void }) {
  return (
    <div style={{ minHeight: "100vh", paddingTop: "72px" }}>
      <div style={{ position: "relative", minHeight: "88vh", overflow: "hidden" }}>
        <img
          src="https://cdn.poehali.dev/projects/b9f18975-6a23-4e76-92dd-dafdc975ad77/files/7b6389b5-078a-4b98-a7e4-7f0b7e06ffb8.jpg"
          alt=""
          className="animate-bg-float"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.3, transform: "scale(1.1)" }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(14,6,16,0.35) 0%, rgba(14,6,16,0.7) 60%, rgba(14,6,16,1) 100%)" }} />

        {["♠", "♥", "♦", "♣", "★"].map((s, i) => (
          <div key={i} className="animate-float" style={{
            position: "absolute",
            left: `${12 + i * 16}%`, top: `${15 + (i % 3) * 18}%`,
            fontSize: "30px",
            color: i % 2 === 0 ? "rgba(201,168,76,0.12)" : "rgba(139,0,0,0.18)",
            animationDelay: `${i * 0.6}s`, animationDuration: `${3.5 + i * 0.5}s`,
          }}>{s}</div>
        ))}

        <div className="animate-fade-in-up" style={{
          position: "relative", zIndex: 2,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          minHeight: "88vh", textAlign: "center", padding: "0 24px",
        }}>
          <p style={{ color: "var(--gold)", letterSpacing: "0.4em", fontSize: "11px", fontWeight: 600, marginBottom: "14px", textTransform: "uppercase" }}>
            ✦ Добро пожаловать ✦
          </p>
          <h1 className="gold-text" style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "clamp(52px, 9vw, 100px)", fontWeight: 700, lineHeight: 0.9, marginBottom: "24px",
          }}>
            GRAND<br />ROYAL<br />CASINO
          </h1>
          <p style={{ color: "#D4C5A9", fontSize: "17px", letterSpacing: "0.04em", maxWidth: "400px", lineHeight: 1.7, marginBottom: "40px" }}>
            Откройте мир роскоши и азарта.<br />Откройте ящики, выиграйте состояние.
          </p>
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", justifyContent: "center" }}>
            <button className="luxury-btn" onClick={() => setPage("game")} style={{ padding: "14px 40px", borderRadius: "9999px", fontSize: "13px" }}>
              Начать игру
            </button>
            <button
              onClick={() => setPage("rules")}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(201,168,76,0.1)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              style={{
                padding: "14px 40px", borderRadius: "9999px", fontSize: "13px",
                background: "transparent", border: "1px solid rgba(201,168,76,0.5)",
                color: "var(--gold)", cursor: "pointer",
                fontFamily: "'Montserrat', sans-serif", fontWeight: 700,
                letterSpacing: "0.12em", textTransform: "uppercase",
                transition: "background 0.3s",
              }}
            >
              Правила
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "0 16px 80px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
          {[
            { value: "2,847", label: "Победителей", icon: "🏆" },
            { value: "₽1.2M", label: "Выиграно сегодня", icon: "💰" },
            { value: "99.8%", label: "Честная игра", icon: "⚖️" },
          ].map((stat, i) => (
            <div
              key={i}
              className="velvet-card animate-fade-in-up"
              style={{ borderRadius: "20px", padding: "24px 16px", textAlign: "center", animationDelay: `${i * 0.1}s` }}
            >
              <div style={{ fontSize: "30px", marginBottom: "8px" }}>{stat.icon}</div>
              <div className="gold-text" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "26px", fontWeight: 700 }}>{stat.value}</div>
              <div style={{ color: "#9CA3AF", fontSize: "11px", marginTop: "4px", letterSpacing: "0.08em" }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Game Page ─── */
const BET_PRESETS = [50, 100, 250, 500, 1000];

// Множители выигрыша: зависит от редкости (определяется случайно при открытии)
function rollPrize(bet: number): { multiplier: number; rarity: Box["rarity"]; prize_emoji: string } {
  const roll = Math.random();
  if (roll < 0.50) return { multiplier: 0.5 + Math.random() * 0.9,   rarity: "common",    prize_emoji: "💰" };
  if (roll < 0.80) return { multiplier: 1.2 + Math.random() * 1.3,   rarity: "rare",      prize_emoji: "💎" };
  if (roll < 0.95) return { multiplier: 2.5 + Math.random() * 2.5,   rarity: "epic",      prize_emoji: "✨" };
  return             { multiplier: 6   + Math.random() * 9,            rarity: "legendary", prize_emoji: "🏆" };
}

function GamePage({ balance, setBalance }: { balance: number; setBalance: (b: number) => void }) {
  const [boxes, setBoxes] = useState<Box[]>(INITIAL_BOXES.map(b => ({ ...b, prize: 0 })));
  const [bet, setBet] = useState(100);
  const [betInput, setBetInput] = useState("100");
  const [coinRain, setCoinRain] = useState(false);
  const [triumph, setTriumph] = useState<{ prize: number; emoji: string; mult: number } | null>(null);
  const [sessionProfit, setSessionProfit] = useState(0);
  const [balanceRef, setBalanceRef] = useState(balance);
  const openedCount = boxes.filter((b) => b.opened).length;

  useEffect(() => { setBalanceRef(balance); }, [balance]);

  const handleBetInput = (val: string) => {
    setBetInput(val);
    const num = parseInt(val, 10);
    if (!isNaN(num) && num > 0) setBet(num);
  };

  const openBox = useCallback((id: number) => {
    const box = boxes.find((b) => b.id === id);
    if (!box || box.opened || box.opening) return;
    if (balanceRef < bet) return;

    // Снимаем ставку
    const afterBet = balanceRef - bet;
    setBalance(afterBet);
    setBalanceRef(afterBet);

    setBoxes((prev) => prev.map((b) => b.id === id ? { ...b, opening: true } : b));

    setTimeout(() => {
      const { multiplier, rarity, prize_emoji } = rollPrize(bet);
      const prize = Math.round(bet * multiplier);
      const afterPrize = afterBet + prize;
      setBalance(afterPrize);
      setBalanceRef(afterPrize);
      setSessionProfit((prev) => prev + prize - bet);

      setBoxes((prev) => prev.map((b) =>
        b.id === id ? { ...b, opened: true, opening: false, prize, rarity, prize_emoji } : b
      ));

      setCoinRain(true);
      if (rarity === "legendary" || rarity === "epic") {
        setTimeout(() => setTriumph({ prize, emoji: prize_emoji, mult: multiplier }), 400);
      }
    }, 650);
  }, [boxes, bet, balanceRef, setBalance]);

  const resetBoxes = () => {
    setBoxes(INITIAL_BOXES.map(b => ({ ...b, prize: 0, opened: false, opening: false })));
    setSessionProfit(0);
  };

  const canOpen = balanceRef >= bet;

  return (
    <div style={{ minHeight: "100vh", maxWidth: "1100px", margin: "0 auto", padding: "96px 16px 80px" }}>
      <div className="animate-fade-in-up" style={{ textAlign: "center", marginBottom: "28px" }}>
        <h2 className="gold-text" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "46px", fontWeight: 700, margin: 0 }}>
          Игровое поле
        </h2>
        <p style={{ color: "#9CA3AF", letterSpacing: "0.06em", marginTop: "8px" }}>Укажите ставку и откройте ящик</p>
      </div>

      {/* ── Ставка ── */}
      <div className="velvet-card animate-fade-in-up" style={{
        borderRadius: "20px", padding: "20px 24px", marginBottom: "28px",
        display: "flex", flexDirection: "column", alignItems: "center", gap: "14px",
      }}>
        <p style={{ color: "#9CA3AF", fontSize: "11px", letterSpacing: "0.14em", textTransform: "uppercase", margin: 0 }}>
          Ваша ставка за ящик
        </p>

        {/* Input */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "22px" }}>🪙</span>
          <input
            type="number"
            min={1}
            value={betInput}
            onChange={(e) => handleBetInput(e.target.value)}
            style={{
              background: "rgba(201,168,76,0.07)",
              border: "1px solid rgba(201,168,76,0.4)",
              borderRadius: "12px",
              color: "#F0D080",
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "28px", fontWeight: 700,
              textAlign: "center",
              width: "160px", padding: "8px 12px",
              outline: "none",
            }}
          />
          <span style={{ color: "#9CA3AF", fontSize: "13px" }}>монет</span>
        </div>

        {/* Presets */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center" }}>
          {BET_PRESETS.map((p) => (
            <button
              key={p}
              onClick={() => { setBet(p); setBetInput(String(p)); }}
              style={{
                padding: "6px 16px", borderRadius: "9999px", fontSize: "12px",
                fontFamily: "'Montserrat', sans-serif", fontWeight: 700, cursor: "pointer",
                letterSpacing: "0.06em",
                background: bet === p ? "rgba(201,168,76,0.2)" : "transparent",
                border: bet === p ? "1px solid rgba(201,168,76,0.7)" : "1px solid rgba(201,168,76,0.25)",
                color: bet === p ? "var(--gold)" : "#9CA3AF",
                transition: "all 0.2s",
              }}
            >
              {p.toLocaleString()}
            </button>
          ))}
        </div>

        {!canOpen && (
          <p style={{ color: "#CC4444", fontSize: "12px", margin: 0, letterSpacing: "0.06em" }}>
            ⚠️ Недостаточно монет для ставки
          </p>
        )}
      </div>

      {/* Stats bar */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "24px", justifyContent: "center", flexWrap: "wrap" }}>
        {[
          { label: "Открыто", value: `${openedCount} / ${boxes.length}` },
          { label: "Прибыль за сессию", value: `${sessionProfit >= 0 ? "+" : ""}${sessionProfit.toLocaleString()} 🪙` },
        ].map((s, i) => (
          <div key={i} className="velvet-card" style={{ borderRadius: "14px", padding: "8px 20px", display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ color: "#9CA3AF", fontSize: "12px", letterSpacing: "0.08em" }}>{s.label}</span>
            <span
              className="gold-text"
              style={{
                fontFamily: "'Cormorant Garamond', serif", fontSize: "18px", fontWeight: 700,
                color: i === 1 ? (sessionProfit >= 0 ? undefined : "#CC4444") : undefined,
              }}
            >
              {s.value}
            </span>
          </div>
        ))}
      </div>

      {/* Boxes grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "18px" }}>
        {boxes.map((box, idx) => {
          const rarity = RARITIES[box.rarity];
          const isOpen = box.opened;
          return (
            <div
              key={box.id}
              className={`box-card velvet-card animate-fade-in-up ${box.opening ? "animate-box-open" : ""}`}
              style={{
                borderRadius: "20px", padding: "22px 14px",
                display: "flex", flexDirection: "column", alignItems: "center", gap: "10px",
                animationDelay: `${idx * 0.06}s`,
                border: `1px solid ${isOpen ? rarity.color + "44" : "rgba(201,168,76,0.22)"}`,
                boxShadow: isOpen
                  ? `0 0 18px ${rarity.glow}`
                  : "0 4px 20px rgba(0,0,0,0.5), 0 0 30px rgba(201,168,76,0.08)",
                opacity: isOpen ? 0.75 : (canOpen ? 1 : 0.6),
                cursor: isOpen || !canOpen ? "default" : "pointer",
                position: "relative", overflow: "hidden",
              }}
              onClick={() => canOpen && openBox(box.id)}
            >
              {/* Shimmer overlay for unopened */}
              {!isOpen && (
                <div style={{
                  position: "absolute", inset: 0, borderRadius: "20px",
                  background: "linear-gradient(135deg, transparent 40%, rgba(201,168,76,0.04) 50%, transparent 60%)",
                  backgroundSize: "200% 200%", animation: "shimmer 4s linear infinite",
                  pointerEvents: "none",
                }} />
              )}

              {/* Box emoji — все одинаковые закрытые */}
              <div style={{ fontSize: "52px", transition: "all 0.4s", filter: isOpen ? "none" : "drop-shadow(0 0 8px rgba(201,168,76,0.3))" }}>
                {isOpen ? box.prize_emoji : "🎁"}
              </div>

              {/* Label */}
              <div style={{ textAlign: "center" }}>
                {isOpen ? (
                  <>
                    <div style={{ color: rarity.color, fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "4px" }}>
                      {rarity.label}
                    </div>
                    <div
                      style={{
                        fontFamily: "'Cormorant Garamond', serif", fontSize: "22px", fontWeight: 700,
                        color: box.prize >= bet ? "#68D391" : "#FC8181",
                      }}
                    >
                      {box.prize >= bet ? "+" : ""}{(box.prize - bet).toLocaleString()} 🪙
                    </div>
                    <div style={{ color: "#9CA3AF", fontSize: "11px", marginTop: "2px" }}>
                      выиграно {box.prize.toLocaleString()}
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ color: "#C4B89A", fontSize: "13px", fontWeight: 600, letterSpacing: "0.04em", marginBottom: "2px" }}>
                      Ящик #{box.id}
                    </div>
                    <div style={{ color: "#9CA3AF", fontSize: "11px" }}>Содержимое скрыто</div>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {openedCount > 0 && (
        <div className="animate-fade-in-up" style={{ textAlign: "center", marginTop: "32px" }}>
          <button
            onClick={resetBoxes}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(201,168,76,0.1)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            style={{
              padding: "12px 32px", borderRadius: "9999px", fontSize: "13px",
              background: "transparent", border: "1px solid rgba(201,168,76,0.4)",
              color: "var(--gold)", cursor: "pointer",
              fontFamily: "'Montserrat', sans-serif", fontWeight: 700,
              letterSpacing: "0.12em", textTransform: "uppercase",
              transition: "background 0.3s",
            }}
          >
            🔄 Новый раунд
          </button>
        </div>
      )}

      <CoinRain active={coinRain} onDone={() => setCoinRain(false)} />
      {triumph && (
        <TriumphOverlay
          prize={triumph.prize}
          prizeEmoji={triumph.emoji}
          onClose={() => setTriumph(null)}
        />
      )}
    </div>
  );
}

/* ─── Profile Page ─── */
function ProfilePage({ balance }: { balance: number }) {
  return (
    <div style={{ minHeight: "100vh", paddingTop: "96px", maxWidth: "900px", margin: "0 auto", padding: "96px 16px 80px" }}>
      <div className="animate-fade-in-up" style={{ textAlign: "center", marginBottom: "36px" }}>
        <h2 className="gold-text" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "46px", fontWeight: 700, margin: 0 }}>
          Профиль
        </h2>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
        {/* Player card */}
        <div className="velvet-card animate-fade-in-up" style={{
          borderRadius: "28px", padding: "32px",
          background: "linear-gradient(135deg, #1E0C1A 0%, #3A1428 50%, #1E0C1A 100%)",
          border: "1px solid rgba(201,168,76,0.3)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
            <div className="animate-glow-pulse" style={{
              width: "72px", height: "72px", borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "radial-gradient(circle, rgba(201,168,76,0.3) 0%, transparent 70%)",
              border: "2px solid var(--gold)", fontSize: "36px",
            }}>👑</div>
            <div>
              <div className="gold-text" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "24px", fontWeight: 700 }}>Игрок</div>
              <div style={{ color: "#9CA3AF", fontSize: "11px", letterSpacing: "0.08em" }}>VIP · Золотой уровень</div>
            </div>
          </div>
          {[
            { label: "Баланс", value: `${balance.toLocaleString()} 🪙` },
            { label: "Уровень", value: "14 ⭐" },
            { label: "Игр сыграно", value: "247" },
            { label: "Побед", value: "189" },
          ].map((row, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid rgba(201,168,76,0.1)" }}>
              <span style={{ color: "#9CA3AF", fontSize: "13px" }}>{row.label}</span>
              <span className="gold-text" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "18px", fontWeight: 700 }}>{row.value}</span>
            </div>
          ))}
        </div>

        {/* Leaderboard */}
        <div className="velvet-card animate-fade-in-up" style={{ borderRadius: "28px", padding: "24px", animationDelay: "0.1s" }}>
          <h3 className="gold-text" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "22px", fontWeight: 700, marginBottom: "20px" }}>
            🏆 Таблица лидеров
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {LEADERBOARD.map((player, i) => (
              <div key={player.rank} className="animate-slide-in-left" style={{
                display: "flex", alignItems: "center", gap: "10px",
                borderRadius: "12px", padding: "8px 12px",
                animationDelay: `${i * 0.06}s`,
                background: player.rank <= 3 ? "rgba(201,168,76,0.07)" : "transparent",
                border: player.rank === 1 ? "1px solid rgba(201,168,76,0.25)" : "1px solid transparent",
              }}>
                <span style={{
                  fontSize: "13px", fontWeight: 700, width: "22px",
                  color: player.rank === 1 ? "#F0D080" : player.rank === 2 ? "#C0C0C0" : player.rank === 3 ? "#CD7F32" : "#6B7280",
                }}>{player.rank}</span>
                <span style={{ fontSize: "22px" }}>{player.avatar}</span>
                <span style={{ flex: 1, color: "#F5E6C8", fontSize: "13px", fontWeight: 500 }}>{player.name}</span>
                <span className="gold-text" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "15px", fontWeight: 700 }}>
                  {player.score.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div className="velvet-card animate-fade-in-up" style={{ borderRadius: "28px", padding: "24px", marginTop: "24px", animationDelay: "0.2s" }}>
        <h3 className="gold-text" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "22px", fontWeight: 700, marginBottom: "20px" }}>
          🎖 Достижения
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "16px" }}>
          {ACHIEVEMENTS.map((a, i) => (
            <div key={a.id} className="animate-fade-in-up" style={{
              borderRadius: "16px", padding: "18px 12px", textAlign: "center",
              background: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.2)",
              animationDelay: `${i * 0.07}s`,
            }}>
              <div style={{ fontSize: "30px", marginBottom: "8px" }}>{a.icon}</div>
              <div style={{ color: "#F5E6C8", fontSize: "12px", fontWeight: 600, marginBottom: "4px" }}>{a.title}</div>
              <div style={{ color: "#6B7280", fontSize: "11px" }}>{a.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Rules Page ─── */
function RulesPage() {
  const rules = [
    { icon: "📦", title: "Выберите ящик", desc: "Нажмите на любой доступный ящик, чтобы открыть его. Каждый ящик содержит призовые монеты." },
    { icon: "💎", title: "Редкость влияет на приз", desc: "Ящики бывают Обычными, Редкими, Эпическими и Легендарными. Чем выше редкость — тем больше выигрыш." },
    { icon: "🪙", title: "Монеты зачисляются сразу", desc: "После открытия ящика монеты мгновенно добавляются на баланс. Золотой дождь подтверждает победу!" },
    { icon: "🏆", title: "Эпик и Легенд — триумф", desc: "Если повезло открыть Эпический или Легендарный ящик, вас встретит торжественный экран победы." },
    { icon: "🔄", title: "Новый раунд", desc: "Когда все ящики открыты, нажмите «Новый раунд», чтобы начать снова с полным набором." },
    { icon: "📊", title: "Таблица лидеров", desc: "Набирайте монеты, чтобы попасть в топ и получить VIP-статус." },
  ];

  return (
    <div style={{ minHeight: "100vh", paddingTop: "96px", maxWidth: "800px", margin: "0 auto", padding: "96px 16px 80px" }}>
      <div className="animate-fade-in-up" style={{ textAlign: "center", marginBottom: "36px" }}>
        <h2 className="gold-text" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "46px", fontWeight: 700, margin: 0 }}>
          Правила игры
        </h2>
        <p style={{ color: "#9CA3AF", letterSpacing: "0.06em", marginTop: "8px" }}>Всё что нужно знать для победы</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {rules.map((r, i) => (
          <div key={i} className="velvet-card animate-slide-in-left" style={{
            borderRadius: "20px", padding: "20px 24px",
            display: "flex", gap: "18px", alignItems: "flex-start",
            animationDelay: `${i * 0.08}s`,
          }}>
            <div style={{
              width: "48px", height: "48px", borderRadius: "14px", flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.25)",
              fontSize: "22px",
            }}>{r.icon}</div>
            <div>
              <div className="gold-text" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "19px", fontWeight: 700, marginBottom: "4px" }}>
                {r.title}
              </div>
              <div style={{ color: "#D4C5A9", fontSize: "13px", lineHeight: 1.7 }}>{r.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="velvet-card animate-fade-in-up" style={{ borderRadius: "24px", padding: "24px", marginTop: "28px", animationDelay: "0.55s" }}>
        <h3 className="gold-text" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "22px", fontWeight: 700, textAlign: "center", marginBottom: "20px" }}>
          Редкость ящиков
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
          {(Object.entries(RARITIES) as [string, { color: string; label: string }][]).map(([, val]) => (
            <div key={val.label} style={{
              borderRadius: "12px", padding: "14px", textAlign: "center",
              background: `${val.color}11`, border: `1px solid ${val.color}44`,
            }}>
              <div style={{ color: val.color, fontSize: "13px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>
                {val.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Root ─── */
export default function Index() {
  const [page, setPage] = useState<Page>("home");
  const [balance, setBalance] = useState(1000);

  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [page]);

  return (
    <div style={{ background: "var(--velvet)", minHeight: "100vh" }}>
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        background: "radial-gradient(ellipse at 20% 50%, rgba(122,0,0,0.07) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(201,168,76,0.04) 0%, transparent 50%)",
      }} />

      <Nav page={page} setPage={setPage} balance={balance} />

      <div style={{ position: "relative", zIndex: 1 }}>
        {page === "home" && <HomePage setPage={setPage} />}
        {page === "game" && <GamePage balance={balance} setBalance={setBalance} />}
        {page === "profile" && <ProfilePage balance={balance} />}
        {page === "rules" && <RulesPage />}
      </div>

      <footer style={{
        textAlign: "center", padding: "28px 24px",
        borderTop: "1px solid rgba(201,168,76,0.1)",
        color: "#4B5563", fontSize: "12px", letterSpacing: "0.08em",
        position: "relative", zIndex: 1,
      }}>
        <span className="gold-text" style={{ fontSize: "14px", fontFamily: "'Cormorant Garamond', serif" }}>
          GRAND ROYAL CASINO
        </span>
        <span style={{ margin: "0 10px", color: "rgba(201,168,76,0.3)" }}>✦</span>
        Игра только для развлечения · 18+
      </footer>
    </div>
  );
}