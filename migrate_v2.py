import os
import openpyxl
from supabase import create_client, Client
from datetime import datetime

# Credenciales de Supabase
url: str = "https://ssfwmtjftfwlsfvdvzex.supabase.co"
key: str = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzZndtdGpmdGZ3bHNmdmR2emV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYyNDE3MTMsImV4cCI6MjEwMTgxNzcxM30.yFF6VZC7UCZTpi9FgCPHw-C2hVtRzxzSObW8GRpQ8lQ"
supabase: Client = create_client(url, key)

file_path = "Copia de IAD_157,158-JOB_LOG_00.xlsx"

def clean_date(val):
    if not val or str(val).strip().upper() in ['NA', 'N/A', 'PENDIENTE', '']:
        return None
    
    if isinstance(val, datetime):
        return val.strftime('%Y-%m-%d')
        
    val_str = str(val).strip()
    # Try parsing different formats if needed
    try:
        dt = datetime.strptime(val_str, '%Y-%m-%d %H:%M:%S')
        return dt.strftime('%Y-%m-%d')
    except:
        pass
        
    return None

def migrate_pi_log(sheet_name):
    print(f"Migrando {sheet_name} a zone_tests...")
    try:
        wb = openpyxl.load_workbook(file_path, data_only=True)
        sheet = wb[sheet_name]
        
        # Headers based on analysis: 
        # 0: Zone Name, 1: Visual, 3: Hydro, 5: 30 Min, 7: 24 air, 9: Trip, 11: Comments, 20: Resolution
        for i, row in enumerate(sheet.iter_rows(min_row=3, values_only=True)):
            if i >= 100: break # Limitar a 100 registros por seguridad
            
            zone_name = row[0]
            if not zone_name or "LEVEL" in str(zone_name).upper():
                continue # Saltar cabeceras de nivel o filas vacías
                
            zone_test = {
                'zone_name': str(zone_name).strip(),
                'visual_date': clean_date(row[1]),
                'hydro_date': clean_date(row[3]),
                'thirty_min_date': clean_date(row[5]),
                'twenty_four_air_date': clean_date(row[7]),
                'trip_date': clean_date(row[9]),
                'comments': str(row[11]).strip() if row[11] else None,
                'resolution': str(row[20]).strip() if len(row) > 20 and row[20] else None
            }
            
            # Print to debug
            print(f"Insertando: {zone_test['zone_name']}")
            
            response = supabase.table('zone_tests').insert(zone_test).execute()
        
        print(f"Migración de {sheet_name} completada.")
    except Exception as e:
        print(f"Error migrando {sheet_name}: {e}")

if __name__ == "__main__":
    print("Iniciando migración de datos a Supabase Fase 2...")
    migrate_pi_log("PI LOG (IAD 157)")
    migrate_pi_log("PI LOG (IAD 158)")
    print("Proceso terminado.")
