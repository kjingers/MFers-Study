import { useState } from "react";
import { useFamilyStore } from "../../store/family";
import { Button } from "../ui/button";
import { Modal, ModalContent, ModalHeader, ModalTitle } from "../ui/modal";

/**
 * Family setup modal for first-time users.
 * Asks for family name and saves to local storage.
 * No close button - must enter a name to proceed.
 */
export function FamilyModal() {
  const { showSetupModal, setFamily, closeSetupModal, family } =
    useFamilyStore();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = name.trim();
    if (!trimmed) {
      setError("Please enter your family name");
      return;
    }

    if (trimmed.length < 2) {
      setError("Name must be at least 2 characters");
      return;
    }

    setFamily(trimmed);
    setName("");
    setError(null);
  };

  // Don't show if family is already set and modal wasn't explicitly opened
  const isOpen = showSetupModal || (!family && showSetupModal !== false);

  // For first-time setup (no family), don't allow closing
  const isFirstTimeSetup = !family;

  return (
    <Modal
      isOpen={isOpen}
      onClose={isFirstTimeSetup ? () => {} : closeSetupModal}
      titleId="family-modal-title"
    >
      <ModalHeader showCloseButton={!isFirstTimeSetup} onClose={closeSetupModal}>
        <ModalTitle>
          {isFirstTimeSetup ? "Welcome! 👋" : "Update Family Name"}
        </ModalTitle>
      </ModalHeader>

      <ModalContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {isFirstTimeSetup && (
            <p className="text-muted-foreground text-sm">
              Enter your family name to get started with the Bible study app.
              This helps everyone know who's attending each week.
            </p>
          )}

          <div className="space-y-2">
            <label
              htmlFor="family-name"
              className="block text-sm font-medium text-foreground"
            >
              Family Name
            </label>
            <input
              type="text"
              id="family-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError(null);
              }}
              placeholder="e.g., The Smith Family"
              className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              autoFocus
              autoComplete="off"
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          <div className="flex gap-2 pt-2">
            {!isFirstTimeSetup && (
              <Button
                type="button"
                variant="outline"
                onClick={closeSetupModal}
                className="flex-1"
              >
                Cancel
              </Button>
            )}
            <Button type="submit" className="flex-1">
              {isFirstTimeSetup ? "Get Started" : "Save"}
            </Button>
          </div>
        </form>
      </ModalContent>
    </Modal>
  );
}

/**
 * Small badge showing current family name with edit option.
 * Can be placed in header or settings.
 */
export function FamilyBadge() {
  const { family, openSetupModal } = useFamilyStore();

  if (!family) return null;

  return (
    <button
      onClick={openSetupModal}
      className="flex items-center gap-1.5 px-2 py-1 rounded-md text-sm bg-muted hover:bg-muted/80 transition-colors"
      aria-label={`Current family: ${family.name}. Click to edit.`}
    >
      <span className="text-muted-foreground">👨‍👩‍👧‍👦</span>
      <span className="font-medium truncate max-w-[120px]">{family.name}</span>
    </button>
  );
}
