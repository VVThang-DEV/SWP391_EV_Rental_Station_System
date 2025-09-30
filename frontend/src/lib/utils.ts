import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Document storage utilities
export const DOCUMENT_STORAGE_KEY = "uploaded_documents";

export type DocumentType =
  | "driverLicense"
  | "driverLicenseBack"
  | "nationalId_front"
  | "nationalId_back";

export interface StoredDocument {
  name: string;
  size: number;
  type: string;
  lastModified: number;
  uploadedAt: string;
}

export const documentStorage = {
  getUploadedDocuments: (): Record<DocumentType, StoredDocument | null> => {
    try {
      const stored = localStorage.getItem(DOCUMENT_STORAGE_KEY);
      return stored
        ? JSON.parse(stored)
        : {
            driverLicense: null,
            driverLicenseBack: null,
            nationalId_front: null,
            nationalId_back: null,
          };
    } catch (error) {
      console.error("Error reading documents from localStorage:", error);
      return {
        driverLicense: null,
        driverLicenseBack: null,
        nationalId_front: null,
        nationalId_back: null,
      };
    }
  },

  saveDocument: (type: DocumentType, file: File): void => {
    try {
      const current = documentStorage.getUploadedDocuments();
      current[type] = {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
        uploadedAt: new Date().toISOString(),
      };
      localStorage.setItem(DOCUMENT_STORAGE_KEY, JSON.stringify(current));
    } catch (error) {
      console.error("Error saving document to localStorage:", error);
    }
  },

  removeDocument: (type: DocumentType): void => {
    try {
      const current = documentStorage.getUploadedDocuments();
      current[type] = null;
      localStorage.setItem(DOCUMENT_STORAGE_KEY, JSON.stringify(current));
    } catch (error) {
      console.error("Error removing document from localStorage:", error);
    }
  },

  clearAllDocuments: (): void => {
    try {
      localStorage.removeItem(DOCUMENT_STORAGE_KEY);
    } catch (error) {
      console.error("Error clearing documents from localStorage:", error);
    }
  },

  isProfileComplete: (): boolean => {
    const documents = documentStorage.getUploadedDocuments();
    return Object.values(documents).every((doc) => doc !== null);
  },
};
