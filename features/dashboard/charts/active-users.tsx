"use client";
import { Card, CardContent } from "@/components/ui/card";
import { useDashboard } from "../dashboard-state";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { ChartHeader } from "./chart-header";
import { ActiveUserData, getActiveUsers } from "./common";

export const ActiveUsers = () => {
  const { filteredData } = useDashboard();
  const data = getActiveUsers(filteredData);

  // Add debugging to check if data is available
  console.log("Active Users data:", data);

  // Only render chart if there's data
  const hasData = Array.isArray(data) && data.length > 0;

  return (
    <Card className="col-span-4">
      <ChartHeader
        title="Active Users"
        description="The total number active users per day using the chat and inline suggestions."
      />
      <CardContent className="h-80">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 30 }}>
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
              />
              <Tooltip />
              <Legend />
              <Bar 
                name="Total Users" 
                dataKey="totalUsers" 
                fill="hsl(var(--chart-2))" 
                radius={4} 
              />
              <Bar 
                name="Chat Users" 
                dataKey="totalChatUsers" 
                fill="hsl(var(--chart-1))" 
                radius={4} 
              />
            </BarChart>
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
  ["totalUsers"]: {
    label: "Total users",
    key: "totalUsers",
  },
  ["totalChatUsers"]: {
    label: "Total chat users",
    key: "totalChatUsers",
  },
  ["timeFrameDisplay"]: {
    label: "Time frame display",
    key: "timeFrameDisplay",
  },
};

type DataKey = keyof ActiveUserData;
