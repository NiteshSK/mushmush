"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';

const SetupAdminPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    setupToken: '',
  });
  const [loading, setLoading] = useState(false);
  const [managed, setManaged] = useState(false);
  const [issue, setIssue] = useState("");
  const [checking, setChecking] = useState(true);
  const [setupRequired, setSetupRequired] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkSetupStatus();
  }, []);

  const checkSetupStatus = async () => {
    setChecking(true); setIssue("");
    try {
      const response = await fetch("/api/setup-admin", { cache: "no-store" });
      if (!response.ok) throw new Error();
      const data = await response.json();
      setSetupRequired(data.setupRequired);
      setManaged(data.managedGoogle === true);
      if (!data.hasAdmin && !data.setupRequired) setIssue("Owner setup is disabled. Configure the setup token to use this page.");
    } catch {
      setIssue("Setup status could not be loaded.");
      setSetupRequired(false);
    } finally { setChecking(false); }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!managed && formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (!managed && formData.password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/setup-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          setupToken: formData.setupToken,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Admin user created successfully!');
        router.push(managed ? "/admin" : "/auth/signin?callbackUrl=/admin");
      } else {
        toast.error(data.error || 'Failed to create admin user');
      }
    } catch (error) {
      console.error('Error creating admin user:', error);
      toast.error('Failed to create admin user');
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-1">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue mx-auto mb-4"></div>
          <p className="text-gray-6">Checking setup status...</p>
        </div>
      </div>
    );
  }

  if (issue) return <div className="p-6" role="alert">{issue} <button onClick={checkSetupStatus}>Check again</button></div>;
  if (!setupRequired) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-1">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-dark mb-4">Setup Complete</h1>
          <p className="text-gray-6 mb-6">Admin user already exists.</p>
          <button
            onClick={() => router.push('/admin')}
            className="bg-blue text-white px-6 py-2 rounded-lg hover:bg-blue-dark transition-colors"
          >
            Go to Admin Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster />
      <div className="min-h-screen flex items-center justify-center bg-gray-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-dark">
            Setup Admin Account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-6">
            Create the first owner account for Kosvana.
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-dark">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleInputChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-3 placeholder-gray-5 text-dark rounded-lg focus:outline-none focus:ring-blue focus:border-blue focus:z-10 sm:text-sm"
                placeholder="Enter your full name"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-dark">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-3 placeholder-gray-5 text-dark rounded-lg focus:outline-none focus:ring-blue focus:border-blue focus:z-10 sm:text-sm"
                placeholder="Enter your email address"
              />
            </div>
            
            {managed ? <p>First <a className="underline" href="/auth/signin?callbackUrl=/setup-admin">sign in with your Google Workspace account</a>, then enter that account’s email above.</p> : <>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-dark">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleInputChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-3 placeholder-gray-5 text-dark rounded-lg focus:outline-none focus:ring-blue focus:border-blue focus:z-10 sm:text-sm"
                placeholder="Enter your password"
              />
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-dark">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-3 placeholder-gray-5 text-dark rounded-lg focus:outline-none focus:ring-blue focus:border-blue focus:z-10 sm:text-sm"
                placeholder="Confirm your password"
              />
            </div>
            
            </>}
            <div>
              <label htmlFor="setupToken" className="block text-sm font-medium text-dark">
                Setup token
              </label>
              <input
                id="setupToken"
                name="setupToken"
                type="password" required
                value={formData.setupToken}
                onChange={handleInputChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-3 placeholder-gray-5 text-dark rounded-lg focus:outline-none focus:ring-blue focus:border-blue focus:z-10 sm:text-sm"
                placeholder="Enter the configured setup token"
              />
              <p className="mt-1 text-xs text-gray-5">
                Use the setup token configured for this deployment.
              </p>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue hover:bg-blue-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating Admin User...
                </div>
              ) : (
                'Create Admin User'
              )}
            </button>
          </div>
        </form>
        
        <div className="text-center">
          <p className="text-xs text-gray-5">
            This page is only available when no admin users exist
          </p>
        </div>
      </div>
    </div>
    </>
  );
};

export default SetupAdminPage;
