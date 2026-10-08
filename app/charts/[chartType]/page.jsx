import { notFound } from "next/navigation";
import { ChartPage } from "../../../components/ChartPage";
import { chartTypes } from "../../../components/chartTypes";

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(chartTypes).map((chartType) => ({ chartType }));
}

export async function generateMetadata({ params }) {
  const { chartType } = await params;
  const chart = chartTypes[chartType];

  return {
    title: chart ? `${chart.title} | RiverTrade` : "Chart not found | RiverTrade",
  };
}

export default async function Page({ params }) {
  const { chartType } = await params;
  if (!chartTypes[chartType]) notFound();

  return <ChartPage chartType={chartType} />;
}
