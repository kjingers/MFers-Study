import { BookOpen } from "lucide-react";
import { parseTextWithReferences } from "../../lib/verse-parser";
import type { BibleReference } from "../../types/verse";
import { Card, CardContent } from "../ui/card";
import { SectionHeader } from "../ui/section-header";
import { VerseLink } from "./VerseLink";

/**
 * Props for ReadingContent component.
 */
export interface ReadingContentProps {
  /** The reading assignment text (may contain verse references) */
  text: string;
  /** Callback when a verse reference is clicked */
  onVerseClick: (reference: BibleReference) => void;
}

/**
 * Display reading assignment text with auto-detected verse links.
 * Parses text for Bible references and renders them as clickable VerseLink components.
 *
 * @example
 * <ReadingContent
 *   text="Read John 3:1-21 and discuss John 3:16"
 *   onVerseClick={(ref) => openVerseModal(ref)}
 * />
 */
export function ReadingContent({ text, onVerseClick }: ReadingContentProps) {
  const segments = parseTextWithReferences(text);

  return (
    <section className="mx-4 mt-6">
      <SectionHeader icon={BookOpen} title="This Week's Reading" />
      <Card>
        <CardContent className="pt-4">
          <p className="text-lg leading-relaxed">
            {segments.map((segment, index) =>
              segment.type === "text" ? (
                <span key={index}>{segment.content}</span>
              ) : (
                <VerseLink
                  key={index}
                  reference={segment.reference}
                  onClick={() => onVerseClick(segment.reference)}
                />
              )
            )}
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
