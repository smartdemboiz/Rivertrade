"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMarkets } from "../hooks/useMarkets";
import { SiteHeader } from "./SiteHeader";
import { TradingViewChart } from "./TradingViewChart";
import { chartTypes } from "./chartTypes";

export function ChartPage({ chartType }) {
  const router = useRouter();
  const data = useMarkets();
  const chart = chartTypes[chartType];

  return (
    <>
      <SiteHeader
        onDashboard={() => router.push("/")}
        onLogin={() => router.push("/auth")}
        onSignup={() => router.push("/auth")}
        data={data}
      />
      <main className="min-h-screen bg-background px-5 py-10 text-foreground sm:py-16">
        <div className="mx-auto max-w-7xl">
          <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-olive hover:underline">
            <span aria-hidden="true">←</span> Back to markets
          </Link>
          <p className="mb-5 text-xs font-black uppercase tracking-[2px] text-olive">
            Live analysis · {chart.title}
          </p>
          <TradingViewChart
            key={chartType}
            chartType={chartType}
            data={data}
            onSignup={() => router.push("/auth")}
          />
        </div>
      </main>
    </>
  );
}
