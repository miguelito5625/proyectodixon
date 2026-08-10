import os
from supabase import create_client, Client

url: str = "https://ssfwmtjftfwlsfvdvzex.supabase.co"
key: str = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzZndtdGpmdGZ3bHNmdmR2emV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYyNDE3MTMsImV4cCI6MjEwMTgxNzcxM30.yFF6VZC7UCZTpi9FgCPHw-C2hVtRzxzSObW8GRpQ8lQ"
supabase: Client = create_client(url, key)

tables_to_check = [
    'materials',
    'inspections',
    'zone_tests',
    'trip_tests',
    'issues_log',
    'electrical_requirements'
]

print("Verificando existencia de tablas...")
all_exist = True
for table in tables_to_check:
    try:
        res = supabase.table(table).select('id').limit(1).execute()
        print(f"OK - Tabla '{table}' existe y es accesible.")
    except Exception as e:
        all_exist = False
        print(f"ERROR al acceder a '{table}': {e}")

if all_exist:
    print("Todas las tablas necesarias existen.")
else:
    print("Faltan algunas tablas.")
