import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { apiClient } from "../api";
import { useAuth } from "../context/AuthContext";

type Asset = {
  id: number;
  asset_code: string;
  category: string;
  brand?: string;
  model?: string;
  location?: string;
  status: string;
  ip_address?: string;
  owner_dept?: string;
};

type FilterState = {
  asset_code: string;
  ip_address: string;
  category: string;
  status: string;
};

const categoryOptions = [
  { label: "全部", value: "" },
  { label: "台式机", value: "pc" },
  { label: "服务器", value: "server" },
  { label: "交换机", value: "switch" },
  { label: "路由器", value: "router" },
  { label: "防火墙", value: "firewall" },
  { label: "无线AP", value: "ap" }
];

const statusOptions = [
  { label: "全部", value: "" },
  { label: "在用", value: "in_use" },
  { label: "备用", value: "spare" },
  { label: "维修", value: "repair" },
  { label: "报废", value: "retired" }
];

const categoryLabelMap: Record<string, string> = Object.fromEntries(
  categoryOptions.filter((item) => item.value).map((item) => [item.value, item.label])
);
const statusLabelMap: Record<string, string> = Object.fromEntries(
  statusOptions.filter((item) => item.value).map((item) => [item.value, item.label])
);

export const AssetsPage: React.FC = () => {
  const { user } = useAuth();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [filters, setFilters] = useState<FilterState>({ asset_code: "", ip_address: "", category: "", status: "" });
  const [loading, setLoading] = useState(false);

  const canCreate = user?.role.can_create_asset;
  const canUpdate = user?.role.can_update_asset;
  const canDelete = user?.role.can_delete_asset;

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get("/api/assets", { params: filters });
      setAssets(response.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("确认删除该资产？")) return;
    await apiClient.delete(`/api/assets/${id}`);
    fetchAssets();
  };

  const tableRows = useMemo(
    () =>
      assets.map((asset) => (
        <tr key={asset.id} className="border-b border-slate-200">
          <td className="px-4 py-3 text-sm">{asset.asset_code}</td>
          <td className="px-4 py-3 text-sm">{categoryLabelMap[asset.category] ?? asset.category}</td>
          <td className="px-4 py-3 text-sm">{[asset.brand, asset.model].filter(Boolean).join(" / ")}</td>
          <td className="px-4 py-3 text-sm">{asset.ip_address || "-"}</td>
          <td className="px-4 py-3 text-sm">{asset.location || "-"}</td>
          <td className="px-4 py-3 text-sm">{statusLabelMap[asset.status] ?? asset.status}</td>
          <td className="px-4 py-3 text-sm">
            <div className="flex items-center gap-3">
              {canUpdate && (
                <Link className="text-blue-600 hover:underline" to={`/assets/${asset.id}`}>
                  编辑
                </Link>
              )}
              {canDelete && (
                <button className="text-red-600 hover:underline" onClick={() => handleDelete(asset.id)}>
                  删除
                </button>
              )}
            </div>
          </td>
        </tr>
      )),
    [assets, canDelete, canUpdate]
  );

  const cards = useMemo(
    () =>
      assets.map((asset) => (
        <div key={asset.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex justify-between">
            <div>
              <h3 className="text-base font-semibold text-slate-800">{asset.asset_code}</h3>
              <p className="text-sm text-slate-500">类别：{categoryLabelMap[asset.category] ?? asset.category}</p>
            </div>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">
              {statusLabelMap[asset.status] ?? asset.status}
            </span>
          </div>
          <div className="mt-3 space-y-2 text-sm text-slate-600">
            <p>品牌 / 型号：{[asset.brand, asset.model].filter(Boolean).join(" / ") || "-"}</p>
            <p>IP地址：{asset.ip_address || "-"}</p>
            <p>安装位置：{asset.location || "-"}</p>
            <p>责任部门：{asset.owner_dept || "-"}</p>
          </div>
          <div className="mt-4 flex justify-end gap-3 text-sm">
            {canUpdate && (
              <Link className="text-blue-600" to={`/assets/${asset.id}`}>
                编辑
              </Link>
            )}
            {canDelete && (
              <button className="text-red-600" onClick={() => handleDelete(asset.id)}>
                删除
              </button>
            )}
          </div>
        </div>
      )),
    [assets, canDelete, canUpdate]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <h1 className="text-2xl font-bold text-slate-800">资产列表</h1>
        {canCreate && (
          <Link
            to="/assets/new"
            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            新增资产
          </Link>
        )}
      </div>

      <div className="grid gap-4 rounded-lg bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="text-xs font-semibold text-slate-500">资产编号</label>
          <input
            value={filters.asset_code}
            onChange={(e) => setFilters({ ...filters, asset_code: e.target.value })}
            className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="输入资产编号"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500">IP 地址</label>
          <input
            value={filters.ip_address}
            onChange={(e) => setFilters({ ...filters, ip_address: e.target.value })}
            className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="输入IP地址"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500">类别</label>
          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {categoryOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500">状态</label>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2 lg:col-span-4">
          <button
            onClick={fetchAssets}
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            查询
          </button>
        </div>
      </div>

      <div className="hidden overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm lg:block">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">资产编号</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">类别</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">品牌 / 型号</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">IP 地址</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">安装位置</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">状态</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">{tableRows}</tbody>
        </table>
        {loading && <p className="p-4 text-center text-sm text-slate-500">加载中...</p>}
        {!loading && assets.length === 0 && <p className="p-4 text-center text-sm text-slate-500">暂无数据</p>}
      </div>

      <div className="grid gap-4 lg:hidden">{cards}</div>
    </div>
  );
};
