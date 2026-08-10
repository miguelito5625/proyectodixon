import os
import openpyxl
from supabase import create_client, Client
from datetime import datetime

url: str = "https://ssfwmtjftfwlsfvdvzex.supabase.co"
key: str = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzZndtdGpmdGZ3bHNmdmR2emV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYyNDE3MTMsImV4cCI6MjEwMTgxNzcxM30.yFF6VZC7UCZTpi9FgCPHw-C2hVtRzxzSObW8GRpQ8lQ"
supabase: Client = create_client(url, key)

file_path = "Copia de IAD 158 Control Inspecciones 2.xlsx"

def clean_date(val):
    if not val or str(val).strip().upper() in ['NA', 'N/A', 'PENDIENTE', '', 'N/A ']:
        return None
    
    if isinstance(val, datetime):
        return val.strftime('%Y-%m-%d')
        
    val_str = str(val).strip()
    try:
        dt = datetime.strptime(val_str, '%Y-%m-%d %H:%M:%S')
        return dt.strftime('%Y-%m-%d')
    except:
        pass
        
    return None

def cleanup_previous():
    print("Limpiando inserciones previas fallidas...")
    try:
        supabase.table('zone_tests').delete().like('zone_name', 'L1 - Zona%').execute()
        supabase.table('zone_tests').delete().like('zone_name', 'L2 - Zona%').execute()
    except Exception as e:
        print(f"Error limpiando: {e}")

def upload_zonas():
    cleanup_previous()
    print("Subiendo Zonas - Rociadores...")
    try:
        wb = openpyxl.load_workbook(file_path, data_only=True)
        sheet = wb["Zonas - Rociadores"]
        
        for i, row in enumerate(sheet.iter_rows(min_row=5, values_only=True)):
            if not row[0]: continue
            
            zona_val = str(row[0]).strip()
            
            # Skip if it's a note
            if "Nota" in zona_val or len(zona_val) > 50:
                continue
                
            nivel_val = str(row[1]).strip() if row[1] else ""
            zone_name = f"{nivel_val} - Zona {zona_val}" if nivel_val and nivel_val.lower() not in ['none', 'null', ''] else f"Zona {zona_val}"
            
            zone_test = {
                'zone_name': zone_name[:255],
                'visual_date': clean_date(row[5]),
                'hydro_date': clean_date(row[7]),
                'thirty_min_date': clean_date(row[9]),
                'twenty_four_air_date': clean_date(row[11]),
                'trip_date': clean_date(row[13]),
                'comments': str(row[16]).strip() if row[16] else None,
                'resolution': None
            }
            
            print(f"Insertando Zona: {zone_name}")
            supabase.table('zone_tests').insert(zone_test).execute()
        print("Zonas subidas correctamente.")
    except Exception as e:
        print(f"Error subiendo zonas: {e}")

if __name__ == "__main__":
    upload_zonas()
