/*
Copyright 2026 The Sneakers-PAM Authors
SPDX-License-Identifier: Apache-2.0
*/
import "./marketing.css";

interface TerminalCardProps {
  title: string;
  lines: string[];
}

export const TerminalCard = ({ title, lines }: TerminalCardProps) => (
  <div className="terminal" role="img" aria-label={`Illustrative terminal output: ${title}`}>
    <div className="terminal__bar">
      <span className="terminal__dot" />
      <span className="terminal__dot" />
      <span className="terminal__dot" />
      <span className="terminal__title">{title}</span>
    </div>
    <pre className="terminal__body">
      <code>
        {lines.join("\n")}
        <span className="terminal__cursor" aria-hidden="true" />
      </code>
    </pre>
  </div>
);
