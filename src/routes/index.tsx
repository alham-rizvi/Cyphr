import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowDownUp,
  Braces,
  Check,
  CheckCircle2,
  ChevronRight,
  Clipboard,
  Download,
  Eraser,
  FileCode2,
  FlaskConical,
  KeyRound,
  LockKeyhole,
  Play,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  TerminalSquare,
  UnlockKeyhole,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { decrypt, encrypt, keyScore, runCipherTests, type TraceStep } from "@/lib/arthashastra-cipher";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Cyphr — Arthashastra Cipher Workbench" },
      { name: "description", content: "Explore an Arthashastra-inspired symmetric cipher through a live, visual cryptography workbench." },
      { property: "og:title", content: "Cyphr — Arthashastra Cipher Workbench" },
      { property: "og:description", content: "Encrypt, decrypt, inspect, and test an educational symmetric cipher in your browser." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const sample = "The king shall protect the people, and the people shall sustain the realm.";
const tabs = [
  ["workbench", "Workbench"],
  ["method", "Method"],
  ["tests", "Tests"],
  ["analysis", "Analysis"],
];

function Index() {
  const [mode, setMode] = useState<"encrypt" | "decrypt">("encrypt");
  const [input, setInput] = useState(sample);
  const [output, setOutput] = useState("");
  const [key, setKey] = useState("Kautilya-322BC!");
  const [seed, setSeed] = useState(322);
  const [trace, setTrace] = useState<TraceStep[]>([]);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [tests, setTests] = useState<ReturnType<typeof runCipherTests>>([]);

  const strength = keyScore(key);
  const distribution = useMemo(() => {
    const values = trace.map((step) => step.output);
    if (!values.length) return Array.from({ length: 16 }, () => 0);
    const buckets = Array.from({ length: 16 }, () => 0);
    values.forEach((value) => { buckets[Math.floor(value / 16)] += 1; });
    return buckets;
  }, [trace]);

  function execute() {
    try {
      setError("");
      const result = mode === "encrypt" ? encrypt(input, key, seed) : decrypt(input, key, seed);
      setOutput(result.text);
      setTrace(result.trace);
    } catch (caught) {
      setOutput("");
      setTrace([]);
      setError(caught instanceof Error ? caught.message : "Unable to process this input.");
    }
  }

  function swap() {
    setInput(output);
    setOutput(input);
    setMode((current) => current === "encrypt" ? "decrypt" : "encrypt");
    setTrace([]);
    setError("");
  }

  async function copyOutput() {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  }

  function downloadOutput() {
    if (!output) return;
    const url = URL.createObjectURL(new Blob([output], { type: "text/plain" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = mode === "encrypt" ? "cyphr-dispatch.txt" : "cyphr-plain.txt";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="min-h-screen bg-background px-3 py-3 text-foreground sm:px-5 sm:py-5 lg:px-8 lg:py-7">
      <div className="mx-auto max-w-[1540px] overflow-hidden border border-border bg-console shadow-console">
        <header className="border-b border-border bg-console px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="brand-mark" aria-hidden="true"><span>C</span></div>
              <div>
                <p className="font-display text-xl font-bold uppercase leading-none">Cyphr</p>
                <p className="mt-1 font-mono text-[10px] uppercase text-muted-foreground">Arthashastra cipher system</p>
              </div>
            </div>
            <nav className="order-3 flex w-full items-center gap-1 overflow-x-auto lg:order-2 lg:w-auto" aria-label="Page sections">
              {tabs.map(([id, label], index) => (
                <a key={id} href={`#${id}`} className={`nav-pill ${index === 0 ? "nav-pill-active" : ""}`}>{label}</a>
              ))}
            </nav>
            <div className="order-2 flex items-center gap-2 lg:order-3">
              <span className="status-dot" />
              <span className="font-mono text-[10px] uppercase text-muted-foreground">Local / Secure</span>
            </div>
          </div>
        </header>

        <section className="border-b border-border px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div className="max-w-3xl">
              <div className="mb-4 flex items-center gap-2 font-mono text-[10px] uppercase text-accent"><Sparkles className="size-3" /> Classical strategy, computational form</div>
              <h1 className="font-display text-4xl font-bold uppercase leading-[0.92] sm:text-6xl lg:text-7xl">The secret dispatch,<br /><span className="text-primary">made visible.</span></h1>
              <p className="mt-5 max-w-2xl text-sm leading-6 text-muted-foreground">An educational symmetric stream cipher inspired by Kauṭilya’s principles of guarded communication: one secret, one deterministic stream, one reversible operation.</p>
            </div>
            <div className="grid grid-cols-3 divide-x divide-border border border-border bg-panel lg:min-w-[390px]">
              <Metric value="100%" label="Browser-side" accent />
              <Metric value="O(n)" label="Time" />
              <Metric value="10/10" label="Test cases" />
            </div>
          </div>
        </section>

        <section id="workbench" className="scroll-mt-4 p-4 sm:p-6 lg:p-8">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <SectionTitle index="01" title="Cipher workbench" subtitle="Transform and inspect a dispatch" />
            <div className="flex border border-border bg-panel p-1" aria-label="Cipher mode">
              <Button onClick={() => setMode("encrypt")} variant="ghost" size="sm" className={mode === "encrypt" ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground" : "text-muted-foreground"}><LockKeyhole /> Encrypt</Button>
              <Button onClick={() => setMode("decrypt")} variant="ghost" size="sm" className={mode === "decrypt" ? "bg-accent text-accent-foreground hover:bg-accent/90" : "text-muted-foreground"}><UnlockKeyhole /> Decrypt</Button>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-[1fr_310px_1fr]">
            <EditorPanel title={mode === "encrypt" ? "Plain dispatch" : "Encoded dispatch"} value={input} onChange={setInput} count={input.length}>
              <Button variant="ghost" size="sm" onClick={() => setInput(sample)}><RotateCcw /> Sample</Button>
              <Button variant="ghost" size="icon" aria-label="Clear input" title="Clear input" onClick={() => { setInput(""); setOutput(""); setTrace([]); }}><Eraser /></Button>
            </EditorPanel>

            <aside className="border border-border bg-panel p-4">
              <div className="mb-5 flex items-center justify-between"><span className="panel-label">Key material</span><KeyRound className="size-4 text-primary" /></div>
              <label className="field-label" htmlFor="secret-key">Secret key</label>
              <Input id="secret-key" value={key} onChange={(event) => setKey(event.target.value)} spellCheck={false} className="mt-2 h-11 border-border bg-console font-mono text-xs" />
              <div className="mt-3 flex items-center gap-2">
                <div className="h-1 flex-1 bg-track"><div className="h-full bg-primary transition-all" style={{ width: `${strength}%` }} /></div>
                <span className="font-mono text-[10px] text-primary">{strength}%</span>
              </div>
              <p className="mt-1 font-mono text-[9px] uppercase text-muted-foreground">{strength > 74 ? "Strong key profile" : strength > 44 ? "Moderate key profile" : "Weak key profile"}</p>
              <label className="field-label mt-5 block" htmlFor="seed">Numeric seed</label>
              <Input id="seed" type="number" value={seed} onChange={(event) => setSeed(Number(event.target.value))} className="mt-2 h-11 border-border bg-console font-mono text-xs" />
              <Button onClick={execute} className="mt-5 h-12 w-full rounded-none font-display text-base font-bold uppercase tracking-normal"><Play className="fill-current" /> Run {mode}</Button>
              <Button onClick={swap} disabled={!output} variant="outline" className="mt-2 h-10 w-full rounded-none border-border bg-transparent"><ArrowDownUp /> Swap & reverse</Button>
              <div className="mt-5 border-t border-border pt-4 font-mono text-[10px] text-muted-foreground">
                <div className="flex justify-between"><span>Primitive</span><span className="text-foreground">XOR stream</span></div>
                <div className="mt-2 flex justify-between"><span>Encoding</span><span className="text-foreground">UTF-8 / Base64</span></div>
                <div className="mt-2 flex justify-between"><span>Seed</span><span className="text-foreground">Deterministic</span></div>
              </div>
            </aside>

            <EditorPanel title={mode === "encrypt" ? "Encoded dispatch" : "Recovered dispatch"} value={output} count={output.length} readOnly error={error}>
              <Button variant="ghost" size="icon" disabled={!output} onClick={copyOutput} aria-label="Copy output" title="Copy output">{copied ? <Check /> : <Clipboard />}</Button>
              <Button variant="ghost" size="icon" disabled={!output} onClick={downloadOutput} aria-label="Download output" title="Download output"><Download /></Button>
            </EditorPanel>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
            <div className="border border-border bg-panel p-4 sm:p-5">
              <div className="mb-4 flex items-center justify-between"><span className="panel-label">Transformation trace</span><Badge variant="outline" className="border-border font-mono text-[9px] text-muted-foreground">FIRST 16 BYTES</Badge></div>
              {trace.length ? (
                <div className="overflow-x-auto"><table className="trace-table"><thead><tr><th>#</th><th>Input</th><th></th><th>Key stream</th><th></th><th>Output</th></tr></thead><tbody>{trace.map((step) => <tr key={step.index}><td>{String(step.index).padStart(2, "0")}</td><td>{hex(step.input)}</td><td className="text-accent">XOR</td><td>{hex(step.keyByte)}</td><td>=</td><td className="text-primary">{hex(step.output)}</td></tr>)}</tbody></table></div>
              ) : <EmptyState icon={<TerminalSquare />} text="Run the cipher to reveal each byte operation." />}
            </div>
            <div className="border border-border bg-panel p-4 sm:p-5">
              <div className="mb-5 flex items-center justify-between"><span className="panel-label">Output distribution</span><span className="font-mono text-[9px] text-muted-foreground">16 BUCKETS</span></div>
              <div className="flex h-36 items-end gap-1.5 border-b border-l border-border px-3 pt-2">
                {distribution.map((value, index) => <div key={index} className={`flex-1 transition-all duration-500 ${index % 3 === 1 ? "bg-accent" : "bg-primary"}`} style={{ height: `${value ? Math.max(12, (value / Math.max(...distribution)) * 100) : 3}%` }} title={`${index * 16}–${index * 16 + 15}: ${value}`} />)}
              </div>
              <div className="mt-2 flex justify-between font-mono text-[9px] text-muted-foreground"><span>00</span><span>BYTE VALUE</span><span>FF</span></div>
            </div>
          </div>
        </section>

        <section id="method" className="scroll-mt-4 border-t border-border p-4 sm:p-6 lg:p-8">
          <SectionTitle index="02" title="Concept & method" subtitle="IKS concept as a CS concept" />
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <div className="border border-border bg-panel p-5">
              <h3 className="panel-heading"><Braces /> Conceptual mapping</h3>
              <div className="mapping-grid mt-5">
                <MapRow n="01" left="Gūḍhalekhya" right="Encrypted message" />
                <MapRow n="02" left="Secret understanding" right="Symmetric key" />
                <MapRow n="03" left="Changing disguise" right="Key stream" />
                <MapRow n="04" left="Trusted reversal" right="XOR involution" />
                <MapRow n="05" left="Messenger’s dispatch" right="Ciphertext transport" />
              </div>
            </div>
            <div className="border border-border bg-code p-5">
              <div className="flex items-center justify-between"><h3 className="panel-heading"><FileCode2 /> Formal specification</h3><span className="font-mono text-[9px] text-muted-foreground">PSEUDOCODE</span></div>
              <pre className="mt-5 overflow-x-auto font-mono text-[11px] leading-6 text-code-foreground"><code><span className="text-accent">INPUT</span> message M, secret K, seed S{"\n"}<span className="text-accent">REQUIRE</span> length(K) &gt; 0{"\n\n"}B ← UTF8(M){"\n"}state ← FNV1a(K) XOR S{"\n"}<span className="text-primary">FOR</span> i ← 0 TO length(B) − 1{"\n"}  state ← XORSHIFT32(state){"\n"}  C[i] ← B[i] XOR lowByte(state){"\n"}<span className="text-primary">RETURN</span> BASE64(C){"\n\n"}<span className="text-muted-foreground">// Decryption repeats XOR, then UTF8-decoding.</span></code></pre>
            </div>
          </div>
          <div className="mt-4 border border-border bg-panel p-5"><h3 className="panel-heading"><ShieldCheck /> Problem statement</h3><p className="mt-4 max-w-5xl text-sm leading-7 text-muted-foreground">How can the Arthashastra’s concept of guarded intelligence exchange be represented as a modern computational system? Cyphr models it as a symmetric stream cipher: sender and receiver share a secret key and seed, generate the same pseudo-random byte stream, and apply XOR to conceal or recover a UTF-8 message.</p></div>
        </section>

        <section id="tests" className="scroll-mt-4 border-t border-border p-4 sm:p-6 lg:p-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionTitle index="03" title="Verification lab" subtitle="Ten deterministic round-trip cases" />
            <Button onClick={() => setTests(runCipherTests())} className="rounded-none"><FlaskConical /> Run all tests</Button>
          </div>
          <div className="mt-5 overflow-hidden border border-border">
            <div className="test-header"><span>Case</span><span>Payload</span><span>Status</span></div>
            {(tests.length ? tests : runCipherTests()).map((test, index) => (
              <div className="test-row" key={test.name}>
                <span className="font-mono text-[10px] text-muted-foreground">T{String(index + 1).padStart(2, "0")}</span>
                <span><strong className="block text-xs font-medium text-foreground">{test.name}</strong><span className="mt-1 block truncate font-mono text-[9px] text-muted-foreground">{test.cipher || "(empty output)"}</span></span>
                <span className={`flex items-center gap-2 font-mono text-[10px] ${test.pass ? "text-primary" : "text-destructive"}`}><CheckCircle2 className="size-4" /> {test.pass ? "PASS" : "FAIL"}</span>
              </div>
            ))}
          </div>
        </section>

        <section id="analysis" className="scroll-mt-4 border-t border-border p-4 sm:p-6 lg:p-8">
          <SectionTitle index="04" title="Correctness & limits" subtitle="What the system guarantees—and what it does not" />
          <div className="mt-5 grid gap-px border border-border bg-border md:grid-cols-3">
            <AnalysisCard number="01" title="Correctness" text="For every byte b and stream byte k, (b XOR k) XOR k = b. The same key and seed therefore recover the exact original UTF-8 bytes." />
            <AnalysisCard number="02" title="Complexity" text="Encryption and decryption each visit every byte once: O(n) time. Output and key-stream buffers require O(n) auxiliary space." />
            <AnalysisCard number="03" title="Limitations" text="This is an educational construction, not production cryptography. It has no authentication, key exchange, nonce enforcement, or side-channel protection." accent />
          </div>
          <div className="mt-4 flex flex-col justify-between gap-5 border border-primary/40 bg-primary-soft p-5 sm:flex-row sm:items-center">
            <div><p className="font-display text-xl font-bold uppercase">Conclusion</p><p className="mt-2 max-w-4xl text-sm leading-6 text-muted-foreground">Cyphr demonstrates that a historical principle—protecting strategic communication through shared secret knowledge—maps naturally to deterministic key generation, byte-wise transformation, reversible algorithms, and testable software correctness.</p></div>
            <div className="shrink-0 border border-primary px-4 py-3 font-mono text-[10px] uppercase text-primary">All computation stays local</div>
          </div>
        </section>

        <footer className="flex flex-col justify-between gap-3 border-t border-border bg-console px-5 py-4 font-mono text-[9px] uppercase text-muted-foreground sm:flex-row"><span>Cyphr / IKS Computational Systems</span><span>Arthashastra × Symmetric Cryptography</span></footer>
      </div>
    </main>
  );
}

function hex(value: number) { return `0x${value.toString(16).toUpperCase().padStart(2, "0")}`; }

function SectionTitle({ index, title, subtitle }: { index: string; title: string; subtitle: string }) {
  return <div className="flex items-start gap-3"><span className="mt-1 font-mono text-[10px] text-primary">/{index}</span><div><h2 className="font-display text-2xl font-bold uppercase sm:text-3xl">{title}</h2><p className="mt-1 text-xs text-muted-foreground">{subtitle}</p></div></div>;
}

function Metric({ value, label, accent = false }: { value: string; label: string; accent?: boolean }) {
  return <div className="p-4"><p className={`font-display text-2xl font-bold ${accent ? "text-primary" : "text-foreground"}`}>{value}</p><p className="mt-1 font-mono text-[8px] uppercase text-muted-foreground">{label}</p></div>;
}

function EditorPanel({ title, value, onChange, count, readOnly = false, error, children }: { title: string; value: string; onChange?: (value: string) => void; count: number; readOnly?: boolean; error?: string; children: React.ReactNode }) {
  return <div className="flex min-h-[340px] flex-col border border-border bg-panel"><div className="flex h-12 items-center justify-between border-b border-border px-4"><span className="panel-label">{title}</span><div className="flex items-center gap-1">{children}</div></div><Textarea aria-label={title} value={value} readOnly={readOnly} onChange={(event) => onChange?.(event.target.value)} placeholder={readOnly ? "Your result will appear here…" : "Enter a dispatch…"} spellCheck={false} className="min-h-[230px] flex-1 resize-none rounded-none border-0 bg-transparent p-4 font-mono text-xs leading-6 shadow-none focus-visible:ring-0" />{error ? <div className="border-t border-destructive/40 px-4 py-3 font-mono text-[10px] text-destructive">{error}</div> : <div className="flex justify-between border-t border-border px-4 py-3 font-mono text-[9px] uppercase text-muted-foreground"><span>{readOnly ? "Result" : "UTF-8 input"}</span><span>{count} chars</span></div>}</div>;
}

function EmptyState({ icon, text }: { icon: React.ReactNode; text: string }) { return <div className="flex min-h-48 flex-col items-center justify-center gap-3 text-muted-foreground"><div className="text-primary">{icon}</div><p className="font-mono text-[10px] uppercase">{text}</p></div>; }
function MapRow({ n, left, right }: { n: string; left: string; right: string }) { return <div className="grid grid-cols-[32px_1fr_18px_1fr] items-center gap-2 border-t border-border py-3 first:border-t-0"><span className="font-mono text-[9px] text-muted-foreground">{n}</span><span className="text-xs">{left}</span><ChevronRight className="size-3 text-primary" /><span className="text-xs font-medium">{right}</span></div>; }
function AnalysisCard({ number, title, text, accent = false }: { number: string; title: string; text: string; accent?: boolean }) { return <article className="bg-panel p-5"><span className={`font-mono text-[10px] ${accent ? "text-accent" : "text-primary"}`}>/{number}</span><h3 className="mt-8 font-display text-xl font-bold uppercase">{title}</h3><p className="mt-3 text-xs leading-6 text-muted-foreground">{text}</p></article>; }
