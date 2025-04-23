import { ErrorPage } from "../common/error-page";
import { AcceptanceRate } from "./charts/acceptance-rate";
import { ChatAcceptanceRate } from "./charts/chat-acceptance-rate";
import { ActiveUsers } from "./charts/active-users";
import { Editor } from "./charts/editor";
import { Language } from "./charts/language";
import { Stats } from "./charts/stats";
import { TotalChatsAndAcceptances } from "./charts/total-chat-suggestions-and-acceptances";
import { TotalCodeLineSuggestionsAndAcceptances } from "./charts/total-code-line-suggestions-and-acceptances";
import { TotalSuggestionsAndAcceptances } from "./charts/total-suggestions-and-acceptances";
import { DataProvider } from "./dashboard-state";
import { TimeFrameToggle } from "./filter/time-frame-toggle";
import { Header } from "./header";
import { getCopilotMetrics, IFilter as MetricsFilter } from "@/services/copilot-metrics-service";
import { getCopilotSeatsManagement, IFilter as SeatServiceFilter } from "@/services/copilot-seat-service";
import { dynamoDBConfiguration } from "@/services/dynamodb-service";
import { parseDate } from "@/utils/helpers";

export interface SearchParams {
  startDate?: string;
  endDate?: string;
  enterprise?: string;
  organization?: string;
  team?: string;
}

interface DashboardProps {
  searchParams: SearchParams;
}

export default async function Dashboard({ searchParams }: DashboardProps) {
  // Convert searchParams to the filter format
  const filter: MetricsFilter = {
    enterprise: searchParams.enterprise || "",
    organization: searchParams.organization || "",
    team: searchParams.team || "",
  };
  
  // Parse dates if they exist
  if (searchParams.startDate) {
    const parsedDate = parseDate(searchParams.startDate);
    // Only assign if not null (converting null to undefined)
    filter.startDate = parsedDate || undefined;
  }
  
  if (searchParams.endDate) {
    const parsedDate = parseDate(searchParams.endDate);
    // Only assign if not null (converting null to undefined)
    filter.endDate = parsedDate || undefined;
  }
  
  const metricsPromise = getCopilotMetrics(filter);
  const seatsPromise = getCopilotSeatsManagement({} as SeatServiceFilter);
  const [metrics, seats] = await Promise.all([metricsPromise, seatsPromise]);
  const isDynamoDB = dynamoDBConfiguration();

  if (metrics.status !== "OK") {
    return <ErrorPage error={metrics.errors[0].message} />;
  }

  if (seats.status !== "OK") {
    return <ErrorPage error={seats.errors[0].message} />;
  }

  return (
    <DataProvider
      copilotUsages={metrics.response}
      seatManagement={seats.response?.seats}
    >
      <main className="flex flex-1 flex-col gap-4 md:gap-8 pb-8">
        <Header isDynamoDB={isDynamoDB} />

        <div className="mx-auto w-full max-w-6xl container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Stats />
            <div className="flex justify-end col-span-4">
              <TimeFrameToggle />
            </div>
            <ActiveUsers />
            <AcceptanceRate />
            <ChatAcceptanceRate />
            <TotalCodeLineSuggestionsAndAcceptances />
            <TotalSuggestionsAndAcceptances />
            <TotalChatsAndAcceptances />
            <Language />
            <Editor />
          </div>
        </div>
      </main>
    </DataProvider>
  );
}
