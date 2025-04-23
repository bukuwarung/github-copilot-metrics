import { DynamoDBClient, ListTablesCommand } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand, PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { ServerActionResponse } from "@/features/common/server-action-response";
import { stringIsNullOrEmpty } from "../utils/helpers";

let dynamoDBClient: DynamoDBDocumentClient | null = null;

export const getDynamoDBClient = () => {
  const region = process.env.AWS_REGION || "ap-southeast-1";
  const tablePrefix = process.env.AWS_DYNAMODB_TABLE_PREFIX || "copilot-metrics-dev";

  if (dynamoDBClient === null) {
    // Create the DynamoDB service client
    const client = new DynamoDBClient({ region });
    
    // Create the DynamoDB document client
    dynamoDBClient = DynamoDBDocumentClient.from(client, {
      marshallOptions: {
        // Whether to automatically convert empty strings, blobs, and sets to `null`
        convertEmptyValues: true,
        // Whether to remove undefined values while marshalling
        removeUndefinedValues: true,
        // Whether to convert typeof object to map attribute
        convertClassInstanceToMap: true,
      },
      unmarshallOptions: {
        // Whether to return numbers as strings instead of converting them to native JavaScript numbers
        wrapNumbers: false,
      },
    });
  }
  
  return {
    client: dynamoDBClient,
    tablePrefix,
  };
};

export const dynamoDBConfiguration = (): boolean => {
  return process.env.AWS_DYNAMODB_TABLE_PREFIX !== undefined && 
         process.env.AWS_DYNAMODB_TABLE_PREFIX.trim() !== "";
};

/**
 * Performs a health check on the DynamoDB connection
 * @returns Object containing health status and response time
 */
export const isDynamoDBHealthy = async (): Promise<{
  isHealthy: boolean;
  responseTimeMs?: number;
  message?: string;
}> => {
  try {
    const startTime = performance.now();
    
    // Get DynamoDB client
    const { client } = getDynamoDBClient();
    
    // Simple list tables operation to check connectivity
    const command = new ListTablesCommand({ Limit: 1 });
    await client.send(command);
    
    const endTime = performance.now();
    const responseTimeMs = Math.round(endTime - startTime);
    
    return {
      isHealthy: true,
      responseTimeMs,
      message: "DynamoDB connection successful"
    };
  } catch (error) {
    console.error("DynamoDB health check failed:", error);
    return {
      isHealthy: false,
      message: error instanceof Error ? error.message : "Unknown DynamoDB connection error"
    };
  }
};