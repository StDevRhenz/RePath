import { useState, type DragEvent } from "react";
import { Check, Download, Eye, FileText, UploadCloud } from "lucide-react";

import { Button } from "@/components/ui/button";
import type {
  CaseDocument,
  RecoveryCase,
} from "@/services/caseApi";
import { SectionHeading } from "@/components/recovery/workspace/SectionHeading";
import {
  removeCaseDocument,
  getCaseDocumentFile,
  MAX_DOCUMENT_SIZE_BYTES,
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
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [draggingDocument, setDraggingDocument] = useState<string | null>(null);
  const [openingDocuments, setOpeningDocuments] = useState<Record<string, boolean>>({});

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
  ].sort((firstName, secondName) => {
    const firstDocument = documentsByName.get(firstName);
    const secondDocument = documentsByName.get(secondName);

    return (
      getDocumentSortRank(firstDocument) -
      getDocumentSortRank(secondDocument)
    );
  });
  const hasActiveDocumentRequest =
    validatingDocuments ||
    Object.values(uploadingDocuments).some(Boolean) ||
    Object.values(removingDocuments).some(Boolean);

  async function handleDocumentSelect(
    documentName: string,
    file: File | undefined
  ) {
    if (!file || hasActiveDocumentRequest) {
      return;
    }

    const validationError = validateFile(file);
    if (validationError) {
      setRequestError(`${documentName}: ${validationError}`);
      return;
    }

    if (documentsByName.has(documentName) && !window.confirm(
      `Replace the current file for "${documentName}"?`
    )) {
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
    setUploadProgress((current) => ({ ...current, [documentName]: 0 }));

    try {
      const result = await uploadCaseDocument(
        recoveryCase.case_id,
        documentName,
        file,
        (progress) => setUploadProgress((current) => ({ ...current, [documentName]: progress }))
      );

      console.log("Uploaded document:", result);
      await onCaseUpdated();

      setSelectedDocuments((current) => {
        const updated = { ...current };
        delete updated[documentName];
        return updated;
      });
      setUploadProgress((current) => {
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

  function handleDrop(documentName: string, event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDraggingDocument(null);
    void handleDocumentSelect(documentName, event.dataTransfer.files[0]);
  }

  function previewFile(file: File) {
    const url = URL.createObjectURL(file);
    window.open(url, "_blank", "noopener,noreferrer");
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }

  function downloadFile(file: File) {
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url;
    link.download = file.name;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  async function handleExistingFileAction(documentName: string, action: "preview" | "download") {
    const previewWindow = action === "preview" ? window.open("about:blank", "_blank") : null;
    if (action === "preview" && !previewWindow) {
      setRequestError("Your browser blocked the preview window. Please allow pop-ups for RePath and try again.");
      return;
    }

    setOpeningDocuments((current) => ({ ...current, [documentName]: true }));
    setRequestError("");
    try {
      const blob = await getCaseDocumentFile(recoveryCase.case_id, documentName);
      const url = URL.createObjectURL(blob);
      if (action === "preview") {
        previewWindow!.opener = null;
        previewWindow!.location.href = url;
      } else {
        const link = document.createElement("a");
        link.href = url;
        link.download = documentsByName.get(documentName)?.original_file_name || documentName;
        link.click();
      }
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (error) {
      previewWindow?.close();
      setRequestError(getRequestErrorMessage(error));
    } finally {
      setOpeningDocuments((current) => ({ ...current, [documentName]: false }));
    }
  }

  async function handleDocumentRemove(documentName: string) {
    if (hasActiveDocumentRequest) {
      return;
    }

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
    if (documents.length === 0 || hasActiveDocumentRequest) {
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
            const isDocumentActionDisabled =
              Boolean(isUploading) ||
              Boolean(isRemoving) ||
              validatingDocuments;
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
            const rowClassName =
              caseDocument?.status === "valid"
                ? "py-5 opacity-70"
                : "py-5";
            const actionLabel = getDocumentActionLabel(
              caseDocument,
              Boolean(isUploading)
            );
            const progress = uploadProgress[documentName] ?? 0;
            const isOpening = openingDocuments[documentName];
            
            return (
              <div
                key={documentName}
                className={`${rowClassName} transition-colors ${draggingDocument === documentName ? "bg-indigo-50" : ""}`}
                onDragOver={(event) => {
                  event.preventDefault();
                  if (!isDocumentActionDisabled) setDraggingDocument(documentName);
                }}
                onDragLeave={() => setDraggingDocument((current) => current === documentName ? null : current)}
                onDrop={(event) => handleDrop(documentName, event)}
              >
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

                      {isUploading && (
                        <div className="mt-3 max-w-sm" aria-live="polite">
                          <div className="flex justify-between text-xs text-zinc-500">
                            <span>Uploading file...</span><span>{progress}%</span>
                          </div>
                          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-zinc-200">
                            <div className="h-full rounded-full bg-indigo-500 transition-[width]" style={{ width: `${progress}%` }} />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                    <span
                      className={`rounded-full border px-2.5 py-1 text-xs font-light ${statusClassName}`}
                    >
                      {statusLabel}
                    </span>

                    <label
                      htmlFor={`document-${documentName}`}
                      className={
                        isDocumentActionDisabled
                          ? "cursor-not-allowed opacity-50"
                            : "cursor-pointer"
                      }
                    >
                      <input
                        id={`document-${documentName}`}
                        type="file"
                        className="sr-only"
                        accept=".pdf,.png,.jpg,.jpeg"
                        disabled={isDocumentActionDisabled}
                        onChange={(event) => {
                          void handleDocumentSelect(documentName, event.target.files?.[0]);
                          event.currentTarget.value = "";
                        }}
                      />

                      <span className="inline-flex h-10 items-center rounded-md border border-zinc-200 bg-white px-3 text-sm font-normal text-zinc-700 transition-colors hover:bg-zinc-50 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2">
                        <UploadCloud className="mr-2 size-4" />{actionLabel}
                      </span>
                    </label>

                    {selectedFile && (
                      <>
                        <button type="button" aria-label={`Preview ${selectedFile.name}`} onClick={() => previewFile(selectedFile)} className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-900">
                          <Eye className="size-3.5" /> Preview
                        </button>
                        <button type="button" aria-label={`Download ${selectedFile.name}`} onClick={() => downloadFile(selectedFile)} className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-900">
                          <Download className="size-3.5" /> Download
                        </button>
                      </>
                    )}

                    {caseDocument && !selectedFile && (
                      <>
                        <button type="button" aria-label={`Preview ${displayFileName || documentName}`} disabled={isOpening} onClick={() => void handleExistingFileAction(documentName, "preview")} className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-900 disabled:opacity-50">
                          <Eye className="size-3.5" /> {isOpening ? "Opening..." : "Preview"}
                        </button>
                        <button type="button" aria-label={`Download ${displayFileName || documentName}`} disabled={isOpening} onClick={() => void handleExistingFileAction(documentName, "download")} className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-900 disabled:opacity-50">
                          <Download className="size-3.5" /> Download
                        </button>
                      </>
                    )}

                    {caseDocument && (
                      <button
                        type="button"
                        onClick={() =>
                          handleDocumentRemove(documentName)
                        }
                        disabled={isDocumentActionDisabled}
                        className="text-xs font-light text-zinc-400 transition-colors hover:text-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
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
              No documents are missing right now.
            </p>
          </div>
        )}
      </div>

      {requestError && (
        <p role="alert" className="mt-4 text-sm font-light text-red-600">
          {requestError}
        </p>
      )}

      <p className="mt-4 flex items-center gap-2 text-xs font-light text-zinc-400">
        <UploadCloud className="size-3.5" /> Drop a PDF, PNG, or JPG on a document row to upload it. Maximum size: {formatFileSize(MAX_DOCUMENT_SIZE_BYTES)}.
      </p>

      {documents.length > 0 && (
        <div className="mt-6 flex justify-end">
          <Button
            onClick={handleValidateDocuments}
            disabled={hasActiveDocumentRequest}
            className="h-10 px-4 font-normal"
          >
            {validatingDocuments ? (
              "Validating..."
            ) : (
              <>
                Check documents
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
    return "Checking...";
  }

  switch (document?.status) {
    case "valid":
      return "Accepted";

    case "needs_attention":
      return "Needs a fix";

    case "validating":
      return "Checking...";

    case "uploaded":
      return "Uploaded, needs check";

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

function getDocumentSortRank(document: CaseDocument | undefined) {
  switch (document?.status) {
    case undefined:
      return 0;

    case "needs_attention":
      return 1;

    case "uploaded":
      return 2;

    case "validating":
      return 3;

    case "valid":
      return 4;

    default:
      return 5;
  }
}

function getDocumentActionLabel(
  document: CaseDocument | undefined,
  isUploading: boolean
) {
  if (isUploading) {
    return "Uploading...";
  }

  if (!document) {
    return "Upload";
  }

  return "Replace";
}

function getRequestErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "We couldn't update this document. Please try again.";
}

function validateFile(file: File) {
  const allowedTypes = ["application/pdf", "image/png", "image/jpeg"];
  const allowedExtensions = [".pdf", ".png", ".jpg", ".jpeg"];
  const extension = `.${file.name.split(".").pop()?.toLowerCase() ?? ""}`;

  if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(extension)) {
    return "Use a PDF, PNG, or JPG file.";
  }
  if (file.size === 0) return "The selected file is empty.";
  if (file.size > MAX_DOCUMENT_SIZE_BYTES) {
    return `The file is too large. Maximum size is ${formatFileSize(MAX_DOCUMENT_SIZE_BYTES)}.`;
  }
  return "";
}

function formatFileSize(bytes: number) {
  return `${Math.round(bytes / (1024 * 1024))} MB`;
}
