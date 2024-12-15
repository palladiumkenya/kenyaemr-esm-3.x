import * as XLSX from 'xlsx';

interface ExcelExportOptions {
  fileName?: string;
  sheetName?: string;
  compression?: boolean;
}

/**
 * Generic function to export any data to Excel
 * @param data - Array of objects to export
 * @param options - Export configuration options
 */
export async function exportToExcel<T>(data: Array<T>, options: ExcelExportOptions = {}): Promise<void> {
  const { fileName = 'Export', sheetName = 'Sheet1', compression = true } = options;

  try {
    // Convert data to worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Create workbook and append worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // Write file
    XLSX.writeFile(workbook, `${fileName}.xlsx`, { compression });
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    throw new Error('Failed to export data to Excel');
  }
}
