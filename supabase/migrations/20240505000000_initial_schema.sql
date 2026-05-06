-- supabase/migrations/00001_initial_schema.sql

CREATE TABLE "Session" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "status" TEXT DEFAULT 'onboarding',
  "squad" TEXT NOT NULL,
  "functionalityType" TEXT NOT NULL,
  "currentPain" TEXT NOT NULL
);

CREATE TABLE "Message" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "sessionId" UUID NOT NULL REFERENCES "Session"("id") ON DELETE CASCADE,
  "role" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "type" TEXT,
  "metadata" JSONB
);

CREATE TABLE "UserStory" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "sessionId" UUID NOT NULL REFERENCES "Session"("id") ON DELETE CASCADE,
  "messageId" UUID UNIQUE NOT NULL REFERENCES "Message"("id") ON DELETE CASCADE,
  "persona" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "benefit" TEXT NOT NULL,
  "criteria" JSONB NOT NULL,
  "lintResult" JSONB,
  "linearIssueId" TEXT,
  "linearIssueUrl" TEXT
);

CREATE TABLE "Feedback" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "sessionId" UUID NOT NULL REFERENCES "Session"("id") ON DELETE CASCADE,
  "messageId" UUID UNIQUE NOT NULL REFERENCES "Message"("id") ON DELETE CASCADE,
  "vote" TEXT NOT NULL,
  "reason" TEXT
);
