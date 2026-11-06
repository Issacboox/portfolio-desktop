// Blog posts as structured blocks, so the Blog app can render them like a rich document:
// headings feed the table of contents, code gets a copy button, flows become diagrams.
// Later these move into the Supabase `posts` table and feed the AI chat.

export type Block =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "list"; items: string[]; ordered?: boolean }
  | { type: "code"; lang: string; code: string; caption?: string }
  | { type: "callout"; tone: "tip" | "note" | "warn"; title?: string; text: string }
  | { type: "flow"; steps: { title: string; body?: string }[]; caption?: string }
  | { type: "table"; head: string[]; rows: string[][] };

export type Post = {
  slug: string;
  title: string;
  tag: string;
  summary: string;
  date: string;
  minutes: number;
  accent: string;
  blocks: Block[];
};

export const posts: Post[] = [
  {
    slug: "how-claude-works",
    title: "How Claude actually works: tokens, context and the harness",
    tag: "AI",
    summary: "What a token is, how you're billed for them, and why the program around the model matters as much as the model.",
    date: "Nov 2026",
    minutes: 7,
    accent: "from-orange-400 to-rose-500",
    blocks: [
      {
        type: "p",
        text: "I use Claude every day, both as a coding assistant and inside this portfolio's Terminal. For a long time I treated it as a magic box. Once I understood three ideas (tokens, the context window and the harness), I started getting much better results and much smaller bills. Here's how I'd explain it to a friend.",
      },
      { type: "h2", text: "1. Everything is tokens" },
      {
        type: "p",
        text: "A language model doesn't read letters or words. Text is first split into tokens: small chunks that are often a whole short word, part of a longer word, a space plus a word, or a piece of punctuation. The model reads a sequence of tokens and predicts the next token, again and again, until it decides to stop.",
      },
      {
        type: "callout",
        tone: "tip",
        title: "Rule of thumb",
        text: "For English, one token is roughly 3–4 characters, so 1,000 tokens is about 750 words. Thai and other non-Latin scripts usually need more tokens for the same meaning, so the same message in Thai costs more.",
      },
      {
        type: "p",
        text: "The exact split depends on the model's tokenizer, so don't count by hand. The API reports real usage on every response, and there is a token-counting endpoint you can call before sending.",
      },
      {
        type: "code",
        lang: "ts",
        caption: "Every response tells you exactly what you used",
        code: `const res = await client.messages.create({
  model: "claude-…",          // whichever model you choose
  max_tokens: 1024,           // cap on the reply length
  messages: [{ role: "user", content: "Explain DI lifetimes in .NET" }],
});

console.log(res.usage);
// { input_tokens: 14, output_tokens: 412, ... }`,
      },
      { type: "h2", text: "2. How the bill is calculated" },
      {
        type: "p",
        text: "You pay per token, with separate prices for input (everything you send) and output (what the model writes). Output tokens cost several times more than input tokens, because generating is the expensive part. Prices are quoted per million tokens and differ by model.",
      },
      {
        type: "code",
        lang: "text",
        code: `cost = input_tokens  × input_price  / 1,000,000
     + output_tokens × output_price / 1,000,000`,
      },
      {
        type: "p",
        text: "The surprise for most people: the model has no memory between calls. In a chat, every new turn re-sends the whole conversation so far. Turn 20 pays for turns 1–19 again as input. That's why long chats get slow and expensive.",
      },
      {
        type: "list",
        items: [
          "Prompt caching: if the start of your prompt (system prompt, docs, tool definitions) is identical between calls, it can be cached. Cached input is read at a fraction of the normal input price.",
          "Keep system prompts tight and put stable content first, so the cacheable prefix is as long as possible.",
          "Set max_tokens sensibly. It caps how long the answer can be, and output is the expensive side.",
          "Pick the smallest model that does the job well. Classification and extraction rarely need the biggest model.",
        ],
      },
      { type: "h2", text: "3. The context window" },
      {
        type: "p",
        text: "The context window is the maximum number of tokens the model can look at in one request: system prompt, conversation history, tool results and the reply together. Anything outside the window simply doesn't exist for the model. Tools that run long tasks summarise or trim older history so they stay inside it.",
      },
      { type: "h2", text: "4. The harness: the program around the model" },
      {
        type: "p",
        text: "On its own, a model can only produce text. A harness is the program that wraps it: it builds the prompt, gives the model tools it may call, runs those tools, feeds the results back, and decides when the task is done. Claude Code is a harness. The AI chat I am building for this site's Terminal runs the same kind of loop.",
      },
      {
        type: "flow",
        caption: "The agent loop every harness runs",
        steps: [
          { title: "Build prompt", body: "system + history + tool list" },
          { title: "Model replies", body: "text, or a tool call" },
          { title: "Run the tool", body: "read a file, query a DB…" },
          { title: "Send result back", body: "as a tool_result" },
          { title: "Repeat or finish", body: "until no more tool calls" },
        ],
      },
      {
        type: "code",
        lang: "ts",
        caption: "A minimal harness loop",
        code: `let messages = [{ role: "user", content: question }];

while (true) {
  const res = await client.messages.create({ model, max_tokens: 1024, tools, messages });
  messages.push({ role: "assistant", content: res.content });

  if (res.stop_reason !== "tool_use") break;     // final answer

  const results = [];
  for (const block of res.content) {
    if (block.type === "tool_use") {
      const output = await runTool(block.name, block.input);   // your code
      results.push({ type: "tool_result", tool_use_id: block.id, content: output });
    }
  }
  messages.push({ role: "user", content: results });
}`,
      },
      {
        type: "callout",
        tone: "note",
        title: "Why this matters",
        text: "Most of the quality of an AI feature comes from the harness, not the model: which tools exist, what goes into the context, how errors are handled, and when to stop. Every tool result also costs input tokens on the next turn, so a good harness returns short, relevant results.",
      },
      { type: "h2", text: "5. How I use it day to day" },
      {
        type: "list",
        items: [
          "Give context up front: the file, the error, what I already tried. A good first message saves several expensive turns.",
          "Ask for a plan before code on anything bigger than one file.",
          "Start a fresh conversation when the topic changes, instead of dragging a long history along.",
          "Always review the diff. It's a very fast teammate, not an infallible one.",
        ],
      },
    ],
  },
  {
    slug: "dotnet-solution-structure",
    title: "How I structure a .NET API solution",
    tag: ".NET",
    summary: "The folder and project layout I use for ASP.NET Core APIs, and why each layer exists.",
    date: "Nov 2026",
    minutes: 6,
    accent: "from-violet-400 to-purple-600",
    blocks: [
      {
        type: "p",
        text: "At Sirisoft I worked on several .NET backends (e-Quotation, e-Commerce, car sales). The codebases that felt easiest to change had the same shape: clear layers, dependencies pointing inwards, and business rules that didn't know about HTTP or the database. This is the layout I reach for now.",
      },
      {
        type: "code",
        lang: "text",
        caption: "Solution layout",
        code: `Quotation.sln
├─ src/
│  ├─ Quotation.Api/             ← HTTP: endpoints, middleware, Program.cs
│  ├─ Quotation.Application/     ← use cases, DTOs, validation, interfaces
│  ├─ Quotation.Domain/          ← entities, value objects, business rules
│  └─ Quotation.Infrastructure/  ← EF Core, repositories, external APIs, files
└─ tests/
   ├─ Quotation.UnitTests/        ← xUnit, Domain + Application
   └─ Quotation.IntegrationTests/ ← API + real database in a container`,
      },
      {
        type: "flow",
        caption: "Dependencies point inwards",
        steps: [
          { title: "Api", body: "knows Application" },
          { title: "Infrastructure", body: "implements Application interfaces" },
          { title: "Application", body: "knows Domain" },
          { title: "Domain", body: "knows nothing else" },
        ],
      },
      { type: "h2", text: "What lives where" },
      {
        type: "table",
        head: ["Project", "Contains", "Must not contain"],
        rows: [
          ["Domain", "Entities, enums, business rules (e.g. a quote can't be approved twice)", "EF Core, HTTP, JSON attributes"],
          ["Application", "Use cases like CreateQuotation, DTOs, validators, IQuotationRepository", "SQL, controllers"],
          ["Infrastructure", "DbContext, migrations, repositories, WCC / K2 / S3 clients", "Business decisions"],
          ["Api", "Endpoints, auth, error handling middleware, DI wiring", "Business logic"],
        ],
      },
      { type: "h2", text: "Program.cs stays boring" },
      {
        type: "code",
        lang: "csharp",
        code: `var builder = WebApplication.CreateBuilder(args);

builder.Services
    .AddApplication()                        // extension in Application
    .AddInfrastructure(builder.Configuration) // extension in Infrastructure
    .AddProblemDetails();

var app = builder.Build();

app.UseExceptionHandler();
app.UseAuthentication();
app.UseAuthorization();

app.MapQuotationEndpoints();
app.Run();`,
      },
      {
        type: "p",
        text: "Each layer registers its own services through an extension method, so Program.cs reads like a table of contents. When someone new joins the team, this is the first file they open.",
      },
      { type: "h2", text: "Feature folders inside each layer" },
      {
        type: "p",
        text: "Inside Application I group by feature, not by type. Everything about quotations sits together: the command, its handler, its validator and its DTO. Finding code becomes \"go to the Quotations folder\" instead of hunting through Services, Models and Validators.",
      },
      {
        type: "callout",
        tone: "warn",
        title: "Don't over-engineer small services",
        text: "For a tiny internal API with three endpoints, one project with folders is fine. I split into layers when the business rules are real and the service will live for years.",
      },
    ],
  },
  {
    slug: "dotnet-things-i-wish-i-knew",
    title: ".NET things I wish I'd known in my first year",
    tag: ".NET",
    summary: "DI lifetimes, async all the way, EF Core tracking, the N+1 trap and a few habits that make APIs fast.",
    date: "Nov 2026",
    minutes: 6,
    accent: "from-sky-400 to-blue-600",
    blocks: [
      {
        type: "p",
        text: "A lot of bugs and slow endpoints come from a handful of misunderstandings. None of them are advanced. They're just easy to miss when you're learning on the job.",
      },
      { type: "h2", text: "Dependency injection lifetimes" },
      {
        type: "table",
        head: ["Lifetime", "One instance per…", "Good for"],
        rows: [
          ["Singleton", "application", "Config, caches, HttpClient factories"],
          ["Scoped", "HTTP request", "DbContext, unit of work, current user"],
          ["Transient", "every injection", "Small stateless helpers"],
        ],
      },
      {
        type: "callout",
        tone: "warn",
        title: "The classic bug",
        text: "Injecting a Scoped service (like DbContext) into a Singleton. The singleton keeps the first request's DbContext forever, and you get threading errors and stale data. ASP.NET Core catches this in Development with scope validation, so don't turn it off.",
      },
      { type: "h2", text: "Async all the way down" },
      {
        type: "code",
        lang: "csharp",
        code: `// ❌ blocks a thread-pool thread, can deadlock and kills throughput under load
var quote = _repo.GetAsync(id).Result;

// ✅ frees the thread while waiting for the database
var quote = await _repo.GetAsync(id, cancellationToken);`,
      },
      {
        type: "p",
        text: "Pass the CancellationToken through, too. If the user closes the page, the database query stops instead of finishing for nobody.",
      },
      { type: "h2", text: "EF Core: read-only queries and the N+1 trap" },
      {
        type: "code",
        lang: "csharp",
        code: `// N+1: one query for quotes, then one more query per quote for its items
var quotes = await db.Quotes.ToListAsync();
foreach (var q in quotes) total += q.Items.Sum(i => i.Price); // lazy loads!

// One query, no change tracking, only the columns we need
var totals = await db.Quotes
    .AsNoTracking()
    .Select(q => new { q.Id, Total = q.Items.Sum(i => i.Price) })
    .ToListAsync(ct);`,
      },
      {
        type: "list",
        items: [
          "Use AsNoTracking() for read-only queries. Tracking costs memory and CPU you don't need.",
          "Project with Select into a DTO instead of loading whole entities.",
          "Turn on EF Core's SQL logging in development and actually read the queries.",
          "Check the execution plan for slow ones. A missing index beats any code optimisation.",
        ],
      },
      { type: "h2", text: "Options pattern instead of magic strings" },
      {
        type: "code",
        lang: "csharp",
        code: `public sealed class WccOptions
{
    public required string BaseUrl { get; init; }
    public int TimeoutSeconds { get; init; } = 30;
}

builder.Services.AddOptions<WccOptions>()
    .BindConfiguration("Wcc")
    .ValidateDataAnnotations()
    .ValidateOnStart();   // fail at startup, not at 3am`,
      },
      { type: "h2", text: "Middleware order matters" },
      {
        type: "flow",
        caption: "A request passes through middleware in the order you add it",
        steps: [
          { title: "Exception handler" },
          { title: "HTTPS / CORS" },
          { title: "Authentication" },
          { title: "Authorization" },
          { title: "Endpoint" },
        ],
      },
      {
        type: "p",
        text: "Authentication has to run before Authorization, and the exception handler goes first so it can catch everything after it. A classic cause of \"why is my user null\" is middleware in the wrong order.",
      },
    ],
  },
  {
    slug: "business-model-ideas",
    title: "Business models I think about when building products",
    tag: "Product",
    summary: "Subscription, freemium, commission and per-use pricing, with the numbers that tell you if they work.",
    date: "Nov 2026",
    minutes: 5,
    accent: "from-emerald-400 to-teal-600",
    blocks: [
      {
        type: "p",
        text: "Building Maru Desk on my own made me realise that code is only part of it. The harder question is who pays, how much and why they keep paying. These are the models I've looked at for my own projects, in plain terms.",
      },
      {
        type: "table",
        head: ["Model", "How it earns", "Example from my projects", "Watch out for"],
        rows: [
          ["Subscription (SaaS)", "Monthly or yearly fee per business or seat", "Maru Desk: invoices, receipts, payment tracking", "Churn. Customers must get value every month"],
          ["Freemium", "Free plan pulls people in, paid plan unlocks more", "Free invoices up to a limit, then upgrade", "Free users cost money too, so the limit must be right"],
          ["Commission / marketplace", "A percentage of each booking or sale", "JoybiniTour and MARU travel booking", "You need both sides: travellers and partners"],
          ["Usage-based", "Pay per use (per document, per API call)", "Paying per AI-generated document", "Unpredictable bills scare small businesses"],
          ["B2B partner fees", "Partners pay to be listed or for back-office tools", "MARU partner sign-up and approval", "Long sales cycles"],
        ],
      },
      { type: "h2", text: "The three numbers I check" },
      {
        type: "list",
        items: [
          "CAC (customer acquisition cost): how much I spend on ads, content or sales to win one paying customer.",
          "LTV (lifetime value): monthly revenue per customer × how many months they stay. A healthy product has LTV of at least about 3× CAC.",
          "Churn: the percentage of customers who leave each month. At 10% monthly churn, the average customer stays only about 10 months.",
        ],
      },
      {
        type: "code",
        lang: "text",
        caption: "Quick sanity check for a small SaaS",
        code: `price per month      = 299 THB
average lifetime     = 1 / monthly churn = 1 / 0.05 = 20 months
LTV                  = 299 × 20 = 5,980 THB
max sensible CAC     ≈ LTV / 3  ≈ 2,000 THB per customer`,
      },
      { type: "h2", text: "Things I learned the hard way" },
      {
        type: "list",
        items: [
          "Talk to real users before building, and watch how they do the job today. For small-business invoicing, that is usually Excel plus chasing people in chat apps.",
          "Charge earlier than feels comfortable. Paying customers give much more honest feedback.",
          "Pick one painful job and do it really well. \"Get paid faster\" sells better than \"all-in-one business platform\".",
          "Local payment methods matter. For Thai small businesses, that means a PromptPay QR right on the invoice.",
        ],
      },
      {
        type: "callout",
        tone: "note",
        text: "As a developer, thinking like this makes me better at my job too. When I know how a product makes money, I can tell which features are urgent and which can wait.",
      },
    ],
  },
  {
    slug: "seo-and-pwa",
    title: "SEO and PWA basics for modern websites",
    tag: "Web",
    summary: "How search engines read your site, Core Web Vitals, and turning a website into an installable app.",
    date: "Nov 2026",
    minutes: 6,
    accent: "from-amber-400 to-orange-600",
    blocks: [
      {
        type: "p",
        text: "This portfolio is a desktop OS that runs in the browser, which is great for people and terrible for search engines if you're not careful. Here's what I check on every site, and what I did here.",
      },
      { type: "h2", text: "SEO: make it easy to read" },
      {
        type: "list",
        items: [
          "Render the content on the server (SSR or static generation). Crawlers can run JavaScript, but server-rendered HTML gets indexed faster and more reliably.",
          "One clear <title> and meta description per page, written for humans.",
          "Real headings in order (h1, then h2…), meaningful link text and alt text on images.",
          "A sitemap.xml and robots.txt so crawlers know what to visit.",
          "Structured data (JSON-LD) so search engines understand what the page is about: a person, a product, an article.",
        ],
      },
      {
        type: "code",
        lang: "tsx",
        caption: "Next.js App Router: metadata and JSON-LD",
        code: `export const metadata = {
  title: "Nurarat Sangreuang — Full-stack Developer",
  description: "Full-stack .NET & Next.js developer in Bangkok, open to UK roles.",
};

const person = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Nurarat Sangreuang",
  jobTitle: "Full-stack Software Developer",
};

<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(person) }} />`,
      },
      {
        type: "callout",
        tone: "tip",
        title: "What I did on this site",
        text: "The OS is client-only, so the page also server-renders a visually hidden summary of my profile, experience and projects. Search engines and screen readers get real text even though the desktop is drawn in JavaScript.",
      },
      { type: "h2", text: "Core Web Vitals" },
      {
        type: "table",
        head: ["Metric", "Measures", "Good", "Usual fix"],
        rows: [
          ["LCP", "How fast the main content appears", "≤ 2.5 s", "Optimised images, preload the hero, fast server"],
          ["INP", "How quickly the page responds to input", "≤ 200 ms", "Less JavaScript on the main thread, split long tasks"],
          ["CLS", "How much the layout jumps around", "≤ 0.1", "Set image sizes, reserve space for ads and fonts"],
        ],
      },
      { type: "h2", text: "PWA: a website you can install" },
      {
        type: "p",
        text: "A Progressive Web App is a normal website that the browser can install like an app, with an icon, its own window and offline support. It needs three things.",
      },
      {
        type: "flow",
        steps: [
          { title: "HTTPS", body: "required for service workers" },
          { title: "Web app manifest", body: "name, icons, colours, start URL" },
          { title: "Service worker", body: "caches files, works offline" },
        ],
      },
      {
        type: "code",
        lang: "ts",
        caption: "app/manifest.ts in Next.js",
        code: `import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "NurOS",
    short_name: "NurOS",
    start_url: "/",
    display: "standalone",
    background_color: "#0d0b1e",
    theme_color: "#f7d9cd",
    icons: [{ src: "/icon-512.png", sizes: "512x512", type: "image/png" }],
  };
}`,
      },
      {
        type: "p",
        text: "The service worker is where the real work is: decide what to cache (the app shell, fonts, icons) and what must always come from the network (API data, prices). Start with caching static files only. A badly cached API response is much worse than no cache.",
      },
    ],
  },
  {
    slug: "cicd-tekton-openshift",
    title: "CI/CD explained, from Tekton on OpenShift to GitHub Actions",
    tag: "DevOps",
    summary: "What a pipeline actually does, how Tekton models it, and a small GitHub Actions pipeline for a .NET API.",
    date: "Nov 2026",
    minutes: 6,
    accent: "from-pink-400 to-fuchsia-600",
    blocks: [
      {
        type: "p",
        text: "At Sirisoft our services ran on OpenShift and shipped through Tekton pipelines. Before that, \"deploying\" meant someone copying files to a server. CI/CD is the habit of letting a machine do that work the same way every time.",
      },
      { type: "h2", text: "CI and CD in one sentence each" },
      {
        type: "list",
        items: [
          "Continuous Integration: every push is built and tested automatically, so broken code is caught in minutes, not at release time.",
          "Continuous Delivery / Deployment: every change that passes is packaged and can be (or is) deployed automatically to an environment.",
        ],
      },
      {
        type: "flow",
        caption: "A typical pipeline for a .NET service",
        steps: [
          { title: "Push / PR", body: "Git webhook" },
          { title: "Build", body: "dotnet restore + build" },
          { title: "Test", body: "xUnit" },
          { title: "Quality gate", body: "SonarQube" },
          { title: "Image", body: "build + push to registry" },
          { title: "Deploy", body: "dev → UAT → prod" },
        ],
      },
      { type: "h2", text: "How Tekton thinks about it" },
      {
        type: "table",
        head: ["Tekton object", "What it is"],
        rows: [
          ["Step", "One container that runs one command, like dotnet test"],
          ["Task", "A group of steps that run in the same pod, like build-and-test"],
          ["Pipeline", "Tasks wired together in order, with shared workspaces"],
          ["PipelineRun", "One execution of a pipeline, with its own logs and status"],
          ["Trigger", "Starts a PipelineRun from an event, like a Git push"],
        ],
      },
      {
        type: "p",
        text: "Everything is a Kubernetes resource, so pipelines live in YAML next to the app and run inside the cluster. On OpenShift you can see each run and its logs in the web console, which makes it much easier to find why a build failed.",
      },
      { type: "h2", text: "A small GitHub Actions pipeline" },
      {
        type: "code",
        lang: "yaml",
        caption: ".github/workflows/ci.yml",
        code: `name: ci
on:
  push: { branches: [main] }
  pull_request:

jobs:
  build-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-dotnet@v4
        with: { dotnet-version: "10.0.x" }
      - run: dotnet restore
      - run: dotnet build --no-restore -c Release
      - run: dotnet test --no-build -c Release

  image:
    needs: build-test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: docker build -t ghcr.io/\${{ github.repository }}:\${{ github.sha }} .
      # push and deploy steps go here`,
      },
      { type: "h2", text: "Habits that make pipelines pleasant" },
      {
        type: "list",
        items: [
          "Keep it fast. Under ten minutes, or people stop waiting for it and merge anyway.",
          "Build the image once and promote the same image through environments. Never rebuild for prod.",
          "Keep secrets in the platform's secret store, never in the repo or the YAML.",
          "Make the quality gate block the merge. A warning nobody has to act on is just noise.",
          "Deploy small changes often. Small deploys are easy to roll back.",
        ],
      },
    ],
  },
];

export const postBySlug = (slug: string) => posts.find((p) => p.slug === slug);
