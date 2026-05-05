import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axiosInstance from "../../api/utils/axiosInstance";

export default function OfferManagement() {
  const [offer, setOffer]     = useState(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    message: "",
    code: "",
    discount: "",
    minOrderAmount: "",
    isActive: false,
  });

  const fetchOffer = async () => {
    try {
      const { data } = await axiosInstance.get("/offers");
      if (data.success && data.offer) {
        setOffer(data.offer);
        setFormData({
          message:        data.offer.message        || "",
          code:           data.offer.code           || "",
          discount:       data.offer.discount       || "",
          minOrderAmount: data.offer.minOrderAmount || "",
          isActive:       data.offer.isActive       || false,
        });
      } else {
        setOffer(null);
      }
    } catch {
      toast.error("Failed to load offer");
    }
  };

  useEffect(() => { fetchOffer(); }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axiosInstance.put("/offers/update", formData);
      if (data.success) {
        toast.success("Offer updated successfully!");
        fetchOffer();
      } else {
        toast.error("Failed to update offer");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Unauthorized or server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

        .om-root {
          font-family: 'Poppins', sans-serif;
          max-width: 640px;
          margin: 2.5rem auto;
          padding: 0 1.25rem;
        }

        /* ── Page header ── */
        .om-page-title {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 1.55rem;
          font-weight: 700;
          color: #1a1a2e;
          letter-spacing: -0.4px;
          margin-bottom: 0.25rem;
        }
        .om-page-title-icon {
          width: 42px; height: 42px;
          background: linear-gradient(135deg, #f5a623 0%, #f76b1c 100%);
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.1rem;
          flex-shrink: 0;
        }
        .om-page-subtitle {
          font-size: 0.82rem;
          color: #9499b0;
          margin-bottom: 1.75rem;
        }

        /* ── Active offer card ── */
        .om-offer-card {
          background: linear-gradient(135deg, #fff7ed 0%, #fff0e0 100%);
          border: 1px solid #f0e0c8;
          border-radius: 18px;
          padding: 1.25rem 1.5rem;
          margin-bottom: 1.75rem;
          position: relative;
          overflow: hidden;
        }
        .om-offer-card::before {
          content: '';
          position: absolute;
          top: -20px; right: -20px;
          width: 100px; height: 100px;
          background: rgba(247, 107, 28, 0.08);
          border-radius: 50%;
        }
        .om-offer-card-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 8px;
          margin-bottom: 0.75rem;
        }
        .om-offer-message {
          font-size: 0.95rem;
          font-weight: 600;
          color: #1a1a2e;
          flex: 1;
        }
        .om-offer-status {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 0.72rem;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 99px;
          flex-shrink: 0;
        }
        .om-offer-status.active   { background: #e6f9f0; color: #1a8a56; }
        .om-offer-status.inactive { background: #fde8e8; color: #c0392b; }
        .om-offer-status-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: currentColor;
        }
        .om-offer-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .om-offer-pill {
          display: flex;
          align-items: center;
          gap: 5px;
          background: #fff;
          border: 1px solid #edd9c0;
          border-radius: 10px;
          padding: 5px 12px;
          font-size: 0.8rem;
          color: #7a4010;
          font-weight: 500;
        }
        .om-offer-pill svg { width: 13px; height: 13px; fill: #f5a623; }

        /* ── Empty state ── */
        .om-empty {
          background: #f8f9fc;
          border: 1.5px dashed #e0e3ef;
          border-radius: 16px;
          padding: 1.5rem;
          text-align: center;
          margin-bottom: 1.75rem;
          font-size: 0.85rem;
          color: #9499b0;
        }

        /* ── Form card ── */
        .om-card {
          background: #fff;
          border-radius: 20px;
          border: 1px solid #eef0f6;
          box-shadow: 0 4px 24px rgba(0,0,0,0.05);
          padding: 1.75rem;
        }
        .om-card-title {
          font-size: 0.9rem;
          font-weight: 600;
          color: #1a1a2e;
          margin-bottom: 1.25rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid #f0f1f7;
        }

        /* ── Form grid ── */
        .om-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        .om-form-grid .span-2 { grid-column: span 2; }
        @media (max-width: 520px) {
          .om-form-grid { grid-template-columns: 1fr; }
          .om-form-grid .span-2 { grid-column: span 1; }
        }

        /* ── Input group ── */
        .om-input-group { display: flex; flex-direction: column; gap: 5px; }
        .om-label {
          font-size: 0.75rem;
          font-weight: 500;
          color: #4a4f68;
          letter-spacing: 0.3px;
        }
        .om-input {
          width: 100%;
          padding: 0.65rem 0.9rem;
          font-family: 'Poppins', sans-serif;
          font-size: 0.85rem;
          color: #1a1a2e;
          background: #f8f9fc;
          border: 1.5px solid #e8eaf0;
          border-radius: 11px;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
          box-sizing: border-box;
        }
        .om-input::placeholder { color: #b8bdd0; }
        .om-input:focus {
          border-color: #f5a623;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(245,166,35,0.12);
        }

        /* ── Toggle switch ── */
        .om-toggle-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #f8f9fc;
          border: 1.5px solid #e8eaf0;
          border-radius: 11px;
          padding: 0.65rem 0.9rem;
        }
        .om-toggle-label {
          font-size: 0.85rem;
          font-weight: 500;
          color: #4a4f68;
        }
        .om-toggle {
          position: relative;
          width: 40px; height: 22px;
          cursor: pointer;
        }
        .om-toggle input { opacity: 0; width: 0; height: 0; }
        .om-toggle-track {
          position: absolute;
          inset: 0;
          background: #e0e3ef;
          border-radius: 99px;
          transition: background 0.2s;
        }
        .om-toggle input:checked + .om-toggle-track { background: #f5a623; }
        .om-toggle-thumb {
          position: absolute;
          top: 3px; left: 3px;
          width: 16px; height: 16px;
          background: #fff;
          border-radius: 50%;
          box-shadow: 0 1px 3px rgba(0,0,0,0.18);
          transition: transform 0.2s;
        }
        .om-toggle input:checked ~ .om-toggle-thumb { transform: translateX(18px); }

        /* ── Submit button ── */
        .om-submit {
          width: 100%;
          padding: 0.8rem;
          font-family: 'Poppins', sans-serif;
          font-size: 0.9rem;
          font-weight: 600;
          color: #fff;
          background: linear-gradient(135deg, #f5a623 0%, #f76b1c 100%);
          border: none;
          border-radius: 12px;
          cursor: pointer;
          margin-top: 0.25rem;
          transition: opacity 0.2s, transform 0.15s;
          letter-spacing: 0.3px;
        }
        .om-submit:hover:not(:disabled) { opacity: 0.92; transform: translateY(-1px); }
        .om-submit:active:not(:disabled) { transform: translateY(0); }
        .om-submit:disabled { opacity: 0.6; cursor: not-allowed; }
      `}</style>

      <div className="om-root">
        {/* Page title */}
        <div className="om-page-title">
          <div className="om-page-title-icon">🏷️</div>
          Offer Management
        </div>
        <p className="om-page-subtitle">Create and manage promotional offers for your customers</p>

        {/* Active offer preview */}
        {offer ? (
          <div className="om-offer-card">
            <div className="om-offer-card-top">
              <p className="om-offer-message">{offer.message}</p>
              <span className={`om-offer-status ${offer.isActive ? "active" : "inactive"}`}>
                <span className="om-offer-status-dot" />
                {offer.isActive ? "Active" : "Inactive"}
              </span>
            </div>
            <div className="om-offer-pills">
              <span className="om-offer-pill">
                <svg viewBox="0 0 24 24"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg>
                {offer.discount}% off
              </span>
              <span className="om-offer-pill">
                <svg viewBox="0 0 24 24"><path d="M12.5 2H6a2 2 0 00-2 2v16l8-3 8 3V4a2 2 0 00-2-2h-5.5z"/></svg>
                {offer.code}
              </span>
              {offer.minOrderAmount && (
                <span className="om-offer-pill">
                  <svg viewBox="0 0 24 24"><path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM5.2 5H3V3H1v2h2l3.6 7.59L5.25 14C5.09 14.32 5 14.65 5 15c0 1.1.9 2 2 2h14v-2H7.42c-.13 0-.25-.11-.25-.25l.03-.12.9-1.63H19c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1 1 0 0023.45 4H5.21z"/></svg>
                  Min ₹{offer.minOrderAmount}
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="om-empty">
            No active offer found — create one using the form below.
          </div>
        )}

        {/* Form card */}
        <div className="om-card">
          <p className="om-card-title">{offer ? "Edit Offer" : "Create New Offer"}</p>

          <form onSubmit={handleSubmit}>
            <div className="om-form-grid">

              <div className="om-input-group span-2">
                <label className="om-label">Offer Message</label>
                <input
                  className="om-input"
                  type="text"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="e.g. Get 20% off on orders above ₹500"
                />
              </div>

              <div className="om-input-group">
                <label className="om-label">Discount (%)</label>
                <input
                  className="om-input"
                  type="number"
                  name="discount"
                  value={formData.discount}
                  onChange={handleChange}
                  placeholder="e.g. 20"
                  min="0" max="100"
                />
              </div>

              <div className="om-input-group">
                <label className="om-label">Promo Code</label>
                <input
                  className="om-input"
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  placeholder="e.g. SAVE20"
                  style={{ textTransform: "uppercase" }}
                />
              </div>

              <div className="om-input-group span-2">
                <label className="om-label">Minimum Order Amount (₹)</label>
                <input
                  className="om-input"
                  type="number"
                  name="minOrderAmount"
                  value={formData.minOrderAmount}
                  onChange={handleChange}
                  placeholder="e.g. 500"
                  min="0"
                />
              </div>

              <div className="om-input-group span-2">
                <div className="om-toggle-row">
                  <span className="om-toggle-label">Set offer as active</span>
                  <label className="om-toggle">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, isActive: e.target.checked }))
                      }
                    />
                    <span className="om-toggle-track" />
                    <span className="om-toggle-thumb" />
                  </label>
                </div>
              </div>

            </div>

            <button
              type="submit"
              className="om-submit"
              disabled={loading}
              style={{ marginTop: "1.25rem" }}
            >
              {loading ? "Saving…" : offer ? "Update Offer" : "Create Offer"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}