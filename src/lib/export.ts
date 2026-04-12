import * as XLSX from "xlsx";

export interface ExportRow {
  [key: string]: string | number;
}

export function exportToExcel(data: ExportRow[], filename: string, sheetName = "Calculation") {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  // Auto-width columns
  const maxWidth = data.reduce((acc, row) => {
    Object.keys(row).forEach((key, i) => {
      const len = Math.max(String(row[key]).length, key.length);
      acc[i] = Math.max((acc[i] as number) || 10, len + 2);
    });
    return acc;
  }, {} as Record<number, number>);

  ws["!cols"] = Object.values(maxWidth).map((w) => ({ wch: w as number }));

  XLSX.writeFile(wb, `${filename}.xlsx`);
}

export function exportToCSV(data: ExportRow[], filename: string) {
  const ws = XLSX.utils.json_to_sheet(data);
  const csv = XLSX.utils.sheet_to_csv(ws);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
