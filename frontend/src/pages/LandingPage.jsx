import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  PlayCircle,
  Bot,
  FileSearch,
  Briefcase,
  MessageSquareText,
  History as HistoryIcon,
  BarChart3,
  Upload,
  Mic,
  ClipboardCheck,
  ChevronDown,
} from "lucide-react";
import { ROUTES } from "../constants";
import Button from "../components/Button";
import Card from "../components/Card";
import TrackCard from "../components/TrackCard";
import { useState } from "react";

import hero1 from "../assets/hero1.png";
import hero2 from "../assets/hero2.png";
import hero3 from "../assets/hero3.png";
import hero4 from "../assets/hero4.png";
import hero5 from "../assets/hero5.png";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";

const heroImages = [
  hero1,
  hero2,
  hero3,
  hero4,
  hero5,
];

const features = [
  { icon: Bot, title: "AI Interview Simulation", desc: "Practice realistic, AI-powered mock interviews with instant follow-up questions based on your answers." },
  { icon: FileSearch, title: "Resume-Based Questions", desc: "Personalized interview questions generated from your resume, skills, and work experience." },
  { icon: Briefcase, title: "Job Description Matching", desc: "Select job roles and paste job descriptions so questions match your target role's expectations." },
  { icon: MessageSquareText, title: "Instant AI Feedback", desc: "Get detailed feedback on every answer, including clarity, relevance, and depth of response." },
  { icon: HistoryIcon, title: "Interview History", desc: "Access previous interview sessions, review your answers, and track improvement over time." },
  { icon: BarChart3, title: "Performance Dashboard", desc: "Track improvement across sessions, identify weaknesses, and monitor readiness for your next interview." },
];

const steps = [
  { icon: Upload, title: "Upload Resume", desc: "Simply upload your resume. Our AI analyzes your skills and experience accordingly." },
  { icon: PlayCircle, title: "Start Interview", desc: "Choose your target role for a tailored, multi-part AI-driven interview session." },
  { icon: ClipboardCheck, title: "Receive Feedback", desc: "Get a comprehensive report with scores on technical, behavioral, and delivery skills." },
];

const testimonials = [
  { name: "Sarah Chen", role: "Software Engineer", quote: "The AI interviews felt incredibly real. I practiced for my Google interview here and saw a huge improvement in the days after." },
  { name: "Marcus Thorne", role: "Product Manager at TikTok", quote: "The voice feedback was a game changer. I noticed I was using 'um' way too often — my confidence improved after just a few sessions." },
  { name: "Elena Rodriguez", role: "UX Researcher", quote: "Resume analysis helped me pivot from a generic bio to one that highlighted my AI Engineering skills. The keyword suggestions were spot on." },
];

const faqs = [
  { q: "Is the AI specialized for technical roles?", a: "Yes — our knowledge base includes curated question sets for Software Engineering, Data Analysis, DevOps, QA, Cybersecurity, Cloud Engineering, and IT Support, along with general behavioral and soft-skills content for every role." },
  { q: "How accurate is the voice analysis?", a: "Voice answers are transcribed and scored on pace, filler words, and pausing using objective, timestamp-based metrics — the same audio pipeline used by professional speech-coaching tools." },
  { q: "Can I use it for non-tech interviews?", a: "Yes. Choose the Soft Skills or Behavioral track for a fully non-technical mock interview experience." },
  { q: "What companies do you support?", a: "RAGRecruiter isn't tied to any single company's interview format — it adapts questions to the job role and job description you provide." },
  { q: "Is my resume data safe?", a: "Your resume text is stored securely and tied to your account only — it's never shared with third parties." },
];

function Faq({ item }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-ink-900/10 py-4">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between text-left"
        aria-expanded={open}
      >
        <span className="font-medium text-ink-900">{item.q}</span>
        <ChevronDown className={`h-5 w-5 shrink-0 text-ink-500 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <p className="mt-3 text-sm leading-relaxed text-ink-500">{item.a}</p>}
    </div>
  );
}

export default function LandingPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-hero-gradient">
        <div className="container-page grid items-center gap-12 py-16 md:grid-cols-2 md:py-24">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="mb-4 inline-block rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700">
              Now AI-Powered
            </span>
            <h1 className="font-display text-4xl font-extrabold leading-tight tracking-tight text-ink-900 sm:text-5xl">
              Practice Smarter.{" "}
              <span className="bg-primary-gradient bg-clip-text text-transparent">Get Hired Faster.</span>
            </h1>
            <p className="mt-5 max-w-lg text-lg text-ink-500">
              Master technical and behavioral interviews with AI-powered mock interviews, instant
              feedback, resume analysis, and personalized learning paths.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to={ROUTES.TRACK_SELECTION}>
                <Button size="lg" icon={ArrowRight}>
                  Start Now
                </Button>
              </Link>
              <Button size="lg" variant="secondary" icon={PlayCircle}>
                Watch Demo
              </Button>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
<div
  className="mx-auto w-full max-w-[430px] h-[430px] bg-white overflow-hidden rounded-tl-[80px] rounded-br-[80px] shadow-2xl transition-all duration-500 hover:scale-[1.02]"
>   <div className="h-full overflow-hidden  bg-white">
    <Swiper
      modules={[Autoplay, Pagination]}
      loop
      autoplay={{
        delay: 3000,
        disableOnInteraction: false,
      }}
      pagination={{ clickable: true }}
      className="h-full w-full"
    >
      {heroImages.map((img, index) => (
        <SwiperSlide
          key={index}
          className="flex items-center justify-center bg-white"
        >
          <img
            src={img}
            alt={`Slide ${index + 1}`}
            className="max-h-[85%] max-w-[85%] object-contain"
          />
        </SwiperSlide>
      ))}
    </Swiper>
  </div>
</div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="container-page py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">Advanced Features for Modern Candidates</h2>
          <p className="mt-4 text-ink-500">
            Everything you need to master your next high-stakes interview, from technical deep-dives
            to behavioral excellence.
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <Card key={f.title} hoverable>
              <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                <f.icon className="h-5 w-5" />
              </span>
              <h3 className="font-semibold text-ink-900">{f.title}</h3>
              <p className="mt-2 text-sm text-ink-500">{f.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Process */}
      <section className="bg-surface-muted py-20">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">Master the Process in 3 Steps</h2>
            <p className="mt-4 text-ink-500">
              Our streamlined approach ensures you're ready for the big day in record time.
            </p>
          </div>
          <div className="relative mt-14 grid gap-10 md:grid-cols-3">
            {steps.map((step, i) => (
              <div key={step.title} className="relative flex flex-col items-center text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-gradient text-white shadow-glow">
                  <step.icon className="h-6 w-6" />
                </span>
                <span className="mt-3 text-xs font-bold text-primary-600">STEP {i + 1}</span>
                <h3 className="mt-1 font-semibold text-ink-900">{step.title}</h3>
                <p className="mt-2 max-w-xs text-sm text-ink-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tracks */}
      <section className="container-page py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">Choose Your Interview Track</h2>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {[
            { id: "technical", label: "Technical", description: "Master coding, system design, and detailed feedback." },
            { id: "soft_skills", label: "Soft Skills", description: "Improve communication, leadership, and workplace collaboration." },
            { id: "behavioral", label: "Behavioral", description: "Practice STAR-based behavioral questions to showcase your experiences." },
            { id: "mixed", label: "Mixed / Full Prep", description: "A complete mock interview combining technical and soft skills with personalized feedback." },
          ].map((t) => (
            <TrackCard key={t.id} track={t} selected={false} onSelect={() => {}} />
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-surface-muted py-20">
        <div className="container-page">
          <span className="text-sm font-semibold text-primary-600">Success Stories</span>
          <h2 className="mt-2 text-3xl font-bold sm:text-4xl">Join Thousands of Hired Professionals</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <Card key={t.name}>
                <p className="text-sm italic leading-relaxed text-ink-700">&ldquo;{t.quote}&rdquo;</p>
                <div className="mt-4 flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 font-semibold text-primary-700">
                    {t.name[0]}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-ink-900">{t.name}</p>
                    <p className="text-xs text-ink-500">{t.role}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="container-page py-20">
        <h2 className="text-center text-3xl font-bold sm:text-4xl">Frequently Asked Questions</h2>
        <div className="mx-auto mt-10 max-w-2xl">
          {faqs.map((item) => (
            <Faq key={item.q} item={item} />
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="container-page pb-24">
        <Card dark className="flex flex-col items-center gap-4 py-14 text-center">
          <Mic className="h-8 w-8 text-primary-300" />
          <h2 className="text-3xl font-bold">Ready to ace your next interview?</h2>
          <Link to={ROUTES.TRACK_SELECTION}>
            <Button size="lg" icon={ArrowRight}>
              Start Practicing Free
            </Button>
          </Link>
        </Card>
      </section>
    </div>
  );
}
