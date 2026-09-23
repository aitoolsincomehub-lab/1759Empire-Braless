"use client";

import { useState } from "react";

type InventoryStatus = "available" | "low_stock" | "out_of_stock";
export type InventoryItem = { id: string; name: string; category: string; quantity: number; unit: string; status: InventoryStatus; reorder_level: number; notes: string; is_active: boolean };
type Filter = "all" | InventoryStatus;
const emptyForm = { name: "", category: "", quantity: "0", unit: "", status: "available" as InventoryStatus, reorder_level: "0", notes: "", is_active: true };

export default function AdminInventory({ initialItems }: { initialItems: InventoryItem[] }) {
  const [items, setItems] = useState(initialItems);
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<InventoryItem | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");

  function start(item?: InventoryItem) {
    setEditing(item || null);
    setCreating(!item);
    setForm(item ? { name: item.name, category: item.category, quantity: String(item.quantity), unit: item.unit, status: item.status, reorder_level: String(item.reorder_level), notes: item.notes, is_active: item.is_active } : emptyForm);
    setMessage("");
  }

  async function save() {
    const payload = { ...form, quantity: Number(form.quantity), reorder_level: Number(form.reorder_level) };
    const response = await fetch("/api/admin/inventory", { method: editing ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editing ? { ...payload, id: editing.id } : payload) });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.data) { setMessage(result.error || "Inventory item could not be saved."); return; }
    setItems((current) => editing ? current.map((item) => item.id === editing.id ? result.data : item) : [result.data, ...current]);
    setEditing(null); setCreating(false); setForm(emptyForm); setMessage("Inventory updated.");
  }

  async function deactivate(id: string) {
    const response = await fetch("/api/admin/inventory", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    if (response.ok) setItems((current) => current.map((item) => item.id === id ? { ...item, is_active: false } : item));
    else setMessage("Inventory item could not be deactivated.");
  }

  async function activate(item: InventoryItem) {
    const response = await fetch("/api/admin/inventory", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...item, is_active: true }) });
    const result = await response.json().catch(() => ({}));
    if (response.ok && result.data) setItems((current) => current.map((currentItem) => currentItem.id === item.id ? result.data : currentItem));
    else setMessage(result.error || "Inventory item could not be activated.");
  }

  const visible = items.filter((item) => (filter === "all" || item.status === filter) && `${item.name} ${item.category} ${item.unit}`.toLowerCase().includes(search.toLowerCase()));
  const count = (status: Filter) => status === "all" ? items.length : items.filter((item) => item.status === status).length;

  return <section className="inventoryManager">
    <div className="inventoryToolbar"><input aria-label="Search inventory" placeholder="Search inventory" value={search} onChange={(event) => setSearch(event.target.value)} /><button type="button" className="adminPrimaryButton" onClick={() => start()}>Add inventory item</button></div>
    <div className="inventoryFilters">{(["all", "available", "low_stock", "out_of_stock"] as Filter[]).map((value) => <button type="button" className={filter === value ? "active" : ""} onClick={() => setFilter(value)} key={value}>{value === "all" ? "All" : value.replace("_", " ")} <strong>{count(value)}</strong></button>)}</div>
    {message && <div className="adminFormMessage">{message}</div>}
    {visible.length === 0 ? <p className="muted">No inventory items match this view.</p> : <div className="inventoryList">{visible.map((item) => <article className={`inventoryItem inventory-${item.status} ${item.is_active ? "" : "inventory-inactive"}`} key={item.id}><div><span className="inventoryStatus">{item.is_active ? item.status.replace("_", " ") : "Inactive"}</span><h2>{item.name}</h2><p>{item.category || "Uncategorised"} · {item.notes || "No notes"}</p></div><strong className="inventoryQuantity">{item.quantity} <small>{item.unit}</small></strong><div className="inventoryActions"><button type="button" className="adminActionButton" onClick={() => start(item)}>Edit</button>{item.is_active ? <button type="button" className="adminActionButton adminActionDelete" onClick={() => deactivate(item.id)}>Deactivate</button> : <button type="button" className="adminActionButton" onClick={() => activate(item)}>Activate</button>}</div></article>)}</div>}
    {(editing || creating) && <div className="inventoryEditor"><h2>{editing ? "Edit inventory item" : "Add inventory item"}</h2><div className="inventoryFormGrid"><label className="adminField">Name<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label><label className="adminField">Category<input value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} /></label><label className="adminField">Quantity<input type="number" min="0" value={form.quantity} onChange={(event) => setForm({ ...form, quantity: event.target.value })} /></label><label className="adminField">Unit<input value={form.unit} onChange={(event) => setForm({ ...form, unit: event.target.value })} placeholder="bottles, servings" /></label><label className="adminField">Status<select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as InventoryStatus })}><option value="available">Available</option><option value="low_stock">Low Stock</option><option value="out_of_stock">Out of Stock</option></select></label><label className="adminField">Reorder level<input type="number" min="0" value={form.reorder_level} onChange={(event) => setForm({ ...form, reorder_level: event.target.value })} /></label><label className="adminFieldFull">Notes<textarea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} /></label><label className="adminField">Active<input type="checkbox" checked={form.is_active} onChange={(event) => setForm({ ...form, is_active: event.target.checked })} /></label></div><div className="adminMediaActions"><button type="button" className="adminPrimaryButton" onClick={save}>Save item</button><button type="button" className="adminSecondaryButton" onClick={() => { setEditing(null); setCreating(false); setForm(emptyForm); }}>Cancel</button></div></div>}
  </section>;
}