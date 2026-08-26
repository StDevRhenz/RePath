import { useState } from "react";
import { Check, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { RecoveryCase } from "@/services/caseApi";
import { SectionHeading } from "@/components/recovery/workspace/SectionHeading";
import { uploadCaseDocument } from "@/services/documentApi";


type DocumentsSectionProps = {
  recoveryCase: RecoveryCase;
};

export function DocumentsSection({
  recoveryCase,
}: DocumentsSectionProps) {
  const [selectedDocuments, setSelectedDocuments] = useState<
    Record<string, File>
  >({});

  const [validatingDocuments, setValidatingDocuments] =
    useState(false);

  const [validatedDocuments, setValidatedDocuments] = useState<
    Record<string, boolean>
  >({});

  const [uploadingDocuments, setUploadingDocuments] = useState<
    Record<string, boolean>
  >({});

  async function handleDocumentSelect(
    documentName: string,
    file: File | undefined
  ) {
    if (!file) {
      return;
    }

    setSelectedDocuments((current) => ({
      ...current,
      [documentName]: file,
    }));

    setValidatedDocuments((current) => ({
      ...current,
      [documentName]: false,
    }));

    setUploadingDocuments((current) => ({
      ...current,
      [documentName]: true,
    }));

    try {
      const result = await uploadCaseDocument(
        recoveryCase.case_id,
        documentName,
        file
      );

      console.log("Uploaded document:", result);
    } catch (error) {
      console.error(error);

      setSelectedDocuments((current) => {
        const updated = { ...current };
        delete updated[documentName];
        return updated;
      });
    } finally {
      setUploadingDocuments((current) => ({
        ...current,
        [documentName]: false,
      }));
    }
  }

  function handleDocumentRemove(documentName: string) {
    setSelectedDocuments((current) => {
      const updated = { ...current };
      delete updated[documentName];

      return updated;
    });

    setValidatedDocuments((current) => {
      const updated = { ...current };
      delete updated[documentName];

      return updated;
    });
  }

  async function handleValidateDocuments() {
    const documentNames = Object.keys(selectedDocuments);

    if (documentNames.length === 0) {
      return;
    }

    setValidatingDocuments(true);

    // Mock validation for frontend development.
    await new Promise((resolve) => setTimeout(resolve, 1800));

    const results: Record<string, boolean> = {};

    documentNames.forEach((documentName) => {
      results[documentName] = true;
    });

    setValidatedDocuments((current) => ({
      ...current,
      ...results,
    }));

    setValidatingDocuments(false);
  }

  return (
    <div className="mt-12 max-w-4xl">
      <SectionHeading
        title="Documents"
        description="Review the documents that require attention before this application can continue."
      />

      <div className="mt-8 divide-y divide-zinc-200 border-y border-zinc-200">
        {recoveryCase.missing_documents.length > 0 ? (
          recoveryCase.missing_documents.map((document) => {
            const selectedFile = selectedDocuments[document];
            const isValidated = validatedDocuments[document];
            const isUploading = uploadingDocuments[document];
            
            return (
              <div key={document} className="py-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-zinc-200 bg-white">
                      <FileText
                        className="size-4 text-zinc-400"
                        strokeWidth={1.5}
                      />
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-normal text-zinc-900">
                        {document}
                      </p>

                      {selectedFile ? (
                        <p className="mt-1 truncate text-sm font-light text-zinc-500">
                          {selectedFile.name}
                        </p>
                      ) : (
                        <p className="mt-1 text-sm font-light text-zinc-500">
                          This document is required to continue your
                          recovery.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                    <span
                      className={`rounded-full border px-2.5 py-1 text-xs font-light ${
                        isValidated
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : selectedFile
                            ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                            : "border-zinc-200 bg-white text-zinc-500"
                      }`}
                    >
                      {isValidated
                        ? "Ready"
                        : isUploading
                          ? "Uploading..."
                          : selectedFile
                            ? "Uploaded"
                            : "Missing"}
                    </span>

                    <label className="cursor-pointer">
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.png,.jpg,.jpeg"
                        onChange={(event) =>
                          handleDocumentSelect(
                            document,
                            event.target.files?.[0]
                          )
                        }
                      />

                      <span className="inline-flex h-9 items-center rounded-md border border-zinc-200 bg-white px-3 text-sm font-normal text-zinc-700 transition-colors hover:bg-zinc-50">
                        {selectedFile ? "Replace" : "Add document"}
                      </span>
                    </label>

                    {selectedFile && (
                      <button
                        type="button"
                        onClick={() =>
                          handleDocumentRemove(document)
                        }
                        className="text-xs font-light text-zinc-400 transition-colors hover:text-zinc-700"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex items-center gap-3 py-6">
            <Check
              className="size-4 text-zinc-400"
              strokeWidth={1.5}
            />

            <p className="text-sm font-light text-zinc-500">
              No missing documents recorded.
            </p>
          </div>
        )}
      </div>

      {Object.keys(selectedDocuments).length > 0 && (
        <div className="mt-6 flex justify-end">
          <Button
            onClick={handleValidateDocuments}
            disabled={validatingDocuments}
            className="h-10 px-4 font-normal"
          >
            {validatingDocuments ? (
              "Validating..."
            ) : (
              <>
                Validate documents
                <Check className="size-4" />
              </>
            )}
          </Button>
        </div>
      )}

      {recoveryCase.missing_documents.length > 0 && (
        <p className="mt-4 text-xs font-light text-zinc-400">
          {recoveryCase.missing_documents.length}{" "}
          {recoveryCase.missing_documents.length === 1
            ? "document needs"
            : "documents need"}{" "}
          attention.
        </p>
      )}
    </div>
  );
}