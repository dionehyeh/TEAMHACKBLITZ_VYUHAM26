"use client";

import React, { useState } from "react";
import { Check, Copy, Terminal, ExternalLink } from "lucide-react";

interface MarkdownPreviewProps {
  content: string;
  className?: string;
}

export const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({
  content,
  className = "",
}) => {
  if (!content || !content.trim()) {
    return (
      <div className="py-8 text-center text-xs text-[#888888] italic">
        Empty document. Start writing markdown...
      </div>
    );
  }

  const blocks = parseMarkdownBlocks(content);

  return (
    <div
      className={`markdown-preview text-[#262626] leading-relaxed space-y-4 font-sans select-text ${className}`}
    >
      {blocks.map((block, idx) => (
        <BlockRenderer key={idx} block={block} />
      ))}
    </div>
  );
};

// ── Block Types ──
type Block =
  | { type: "heading"; level: number; text: string }
  | { type: "code"; lang: string; code: string }
  | { type: "blockquote"; text: string }
  | { type: "list"; ordered: boolean; items: { text: string; checked?: boolean }[] }
  | { type: "table"; headers: string[]; rows: string[][] }
  | { type: "hr" }
  | { type: "paragraph"; text: string };

function parseMarkdownBlocks(content: string): Block[] {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // 1. Code Block
    if (line.trim().startsWith("```")) {
      const lang = line.trim().slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      blocks.push({
        type: "code",
        lang: lang || "text",
        code: codeLines.join("\n"),
      });
      continue;
    }

    // 2. Horizontal Rule
    if (/^(---|___|\*\*\*)\s*$/.test(line.trim())) {
      blocks.push({ type: "hr" });
      i++;
      continue;
    }

    // 3. Headings (# H1, ## H2, etc.)
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      blocks.push({
        type: "heading",
        level: headingMatch[1].length,
        text: headingMatch[2].trim(),
      });
      i++;
      continue;
    }

    // 4. Blockquote (> quote)
    if (line.trim().startsWith(">")) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith(">")) {
        quoteLines.push(lines[i].replace(/^>\s?/, ""));
        i++;
      }
      blocks.push({
        type: "blockquote",
        text: quoteLines.join("\n"),
      });
      continue;
    }

    // 5. Table (starts with | and followed by separator | --- |)
    if (
      line.trim().startsWith("|") &&
      line.trim().endsWith("|") &&
      i + 1 < lines.length &&
      lines[i + 1].trim().startsWith("|") &&
      lines[i + 1].includes("---")
    ) {
      const headerLine = line.trim();
      const headers = headerLine
        .slice(1, -1)
        .split("|")
        .map((h) => h.trim());
      i += 2; // skip header and separator
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith("|") && lines[i].trim().endsWith("|")) {
        const rowCells = lines[i]
          .trim()
          .slice(1, -1)
          .split("|")
          .map((c) => c.trim());
        rows.push(rowCells);
        i++;
      }
      blocks.push({ type: "table", headers, rows });
      continue;
    }

    // 6. List items (ordered, unordered, task list)
    const ulMatch = line.match(/^(\s*)([-*+])\s+(.+)$/);
    const olMatch = line.match(/^(\s*)(\d+)\.\s+(.+)$/);
    if (ulMatch || olMatch) {
      const ordered = Boolean(olMatch);
      const items: { text: string; checked?: boolean }[] = [];

      while (i < lines.length) {
        const current = lines[i];
        const matchU = current.match(/^(\s*)([-*+])\s+(.+)$/);
        const matchO = current.match(/^(\s*)(\d+)\.\s+(.+)$/);

        if (ordered ? matchO : matchU) {
          const rawText = (ordered ? matchO![3] : matchU![3]).trim();
          // Check for task checkbox: [ ] or [x]
          const taskMatch = rawText.match(/^\[([ xX])\]\s+(.+)$/);
          if (taskMatch) {
            items.push({
              checked: taskMatch[1].toLowerCase() === "x",
              text: taskMatch[2].trim(),
            });
          } else {
            items.push({ text: rawText });
          }
          i++;
        } else if (current.trim() === "") {
          break;
        } else {
          // continuation of list item or end of list
          break;
        }
      }
      blocks.push({ type: "list", ordered, items });
      continue;
    }

    // 7. Empty line
    if (line.trim() === "") {
      i++;
      continue;
    }

    // 8. Paragraph (combine non-empty lines until blank line or block start)
    const pLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !lines[i].trim().startsWith("```") &&
      !lines[i].trim().startsWith("#") &&
      !lines[i].trim().startsWith(">") &&
      !lines[i].match(/^(\s*)([-*+]|\d+\.)\s+/) &&
      !/^(---|___|\*\*\*)\s*$/.test(lines[i].trim())
    ) {
      pLines.push(lines[i]);
      i++;
    }
    if (pLines.length > 0) {
      blocks.push({
        type: "paragraph",
        text: pLines.join(" "),
      });
    }
  }

  return blocks;
}

// ── Block Renderer ──
const BlockRenderer: React.FC<{ block: Block }> = ({ block }) => {
  switch (block.type) {
    case "heading": {
      const content = renderInline(block.text);
      if (block.level === 1) {
        return (
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1a1a1a] tracking-tight pb-2 border-b border-[#E5E5E5] mt-6 mb-4">
            {content}
          </h1>
        );
      }
      if (block.level === 2) {
        return (
          <h2 className="text-xl sm:text-2xl font-bold text-[#1a1a1a] tracking-tight mt-6 mb-3 flex items-center gap-2">
            <span className="w-1.5 h-5 rounded-full bg-[#74D96F] inline-block shrink-0" />
            <span>{content}</span>
          </h2>
        );
      }
      if (block.level === 3) {
        return (
          <h3 className="text-lg font-bold text-[#262626] tracking-tight mt-5 mb-2">
            {content}
          </h3>
        );
      }
      return (
        <h4 className="text-base font-semibold text-[#262626] mt-4 mb-2">
          {content}
        </h4>
      );
    }

    case "code":
      return <CodeBlock code={block.code} lang={block.lang} />;

    case "blockquote":
      return (
        <blockquote className="border-l-4 border-[#74D96F] bg-[#F7FAF7] pl-4 py-3 pr-4 rounded-r-2xl my-3 text-sm text-[#333333] italic leading-relaxed shadow-xs">
          {renderInline(block.text)}
        </blockquote>
      );

    case "list":
      if (block.ordered) {
        return (
          <ol className="list-decimal list-outside pl-6 space-y-1.5 my-3 text-sm text-[#333333]">
            {block.items.map((item, i) => (
              <li key={i} className="pl-1">
                {renderInline(item.text)}
              </li>
            ))}
          </ol>
        );
      }
      return (
        <ul className="space-y-1.5 my-3 text-sm text-[#333333]">
          {block.items.map((item, i) => {
            if (item.checked !== undefined) {
              return (
                <li key={i} className="flex items-start space-x-2 pl-0.5">
                  <input
                    type="checkbox"
                    readOnly
                    checked={item.checked}
                    className="mt-1 rounded border-[#BEBEBE] text-[#74D96F] focus:ring-0 cursor-default"
                  />
                  <span className={item.checked ? "line-through text-[#888888]" : ""}>
                    {renderInline(item.text)}
                  </span>
                </li>
              );
            }
            return (
              <li key={i} className="flex items-start space-x-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#74D96F] mt-2 shrink-0" />
                <span className="flex-1">{renderInline(item.text)}</span>
              </li>
            );
          })}
        </ul>
      );

    case "table":
      return (
        <div className="overflow-x-auto my-4 rounded-2xl border border-[#EDEDED] shadow-xs">
          <table className="w-full text-left text-xs text-[#262626]">
            <thead className="bg-[#F8F9FA] border-b border-[#EDEDED] text-[11px] uppercase tracking-wider font-bold text-[#555555]">
              <tr>
                {block.headers.map((h, i) => (
                  <th key={i} className="px-4 py-2.5 font-bold">
                    {renderInline(h)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDEDED] bg-white">
              {block.rows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-[#F9FAF9] transition-colors">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="px-4 py-2.5 text-[#333333]">
                      {renderInline(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case "hr":
      return <hr className="my-6 border-t border-[#EDEDED]" />;

    case "paragraph":
      return (
        <p className="text-sm leading-relaxed text-[#333333] my-2">
          {renderInline(block.text)}
        </p>
      );

    default:
      return null;
  }
};

// ── Code Block with Copy Button ──
const CodeBlock: React.FC<{ code: string; lang: string }> = ({ code, lang }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="rounded-2xl border border-[#E0E0E0] bg-[#1E1E1E] text-slate-100 overflow-hidden my-4 shadow-sm">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#181818] border-b border-[#2C2C2C] text-xs font-mono text-zinc-400">
        <div className="flex items-center space-x-2">
          <Terminal className="w-3.5 h-3.5 text-[#74D96F]" />
          <span className="uppercase text-[11px] font-bold tracking-wider">{lang || "CODE"}</span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center space-x-1 px-2.5 py-1 rounded-md bg-[#2A2A2A] hover:bg-[#383838] text-[11px] font-medium text-zinc-300 transition"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-[#74D96F]" />
              <span className="text-[#74D96F]">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Text Content */}
      <pre className="p-4 text-xs font-mono leading-relaxed overflow-x-auto selection:bg-[#74D96F]/30 selection:text-white">
        <code>{code}</code>
      </pre>
    </div>
  );
};

// ── Inline Markdown Parser ──
function renderInline(text: string): React.ReactNode {
  if (!text) return null;

  // Tokenize string for links, code, bold, italic, strikethrough
  // Regex pattern matching `code`, **bold**, *italic*, ~~strike~~, [text](url)
  const regex =
    /(`[^`]+`|\*\*[^*]+\*\*|__[^_]+__|~~[^~]+~~|\*[^*]+\*|_[^_]+_|\[([^\]]+)\]\(([^)]+)\))/g;

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    const token = match[0];

    // Inline code: `code`
    if (token.startsWith("`") && token.endsWith("`")) {
      parts.push(
        <code
          key={match.index}
          className="px-1.5 py-0.5 mx-0.5 rounded-md bg-[#EDEDED] text-[#1a1a1a] font-mono text-[11px] font-semibold border border-[#DCDCDC]"
        >
          {token.slice(1, -1)}
        </code>
      );
    }
    // Bold: **text** or __text__
    else if (
      (token.startsWith("**") && token.endsWith("**")) ||
      (token.startsWith("__") && token.endsWith("__"))
    ) {
      parts.push(
        <strong key={match.index} className="font-extrabold text-[#111111]">
          {renderInline(token.slice(2, -2))}
        </strong>
      );
    }
    // Strikethrough: ~~text~~
    else if (token.startsWith("~~") && token.endsWith("~~")) {
      parts.push(
        <span key={match.index} className="line-through text-[#777777]">
          {renderInline(token.slice(2, -2))}
        </span>
      );
    }
    // Link: [text](url)
    else if (token.startsWith("[") && token.includes("](") && token.endsWith(")")) {
      const linkMatch = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (linkMatch) {
        const linkText = linkMatch[1];
        const linkUrl = linkMatch[2];
        const isExternal = linkUrl.startsWith("http://") || linkUrl.startsWith("https://");
        parts.push(
          <a
            key={match.index}
            href={linkUrl}
            target={isExternal ? "_blank" : undefined}
            rel={isExternal ? "noopener noreferrer" : undefined}
            className="text-[#1F541D] font-semibold underline decoration-[#74D96F] underline-offset-2 hover:text-[#56BE51] transition inline-flex items-center gap-0.5"
          >
            <span>{linkText}</span>
            {isExternal && <ExternalLink className="w-2.5 h-2.5 opacity-60 inline" />}
          </a>
        );
      } else {
        parts.push(token);
      }
    }
    // Italic: *text* or _text_
    else if (
      (token.startsWith("*") && token.endsWith("*")) ||
      (token.startsWith("_") && token.endsWith("_"))
    ) {
      parts.push(
        <em key={match.index} className="italic text-[#262626]">
          {renderInline(token.slice(1, -1))}
        </em>
      );
    } else {
      parts.push(token);
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts;
}
