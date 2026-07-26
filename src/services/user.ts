import { api, extractData } from "./api";
import { User } from "@/types";

export const userService = {
  getUsers: (): Promise<User[]> => 
    api.get("/users").then(extractData),

  getUserById: (id: string): Promise<User> => 
    api.get(`/users/${id}`).then(extractData),

  createUser: (data: Partial<User>): Promise<User> => 
    api.post("/users", data).then(extractData),

  updateUser: (id: string, data: Partial<User>): Promise<User> => 
    api.patch(`/users/${id}`, data).then(extractData),

  deleteUser: (id: string): Promise<void> => 
    api.delete(`/users/${id}`).then(extractData),
};
