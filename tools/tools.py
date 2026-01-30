import os
import json
from typing import Type, Any
from crewai.tools import BaseTool
from pydantic import BaseModel, Field

# --- НАЛАШТУВАННЯ БЕЗПЕКИ ---
PROJECT_ROOT = os.path.abspath(os.getcwd())

def _is_safe_path(path: str) -> bool:
    absolute_path = os.path.abspath(path)
    return os.path.commonprefix([absolute_path, PROJECT_ROOT]) == PROJECT_ROOT

# --- СХЕМИ ВХІДНИХ ДАНИХ (Pydantic Models) ---
# Це допомагає агентам розуміти, які саме аргументи передавати

class FileInput(BaseModel):
    file_path: str = Field(..., description="The path to the file (e.g., 'src/data.ts').")

class DirectoryInput(BaseModel):
    directory_path: str = Field(..., description="The path to the directory (e.g., 'src' or '.').")

class WriteReportInput(BaseModel):
    filename: str = Field(..., description="Name of the file (e.g., 'analysis.md').")
    content: str = Field(..., description="The text content to write into the file.")

class MarketingInput(BaseModel):
    data_json: str = Field(..., description="JSON string with keys: spend, leads, conversion_rate, average_check.")

class SimulationInput(BaseModel):
    params_json: str = Field(..., description="JSON string with keys: price, daily_clients, days_worked.")


# --- ІНСТРУМЕНТИ ЯК КЛАСИ (BaseTool) ---

class ListDirectoryTool(BaseTool):
    name: str = "List Directory"
    description: str = "Shows a list of files and folders in a directory."
    args_schema: Type[BaseModel] = DirectoryInput

    def _run(self, directory_path: str) -> str:
        try:
            target_path = os.path.join(PROJECT_ROOT, directory_path)
            if not _is_safe_path(target_path):
                return json.dumps({"error": "Access denied"})
            if not os.path.exists(target_path):
                return json.dumps({"error": f"Not found: {directory_path}"})
            
            items = os.listdir(target_path)
            formatted_items = []
            for item in items:
                item_path = os.path.join(target_path, item)
                if os.path.isdir(item_path):
                    formatted_items.append(f"[DIR]  {item}")
                else:
                    formatted_items.append(f"[FILE] {item}")
            return json.dumps({"current_directory": directory_path, "contents": formatted_items}, indent=2)
        except Exception as e:
            return json.dumps({"error": str(e)})

class ReadFileTool(BaseTool):
    name: str = "Read File"
    description: str = "Reads the content of a specific file."
    args_schema: Type[BaseModel] = FileInput

    def _run(self, file_path: str) -> str:
        try:
            target_path = os.path.join(PROJECT_ROOT, file_path)
            if not _is_safe_path(target_path):
                return json.dumps({"error": "Access denied"})
            if not os.path.exists(target_path):
                return json.dumps({"error": f"File not found: {file_path}"})
            
            with open(target_path, 'r', encoding='utf-8') as f:
                content = f.read()
            return f"--- START OF FILE: {file_path} ---\n{content}\n--- END OF FILE ---"
        except Exception as e:
            return json.dumps({"error": str(e)})

class WriteReportTool(BaseTool):
    name: str = "Write Report"
    description: str = "Writes text content to a report file."
    args_schema: Type[BaseModel] = WriteReportInput

    def _run(self, filename: str, content: str) -> str:
        try:
            reports_dir = os.path.join(PROJECT_ROOT, "reports")
            os.makedirs(reports_dir, exist_ok=True)
            target_path = os.path.join(reports_dir, filename)
            
            if not _is_safe_path(target_path):
                return json.dumps({"error": "Access denied"})

            with open(target_path, 'w', encoding='utf-8') as f:
                f.write(content)
            return json.dumps({"status": "success", "message": f"Saved to {target_path}"})
        except Exception as e:
            return json.dumps({"error": str(e)})

class MarketingCalculatorTool(BaseTool):
    name: str = "Marketing Calculator"
    description: str = "Calculates CPL, CAC, Revenue, ROMI from JSON data."
    args_schema: Type[BaseModel] = MarketingInput

    def _run(self, data_json: str) -> str:
        try:
            if isinstance(data_json, str):
                try: data = json.loads(data_json)
                except: return "Error: Invalid JSON string"
            else: data = data_json

            spend = float(data.get('spend', 0))
            leads = float(data.get('leads', 1))
            conversion = float(data.get('conversion_rate', 0.0))
            check = float(data.get('average_check', 0))

            cpl = spend / leads if leads > 0 else 0
            customers = leads * conversion
            cac = spend / customers if customers > 0 else 0
            revenue = customers * check
            romi = ((revenue - spend) / spend) * 100 if spend > 0 else 0

            return json.dumps({
                "CPL": round(cpl, 2),
                "Customers": int(customers),
                "CAC": round(cac, 2),
                "Revenue": round(revenue, 2),
                "ROMI (%)": round(romi, 2)
            }, indent=2)
        except Exception as e:
            return json.dumps({"error": str(e)})

class BusinessSimulationTool(BaseTool):
    name: str = "Business Simulation"
    description: str = "Simulates profit based on price and clients."
    args_schema: Type[BaseModel] = SimulationInput

    def _run(self, params_json: str) -> str:
        try:
            if isinstance(params_json, str):
                try: params = json.loads(params_json)
                except: return "Error: Invalid JSON string"
            else: params = params_json

            price = float(params.get('price', 400))
            clients = float(params.get('daily_clients', 4))
            days = float(params.get('days_worked', 22))
            
            revenue = price * clients * days
            tax = revenue * 0.05
            fixed_costs = 2000
            profit = revenue - tax - fixed_costs

            return json.dumps({
                "Gross Revenue": revenue,
                "Net Profit": profit,
                "Verdict": "Profitable" if profit > 0 else "Loss"
            }, indent=2)
        except Exception as e:
            return json.dumps({"error": str(e)})

# --- ЕКСПОРТ ЕКЗЕМПЛЯРІВ (INSTANCES) ---
# Саме ці змінні ми імпортуємо в agents.py

list_files_tool = ListDirectoryTool()
read_file_tool = ReadFileTool()
write_report_tool = WriteReportTool()
marketing_tool = MarketingCalculatorTool()
simulation_tool = BusinessSimulationTool()