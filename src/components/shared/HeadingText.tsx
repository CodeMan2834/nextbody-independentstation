/** Optional phrase breaks preserve edited CMS copy and relax on small screens. */
const headingLines: Record<string, string[]> = {
  "BODY ASSESSMENT / DATA-DRIVEN INSIGHTS": ["BODY ASSESSMENT /", "DATA-DRIVEN INSIGHTS"],
  "Precision Body Assessment for Better Health Insights": ["Precision Body Assessment for", "Better Health Insights"],
  "From capture to a conversation people can act on.": ["From capture to a conversation", "people can act on."],
  "Discover the F20 Professional Foot Scanner in Action": ["Discover the F20 Professional", "Foot Scanner in Action"],
  "Professional Body Assessment, Gait Analysis & Foot Scanning Solutions": ["Professional Body Assessment,", "Gait Analysis & Foot Scanning Solutions"],
  "Real-World Applications of NEXBODY Assessment Solutions": ["Real-World Applications of", "NEXBODY Assessment Solutions"],
  "Professional Support. Every Step of the Way.": ["Professional Support.", "Every Step of the Way."],
  "Frequently Asked Questions About NEXBODY Solutions": ["Frequently Asked", "Questions About", "NEXBODY Solutions"],
  "Find the Right NEXBODY Solution for Your Business": ["Find the Right NEXBODY", "Solution for Your Business"],
  "Professional Body Assessment Solutions": ["Professional Body", "Assessment Solutions"],
  "Precision Assessment. Better Body Insights.": ["Precision Assessment.", "Better Body Insights."],
  "Precision Gait Analysis. Smarter Movement Insights": ["Precision Gait Analysis.", "Smarter Movement Insights"],
  "What does the system measure and support?": ["What does the system", "measure and support?"],
  "Professional Body Assessment Solutions for Fitness & Wellness": ["Professional Body Assessment", "Solutions for Fitness & Wellness"],
  "Pressure becomes a movement record.": ["Pressure becomes", "a movement record."],
};

export function HeadingText({ text }: { text: string }) {
  const lines = headingLines[text];
  if (!lines) return <>{text}</>;
  return <>{lines.map((line, index) => <span className="heading-phrase" key={line}>{index > 0 ? " " : ""}{line}</span>)}</>;
}

/** Keep a meaningful short phrase together without changing CMS content. */
export function KeepTogetherText({ text, phrase }: { text: string; phrase: string }) {
  const index = text.lastIndexOf(phrase);
  if (index < 0) return <>{text}</>;
  return <>{text.slice(0, index)}<span className="copy-keep-together">{phrase}</span>{text.slice(index + phrase.length)}</>;
}
