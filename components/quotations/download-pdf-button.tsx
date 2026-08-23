"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DownloadPdfButton() {
  return (
    <Button size="sm" onClick={() => window.print()}>
      <Download /> Download PDF
    </Button>
  );
}
