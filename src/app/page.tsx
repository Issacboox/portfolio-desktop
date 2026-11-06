import { OSRoot } from "@/components/os/os-root";
import { profile, projects, timeline } from "@/content/profile";

export default function Home() {
  return (
    <main>
      {/* Server-rendered summary: read by search engines, screen readers and no-JS visitors. */}
      <div className="sr-only">
        <h1>
          {profile.name} — {profile.role}
        </h1>
        <p>{profile.headline}</p>
        <p>
          {profile.location}. {profile.availability}.
        </p>
        <h2>Experience</h2>
        <ul>
          {timeline
            .filter((t) => !t.next)
            .map((t) => (
              <li key={t.org}>
                {t.title}, {t.org} ({t.period})
              </li>
            ))}
        </ul>
        <h2>Projects</h2>
        <ul>
          {projects.map((p) => (
            <li key={p.slug}>
              {p.title}: {p.summary}
            </li>
          ))}
        </ul>
        <p>
          Contact: <a href={`mailto:${profile.email}`}>{profile.email}</a> · <a href={profile.linkedin}>LinkedIn</a> ·{" "}
          <a href={profile.github}>GitHub</a>
        </p>
      </div>
      <noscript>
        <div style={{ padding: 24, color: "white", fontFamily: "system-ui" }}>
          NurOS needs JavaScript. Email {profile.email} or visit {profile.linkedin}.
        </div>
      </noscript>
      <OSRoot />
    </main>
  );
}
