import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import toast from "react-hot-toast";
import useAuthStore from "../zustand/authStore";
import formatDate from "./../utils/formatDate";

export default function AdminUserManagement() {
  const { token, logout } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) return navigate("/login");

    const decoded = jwtDecode(token);
    const role =
      decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
    if (role !== "admin") return navigate("/");
  }, [token, navigate]);

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const [roleFilter, setRoleFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const API = "http://localhost:5274/api";
  const fetchJson = async (url) =>
    (
      await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
    ).json();

  const loadData = async () => {
    setLoading(true);
    try {
      const [doctors, clients] = await Promise.all([
        fetchJson(`${API}/user/doctors`),
        fetchJson(`${API}/user/patients`),
      ]);

      const normalize = (arr, role) => arr.map((u) => ({ ...u, role }));

      setRecords([
        ...normalize(doctors, "DOCTOR"),
        ...normalize(clients, "CLIENT"),
      ]);
    } catch (e) {
      toast.error("Failed to load data");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    console.log("records :>> ", records);
  }, []);

  const banUser = async (id, hours) => {
    const until = hours
      ? `?until=${new Date(Date.now() + hours * 3600 * 1000).toISOString()}`
      : "";
    await fetch(`${API}/user/ban/${id}${until}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    });
    loadData();
  };

  const unbanUser = async (userId) => {
    try {
      await fetch(`http://localhost:5274/api/user/unban/${userId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      loadData();
    } catch (err) {
      console.error("Unban failed:", err);
    }
  };

  const filtered = useMemo(() => {
    return records
      .filter((r) => (roleFilter === "ALL" ? true : r.role === roleFilter))
      .filter((r) =>
        [r.name, r.surname, r.email]
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase())
      );
  }, [records, roleFilter, search]);

  if (loading) return <p className="p-8 text-center">Loading…</p>;

  return (
    <div className="p-8 min-h-screen bg-gray-900 text-white">
      {/* header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">User Management</h1>
      </div>

      {/* filters */}
      <div className="flex flex-col md:flex-row md:items-end gap-4 mb-6">
        <div className="flex gap-2">
          {["ALL", "DOCTOR", "CLIENT"].map((opt) => (
            <button
              key={opt}
              onClick={() => setRoleFilter(opt)}
              className={`px-3 py-1 rounded ${
                roleFilter === opt ? "bg-blue-600" : "bg-gray-700"
              } hover:bg-blue-500`}
            >
              {opt[0] + opt.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        <input
          placeholder="Search…"
          className="flex-1 px-3 py-2 rounded bg-gray-800 outline-none"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left whitespace-nowrap">
          <thead>
            <tr className="border-b border-gray-700 text-sm uppercase">
              <th className="p-2">Name</th>
              <th className="p-2">Email</th>
              <th className="p-2">Role</th>
              <th className="p-2">Status</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id} className="border-b border-gray-800">
                <td className="p-2">
                  {u.name} {u.surname}
                </td>
                <td className="p-2">{u.email}</td>
                <td className="p-2">{u.role}</td>
                <td className="p-2">
                  {!u.isBanned && (
                    <span className="text-green-600 font-semibold">Active</span>
                  )}

                  {u.isBanned && u.bannedUntil === null && (
                    <span className="text-red-500 font-semibold">
                      Permanently Banned
                    </span>
                  )}

                  {u.isBanned && u.bannedUntil !== null && (
                    <span className="text-yellow-400 font-semibold">
                      Banned until {formatDate(u.bannedUntil).date}{" "}
                      {formatDate(u.bannedUntil).time}
                    </span>
                  )}
                </td>

                <td className="p-2 space-x-2">
                  {!u.isBanned ? (
                    <>
                      <button
                        onClick={() => banUser(u.id, 24)}
                        className="bg-yellow-500 hover:bg-yellow-600 px-3 py-1 rounded text-sm"
                      >
                        24h Ban
                      </button>
                      <button
                        onClick={() => banUser(u.id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                      >
                        Permanent Ban
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => unbanUser(u.id)}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                    >
                      Unban
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center py-6">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
