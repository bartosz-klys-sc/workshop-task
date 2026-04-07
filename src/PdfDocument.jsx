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
  footnote:
    "Angaben in Euro vor Kosten. Anleihen in Fremdwährung sind währungsbesichert.",
  analysisSections: [],
};

export default function PdfDocument({
  formData,
  marketChartImageSrc,
  wertentwicklungChartImageSrc,
}) {
  const t = dictionary[formData.language] || dictionary.de;
  const brandColor = formData.brand === "ING" ? "#FF6200" : "#FF7A00";
  const title = formData.brand === "ING" ? "Smart Invest" : formData.reportType;
  const metaDate = formData.reportDate?.trim() || `${formData.quarter} ${formData.year}`;
  const marketPage = { ...defaultMarketPage, ...(formData.marketPage || {}) };
  const wertentwicklungPage = {
    ...defaultMarketPage,
    title: "Wertentwicklung",
    ...(formData.wertentwicklungPage || {}),
  };
  const secondPage = {
    title: "In Kürze",
    summary: "",
    sections: [],
    ...(formData.secondPage || {}),
  };
  const page7 = {
    title: "Seite 7",
    body: "",
    ...(formData.page7 || {}),
  };
  const page8 = {
    title: "Seite 8",
    body: "",
    secondaryTitle: "",
    secondaryBody: "",
    ...(formData.page8 || {}),
  };
  const hasPage7Content =
    (page7.title || "").trim().length > 0 || (page7.body || "").trim().length > 0;
  const hasPage8Content =
    (page8.title || "").trim().length > 0 ||
    (page8.body || "").trim().length > 0 ||
    (page8.secondaryTitle || "").trim().length > 0 ||
    (page8.secondaryBody || "").trim().length > 0;

  const parseInlineSegments = (text) => {
    const parts = [];
    let buffer = "";
    let isBold = false;
    let isItalic = false;

    const flush = () => {
      if (buffer.length === 0) return;
      parts.push({ text: buffer, bold: isBold, italic: isItalic });
      buffer = "";
    };

    for (let i = 0; i < text.length; i += 1) {
      const char = text[i];
      const next = text[i + 1];
      const nextNext = text[i + 2];

      if (char === "*" && next === "*" && nextNext === "*") {
        flush();
        isBold = !isBold;
        isItalic = !isItalic;
        i += 2;
        continue;
      }
      if (char === "*" && next === "*") {
        flush();
        isBold = !isBold;
        i += 1;
        continue;
      }
      if (char === "*" && next !== "*") {
        flush();
        isItalic = !isItalic;
        continue;
      }
      buffer += char;
    }
    flush();
    return parts;
  };

  const renderInlineText = (text, baseStyle, key) => {
    const safeText = text ?? "";
    const segments = parseInlineSegments(safeText);

    const resolveInlineStyle = (part) => {
      if (part.bold && part.italic) return styles.boldText;
      if (part.bold) return styles.boldText;
      if (part.italic) return styles.italicText;
      return undefined;
    };

    return (
      <Text style={baseStyle} key={key}>
        {segments.map((part, idx) => (
          <Text
            key={`seg-${key || "inline"}-${idx}`}
            style={resolveInlineStyle(part) || {}}
          >
            {part.text}
          </Text>
        ))}
      </Text>
    );
  };

  const renderRichText = (value, variant = "default") => {
    const isMarket = variant === "market";

    return value.split("\n").map((line, idx) => {
      if (line.startsWith("## ")) {
        return renderInlineText(
          line.replace("## ", ""),
          isMarket ? styles.marketHeadingText : styles.headingText,
          `line-${idx}`
        );
      }
      if (line.startsWith("- ")) {
        return (
          <View style={styles.bulletRow} key={`line-${idx}`} wrap={false}>
            <Text style={isMarket ? styles.marketBulletMarker : styles.bulletMarker}>•</Text>
            {renderInlineText(
              line.replace("- ", ""),
              isMarket ? styles.marketBulletText : styles.bulletText,
              `bullet-${idx}`
            )}
          </View>
        );
      }
      if (line.trim().length === 0) {
        return <Text style={styles.bodySpacer} key={`line-${idx}`}> </Text>;
      }
      return renderInlineText(
        line,
        isMarket ? styles.marketBodyText : styles.bodyText,
        `line-${idx}`
      );
    });
  };

  const renderSecondPageSummary = (value) =>
    value.split("\n").map((line, idx) => {
      if (line.trim().length === 0) {
        return <Text style={styles.secondPageSpacer} key={`second-summary-${idx}`}> </Text>;
      }
      return renderInlineText(
        line,
        styles.secondPageSummaryText,
        `second-summary-${idx}`
      );
    });

  const renderSecondPageContent = (value) =>
    value.split("\n").map((line, idx) => {
      if (line.trim().length === 0) {
        return <Text style={styles.secondPageSpacer} key={`second-line-${idx}`}> </Text>;
      }
      return renderInlineText(
        line,
        styles.secondPageBody,
        `second-line-${idx}`
      );
    });

  const splitSections = (sections) => {
    const mid = Math.ceil(sections.length / 2);
    return [sections.slice(0, mid), sections.slice(mid)];
  };

  const [leftSections, rightSections] = splitSections(secondPage.sections || []);

  const renderPageNumber = (style) => (
    <Text
      style={style}
      fixed
      render={({ pageNumber, totalPages }) => `${t.page} ${pageNumber} / ${totalPages}`}
    />
  );

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
        {renderInlineText(title, [styles.title, { color: brandColor }], "main-title")}

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

        {renderPageNumber(styles.pageNumber)}
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

          {renderInlineText(
            secondPage.title || "",
            styles.secondPageTitle,
            "second-page-title"
          )}
          <View style={styles.secondPageSummary}>
            {renderSecondPageSummary(secondPage.summary || "")}
          </View>

          <View style={styles.secondPageColumns}>
            <View style={styles.secondPageColumn}>
              <Text style={styles.secondPageSectionLabel}>{t.summary}</Text>
              {leftSections.map((section, index) => (
                <View style={styles.secondPageSection} key={`second-left-${index}`}>
                  {renderInlineText(
                    section.title || "",
                    styles.secondPageSectionTitle,
                    `second-left-title-${index}`
                  )}
                  {renderSecondPageContent(section.content || "")}
                </View>
              ))}
            </View>
            <View style={[styles.secondPageColumn, styles.secondPageColumnOffset]}>
              {rightSections.map((section, index) => (
                <View style={styles.secondPageSection} key={`second-right-${index}`}>
                  {renderInlineText(
                    section.title || "",
                    styles.secondPageSectionTitle,
                    `second-right-title-${index}`
                  )}
                  {renderSecondPageContent(section.content || "")}
                </View>
              ))}
            </View>
          </View>
        </View>

        {renderPageNumber(styles.pageNumberDark)}
      </Page>

      <Page size="A4" style={[styles.page, styles.marketPage]}>
        {renderInlineText(marketPage.title, styles.marketTitle, "market-title")}
        {renderInlineText(
          marketPage.subtitle,
          styles.marketSubtitle,
          "market-subtitle"
        )}

        {marketChartImageSrc ? (
          <Image style={styles.marketChartImage} src={marketChartImageSrc} />
        ) : (
          <Text style={styles.marketChartFallback}>Chart preview unavailable.</Text>
        )}

        <Text style={styles.marketFootnote}>{marketPage.footnote}</Text>

        <View style={styles.marketAnalysisSection}>
          {(marketPage.analysisSections || []).map((section, index) => (
            <View style={styles.marketAnalysisBlock} key={`market-left-${index}`}>
              {renderInlineText(
                section.title || "",
                styles.marketSectionLabel,
                `market-analysis-title-${index}`
              )}
              <View style={styles.richBlock}>
                {renderRichText(section.content || "", "market")}
              </View>
            </View>
          ))}
        </View>

        {renderPageNumber([styles.pageNumber, styles.marketPageNumber])}
      </Page>

      <Page size="A4" style={[styles.page, styles.marketPage]}>
        {renderInlineText(
          wertentwicklungPage.title,
          styles.marketTitle,
          "wertentwicklung-title"
        )}
        {renderInlineText(
          wertentwicklungPage.subtitle,
          styles.marketSubtitle,
          "wertentwicklung-subtitle"
        )}

        {wertentwicklungChartImageSrc ? (
          <Image style={styles.marketChartImage} src={wertentwicklungChartImageSrc} />
        ) : (
          <Text style={styles.marketChartFallback}>Chart preview unavailable.</Text>
        )}

        <Text style={styles.marketFootnote}>{wertentwicklungPage.footnote}</Text>

        <View style={styles.marketAnalysisSection}>
          {(wertentwicklungPage.analysisSections || []).map((section, index) => (
            <View style={styles.marketAnalysisBlock} key={`wert-left-${index}`}>
              {renderInlineText(
                section.title || "",
                styles.marketSectionLabel,
                `wert-analysis-title-${index}`
              )}
              <View style={styles.richBlock}>
                {renderRichText(section.content || "", "market")}
              </View>
            </View>
          ))}
        </View>

        {renderPageNumber([styles.pageNumber, styles.marketPageNumber])}
      </Page>

      {hasPage7Content ? (
        <Page size="A4" style={styles.page}>
          {renderInlineText(page7.title, styles.marketTitle, "page7-title")}
          <View style={styles.richBlock}>
            {renderRichText(page7.body || "")}
          </View>
          {renderPageNumber(styles.pageNumber)}
        </Page>
      ) : null}

      {hasPage8Content ? (
        <Page size="A4" style={styles.page}>
          {renderInlineText(page8.title, styles.marketTitle, "page8-title")}
          <View style={styles.richBlock}>
            {renderRichText(page8.body || "")}
          </View>
          {renderInlineText(
            page8.secondaryTitle,
            styles.marketTitle,
            "page8-title-2"
          )}
          <View style={styles.richBlock}>
            {renderRichText(page8.secondaryBody || "")}
          </View>
          {renderPageNumber(styles.pageNumber)}
        </Page>
      ) : null}
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
  secondPageTitle: {
    fontSize: 22,
    fontWeight: 700,
    marginBottom: 14,
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
    fontFamily: "Helvetica-Bold",
  },
  italicText: {
    fontFamily: "Helvetica-Oblique",
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
  marketChartImage: {
    width: 515,
    height: 291,
    marginBottom: 10,
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
  marketAnalysisBlock: {
    gap: 2,
    marginBottom: 6,
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
