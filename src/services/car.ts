import { api } from "./api";
import { Car } from "@/types";

const extractData = (res: any) => res.data?.success !== undefined ? res.data.data : res.data;

export const carService = {
    getCars: () => api.get('/cars').then(extractData),
    getFavoriteCars: () => api.get('/cars/favorites').then(extractData),
    getCarsById: (id: string) => api.get(`/cars/${id}`).then(extractData),
    createCar: (car: Partial<Car>) => api.post('/cars', car).then(extractData),
    updateCar: (id: string, car: Partial<Car>) => api.patch(`/cars/${id}`, car).then(extractData),
    toggleFavorite: (id: string) => api.patch(`/cars/${id}/favorite`).then(extractData),
    deleteCar: (id: string) => api.delete(`/cars/${id}`).then(extractData),
    getRecentlyViewedCars: () => api.get('/cars/recently-viewed').then(extractData),
    getMostViewedCars: () => api.get('/cars/most-viewed').then(extractData),
    getTopRatedCars: () => api.get('/cars/top-rated').then(extractData),
    viewCar: (id: string) => api.patch(`/cars/${id}/view`).then(extractData),
    rateCar: (id: string, rating: number) => api.patch(`/cars/${id}/rating`, { rating }).then(extractData),
}