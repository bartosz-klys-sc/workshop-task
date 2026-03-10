import React, { useMemo, useState } from "react";
import { PDFViewer } from "@react-pdf/renderer";
import EditorSidebar from "./EditorSidebar.jsx";
import PdfDocument from "./PdfDocument.jsx";
import { generateChartUrl } from "./ChartHelper.js";

const initialData = {
  language: "de",
  brand: "Scalable",
  reportType: "Weltportfolios Klassisch",
  quarter: "Q4",
  year: "2025",
  sections: {
    inKuerze: "2025 war ein starkes Aktienjahr...",
    ausblick: "Eine neue Ära mit massiven staatlichen Eingriffen...",
  },
  assetPerformance: [
    { name: "Gold", value: 45.3 },
    { name: "Aktien Europa", value: 20.2 },
    { name: "Aktien USA", value: 3.8 },
  ],
  portfolioPerformance: [
    { portfolio: "Weltportfolio Klassisch 40", ytd: 6.7 },
    { portfolio: "Weltportfolio Klassisch 60", ytd: 8.2 },
  ],
};

export default function App() {
  const [formData, setFormData] = useState(initialData);

  const chartUrl = useMemo(
    () => generateChartUrl(formData.assetPerformance, formData.brand),
    [formData.assetPerformance, formData.brand]
  );

  return (
    <div className="flex h-screen w-screen overflow-hidden max-[1024px]:flex-col">
      <div className="w-[40%] min-w-[360px] overflow-y-auto border-r border-black/5 bg-white px-9 py-8 max-[1024px]:h-1/2 max-[1024px]:w-full max-[1024px]:min-w-0 max-[1024px]:border-r-0 max-[1024px]:border-b max-[1024px]:px-6">
        <EditorSidebar formData={formData} setFormData={setFormData} />
      </div>
      <div className="w-[60%] bg-[radial-gradient(circle_at_top,_#fff5eb_0%,_#f7f5f2_60%)] p-4 max-[1024px]:h-1/2 max-[1024px]:w-full">
        <div className="h-full w-full overflow-hidden rounded-md shadow-card">
          <PDFViewer width="100%" height="100%" showToolbar={true} className="h-full w-full">
          <PdfDocument formData={formData} chartUrl={chartUrl} />
          </PDFViewer>
        </div>
      </div>
    </div>
  );
}
