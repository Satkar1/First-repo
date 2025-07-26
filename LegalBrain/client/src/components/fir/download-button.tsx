import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { generateFIRPDF, type FIRData } from "@/lib/pdf-generator";

interface DownloadButtonProps {
  firData: FIRData;
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "default" | "lg";
}

export default function DownloadButton({ firData, variant = "outline", size = "sm" }: DownloadButtonProps) {
  const handleDownload = () => {
    try {
      generateFIRPDF(firData);
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  return (
    <Button
      onClick={handleDownload}
      variant={variant}
      size={size}
      className="flex items-center gap-2"
    >
      <Download className="h-4 w-4" />
      Download FIR PDF
    </Button>
  );
}