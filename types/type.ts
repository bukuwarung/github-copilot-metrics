const awsEnvVars = [
  "GITHUB_ENTERPRISE",
  "GITHUB_TOKEN",
  "GITHUB_ORGANIZATION",
  "AWS_REGION",
  "AWS_DYNAMODB_TABLE_PREFIX",
] as const;

type RequiredServerEnvKeys = (typeof awsEnvVars)[number];

declare global {
  namespace NodeJS {
    interface ProcessEnv extends Record<RequiredServerEnvKeys, string> {}
  }
}

export {};
