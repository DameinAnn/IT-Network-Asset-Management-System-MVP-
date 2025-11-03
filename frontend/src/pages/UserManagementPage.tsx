import { FormEvent, useEffect, useMemo, useState } from "react";

import { apiClient } from "../api";
import { useAuth } from "../context/AuthContext";

type Role = {
  id: number;
  role_name: string;
  can_manage_users: boolean;
};

type User = {
  id: number;
  username: string;
  display_name?: string;
  dept?: string;
  is_active: boolean;
  role: Role;
};

type UserFormValues = {
  username: string;
  display_name: string;
  dept: string;
  role_id: number;
  password: string;
};

const defaultUserForm: UserFormValues = {
  username: "",
  display_name: "",
  dept: "",
  role_id: 0,
  password: ""
};

export const UserManagementPage: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [formValues, setFormValues] = useState<UserFormValues>(defaultUserForm);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canManageUsers = user?.role.can_manage_users;

  const fetchData = async () => {
    const [userRes, roleRes] = await Promise.all([
      apiClient.get<User[]>("/api/users"),
      apiClient.get<Role[]>("/api/users/roles")
    ]);
    setUsers(userRes.data);
    setRoles(roleRes.data);
    if (editingUserId) {
      const target = userRes.data.find((item) => item.id === editingUserId);
      if (target) {
        setFormValues({
          username: target.username,
          display_name: target.display_name ?? "",
          dept: target.dept ?? "",
          role_id: target.role.id,
          password: ""
        });
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!editingUserId && roles.length > 0 && !formValues.role_id) {
      setFormValues((prev) => ({ ...prev, role_id: roles[0].id }));
    }
  }, [roles, editingUserId, formValues.role_id]);

  const openCreateModal = () => {
    setEditingUserId(null);
    setFormValues({ ...defaultUserForm, role_id: roles[0]?.id ?? 0 });
    setError(null);
  };

  const openEditModal = (target: User) => {
    setEditingUserId(target.id);
    setFormValues({
      username: target.username,
      display_name: target.display_name ?? "",
      dept: target.dept ?? "",
      role_id: target.role.id,
      password: ""
    });
    setError(null);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      if (editingUserId) {
        const payload: Partial<UserFormValues> = { ...formValues };
        if (!payload.password) {
          delete payload.password;
        }
        await apiClient.put(`/api/users/${editingUserId}`, payload);
      } else {
        await apiClient.post("/api/users", formValues);
      }
      setFormValues(defaultUserForm);
      setEditingUserId(null);
      fetchData();
    } catch (err: any) {
      setError(err?.response?.data?.detail || "保存失败");
    }
  };

  const toggleActive = async (target: User) => {
    await apiClient.put(`/api/users/${target.id}`, { is_active: !target.is_active });
    fetchData();
  };

  const roleOptions = useMemo(() => roles.map((role) => ({ value: role.id, label: role.role_name })), [roles]);

  if (!canManageUsers) {
    return <p className="text-sm text-red-600">您无权访问此页面。</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">用户管理</h1>
        <button
          onClick={openCreateModal}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          新增用户
        </button>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">用户名</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">姓名</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">部门</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">角色</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">状态</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {users.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-3 text-sm">{item.username}</td>
                <td className="px-4 py-3 text-sm">{item.display_name || "-"}</td>
                <td className="px-4 py-3 text-sm">{item.dept || "-"}</td>
                <td className="px-4 py-3 text-sm">{item.role.role_name}</td>
                <td className="px-4 py-3 text-sm">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                      item.is_active ? "bg-green-50 text-green-600" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {item.is_active ? "启用" : "禁用"}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex items-center gap-3">
                    <button className="text-blue-600 hover:underline" onClick={() => openEditModal(item)}>
                      编辑
                    </button>
                    <button className="text-slate-600 hover:underline" onClick={() => toggleActive(item)}>
                      {item.is_active ? "禁用" : "启用"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && <p className="p-4 text-center text-sm text-slate-500">暂无用户</p>}
      </div>

      <div className="rounded-lg bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800">{editingUserId ? "编辑用户" : "新增用户"}</h2>
        <form className="mt-4 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <div>
            <label className="text-xs font-semibold text-slate-500">登录名</label>
            <input
              value={formValues.username}
              onChange={(e) => setFormValues({ ...formValues, username: e.target.value })}
              className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
              disabled={Boolean(editingUserId)}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500">姓名</label>
            <input
              value={formValues.display_name}
              onChange={(e) => setFormValues({ ...formValues, display_name: e.target.value })}
              className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500">部门</label>
            <input
              value={formValues.dept}
              onChange={(e) => setFormValues({ ...formValues, dept: e.target.value })}
              className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500">角色</label>
            <select
              value={formValues.role_id}
              onChange={(e) => setFormValues({ ...formValues, role_id: Number(e.target.value) })}
              className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            >
              <option value="" disabled>
                请选择角色
              </option>
              {roleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="text-xs font-semibold text-slate-500">初始密码</label>
            <input
              type="password"
              value={formValues.password}
              onChange={(e) => setFormValues({ ...formValues, password: e.target.value })}
              className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder={editingUserId ? "留空则不修改密码" : "请输入初始密码"}
              required={!editingUserId}
            />
          </div>
          {error && <p className="md:col-span-2 text-sm text-red-600">{error}</p>}
          <div className="md:col-span-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setEditingUserId(null);
                setFormValues(defaultUserForm);
              }}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              重置
            </button>
            <button type="submit" className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
