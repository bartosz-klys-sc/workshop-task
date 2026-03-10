import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  Image,
  Svg,
  Path,
  G,
  Circle,
  Defs,
  LinearGradient,
  Stop,
  Rect,
  StyleSheet,
} from "@react-pdf/renderer";

const dictionary = {
  de: {
    page: "Seite",
    summary: "In Kürze",
    outlook: "Ausblick",
    performance: "Performance",
    portfolio: "Portfolio",
    ytd: "YTD",
    legal: "Wichtige Hinweise",
    legalBody:
      "Die enthaltenen Informationen dienen ausschließlich der allgemeinen Information und stellen keine Anlageberatung dar.",
  },
  en: {
    page: "Page",
    summary: "Summary",
    outlook: "Outlook",
    performance: "Performance",
    portfolio: "Portfolio",
    ytd: "YTD",
    legal: "Legal Notice",
    legalBody:
      "The information provided is for general information only and does not constitute investment advice.",
  },
};

const defaultMarketPage = {
  title: "Markt",
  subtitle: "Wertentwicklung unterschiedlicher Anlageklassen 2025",
  chartData: [
    { label: "Gold", value: "45%" },
    { label: "Europa", value: "10%" },
  ],
  footnote:
    "Angaben in Euro vor Kosten. Anleihen in Fremdwährung sind währungsbesichert.",
  analysisTitle: "Aktien",
  analysisBody:
    "- 2025 war im historischen Vergleich ein **starkes Jahr für Aktien**: Europäische Titel legten um +20,2 % zu, Schwellenländeraktien um +16 %, die Kurse chinesischer Papiere (A-Aktien) stiegen um +14 %. Das Plus von +3,8 % bei US-Aktien sieht im Vergleich bescheiden aus. Tatsächlich lagen sie so deutlich wie seit 15 Jahren nicht mehr hinter einem globalen Aktienindex ohne US-Titel – etwa dem MSCI ACWI ex USA – zurück. Aus Sicht hiesiger Anlegender spielt ein weiterer Faktor eine gewichtige Rolle: der **Wertverlust des US-Dollar gegenüber dem Euro von -11,9 %**. Dadurch fällt die Rendite für in Euro geführte Depots geringer aus. In ihrer Heimatwährung legten US-Aktien um +17,8 % zu.\n- Zweimal gaben die Kurse im Verlauf des Jahres deutlich nach: Am stärksten brachen sie Anfang April ein, als US-Präsident Donald Trump umfassende Zölle ankündigte. US-Aktien beispielsweise verloren in diesem Zeitraum gegenüber ihrem Hoch im März um bis zu -22,4 % (Maximum Drawdown). Im vierten Quartal gab es eine weitere Phase der Nervosität, als **Warnungen vor einer KI-Blase** an den Aktienmärkten immer lauter wurden. Erneut sanken die Kurse etwa von US-Titeln, allerdings weniger als rund um den sogenannten „Liberation Day“. Zum Jahresende hin hellte sich die Stimmung wieder auf. Der amerikanische Aktienmarkt (S&P 500) verzeichnete um Weihnachten sogar ein **neues Allzeithoch**.\n- Die Erwartungen an Entwicklungen und Einsatz von **künstlicher Intelligenz waren der bestimmende Faktor** für die Bewegungen an den Aktienmärkten. Der führende Chiphersteller Nvidia beispielsweise, die am höchsten gewichtete Aktie im US-Index S&P 500, legte 2025 um +22,5 % (in US-Dollar: +38,9 %) zu. Der Titel war damit allein für 1,7 Prozentpunkte der Rendite von insgesamt +3,8 % bei US-Aktien verantwortlich. Zerlegt man den weltweiten Aktienmarkt in Sektoren, lagen Technologiewerte – wie Nvidia – allerdings nicht an der Spitze. Am stärksten entwickelten sich die Kurse im **Sektor Kommunikation**. Diesen dominiert die Aktie von Alphabet (Kursentwicklung 2025: +46,4 % in Euro, +66 % in US-Dollar). Das Unternehmen spielt neben seinen Geschäften rund um die Google-Suche und Cloud-Dienste über sein Sprachmodell Gemini ebenfalls im KI-Wettlauf mit. Das Beispiel zeigt, dass künstliche Intelligenz über den IT-Sektor im engeren Sinne hinaus eine gewichtige Rolle spielt.",
};

export default function PdfDocument({ formData }) {
  const t = dictionary[formData.language] || dictionary.de;
  const brandColor = formData.brand === "ING" ? "#FF6200" : "#FF7A00";
  const title = formData.brand === "ING" ? "Smart Invest" : formData.reportType;
  const showAmbassador = formData.brand === "Scalable";
  const metaDate = formData.reportDate?.trim() || `${formData.quarter} ${formData.year}`;
  const marketPage = { ...defaultMarketPage, ...(formData.marketPage || {}) };
  const secondPage = {
    summary: "",
    sections: [],
    ...(formData.secondPage || {}),
  };
  const parseMarketChartValue = (value) => {
    const normalized = String(value ?? "")
      .trim()
      .replace(",", ".")
      .replace(/[^0-9.-]/g, "");
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  };
  const marketChartRows = (marketPage.chartData || [])
    .map((row) => ({
      label: String(row?.label ?? "").trim(),
      value: parseMarketChartValue(row?.value),
      displayValue: String(row?.value ?? "").trim(),
    }))
    .filter((row) => row.label.length > 0 && row.value !== null);
  const marketChartMaxValue = marketChartRows.reduce(
    (acc, row) => Math.max(acc, row.value),
    0
  );

  const renderInline = (text, variant = "default") => {
    const isMarket = variant === "market";
    const isSecond = variant === "second";
    const isSecondSummary = variant === "secondSummary";
    const parts = [];
    let buffer = "";
    let mode = "normal";

    const flush = () => {
      if (buffer.length === 0) return;
      parts.push({ text: buffer, mode });
      buffer = "";
    };

    for (let i = 0; i < text.length; i += 1) {
      const char = text[i];
      const next = text[i + 1];
      if (char === "*" && next === "*") {
        flush();
        mode = mode === "bold" ? "normal" : "bold";
        i += 1;
        continue;
      }
      if (char === "*" && next !== "*") {
        flush();
        mode = mode === "italic" ? "normal" : "italic";
        continue;
      }
      buffer += char;
    }
    flush();

    const baseStyle = isMarket
      ? styles.marketBodyText
      : isSecond
      ? styles.secondPageBody
      : isSecondSummary
      ? styles.secondPageSummaryText
      : styles.bodyText;

    return parts.map((part, idx) => (
      <Text
        key={`inline-${idx}`}
        style={[
          baseStyle,
          part.mode === "bold" && styles.boldText,
          part.mode === "italic" && styles.italicText,
        ]}
      >
        {part.text}
      </Text>
    ));
  };

  const renderRichText = (value, variant = "default") => {
    const isMarket = variant === "market";

    return value.split("\n").map((line, idx) => {
      if (line.startsWith("## ")) {
        return (
          <Text style={isMarket ? styles.marketHeadingText : styles.headingText} key={`line-${idx}`}>
            {line.replace("## ", "")}
          </Text>
        );
      }
      if (line.startsWith("- ")) {
        return (
          <View style={styles.bulletRow} key={`line-${idx}`}>
            <Text style={isMarket ? styles.marketBulletMarker : styles.bulletMarker}>•</Text>
            <Text style={isMarket ? styles.marketBulletText : styles.bulletText}>
              {renderInline(line.replace("- ", ""), variant)}
            </Text>
          </View>
        );
      }
      if (line.trim().length === 0) {
        return <Text style={styles.bodySpacer} key={`line-${idx}`}> </Text>;
      }
      return (
        <Text style={isMarket ? styles.marketBodyText : styles.bodyText} key={`line-${idx}`}>
          {renderInline(line, variant)}
        </Text>
      );
    });
  };

  const renderSecondPageSummary = (value) =>
    value.split("\n").map((line, idx) => {
      if (line.trim().length === 0) {
        return <Text style={styles.secondPageSpacer} key={`second-summary-${idx}`}> </Text>;
      }
      return (
        <Text style={styles.secondPageSummaryText} key={`second-summary-${idx}`}>
          {renderInline(line, "secondSummary")}
        </Text>
      );
    });

  const renderSecondPageContent = (value) =>
    value.split("\n").map((line, idx) => {
      if (line.trim().length === 0) {
        return <Text style={styles.secondPageSpacer} key={`second-line-${idx}`}> </Text>;
      }
      return (
        <Text style={styles.secondPageBody} key={`second-line-${idx}`}>
          {renderInline(line, "second")}
        </Text>
      );
    });

  const splitSections = (sections) => {
    const mid = Math.ceil(sections.length / 2);
    return [sections.slice(0, mid), sections.slice(mid)];
  };

  const [leftSections, rightSections] = splitSections(secondPage.sections || []);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={[styles.brand, { color: brandColor }]}>
            {formData.brand}
          </Text>
          <Text style={styles.meta}>
            {metaDate}
          </Text>
        </View>
        <Text style={[styles.title, { color: brandColor }]}>{title}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t.summary}</Text>
          <View style={styles.richBlock}>
            {renderRichText(formData.sections.inKuerze)}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t.outlook}</Text>
          <View style={styles.richBlock}>
            {renderRichText(formData.sections.ausblick)}
          </View>
        </View>

        <Text style={styles.pageNumber}>
          {t.page} 1 / 4
        </Text>
      </Page>

      <Page size="A4" style={styles.secondPage}>
        <Svg
          fixed
          viewBox="0 0 595 842"
          preserveAspectRatio="none"
          style={styles.secondPageGradient}
        >
          <Defs>
            <LinearGradient id="secondGradient" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#cae3e3" />
              <Stop offset="100%" stopColor="#f0fbfb" />
            </LinearGradient>
          </Defs>
          <Rect x="0" y="0" width="595" height="842" fill="url(#secondGradient)" />
        </Svg>
        <View style={styles.secondPageContent}>
          <View style={styles.secondPageLogo}>
            <Svg viewBox="0 0 1360 640" style={styles.logoSvg}>
              <G>
                <Path
                  fill="#111111"
                  d="M745.98 420.2c-3.55 2.09-7.08 3.13-10.97 3.13-8.27 0-12.3-4.42-12.3-15v-67.01l24.72-3.02v-8.79l-24.72 3.02v-20.54l-30.95 3.9v20.45l-11.83 1.46v4.62h4.92c3.81 0 6.89 3.07 6.91 6.88v59.8c0 22.11 11.92 30.57 28.45 30.57 13.57 0 22.73-7.57 26.87-14.81l-1.1-4.66Z"
                />
                <Path
                  fill="#111111"
                  d="M839.1 416.6c0 5.57.96 9.61 5.77 9.61 2.88 0 5.38-.77 7.11-1.54l1.15 4.62c-5.77 6.54-13.46 10.38-23.46 10.38-10.77 0-18.07-6.15-20.57-16.53-5.96 8.07-15.57 16.15-29.42 16.15-15.96 0-26.72-9.42-26.72-25.38 0-16.73 11.73-23.46 25.76-28.65l29.8-10.57v-17.88c0-10-3.08-16.92-11.92-16.92-8.27 0-11.73 6.54-11.73 15.77 0 10.96-8.14 17.78-16.73 15-5.38-1.74-9.04-6.15-9.04-12.69 0-16.73 17.3-24.8 39.61-24.8 25.57 0 40.38 8.65 40.38 32.49v50.95ZM808.53 417.95v-35.76l-13.65 5.38c-7.5 3.08-12.3 6.92-12.3 17.88 0 10 4.23 17.11 14.23 17.11 4.42 0 7.5-1.73 11.73-4.61Z"
                />
                <Path
                  fill="#111111"
                  d="M449.27 277.73c0 5.57.96 9.61 5.77 9.61 2.88 0 5.38-.77 7.11-1.54l1.15 4.62c-5.77 6.54-13.46 10.38-23.46 10.38-10.77 0-18.07-6.15-20.57-16.53-5.96 8.07-15.57 16.15-29.42 16.15-15.96 0-26.72-9.42-26.72-25.38 0-16.73 11.73-23.46 25.76-28.65l29.8-10.57v-17.88c0-10-3.08-16.92-11.92-16.92-8.27 0-11.73 6.54-11.73 15.77 0 10.96-8.14 17.78-16.73 15-5.38-1.74-9.04-6.15-9.04-12.69 0-16.73 17.3-24.8 39.61-24.8 25.57 0 40.38 8.65 40.38 32.49v50.95ZM418.7 279.07v-35.76l-13.65 5.38c-7.5 3.08-12.3 6.92-12.3 17.88 0 10 4.23 17.11 14.23 17.11 4.42 0 7.5-1.73 11.73-4.61Z"
                />
                <Path
                  fill="#111111"
                  d="M491.89 416.6c0 5.57.96 9.61 5.77 9.61 2.88 0 5.38-.77 7.11-1.54l1.15 4.62c-5.77 6.54-13.46 10.38-23.46 10.38-10.77 0-18.07-6.15-20.57-16.53-5.96 8.07-15.57 16.15-29.42 16.15-15.96 0-26.72-9.42-26.72-25.38 0-16.73 11.73-23.46 25.76-28.65l29.8-10.57v-17.88c0-10-3.08-16.92-11.92-16.92-8.27 0-11.73 6.54-11.73 15.77 0 10.96-8.14 17.78-16.73 15-5.38-1.74-9.04-6.15-9.04-12.69 0-16.73 17.3-24.8 39.61-24.8 25.57 0 40.38 8.65 40.38 32.49v50.95ZM461.32 417.95v-35.76l-13.65 5.38c-7.5 3.08-12.3 6.92-12.3 17.88 0 10 4.23 17.11 14.23 17.11 4.42 0 7.5-1.73 11.73-4.61Z"
                />
                <Path
                  fill="#111111"
                  d="M612.87 277.73c0 5.57.96 9.61 5.77 9.61 2.88 0 5.38-.77 7.11-1.54l1.15 4.62c-5.77 6.54-13.46 10.38-23.46 10.38-10.77 0-18.07-6.15-20.57-16.53-5.96 8.07-15.57 16.15-29.42 16.15-15.96 0-26.72-9.42-26.72-25.38 0-16.73 11.73-23.46 25.76-28.65l29.8-10.57v-17.88c0-10-3.08-16.92-11.92-16.92-8.27 0-11.73 6.54-11.73 15.77 0 10.96-8.14 17.78-16.73 15-5.38-1.74-9.04-6.15-9.04-12.69 0-16.73 17.3-24.8 39.61-24.8 25.57 0 40.38 8.65 40.38 32.49v50.95ZM582.3 279.07v-35.76l-13.65 5.38c-7.5 3.08-12.3 6.92-12.3 17.88 0 10 4.23 17.11 14.23 17.11 4.42 0 7.5-1.73 11.73-4.61Z"
                />
                <Path
                  fill="#111111"
                  d="M895.37 235.43v4.42H833.27c-.58 25.19 12.69 40.19 30.76 40.19 12.88 0 21.73-5 28.84-14.8l3.27 1.92c-5 20.19-19.42 33.65-42.68 33.65-28.07 0-48.07-19.8-48.07-50.76 0-33.65 22.3-55.76 49.41-55.76 26.73 0 40.57 17.3 40.57 41.14ZM833.65 231.97h34.61c0-18.27-4.23-30.19-15.57-30.19-11.73 0-17.88 12.5-19.03 30.19Z"
                />
                <Circle fill="#111111" cx="653.04" cy="316.99" r="15.68" />
                <Path
                  fill="#111111"
                  d="M674.32 432.05c-3.31-.58-5.72-3.46-5.72-6.81l-.02-86.04-43.08 5.29v4.62h4.92c3.82 0 6.92 3.1 6.92 6.91v69.22c0 3.36-2.41 6.23-5.72 6.81l-6.12 1.08v4.62h54.93v-4.62l-6.12-1.08Z"
                />
                <Path
                  fill="#111111"
                  d="M700.53 194.28c-15.47 0-25.93 8.88-31.94 17.75l-.01-52.04-43.08 5.29v4.62h4.92c3.82 0 6.92 5.4 6.92 9.22l.01 117.94c4.33-3.47 9.79-5.42 15.69-5.42 13.63 0 18.71 9.13 34.6 9.13 29.56 0 51.54-21.15 51.54-59.6 0-30.38-15.57-46.91-38.64-46.91ZM684 292.72c-9.42 0-15.41-6.82-15.41-15.26v-59.98c3.98-2.92 9.02-4.75 14.06-4.75 16.34 0 25.19 14.04 25.19 38.45 0 23.27-8.65 41.53-23.84 41.53Z"
                />
                <Path
                  fill="#111111"
                  d="M793.63 293.17c-3.31-.58-5.72-3.46-5.72-6.81l-.02-126.36-43.08 5.29v4.62h4.92c3.82 0 6.92 3.1 6.92 6.92l.01 109.53c0 3.36-2.41 6.23-5.72 6.81l-6.12 1.08v4.62h54.93v-4.62l-6.12-1.08Z"
                />
                <Path
                  fill="#111111"
                  d="M904.25 432.05c-3.31-.58-5.72-3.46-5.72-6.81l-.02-114.28-43.08 5.29v4.62h4.92c3.82 0 6.92 3.1 6.92 6.92v97.45c0 3.36-2.41 6.23-5.72 6.81l-6.12 1.08v4.62h54.93v-4.62l-6.12-1.08Z"
                />
                <Path
                  fill="#111111"
                  d="M514.44 293.17c-3.31-.58-5.72-3.46-5.72-6.81l-.02-126.36-43.08 5.29v4.62h4.92c3.82 0 6.92 3.1 6.92 6.92l.01 109.53c0 3.36-2.41 6.23-5.72 6.81l-6.12 1.08v4.62h54.93v-4.62l-6.12-1.08Z"
                />
                <Path
                  fill="#111111"
                  d="M579.53 333.16c-15.76 0-26.33 9.22-32.29 18.25v-19.41l-43.08 5.29v4.62h4.92c3.82 0 6.92 3.1 6.92 6.92v118.65c0 3.36-2.41 6.23-5.72 6.81l-6.12 1.08v4.62h54.93v-4.62l-6.12-1.08c-3.31-.58-5.72-3.46-5.72-6.81l-.02-32.42c3.85 3.07 10.57 4.61 18.06 4.61 29.61 0 52.87-21.15 52.87-59.6 0-30.38-15.57-46.91-38.64-46.91ZM562.99 431.6c-11.04 0-15.66-7.54-15.76-20.93v-54.06c4.04-3.07 9.22-4.99 14.41-4.99 16.34 0 25.19 14.04 25.19 38.45 0 23.27-8.65 41.53-23.84 41.53Z"
                />
                <Path
                  fill="#111111"
                  d="M161.73 288.11l-1.73-33.26h9.04c4.61 22.3 17.11 37.49 36.72 37.49 14.61 0 24.03-7.5 24.03-20.18 0-13.27-8.27-19.03-30.57-26.53-24.03-7.69-38.26-19.03-38.26-42.11 0-24.99 19.03-41.53 46.53-41.53 16.92 0 31.34 4.42 40.95 11.34v29.03h-8.08c-4.04-19.99-14.61-31.91-32.88-31.91-12.69 0-20.96 7.5-20.96 19.03 0 13.07 7.69 18.27 27.88 25.19 25.76 8.65 41.91 18.65 41.91 44.22 0 28.26-22.88 41.91-50.57 41.91-18.84 0-35.18-5.58-44.03-12.69Z"
                />
                <Path
                  fill="#111111"
                  d="M324.18 279.46c11.54 0 20-4.42 26.15-13.46l3.85 2.12c-6.15 22.11-20.96 32.68-41.53 32.68-26.34 0-45.95-19.22-45.95-49.99 0-32.3 20-56.52 51.14-56.52 19.03 0 33.45 7.5 33.45 23.26 0 6.73-3.7 11.44-7.88 13.46-7.37 3.56-15.57-1.03-15.57-10.19 0-10.57-3.27-18.65-13.27-18.65-13.26 0-21.15 15.96-21.15 36.53 0 24.8 11.34 40.76 30.76 40.76Z"
                />
                <Path
                  fill="#111111"
                  d="M390.72 315.71l.37 31.23h-8.04c-3.47-20.66-15.76-33.66-30.97-33.66-23.2 0-35.04 25.24-35.04 57.03 0 34.4 13.94 60.39 36.72 60.39 15.38 0 27.56-12.96 33.59-38.89h8.6l-2.99 36.09c-11.03 7.48-25.1 11.78-43.05 11.78-39 0-66.53-25.05-66.53-64.13 0-43.57 33.12-70.86 67.28-70.86 16.83 0 29.4 3.92 40.06 11.03Z"
                />
                <Path
                  fill="#111111"
                  d="M956.54 254.54v.01c0 15.98 6.35 31.31 17.65 42.61l79.74 79.74c34.89 34.89 44.67 47.56 48.69 60.87h37.13c33.28 0 60.25-26.98 60.25-60.25v-.01c0-15.98-6.35-31.31-17.65-42.61l-79.74-79.74c-34.89-34.89-44.67-47.56-48.69-60.87h-37.13c-33.28 0-60.25 26.98-60.25 60.25Z"
                />
                <Path
                  fill="#111111"
                  d="M1114.79 194.28c4.03 13.3 13.81 25.98 48.69 60.87l36.52 36.52v-73.04c0-13.45-10.9-24.35-24.35-24.35h-60.86Z"
                />
                <Path
                  fill="#111111"
                  d="M1041.75 437.75c-4.03-13.3-13.81-25.98-48.69-60.87l-36.52-36.52v73.04c0 13.45 10.9 24.35 24.35 24.35h60.86Z"
                />
              </G>
            </Svg>
          </View>

          <View style={styles.secondPageSummary}>
            {renderSecondPageSummary(secondPage.summary || "")}
          </View>

          <View style={styles.secondPageColumns}>
            <View style={styles.secondPageColumn}>
              <Text style={styles.secondPageSectionLabel}>{t.summary}</Text>
              {leftSections.map((section, index) => (
                <View style={styles.secondPageSection} key={`second-left-${index}`}>
                  <Text style={styles.secondPageSectionTitle}>{section.title}</Text>
                  {renderSecondPageContent(section.content || "")}
                </View>
              ))}
            </View>
            <View style={[styles.secondPageColumn, styles.secondPageColumnOffset]}>
              {rightSections.map((section, index) => (
                <View style={styles.secondPageSection} key={`second-right-${index}`}>
                  <Text style={styles.secondPageSectionTitle}>{section.title}</Text>
                  {renderSecondPageContent(section.content || "")}
                </View>
              ))}
            </View>
          </View>
        </View>

        <Text style={styles.pageNumberDark}>
          {t.page} 2 / 4
        </Text>
      </Page>

      <Page size="A4" style={styles.page}>
        <Text style={[styles.title, { color: brandColor }]}>{t.performance}</Text>

        <View style={styles.table}>
          <View style={styles.tableRowHeader}>
            <Text style={styles.tableHeaderCell}>{t.portfolio}</Text>
            <Text style={styles.tableHeaderCell}>{t.ytd}</Text>
          </View>
          {formData.portfolioPerformance.map((row, index) => (
            <View style={styles.tableRow} key={`row-${index}`}>
              <Text style={styles.tableCell}>{row.portfolio}</Text>
              <Text style={styles.tableCell}>{row.ytd.toFixed(1)}%</Text>
            </View>
          ))}
        </View>

        {showAmbassador ? (
          <View style={styles.ambassadorBlock}>
            <Image
              style={styles.ambassadorImage}
              src="https://via.placeholder.com/200x260.png?text=Christian"
            />
            <Text style={styles.ambassadorCaption}>Christian</Text>
          </View>
        ) : null}

        <View style={styles.legalBlock}>
          <Text style={styles.legalTitle}>{t.legal}</Text>
          <Text style={styles.legalBody}>{t.legalBody}</Text>
        </View>

        <Text style={styles.footerDisclaimer}>
          {formData.brand === "ING"
            ? "Die Wertentwicklungen finden Sie auf der Rendite-Seite bei der ING."
            : "Die Wertentwicklungen finden Sie auf unserer Rendite-Seite."}
        </Text>

        <Text style={styles.pageNumber}>
          {t.page} 3 / 4
        </Text>
      </Page>

      <Page size="A4" style={[styles.page, styles.marketPage]}>
        <Text style={styles.marketTitle}>{marketPage.title}</Text>
        <Text style={styles.marketSubtitle}>{marketPage.subtitle}</Text>

        {marketChartRows.length > 0 ? (
          <View style={styles.marketChartBlock}>
            {marketChartRows.map((row, index) => {
              const barWidth =
                marketChartMaxValue > 0
                  ? Math.max(4, Math.round((row.value / marketChartMaxValue) * 290))
                  : 4;
              return (
                <View style={styles.marketChartRow} key={`market-chart-${index}`}>
                  <Text style={styles.marketChartLabel}>{row.label}</Text>
                  <View style={styles.marketChartTrack}>
                    <View style={[styles.marketChartBar, { width: barWidth }]} />
                  </View>
                  <Text style={styles.marketChartValue}>
                    {row.displayValue || row.value}
                  </Text>
                </View>
              );
            })}
          </View>
        ) : (
          <Text style={styles.marketChartFallback}>No chart data.</Text>
        )}

        <Text style={styles.marketFootnote}>{marketPage.footnote}</Text>

        <View style={styles.marketAnalysisSection}>
          <Text style={styles.marketSectionLabel}>{marketPage.analysisTitle}</Text>
          <View style={styles.richBlock}>
            {renderRichText(marketPage.analysisBody, "market")}
          </View>
        </View>

        <Text style={[styles.pageNumber, styles.marketPageNumber]}>
          {t.page} 4 / 4
        </Text>
      </Page>
    </Document>
  );
}

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    color: "#111827",
    fontFamily: "Helvetica",
  },
  marketPage: {
    color: "#000000",
  },
  secondPage: {
    position: "relative",
    padding: 0,
    color: "#111111",
    fontFamily: "Helvetica",
  },
  secondPageGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  secondPageContent: {
    position: "relative",
    paddingTop: 52,
    paddingHorizontal: 52,
    paddingBottom: 64,
    height: "100%",
    justifyContent: "flex-end",
  },
  secondPageLogo: {
    position: "absolute",
    top: 38,
    right: 38,
    width: 120,
  },
  logoSvg: {
    width: 120,
    height: 36,
  },
  secondPageSummary: {
    marginBottom: 30,
    maxWidth: 440,
  },
  secondPageSummaryText: {
    fontSize: 16,
    lineHeight: 1.4,
    fontWeight: 500,
  },
  secondPageColumns: {
    flexDirection: "row",
    gap: 26,
  },
  secondPageColumn: {
    flex: 1,
  },
  secondPageColumnOffset: {
    marginTop: 26,
  },
  secondPageSectionLabel: {
    fontSize: 13,
    fontWeight: 700,
    marginBottom: 12,
  },
  secondPageSection: {
    marginBottom: 18,
  },
  secondPageSectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    marginBottom: 6,
  },
  secondPageBody: {
    fontSize: 10,
    lineHeight: 1.45,
    color: "#1a1a1a",
  },
  secondPageSpacer: {
    fontSize: 4,
    marginBottom: 2,
  },
  pageNumberDark: {
    position: "absolute",
    bottom: 18,
    right: 40,
    fontSize: 9,
    color: "#111111",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  brand: {
    fontSize: 18,
    fontWeight: 700,
    letterSpacing: 0.5,
  },
  meta: {
    fontSize: 11,
    color: "#6B7280",
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
    marginTop: 12,
    marginBottom: 18,
  },
  section: {
    marginBottom: 14,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: 700,
    marginBottom: 6,
  },
  bodyText: {
    fontSize: 11,
    lineHeight: 1.4,
    color: "#1F2937",
  },
  boldText: {
    fontWeight: 700,
  },
  italicText: {
    fontStyle: "italic",
  },
  headingText: {
    fontSize: 12,
    fontWeight: 700,
    marginBottom: 4,
    color: "#111827",
  },
  richBlock: {
    gap: 4,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 2,
  },
  bulletMarker: {
    width: 12,
    fontSize: 11,
    color: "#111827",
  },
  bulletText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 1.4,
    color: "#1F2937",
  },
  bodySpacer: {
    fontSize: 6,
    marginBottom: 2,
  },
  marketSubtitle: {
    marginTop: -6,
    marginBottom: 10,
    fontSize: 12,
    color: "#000000",
  },
  marketFootnote: {
    marginTop: 2,
    fontSize: 9,
    color: "#000000",
  },
  marketChartBlock: {
    marginBottom: 10,
    gap: 6,
  },
  marketChartRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  marketChartLabel: {
    width: 170,
    fontSize: 9,
    color: "#000000",
  },
  marketChartTrack: {
    flex: 1,
    height: 9,
    borderRadius: 2,
    backgroundColor: "#E5E7EB",
    overflow: "hidden",
  },
  marketChartBar: {
    height: "100%",
    backgroundColor: "#111111",
  },
  marketChartValue: {
    width: 42,
    fontSize: 9,
    textAlign: "right",
    color: "#000000",
  },
  marketChartFallback: {
    marginBottom: 10,
    fontSize: 9,
    color: "#000000",
  },
  marketTitle: {
    fontSize: 22,
    fontWeight: 700,
    marginTop: 12,
    marginBottom: 18,
    color: "#000000",
  },
  marketSectionLabel: {
    fontSize: 12,
    fontWeight: 700,
    marginBottom: 6,
    color: "#000000",
  },
  marketBodyText: {
    fontSize: 11,
    lineHeight: 1.4,
    color: "#000000",
  },
  marketHeadingText: {
    fontSize: 12,
    fontWeight: 700,
    marginBottom: 4,
    color: "#000000",
  },
  marketBulletMarker: {
    width: 12,
    fontSize: 11,
    color: "#000000",
  },
  marketBulletText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 1.4,
    color: "#000000",
  },
  marketAnalysisSection: {
    marginTop: 14,
    gap: 2,
  },
  table: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginTop: 8,
  },
  tableRowHeader: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  tableHeaderCell: {
    flex: 1,
    fontSize: 11,
    fontWeight: 700,
    padding: 8,
  },
  tableCell: {
    flex: 1,
    fontSize: 11,
    padding: 8,
  },
  ambassadorBlock: {
    marginTop: 18,
    alignItems: "flex-start",
  },
  ambassadorImage: {
    width: 180,
    height: 230,
    borderRadius: 8,
  },
  ambassadorCaption: {
    fontSize: 10,
    marginTop: 6,
    color: "#6B7280",
  },
  legalBlock: {
    marginTop: 16,
    padding: 10,
    backgroundColor: "#F9FAFB",
    borderRadius: 6,
  },
  legalTitle: {
    fontSize: 10,
    fontWeight: 700,
    marginBottom: 4,
  },
  legalBody: {
    fontSize: 9,
    lineHeight: 1.4,
    color: "#4B5563",
  },
  footerDisclaimer: {
    position: "absolute",
    bottom: 38,
    left: 40,
    right: 40,
    fontSize: 8,
    color: "#6B7280",
    textAlign: "center",
  },
  pageNumber: {
    position: "absolute",
    bottom: 18,
    right: 40,
    fontSize: 9,
    color: "#9CA3AF",
  },
  marketPageNumber: {
    color: "#000000",
  },
});
