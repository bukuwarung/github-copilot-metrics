import Dashboard from "@/features/dashboard/dashboard-page";
import { Suspense } from "react";
import Loading from "./loading";

export const dynamic = "force-dynamic";

// Define searchParams as a Promise type to align with Next.js 15
type SearchParamsType = Promise<{ [key: string]: string | string[] } | undefined>;

export default async function Home({
  searchParams,
}: {
  searchParams: SearchParamsType;
}) {
  let id = "initial-dashboard";
  
  // Await the searchParams Promise
  const awaitedParams = await searchParams || {};
  
  // Create a simple object with the search params
  const typedSearchParams = {
    startDate: typeof awaitedParams?.startDate === 'string' ? awaitedParams.startDate : undefined,
    endDate: typeof awaitedParams?.endDate === 'string' ? awaitedParams.endDate : undefined,
    enterprise: typeof awaitedParams?.enterprise === 'string' ? awaitedParams.enterprise : undefined,
    organization: typeof awaitedParams?.organization === 'string' ? awaitedParams.organization : undefined,
    team: typeof awaitedParams?.team === 'string' ? awaitedParams.team : undefined,
  };
  
  if (typedSearchParams.startDate && typedSearchParams.endDate) {
    id = `${id}-${typedSearchParams.startDate}-${typedSearchParams.endDate}`;
  }

  return (
    <Suspense fallback={<Loading />} key={id}>
      <Dashboard searchParams={typedSearchParams} />
    </Suspense>
  );
}
