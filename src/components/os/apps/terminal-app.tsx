"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { profile, projects, skills, stack, timeline } from "@/content/profile";
import { useOS, type AppId } from "../os-context";

type Entry = { id: number; input?: string; output: ReactNode };

const PROMPT = "guest@nuros ~ %";
const APP_NAMES: Record<string, AppId> = {
  about: "about",
  projects: "projects",
  blog: "blog",
  contact: "mail",
  mail: "mail",
  settings: "settings",
};

const Hl = ({ children }: { children: ReactNode }) => <span className="text-orange-400">{children}</span>;
const Dim = ({ children }: { children: ReactNode }) => <span className="text-zinc-500">{children}</span>;

function timeIn(tz: string) {
  return new Intl.DateTimeFormat("en-GB", { timeZone: tz, hour: "2-digit", minute: "2-digit", weekday: "short" }).format(new Date());
}

type Turn = { role: "user" | "assistant"; content: string };
type Source = { n: number; source: string; section?: string; excerpt: string };

/** Asks POST /api/v1/chat: answers grounded in my profile, projects, blog and docs, with sources. */
async function askAI(question: string, history: Turn[]): Promise<{ node: ReactNode; answer?: string }> {
  try {
    const res = await fetch("/api/v1/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, history }),
    });
    const data = (await res.json()) as { answer?: string; sources?: Source[]; error?: string };
    if (!res.ok || !data.answer) {
      return { node: <span className="text-amber-400">{data.error ?? "The AI couldn't answer right now."}</span> };
    }
    return { node: <AiAnswer answer={data.answer} sources={data.sources ?? []} />, answer: data.answer };
  } catch {
    return { node: <span className="text-amber-400">Couldn&apos;t reach the AI. Check your connection and try again.</span> };
  }
}

function AiAnswer({ answer, sources }: { answer: string; sources: Source[] }) {
  // Turn [1] markers into small highlighted chips.
  const parts = answer.split(/([d+])/g);
  return (
    <div>
      <div>
        <Hl>ai</Hl>{" "}
        {parts.map((p, i) =>
          /^[d+]$/.test(p) ? (
            <sup key={i} className="mx-0.5 rounded bg-orange-400/20 px-1 text-[10px] text-orange-300">
              {p.slice(1, -1)}
            </sup>
          ) : (
            <span key={i}>{p}</span>
          ),
        )}
      </div>
      {sources.length ? (
        <div className="mt-1.5 space-y-0.5 border-l border-zinc-700 pl-3 text-[12px]">
          {sources.map((s) => (
            <div key={s.n} title={s.excerpt}>
              <span className="text-orange-300">[{s.n}]</span> <Dim>{s.source}{s.section ? ` › ${s.section}` : ""}</Dim>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function TerminalApp({ props }: { props?: Record<string, string> }) {
  const os = useOS();
  const [entries, setEntries] = useState<Entry[]>(() => [{ id: 0, output: <Welcome /> }]);
  const [value, setValue] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [hIndex, setHIndex] = useState(-1);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(1);
  const askedFromWidget = useRef(false);
  const convo = useRef<Turn[]>([]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [entries, busy]);

  const push = (input: string | undefined, output: ReactNode) =>
    setEntries((e) => [...e, { id: nextId.current++, input, output }]);

  async function run(raw: string) {
    const line = raw.trim();
    if (!line) return push("", null);
    setHistory((h) => [line, ...h].slice(0, 50));
    setHIndex(-1);
    const [cmd, ...rest] = line.split(/\s+/);
    const arg = rest.join(" ");

    switch (cmd.toLowerCase()) {
      case "help":
        return push(line, <Help />);
      case "clear":
        convo.current = [];
        return setEntries([]);
      case "whoami":
        return push(line, <span>{profile.name} — {profile.role}, {profile.location}. <Hl>{profile.availability}.</Hl></span>);
      case "about":
        return push(line, <span>IT graduate (Burapha University). Started in C#/.NET backends, now full-stack with Next.js &amp; React. Looking for a UK team. Type <Hl>open about</Hl> for more.</span>);
      case "experience":
      case "exp":
        return push(
          line,
          <div className="space-y-0.5">
            {timeline.filter((t) => !t.next).map((t) => (
              <div key={t.org}><Dim>{t.period.padEnd(20, " ")}</Dim> <Hl>{t.org}</Hl> — {t.title}</div>
            ))}
          </div>,
        );
      case "skills":
        return push(line, <div>{skills.map((s) => <div key={s}>• {s}</div>)}</div>);
      case "stack":
        return push(line, <span>{stack.join("  ·  ")}</span>);
      case "projects":
      case "ls":
        if (cmd === "ls" && arg) return push(line, <span>ls: {arg}: No such file or directory</span>);
        return push(
          line,
          cmd === "ls" ? (
            <span className="text-sky-400">about.txt  projects/  blog/  contact.txt  <a className="underline" href={profile.cv} download>resume.pdf</a></span>
          ) : (
            <div>{projects.map((p) => <div key={p.slug}><Hl>{p.title}</Hl> <Dim>[{p.status}]</Dim></div>)}</div>
          ),
        );
      case "contact":
      case "socials":
        return push(
          line,
          <div>
            <div>email     <a className="underline" href={`mailto:${profile.email}`}>{profile.email}</a></div>
            <div>linkedin  <a className="underline" href={profile.linkedin} target="_blank" rel="noreferrer">{profile.linkedin.replace("https://www.", "")}</a></div>
            <div>github    <a className="underline" href={profile.github} target="_blank" rel="noreferrer">{profile.github.replace("https://", "")}</a></div>
          </div>,
        );
      case "relocate":
      case "visa":
      case "sponsorship":
        return push(line, <span>{profile.relocation} <Hl>Open to UK roles.</Hl></span>);
      case "date":
      case "time":
        return push(line, <span>Bangkok {timeIn("Asia/Bangkok")}  ·  London {timeIn("Europe/London")}</span>);
      case "open": {
        const id = APP_NAMES[arg.toLowerCase()];
        if (!id) return push(line, <span>open: unknown app &quot;{arg}&quot;. Try: {Object.keys(APP_NAMES).join(", ")}</span>);
        os.open(id);
        return push(line, <Dim>Opening {arg}…</Dim>);
      }
      case "neofetch":
        return push(line, <Neofetch />);
      case "echo":
        return push(line, <span>{arg}</span>);
      case "sudo":
        if (/hire/i.test(arg))
          return push(
            line,
            <div>
              <div><Dim>[sudo] password for recruiter: ********</Dim></div>
              <div className="text-emerald-400">✓ Access granted. Preparing offer letter…</div>
              <div>Just kidding — but let&apos;s talk: <a className="underline" href={`mailto:${profile.email}`}>{profile.email}</a></div>
            </div>,
          );
        return push(line, <span>Nice try. This incident will be reported. 😄</span>);
      case "ask":
        break;
      default:
        break;
    }

    // Anything else is a question for the AI.
    const question = cmd.toLowerCase() === "ask" ? arg : line;
    setBusy(true);
    const { node, answer } = await askAI(question, convo.current);
    if (answer) convo.current = [...convo.current, { role: "user" as const, content: question }, { role: "assistant" as const, content: answer }].slice(-6);
    setBusy(false);
    push(line, node);
  }

  // A question handed over from the desktop "Ask my AI" widget runs straight away.
  useEffect(() => {
    if (!props?.q || askedFromWidget.current) return;
    askedFromWidget.current = true;
    void run(props.q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props?.q]);

  function onKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      const v = value;
      setValue("");
      void run(v);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const i = Math.min(hIndex + 1, history.length - 1);
      if (history[i] !== undefined) {
        setHIndex(i);
        setValue(history[i]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const i = hIndex - 1;
      setHIndex(Math.max(i, -1));
      setValue(i >= 0 ? history[i] : "");
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      setEntries([]);
    }
  }

  return (
    <div
      className="h-full overflow-y-auto bg-zinc-950/95 p-4 font-mono text-[13px] leading-relaxed text-zinc-200"
      onClick={() => inputRef.current?.focus()}
    >
      {entries.map((e) => (
        <div key={e.id} className="mb-1.5">
          {e.input !== undefined ? (
            <div><span className="text-emerald-400">{PROMPT}</span> {e.input}</div>
          ) : null}
          {e.output ? <div className="whitespace-pre-wrap">{e.output}</div> : null}
        </div>
      ))}
      {busy ? <div className="text-zinc-500"><span className="animate-pulse">ai is reading the docs…</span></div> : null}
      <div className="flex items-center gap-2">
        <span className="shrink-0 text-emerald-400">{PROMPT}</span>
        <input
          ref={inputRef}
          autoFocus
          value={value}
          disabled={busy}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKey}
          aria-label="Terminal input — type a command or ask a question"
          spellCheck={false}
          autoComplete="off"
          className="min-w-0 flex-1 bg-transparent text-zinc-100 caret-orange-400 outline-none"
        />
      </div>
      <div ref={endRef} />
    </div>
  );
}

function Welcome() {
  return (
    <div className="mb-2">
      <pre className="text-orange-400">{String.raw` _   _               ___  ____
| \ | |_   _ _ __   / _ \/ ___|
|  \| | | | | '__| | | | \___ \
| |\  | |_| | |    | |_| |___) |
|_| \_|\__,_|_|     \___/|____/ `}</pre>
      <div>Welcome to NurOS. I&apos;m an AI that knows Nurarat&apos;s work.</div>
      <div><Dim>Type a question, or </Dim><Hl>help</Hl><Dim> for commands. Try </Dim><Hl>sudo hire nurarat</Hl><Dim>.</Dim></div>
    </div>
  );
}

function Help() {
  const rows: [string, string][] = [
    ["<question>", "ask the AI anything about my work"],
    ["whoami", "who I am"],
    ["about", "short bio"],
    ["experience", "where I've worked"],
    ["skills / stack", "what I do and use"],
    ["projects", "things I've built"],
    ["contact", "email, LinkedIn, GitHub"],
    ["open <app>", "open about, projects, blog, contact, settings"],
    ["relocate", "relocation, visa and remote work"],
    ["date", "time in Bangkok and London"],
    ["neofetch", "system info"],
    ["clear", "clear the screen (Ctrl+L)"],
  ];
  return (
    <div>
      {rows.map(([c, d]) => (
        <div key={c}><Hl>{c.padEnd(16, " ")}</Hl> <Dim>{d}</Dim></div>
      ))}
    </div>
  );
}

function Neofetch() {
  return (
    <div className="flex gap-6">
      <pre className="text-orange-400">{String.raw`   .--.
  |o_o |
  |:_/ |
 //   \ \
(|     | )
/'\_   _/'\
\___)=(___/`}</pre>
      <div>
        <div><Hl>guest</Hl>@<Hl>nuros</Hl></div>
        <div>-----------</div>
        <div><Hl>OS</Hl>: NurOS 2.0 (Next.js 16)</div>
        <div><Hl>Host</Hl>: {profile.name}</div>
        <div><Hl>Uptime</Hl>: 2+ years shipping code</div>
        <div><Hl>Shell</Hl>: zsh + Claude</div>
        <div><Hl>Languages</Hl>: C#, TypeScript, SQL</div>
        <div><Hl>Location</Hl>: Bangkok (UTC+7 · 6–7h ahead of London)</div>
        <div><Hl>Status</Hl>: <span className="text-emerald-400">{profile.availability}</span></div>
      </div>
    </div>
  );
}
