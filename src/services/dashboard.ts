import { api } from "./api";
import { DashboardStatistics } from "@/types";

const extractData = (res: any) => res.data?.success !== undefined ? res.data.data : res.data;

export const dashboardService = {
    getStatistics: (): Promise<DashboardStatistics> => api.get('/dashboard/statistics').then(extractData),
}
