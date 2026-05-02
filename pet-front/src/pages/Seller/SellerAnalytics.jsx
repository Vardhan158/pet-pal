import React, { useEffect, useState } from "react";
import axiosInstance from "../../api/utils/axiosInstance";
import toast from "react-hot-toast";
import {
  BarChart, Bar, CartesianGrid, XAxis, YAxis,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { TrendingUp, ShoppingBag, DollarSign, Award } from "lucide-react";

export default function SellerAnalytics() {
  const [analytics, setAnalytics] = useState({
    totalSales: 0, totalRevenue: 0, bestSelling: "—", monthlyData: [],
  });
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await axiosInstance.get("/sellers/analytics", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data) setAnalytics(res.data);
        else toast.error("Failed to load analytics data");
      } catch {
        toast.error("Error loading analytics data");
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, [token]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{
        background: "#fff", border: "1px solid #eef0f6",
        borderRadius: 12, padding: "10px 14px",
        boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
        fontFamily: "'Poppins', sans-serif", fontSize: "0.78rem",
      }}>
        <p style={{ fontWeight: 600, color: "#1a1a2e", marginBottom: 6 }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color, margin: "2px 0" }}>
            {p.name}: <strong>{p.name === "Revenue" ? `₹${p.value?.toLocaleString()}` : p.value}</strong>
          </p>
        ))}
      </div>
    );
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; }

        .sa-root { font-family: 'Poppins', sans-serif; }

        .sa-header { margin-bottom: 1.75rem; }
        .sa-title {
          display: flex; align-items: center; gap: 10px;
          font-size: 1.45rem; font-weight: 700;
          color: #1a1a2e; letter-spacing: -0.4px;
        }
        .sa-title-icon {
          width: 42px; height: 42px;
          background: linear-gradient(135deg, #f5a623, #f76b1c);
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .sa-subtitle { font-size: 0.82rem; color: #9499b0; margin-top: 4px; }

        /* ── Stat cards ── */
        .sa-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          margin-bottom: 1.75rem;
        }
        @media (max-width: 640px) { .sa-stats { grid-template-columns: 1fr; } }

        .sa-stat-card {
          background: #fff;
          border-radius: 18px;
          border: 1px solid #eef0f6;
          box-shadow: 0 4px 16px rgba(0,0,0,0.04);
          padding: 1.25rem 1.4rem;
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .sa-stat-icon {
          width: 46px; height: 46px;
          border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .sa-stat-label {
          font-size: 0.72rem; font-weight: 500;
          color: #9499b0; text-transform: uppercase;
          letter-spacing: 0.4px; margin-bottom: 3px;
        }
        .sa-stat-value {
          font-size: 1.45rem; font-weight: 700;
          color: #1a1a2e; letter-spacing: -0.5px;
          line-height: 1.1;
        }
        .sa-stat-value.sm { font-size: 1rem; }

        /* ── Chart card ── */
        .sa-chart-card {
          background: #fff;
          border-radius: 20px;
          border: 1px solid #eef0f6;
          box-shadow: 0 4px 24px rgba(0,0,0,0.05);
          padding: 1.5rem 1.75rem;
        }
        .sa-chart-header {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 1.25rem; flex-wrap: wrap; gap: 8px;
        }
        .sa-chart-title {
          font-size: 0.9rem; font-weight: 600; color: #1a1a2e;
        }
        .sa-chart-legend {
          display: flex; align-items: center; gap: 14px;
        }
        .sa-legend-dot {
          display: flex; align-items: center; gap: 5px;
          font-size: 0.72rem; color: #9499b0; font-weight: 500;
        }
        .sa-legend-dot span {
          width: 10px; height: 10px; border-radius: 3px;
        }

        /* ── Empty / Loading ── */
        .sa-empty {
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 3.5rem 1rem; text-align: center;
        }
        .sa-empty-icon {
          width: 52px; height: 52px;
          background: #f1f3f9; border-radius: 16px;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.4rem; margin-bottom: 0.75rem;
        }
        .sa-empty p { font-size: 0.85rem; color: #9499b0; font-weight: 500; }

        .sa-loading {
          text-align: center; padding: 3rem 1rem;
          font-size: 0.85rem; color: #9499b0;
          animation: sa-pulse 1.2s ease-in-out infinite;
        }
        @keyframes sa-pulse { 0%,100%{opacity:1} 50%{opacity:0.35} }
      `}</style>

      <div className="sa-root">
        {/* Header */}
        <div className="sa-header">
          <div className="sa-title">
            <div className="sa-title-icon">
              <TrendingUp size={20} color="#fff" />
            </div>
            Sales Analytics
          </div>
          <p className="sa-subtitle">Track your performance and monthly trends</p>
        </div>

        {loading ? (
          <p className="sa-loading">Loading analytics…</p>
        ) : analytics.monthlyData.length === 0 ? (
          <div className="sa-empty">
            <div className="sa-empty-icon">📉</div>
            <p>No analytics data yet — start selling to see your stats here.</p>
          </div>
        ) : (
          <>
            {/* Stat cards */}
            <div className="sa-stats">
              <div className="sa-stat-card">
                <div className="sa-stat-icon" style={{ background: "#fff0e0" }}>
                  <ShoppingBag size={20} color="#f76b1c" />
                </div>
                <div>
                  <p className="sa-stat-label">Total Sales</p>
                  <p className="sa-stat-value">{analytics.totalSales}</p>
                </div>
              </div>

              <div className="sa-stat-card">
                <div className="sa-stat-icon" style={{ background: "#e8f8f0" }}>
                  <DollarSign size={20} color="#1a8a56" />
                </div>
                <div>
                  <p className="sa-stat-label">Total Revenue</p>
                  <p className="sa-stat-value">₹{analytics.totalRevenue?.toLocaleString()}</p>
                </div>
              </div>

              <div className="sa-stat-card">
                <div className="sa-stat-icon" style={{ background: "#f0eeff" }}>
                  <Award size={20} color="#7c63f5" />
                </div>
                <div>
                  <p className="sa-stat-label">Top Product</p>
                  <p className={`sa-stat-value ${analytics.bestSelling?.length > 12 ? "sm" : ""}`}>
                    {analytics.bestSelling}
                  </p>
                </div>
              </div>
            </div>

            {/* Chart */}
            <div className="sa-chart-card">
              <div className="sa-chart-header">
                <p className="sa-chart-title">Monthly Sales & Revenue</p>
                <div className="sa-chart-legend">
                  <span className="sa-legend-dot">
                    <span style={{ background: "#f76b1c" }} /> Sales
                  </span>
                  <span className="sa-legend-dot">
                    <span style={{ background: "#1a8a56" }} /> Revenue
                  </span>
                </div>
              </div>

              <div style={{ height: 320, width: "100%" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={analytics.monthlyData}
                    barGap={4}
                    barCategoryGap="30%"
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f1f7" vertical={false} />
                    <XAxis
                      dataKey="month"
                      tick={{ fontFamily: "'Poppins', sans-serif", fontSize: 11, fill: "#9499b0" }}
                      axisLine={false} tickLine={false}
                    />
                    <YAxis
                      tick={{ fontFamily: "'Poppins', sans-serif", fontSize: 11, fill: "#9499b0" }}
                      axisLine={false} tickLine={false}
                      width={45}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(245,166,35,0.06)" }} />
                    <Bar dataKey="sales"   name="Sales"   fill="#f76b1c" radius={[6,6,0,0]} />
                    <Bar dataKey="revenue" name="Revenue" fill="#1a8a56" radius={[6,6,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}