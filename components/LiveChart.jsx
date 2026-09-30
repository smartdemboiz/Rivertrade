export function LiveChart({ values = [], color = "#6CF9D8" }) {
  if (!values.length) return <div className="grid h-48 place-items-center text-sm text-[#829697]">Loading market data...</div>;
  const min = Math.min(...values); const max = Math.max(...values); const spread = max - min || 1;
  const points = values.map((value, index) => `${(index / Math.max(values.length - 1, 1)) * 100},${100 - ((value - min) / spread) * 84 - 8}`).join(" ");
  return <div className="rounded-2xl bg-[#101b1d] p-3"><svg viewBox="0 0 100 100" className="h-48 w-full" preserveAspectRatio="none" role="img" aria-label="Live market price chart"><path d="M0 88H100M0 50H100M0 12H100" stroke="white" strokeOpacity=".08" /><polyline points={points} fill="none" stroke={color} strokeWidth="1.5" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" /></svg></div>;
}
