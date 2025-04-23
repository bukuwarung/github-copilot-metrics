import {
  formatResponseError,
  unknownResponseError,
} from "@/features/common/response-error";
import {
  CopilotMetrics,
  CopilotUsageOutput,
} from "@/features/common/models";
import { ServerActionResponse } from "@/features/common/server-action-response";
import { format } from "date-fns";
import { getDynamoDBClient, dynamoDBConfiguration } from "./dynamodb-service";
import { ensureGitHubEnvConfig } from "./env-service";
import { stringIsNullOrEmpty, applyTimeFrameLabel } from "../utils/helpers";
import { sampleData } from "./sample-data";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";

export interface IFilter {
  startDate?: Date;
  endDate?: Date;
  enterprise: string;
  organization: string;
  team: string;
}

export const getCopilotMetrics = async (
  filter: IFilter
): Promise<ServerActionResponse<CopilotUsageOutput[]>> => {
  const env = ensureGitHubEnvConfig();
  const isDynamoDBConfig = dynamoDBConfiguration();

  if (env.status !== "OK") {
    return env;
  }

  const { enterprise, organization } = env.response;

  try {
    switch (process.env.GITHUB_API_SCOPE) {
      case "enterprise":
        if (stringIsNullOrEmpty(filter.enterprise)) {
          filter.enterprise = enterprise ?? "";
        }
        break;
      default:
        if (stringIsNullOrEmpty(filter.organization)) {
          filter.organization = organization;
        }
        break;
    }
    if (isDynamoDBConfig) {
      return getCopilotMetricsFromDatabase(filter);
    }
    return getCopilotMetricsFromApi(filter);
  } catch (e) {
    return unknownResponseError(e);
  }
};

const fetchCopilotMetrics = async (
  url: string,
  token: string,
  version: string,
  entityName: string
): Promise<ServerActionResponse<CopilotUsageOutput[]>> => {
  const response = await fetch(url, {
    cache: "no-store",
    headers: {
      Accept: `application/vnd.github+json`,
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": version,
    },
  });

  if (!response.ok) {
    return formatResponseError(entityName, response);
  }

  const data = await response.json();
  const dataWithTimeFrame = applyTimeFrameLabel(data);
  return {
    status: "OK",
    response: dataWithTimeFrame,
  };
};

export const getCopilotMetricsFromApi = async (
  filter: IFilter
): Promise<ServerActionResponse<CopilotUsageOutput[]>> => {
  const env = ensureGitHubEnvConfig();

  if (env.status !== "OK") {
    return env;
  }

  const { token, version } = env.response;

  try {
    const queryParams = new URLSearchParams();
    
    if (filter.startDate) {
      queryParams.append('since', format(filter.startDate, "yyyy-MM-dd"));
    }
    if (filter.endDate) {
      queryParams.append('until', format(filter.endDate, "yyyy-MM-dd"));
    }
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';

    if (filter.enterprise) {
      const url = `https://api.github.com/enterprises/${filter.enterprise}/copilot/metrics${queryString}`;
      return fetchCopilotMetrics(url, token, version, filter.enterprise);
    } else {
      const url = `https://api.github.com/orgs/${filter.organization}/copilot/metrics${queryString}`;
      return fetchCopilotMetrics(url, token, version, filter.organization);
    }
  } catch (e) {
    return unknownResponseError(e);
  }
};

export const getCopilotMetricsFromDatabase = async (
  filter: IFilter
): Promise<ServerActionResponse<CopilotUsageOutput[]>> => {
  const { client, tablePrefix } = getDynamoDBClient();

  let start = "";
  let end = "";
  const maximumDays = 31;

  if (filter.startDate && filter.endDate) {
    start = format(filter.startDate, "yyyy-MM-dd");
    end = format(filter.endDate, "yyyy-MM-dd");
  } else {
    // set the start date to today and the end date to 31 days ago
    const todayDate = new Date();
    const startDate = new Date(todayDate);
    startDate.setDate(todayDate.getDate() - maximumDays);

    start = format(startDate, "yyyy-MM-dd");
    end = format(todayDate, "yyyy-MM-dd");
  }

  // Building filter expressions
  let filterExpression = "#dateAttr BETWEEN :start AND :end";
  let expressionAttributeValues: any = {
    ":start": start,
    ":end": end,
  };
  
  // Define ExpressionAttributeNames for reserved keywords
  let expressionAttributeNames: any = {
    "#dateAttr": "date"
  };

  if (filter.enterprise) {
    filterExpression += " AND enterprise = :enterprise";
    expressionAttributeValues[":enterprise"] = filter.enterprise;
  }

  if (filter.organization) {
    filterExpression += " AND organization = :organization";
    expressionAttributeValues[":organization"] = filter.organization;
  }
  
  if (filter.team) {
    filterExpression += " AND team = :team";
    expressionAttributeValues[":team"] = filter.team;
  }

  const command = new ScanCommand({
    TableName: `${tablePrefix}-metrics-history`,
    FilterExpression: filterExpression,
    ExpressionAttributeValues: expressionAttributeValues,
    ExpressionAttributeNames: expressionAttributeNames
  });

  try {
    const data = await client.send(command);
    const metrics = data.Items as CopilotMetrics[];
    
    const dataWithTimeFrame = applyTimeFrameLabel(metrics || []);
    return {
      status: "OK",
      response: dataWithTimeFrame,
    };
  } catch (error) {
    console.error("Error querying DynamoDB:", error);
    return unknownResponseError(error);
  }
};

export const _getCopilotMetrics = (): Promise<CopilotUsageOutput[]> => {
  const promise = new Promise<CopilotUsageOutput[]>((resolve) => {
    setTimeout(() => {
      const weekly = applyTimeFrameLabel(sampleData);
      resolve(weekly);
    }, 1000);
  });

  return promise;
};
