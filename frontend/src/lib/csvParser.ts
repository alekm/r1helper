// CSV parsing utility for SmartZone and Ruckus One CSV files

export interface CsvData {
  headers: string[]
  rows: string[][]
}

/**
 * Parse a CSV string into structured data
 * @param csvText - Raw CSV text content
 * @returns Parsed CSV data with headers and rows
 * @throws Error if CSV is empty or invalid
 */
export function parseCsv(csvText: string): CsvData {
  const lines = csvText.split('\n').filter((line) => line.trim() !== '')
  if (lines.length === 0) {
    throw new Error('CSV file is empty')
  }

  const headers = lines[0].split(',').map((h) => h.trim().replace(/"/g, ''))
  const rows = lines.slice(1).map((line) => line.split(',').map((cell) => cell.trim().replace(/"/g, '')))

  return { headers, rows }
}

/**
 * Convert CSV data back to a CSV string
 * @param data - Structured CSV data
 * @param includeComments - Optional comment rows to prepend
 * @returns CSV string with proper formatting
 */
export function stringifyCsv(data: CsvData, includeComments?: string[][]): string {
  const commentRows = includeComments?.map((row) => row.join(',')) || []
  const dataRows = [data.headers.join(','), ...data.rows.map((row) => row.join(','))]

  return [...commentRows, ...dataRows].join('\n')
}

/**
 * Download CSV data as a file
 * @param data - CSV data to download
 * @param filename - Name for the downloaded file
 * @param comments - Optional comment rows to include at the top
 */
export function downloadCsv(data: CsvData, filename: string, comments?: string[][]): void {
  const csvContent = stringifyCsv(data, comments)
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
