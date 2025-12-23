import { useState } from "react"
import type { BibleReference, Translation } from "../../types/verse"
import { Modal, ModalHeader, ModalTitle, ModalContent } from "../ui/modal"
import { useVerseQuery } from "../../hooks/useVerseQuery"
import { formatReference } from "../../lib/verse-parser"
import { TranslationTabs } from "./TranslationTabs"
import { VerseDisplay } from "./VerseDisplay"

/**
 * Props for VerseModal component.
 */
export interface VerseModalProps {
  /** The Bible reference to display (null when closed) */
  reference: BibleReference | null
  /** Whether the modal is open */
  isOpen: boolean
  /** Callback to close the modal */
  onClose: () => void
}

/**
 * Full-screen modal for displaying Bible verses.
 * Features translation tabs, loading states, and error handling.
 * 
 * Mobile: Displays as bottom sheet
 * Desktop: Centered modal with max width
 * 
 * @example
 * <VerseModal
 *   reference={selectedVerse}
 *   isOpen={isModalOpen}
 *   onClose={() => setSelectedVerse(null)}
 * />
 */
export function VerseModal({ reference, isOpen, onClose }: VerseModalProps) {
  const [translation, setTranslation] = useState<Translation>("NIV")
  
  // Query verses for current translation
  const { data, isLoading, error, refetch } = useVerseQuery(
    reference,
    translation,
    { enabled: isOpen }
  )
  
  // Reset translation when modal closes and reopens
  const handleClose = () => {
    setTranslation("NIV")
    onClose()
  }
  
  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <ModalHeader showCloseButton onClose={handleClose}>
        <ModalTitle>
          {reference ? formatReference(reference) : ""}
        </ModalTitle>
      </ModalHeader>
      
      <ModalContent>
        <TranslationTabs
          activeTranslation={translation}
          onTranslationChange={setTranslation}
        >
          {() => (
            <VerseDisplay
              verses={data?.verses}
              copyright={data?.copyright}
              isLoading={isLoading}
              error={error}
              onRetry={() => refetch()}
            />
          )}
        </TranslationTabs>
      </ModalContent>
    </Modal>
  )
}
