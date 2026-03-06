"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { isAuthenticated } from "@/lib/auth";
import {
  Bot,
  Package,
  CreditCard,
  Truck,
  BarChart2,
  BookOpen,
  ArrowRight,
  CheckCircle,
  Zap,
  MessageSquare,
} from "lucide-react";

const FEATURES = [
  {
    icon: Bot,
    title: "AI Sales Agent",
    desc: "Your AI rep chats with customers, recommends products, and closes sales — all on WhatsApp.",
  },
  {
    icon: Package,
    title: "Product Catalog",
    desc: "Upload your products once. The AI learns your catalog and shows images, prices, and details.",
  },
  {
    icon: CreditCard,
    title: "Paystack Payments",
    desc: "Customers pay via card, bank transfer, or USSD. Payment links are sent automatically.",
  },
  {
    icon: Truck,
    title: "Shipping Calculator",
    desc: "Set delivery zones and rates. The AI calculates shipping fees based on customer location.",
  },
  {
    icon: BarChart2,
    title: "Business Dashboard",
    desc: "Track orders, revenue, conversations, and credits. Manage everything from one place.",
  },
  {
    icon: BookOpen,
    title: "Business Brain",
    desc: "Teach the AI your FAQs, business hours, and brand voice. It speaks like your team.",
  },
];

const STEPS = [
  {
    num: "01",
    title: "Connect WhatsApp",
    desc: "Link your business WhatsApp number in under 2 minutes. No special hardware needed.",
  },
  {
    num: "02",
    title: "Upload Your Products",
    desc: "Add your catalog manually, import via CSV, or connect your existing product API.",
  },
  {
    num: "03",
    title: "AI Sells 24/7",
    desc: "Customers message you on WhatsApp. Azerra handles the conversation, shows products, and collects payment.",
  },
];

const PRICING = [
  { credits: 100, price: "2,000", perCredit: "20" },
  { credits: 500, price: "8,000", perCredit: "16", popular: true },
  { credits: 1500, price: "18,000", perCredit: "12" },
];

const CREDIT_COSTS = [
  { action: "New conversation", cost: "5 credits" },
  { action: "Payment link sent", cost: "2 credits" },
  { action: "Follow-up message", cost: "1 credit" },
];

export default function HomePage() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) {
      router.replace("/dashboard");
    } else {
      setChecked(true);
    }
  }, [router]);

  if (!checked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-offwhite">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-offwhite font-sans">
      {/* Nav */}
      <nav className="sticky top-0 z-40 border-b border-gray-200/60 bg-offwhite/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <span className="text-xl font-black tracking-tight text-gray-900">
            AZ<span className="text-primary-500">ER</span>RA
          </span>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition hover:text-gray-900"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="flex items-center gap-1.5 rounded-xl bg-primary-500 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-primary-200 transition hover:bg-primary-600"
            >
              Get Started <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* subtle green glow */}
        <div className="pointer-events-none absolute -top-32 left-1/2 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-primary-300/20 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-5 py-24 text-center sm:py-36">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-4 py-1.5 text-xs font-semibold text-primary-700">
            <Zap className="h-3 w-3" />
            AI-Powered WhatsApp Sales
          </div>
          <h1 className="mx-auto max-w-3xl text-4xl font-black tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
            Your AI Sales Agent{" "}
            <span className="relative">
              <span className="bg-gradient-to-r from-primary-500 to-primary-700 bg-clip-text text-transparent">
                on WhatsApp
              </span>
              <svg
                className="absolute -bottom-2 left-0 w-full"
                viewBox="0 0 300 8"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1 5.5C60 2 120 2 150 3.5C180 5 240 6 299 3"
                  stroke="#25D366"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>
          <p className="mx-auto mt-8 max-w-xl text-lg leading-relaxed text-gray-500">
            Connect your WhatsApp number, upload your products, and let Azerra
            sell for you 24/7. Built for African businesses that want to grow
            without hiring a sales team.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-primary-200/60 transition hover:bg-primary-600 hover:shadow-xl"
            >
              Start Selling Free <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-8 py-3.5 text-base font-semibold text-gray-700 transition hover:border-gray-400 hover:bg-gray-50"
            >
              Log in to Dashboard
            </Link>
          </div>
          <p className="mt-4 text-sm text-gray-400">
            No monthly fees · Pay only for what you use
          </p>

          {/* Social proof strip */}
          <div className="mt-14 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400">
            {["Zero setup fees", "Ready in 5 minutes", "Cancel anytime"].map(
              (item) => (
                <span key={item} className="flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 text-primary-500" />
                  {item}
                </span>
              )
            )}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-t border-gray-200/60 bg-white py-24">
        <div className="mx-auto max-w-6xl px-5">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-primary-500">
              How It Works
            </p>
            <h2 className="mt-2 text-3xl font-black text-gray-900">
              Three steps to your AI sales team
            </h2>
          </div>
          <div className="mt-16 grid gap-10 sm:grid-cols-3">
            {STEPS.map((step, i) => (
              <div key={step.num} className="relative text-center">
                {i < STEPS.length - 1 && (
                  <div className="absolute left-[calc(50%+3rem)] top-5 hidden h-px w-[calc(100%-6rem)] border-t-2 border-dashed border-gray-200 sm:block" />
                )}
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-500 text-sm font-black text-white shadow-md shadow-primary-200">
                  {step.num}
                </div>
                <h3 className="mt-5 text-base font-bold text-gray-900">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-gray-200/60 bg-offwhite py-24">
        <div className="mx-auto max-w-6xl px-5">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-primary-500">
              Features
            </p>
            <h2 className="mt-2 text-3xl font-black text-gray-900">
              Everything you need to sell on WhatsApp
            </h2>
          </div>
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-md"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50">
                    <Icon className="h-5 w-5 text-primary-600" />
                  </div>
                  <h3 className="mt-4 text-base font-bold text-gray-900">
                    {f.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-gray-500">
                    {f.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="border-t border-gray-200/60 bg-white py-24">
        <div className="mx-auto max-w-6xl px-5">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-primary-500">
              Pricing
            </p>
            <h2 className="mt-2 text-3xl font-black text-gray-900">
              Simple, credit-based pricing
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm text-gray-500">
              No subscriptions. Buy credits, use them as customers come in.
            </p>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-3">
            {PRICING.map((p) => (
              <div
                key={p.credits}
                className={`relative rounded-2xl border p-8 text-center transition ${p.popular
                    ? "border-primary-500 shadow-lg shadow-primary-100 ring-1 ring-primary-500"
                    : "border-gray-200 hover:border-gray-300"
                  }`}
              >
                {p.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-primary-500 px-3 py-1 text-xs font-bold text-white">
                    Most Popular
                  </div>
                )}
                <div className="text-5xl font-black text-gray-900">
                  {p.credits}
                </div>
                <div className="mt-1 text-sm font-medium text-gray-400">
                  credits
                </div>
                <div className="mt-4 text-3xl font-black text-gray-900">
                  ₦{p.price}
                </div>
                <div className="mt-1 text-xs text-gray-400">
                  ₦{p.perCredit} per credit
                </div>
                <Link
                  href="/register"
                  className={`mt-6 block rounded-xl py-2.5 text-sm font-bold transition ${p.popular
                      ? "bg-primary-500 text-white hover:bg-primary-600"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                >
                  Get Started
                </Link>
              </div>
            ))}
          </div>

          <div className="mx-auto mt-10 max-w-md rounded-xl bg-offwhite p-5">
            <p className="mb-3 text-center text-xs font-bold uppercase tracking-wider text-gray-400">
              Credit usage
            </p>
            <div className="space-y-2">
              {CREDIT_COSTS.map((c) => (
                <div
                  key={c.action}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="flex items-center gap-2 text-gray-600">
                    <MessageSquare className="h-3.5 w-3.5 text-primary-400" />
                    {c.action}
                  </span>
                  <span className="font-semibold text-gray-900">{c.cost}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-gray-200/60 bg-[#0a2e1a] py-24">
        <div className="mx-auto max-w-3xl px-5 text-center">
          <h2 className="text-3xl font-black text-white sm:text-4xl">
            Ready to let AI sell for you?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-lg text-primary-300/80">
            Join African businesses already using Azerra to automate their
            WhatsApp sales. Set up in under 5 minutes.
          </p>
          <Link
            href="/register"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-primary-500 px-8 py-3.5 text-base font-bold text-white shadow-lg shadow-black/30 transition hover:bg-primary-400"
          >
            Create Your Free Account <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200/60 bg-offwhite py-10">
        <div className="mx-auto max-w-6xl px-5 text-center">
          <span className="text-lg font-black tracking-tight text-gray-900">
            AZ<span className="text-primary-500">ER</span>RA
          </span>
          <p className="mt-2 text-sm text-gray-400">
            AI-powered WhatsApp sales automation for African businesses.
          </p>
          <p className="mt-4 text-xs text-gray-300">
            &copy; {new Date().getFullYear()} Azerra. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
