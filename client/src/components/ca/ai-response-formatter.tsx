import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertTriangle, Info } from "lucide-react";

interface AIResponseFormatterProps {
  response: string;
}

interface FormattedPart {
  type: 'text' | 'table';
  content?: string;
  headers?: string[];
  dataRows?: string[];
}

export default function AIResponseFormatter({ response }: AIResponseFormatterProps) {
  // Function to parse and format the AI response
  const formatResponse = (text: string) => {
    if (!text) return null;

    // First, let's try to extract and format tables from the entire text
    const tableRegex = /\|.*\|[\s\S]*?\|.*\|/g;
    const tables = [];
    let tableMatch;
    let lastIndex = 0;
    const formattedParts: FormattedPart[] = [];

    // Find all tables in the text
    while ((tableMatch = tableRegex.exec(text)) !== null) {
      // Add text before table
      if (tableMatch.index > lastIndex) {
        const beforeTable = text.slice(lastIndex, tableMatch.index).trim();
        if (beforeTable) {
          formattedParts.push({ type: 'text', content: beforeTable });
        }
      }

      // Process table
      const tableText = tableMatch[0];
      const tableLines = tableText.split('\n').filter(line => line.trim());
      
      if (tableLines.length >= 2) {
        const headers = tableLines[0].split('|').map(h => h.trim()).filter(h => h);
        const dataRows = tableLines.slice(1).filter(row => {
          const cells = row.split('|').map(c => c.trim());
          return cells.length === headers.length && !row.match(/^[\s\-|]+$/);
        });

        if (headers.length > 0 && dataRows.length > 0) {
          formattedParts.push({ 
            type: 'table', 
            headers, 
            dataRows 
          });
        } else {
          formattedParts.push({ type: 'text', content: tableText });
        }
      } else {
        formattedParts.push({ type: 'text', content: tableText });
      }

      lastIndex = tableMatch.index + tableMatch[0].length;
    }

    // Add remaining text after last table
    if (lastIndex < text.length) {
      const afterTable = text.slice(lastIndex).trim();
      if (afterTable) {
        formattedParts.push({ type: 'text', content: afterTable });
      }
    }

    // If no tables found, process as regular text
    if (formattedParts.length === 0) {
      const paragraphs = text.split(/\n\n+/);
      return paragraphs.map((paragraph, index) => {
        const trimmedParagraph = paragraph.trim();
        if (!trimmedParagraph) return null;
        return formatTextBlock(trimmedParagraph, index);
      });
    }

    // Process each part
    return formattedParts.map((part, index) => {
      if (part.type === 'table' && part.headers && part.dataRows) {
        return formatTable(part.headers, part.dataRows, index);
      } else if (part.type === 'text' && part.content) {
        const paragraphs = part.content.split(/\n\n+/);
        return paragraphs.map((paragraph, pIndex) => {
          const trimmedParagraph = paragraph.trim();
          if (!trimmedParagraph) return null;
          return formatTextBlock(trimmedParagraph, `${index}-${pIndex}`);
        });
      }
      return null;
    }).flat().filter(Boolean);
  };

  // Helper function to format text blocks
  const formatTextBlock = (text: string, index: string | number) => {
    // Handle headings (lines starting with #)
    if (text.match(/^#{1,6}\s/)) {
      const level = text.match(/^(#{1,6})\s/)?.[1]?.length || 1;
      const content = text.replace(/^#{1,6}\s/, '');
      const HeadingTag = `h${Math.min(level + 2, 6)}` as keyof JSX.IntrinsicElements;
      
      return (
        <HeadingTag 
          key={index}
          className={`font-bold text-gray-900 mb-4 ${
            level === 1 ? 'text-2xl' : 
            level === 2 ? 'text-xl' : 
            level === 3 ? 'text-lg' : 'text-base'
          }`}
        >
          {content}
        </HeadingTag>
      );
    }

    // Handle bold text sections (lines starting with **)
    if (text.match(/^\*\*\s/)) {
      const content = text.replace(/^\*\*\s/, '');
      return (
        <h3 key={index} className="font-bold text-lg text-gray-900 mb-3">
          {content}
        </h3>
      );
    }

    // Handle bullet points and lists
    if (text.includes('•') || text.match(/^\*\s/)) {
      const lines = text.split('\n').filter(line => line.trim());
      const listItems = lines.map(line => {
        const cleanLine = line.replace(/^[•*]\s*/, '').trim();
        return cleanLine;
      }).filter(item => item);

      return (
        <ul key={index} className="list-disc list-inside space-y-2 mb-4 text-gray-700">
          {listItems.map((item, itemIndex) => (
            <li key={itemIndex} className="text-sm">
              <span dangerouslySetInnerHTML={{ 
                __html: item
                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                  .replace(/\*(.*?)\*/g, '<em>$1</em>')
              }} />
            </li>
          ))}
        </ul>
      );
    }

    // Handle numbered lists
    if (text.match(/^\d+\./)) {
      const lines = text.split('\n').filter(line => line.trim());
      const listItems = lines.map(line => {
        const cleanLine = line.replace(/^\d+\.\s*/, '').trim();
        return cleanLine;
      }).filter(item => item);

      return (
        <ol key={index} className="list-decimal list-inside space-y-2 mb-4 text-gray-700">
          {listItems.map((item, itemIndex) => (
            <li key={itemIndex} className="text-sm">
              <span dangerouslySetInnerHTML={{ 
                __html: item
                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                  .replace(/\*(.*?)\*/g, '<em>$1</em>')
              }} />
            </li>
          ))}
        </ol>
      );
    }

    // Handle regular paragraphs with bold formatting
    const formattedText = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .split('\n')
      .map((line, lineIndex) => {
        if (line.trim()) {
          return (
            <p key={lineIndex} 
               className="mb-3 text-gray-700 text-sm leading-relaxed"
               dangerouslySetInnerHTML={{ __html: line }}
            />
          );
        }
        return null;
      });

    return (
      <div key={index} className="mb-4">
        {formattedText}
      </div>
    );
  };

  // Helper function to format tables
  const formatTable = (headers: string[], dataRows: string[], index: number) => {
    return (
      <div key={index} className="my-6 overflow-x-auto">
        <div className="bg-white rounded-lg border border-gray-300 shadow-sm">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gradient-to-r from-blue-50 to-indigo-50">
                {headers.map((header, hIndex) => (
                  <th key={hIndex} className="px-6 py-3 text-left text-sm font-semibold text-gray-700 border-b border-gray-300">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dataRows.map((row, rIndex) => {
                const cells = row.split('|').map(c => c.trim());
                return (
                  <tr key={rIndex} className={rIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50 hover:bg-gray-100 transition-colors'}>
                    {cells.map((cell, cIndex) => (
                      <td key={cIndex} className="px-6 py-3 text-sm text-gray-700 border-b border-gray-200">
                        <span dangerouslySetInnerHTML={{ 
                          __html: cell
                            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                            .replace(/\*(.*?)\*/g, '<em>$1</em>')
                        }} />
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
      <CardContent className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg shadow-sm">
            <Info className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-bold text-blue-900 text-lg">AI Legal & Tax Advice</h3>
            <p className="text-blue-700 text-sm">Expert guidance for your gemstone business</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-sm border border-blue-100">
          <div className="prose prose-sm max-w-none">
            {formatResponse(response)}
          </div>
        </div>

        <Alert className="mt-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800 text-xs">
            <strong>Disclaimer:</strong> This AI-generated advice is for general guidance only. 
            For specific legal matters, please consult a qualified Chartered Accountant or legal professional.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
