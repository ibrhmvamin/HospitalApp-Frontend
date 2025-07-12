import React, { useEffect, useState } from "react";

function Spinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <svg
        className="h-8 w-8 animate-spin text-blue-500"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v8H4z"
        />
      </svg>
    </div>
  );
}

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(
          "http://localhost:5274/api/appointment/appointments",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        setAppointments(data);
      } catch (err) {
        console.error("Failed to fetch appointments", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const badge = (status) => {
    const base =
      "inline-block px-2 py-0.5 rounded text-xs font-medium tracking-wide";
    if (status === "ACCEPTED") return `${base} bg-green-600/20 text-green-400`;
    if (status === "PENDING") return `${base} bg-yellow-600/20 text-yellow-400`;
    return `${base} bg-red-600/20 text-red-400`;
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6 text-white">
      <h1 className="text-3xl font-bold mb-8">All Appointments</h1>

      {/* loader */}
      {loading && <Spinner />}

      {/* empty‑state */}
      {!loading && appointments.length === 0 && (
        <p className="text-center text-gray-400">No appointments found.</p>
      )}

      {/* table */}
      {!loading && appointments.length > 0 && (
        <div className="overflow-x-auto rounded-lg shadow-lg ring-1 ring-gray-800/50">
          <table className="min-w-full divide-y divide-gray-800">
            <thead className="bg-gray-800 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Patient
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Doctor
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Start
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  End
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {appointments.map((a) => (
                <tr
                  key={a.id}
                  className="hover:bg-gray-800/60 transition-colors"
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    {a.patientName} {a.patientSurname}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {a.doctorName} {a.doctorSurname}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{a.startTime}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{a.endTime}</td>
                  <td className="px-4 py-3">
                    <span className={badge(a.status)}>{a.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
