"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

const PDFViewer = ({ urls }: { urls: string[] }) => {
  const [pdfNumber, setPdfNumber] = useState(0);

  const handleNextPdf = () => {
    if (pdfNumber < 5) {
      setPdfNumber(pdfNumber + 1);
    }
  };
  const handlePrevPdf = () => {
    if (pdfNumber >= 0) {
      setPdfNumber(pdfNumber - 1);
    }
  };
  return (
    <div>
      <div>
        <Button onClick={handleNextPdf}>Next</Button>
        <Button onClick={handlePrevPdf}>Prev</Button>
      </div>
      <iframe
        src={`https://docs.google.com/gview?url=${urls[0]}&embedded=true`}
        className="w-full h-full"
      ></iframe>
    </div>
  );
};

export default PDFViewer;
