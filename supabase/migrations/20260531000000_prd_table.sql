CREATE TABLE "PRD" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "editedAt" TIMESTAMP WITH TIME ZONE,
  "sessionId" UUID REFERENCES "Session"("id") ON DELETE SET NULL,
  "squad" TEXT NOT NULL,
  "phase" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "context" TEXT NOT NULL,
  "problem" TEXT NOT NULL,
  "impactedUsers" TEXT NOT NULL,
  "solution" TEXT NOT NULL,
  "criteria" JSONB NOT NULL DEFAULT '[]',
  "regulatoryRestrictions" JSONB NOT NULL DEFAULT '[]',
  "metrics" TEXT NOT NULL DEFAULT '',
  "dependencies" TEXT NOT NULL DEFAULT '',
  "risks" TEXT NOT NULL DEFAULT '',
  "linearExportUrl" TEXT
);
