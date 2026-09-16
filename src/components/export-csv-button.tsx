"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toCsv, downloadCsv, type CsvColumn } from "@/lib/csv-export";

export function ExportCsvButton<T>({
  rows,
  columns,
  filename,
}: {
  rows: T[];
  columns: CsvColumn<T>[];
  filename: string;
}) {
  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-2"
      disabled={rows.length === 0}
      onClick={() => downloadCsv(filename, toCsv(rows, columns))}
    >
      <Download className="h-4 w-4" />
      Export CSV
    </Button>
  );
}
