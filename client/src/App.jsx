import { useEffect, useState } from "react";

const FALLBACK_LAUNCH = "2026-12-01T00:00:00";

function getTimeLeft(target) {
  const diff = Math.max(0, new Date(target) - new Date());
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export default function App() {
  const [message, setMessage] = useState("Our website will be live soon!");
  const [launchDate, setLaunchDate] = useState(FALLBACK_LAUNCH);
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(FALLBACK_LAUNCH));
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/launch")
      .then((res) => res.json())
      .then((data) => {
        if (data.message) setMessage(data.message);
        if (data.launchDate) setLaunchDate(data.launchDate);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setTimeLeft(getTimeLeft(launchDate));
    const id = setInterval(() => setTimeLeft(getTimeLeft(launchDate)), 1000);
    return () => clearInterval(id);
  }, [launchDate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "", text: "" });
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setStatus({ type: "success", text: data.message });
      setEmail("");
    } catch (err) {
      setStatus({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  }

  const units = [
    ["Days", timeLeft.days],
    ["Hours", timeLeft.hours],
    ["Minutes", timeLeft.minutes],
    ["Seconds", timeLeft.seconds],
  ];

  return (
    <main className="page">
      <div className="blob blob-1" />
      <div className="blob blob-2" />

      <section className="card">
        <span className="badge">🚀 Under Construction</span>
        <h1>
          Coming <span className="gradient">Soon</span>
        </h1>
        <p className="subtitle">{message}</p>
        <p className="muted">
          We're working hard to bring you something amazing. Stay tuned!
        </p>

        <div className="countdown">
          {units.map(([label, value]) => (
            <div className="time-box" key={label}>
              <span className="time-value">{String(value).padStart(2, "0")}</span>
              <span className="time-label">{label}</span>
            </div>
          ))}
        </div>

        <form className="notify" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? "Sending..." : "Notify Me"}
          </button>
        </form>
        {status.text && <p className={`status ${status.type}`}>{status.text}</p>}
      </section>

      <footer>© {new Date().getFullYear()} All rights reserved.</footer>
    </main>
  );
}
