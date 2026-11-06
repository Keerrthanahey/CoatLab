"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  BrainCircuit,
  SlidersHorizontal,
  ScanLine,
  BarChart3,
  FileText,
  Sparkles,
  ArrowRight,
  Menu,
  X,
  FlaskConical,
  Check,
  Globe,
  Mail,
  Layers,
  Workflow,
  Cpu,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { Logo } from "@/components/ui/logo";
import { ParticleCanvas } from "@/components/interactive/particle-canvas";
import { Hero3D } from "@/components/landing/hero-3d";
import { StatCounter } from "@/components/interactive/stat-counter";
import { TiltCard } from "@/components/interactive/tilt-card";

const DOMAIN_CARDS = [
  {
    href: "/ml/prediction",
    icon: BrainCircuit,
    title: "ML Prediction",
    description:
      "Map 25 process features — substrate, coating method, electrolyte and electrochemical conditions — to 6 coating performance targets.",
    accent: "#14b8a6",
    tag: "Gradient boosting + RF",
  },
  {
    href: "/ml/optimization",
    icon: SlidersHorizontal,
    title: "Multi-Objective Optimizer",
    description:
      "Search parameter space for the combination that maximizes corrosion resistance, thickness and wear while minimizing porosity.",
    accent: "#8b5cf6",
    tag: "72 combos evaluated",
  },
  {
    href: "/ml/morphology",
    icon: ScanLine,
    title: "Morphology Analysis",
    description:
      "Upload SEM micrographs and get calibrated pore count, porosity and pore-size distribution from image analysis.",
    accent: "#3b82f6",
    tag: "Image-based",
  },
  {
    href: "/ml/figure",
    icon: BarChart3,
    title: "Figure Extraction",
    description:
      "Extract approximate numerical data from published plots and charts with axis-label detection.",
    accent: "#f59e0b",
    tag: "Chart OCR",
  },
  {
    href: "/literature",
    icon: FileText,
    title: "Literature Intelligence",
    description:
      "Query the indexed research corpus with citations and get AI-assisted answers grounded in the literature.",
    accent: "#ec4899",
    tag: "RAG + citations",
  },
  {
    href: "/prediction",
    icon: Sparkles,
    title: "AI Research Assistant",
    description:
      "A LangChain-powered agent wired to the ML tools, materials database and morphology services.",
    accent: "#14b8a6",
    tag: "LangChain",
  },
];

const MATERIALS = [
  { symbol: "Mg", name: "Magnesium", system: "HCP · P6₃/mmc", accent: "#14b8a6" },
  { symbol: "Al", name: "Aluminum", system: "FCC · Fm-3m", accent: "#3b82f6" },
  { symbol: "Zr", name: "Zirconium", system: "HCP · P6₃/mmc", accent: "#8b5cf6" },
  { symbol: "Ta", name: "Tantalum", system: "BCC · Im-3m", accent: "#f59e0b" },
];

const WORKFLOW = [
  {
    icon: FlaskConical,
    title: "Characterize",
    description: "Upload SEM images, micrographs or figures from your coating experiments.",
  },
  {
    icon: Layers,
    title: "Extract",
    description: "Morphology and figure-pipeline services turn imagery into structured data.",
  },
  {
    icon: Cpu,
    title: "Predict",
    description: "Trained gradient-boosting models estimate 6 coating-performance targets.",
  },
  {
    icon: Workflow,
    title: "Optimize",
    description: "Multi-objective search recommends an ideal process-parameter combination.",
  },
];

const ARCH_STATS = [
  { value: 25, label: "Process Features", suffix: "" },
  { value: 6, label: "Prediction Targets", suffix: "" },
  { value: 4, label: "Supporting Materials", suffix: "" },
  { value: 7, label: "ML Endpoints", suffix: "" },
];

const EASE = [0.16, 1, 0.3, 1] as const;

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="text-sm font-medium text-slate-300 transition-colors hover:text-white"
    >
      {children}
    </Link>
  );
}

function LandingNav() {
  const { user, loading, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const initials =
    user?.fullName
      ?.split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0])
      .join("")
      .toUpperCase() ?? "?";

  return (
    <header
      className="fixed inset-x-0 top-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? "rgba(6,11,24,0.72)" : "transparent",
        backdropFilter: scrolled ? "blur(16px)" : "blur(0px)",
        WebkitBackdropFilter: scrolled ? "blur(16px)" : "blur(0px)",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "1px solid transparent",
      }}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5" aria-label="CoatLab home">
          <Logo className="h-9 w-9" />
          <span className="hidden flex-col leading-none sm:flex">
            <span className="text-[15px] font-semibold tracking-tight text-white">CoatLab</span>
            <span className="mt-0.5 font-mono text-[9px] uppercase tracking-widest text-teal-400">
              Materials AI
            </span>
          </span>
        </Link>

        <nav className="ml-4 hidden items-center gap-6 lg:flex" aria-label="Landing">
          <NavLink href="#features">Features</NavLink>
          <NavLink href="#materials">Materials</NavLink>
          <NavLink href="#workflow">Workflow</NavLink>
          <NavLink href="#architecture">Architecture</NavLink>
        </nav>

        <div className="flex-1" />

        <div className="hidden items-center gap-3 sm:flex">
          {loading ? null : user ? (
            <>
              <Link
                href="/dashboard"
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] py-1.5 pl-1.5 pr-3 transition-colors hover:border-white/20"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-blue-600 text-[10px] font-semibold text-white">
                  {initials}
                </span>
                <span className="text-[13px] font-medium text-slate-100">
                  Dashboard
                </span>
              </Link>
              <button
                data-magnetic
                onClick={() => logout()}
                className="rounded-xl border border-white/10 px-3 py-1.5 text-[13px] font-medium text-slate-300 transition-colors hover:border-white/25 hover:text-white"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-[13px] font-medium text-slate-300 transition-colors hover:text-white"
              >
                Login
              </Link>
              <Link
                data-magnetic
                href="/signup"
                className="rounded-xl bg-teal-500 px-4 py-2 text-[13px] font-semibold text-black transition-colors hover:bg-teal-400"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        <button
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-slate-300 sm:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle navigation menu"
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-white/[0.06] bg-[#060b18]/95 backdrop-blur-xl sm:hidden">
          <div className="flex flex-col gap-1 px-4 py-4">
            {[
              ["#features", "Features"],
              ["#materials", "Materials"],
              ["#workflow", "Workflow"],
              ["#architecture", "Architecture"],
            ].map(([href, label]) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-white/[0.05] hover:text-white"
              >
                {label}
              </Link>
            ))}
            <div className="my-2 h-px bg-white/[0.06]" />
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-teal-300"
                >
                  Go to Dashboard
                </Link>
                <button
                  onClick={() => logout()}
                  className="rounded-lg px-3 py-2 text-left text-sm text-slate-300 hover:text-white"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm text-slate-300"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setOpen(false)}
                  className="rounded-lg bg-teal-500 px-3 py-2 text-sm font-semibold text-black"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden pt-28 pb-16 sm:pt-36 sm:pb-24">
      <ParticleCanvas />
      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            "radial-gradient(ellipse 55% 45% at 20% 30%, rgba(20,184,166,0.08) 0%, transparent 60%), radial-gradient(ellipse 45% 55% at 80% 70%, rgba(59,130,246,0.08) 0%, transparent 60%)",
        }}
      />
      <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-8 lg:px-8">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-teal-500/25 bg-teal-500/5 px-3 py-1 font-mono text-xs text-teal-400"
          >
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-teal-400" />
            Mg Coating Intelligence Platform
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05, ease: EASE }}
            className="font-display text-4xl leading-[1.08] text-white sm:text-5xl lg:text-6xl"
          >
            AI-Powered
            <br />
            Coating{" "}
            <span className="bg-gradient-to-r from-teal-300 to-blue-400 bg-clip-text text-transparent">
              Intelligence
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.12, ease: EASE }}
            className="mt-5 max-w-lg text-base leading-relaxed text-slate-400 sm:text-lg"
          >
            <span className="text-slate-200">Analyze. Predict. Optimize.</span>{" "}
            Coffee in one hand, data in the other — CoatLab connects
            process parameters to coating performance with machine-learning
            predictions, image-based morphology analysis, and multi-objective
            optimization.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.18, ease: EASE }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <Link
              data-magnetic
              href="/signup"
              className="group flex items-center gap-2 rounded-xl bg-teal-500 px-6 py-3 text-sm font-semibold text-black transition-colors hover:bg-teal-400"
            >
              Explore CoatLab
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              data-magnetic
              href="/login"
              className="rounded-xl border border-white/10 bg-white/[0.04] px-6 py-3 text-sm font-medium text-slate-200 transition-colors hover:border-white/25 hover:text-white"
            >
              Get Started
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.24, ease: EASE }}
            className="mt-12 grid grid-cols-2 gap-8 sm:grid-cols-4"
          >
            <StatCounter value={500} label="Demo Records" />
            <StatCounter value={24} label="API Modules" />
            <StatCounter value={6} label="Prediction Targets" />
            <StatCounter value={4} label="Supported Materials" />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.15, ease: EASE }}
          className="relative hidden aspect-square w-full max-w-md justify-self-center lg:block"
        >
          <div
            className="absolute inset-4 rounded-full border border-teal-500/10"
            style={{ animation: "float 7s ease-in-out infinite" }}
          />
          <div
            className="absolute inset-12 rounded-full border border-teal-500/[0.07]"
            style={{ animation: "float 9s ease-in-out infinite", animationDelay: "1.2s" }}
          />
          <div className="absolute inset-0 z-10">
            <Hero3D />
          </div>
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-teal-400" />
            <span className="font-mono text-[11px] text-slate-300">
              Mg HCP · P6₃/mmc
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function DomainCards() {
  return (
    <section id="features" className="relative py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: EASE }}
          className="mb-12 text-center"
        >
          <p className="mb-3 font-mono text-xs uppercase tracking-widest text-teal-400">
            / What CoatLab does
          </p>
          <h2 className="font-display text-3xl text-white sm:text-4xl">
            From process to performance
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-slate-400">
            Six domain modules work together across the research pipeline — from
            ML prediction to literature-grounded answers.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {DOMAIN_CARDS.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.08, ease: EASE }}
            >
              <TiltCard className="h-full rounded-2xl">
                <Link
                  href={card.href}
                  className="group relative flex h-full flex-col rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 transition-colors hover:border-white/[0.14]"
                >
                  <div
                    className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    style={{
                      background: `radial-gradient(ellipse 80% 60% at 50% 0%, ${card.accent}14 0%, transparent 70%)`,
                    }}
                  />
                  <div className="mb-4 flex items-center justify-between">
                    <span
                      className="flex h-11 w-11 items-center justify-center rounded-xl"
                      style={{ background: `${card.accent}14`, color: card.accent }}
                    >
                      <card.icon className="h-5 w-5" />
                    </span>
                    <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 font-mono text-[10px] text-slate-400">
                      {card.tag}
                    </span>
                  </div>
                  <h3 className="mb-1.5 text-[15px] font-semibold text-white">
                    {card.title}
                  </h3>
                  <p className="text-[13px] leading-relaxed text-slate-400">
                    {card.description}
                  </p>
                  <span className="mt-auto flex items-center gap-1.5 pt-4 text-xs font-medium text-slate-500 transition-colors group-hover:text-teal-400">
                    Open module <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </Link>
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function MaterialsSection() {
  return (
    <section id="materials" className="relative py-20 sm:py-24">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 50% 40% at 50% 0%, rgba(20,184,166,0.05) 0%, transparent 70%)",
        }}
      />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: EASE }}
          className="mb-10 text-center"
        >
          <p className="mb-3 font-mono text-xs uppercase tracking-widest text-teal-400">
            / The substrate library
          </p>
          <h2 className="font-display text-3xl text-white sm:text-4xl">
            Supported materials
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {MATERIALS.map((mat, i) => (
            <motion.div
              key={mat.symbol}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.07, ease: EASE }}
              className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 text-center"
            >
              <div
                className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl font-display text-2xl"
                style={{ background: `${mat.accent}14`, color: mat.accent }}
              >
                {mat.symbol}
              </div>
              <p className="text-sm font-semibold text-white">{mat.name}</p>
              <p className="mt-1 font-mono text-[11px] text-slate-500">{mat.system}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function WorkflowSection() {
  return (
    <section id="workflow" className="relative py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: EASE }}
          className="mb-12 text-center"
        >
          <p className="mb-3 font-mono text-xs uppercase tracking-widest text-teal-400">
            / The research loop
          </p>
          <h2 className="font-display text-3xl text-white sm:text-4xl">
            A four-step research workflow
          </h2>
        </motion.div>

        <div className="relative grid grid-cols-1 gap-5 md:grid-cols-4">
          {WORKFLOW.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: EASE }}
              className="relative rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5"
            >
              <div className="mb-3 flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-500/10 text-teal-400">
                  <step.icon className="h-4.5 w-4.5" />
                </span>
                <span className="font-mono text-xs text-slate-500">0{i + 1}</span>
              </div>
              <h3 className="mb-1 text-sm font-semibold text-white">{step.title}</h3>
              <p className="text-[13px] leading-relaxed text-slate-400">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ArchitectureSection() {
  const { scrollYProgress } = useScroll({
    target: undefined,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, 12]);

  return (
    <section id="architecture" className="relative py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: EASE }}
          className="mb-10 text-center"
        >
          <p className="mb-3 font-mono text-xs uppercase tracking-widest text-teal-400">
            / Under the hood
          </p>
          <h2 className="font-display text-3xl text-white sm:text-4xl">
            ML + AI architecture
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2">
          <motion.div style={{ y }} className="grid grid-cols-2 gap-4">
            {ARCH_STATS.map((stat, i) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6"
              >
                <StatCounter
                  value={stat.value}
                  label={stat.label}
                  suffix={stat.suffix}
                  color={i % 2 === 0 ? "#14b8a6" : "#3b82f6"}
                />
              </div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
            className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6"
          >
            <h3 className="mb-4 text-sm font-semibold text-white">
              Feature → Target pipeline
            </h3>
            <ul className="space-y-3">
              {[
                ["Substrate & coating metals", "Mg · Al · Zr · Ta substrates; MgO · Al₂O₃ · ZrO₂ · TiO₂ coatings"],
                ["Process electrochemistry", "electrolyte, current density, voltage, frequency, duty cycle, treatment time"],
                ["Model families", "Gradient Boosting + Random Forest ensembles (scikit-learn)"],
                ["Services", "predict · optimize · morphology · figure · literature · agent · materials"],
              ].map(([title, desc]) => (
                <li key={title} className="flex gap-3">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-teal-400" />
                  <div>
                    <p className="text-[13px] font-medium text-slate-200">{title}</p>
                    <p className="text-[12px] leading-relaxed text-slate-500">{desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function CtaSection() {
  return (
    <section className="relative py-20 sm:py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: EASE }}
          className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.03] p-10 text-center backdrop-blur-xl sm:p-14"
        >
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 70% 60% at 50% 0%, rgba(20,184,166,0.10) 0%, transparent 70%)",
            }}
          />
          <div className="relative">
            <h2 className="font-display text-3xl text-white sm:text-4xl">
              Ready to run your first prediction?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-slate-400">
              Create a free account to access the prediction, optimization,
              morphology and literature modules — demo data included.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                data-magnetic
                href="/signup"
                className="flex items-center gap-2 rounded-xl bg-teal-500 px-6 py-3 text-sm font-semibold text-black transition-colors hover:bg-teal-400"
              >
                Create Free Account <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                data-magnetic
                href="/login"
                className="rounded-xl border border-white/10 bg-white/[0.04] px-6 py-3 text-sm font-medium text-slate-200 transition-colors hover:border-white/25 hover:text-white"
              >
                Sign In
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/[0.06] py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5">
              <Logo className="h-8 w-8" />
              <span className="text-[15px] font-semibold text-white">CoatLab</span>
            </div>
            <p className="mt-3 max-w-sm text-[13px] leading-relaxed text-slate-500">
              AI-assisted prediction and analysis of coating process–property
              relationships for advanced materials.
            </p>
            <div className="mt-4 flex items-center gap-3 text-slate-500">
              <Globe className="h-4 w-4" />
              <Mail className="h-4 w-4" />
            </div>
          </div>

          <div>
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
              Platform
            </p>
            <ul className="space-y-2 text-[13px] text-slate-500">
              <li><Link className="hover:text-slate-300" href="/ml/prediction">ML Prediction</Link></li>
              <li><Link className="hover:text-slate-300" href="/ml/optimization">Optimizer</Link></li>
              <li><Link className="hover:text-slate-300" href="/ml/morphology">Morphology</Link></li>
              <li><Link className="hover:text-slate-300" href="/ml/figure">Figure Extract</Link></li>
            </ul>
          </div>

          <div>
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
              Account
            </p>
            <ul className="space-y-2 text-[13px] text-slate-500">
              <li><Link className="hover:text-slate-300" href="/login">Sign in</Link></li>
              <li><Link className="hover:text-slate-300" href="/signup">Create account</Link></li>
              <li><Link className="hover:text-slate-300" href="/dashboard">Dashboard</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-white/[0.06] pt-6 text-[11px] text-slate-600 sm:flex-row sm:items-center">
          <span>© {new Date().getFullYear()} CoatLab · Materials Intelligence Platform</span>
          <span className="font-mono">
            Demo data — not scientific results · Set NEXT_PUBLIC_API_BASE_URL for live backend
          </span>
        </div>
      </div>
    </footer>
  );
}

export function LandingPage() {
  return (
    <div className="relative min-h-screen">
      <LandingNav />
      <main>
        <Hero />
        <div
          className="mx-auto h-px max-w-7xl"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(20,184,166,0.4) 30%, rgba(59,130,246,0.3) 60%, transparent 100%)",
          }}
        />
        <DomainCards />
        <div
          className="mx-auto h-px max-w-7xl"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(59,130,246,0.3) 30%, rgba(20,184,166,0.4) 60%, transparent 100%)",
          }}
        />
        <MaterialsSection />
        <div
          className="mx-auto h-px max-w-7xl"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(20,184,166,0.3) 30%, rgba(139,92,246,0.3) 60%, transparent 100%)",
          }}
        />
        <WorkflowSection />
        <div
          className="mx-auto h-px max-w-7xl"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(139,92,246,0.3) 30%, rgba(59,130,246,0.3) 60%, transparent 100%)",
          }}
        />
        <ArchitectureSection />
        <div
          className="mx-auto h-px max-w-7xl"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(59,130,246,0.3) 30%, rgba(20,184,166,0.4) 60%, transparent 100%)",
          }}
        />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
}