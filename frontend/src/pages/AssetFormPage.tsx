import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { apiClient } from "../api";

const categories = [
  { value: "pc", label: "台式机" },
  { value: "server", label: "服务器" },
  { value: "switch", label: "交换机" },
  { value: "router", label: "路由器" },
  { value: "firewall", label: "防火墙" },
  { value: "ap", label: "无线AP" }
];

const statuses = [
  { value: "in_use", label: "在用" },
  { value: "spare", label: "备用" },
  { value: "repair", label: "维修" },
  { value: "retired", label: "报废" }
];

type AssetFormValues = {
  asset_code: string;
  category: string;
  brand: string;
  model: string;
  serial_number: string;
  location: string;
  owner_dept: string;
  ip_address: string;
  mac_address: string;
  os_or_firmware: string;
  status: string;
  note: string;
};

const defaultValues: AssetFormValues = {
  asset_code: "",
  category: "pc",
  brand: "",
  model: "",
  serial_number: "",
  location: "",
  owner_dept: "",
  ip_address: "",
  mac_address: "",
  os_or_firmware: "",
  status: "in_use",
  note: ""
};

export const AssetFormPage: React.FC<{ mode: "create" | "edit" }> = ({ mode }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [values, setValues] = useState<AssetFormValues>(defaultValues);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (mode === "edit" && id) {
      apiClient.get(`/api/assets/${id}`).then((response) => {
        const data = response.data as Partial<AssetFormValues>;
        setValues({
          asset_code: data.asset_code ?? "",
          category: data.category ?? "pc",
          brand: data.brand ?? "",
          model: data.model ?? "",
          serial_number: data.serial_number ?? "",
          location: data.location ?? "",
          owner_dept: data.owner_dept ?? "",
          ip_address: data.ip_address ?? "",
          mac_address: data.mac_address ?? "",
          os_or_firmware: data.os_or_firmware ?? "",
          status: data.status ?? "in_use",
          note: data.note ?? ""
        });
      });
    } else {
      setValues(defaultValues);
    }
  }, [id, mode]);

  const handleChange = (key: keyof AssetFormValues, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (mode === "create") {
        await apiClient.post("/api/assets", values);
      } else if (id) {
        await apiClient.put(`/api/assets/${id}`, values);
      }
      navigate("/assets");
    } catch (err: any) {
      setError(err?.response?.data?.detail || "保存失败");
    } finally {
      setLoading(false);
    }
  };

  const title = mode === "create" ? "新增资产" : "编辑资产";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
        <button className="text-sm text-blue-600" onClick={() => navigate(-1)}>
          返回
        </button>
      </div>

      <form className="grid gap-4 rounded-lg bg-white p-6 shadow-sm" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-xs font-semibold text-slate-500">资产编号</label>
            <input
              value={values.asset_code}
              onChange={(e) => handleChange("asset_code", e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500">类别</label>
            <select
              value={values.category}
              onChange={(e) => handleChange("category", e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {categories.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500">品牌</label>
            <input
              value={values.brand}
              onChange={(e) => handleChange("brand", e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500">型号</label>
            <input
              value={values.model}
              onChange={(e) => handleChange("model", e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500">序列号</label>
            <input
              value={values.serial_number}
              onChange={(e) => handleChange("serial_number", e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500">安装位置</label>
            <input
              value={values.location}
              onChange={(e) => handleChange("location", e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500">责任部门</label>
            <input
              value={values.owner_dept}
              onChange={(e) => handleChange("owner_dept", e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500">IP 地址</label>
            <input
              value={values.ip_address}
              onChange={(e) => handleChange("ip_address", e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500">MAC 地址</label>
            <input
              value={values.mac_address}
              onChange={(e) => handleChange("mac_address", e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500">操作系统 / 固件版本</label>
            <input
              value={values.os_or_firmware}
              onChange={(e) => handleChange("os_or_firmware", e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500">状态</label>
            <select
              value={values.status}
              onChange={(e) => handleChange("status", e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {statuses.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500">备注</label>
          <textarea
            value={values.note}
            onChange={(e) => handleChange("note", e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            rows={4}
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
            onClick={() => navigate(-1)}
          >
            取消
          </button>
          <button
            type="submit"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:bg-blue-300"
            disabled={loading}
          >
            保存
          </button>
        </div>
      </form>
    </div>
  );
};
