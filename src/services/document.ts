import { api } from "./api";
import { Document } from "@/types";

export const documentService = {
    getDocuments: () => api.get('/documents').then(res => res.data),
    getDocumentsById: (id: string) => api.get(`/documents/${id}`).then(res => res.data),
    createDocument: (document: Partial<Document>) => api.post('/documents', document).then(res => res.data),
    updateDocument: (id: string, document: Partial<Document>) => api.put(`/documents/${id}`, document).then(res => res.data),
    deleteDocument: (id: string) => api.delete(`/documents/${id}`).then(res => res.data),
}
