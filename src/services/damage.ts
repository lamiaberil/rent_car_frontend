import { api } from "./api";
import { Damage } from "@/types";

export const damageService = {
    getDamages: () => api.get('/damages').then(res => res.data),
    getDamageById: (id: string) => api.get(`/damages/${id}`).then(res => res.data),
    createDamage: (damage: Partial<Damage>) => api.post('/damages', damage).then(res => res.data),
    updateDamage: (id: string, damage: Partial<Damage>) => api.put(`/damages/${id}`, damage).then(res => res.data),
    deleteDamage: (id: string) => api.delete(`/damages/${id}`).then(res => res.data),
};
