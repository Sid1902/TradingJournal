import { useEffect, useState } from "react";

import { Pencil, Trash2, Check, X, Upload, Loader2 } from "lucide-react";


import AsyncSelect from "react-select/async";


function Journal() {
  const [trades, setTrades] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [zoomImage, setZoomImage] = useState(null);
  const [selectedStock, setSelectedStock] = useState(null);
  const [uploadingId, setUploadingId] = useState(null);
const [justUploadedId, setJustUploadedId] = useState(null);
 

  const [form, setForm] = useState({
    symbol: "",
    entry_price: "",
    exit_price: "",
    quantity: "",
    notes: "",
    image: null,
  });
  
const uploadImageForTrade = async (tradeId, file) => {
  if (!file) return;

  setUploadingId(tradeId);

  const formData = new FormData();
  formData.append("image", file);

  await fetch(`${import.meta.env.vite_api_url}/api/trades/${tradeId}/image`, {
    method: "PUT",
    headers: {
      Authorization: localStorage.getItem("accessToken"),
    },
    body: formData,
  });


  setUploadingId(null);
  setJustUploadedId(tradeId);

  fetchTrades();

  setTimeout(() => {
    setJustUploadedId(null);
  }, 1500);
};

const deleteImageForTrade = async (tradeId) => {
  await fetch(`${import.meta.env.vite_api_url}/api/trades/${tradeId}/image`, {
    method: "DELETE",
    headers: {
      Authorization: localStorage.getItem("accessToken"),
    },
  });

  fetchTrades();
};
  const loadStockOptions = async (inputValue) => {
  if (!inputValue) return [];

  try {
    const res = await fetch(
      `${import.meta.env.vite_api_url}/api/stocks?q=${inputValue}`
    );

    const data = await res.json();

    return data.map((s) => ({
      value: s.symbol,
      label: `${s.name} (${s.symbol})`,
    }));
  } catch (err) {
    console.error("Stock search failed", err);
    return [];
  }
};
  
  
  

  const fetchTrades = async () => {
    const res = await fetch("${import.meta.env.vite_api_url}/api/trades", {
  headers: {
    Authorization: localStorage.getItem("accessToken"),
  },
});
    const data = await res.json();
    setTrades(data);
  };

  useEffect(() => {
    fetchTrades();
   
  }, []);

  useEffect(() => {
  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      setZoomImage(null);
    }
  };

  if (zoomImage) {
    window.addEventListener("keydown", handleKeyDown);
  }

  return () => {
    window.removeEventListener("keydown", handleKeyDown);
  };
}, [zoomImage]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("symbol", form.symbol);
    formData.append("entry_price", form.entry_price);
    formData.append("exit_price", form.exit_price);
    formData.append("quantity", form.quantity);
    formData.append("notes", form.notes);
    if (form.image) {
      formData.append("image", form.image);
    }

    await fetch("${import.meta.env.vite_api_url}/api/trades", {
  method: "POST",
  headers: {
    Authorization: localStorage.getItem("accessToken"),
  },
  body: formData,
});

    setForm({
      symbol: "",
      entry_price: "",
      exit_price: "",
      quantity: "",
      notes: "",
      image: null,
    });
    setSelectedStock(null);
    fetchTrades();
  };
  const handlePaste = (e) => {
    const items = e.clipboardData.items;
  
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const blob = items[i].getAsFile();
        setForm({ ...form, image: blob });
        break;
      }
    }
  };
  

  const startEdit = (trade) => {
    setEditingId(trade.id);
    setEditData(trade);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const saveEdit = async (id) => {
    await fetch(`${import.meta.env.vite_api_url}/api/trades/${id}`, {
  method: "PUT",
  headers: {
    "Content-Type": "application/json",
    Authorization: localStorage.getItem("accessToken"),
  },
  body: JSON.stringify(editData),
});

    setEditingId(null);
    fetchTrades();
  };

  const deleteTrade = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure to delete this record?"
    );

    if (!confirmDelete) return;

   await fetch(`${import.meta.env.vite_api_url}/api/trades/${id}`, {
  method: "DELETE",
  headers: {
    Authorization: localStorage.getItem("accessToken"),
  },
});

    fetchTrades();
  };

  return (
    
    <div className="journal-container">
  <h2 className="section-title">Add Trade</h2>

  <form onSubmit={handleSubmit} className="trade-form">

    {/* Symbol */}
    {/* Single Row: Symbol + Entry + Exit + Qty */}
<div className="trade-single-row">

  <div className="symbol-select">
    <AsyncSelect
      cacheOptions
      defaultOptions={false}
      loadOptions={loadStockOptions}
      value={selectedStock}
      placeholder="Search Indian Stock..."
      onChange={(selected) => {
        setSelectedStock(selected);
        setForm({ ...form, symbol: selected?.value || "" });
      }}
    />
  </div>

  <input
    type="number"
    placeholder="Entry"
    value={form.entry_price}
    onChange={(e) =>
      setForm({ ...form, entry_price: e.target.value })
    }
  />

  <input
    type="number"
    placeholder="Exit"
    value={form.exit_price}
    onChange={(e) =>
      setForm({ ...form, exit_price: e.target.value })
    }
  />

  <input
    type="number"
    placeholder="Qty"
    value={form.quantity}
    onChange={(e) =>
      setForm({ ...form, quantity: e.target.value })
    }
  />

</div>

 

    {/* Image Row */}
    <div className="form-row-2">
      <input
        type="file"
        onChange={(e) =>
          setForm({ ...form, image: e.target.files[0] })
        }
      />

      <div
        className="paste-box"
        tabIndex="0"
        onPaste={(e) => handlePaste(e)}
      >
        Paste screenshot (Ctrl + V)
      </div>
    </div>

    <button className="add-btn" type="submit">
      Add Trade
    </button>
  </form>
  <div className="trade-table-wrapper">
  <table className="trade-table">
    <thead>
      <tr>
        <th>Date</th>
        <th>Symbol</th>
        <th>Entry</th>
        <th>Exit</th>
        <th>Qty</th>
        <th>P&L</th>
        <th>Chart</th>
        <th>Actions</th>
      </tr>
    </thead>

    <tbody>
      {trades.map((trade) => (
        <tr key={trade.id}>
          <td>
            {new Date(trade.created_at).toLocaleDateString()}
          </td>

          <td>
            {editingId === trade.id ? (
              <input
                value={editData.symbol}
                onChange={(e) =>
                  setEditData({ ...editData, symbol: e.target.value })
                }
              />
            ) : (
              trade.symbol
            )}
          </td>

          <td>
            {editingId === trade.id ? (
              <input
                value={editData.entry_price}
                onChange={(e) =>
                  setEditData({
                    ...editData,
                    entry_price: e.target.value,
                  })
                }
              />
            ) : (
              trade.entry_price
            )}
          </td>

          <td>
            {editingId === trade.id ? (
              <input
                value={editData.exit_price}
                onChange={(e) =>
                  setEditData({
                    ...editData,
                    exit_price: e.target.value,
                  })
                }
              />
            ) : (
              trade.exit_price
            )}
          </td>

          <td>
            {editingId === trade.id ? (
              <input
                value={editData.quantity}
                onChange={(e) =>
                  setEditData({
                    ...editData,
                    quantity: e.target.value,
                  })
                }
              />
            ) : (
              trade.quantity
            )}
          </td>

          <td
            style={{
              color:
                Number(trade.pnl) >= 0 ? "#22c55e" : "#ef4444",
            }}
          >
            {trade.pnl}
          </td>

          {/* IMAGE */}
          <td className="chart-cell">
  {trade.image_path ? (
    <div className="image-wrapper">
      <img
        src={`${import.meta.env.vite_api_url}${trade.image_path}`}
        alt="chart"
        className="trade-thumb"
        onClick={() =>
          setZoomImage(
            `${import.meta.env.vite_api_url}${trade.image_path}`
          )
        }
      />

      {/* Show delete icon only when editing this row */}
      {editingId === trade.id && (
        <Trash2
          size={16}
          className="image-delete-icon"
          onClick={() => deleteImageForTrade(trade.id)}
        />
      )}
    </div>
  ) : (
    <div
      className="upload-drop-zone"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        uploadImageForTrade(trade.id, e.dataTransfer.files[0]);
      }}
      onPaste={(e) => {
        const items = e.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.includes("image")) {
            uploadImageForTrade(trade.id, items[i].getAsFile());
          }
        }
      }}
      tabIndex="0"
    >
      {uploadingId === trade.id ? (
        <Loader2 className="spin-icon" size={18} />
      ) : justUploadedId === trade.id ? (
        <span className="uploaded-text">Uploaded ✓</span>
      ) : (
        <label>
          <input
            type="file"
            hidden
            onChange={(e) =>
              uploadImageForTrade(trade.id, e.target.files[0])
            }
          />
          <Upload size={18} />
        </label>
      )}
    </div>
  )}
</td>

          {/* ACTIONS */}
          <td className="action-icons">
            {editingId === trade.id ? (
              <>
                <Check
                  size={18}
                  onClick={() => saveEdit(trade.id)}
                />
                <X size={18} onClick={cancelEdit} />
              </>
            ) : (
              <>
                <Pencil
                  size={18}
                  onClick={() => startEdit(trade)}
                />
                <Trash2
                  size={18}
                  onClick={() => deleteTrade(trade.id)}
                />
              </>
            )}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
{zoomImage && (
  <div
    className="zoom-overlay"
    onClick={() => setZoomImage(null)}
  >
    <img
      src={zoomImage}
      alt="zoomed"
      className="zoom-image"
    />
  </div>
)}
</div>
  );
}

export default Journal;
