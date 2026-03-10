import React, { useRef } from "react";

function RichTextField({ label, value, onChange, placeholder }) {
  const textareaRef = useRef(null);

  const applyWrap = (before, after = before) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.slice(start, end);
    const nextValue =
      value.slice(0, start) + before + selected + after + value.slice(end);
    onChange(nextValue);
    requestAnimationFrame(() => {
      textarea.focus();
      const cursor = start + before.length + selected.length + after.length;
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
        className="rounded-2xl border border-[#d6d2cc] bg-white px-4 py-3 text-sm text-[#1c1c1c] focus:border-scalable-500 focus:outline-none focus:ring-2 focus:ring-scalable-200"
        onChange={(e) => onChange(e.target.value)}
      />
      <p className="text-xs text-[#6a6a6a]">
        Supports **bold**, *italic*, headings (##) and bullets (-).
      </p>
    </div>
  );
}

function InlineTextField({ label, value, onChange, placeholder, rows = 4 }) {
  const textareaRef = useRef(null);

  const applyWrap = (before, after = before) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.slice(start, end);
    const nextValue =
      value.slice(0, start) + before + selected + after + value.slice(end);
    onChange(nextValue);
    requestAnimationFrame(() => {
      textarea.focus();
      const cursor = start + before.length + selected.length + after.length;
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
        className="rounded-2xl border border-[#d6d2cc] bg-white px-4 py-3 text-sm text-[#1c1c1c] focus:border-scalable-500 focus:outline-none focus:ring-2 focus:ring-scalable-200"
        onChange={(e) => onChange(e.target.value)}
      />
      <p className="text-xs text-[#6a6a6a]">
        Supports **bold** and *italic* emphasis.
      </p>
    </div>
  );
}

export default function EditorSidebar({
  formData,
  setFormData,
  onGenerate,
  isDirty,
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
          disabled={!isDirty}
          className="rounded-full bg-scalable-500 px-5 py-2 text-sm font-semibold text-white shadow-[0_10px_20px_rgba(255,122,0,0.24)] disabled:cursor-not-allowed disabled:bg-[#d6d2cc] disabled:shadow-none"
        >
          GENERATE
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

        <label className="flex flex-col gap-1 text-xs uppercase tracking-[0.14em] text-[#6a6a6a]">
          Report Type
          <input
            className="rounded-xl border border-[#d6d2cc] bg-white px-3 py-2 text-sm text-[#1c1c1c] focus:border-scalable-500 focus:outline-none focus:ring-2 focus:ring-scalable-200"
            type="text"
            value={formData.reportType}
            onChange={(e) => updateField("reportType", e.target.value)}
          />
        </label>

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
            <label className="flex flex-col gap-1 text-xs uppercase tracking-[0.14em] text-[#6a6a6a]">
              Title
              <input
                type="text"
                className="rounded-xl border border-[#d6d2cc] bg-white px-3 py-2 text-sm text-[#1c1c1c] focus:border-scalable-500 focus:outline-none focus:ring-2 focus:ring-scalable-200"
                value={section.title || ""}
                onChange={(e) =>
                  updateSecondPageSection(index, "title", e.target.value)
                }
              />
            </label>
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
        <label className="flex flex-col gap-1 text-xs uppercase tracking-[0.14em] text-[#6a6a6a]">
          Title
          <input
            className="rounded-xl border border-[#d6d2cc] bg-white px-3 py-2 text-sm text-[#1c1c1c] focus:border-scalable-500 focus:outline-none focus:ring-2 focus:ring-scalable-200"
            type="text"
            value={formData.marketPage?.title || ""}
            onChange={(e) => updateMarketPage("title", e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs uppercase tracking-[0.14em] text-[#6a6a6a]">
          Subtitle
          <input
            className="rounded-xl border border-[#d6d2cc] bg-white px-3 py-2 text-sm text-[#1c1c1c] focus:border-scalable-500 focus:outline-none focus:ring-2 focus:ring-scalable-200"
            type="text"
            value={formData.marketPage?.subtitle || ""}
            onChange={(e) => updateMarketPage("subtitle", e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs uppercase tracking-[0.14em] text-[#6a6a6a]">
          Footnote
          <textarea
            rows={2}
            className="rounded-xl border border-[#d6d2cc] bg-white px-3 py-2 text-sm text-[#1c1c1c] focus:border-scalable-500 focus:outline-none focus:ring-2 focus:ring-scalable-200"
            value={formData.marketPage?.footnote || ""}
            onChange={(e) => updateMarketPage("footnote", e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs uppercase tracking-[0.14em] text-[#6a6a6a]">
          Analysis Title
          <input
            className="rounded-xl border border-[#d6d2cc] bg-white px-3 py-2 text-sm text-[#1c1c1c] focus:border-scalable-500 focus:outline-none focus:ring-2 focus:ring-scalable-200"
            type="text"
            value={formData.marketPage?.analysisTitle || ""}
            onChange={(e) => updateMarketPage("analysisTitle", e.target.value)}
          />
        </label>
        <RichTextField
          label="Market Analysis"
          value={formData.marketPage?.analysisBody || ""}
          onChange={(value) => updateMarketPage("analysisBody", value)}
          placeholder="Use bullets (-), headings (##), bold (**), italic (*)..."
        />
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
    </div>
  );
}
