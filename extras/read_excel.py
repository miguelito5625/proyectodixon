import pandas as pd
import json

file_path = "c:\\Users\\exbinario\\Documents\\desarrollo\\antigravity\\proyectoDixon\\extras\\IAD 158 DataHall Altas Bajas.xlsx"

try:
    xl = pd.ExcelFile(file_path)
    output = {"sheet_names": xl.sheet_names, "sheets": {}}
    for sheet in xl.sheet_names:
        df = xl.parse(sheet)
        output["sheets"][sheet] = {
            "columns": df.columns.tolist(),
            "sample_row": df.head(1).to_dict(orient="records") if not df.empty else []
        }
    print(json.dumps(output, indent=2, default=str))
except Exception as e:
    print(f"Error: {e}")
