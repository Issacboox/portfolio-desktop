"use client";

import { Send } from "lucide-react";
import { useState, type FormEvent } from "react";
import { profile } from "@/content/profile";

/** Compose window. Sends through the visitor's own mail app (mailto), so no backend or spam inbox needed. */
export function MailApp() {
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("Let's talk about a role");
  const [message, setMessage] = useState("");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const body = `${message}\n\n— ${name}`.trim();
    window.location.href = `mailto:${profile.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  const field = "w-full bg-transparent py-2.5 text-sm outline-none placeholder:text-zinc-400";
  return (
    <form onSubmit={onSubmit} className="flex h-full flex-col">
      <div className="divide-y divide-black/5 px-5 dark:divide-white/10">
        <div className="flex items-center gap-3"><span className="w-16 text-sm text-zinc-400">To:</span><span className="rounded-md bg-blue-500/10 px-2 py-0.5 text-sm text-blue-600 dark:text-blue-400">{profile.name}</span></div>
        <label className="flex items-center gap-3"><span className="w-16 text-sm text-zinc-400">From:</span><input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name and company" className={field} /></label>
        <label className="flex items-center gap-3"><span className="w-16 text-sm text-zinc-400">Subject:</span><input value={subject} onChange={(e) => setSubject(e.target.value)} className={field} /></label>
      </div>
      <textarea
        required
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Hi Nurarat, we're hiring for…"
        aria-label="Message"
        className="min-h-0 flex-1 resize-none border-t border-black/5 bg-transparent px-5 py-4 text-sm leading-relaxed outline-none placeholder:text-zinc-400 dark:border-white/10"
      />
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-black/5 px-5 py-3 dark:border-white/10">
        <div className="flex gap-3 text-xs text-zinc-500">
          <a className="hover:text-zinc-900 dark:hover:text-white" href={profile.linkedin} target="_blank" rel="noreferrer">LinkedIn ↗</a>
          <a className="hover:text-zinc-900 dark:hover:text-white" href={profile.github} target="_blank" rel="noreferrer">GitHub ↗</a>
        </div>
        <button type="submit" className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-500">
          <Send className="size-3.5" /> Send
        </button>
      </div>
    </form>
  );
}
