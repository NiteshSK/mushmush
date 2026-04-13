"use client";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import AdminAuthWrapper from '@/components/Admin/AdminAuthWrapper';

type Setting = {
    key: string;
    value: string;
    label?: string;
    type?: string;
    group?: string;
};

const DEFAULT_SETTINGS = [
    { key: "company_name", label: "Company Name", value: "MushMush by Mush Agro Products", group: "general" },
    { key: "company_address", label: "Address", value: "Mush Agro Products, Herbetpur, Dehradun, Uttarakhand, India", group: "contact", type: "longtext" },
    { key: "google_maps_link", label: "Google Maps Link", value: "https://www.google.com/maps/search/Mush+Agro+Products+Herbertpur", group: "contact" },
    { key: "contact_email", label: "Contact Email", value: "concierge@kosvana.com", group: "contact" },
    { key: "contact_phone", label: "Contact Phone", value: "+91-7618362662", group: "contact" },
    { key: "whatsapp_number", label: "WhatsApp Number", value: "+91-7618362662", group: "contact" },
    { key: "instagram_url", label: "Instagram URL", value: "https://instagram.com/kosvana", group: "social" },
    { key: "facebook_url", label: "Facebook URL", value: "", group: "social" },
    { key: "twitter_url", label: "Twitter URL", value: "", group: "social" },
];

const inputClass = "rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-3 text-sm outline-none focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-forest/20";

const groupLabels: Record<string, string> = {
    general: "General",
    contact: "Contact Information",
    social: "Social Media",
};

const SettingsPage = () => {
    const [settings, setSettings] = useState<Setting[]>(DEFAULT_SETTINGS);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetch("/api/admin/settings")
            .then((r) => r.json())
            .then((data) => {
                if (Array.isArray(data) && data.length > 0) {
                    const merged = DEFAULT_SETTINGS.map((def) => {
                        const saved = data.find((s: Setting) => s.key === def.key);
                        return saved ? { ...def, value: saved.value } : def;
                    });
                    setSettings(merged);
                }
            })
            .catch(() => {});
    }, []);

    const handleChange = (key: string, value: string) => {
        setSettings((prev) => prev.map((s) => (s.key === key ? { ...s, value } : s)));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch("/api/admin/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ settings }),
            });
            if (res.ok) {
                toast.success("Settings saved successfully!");
            } else {
                toast.error("Failed to save settings");
            }
        } catch {
            toast.error("Error saving settings");
        } finally {
            setSaving(false);
        }
    };

    const groupedSettings = settings.reduce((acc, setting) => {
        const group = setting.group || "general";
        if (!acc[group]) acc[group] = [];
        acc[group].push(setting);
        return acc;
    }, {} as Record<string, Setting[]>);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-[10px] shadow-1 p-6">
                <h1 className="text-2xl font-semibold text-dark">Settings</h1>
                <p className="text-dark-5 text-sm mt-1">Manage store contact details, social links, and general configuration.</p>
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
                                <label className="block text-sm font-medium text-dark mb-1.5">
                                    {setting.label || setting.key}
                                </label>
                                {setting.type === "longtext" ? (
                                    <textarea
                                        rows={3}
                                        value={setting.value}
                                        onChange={(e) => handleChange(setting.key, e.target.value)}
                                        className={inputClass}
                                    />
                                ) : (
                                    <input
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

            {/* Save */}
            <div className="bg-white rounded-[10px] shadow-1 p-6">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-forest text-white px-6 py-2.5 rounded-md text-sm font-medium hover:bg-dark transition-colors disabled:opacity-50"
                >
                    {saving ? "Saving..." : "Save Settings"}
                </button>
            </div>
        </div>
    );
};

export default function ProtectedSettingsPage() {
  return <AdminAuthWrapper><SettingsPage /></AdminAuthWrapper>;
}
