"use client";

import { useEffect, useState } from "react";
import { Target04, X } from "@untitledui/icons";
import { Button as AriaButton, Dialog, DialogTrigger, Heading, Modal, ModalOverlay } from "react-aria-components";
import { Button } from "@/old/components/base/buttons/button";
import { Input } from "@/old/components/base/input/input";
import { TextArea } from "@/old/components/base/textarea/textarea";
import { createSkill } from "@/old/utils/skills-api";

type CreateSkillModalProps = {
  open: boolean;
  onClose: () => void;
  onSuccess?: (skillId: string) => void;
};

export function CreateSkillModal({ open, onClose, onSuccess }: CreateSkillModalProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<"mastery" | "objective">("mastery");
  const [prompt, setPrompt] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!open) {
      setName("");
      setType("mastery");
      setPrompt("");
      setError(null);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await createSkill({ name, type, prompt });
      onSuccess?.("");
      onClose();
    } catch (err) {
      console.error("Failed to create skill:", err);
      setError(err instanceof Error ? err.message : "Failed to create skill");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalOverlay
      isOpen={open}
      onOpenChange={(isOpen) => !isOpen && onClose()}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      isDismissable={!isSubmitting}
    >
      <Modal className="relative w-full max-w-lg rounded-xl bg-white p-6 shadow-lg outline-none">
        <Dialog className="outline-none">
          {({ close }) => (
            <>
              {/* Header */}
              <div className="mb-6 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-12 items-center justify-center rounded-lg border border-gray-200 bg-white shadow-sm">
                    <Target04 className="size-6 text-gray-700" />
                  </div>
                  <div>
                    <Heading className="text-lg font-semibold text-gray-900">Create New Skill</Heading>
                    <p className="text-sm text-gray-600">Add a new mastery skill or objective to track your progress</p>
                  </div>
                </div>
                <AriaButton
                  onPress={close}
                  className="flex size-9 items-center justify-center rounded-lg transition hover:bg-gray-100"
                  isDisabled={isSubmitting}
                >
                  <X className="size-5 text-gray-400" />
                </AriaButton>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Type Selection */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Type</label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setType("mastery")}
                      className={`flex-1 rounded-lg border px-4 py-3 text-left transition ${
                        type === "mastery"
                          ? "border-primary-600 bg-primary-50 ring-primary-600 ring-2 ring-offset-2"
                          : "border-gray-300 bg-white hover:bg-gray-50"
                      }`}
                    >
                      <div className="font-medium text-gray-900">Mastery Skill</div>
                      <div className="text-xs text-gray-600">5-stage progression path</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setType("objective")}
                      className={`flex-1 rounded-lg border px-4 py-3 text-left transition ${
                        type === "objective"
                          ? "border-primary-600 bg-primary-50 ring-primary-600 ring-2 ring-offset-2"
                          : "border-gray-300 bg-white hover:bg-gray-50"
                      }`}
                    >
                      <div className="font-medium text-gray-900">Objective</div>
                      <div className="text-xs text-gray-600">Single goal to achieve</div>
                    </button>
                  </div>
                </div>

                {/* Name Input */}
                <div>
                  <Input
                    label="Name"
                    placeholder={type === "mastery" ? "e.g., Full Stack Development" : "e.g., Build a Production SaaS App"}
                    value={name}
                    onChange={(value) => setName(value)}
                    isRequired
                    isDisabled={isSubmitting}
                  />
                </div>

                {/* AI Prompt */}
                <div>
                  <TextArea
                    label="AI Prompt"
                    placeholder={
                      type === "mastery"
                        ? "Describe the skill and what progression should look like..."
                        : "Describe the objective and what success looks like..."
                    }
                    value={prompt}
                    onChange={(value) => setPrompt(value)}
                    rows={6}
                    isRequired
                    isDisabled={isSubmitting}
                    textAreaClassName="min-h-[120px] resize-y"
                    hint="This prompt will be used to generate rubrics and criteria for tracking progress"
                  />
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-error-50 text-error-700 rounded-lg p-3 text-sm">
                    <strong>Error:</strong> {error}
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-2">
                  <Button color="secondary" onClick={close} isDisabled={isSubmitting}>
                    Cancel
                  </Button>
                  <Button type="submit" color="primary" isDisabled={isSubmitting || !name || !prompt}>
                    {isSubmitting ? "Creating..." : "Create"}
                  </Button>
                </div>
              </form>
            </>
          )}
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}
