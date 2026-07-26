import { api } from "./api";
import { Office } from "@/types";

export const officeService = {
    getOffices: () => api.get('/offices').then(res => res.data),
    getOfficeById: (id: string) => api.get(`/offices/${id}`).then(res => res.data),
    createOffice: (office: Partial<Office>) => api.post('/offices', office).then(res => res.data),
    updateOffice: (id: string, office: Partial<Office>) => api.put(`/offices/${id}`, office).then(res => res.data),
    deleteOffice: (id: string) => api.delete(`/offices/${id}`).then(res => res.data),
}