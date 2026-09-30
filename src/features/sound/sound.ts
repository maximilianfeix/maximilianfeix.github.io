import { useUI } from "@/store/ui";

// Tiny synthesized sounds – no audio files to download. Nothing plays unless the visitor turns sound on.
let ctx: AudioContext | null = null;

function audio() {
  if (!ctx) ctx = new AudioContext();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function blip(freq: number, length: number, gain: number, type: OscillatorType = "sine") {
  if (!useUI.getState().sound) return;
  const a = audio();
  const osc = a.createOscillator();
  const g = a.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, a.currentTime);
  osc.frequency.exponentialRampToValueAtTime(freq * 0.6, a.currentTime + length);
  g.gain.setValueAtTime(0.0001, a.currentTime);
  g.gain.exponentialRampToValueAtTime(gain, a.currentTime + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + length);
  osc.connect(g).connect(a.destination);
  osc.start();
  osc.stop(a.currentTime + length + 0.02);
}

export const sound = {
  tick: () => blip(2400, 0.03, 0.012, "triangle"),
  confirm: () => {
    blip(660, 0.12, 0.03);
    setTimeout(() => blip(990, 0.16, 0.025), 70);
  },
  whoosh: () => blip(180, 0.5, 0.03, "sine"),
};
