import Dashboard from "@/features/seats/seats-page";
import { Suspense } from "react";
import Loading from "./loading";
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "GitHub Copilot Seats Dashboard",
  description: "GitHub Copilot Seats Dashboard",
};

export const dynamic = "force-dynamic";

// Define searchParams as a Promise type to align with Next.js 15
type SearchParamsType = Promise<{ [key: string]: string | string[] } | undefined>;

export default async function Home({
  searchParams,
}: {
  searchParams: SearchParamsType;
}) {
  let id = "initial-seats-dashboard";

  // Await the searchParams Promise
  const awaitedParams = await searchParams || {};

  // Create a simple object with the search params
  const typedSearchParams = {
    date: typeof awaitedParams?.date === 'string' ? awaitedParams.date : undefined,
    enterprise: typeof awaitedParams?.enterprise === 'string' ? awaitedParams.enterprise : undefined,
    organization: typeof awaitedParams?.organization === 'string' ? awaitedParams.organization : undefined,
    team: typeof awaitedParams?.team === 'string' ? awaitedParams.team : undefined,
  };
  
  if (typedSearchParams.date) {
    id = `${id}-${typedSearchParams.date}`;
  }

  return (
    <Suspense fallback={<Loading />} key={id}>
      <Dashboard searchParams={typedSearchParams} />
    </Suspense>
  );
}
