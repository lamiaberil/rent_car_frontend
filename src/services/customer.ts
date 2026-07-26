import { api, extractData } from "./api";
import { Customer } from "@/types";

export const customerService = {
    getCustomers: () => api.get('/customers').then(extractData),
    getCustomersById: (id: string) => api.get(`/customers/${id}`).then(extractData),
    addCustomer: (customerData: Partial<Customer>) => api.post('/customers', customerData).then(extractData),
}