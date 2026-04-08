import React, { useRef } from "react";

function escapeCsvCell(value) {
  const text = String(value ?? "");
  if (text.includes(",") || text.includes('"') || text.includes("\n")) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function buildChartDataCsv(rows) {
  const dataRows = rows
    .filter(
      (row) =>
        String(row?.label ?? "").trim().length > 0 ||
        String(row?.value ?? "").trim().length > 0
    )
    .map((row) => `${escapeCsvCell(row.label)},${escapeCsvCell(row.value)}`);
  return ["label,value", ...dataRows].join("\n");
}

function RichTextField({ label, value, onChange, placeholder }) {
  const textareaRef = useRef(null);

  const applyWrap = (before, after = before) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.slice(start, end);
    const hasSelection = start !== end;
    const nextValue =
      value.slice(0, start) + before + selected + after + value.slice(end);
    onChange(nextValue);
    requestAnimationFrame(() => {
      textarea.focus();
      const cursor = hasSelection
        ? start + before.length + selected.length + after.length
        : start + before.length;
      textarea.setSelectionRange(cursor, cursor);
    });
  };

  const applyLinePrefix = (prefix) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const lineStart = value.lastIndexOf("\n", start - 1) + 1;
    const nextValue = value.slice(0, lineStart) + prefix + value.slice(lineStart);
    onChange(nextValue);
    requestAnimationFrame(() => {
      textarea.focus();
      const cursor = start + prefix.length;
      textarea.setSelectionRange(cursor, cursor);
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-xs uppercase tracking-[0.14em] text-[#6a6a6a]">
        <span>{label}</span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => applyWrap("**")}
            className="rounded-xl bg-[#e7e2db] px-2 py-1 text-[11px] font-semibold text-[#3b3b3b]"
          >
            Bold
          </button>
          <button
            type="button"
            onClick={() => applyWrap("*")}
            className="rounded-xl bg-[#e7e2db] px-2 py-1 text-[11px] font-semibold text-[#3b3b3b]"
          >
            Italic
          </button>
          <button
            type="button"
            onClick={() => applyLinePrefix("## ")}
            className="rounded-xl bg-[#e7e2db] px-2 py-1 text-[11px] font-semibold text-[#3b3b3b]"
          >
            Heading
          </button>
          <button
            type="button"
            onClick={() => applyLinePrefix("- ")}
            className="rounded-xl bg-[#e7e2db] px-2 py-1 text-[11px] font-semibold text-[#3b3b3b]"
          >
            Bullet
          </button>
        </div>
      </div>
      <textarea
        ref={textareaRef}
        rows={6}
        value={value}
        placeholder={placeholder}
        className="rounded-2xl border border-[#d6d2cc] bg-white px-4 py-3 text-sm text-[#1c1c1c] focus:border-scalable-500 focus:outline-none focus:ring-2 focus:ring-scalable-200 resize-none"
        onChange={(e) => onChange(e.target.value)}
      />
      <p className="text-xs text-[#6a6a6a]">
        Supports **bold**, *italic*, headings (##) and bullets (-).
      </p>
    </div>
  );
}

function InlineTextField({
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
  showHelp = true,
}) {
  const textareaRef = useRef(null);

  const applyWrap = (before, after = before) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.slice(start, end);
    const hasSelection = start !== end;
    const nextValue =
      value.slice(0, start) + before + selected + after + value.slice(end);
    onChange(nextValue);
    requestAnimationFrame(() => {
      textarea.focus();
      const cursor = hasSelection
        ? start + before.length + selected.length + after.length
        : start + before.length;
      textarea.setSelectionRange(cursor, cursor);
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-xs uppercase tracking-[0.14em] text-[#6a6a6a]">
        <span>{label}</span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => applyWrap("**")}
            className="rounded-xl bg-[#e7e2db] px-2 py-1 text-[11px] font-semibold text-[#3b3b3b]"
          >
            Bold
          </button>
          <button
            type="button"
            onClick={() => applyWrap("*")}
            className="rounded-xl bg-[#e7e2db] px-2 py-1 text-[11px] font-semibold text-[#3b3b3b]"
          >
            Italic
          </button>
        </div>
      </div>
      <textarea
        ref={textareaRef}
        rows={rows}
        value={value}
        placeholder={placeholder}
        className="rounded-2xl border border-[#d6d2cc] bg-white px-4 py-3 text-sm text-[#1c1c1c] focus:border-scalable-500 focus:outline-none focus:ring-2 focus:ring-scalable-200 resize-none"
        onChange={(e) => onChange(e.target.value)}
      />
      {showHelp ? (
        <p className="text-xs text-[#6a6a6a]">
          Supports **bold** and *italic* emphasis.
        </p>
      ) : null}
    </div>
  );
}

export default function EditorSidebar({
  formData,
  setFormData,
  onGenerate,
  isDirty,
  isGenerating = false,
}) {
  const updateField = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const updateSection = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      sections: { ...prev.sections, [key]: value },
    }));
  };

  const updateMarketPage = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      marketPage: { ...prev.marketPage, [key]: value },
    }));
  };

  const updateMarketAnalysisSection = (index, key, value) => {
    setFormData((prev) => {
      const sections = [...(prev.marketPage?.analysisSections || [])];
      sections[index] = { ...sections[index], [key]: value };
      return {
        ...prev,
        marketPage: { ...prev.marketPage, analysisSections: sections },
      };
    });
  };

  const addMarketAnalysisSection = () => {
    setFormData((prev) => ({
      ...prev,
      marketPage: {
        ...prev.marketPage,
        analysisSections: [
          ...(prev.marketPage?.analysisSections || []),
          { title: "", content: "", useSubheading: false },
        ],
      },
    }));
  };

  const removeMarketAnalysisSection = (index) => {
    setFormData((prev) => ({
      ...prev,
      marketPage: {
        ...prev.marketPage,
        analysisSections: (prev.marketPage?.analysisSections || []).filter(
          (_, i) => i !== index
        ),
      },
    }));
  };

  const updateWertentwicklungPage = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      wertentwicklungPage: { ...prev.wertentwicklungPage, [key]: value },
    }));
  };

  const updatePage7 = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      page7: { ...prev.page7, [key]: value },
    }));
  };

  const updatePage8 = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      page8: { ...prev.page8, [key]: value },
    }));
  };

  const updateCoverPage = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      coverPage: { ...prev.coverPage, [key]: value },
    }));
  };

  const updateWertentwicklungAnalysisSection = (index, key, value) => {
    setFormData((prev) => {
      const sections = [...(prev.wertentwicklungPage?.analysisSections || [])];
      sections[index] = { ...sections[index], [key]: value };
      return {
        ...prev,
        wertentwicklungPage: {
          ...prev.wertentwicklungPage,
          analysisSections: sections,
        },
      };
    });
  };

  const addWertentwicklungAnalysisSection = () => {
    setFormData((prev) => ({
      ...prev,
      wertentwicklungPage: {
        ...prev.wertentwicklungPage,
        analysisSections: [
          ...(prev.wertentwicklungPage?.analysisSections || []),
          { title: "", content: "", useSubheading: false },
        ],
      },
    }));
  };

  const removeWertentwicklungAnalysisSection = (index) => {
    setFormData((prev) => ({
      ...prev,
      wertentwicklungPage: {
        ...prev.wertentwicklungPage,
        analysisSections: (prev.wertentwicklungPage?.analysisSections || []).filter(
          (_, i) => i !== index
        ),
      },
    }));
  };

  const updateMarketChartRow = (index, key, value) => {
    setFormData((prev) => {
      const chartData = [...(prev.marketPage?.chartData || [])];
      chartData[index] = { ...chartData[index], [key]: value };
      return {
        ...prev,
        marketPage: {
          ...prev.marketPage,
          chartData,
          chartDataCsv: buildChartDataCsv(chartData),
        },
      };
    });
  };

  const updateWertentwicklungChartRow = (index, key, value) => {
    setFormData((prev) => {
      const chartData = [...(prev.wertentwicklungPage?.chartData || [])];
      chartData[index] = { ...chartData[index], [key]: value };
      return {
        ...prev,
        wertentwicklungPage: {
          ...prev.wertentwicklungPage,
          chartData,
          chartDataCsv: buildChartDataCsv(chartData),
        },
      };
    });
  };

  const addMarketChartRow = () => {
    setFormData((prev) => {
      const chartData = [
        ...(prev.marketPage?.chartData || []),
        { label: "", value: "" },
      ];
      return {
        ...prev,
        marketPage: {
          ...prev.marketPage,
          chartData,
          chartDataCsv: buildChartDataCsv(chartData),
        },
      };
    });
  };

  const addWertentwicklungChartRow = () => {
    setFormData((prev) => {
      const chartData = [
        ...(prev.wertentwicklungPage?.chartData || []),
        { label: "", value: "" },
      ];
      return {
        ...prev,
        wertentwicklungPage: {
          ...prev.wertentwicklungPage,
          chartData,
          chartDataCsv: buildChartDataCsv(chartData),
        },
      };
    });
  };

  const removeMarketChartRow = (index) => {
    setFormData((prev) => {
      const chartData = (prev.marketPage?.chartData || []).filter(
        (_, i) => i !== index
      );
      return {
        ...prev,
        marketPage: {
          ...prev.marketPage,
          chartData,
          chartDataCsv: buildChartDataCsv(chartData),
        },
      };
    });
  };

  const removeWertentwicklungChartRow = (index) => {
    setFormData((prev) => {
      const chartData = (prev.wertentwicklungPage?.chartData || []).filter(
        (_, i) => i !== index
      );
      return {
        ...prev,
        wertentwicklungPage: {
          ...prev.wertentwicklungPage,
          chartData,
          chartDataCsv: buildChartDataCsv(chartData),
        },
      };
    });
  };

  const updateSecondPage = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      secondPage: { ...prev.secondPage, [key]: value },
    }));
  };

  const updateSecondPageSection = (index, key, value) => {
    setFormData((prev) => {
      const nextSections = [...(prev.secondPage?.sections || [])];
      nextSections[index] = { ...nextSections[index], [key]: value };
      return {
        ...prev,
        secondPage: { ...prev.secondPage, sections: nextSections },
      };
    });
  };

  const addSecondPageSection = () => {
    setFormData((prev) => ({
      ...prev,
      secondPage: {
        ...prev.secondPage,
        sections: [
          ...(prev.secondPage?.sections || []),
          { title: "", content: "" },
        ],
      },
    }));
  };

  const removeSecondPageSection = (index) => {
    setFormData((prev) => ({
      ...prev,
      secondPage: {
        ...prev.secondPage,
        sections: (prev.secondPage?.sections || []).filter((_, i) => i !== index),
      },
    }));
  };

  const updatePortfolioRow = (index, key, value) => {
    setFormData((prev) => {
      const next = [...prev.portfolioPerformance];
      next[index] = { ...next[index], [key]: value };
      return { ...prev, portfolioPerformance: next };
    });
  };

  const addPortfolioRow = () => {
    setFormData((prev) => ({
      ...prev,
      portfolioPerformance: [
        ...prev.portfolioPerformance,
        { portfolio: "", ytd: 0 },
      ],
    }));
  };

  const removePortfolioRow = (index) => {
    setFormData((prev) => ({
      ...prev,
      portfolioPerformance: prev.portfolioPerformance.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center rounded-full bg-scalable-200 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#1c1c1c]">
            {formData.brand} Reports
          </div>
          <h1 className="mt-2 text-2xl font-semibold text-[#1c1c1c]">
            Marketing Report
          </h1>
          <p className="text-sm text-[#6a6a6a]">Structured PDF content builder.</p>
        </div>
        <button
          type="button"
          onClick={onGenerate}
          disabled={!isDirty || isGenerating}
          className="rounded-full bg-scalable-500 px-5 py-2 text-sm font-semibold text-white shadow-[0_10px_20px_rgba(255,122,0,0.24)] disabled:cursor-not-allowed disabled:bg-[#d6d2cc] disabled:shadow-none"
        >
          {isGenerating ? "GENERATING..." : "GENERATE"}
        </button>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-[#e7e2db] bg-white p-4 shadow-card">
        <label className="flex flex-col gap-1 text-xs uppercase tracking-[0.14em] text-[#6a6a6a]">
          Language
          <select
            className="rounded-xl border border-[#d6d2cc] bg-white px-3 py-2 text-sm text-[#1c1c1c] focus:border-scalable-500 focus:outline-none focus:ring-2 focus:ring-scalable-200"
            value={formData.language}
            onChange={(e) => updateField("language", e.target.value)}
          >
            <option value="de">DE</option>
            <option value="en">EN</option>
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs uppercase tracking-[0.14em] text-[#6a6a6a]">
          Brand
          <select
            className="rounded-xl border border-[#d6d2cc] bg-white px-3 py-2 text-sm text-[#1c1c1c] focus:border-scalable-500 focus:outline-none focus:ring-2 focus:ring-scalable-200"
            value={formData.brand}
            onChange={(e) => updateField("brand", e.target.value)}
          >
            <option value="Scalable">Scalable</option>
            <option value="ING">ING</option>
          </select>
        </label>

        <InlineTextField
          label="Report Type"
          rows={2}
          value={formData.reportType}
          onChange={(value) => updateField("reportType", value)}
          placeholder="Add **bold** or *italic* text..."
          showHelp={false}
        />

        <label className="flex flex-col gap-1 text-xs uppercase tracking-[0.14em] text-[#6a6a6a]">
          Report Date (manual)
          <input
            className="rounded-xl border border-[#d6d2cc] bg-white px-3 py-2 text-sm text-[#1c1c1c] focus:border-scalable-500 focus:outline-none focus:ring-2 focus:ring-scalable-200"
            type="text"
            placeholder="31.12.2025"
            value={formData.reportDate || ""}
            onChange={(e) => updateField("reportDate", e.target.value)}
          />
        </label>

        <div className="flex gap-3">
          <label className="flex flex-1 flex-col gap-1 text-xs uppercase tracking-[0.14em] text-[#6a6a6a]">
            Quarter
            <input
              className="rounded-xl border border-[#d6d2cc] bg-white px-3 py-2 text-sm text-[#1c1c1c] focus:border-scalable-500 focus:outline-none focus:ring-2 focus:ring-scalable-200"
              type="text"
              value={formData.quarter}
              onChange={(e) => updateField("quarter", e.target.value)}
            />
          </label>
          <label className="flex flex-1 flex-col gap-1 text-xs uppercase tracking-[0.14em] text-[#6a6a6a]">
            Year
            <input
              className="rounded-xl border border-[#d6d2cc] bg-white px-3 py-2 text-sm text-[#1c1c1c] focus:border-scalable-500 focus:outline-none focus:ring-2 focus:ring-scalable-200"
              type="text"
              value={formData.year}
              onChange={(e) => updateField("year", e.target.value)}
            />
          </label>
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-[#e7e2db] bg-white p-4 shadow-card">
        <RichTextField
          label="In Kürze"
          value={formData.sections.inKuerze}
          onChange={(value) => updateSection("inKuerze", value)}
          placeholder="Write a short market summary..."
        />
        <RichTextField
          label="Ausblick"
          value={formData.sections.ausblick}
          onChange={(value) => updateSection("ausblick", value)}
          placeholder="Describe the outlook and key risks..."
        />
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-[#e7e2db] bg-white p-4 shadow-card">
        <h2 className="text-base font-semibold text-[#1c1c1c]">Cover Page</h2>
        <InlineTextField
          label="Metadata"
          rows={2}
          value={formData.coverPage?.metadataText || ""}
          onChange={(value) => updateCoverPage("metadataText", value)}
          placeholder="ALL CAPS METADATA"
          showHelp={false}
        />
        <InlineTextField
          label="Main Title"
          rows={2}
          value={formData.coverPage?.mainTitle || ""}
          onChange={(value) => updateCoverPage("mainTitle", value)}
          placeholder="Main title"
          showHelp={false}
        />
        <InlineTextField
          label="Subtitle"
          rows={2}
          value={formData.coverPage?.subtitle || ""}
          onChange={(value) => updateCoverPage("subtitle", value)}
          placeholder="Subtitle"
          showHelp={false}
        />
        <label className="flex flex-col gap-1 text-xs uppercase tracking-[0.14em] text-[#6a6a6a]">
          Hero Image URL
          <input
            className="rounded-xl border border-[#d6d2cc] bg-white px-3 py-2 text-sm text-[#1c1c1c] focus:border-scalable-500 focus:outline-none focus:ring-2 focus:ring-scalable-200"
            type="text"
            value={formData.coverPage?.heroImageUrl || ""}
            onChange={(e) => updateCoverPage("heroImageUrl", e.target.value)}
            placeholder="https://..."
          />
        </label>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-[#e7e2db] bg-white p-4 shadow-card">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-[#1c1c1c]">Second Page</h2>
          <button
            type="button"
            onClick={addSecondPageSection}
            className="rounded-xl bg-scalable-200 px-3 py-2 text-xs font-semibold text-[#1c1c1c]"
          >
            Add Section
          </button>
        </div>
        <InlineTextField
          label="Page Title"
          rows={2}
          value={formData.secondPage?.title || ""}
          onChange={(value) => updateSecondPage("title", value)}
          placeholder="Add **bold** or *italic* text..."
          showHelp={false}
        />
        <InlineTextField
          label="Summary"
          rows={4}
          value={formData.secondPage?.summary || ""}
          onChange={(value) => updateSecondPage("summary", value)}
          placeholder="Intro text for the second page..."
        />
        {(formData.secondPage?.sections || []).map((section, index) => (
          <div
            key={`second-section-${index}`}
            className="flex flex-col gap-3 rounded-2xl border border-[#efece7] bg-[#fbfaf8] p-4"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6a6a6a]">
                Section {index + 1}
              </p>
              <button
                type="button"
                onClick={() => removeSecondPageSection(index)}
                className="rounded-xl bg-white px-3 py-2 text-xs font-semibold text-[#6a6a6a]"
              >
                Remove
              </button>
            </div>
            <InlineTextField
              label="Title"
              rows={2}
              value={section.title || ""}
              onChange={(value) => updateSecondPageSection(index, "title", value)}
              placeholder="Add **bold** or *italic* text..."
              showHelp={false}
            />
            <InlineTextField
              label="Content"
              value={section.content || ""}
              onChange={(value) => updateSecondPageSection(index, "content", value)}
              placeholder="Use **bold** or *italic* to emphasize..."
              rows={4}
            />
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-[#e7e2db] bg-white p-4 shadow-card">
        <h2 className="text-base font-semibold text-[#1c1c1c]">Market Page</h2>
        <InlineTextField
          label="Title"
          rows={2}
          value={formData.marketPage?.title || ""}
          onChange={(value) => updateMarketPage("title", value)}
          placeholder="Add **bold** or *italic* text..."
          showHelp={false}
        />
        <InlineTextField
          label="Subtitle"
          rows={2}
          value={formData.marketPage?.subtitle || ""}
          onChange={(value) => updateMarketPage("subtitle", value)}
          placeholder="Add **bold** or *italic* text..."
          showHelp={false}
        />
        <div className="flex flex-col gap-3 rounded-2xl border border-[#efece7] bg-[#fbfaf8] p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#1c1c1c]">Chart Data</h3>
            <button
              type="button"
              onClick={addMarketChartRow}
              className="rounded-xl bg-scalable-200 px-3 py-2 text-xs font-semibold text-[#1c1c1c]"
            >
              Add Row
            </button>
          </div>
          {(formData.marketPage?.chartData || []).map((row, index) => (
            <div
              className="grid grid-cols-[1.4fr_0.6fr_auto] items-center gap-2"
              key={`market-chart-${index}`}
            >
              <input
                type="text"
                placeholder="Label"
                value={row.label}
                className="rounded-xl border border-[#d6d2cc] bg-white px-3 py-2 text-sm text-[#1c1c1c] focus:border-scalable-500 focus:outline-none focus:ring-2 focus:ring-scalable-200"
                onChange={(e) =>
                  updateMarketChartRow(index, "label", e.target.value)
                }
              />
              <input
                type="text"
                placeholder="Value"
                value={row.value}
                className="rounded-xl border border-[#d6d2cc] bg-white px-3 py-2 text-sm text-[#1c1c1c] focus:border-scalable-500 focus:outline-none focus:ring-2 focus:ring-scalable-200"
                onChange={(e) =>
                  updateMarketChartRow(index, "value", e.target.value)
                }
              />
              <button
                type="button"
                onClick={() => removeMarketChartRow(index)}
                className="rounded-xl bg-[#f7f5f2] px-3 py-2 text-xs font-semibold text-[#6a6a6a]"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <label className="flex flex-col gap-1 text-xs uppercase tracking-[0.14em] text-[#6a6a6a]">
          Footnote
          <textarea
            rows={2}
            className="rounded-xl border border-[#d6d2cc] bg-white px-3 py-2 text-sm text-[#1c1c1c] focus:border-scalable-500 focus:outline-none focus:ring-2 focus:ring-scalable-200"
            value={formData.marketPage?.footnote || ""}
            onChange={(e) => updateMarketPage("footnote", e.target.value)}
          />
        </label>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#1c1c1c]">Analysis Sections</h3>
          <button
            type="button"
            onClick={addMarketAnalysisSection}
            className="rounded-xl bg-scalable-200 px-3 py-2 text-xs font-semibold text-[#1c1c1c]"
          >
            Add Section
          </button>
        </div>
        {(formData.marketPage?.analysisSections || []).map((section, index) => (
          <div
            key={`market-analysis-${index}`}
            className="flex flex-col gap-3 rounded-2xl border border-[#efece7] bg-[#fbfaf8] p-4"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6a6a6a]">
                Analysis {index + 1}
              </p>
              <button
                type="button"
                onClick={() => removeMarketAnalysisSection(index)}
                className="rounded-xl bg-white px-3 py-2 text-xs font-semibold text-[#6a6a6a]"
              >
                Remove
              </button>
            </div>
            <InlineTextField
              label="Analysis Title"
              rows={2}
              value={section.title || ""}
              onChange={(value) =>
                updateMarketAnalysisSection(index, "title", value)
              }
              placeholder="Add **bold** or *italic* text..."
              showHelp={false}
            />
            <button
              type="button"
              onClick={() =>
                updateMarketAnalysisSection(
                  index,
                  "useSubheading",
                  !section.useSubheading
                )
              }
              className={`rounded-xl px-3 py-2 text-xs font-semibold ${
                section.useSubheading
                  ? "bg-scalable-500 text-white"
                  : "bg-[#f7f5f2] text-[#6a6a6a]"
              }`}
            >
              {section.useSubheading ? "Subheading On" : "Subheading Off"}
            </button>
            <RichTextField
              label="Analysis Content"
              value={section.content || ""}
              onChange={(value) =>
                updateMarketAnalysisSection(index, "content", value)
              }
              placeholder="Use bullets (-), headings (##), bold (**), italic (*)..."
            />
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-[#e7e2db] bg-white p-4 shadow-card">
        <h2 className="text-base font-semibold text-[#1c1c1c]">Wertentwicklung</h2>
        <InlineTextField
          label="Title"
          rows={2}
          value={formData.wertentwicklungPage?.title || ""}
          onChange={(value) => updateWertentwicklungPage("title", value)}
          placeholder="Add **bold** or *italic* text..."
          showHelp={false}
        />
        <InlineTextField
          label="Subtitle"
          rows={2}
          value={formData.wertentwicklungPage?.subtitle || ""}
          onChange={(value) => updateWertentwicklungPage("subtitle", value)}
          placeholder="Add **bold** or *italic* text..."
          showHelp={false}
        />
        <div className="flex flex-col gap-3 rounded-2xl border border-[#efece7] bg-[#fbfaf8] p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#1c1c1c]">Chart Data</h3>
            <button
              type="button"
              onClick={addWertentwicklungChartRow}
              className="rounded-xl bg-scalable-200 px-3 py-2 text-xs font-semibold text-[#1c1c1c]"
            >
              Add Row
            </button>
          </div>
          {(formData.wertentwicklungPage?.chartData || []).map((row, index) => (
            <div
              className="grid grid-cols-[1.4fr_0.6fr_auto] items-center gap-2"
              key={`wert-chart-${index}`}
            >
              <input
                type="text"
                placeholder="Label"
                value={row.label}
                className="rounded-xl border border-[#d6d2cc] bg-white px-3 py-2 text-sm text-[#1c1c1c] focus:border-scalable-500 focus:outline-none focus:ring-2 focus:ring-scalable-200"
                onChange={(e) =>
                  updateWertentwicklungChartRow(index, "label", e.target.value)
                }
              />
              <input
                type="text"
                placeholder="Value"
                value={row.value}
                className="rounded-xl border border-[#d6d2cc] bg-white px-3 py-2 text-sm text-[#1c1c1c] focus:border-scalable-500 focus:outline-none focus:ring-2 focus:ring-scalable-200"
                onChange={(e) =>
                  updateWertentwicklungChartRow(index, "value", e.target.value)
                }
              />
              <button
                type="button"
                onClick={() => removeWertentwicklungChartRow(index)}
                className="rounded-xl bg-[#f7f5f2] px-3 py-2 text-xs font-semibold text-[#6a6a6a]"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <label className="flex flex-col gap-1 text-xs uppercase tracking-[0.14em] text-[#6a6a6a]">
          Footnote
          <textarea
            rows={2}
            className="rounded-xl border border-[#d6d2cc] bg-white px-3 py-2 text-sm text-[#1c1c1c] focus:border-scalable-500 focus:outline-none focus:ring-2 focus:ring-scalable-200"
            value={formData.wertentwicklungPage?.footnote || ""}
            onChange={(e) => updateWertentwicklungPage("footnote", e.target.value)}
          />
        </label>
        <InlineTextField
          label="Subtitle (after footnote)"
          rows={2}
          value={formData.wertentwicklungPage?.subtitleAfterFootnote || ""}
          onChange={(value) => updateWertentwicklungPage("subtitleAfterFootnote", value)}
          placeholder="Add **bold** or *italic* text..."
          showHelp={false}
        />
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#1c1c1c]">Analysis Sections</h3>
          <button
            type="button"
            onClick={addWertentwicklungAnalysisSection}
            className="rounded-xl bg-scalable-200 px-3 py-2 text-xs font-semibold text-[#1c1c1c]"
          >
            Add Section
          </button>
        </div>
        {(formData.wertentwicklungPage?.analysisSections || []).map((section, index) => (
          <div
            key={`wert-analysis-${index}`}
            className="flex flex-col gap-3 rounded-2xl border border-[#efece7] bg-[#fbfaf8] p-4"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6a6a6a]">
                Analysis {index + 1}
              </p>
              <button
                type="button"
                onClick={() => removeWertentwicklungAnalysisSection(index)}
                className="rounded-xl bg-white px-3 py-2 text-xs font-semibold text-[#6a6a6a]"
              >
                Remove
              </button>
            </div>
            <InlineTextField
              label="Analysis Title"
              rows={2}
              value={section.title || ""}
              onChange={(value) =>
                updateWertentwicklungAnalysisSection(index, "title", value)
              }
              placeholder="Add **bold** or *italic* text..."
              showHelp={false}
            />
            <button
              type="button"
              onClick={() =>
                updateWertentwicklungAnalysisSection(
                  index,
                  "useSubheading",
                  !section.useSubheading
                )
              }
              className={`rounded-xl px-3 py-2 text-xs font-semibold ${
                section.useSubheading
                  ? "bg-scalable-500 text-white"
                  : "bg-[#f7f5f2] text-[#6a6a6a]"
              }`}
            >
              {section.useSubheading ? "Subheading On" : "Subheading Off"}
            </button>
            <RichTextField
              label="Analysis Content"
              value={section.content || ""}
              onChange={(value) =>
                updateWertentwicklungAnalysisSection(index, "content", value)
              }
              placeholder="Use bullets (-), headings (##), bold (**), italic (*)..."
            />
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-[#e7e2db] bg-white p-4 shadow-card">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-[#1c1c1c]">
            Portfolio Performance
          </h2>
          <button
            type="button"
            onClick={addPortfolioRow}
            className="rounded-xl bg-scalable-200 px-3 py-2 text-xs font-semibold text-[#1c1c1c]"
          >
            Add Row
          </button>
        </div>
        {formData.portfolioPerformance.map((row, index) => (
          <div
            className="grid grid-cols-[1.4fr_0.6fr_auto] items-center gap-2"
            key={`portfolio-${index}`}
          >
            <input
              type="text"
              placeholder="Portfolio"
              value={row.portfolio}
              className="rounded-xl border border-[#d6d2cc] bg-white px-3 py-2 text-sm text-[#1c1c1c] focus:border-scalable-500 focus:outline-none focus:ring-2 focus:ring-scalable-200"
              onChange={(e) =>
                updatePortfolioRow(index, "portfolio", e.target.value)
              }
            />
            <input
              type="number"
              step="0.1"
              value={row.ytd}
              className="rounded-xl border border-[#d6d2cc] bg-white px-3 py-2 text-sm text-[#1c1c1c] focus:border-scalable-500 focus:outline-none focus:ring-2 focus:ring-scalable-200"
              onChange={(e) =>
                updatePortfolioRow(index, "ytd", Number(e.target.value))
              }
            />
            <button
              type="button"
              onClick={() => removePortfolioRow(index)}
              className="rounded-xl bg-[#f7f5f2] px-3 py-2 text-xs font-semibold text-[#6a6a6a]"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-[#e7e2db] bg-white p-4 shadow-card">
        <h2 className="text-base font-semibold text-[#1c1c1c]">Page 7</h2>
        <InlineTextField
          label="Title"
          rows={2}
          value={formData.page7?.title || ""}
          onChange={(value) => updatePage7("title", value)}
          placeholder="Add **bold** or *italic* text..."
          showHelp={false}
        />
        <RichTextField
          label="Content"
          value={formData.page7?.body || ""}
          onChange={(value) => updatePage7("body", value)}
          placeholder="Use bullets (-), headings (##), bold (**), italic (*)..."
        />
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-[#e7e2db] bg-white p-4 shadow-card">
        <h2 className="text-base font-semibold text-[#1c1c1c]">Page 8</h2>
        <InlineTextField
          label="Title"
          rows={2}
          value={formData.page8?.title || ""}
          onChange={(value) => updatePage8("title", value)}
          placeholder="Add **bold** or *italic* text..."
          showHelp={false}
        />
        <RichTextField
          label="Content"
          value={formData.page8?.body || ""}
          onChange={(value) => updatePage8("body", value)}
          placeholder="Use bullets (-), headings (##), bold (**), italic (*)..."
        />
        <InlineTextField
          label="Second Title"
          rows={2}
          value={formData.page8?.secondaryTitle || ""}
          onChange={(value) => updatePage8("secondaryTitle", value)}
          placeholder="Add **bold** or *italic* text..."
          showHelp={false}
        />
        <RichTextField
          label="Second Content"
          value={formData.page8?.secondaryBody || ""}
          onChange={(value) => updatePage8("secondaryBody", value)}
          placeholder="Use bullets (-), headings (##), bold (**), italic (*)..."
        />
      </div>
    </div>
  );
}
