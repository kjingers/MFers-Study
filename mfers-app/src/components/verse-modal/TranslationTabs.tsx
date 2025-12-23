import type { Translation } from "../../types/verse"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs"
import type { ReactNode } from "react"

/**
 * Available Bible translations.
 */
const TRANSLATIONS: Translation[] = ["NIV", "KJV", "MSG", "ESV"]

/**
 * Props for TranslationTabs component.
 */
export interface TranslationTabsProps {
  /** Currently active translation */
  activeTranslation: Translation
  /** Callback when translation changes */
  onTranslationChange: (translation: Translation) => void
  /** Render function for tab content */
  children: (translation: Translation) => ReactNode
}

/**
 * Translation tabs for switching between Bible versions.
 * Uses the base Tabs component with translation-specific labels.
 * 
 * @example
 * <TranslationTabs
 *   activeTranslation={translation}
 *   onTranslationChange={setTranslation}
 * >
 *   {(t) => <VerseDisplay translation={t} />}
 * </TranslationTabs>
 */
export function TranslationTabs({
  activeTranslation,
  onTranslationChange,
  children,
}: TranslationTabsProps) {
  return (
    <Tabs
      value={activeTranslation}
      onValueChange={(value) => onTranslationChange(value as Translation)}
    >
      <TabsList className="grid grid-cols-4 w-full">
        {TRANSLATIONS.map((translation) => (
          <TabsTrigger key={translation} value={translation}>
            {translation}
          </TabsTrigger>
        ))}
      </TabsList>
      
      {TRANSLATIONS.map((translation) => (
        <TabsContent key={translation} value={translation} className="mt-4">
          {children(translation)}
        </TabsContent>
      ))}
    </Tabs>
  )
}
