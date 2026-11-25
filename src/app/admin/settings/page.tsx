"use client";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
type Setting = {
  key: string;
  value: string;
  updatedAt?: string;
  label?: string;
  type?: string;
  group?: string;
};

import { DEFAULT_SETTINGS } from "@/lib/shop-settings";

const inputClass =
  "rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-3 text-sm outline-none focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-forest/20";

const groupLabels: Record<string, string> = {
  general: "General",
  contact: "Contact Information",
  social: "Social Media",
};

const SettingsPage = () => {
  const [settings, setSettings] = useState<Setting[]>(DEFAULT_SETTINGS);
  const [saving, setSaving] = useState(false);

  const [saved, setSaved] = useState<Setting[] | null>(null);
  const [error, setError] = useState("");
  const load = async () => {
    setSaved(null);
    setError("");
    try {
      const res = await fetch("/api/admin/settings", { cache: "no-store" });
      if (!res.ok) throw Error();
      const rows: Setting[] = await res.json();
      setSettings(
        DEFAULT_SETTINGS.map((def) => ({
          ...def,
          value: rows.find((row) => row.key === def.key)?.value ?? def.value,
        })),
      );
      setSaved(rows);
    } catch {
      setError("Stored settings could not be loaded.");
    }
  };
  useEffect(() => {
    void load();
  }, []);
  const handleChange = (key: string, value: string) =>
    setSettings((prev) =>
      prev.map((s) => (s.key === key ? { ...s, value } : s)),
    );
  const changes = settings.filter(
    (s) =>
      s.value !==
      (saved?.find((row) => row.key === s.key)?.value ??
        DEFAULT_SETTINGS.find((d) => d.key === s.key)?.value),
  );
  const handleSave = async () => {
    if (!saved || !changes.length) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          settings: changes.map((s) => ({
            key: s.key,
            value: s.value,
            expected: saved.find((row) => row.key === s.key)?.value ?? null,
            expectedUpdatedAt:
              saved.find((row) => row.key === s.key)?.updatedAt ?? null,
          })),
        }),
      });
      if (!res.ok) throw Error((await res.json()).error);
      await load();
      toast.success("Settings saved");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };
  if (!saved)
    return (
      <section>
        <h1>Settings</h1>
        {error ? (
          <p role="alert">
            {error} <button onClick={load}>Retry</button>
          </p>
        ) : (
          <p role="status">Loading saved settings…</p>
        )}
      </section>
    );
  const groupedSettings = settings.reduce(
    (acc, setting) => {
      const group = setting.group || "general";
      if (!acc[group]) acc[group] = [];
      acc[group].push(setting);
      return acc;
    },
    {} as Record<string, Setting[]>,
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-[10px] shadow-1 p-6">
        <h1 className="text-2xl font-semibold text-dark">Settings</h1>
        <p className="text-dark-5 text-sm mt-1">
          Contact details and social links appear on the{" "}
          <a className="underline" href="/contact">
            public contact page
          </a>
          .
        </p>
      </div>

      {/* Settings groups */}
      {Object.entries(groupedSettings).map(([group, items]) => (
        <div key={group} className="bg-white rounded-[10px] shadow-1 p-6">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-dark-5 mb-5">
            {groupLabels[group] || group}
          </h2>
          <div className="space-y-5">
            {items.map((setting) => (
              <div key={setting.key}>
                <label
                  htmlFor={setting.key}
                  className="block text-sm font-medium text-dark mb-1.5"
                >
                  {setting.label || setting.key}
                </label>
                {setting.type === "longtext" ? (
                  <textarea
                    id={setting.key}
                    rows={3}
                    value={setting.value}
                    onChange={(e) => handleChange(setting.key, e.target.value)}
                    className={inputClass}
                  />
                ) : (
                  <input
                    id={setting.key}
                    type="text"
                    value={setting.value}
                    onChange={(e) => handleChange(setting.key, e.target.value)}
                    className={inputClass}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {error && (
        <p role="alert">
          {error} <button onClick={load}>Reload saved settings</button>
        </p>
      )}
      {/* Save */}
      <div className="bg-white rounded-[10px] shadow-1 p-6">
        <button
          onClick={handleSave}
          disabled={saving || !changes.length}
          className="bg-forest text-white px-6 py-2.5 rounded-md text-sm font-medium hover:bg-dark transition-colors disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </div>
  );
};

export default function ProtectedSettingsPage() {
  return (
    <>
      <SettingsPage />
    </>
  );
}
