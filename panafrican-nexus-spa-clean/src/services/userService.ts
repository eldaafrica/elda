
import { User, InviteUserRequest, UpdateUserRequest, Role } from "@/types/user";
import { http } from "./http";

const BASE = "/users";

export const userService = {
  // ================= LIST =================
  async findAll(): Promise<User[]> {
    const { data } = await http.get<User[]>(BASE);
    return data;
  },

  // ================= ONE =================
  async findById(id: string): Promise<User> {
    const { data } = await http.get<User>(`${BASE}/${id}`);
    return data;
  },

  // ================= INVITE =================
  async invite(payload: InviteUserRequest): Promise<User> {
    const { data } = await http.post<User>(`${BASE}/invite`, payload);
    return data;
  },

  // ================= UPDATE BASIC INFO =================
  async update(id: string, payload: UpdateUserRequest): Promise<User> {
    const { data } = await http.patch<User>(`${BASE}/${id}`, payload);
    return data;
  },

  // ================= UPDATE ROLES =================
  async updateRoles(id: string, roles: Role[]): Promise<User> {
    const { data } = await http.patch<User>(`${BASE}/${id}/roles`, {
      roles,
    });
    return data;
  },

  // ================= ENABLE =================
  async enable(id: string): Promise<User> {
    const { data } = await http.patch<User>(`${BASE}/${id}/enable`);
    return data;
  },

  // ================= DISABLE =================
  async disable(id: string): Promise<User> {
    const { data } = await http.patch<User>(`${BASE}/${id}/disable`);
    return data;
  },

  // ================= TOGGLE =================
  async toggle(id: string): Promise<User> {
    const { data } = await http.patch<User>(`${BASE}/${id}/toggle`);
    return data;
  },

  // ================= DELETE =================
  async remove(id: string): Promise<void> {
    await http.delete(`${BASE}/${id}`);
  },
};
