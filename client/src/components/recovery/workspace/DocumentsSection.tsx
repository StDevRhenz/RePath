import { useState } from "react";
import { Check, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import type {
  CaseDocument,
  RecoveryCase,
} from "@/services/caseApi";
import { SectionHeading } from "@/components/recovery/workspace/SectionHeading";
import {
  removeCaseDocument,
  uploadCaseDocument,
  validateCaseDocuments,
} from "@/services/documentApi";


type DocumentsSectionProps = {
  recoveryCase: RecoveryCase;
  onCaseUpdated: () => Promise<void>;
};

export function DocumentsSection({
  recoveryCase,
  onCaseUpdated,
}: DocumentsSectionProps) {
  const [selectedDocuments, setSelectedDocuments] = useState<
    Record<string, File>
  >({});

  const [validatingDocuments, setValidatingDocuments] =
    useState(false);

  const [uploadingDocuments, setUploadingDocuments] = useState<
    Record<string, boolean>
  >({});

  const [removingDocuments, setRemovingDocuments] = useState<
    Record<string, boolean>
  >({});

  const [requestError, setRequestError] = useState("");
  const documents = recoveryCase.documents ?? [];

  const documentsByName = new Map(
    documents.map((document) => [
      document.document_name,
      document,
    ])
  );

  const documentNames = [
    ...new Set([
      ...recoveryCase.missing_documents,
      ...documents.map(
        (document) => document.document_name
      ),
    ]),
  ];

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

    setRequestError("");

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
      await onCaseUpdated();

      setSelectedDocuments((current) => {
        const updated = { ...current };
        delete updated[documentName];
        return updated;
      });
    } catch (error) {
      console.error(error);
      setRequestError(getRequestErrorMessage(error));

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

  async function handleDocumentRemove(documentName: string) {
    setRequestError("");

    setRemovingDocuments((current) => ({
      ...current,
      [documentName]: true,
    }));

    try {
      await removeCaseDocument(recoveryCase.case_id, documentName);
      await onCaseUpdated();

      setSelectedDocuments((current) => {
        const updated = { ...current };
        delete updated[documentName];
        return updated;
      });
    } catch (error) {
      console.error(error);
      setRequestError(getRequestErrorMessage(error));
    } finally {
      setRemovingDocuments((current) => ({
        ...current,
        [documentName]: false,
      }));
    }
  }

  async function handleValidateDocuments() {
    if (documents.length === 0) {
      return;
    }

    setRequestError("");
    setValidatingDocuments(true);

    try {
      await validateCaseDocuments(recoveryCase.case_id);
      await onCaseUpdated();
    } catch (error) {
      console.error(error);
      setRequestError(getRequestErrorMessage(error));
    } finally {
      setValidatingDocuments(false);
    }
  }

  return (
    <div className="mt-12 max-w-4xl">
      <SectionHeading
        title="Documents"
        description="Review the documents that require attention before this application can continue."
      />

      <div className="mt-8 divide-y divide-zinc-200 border-y border-zinc-200">
        {documentNames.length > 0 ? (
          documentNames.map((documentName) => {
            const caseDocument =
              documentsByName.get(documentName);
            const selectedFile =
              selectedDocuments[documentName];
            const isUploading =
              uploadingDocuments[documentName];
            const isRemoving =
              removingDocuments[documentName];
            const isValidating =
              validatingDocuments &&
              caseDocument?.status === "uploaded";
            const displayFileName =
              selectedFile?.name ??
              caseDocument?.original_file_name;
            const statusLabel = getStatusLabel(
              caseDocument,
              Boolean(isUploading),
              Boolean(isValidating)
            );
            const statusClassName = getStatusClassName(
              caseDocument,
              Boolean(isUploading),
              Boolean(isValidating)
            );
            
            return (
              <div key={documentName} className="py-5">
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
                        {documentName}
                      </p>

                      {displayFileName ? (
                        <p className="mt-1 truncate text-sm font-light text-zinc-500">
                          {displayFileName}
                        </p>
                      ) : (
                        <p className="mt-1 text-sm font-light text-zinc-500">
                          This document is required to continue your
                          recovery.
                        </p>
                      )}

                      {caseDocument?.status === "needs_attention" &&
                        caseDocument.validation_message && (
                          <p className="mt-2 text-sm font-light text-amber-700">
                            {caseDocument.validation_message}
                          </p>
                        )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                    <span
                      className={`rounded-full border px-2.5 py-1 text-xs font-light ${statusClassName}`}
                    >
                      {statusLabel}
                    </span>

                    <label className="cursor-pointer">
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.png,.jpg,.jpeg"
                        disabled={Boolean(isUploading) || isRemoving}
                        onChange={(event) =>
                          handleDocumentSelect(
                            documentName,
                            event.target.files?.[0]
                          )
                        }
                      />

                      <span className="inline-flex h-9 items-center rounded-md border border-zinc-200 bg-white px-3 text-sm font-normal text-zinc-700 transition-colors hover:bg-zinc-50">
                        {caseDocument ? "Replace" : "Add document"}
                      </span>
                    </label>

                    {caseDocument && (
                      <button
                        type="button"
                        onClick={() =>
                          handleDocumentRemove(documentName)
                        }
                        disabled={isRemoving}
                        className="text-xs font-light text-zinc-400 transition-colors hover:text-zinc-700"
                      >
                        {isRemoving ? "Removing..." : "Remove"}
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

      {requestError && (
        <p className="mt-4 text-sm font-light text-red-600">
          {requestError}
        </p>
      )}

      {documents.length > 0 && (
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

function getStatusLabel(
  document: CaseDocument | undefined,
  isUploading: boolean,
  isValidating: boolean
) {
  if (isUploading) {
    return "Uploading...";
  }

  if (isValidating) {
    return "Validating...";
  }

  switch (document?.status) {
    case "valid":
      return "Ready";

    case "needs_attention":
      return "Needs Attention";

    case "validating":
      return "Validating...";

    case "uploaded":
      return "Uploaded";

    default:
      return "Missing";
  }
}

function getStatusClassName(
  document: CaseDocument | undefined,
  isUploading: boolean,
  isValidating: boolean
) {
  if (isUploading || isValidating || document?.status === "uploaded") {
    return "border-indigo-200 bg-indigo-50 text-indigo-700";
  }

  if (document?.status === "valid") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (document?.status === "needs_attention") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  return "border-zinc-200 bg-white text-zinc-500";
}

function getRequestErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Document request failed.";
}
