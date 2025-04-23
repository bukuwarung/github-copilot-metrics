"use client";
import { Card, CardContent } from "@/components/ui/card";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { useDashboard } from "../dashboard-state";
import { AcceptanceRateData, computeAcceptanceAverage } from "./common";
import { ChartHeader } from "./chart-header";

export const AcceptanceRate = () => {
  const { filteredData } = useDashboard();
  const data = computeAcceptanceAverage(filteredData);
  
  // Add debugging to check if data is available
  console.log("Acceptance Rate data:", data);
  
  // Only render chart if there's data
  const hasData = Array.isArray(data) && data.length > 0;

  return (
    <Card className="col-span-4">
      <ChartHeader
        title="Acceptance rate"
        description="The ratio of accepted code and lines suggested to the total code and lines suggested by GitHub Copilot"
      />

      <CardContent className="h-80">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 30 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="timeFrameDisplay"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                domain={[0, 100]}
              />
              <Tooltip formatter={(value) => [`${value}%`]} />
              <Legend />
              <Area
                name="Acceptance rate (%)"
                dataKey="acceptanceRate"
                type="linear"
                fill="hsl(var(--chart-2))"
                stroke="hsl(var(--chart-2))"
                strokeWidth={2}
              />
              <Area
                name="Lines acceptance rate (%)"
                dataKey="acceptanceLinesRate"
                type="linear"
                fill="hsl(var(--chart-1))"
                fillOpacity={0.6}
                stroke="hsl(var(--chart-1))"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            No data available for the selected time period
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const chartConfig: Record<
  DataKey,
  {
    label: string;
    key: DataKey;
  }
> = {
  ["acceptanceRate"]: {
    label: "Acceptance rate (%) ",
    key: "acceptanceRate",
  },

  ["acceptanceLinesRate"]: {
    label: "Acceptance Lines rate (%) ",
    key: "acceptanceLinesRate",
  },

  ["timeFrameDisplay"]: {
    label: "Time frame display",
    key: "timeFrameDisplay",
  },
};

type DataKey = keyof AcceptanceRateData;
