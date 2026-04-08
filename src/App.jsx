import React, { useEffect, useMemo, useRef, useState } from "react";
import { PDFViewer } from "@react-pdf/renderer";
import EditorSidebar from "./EditorSidebar.jsx";
import MarketChartGraphic from "./MarketChartGraphic.jsx";
import PdfDocument from "./PdfDocument.jsx";
import { marketChartData } from "./marketChartData.js";

const initialMarketChartData = marketChartData.map((row) => ({
  label: row.label,
  value: String(row.value),
}));

const initialMarketChartCsv = [
  "label,value",
  ...initialMarketChartData.map((row) => `${row.label},${row.value}`),
].join("\n");

const initialMarketAnalysisSections = [
  {
    title: "Aktien",
    content:
      "- 2025 war im historischen Vergleich ein **starkes Jahr für Aktien**: Europäische Titel legten um +20,2 % zu, Schwellenländeraktien um +16 %, die Kurse chinesischer Papiere (A-Aktien) stiegen um +14 %. Das Plus von +3,8 % bei US-Aktien sieht im Vergleich bescheiden aus. Tatsächlich lagen sie so deutlich wie seit 15 Jahren nicht mehr hinter einem globalen Aktienindex ohne US-Titel – etwa dem MSCI ACWI ex USA – zurück. Aus Sicht hiesiger Anlegender spielt ein weiterer Faktor eine gewichtige Rolle: der **Wertverlust des US-Dollar gegenüber dem Euro von -11,9 %**. Dadurch fällt die Rendite für in Euro geführte Depots geringer aus. In ihrer Heimatwährung legten US-Aktien um +17,8 % zu.",
    useSubheading: false,
  },
];

const initialWertentwicklungChartData = marketChartData.map((row) => ({
  label: row.label,
  value: String(row.value),
}));

const initialWertentwicklungChartCsv = [
  "label,value",
  ...initialWertentwicklungChartData.map((row) => `${row.label},${row.value}`),
].join("\n");

const initialData = {
  language: "de",
  brand: "Scalable",
  reportType: "Portfolio Report",
  reportDate: "31.12.2025",
  quarter: "Q4",
  year: "2025",
  coverPage: {
    metadataText: "QUARTERLY REPORT",
    mainTitle: "Weltportfolio",
    subtitle: "Jahresrückblick 2025",
    heroImageUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80",
  },
  sections: {
    inKuerze: "2025 war ein starkes Aktienjahr...",
    ausblick: "Eine neue Ära mit massiven staatlichen Eingriffen...",
  },
  secondPage: {
    title: "In Kürze",
    summary:
      "Erfahren Sie die wichtigsten Hintergründe zur Wertentwicklung Ihrer Anlagestrategie im Gesamtjahr 2025. Erhalten Sie zudem einen Überblick über die wichtigsten Marktereignisse und unser Portfolio-Management in den vergangenen drei Monaten.",
    sections: [
      {
        title: "Märkte",
        content:
          "**2025 war ein starkes Aktienjahr** - mit zweistelligen Zuwächsen an den wichtigsten Märkten...",
      },
      {
        title: "Wertentwicklung",
        content:
          "Weltportfolios Klassisch legten je nach Risikokategorie um +5,8 % (Klassisch 30) bis +9,5 % (Klassisch 100) zu. Weltportfolios Klassisch + Gold legten um +9,8 % (Klassisch + Gold 30) bis +12 % (Klassisch + Gold 90) zu.",
      },
      {
        title: "Portfolio-Management im 4. Quartal",
        content:
          "Vor dem Jahreswechsel setzten wir für Kundinnen und Kunden mit noch nicht ausgeschöpftem Freistellungsauftrag die Steueroptimierung um...",
      },
      {
        title: "Ausblick",
        content:
          "Eine neue Ära mit massiven staatlichen Eingriffen in die Wirtschaft hat begonnen...",
      },
    ],
  },
  portfolioPerformance: [
    { portfolio: "Weltportfolio Klassisch 40", ytd: 6.7 },
    { portfolio: "Weltportfolio Klassisch 60", ytd: 8.2 },
  ],
  marketPage: {
    title: "Markt",
    subtitle: "Wertentwicklung unterschiedlicher Anlageklassen 2025",
    chartData: initialMarketChartData,
    chartDataCsv: initialMarketChartCsv,
    footnote:
      "Angaben in Euro vor Kosten. Anleihen in Fremdwährung sind währungsbesichert.",
    analysisSections: initialMarketAnalysisSections,
  },
  wertentwicklungPage: {
    title: "Wertentwicklung",
    subtitle: "Wertentwicklung unterschiedlicher Anlageklassen 2025",
    subtitleAfterFootnote: "",
    chartData: initialWertentwicklungChartData,
    chartDataCsv: initialWertentwicklungChartCsv,
    footnote:
      "Angaben in Euro vor Kosten. Anleihen in Fremdwährung sind währungsbesichert.",
    analysisSections: initialMarketAnalysisSections,
  },
  page7: {
    title: "Seite 7",
    body: "",
  },
  page8: {
    title: "Seite 8",
    body: "",
    secondaryTitle: "",
    secondaryBody: "",
  },
};

const STORAGE_KEY = "pdf-generator:formData";

const mergeWithDefaults = (stored) => {
  if (!stored || typeof stored !== "object") return initialData;
  const mapSections = (sections = []) =>
    sections.map((section) => ({
      useSubheading: false,
      ...section,
    }));
  return {
    ...initialData,
    ...stored,
    sections: { ...initialData.sections, ...(stored.sections || {}) },
    secondPage: { ...initialData.secondPage, ...(stored.secondPage || {}) },
    marketPage: {
      ...initialData.marketPage,
      ...(stored.marketPage || {}),
      analysisSections: mapSections(
        stored.marketPage?.analysisSections || initialData.marketPage.analysisSections
      ),
    },
    wertentwicklungPage: {
      ...initialData.wertentwicklungPage,
      ...(stored.wertentwicklungPage || {}),
      analysisSections: mapSections(
        stored.wertentwicklungPage?.analysisSections ||
          initialData.wertentwicklungPage.analysisSections
      ),
    },
    coverPage: { ...initialData.coverPage, ...(stored.coverPage || {}) },
    page7: { ...initialData.page7, ...(stored.page7 || {}) },
    page8: { ...initialData.page8, ...(stored.page8 || {}) },
    portfolioPerformance:
      stored.portfolioPerformance ?? initialData.portfolioPerformance,
  };
};

const loadInitialData = () => {
  if (typeof window === "undefined") return initialData;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialData;
    const parsed = JSON.parse(raw);
    return mergeWithDefaults(parsed);
  } catch (error) {
    console.warn("Failed to load saved form data", error);
    return initialData;
  }
};

const parseMarketChartValue = (value) => {
  const normalized = String(value ?? "")
    .trim()
    .replace(",", ".")
    .replace(/[^0-9.-]/g, "");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
};

const buildMarketChartRows = (rows = []) =>
  rows
    .map((row) => ({
      label: String(row?.label ?? "").trim(),
      value: parseMarketChartValue(row?.value),
    }))
    .filter((row) => row.label.length > 0 && row.value !== null);

const waitForPaint = () =>
  new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(resolve));
  });

async function captureSvgAsPng(svgElement, scale = 3) {
  const serializer = new XMLSerializer();
  let svgMarkup = serializer.serializeToString(svgElement);

  if (!svgMarkup.includes('xmlns="http://www.w3.org/2000/svg"')) {
    svgMarkup = svgMarkup.replace(
      "<svg",
      '<svg xmlns="http://www.w3.org/2000/svg"'
    );
  }
  if (!svgMarkup.includes('xmlns:xlink="http://www.w3.org/1999/xlink"')) {
    svgMarkup = svgMarkup.replace(
      "<svg",
      '<svg xmlns:xlink="http://www.w3.org/1999/xlink"'
    );
  }

  const sourceWidth =
    Number(svgElement.getAttribute("width")) ||
    svgElement.viewBox?.baseVal?.width ||
    531;
  const sourceHeight =
    Number(svgElement.getAttribute("height")) ||
    svgElement.viewBox?.baseVal?.height ||
    300;

  const svgBlob = new Blob([svgMarkup], {
    type: "image/svg+xml;charset=utf-8",
  });
  const objectUrl = URL.createObjectURL(svgBlob);

  try {
    const image = await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = objectUrl;
    });

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(sourceWidth * scale);
    canvas.height = Math.round(sourceHeight * scale);
    const context = canvas.getContext("2d");
    if (!context) return null;

    context.scale(scale, scale);
    context.drawImage(image, 0, 0, sourceWidth, sourceHeight);

    return canvas.toDataURL("image/png", 1);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export default function App() {
  const [formData, setFormData] = useState(loadInitialData);
  const [generatedData, setGeneratedData] = useState(loadInitialData);
  const [generatedMarketChartImage, setGeneratedMarketChartImage] = useState(null);
  const [generatedWertentwicklungChartImage, setGeneratedWertentwicklungChartImage] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [chartCaptureRows, setChartCaptureRows] = useState(() =>
    buildMarketChartRows(loadInitialData().marketPage?.chartData || [])
  );
  const chartCaptureRootRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    } catch (error) {
      console.warn("Failed to save form data", error);
    }
  }, [formData]);

  const generatedMarketChartRows = useMemo(
    () => buildMarketChartRows(generatedData.marketPage?.chartData || []),
    [generatedData]
  );
  const generatedWertentwicklungChartRows = useMemo(
    () => buildMarketChartRows(generatedData.wertentwicklungPage?.chartData || []),
    [generatedData]
  );

  const isDirty = useMemo(
    () => JSON.stringify(formData) !== JSON.stringify(generatedData),
    [formData, generatedData]
  );

  const captureMarketChartImage = async (rows) => {
    if (rows.length === 0) return null;
    setChartCaptureRows(rows);

    for (let attempt = 0; attempt < 3; attempt += 1) {
      await waitForPaint();
      const svgElement = chartCaptureRootRef.current?.querySelector("svg");
      if (svgElement) {
        return captureSvgAsPng(svgElement, 3);
      }
    }
    return null;
  };

  useEffect(() => {
    let isCancelled = false;
    const seedInitialChartImage = async () => {
      try {
        const marketImage = await captureMarketChartImage(generatedMarketChartRows);
        const wertImage = await captureMarketChartImage(generatedWertentwicklungChartRows);
        if (!isCancelled) {
          if (marketImage) setGeneratedMarketChartImage(marketImage);
          if (wertImage) setGeneratedWertentwicklungChartImage(wertImage);
        }
      } catch (error) {
        console.error("Failed to seed initial market chart image", error);
      }
    };

    void seedInitialChartImage();
    return () => {
      isCancelled = true;
    };
  }, [generatedMarketChartRows, generatedWertentwicklungChartRows]);

  const handleGenerate = async () => {
    if (isGenerating) return;
    setIsGenerating(true);

    const nextGeneratedData = JSON.parse(JSON.stringify(formData));
    const nextChartRows = buildMarketChartRows(
      nextGeneratedData.marketPage?.chartData || []
    );
    const nextWertChartRows = buildMarketChartRows(
      nextGeneratedData.wertentwicklungPage?.chartData || []
    );

    let chartImage = null;
    let wertChartImage = null;
    try {
      chartImage = await captureMarketChartImage(nextChartRows);
      wertChartImage = await captureMarketChartImage(nextWertChartRows);
    } catch (error) {
      console.error("Failed to capture market chart image", error);
    } finally {
      setGeneratedMarketChartImage((previousImage) => {
        if (nextChartRows.length === 0) return null;
        return chartImage || previousImage;
      });
      setGeneratedWertentwicklungChartImage((previousImage) => {
        if (nextWertChartRows.length === 0) return null;
        return wertChartImage || previousImage;
      });
      setGeneratedData(nextGeneratedData);
      setIsGenerating(false);
    }
  };

  const pdfDocument = useMemo(
    () => (
      <PdfDocument
        formData={generatedData}
        marketChartImageSrc={generatedMarketChartImage}
        wertentwicklungChartImageSrc={generatedWertentwicklungChartImage}
      />
    ),
    [generatedData, generatedMarketChartImage]
  );

  return (
    <div className="flex h-screen w-screen overflow-hidden max-[1024px]:flex-col">
      <div className="w-[40%] min-w-[360px] overflow-y-auto border-r border-black/5 bg-white px-9 py-8 max-[1024px]:h-1/2 max-[1024px]:w-full max-[1024px]:min-w-0 max-[1024px]:border-r-0 max-[1024px]:border-b max-[1024px]:px-6">
        <EditorSidebar
          formData={formData}
          setFormData={setFormData}
          onGenerate={handleGenerate}
          isDirty={isDirty}
          isGenerating={isGenerating}
        />
      </div>
      <div className="w-[60%] bg-[radial-gradient(circle_at_top,_#fff5eb_0%,_#f7f5f2_60%)] p-4 max-[1024px]:h-1/2 max-[1024px]:w-full">
        <div className="h-full w-full overflow-hidden rounded-md shadow-card">
          <PDFViewer width="100%" height="100%" showToolbar={true} className="h-full w-full">
            {pdfDocument}
          </PDFViewer>
        </div>
      </div>
      <div
        ref={chartCaptureRootRef}
        aria-hidden="true"
        style={{
          position: "fixed",
          left: -10000,
          top: -10000,
          opacity: 0,
          pointerEvents: "none",
        }}
      >
        <MarketChartGraphic
          data={chartCaptureRows}
          width={531}
          height={300}
          yTickCount={5}
        />
      </div>
    </div>
  );
}
