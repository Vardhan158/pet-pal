import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
void motion;
import toast from "react-hot-toast";
import axiosInstance from "../../api/utils/axiosInstance";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, UploadCloud } from "lucide-react";

const fadeUp = {
  hidden:  { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const CATEGORIES = ["Dog", "Cat", "Bird", "Fish"];
const SELLER_PRODUCT_DRAFT_KEY = "seller-add-product-draft";

export default function SellerAddProduct({ editingPet = null, clearEditing = () => {} }) {
  const [images,    setImages]    = useState([]);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [petForm, setPetForm] = useState({
    name: "", category: "", price: "", offerPrice: "",
    description: "", image: "",
    specifications: [{ label: "", value: "" }],
    inStock: true,
  });

  useEffect(() => {
    if (editingPet) {
      setPetForm({
        name:           editingPet.name        || "",
        category:       editingPet.category    || "",
        price:          editingPet.price       || "",
        offerPrice:     editingPet.offerPrice  || "",
        description:    editingPet.description || "",
        image:          editingPet.image       || "",
        specifications: Array.isArray(editingPet.specifications) && editingPet.specifications.length
          ? editingPet.specifications
          : [{ label: "", value: "" }],
        inStock: editingPet.inStock ?? true,
        id: editingPet._id || editingPet.id || null,
      });
      setImages(editingPet.image ? [editingPet.image] : []);
      return;
    }

    try {
      const savedDraft = localStorage.getItem(SELLER_PRODUCT_DRAFT_KEY);
      if (!savedDraft) return;

      const parsedDraft = JSON.parse(savedDraft);
      if (!parsedDraft || typeof parsedDraft !== "object") return;

      setPetForm((prev) => ({
        ...prev,
        ...parsedDraft,
        specifications:
          Array.isArray(parsedDraft.specifications) && parsedDraft.specifications.length
            ? parsedDraft.specifications
            : prev.specifications,
      }));
      setImages(parsedDraft.image ? [parsedDraft.image] : []);
    } catch {
      localStorage.removeItem(SELLER_PRODUCT_DRAFT_KEY);
    }
  }, [editingPet]);

  const set = (key, val) => setPetForm((p) => ({ ...p, [key]: val }));

  useEffect(() => {
    if (editingPet || petForm.id) return;
    localStorage.setItem(SELLER_PRODUCT_DRAFT_KEY, JSON.stringify(petForm));
    setImages(petForm.image ? [petForm.image] : []);
  }, [editingPet, petForm]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    fd.append("upload_preset", "petworld");
    try {
      setUploading(true);
      const res  = await fetch("https://api.cloudinary.com/v1_1/dujdjt4l7/image/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.secure_url) {
        setImages([data.secure_url]);
        set("image", data.secure_url);
        toast.success("Image uploaded!");
      } else {
        toast.error(data.error?.message || "Upload failed");
      }
    } catch {
      toast.error("Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleAddPet = async (e) => {
    e.preventDefault();
    if (!petForm.image) return toast.error("Please upload an image first");
    try {
      const payload = {
        ...petForm,
        specifications: petForm.specifications.filter((s) => s.label || s.value),
      };
      const res = petForm.id
        ? await axiosInstance.put(`/sellers/my-pets/${petForm.id}`, payload, { headers: { Authorization: `Bearer ${token}` } })
        : await axiosInstance.post("/sellers/add-pet", payload, { headers: { Authorization: `Bearer ${token}` } });

      if (res.data.success) {
        toast.success(`Pet ${petForm.id ? "updated" : "added"} successfully!`);
        localStorage.removeItem(SELLER_PRODUCT_DRAFT_KEY);
        setPetForm({ name:"", category:"", price:"", offerPrice:"", description:"", image:"", specifications:[{ label:"", value:"" }], inStock:true });
        setImages([]);
        clearEditing();
        navigate("/seller/dashboard?view=products", { replace: true });
      } else {
        toast.error(res.data.message || "Failed to save pet");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save pet");
    }
  };

  const updateSpec = (idx, key, val) => {
    const updated = petForm.specifications.map((s, i) => i === idx ? { ...s, [key]: val } : s);
    set("specifications", updated);
  };
  const removeSpec = (idx) => set("specifications", petForm.specifications.filter((_, i) => i !== idx));
  const addSpec    = ()    => set("specifications", [...petForm.specifications, { label: "", value: "" }]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; }

        .sap-root {
          font-family: 'Poppins', sans-serif;
          width: 100%;
          max-width: 1060px;
          margin: 1.5rem auto;
          padding: 0 1rem 3rem;
        }

        /* ── Header ── */
        .sap-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
        }
        .sap-header-icon {
          width: 42px; height: 42px; flex-shrink: 0;
          background: linear-gradient(135deg, #f5a623, #f76b1c);
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.1rem;
        }
        .sap-title    { font-size: 1.3rem; font-weight: 700; color: #1a1a2e; letter-spacing: -0.3px; margin: 0; }
        .sap-subtitle { font-size: 0.78rem; color: #9499b0; margin: 0; }

        /* ── Shell: side-by-side on desktop, stacked on mobile ── */
        .sap-shell {
          display: grid;
          grid-template-columns: 260px 1fr;
          gap: 1.25rem;
          align-items: start;
        }

        /* ── Card ── */
        .sap-card {
          background: #fff;
          border-radius: 20px;
          border: 1px solid #eef0f6;
          box-shadow: 0 4px 24px rgba(0,0,0,0.05);
          padding: 1.25rem;
        }

        /* ── Left column ── */
        .sap-left { display: flex; flex-direction: column; gap: 1rem; }

        .sap-upload-box {
          width: 100%; aspect-ratio: 1;
          border-radius: 14px;
          border: 2px dashed #e0e3ef;
          background: #f8f9fc;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: 8px; cursor: pointer; overflow: hidden;
          transition: border-color 0.2s, background 0.2s;
        }
        .sap-upload-box:hover { border-color: #f5a623; background: #fffaf3; }
        .sap-upload-box img   { width: 100%; height: 100%; object-fit: cover; }
        .sap-upload-placeholder {
          display: flex; flex-direction: column;
          align-items: center; gap: 6px; color: #b8bdd0;
        }
        .sap-upload-placeholder p    { font-size: 0.8rem; font-weight: 500; margin: 0; }
        .sap-upload-placeholder span { font-size: 0.68rem; }

        .sap-uploading {
          font-size: 0.75rem; color: #f76b1c; font-weight: 500;
          text-align: center; margin-top: 6px;
          animation: sap-pulse 1.2s ease-in-out infinite;
        }
        @keyframes sap-pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }

        /* ── Toggle ── */
        .sap-toggle-row {
          display: flex; align-items: center; justify-content: space-between;
          background: #f8f9fc; border: 1.5px solid #e8eaf0;
          border-radius: 11px; padding: 0.65rem 0.9rem;
        }
        .sap-toggle-label { font-size: 0.82rem; font-weight: 500; color: #4a4f68; }
        .sap-toggle { position: relative; width: 40px; height: 22px; cursor: pointer; flex-shrink: 0; }
        .sap-toggle input { opacity: 0; width: 0; height: 0; }
        .sap-toggle-track {
          position: absolute; inset: 0;
          background: #e0e3ef; border-radius: 99px; transition: background 0.2s;
        }
        .sap-toggle input:checked + .sap-toggle-track { background: #f5a623; }
        .sap-toggle-thumb {
          position: absolute; top: 3px; left: 3px;
          width: 16px; height: 16px; background: #fff; border-radius: 50%;
          box-shadow: 0 1px 3px rgba(0,0,0,0.18); transition: transform 0.2s;
        }
        .sap-toggle input:checked ~ .sap-toggle-thumb { transform: translateX(18px); }

        /* ── Submit button ── */
        .sap-submit {
          width: 100%; padding: 0.85rem;
          font-family: 'Poppins', sans-serif; font-size: 0.9rem; font-weight: 600;
          color: #fff; background: linear-gradient(135deg, #f5a623, #f76b1c);
          border: none; border-radius: 13px; cursor: pointer;
          transition: opacity 0.2s, transform 0.15s; letter-spacing: 0.3px;
        }
        .sap-submit:hover:not(:disabled) { opacity: 0.92; transform: translateY(-1px); }
        .sap-submit:active:not(:disabled) { transform: translateY(0); }
        .sap-submit:disabled { opacity: 0.6; cursor: not-allowed; }

        /* ── Right column ── */
        .sap-right { display: flex; flex-direction: column; gap: 1.25rem; }

        .sap-section {
          font-size: 0.72rem; font-weight: 600; color: #c2590a;
          text-transform: uppercase; letter-spacing: 0.6px;
          padding-bottom: 0.45rem; border-bottom: 1px solid #f5f0e8;
          margin-bottom: 0.8rem;
        }

        .sap-field { display: flex; flex-direction: column; gap: 5px; }
        .sap-label { font-size: 0.75rem; font-weight: 500; color: #4a4f68; letter-spacing: 0.3px; }

        .sap-input, .sap-textarea, .sap-select {
          width: 100%; padding: 0.65rem 0.9rem;
          font-family: 'Poppins', sans-serif; font-size: 0.85rem; color: #1a1a2e;
          background: #f8f9fc; border: 1.5px solid #e8eaf0; border-radius: 11px;
          outline: none; transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
          min-width: 0;
        }
        .sap-textarea { resize: vertical; min-height: 110px; }
        .sap-select   { appearance: none; cursor: pointer; }
        .sap-input::placeholder, .sap-textarea::placeholder { color: #b8bdd0; }
        .sap-input:focus, .sap-textarea:focus, .sap-select:focus {
          border-color: #f5a623; background: #fff;
          box-shadow: 0 0 0 3px rgba(245,166,35,0.12);
        }

        .sap-two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }

        /* ── Spec rows ── */
        .sap-spec-row { display: flex; gap: 8px; align-items: center; }
        .sap-spec-row .sap-input { flex: 1; min-width: 0; }

        .sap-btn-remove {
          display: inline-flex; align-items: center; justify-content: center;
          background: #fff1f1; border: 1px solid #fad5d5; color: #d44545;
          border-radius: 9px; padding: 7px; cursor: pointer; flex-shrink: 0;
          transition: background 0.15s;
        }
        .sap-btn-remove:hover { background: #ffe0e0; }

        .sap-btn-add-spec {
          display: inline-flex; align-items: center; gap: 5px;
          background: #f8f9fc; border: 1.5px dashed #d0d3e0; color: #4a4f68;
          font-family: 'Poppins', sans-serif; font-size: 0.78rem; font-weight: 500;
          padding: 6px 14px; border-radius: 9px; cursor: pointer; margin-top: 4px;
          transition: background 0.15s, border-color 0.15s;
        }
        .sap-btn-add-spec:hover { background: #fff0e0; border-color: #f5a623; color: #c2590a; }

        /* ════════════════════════════════
           RESPONSIVE BREAKPOINTS
        ════════════════════════════════ */

        /* Tablet – collapse to single column, image becomes horizontal strip */
        @media (max-width: 768px) {
          .sap-root { padding: 0 0.75rem 2.5rem; margin: 1rem auto; }

          .sap-shell {
            grid-template-columns: 1fr;
          }

          /* On tablet, put left card items in a row */
          .sap-left {
            display: grid;
            grid-template-columns: 160px 1fr;
            gap: 1rem;
            align-items: start;
          }

          /* Image takes left cell; stock toggle + submit stack in right cell */
          .sap-left-controls {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
          }

          .sap-upload-box {
            aspect-ratio: 1;
            min-height: unset;
          }

          .sap-card { padding: 1rem; border-radius: 16px; }

          .sap-header-icon { width: 36px; height: 36px; font-size: 1rem; border-radius: 10px; }
          .sap-title    { font-size: 1.15rem; }
          .sap-subtitle { font-size: 0.74rem; }
        }

        /* Mobile – fully stacked, image is a wide landscape banner */
        @media (max-width: 540px) {
          .sap-root { padding: 0 0.5rem 2rem; }

          .sap-shell { gap: 0.9rem; }

          .sap-left {
            grid-template-columns: 1fr;   /* back to single column */
          }

          .sap-upload-box {
            aspect-ratio: 16 / 9;          /* wide banner on mobile */
            border-radius: 12px;
          }

          .sap-two-col { grid-template-columns: 1fr; }

          /* Spec rows: label above value, no side-by-side */
          .sap-spec-row {
            flex-wrap: wrap;
            gap: 6px;
          }
          .sap-spec-row .sap-input {
            min-width: calc(50% - 24px);   /* still attempt 2 per row */
          }

          .sap-section { font-size: 0.7rem; }
          .sap-input, .sap-textarea, .sap-select { font-size: 0.82rem; padding: 0.6rem 0.8rem; }
          .sap-submit { font-size: 0.88rem; padding: 0.8rem; }

          .sap-card { padding: 0.9rem; border-radius: 14px; }
          .sap-right { gap: 0.9rem; }
        }

        /* Extra-small – spec inputs fully stacked */
        @media (max-width: 380px) {
          .sap-spec-row .sap-input { min-width: 100%; }
          .sap-title    { font-size: 1rem; }
          .sap-subtitle { font-size: 0.7rem; }
        }
      `}</style>

      <motion.div className="sap-root" initial="hidden" animate="visible" variants={fadeUp}>

        {/* Page header */}
        <div className="sap-header">
          <div className="sap-header-icon">🐾</div>
          <div>
            <p className="sap-title">{petForm.id ? "Edit Product" : "Add New Product"}</p>
            <p className="sap-subtitle">Fill in the details below to list your pet</p>
          </div>
        </div>

        <form onSubmit={handleAddPet}>
          <div className="sap-shell">

            {/* ── LEFT: image · stock · submit ── */}
            <div className="sap-left">

              {/* Image upload card */}
              <div className="sap-card">
                <p className="sap-section">Product Image</p>
                <label htmlFor="image0" style={{ display: "block", cursor: "pointer" }}>
                  <input type="file" id="image0" accept="image/*" hidden onChange={handleImageUpload} />
                  <div className="sap-upload-box">
                    {images[0] ? (
                      <img src={images[0]} alt="preview" />
                    ) : (
                      <div className="sap-upload-placeholder">
                        <UploadCloud size={28} />
                        <p>Click to upload</p>
                        <span>JPG · PNG · WEBP · Max 5 MB</span>
                      </div>
                    )}
                  </div>
                </label>
                {uploading && <p className="sap-uploading">Uploading…</p>}
              </div>

              {/* Stock toggle + submit — wrapped for tablet layout */}
              <div className="sap-left-controls">
                <div className="sap-card" style={{ padding: "0.75rem 1rem" }}>
                  <div className="sap-toggle-row" style={{ border: "none", background: "none", padding: 0 }}>
                    <span className="sap-toggle-label">Mark as in stock</span>
                    <label className="sap-toggle">
                      <input type="checkbox" checked={petForm.inStock}
                        onChange={(e) => set("inStock", e.target.checked)} />
                      <span className="sap-toggle-track" />
                      <span className="sap-toggle-thumb" />
                    </label>
                  </div>
                </div>

                <button type="submit" className="sap-submit" disabled={uploading}>
                  {uploading ? "Uploading…" : petForm.id ? "Update Product" : "Add Product"}
                </button>
              </div>
            </div>

            {/* ── RIGHT: form sections ── */}
            <div className="sap-right">

              {/* Basic info */}
              <div className="sap-card">
                <p className="sap-section">Basic Info</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                  <div className="sap-two-col">
                    <div className="sap-field">
                      <label className="sap-label" htmlFor="product-name">Pet Name</label>
                      <input className="sap-input" id="product-name" type="text"
                        placeholder="e.g. Golden Retriever Pup"
                        value={petForm.name} onChange={(e) => set("name", e.target.value)} required />
                    </div>
                    <div className="sap-field">
                      <label className="sap-label" htmlFor="category">Category</label>
                      <select className="sap-select" id="category" value={petForm.category}
                        onChange={(e) => set("category", e.target.value)} required>
                        <option value="">Select a category</option>
                        {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="sap-field">
                    <label className="sap-label" htmlFor="product-description">Description</label>
                    <textarea className="sap-textarea" id="product-description" rows={5}
                      placeholder="Describe the pet — breed, temperament, health status…"
                      value={petForm.description} onChange={(e) => set("description", e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="sap-card">
                <p className="sap-section">Pricing</p>
                <div className="sap-two-col">
                  <div className="sap-field">
                    <label className="sap-label" htmlFor="product-price">Price (₹)</label>
                    <input className="sap-input" id="product-price" type="number" placeholder="0"
                      value={petForm.price} onChange={(e) => set("price", e.target.value)} required min="0" />
                  </div>
                  <div className="sap-field">
                    <label className="sap-label" htmlFor="offer-price">
                      Offer Price (₹){" "}
                      <span style={{ color: "#b8bdd0", fontWeight: 400 }}>optional</span>
                    </label>
                    <input className="sap-input" id="offer-price" type="number" placeholder="0"
                      value={petForm.offerPrice} onChange={(e) => set("offerPrice", e.target.value)} min="0" />
                  </div>
                </div>
              </div>

              {/* Specifications */}
              <div className="sap-card">
                <p className="sap-section">
                  Specifications{" "}
                  <span style={{ color: "#b8bdd0", textTransform: "none", letterSpacing: 0, fontWeight: 400, fontSize: "0.72rem" }}>
                    (optional)
                  </span>
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {petForm.specifications.map((spec, idx) => (
                    <div key={idx} className="sap-spec-row">
                      <input className="sap-input" type="text" placeholder="Label (e.g. Age)"
                        value={spec.label} onChange={(e) => updateSpec(idx, "label", e.target.value)} />
                      <input className="sap-input" type="text" placeholder="Value (e.g. 6 months)"
                        value={spec.value} onChange={(e) => updateSpec(idx, "value", e.target.value)} />
                      {petForm.specifications.length > 1 && (
                        <button type="button" className="sap-btn-remove" onClick={() => removeSpec(idx)} aria-label="Remove">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button type="button" className="sap-btn-add-spec" onClick={addSpec}>
                    <Plus size={13} /> Add specification
                  </button>
                </div>
              </div>

            </div>{/* end right */}
          </div>{/* end shell */}
        </form>
      </motion.div>
    </>
  );
}
