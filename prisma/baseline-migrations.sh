#!/bin/bash
# Marca as migrations já refletidas no banco como aplicadas (baseline).
# Execute uma vez no servidor quando o banco já existia antes do Prisma.
# Depois rode: npx prisma migrate deploy

set -e
cd "$(dirname "$0")/.."

MIGRATIONS=(
  "20240912162402_users_and_websites_models"
  "20240918220831_domains_and_websites"
  "20241015170450_multiple_websites_at_same_domain"
  "20241015171953_add"
  "20241105182303_adding_new_field_table_websites"
  "20241105183252_updating_field_table_websites"
  "20241218141040_"
  "20250126121221_user_update_column_of_payment"
  "20250126122404_user_update_column_duedate"
  "20250126122428_user_update_column_duedate"
  "20250128001933_add_websites_type_and_drive_folder_id_columns"
  "20250129182941_add_google_credentials_table"
  "20250130001618_update_table_user"
  "20250202144435_update"
  "20250202144730_update_user"
)

for name in "${MIGRATIONS[@]}"; do
  echo "Marcando como aplicada: $name"
  npx prisma migrate resolve --applied "$name"
done

echo ""
echo "Baseline concluído. Agora rode: npx prisma migrate deploy"
