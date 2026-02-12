-- Inserir domínio copyei.online para permitir novos clones na plataforma atual.
-- Usa o dono de copyei.com se existir; caso contrário, o primeiro usuário ativo.
INSERT INTO "Domains" ("domain", "user_id")
SELECT 'copyei.online', sub."user_id"
FROM (
  SELECT COALESCE(
    (SELECT "user_id" FROM "Domains" WHERE "domain" = 'copyei.com' LIMIT 1),
    (SELECT "id" FROM "Users" WHERE "deleted_at" IS NULL ORDER BY "created_at" ASC LIMIT 1)
  ) AS "user_id"
) sub
WHERE sub."user_id" IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM "Domains" WHERE "domain" = 'copyei.online');
