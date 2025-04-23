import { ErrorPage } from "../common/error-page";
import { SeatsList } from "./seats-list";
import { DataProvider } from "./seats-state";
import { Header } from "./header";
import { Stats } from "./stats/stats";
import { getFeatures, parseDate } from "@/utils/helpers";
import { dynamoDBConfiguration } from "@/services/dynamodb-service";

import {
  getCopilotSeats,
  IFilter,
} from "@/services/copilot-seat-service";

export interface SearchParams {
  date?: string;
  enterprise?: string;
  organization?: string;
  team?: string;
}

interface DashboardProps {
  searchParams: SearchParams;
}

export default async function Dashboard({ searchParams }: DashboardProps) {
  const features = getFeatures();
  const isDynamoDB = dynamoDBConfiguration();

  if (!features.seats) {
    return <ErrorPage error="Feature not available"></ErrorPage>
  }
  
  // Convert searchParams to the filter format
  const filter: IFilter = {
    enterprise: searchParams.enterprise || "",
    organization: searchParams.organization || "",
    team: searchParams.team || "",
  };
  
  // Parse date if it exists
  if (searchParams.date) {
    const parsedDate = parseDate(searchParams.date);
    // Only assign if not null (converting null to undefined)
    filter.date = parsedDate || undefined;
  }

  const seatsPromise = getCopilotSeats(filter);
  const [seats] = await Promise.all([seatsPromise]);
  if (seats.status !== "OK") {
    return <ErrorPage error={seats.errors[0].message} />;
  }

  return (
    <DataProvider copilotSeats={seats.response}>
      <main className="flex flex-1 flex-col gap-4 md:gap-8 pb-8">
        <Header title="Seats" isDynamoDB={isDynamoDB} />
        <div className="mx-auto w-full max-w-6xl container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Stats />
            <div className="flex justify-end col-span-4">
            </div>
            <SeatsList />
          </div>
        </div>
      </main>
    </DataProvider>
  );
}
