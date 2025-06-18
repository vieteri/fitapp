import React from 'react';

// Simple markdown parser for basic formatting
const parseMarkdown = (text: string): React.ReactNode => {
  if (!text) return text;
  
  // Handle line breaks first
  const lines = text.split('\n');
  
  return lines.map((line, lineIndex) => {
    // Check for list items
    if (line.trim().match(/^[-*+]\s/)) {
      return (
        <div key={lineIndex} className="flex items-start gap-2 mb-1">
          <span className="text-gray-500 mt-1">•</span>
          <span>{parseInlineMarkdown(line.replace(/^[-*+]\s/, ''))}</span>
        </div>
      );
    }
    
    // Check for numbered lists
    if (line.trim().match(/^\d+\.\s/)) {
      const number = line.trim().match(/^(\d+)\./)?.[1];
      return (
        <div key={lineIndex} className="flex items-start gap-2 mb-1">
          <span className="text-gray-500 mt-1 min-w-[20px]">{number}.</span>
          <span>{parseInlineMarkdown(line.replace(/^\d+\.\s/, ''))}</span>
        </div>
      );
    }
    
    // Regular line
    return (
      <div key={lineIndex} className={lineIndex > 0 ? "mt-2" : ""}>
        {parseInlineMarkdown(line)}
      </div>
    );
  });
};

// Parse inline markdown formatting
const parseInlineMarkdown = (text: string): React.ReactNode => {
  if (!text) return text;
  
  // Split by markdown patterns while preserving the delimiters
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`|~~.*?~~|__.*?__|_.*?_)/g);
  
  return parts.map((part, index) => {
    // Bold text **text** or __text__
    if ((part.startsWith('**') && part.endsWith('**')) || 
        (part.startsWith('__') && part.endsWith('__'))) {
      return <strong key={index} className="font-semibold">{part.slice(2, -2)}</strong>;
    }
    // Italic text *text* or _text_
    if ((part.startsWith('*') && part.endsWith('*') && !part.startsWith('**')) ||
        (part.startsWith('_') && part.endsWith('_') && !part.startsWith('__'))) {
      return <em key={index} className="italic">{part.slice(1, -1)}</em>;
    }
    // Inline code `text`
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code 
          key={index} 
          className="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded text-sm font-mono text-blue-600 dark:text-blue-400"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    // Strikethrough ~~text~~
    if (part.startsWith('~~') && part.endsWith('~~')) {
      return <del key={index} className="line-through">{part.slice(2, -2)}</del>;
    }
    // Regular text
    return part;
  });
};

interface TableRendererProps {
  content: string;
}

export function TableRenderer({ content }: TableRendererProps) {
  console.log('TableRenderer received content:', content);
  
  const renderContent = (text: string) => {
    // Split content into blocks (paragraphs and tables)
    const blocks = text.split(/\n\s*\n/);
    console.log('Split into blocks:', blocks);
    
    return blocks.map((block, blockIndex) => {
      // Check if block contains a table (has pipe characters)
      const lines = block.trim().split('\n');
              const hasTableStructure = lines.filter(line => line.includes('|')).length >= 2;
        console.log('Block', blockIndex, 'has table structure:', hasTableStructure, 'lines:', lines);
        
        if (hasTableStructure && lines.length >= 2) {
          console.log('Rendering table for block', blockIndex);
          return renderTable(block, blockIndex);
      } else {
        // Regular text block
        return (
          <div key={blockIndex} className="mb-4">
            {parseMarkdown(block)}
          </div>
        );
      }
    });
  };

  const renderTable = (tableBlock: string, blockIndex: number) => {
    const lines = tableBlock.trim().split('\n').filter(line => line.trim());
    
    // Find header line (first line with |)
    let headerIndex = lines.findIndex(line => line.includes('|'));
    if (headerIndex === -1) return null;
    
    // Find separator line (line with dashes) - if it exists
    let separatorIndex = lines.findIndex((line, index) => 
      index > headerIndex && line.includes('-') && line.includes('|')
    );
    
    let dataLines: string[];
    if (separatorIndex === -1) {
      // No separator found, treat all lines except first as data
      dataLines = lines.slice(headerIndex + 1).filter(line => line.includes('|'));
    } else {
      // Separator found, data is after separator
      dataLines = lines.slice(separatorIndex + 1).filter(line => line.includes('|'));
    }
    
    const headerLine = lines[headerIndex];
    
    // Parse header
    const headers = headerLine
      .split('|')
      .map(cell => cell.trim())
      .filter(cell => cell.length > 0);
    
    // Parse data rows
    const rows = dataLines.map(line => 
      line.split('|')
        .map(cell => cell.trim())
        .filter(cell => cell.length > 0)
    );
    
    if (headers.length === 0) return null;
    
    return (
      <div key={blockIndex} className="mb-6">
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 dark:border-gray-600 rounded-lg">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                {headers.map((header, index) => (
                  <th
                    key={index}
                    className="px-4 py-3 text-left text-sm font-medium text-gray-900 dark:text-gray-100 border-b border-gray-300 dark:border-gray-600"
                  >
                    {parseInlineMarkdown(header)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  {row.map((cell, cellIndex) => (
                    <td
                      key={cellIndex}
                      className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 border-r border-gray-200 dark:border-gray-600 last:border-r-0"
                    >
                      {parseInlineMarkdown(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {renderContent(content)}
    </div>
  );
} 