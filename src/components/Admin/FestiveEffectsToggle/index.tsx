"use client";

import React, { useState, useEffect } from 'react';

// Interface for the site settings object
interface SiteSettings {
  id: number;
  enable_festive_effects: boolean;
  festive_effects_start_date?: string;
  festive_effects_end_date?: string;
  updated_at: string;
  created_at: string;
}

// A reusable skeleton component for the loading state
const LoadingSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
    <div className="flex items-center justify-between">
      <div>
        <div className="h-5 bg-gray-300 rounded w-32 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-48"></div>
      </div>
      <div className="w-12 h-6 bg-gray-300 rounded-full"></div>
    </div>
  </div>
);


const FestiveEffectsToggle: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch initial settings when the component mounts
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        setError(null);
        const apiUrl = `${window.location.origin}/api/admin/site-settings`;
        const response = await fetch(apiUrl);
        
        if (response.ok) {
          const data: SiteSettings = await response.json();
          if (!data || typeof data.enable_festive_effects === 'undefined') {
             setError('Received invalid settings data from the server.');
          } else {
             setSettings(data);
          }
        } else {
          // Handle non-successful responses by reading the body only once
          let errorDetails = `Status: ${response.status}`;
          const errorText = await response.text();
          try {
            const errorData = JSON.parse(errorText);
            errorDetails = errorData.message || JSON.stringify(errorData);
          } catch {
             errorDetails = errorText || 'No error details available.';
          }
          setError(`Failed to fetch settings. ${errorDetails}`);
        }
      } catch (err) {
        // Handle network errors
        setError('An error occurred while fetching settings. Please check your network connection.');
        console.error('Error fetching settings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // Handler for toggling the festive effects switch
  const handleToggle = async () => {
    // Prevent multiple updates and updates without settings loaded
    if (!settings || updating) return;

    try {
      setUpdating(true);
      setError(null);

      const newEnableFestiveEffects = !settings.enable_festive_effects;
      const apiUrl = `${window.location.origin}/api/admin/site-settings`;

      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          enableFestiveEffects: newEnableFestiveEffects,
        }),
      });

      if (response.ok) {
        const updatedSettings: SiteSettings = await response.json();
        setSettings(updatedSettings);
      } else {
        // Handle non-successful update responses by reading the body only once
        let errorDetails = `Status: ${response.status}`;
        const errorText = await response.text();
        try {
          const errorData = JSON.parse(errorText);
          errorDetails = errorData.message || JSON.stringify(errorData);
        } catch {
           errorDetails = errorText || 'No error details available.';
        }
        setError(`Failed to update settings. ${errorDetails}`);
      }
    } catch (err) {
      setError('An error occurred while updating settings.');
      console.error('Error updating settings:', err);
    } finally {
      setUpdating(false);
    }
  };

  // --- Render Logic ---

  // 1. Show a loading skeleton while fetching data
  if (loading) {
    return <LoadingSkeleton />;
  }

  // 2. Show a clear error message if the fetch failed or data is invalid
  if (error || !settings) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-1">Festive Effects</h3>
        <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-md border border-red-200">
          <p className="font-semibold">Could not load settings</p>
          <p className="text-sm">{error || 'An unknown error occurred. Please try refreshing the page.'}</p>
        </div>
      </div>
    );
  }

  // 3. Render the main component UI if settings were fetched successfully
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-800 mb-1">Festive Effects</h3>
          <p className="text-gray-600 text-sm mb-2">
            Toggle festive animations and effects across the entire website.
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className={`text-sm font-medium ${settings.enable_festive_effects ? 'text-green-600' : 'text-gray-500'}`}>
              {settings.enable_festive_effects ? '🎉 Festive Mode ON' : '✨ Basic Mode'}
            </span>
          </div>
        </div>
        <div className="ml-4">
          <button
            onClick={handleToggle}
            disabled={updating}
            className={`
              relative inline-flex h-6 w-12 items-center rounded-full transition-colors duration-200 ease-in-out border-2
              focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
              ${updating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              ${settings.enable_festive_effects ? 'bg-indigo-600 border-indigo-700' : 'bg-gray-200 border-gray-400'}
            `}
            aria-pressed={settings.enable_festive_effects}
          >
            <span className="sr-only">Toggle Festive Effects</span>
            <span
              className={`
                inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out shadow-lg
                ${settings.enable_festive_effects ? 'translate-x-7' : 'translate-x-1'}
              `}
            />
          </button>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          <strong>When enabled:</strong> Visitors will see festive animations and visual effects.
        </p>
        <p className="text-sm text-gray-600 mt-1">
          <strong>When disabled:</strong> The website will display with standard styling.
        </p>
      </div>
    </div>
  );
};

export default FestiveEffectsToggle;

