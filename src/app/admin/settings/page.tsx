"use client";
import React, { useEffect, useState } from "react";
import Breadcrumb from "@/components/Common/Breadcrumb";
import { toast } from "react-hot-toast";

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
    { key: "contact_email", label: "Contact Email", value: "mushagroprod@gmail.com", group: "contact" },
    { key: "contact_phone", label: "Contact Phone", value: "+91-7618362662", group: "contact" },
    { key: "business_hours", label: "Business Hours", value: "Mon-Sat: 9AM-6PM, Sun: 9AM-3PM", group: "contact", type: "longtext" },
];

const SettingsPage = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState<Setting[]>([]);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch("/api/admin/settings");
            const data = await res.json();

            if (data.error) throw new Error(data.error);

            // Merge fetched settings with defaults to ensure all keys exist
            const mergedSettings = DEFAULT_SETTINGS.map(def => {
                const existing = data.find((s: Setting) => s.key === def.key);
                return existing ? { ...def, ...existing } : def;
            });

            setSettings(mergedSettings);
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch settings");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (key: string, value: string) => {
        setSettings(prev => prev.map(s => s.key === key ? { ...s, value } : s));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch("/api/admin/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ settings }),
            });

            if (!res.ok) throw new Error("Failed to save");

            toast.success("Settings updated successfully!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to update settings");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-10 text-center">Loading settings...</div>;

    const groupedSettings = settings.reduce((acc, setting) => {
        const group = setting.group || "general";
        if (!acc[group]) acc[group] = [];
        acc[group].push(setting);
        return acc;
    }, {} as Record<string, Setting[]>);

    return (
        <>
            <Breadcrumb title="General Settings" pages={["Admin", "Settings"]} />

            <div className="grid grid-cols-1 gap-9 sm:grid-cols-2">
                <div className="flex flex-col gap-9">
                    {/* Contact Information */}
                    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                        <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
                            <h3 className="font-medium text-black dark:text-white">
                                Contact Information
                            </h3>
                        </div>
                        <div className="flex flex-col gap-5.5 p-6.5">
                            {groupedSettings.contact?.map((setting) => (
                                <div key={setting.key}>
                                    <label className="mb-3 block text-black dark:text-white">
                                        {setting.label || setting.key}
                                    </label>
                                    {setting.type === "longtext" ? (
                                        <textarea
                                            rows={4}
                                            value={setting.value}
                                            onChange={(e) => handleChange(setting.key, e.target.value)}
                                            className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                        />
                                    ) : (
                                        <input
                                            type="text"
                                            value={setting.value}
                                            onChange={(e) => handleChange(setting.key, e.target.value)}
                                            className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-9">
                    {/* General Information */}
                    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                        <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
                            <h3 className="font-medium text-black dark:text-white">
                                General Information
                            </h3>
                        </div>
                        <div className="flex flex-col gap-5.5 p-6.5">
                            {groupedSettings.general?.map((setting) => (
                                <div key={setting.key}>
                                    <label className="mb-3 block text-black dark:text-white">
                                        {setting.label || setting.key}
                                    </label>
                                    {setting.type === "longtext" ? (
                                        <textarea
                                            rows={4}
                                            value={setting.value}
                                            onChange={(e) => handleChange(setting.key, e.target.value)}
                                            className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                        />
                                    ) : (
                                        <input
                                            type="text"
                                            value={setting.value}
                                            onChange={(e) => handleChange(setting.key, e.target.value)}
                                            className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="text-right">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="inline-flex items-center justify-center rounded-md bg-primary py-4 px-10 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10 disabled:opacity-50"
                        >
                            {saving ? "Saving..." : "Save Settings"}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default SettingsPage;
