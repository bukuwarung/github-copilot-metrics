import { ServerActionResponse } from "@/features/common/server-action-response";
import { stringIsNullOrEmpty } from "../utils/helpers";

// This is a stub for the previously Azure Cosmos DB service
// The application now uses DynamoDB instead

export const cosmosClient = () => {
  throw new Error("Cosmos DB is not supported in this environment. Use DynamoDB instead.");
};

export const cosmosConfiguration = (): boolean => {
  return false; // Always return false as we've migrated to DynamoDB
};