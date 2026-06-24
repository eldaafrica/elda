import { useCallback, useEffect, useState } from "react";
import { userService } from "@/services/userService";
import { User, InviteUserRequest, UpdateUserRequest, Role } from "@/types/user";


export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);

  const [loading, setLoading] = useState(true);

  // ================= LOAD =================

  const load = useCallback(async () => {
    try {
      setLoading(true);

      const data = await userService.findAll();

      setUsers(data ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // ================= INVITE =================

  const invite = async (
    payload: InviteUserRequest
  ) => {
    await userService.invite(payload);

    await load();
  };

  // ================= UPDATE =================

  const update = async (
    id: string,
    payload: UpdateUserRequest
  ) => {
    await userService.update(id, payload);

    await load();
  };

  // ================= ENABLE =================

  const enable = async (id: string) => {
    await userService.enable(id);

    await load();
  };

  // ================= DISABLE =================

  const disable = async (id: string) => {
    await userService.disable(id);

    await load();
  };

  // ================= TOGGLE =================

  const toggleStatus = async (id: string) => {
    await userService.toggle(id);

    await load();
  };

  // ================= UPDATE ROLES =================

  const updateRoles = async (
    id: string,
    roles: Role[]
  ) => {
    await userService.updateRoles(id, roles);

    await load();
  };

  // ================= DELETE =================

  const remove = async (id: string) => {
    await userService.remove(id);

    await load();
  };

  return {
    users,
    loading,

    reload: load,

    invite,
    update,

    enable,
    disable,
    toggleStatus,

    updateRoles,

    remove,
  };
}