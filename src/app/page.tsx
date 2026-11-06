import { OSRoot } from "@/components/os/os-root";
import { posts } from "@/content/posts";
import { profile, projects, skills, stack, timeline } from "@/content/profile";
import { siteDescription, siteUrl } from "@/lib/site";

// Structured data: tells search engines this page is about a person and their writing.
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: "NurOS",
      description: siteDescription,
      inLanguage: "en-GB",
    },
    {
      "@type": "Person",
      "@id": `${siteUrl}/#person`,
      name: profile.name,
      alternateName: "Maru",
      jobTitle: profile.role,
      url: siteUrl,
      email: `mailto:${profile.email}`,
      image: `${siteUrl}/opengraph-image`,
      address: { "@type": "PostalAddress", addressLocality: "Bangkok", addressCountry: "TH" },
      alumniOf: { "@type": "CollegeOrUniversity", name: "Burapha University" },
      knowsAbout: [...stack, ...skills],
      knowsLanguage: ["th", "en"],
      sameAs: [profile.github, profile.linkedin],
    },
    {
      "@type": "ProfilePage",
      "@id": `${siteUrl}/#profile`,
      url: siteUrl,
      mainEntity: { "@id": `${siteUrl}/#person` },
      isPartOf: { "@id": `${siteUrl}/#website` },
    },
  ],
};

export default function Home() {
  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      {/* Server-rendered summary: read by search engines, screen readers and no-JS visitors. */}
      <div className="sr-only">
        <h1>
          {profile.name} — {profile.role}
        </h1>
        <p>{profile.headline}</p>
        <p>
          {profile.location}. {profile.availability}. {profile.relocation}
        </p>
        <h2>Experience</h2>
        <ul>
          {timeline
            .filter((t) => !t.next)
            .map((t) => (
              <li key={t.org}>
                {t.title}, {t.org} ({t.period}). {t.points?.join(" ")}
              </li>
            ))}
        </ul>
        <h2>Skills</h2>
        <p>{[...skills, ...stack].join(", ")}</p>
        <h2>Projects</h2>
        <ul>
          {projects.map((p) => (
            <li key={p.slug}>
              {p.title}: {p.summary}
            </li>
          ))}
        </ul>
        <h2>Blog</h2>
        <ul>
          {posts.map((p) => (
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
