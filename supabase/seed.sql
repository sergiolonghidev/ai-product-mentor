-- supabase/seed.sql

-- Inserir Sessão Mock
INSERT INTO "Session" ("id", "squad", "functionalityType", "currentPain", "status")
VALUES (
  '123e4567-e89b-12d3-a456-426614174000',
  'Credit Cards - Aquisição',
  'parcelamento',
  'Não sei quais critérios de compliance usar na user story',
  'active'
) ON CONFLICT DO NOTHING;

-- Inserir Mensagem Mock do PM
INSERT INTO "Message" ("id", "sessionId", "role", "content")
VALUES (
  '123e4567-e89b-12d3-a456-426614174001',
  '123e4567-e89b-12d3-a456-426614174000',
  'user',
  'Quero criar um fluxo de parcelamento de fatura direto no app.'
) ON CONFLICT DO NOTHING;
