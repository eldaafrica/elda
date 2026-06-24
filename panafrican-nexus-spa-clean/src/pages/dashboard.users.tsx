import { useMemo, useState } from "react";

import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useI18n } from "@/lib/i18n";
import { Plus, MoreHorizontal, Pencil, Trash2, UserCheck, UserX, Search } from "lucide-react";
import { InviteUserRequest, Role, User } from "@/types/user";
import { useUsers } from "@/hooks/useUsers";
import { UserFormDialog } from "@/components/ui/user_form";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

const roleStyles: Record<Role, string> = {
  ADMIN: "bg-primary/10 text-primary border-primary/25",
  EDITEUR: "bg-orange-500/10 text-orange-500 border-orange-500/25",
  LECTEUR: "bg-muted text-muted-foreground border-border",
};

function initials(name?: string) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function UsersPage() {
  const { t } = useI18n();

  const [q, setQ] = useState("");
  const [role, setRole] = useState<Role | "ALL">("ALL");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [loadingAction, setLoadingAction] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { users, loading, invite, update, remove, toggleStatus } = useUsers();

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        u.name?.toLowerCase().includes(q.toLowerCase()) ||
        u.email?.toLowerCase().includes(q.toLowerCase()) ||
        u.country?.toLowerCase().includes(q.toLowerCase());
      const matchRole = role === "ALL" || u.roles?.includes(role);
      return matchSearch && matchRole;
    });
  }, [users, q, role]);

  const openCreate = () => {
    setEditing(null);
    setOpen(true);
  };

  const openEdit = (user: User) => {
    setEditing(user);
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    await remove(id);
  };

  const handleToggle = async (id: string) => {
    await toggleStatus(id);
  };

  const handleSubmit = async (data: InviteUserRequest) => {
    try {
      setLoadingAction(true);
      if (editing) {
        await update(editing.id, {
          name: data.name,
          country: data.country,
          countryCode: data.countryCode,
        });
      } else {
        await invite(data);
      }
      setOpen(false);
      setEditing(null);
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <>
      <DashboardLayout
        title={t("dash.users.title")}
        subtitle={t("dash.users.lede")}
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-1" />
            {t("dash.users.invite")}
          </Button>
        }
      >
        {/* FILTERS */}
        <div className="mb-4 flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t("search.user")}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={role} onValueChange={(v) => setRole(v as Role | "ALL")}>
            <SelectTrigger className="w-full md:w-56">
              <SelectValue placeholder={t("filter.allRoles")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">{t("filter.allRoles")}</SelectItem>
              <SelectItem value="ADMIN">{t("role.ADMIN")}</SelectItem>
              <SelectItem value="EDITEUR">{t("role.EDITEUR")}</SelectItem>
              <SelectItem value="LECTEUR">{t("role.LECTEUR")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* TABLE */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-widest text-muted-foreground border-b border-border">
                <th className="px-4 py-3 font-medium">{t("dash.table.member")}</th>
                <th className="px-4 py-3 font-medium">{t("dash.table.email")}</th>
                <th className="px-4 py-3 font-medium">{t("dash.table.country")}</th>
                <th className="px-4 py-3 font-medium">{t("dash.table.role")}</th>
                <th className="px-4 py-3 font-medium">{t("dash.table.status")}</th>
                <th />
              </tr>
            </thead>

            <tbody className="divide-y divide-border">
              {loading && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                    {t("loading.users")}
                  </td>
                </tr>
              )}

              {!loading &&
                filtered.map((u) => {
                  const firstRole = u.roles?.[0] ?? "LECTEUR";
                  return (
                    <tr key={u.id} className="hover:bg-accent/40">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                            {initials(u.name)}
                          </div>
                          <div className="font-medium">{u.name}</div>
                        </div>
                      </td>

                      <td className="px-4 py-3 text-muted-foreground">{u.email}</td>

                      <td className="px-4 py-3 text-muted-foreground">{u.country}</td>

                      <td className="px-4 py-3">
                        <span
                          className={
                            "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium " +
                            roleStyles[firstRole]
                          }
                        >
                          {t(`role.${firstRole}` as any)}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            u.enabled
                              ? "bg-green-500/10 text-green-600"
                              : "bg-red-500/10 text-red-500"
                          }`}
                        >
                          {u.enabled ? t("user.status.active") : t("user.status.disabled")}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent">
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEdit(u)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              {t("common.edit")}
                            </DropdownMenuItem>

                            <DropdownMenuItem onClick={() => handleToggle(u.id)}>
                              {u.enabled ? (
                                <>
                                  <UserX className="h-4 w-4 mr-2 text-red-500" />
                                  {t("user.action.disable")}
                                </>
                              ) : (
                                <>
                                  <UserCheck className="h-4 w-4 mr-2 text-green-600" />
                                  {t("user.action.enable")}
                                </>
                              )}
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() => setDeleteId(u.id)}
                              className="text-red-500"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              {t("common.delete")}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}

              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                    {t("empty.users")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </DashboardLayout>

      <UserFormDialog
        open={open}
        onOpenChange={setOpen}
        onSubmit={handleSubmit}
        initial={editing}
        loading={loadingAction}
      />

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(v) => !v && setDeleteId(null)}
        title={t("dash.users.deleteTitle")}
        description={t("dash.users.deleteBody")}
        onConfirm={() => { handleDelete(deleteId!); setDeleteId(null); }}
      />
    </>
  );
}
