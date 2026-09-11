"use client";

import { useState } from "react";

type Props = {
  initialContent: string;
  initialUpdatedAt: string | null;
};

export default function AdminConciergeKnowledgeEditor({ initialContent, initialUpdatedAt }: Props) {
  const [content, setContent] = useState(initialContent);
  const [updatedAt, setUpdatedAt] = useState(initialUpdatedAt);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    setStatus("saving");

    const response = await fetch("/api/admin/concierge-knowledge", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      setStatus("error");
      setSaving(false);
      return;
    }

    setStatus("saved");
    setUpdatedAt(result?.data?.updated_at || new Date().toISOString());
    setSaving(false);
  }

  return (
    <section className="adminFormShell">
      <div className="adminFormHeader">
        <div>
          <span className="adminEyebrow">AI KNOWLEDGE</span>
          <h2>Concierge Knowledge Base</h2>
        </div>
        <button className="adminPrimaryButton small" type="button" disabled={saving} onClick={save}>
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="adminFormMeta" style={{ marginBottom: 12 }}>
        <strong>Last updated:</strong> {updatedAt ? new Date(updatedAt).toLocaleString() : "Not yet saved"}
      </div>

      {status === "saved" && <div className="adminFormMessage" style={{ marginBottom: 12 }}>Saved</div>}
      {status === "error" && <div className="adminFormMessage error" style={{ marginBottom: 12 }}>Error saving changes.</div>}
      {status === "saving" && <div className="adminFormMessage" style={{ marginBottom: 12 }}>Saving...</div>}

      <label className="adminFieldFull" style={{ display: "block" }}>
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          rows={28}
          style={{ width: "100%", minHeight: 420, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}
          placeholder="Edit the knowledge base markdown..."
        />
      </label>
    </section>
  );
}
