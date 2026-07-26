import { Reservation } from "@/types";
import { api } from "./api";

export const reservationService = {
    getReservations: () => api.get('/reservations').then(res => res.data),
    getReservationById: (id: string) => api.get(`/reservations/${id}`).then(res => res.data),
    addReservation: (reservation: Partial<Reservation>) => api.post('/reservations', reservation).then(res => res.data),
    updateReservation: (id: string, reservation: Partial<Reservation>) => api.put(`/reservations/${id}`, reservation).then(res => res.data),
    deleteReservation: (id: string) => api.delete(`/reservations/${id}`).then(res => res.data),
}