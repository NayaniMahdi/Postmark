'use client';

import React, { useRef, useEffect, useState } from 'react';

interface EmailHtmlViewerProps {
  html: string;
  className?: string;
}

export const EmailHtmlViewer: React.FC<EmailHtmlViewerProps> = ({ html, className = '' }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState<number>(300);

  // Wrap HTML in a clean, isolated document that prevents styles from escaping to parent
  const wrappedHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <base target="_blank">
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 12px;
      font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      font-size: 13px;
      line-height: 1.5;
      color: #292B27;
      background-color: transparent;
      word-break: break-word;
      overflow-wrap: break-word;
    }
    img { max-width: 100% !important; height: auto !important; }
    table { max-width: 100% !important; }
    a { color: #4F46E5; text-decoration: underline; }
  </style>
</head>
<body>
  ${html}
</body>
</html>`;

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const updateHeight = () => {
      try {
        const doc = iframe.contentDocument || iframe.contentWindow?.document;
        if (doc && doc.body) {
          const scrollH = doc.body.scrollHeight || doc.documentElement.scrollHeight;
          if (scrollH > 50) {
            setHeight(Math.min(scrollH + 24, 800)); // Cap at 800px with inner scroll
          }
        }
      } catch {
        // Fallback if access restricted
      }
    };

    iframe.addEventListener('load', updateHeight);
    const timer = setTimeout(updateHeight, 250);

    return () => {
      iframe.removeEventListener('load', updateHeight);
      clearTimeout(timer);
    };
  }, [html]);

  return (
    <div className={`w-full overflow-hidden rounded-xl border border-[#E7E3DA]/60 bg-white/50 ${className}`}>
      <iframe
        ref={iframeRef}
        srcDoc={wrappedHtml}
        title="Email Content"
        sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox"
        style={{ width: '100%', height: `${height}px`, border: 'none', display: 'block' }}
      />
    </div>
  );
};
