"use client";

import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { isEarlyBirdOfferValid, getTrainingProgramPrice } from "@/lib/utils";
import { validateName, validateEmail, validatePhone, validateRequired, validatePincode, validateCity, validateStreet } from "@/lib/validation";

interface TrainingProgram {
    id: number;
    name: string;
    slug: string;
    description: string;
    price: number;
    duration: number;
    dailyHours: string;
    type: string;
    isActive: boolean;
    hasEarlyBirdOffer: boolean;
    earlyBirdPrice?: number;
    originalPrice?: number;
    earlyBirdEndDate?: string | Date;
}

interface RegistrationModalProps {
    program: TrainingProgram;
    onClose: () => void;
    user: any;
    onRegistrationComplete: (registration: any) => void;
}

const RegistrationModal: React.FC<RegistrationModalProps> = ({
    program,
    onClose,
    user,
    onRegistrationComplete,
}) => {
    const [formData, setFormData] = useState({
        participantName: user?.name || "",
        participantEmail: user?.email || "",
        participantPhone: "",
        participantAddress: {
            street: "",
            city: "",
            state: "",
            pincode: "",
        },
        preferredStartDate: "",
        specialRequirements: "",
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const handleChange = (field: string, value: string) => {
        if (field.startsWith('address.')) {
            const addressField = field.split('.')[1];
            setFormData({
                ...formData,
                participantAddress: { ...formData.participantAddress, [addressField]: value }
            });
        } else {
            setFormData({ ...formData, [field]: value });
        }
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const newErrors: { [key: string]: string } = {};

        const nameErr = validateName(formData.participantName, 'Full name');
        if (nameErr) newErrors.participantName = nameErr;

        const emailErr = validateEmail(formData.participantEmail);
        if (emailErr) newErrors.participantEmail = emailErr;

        const phoneErr = validatePhone(formData.participantPhone);
        if (!formData.participantPhone.trim()) {
            newErrors.participantPhone = 'Phone number is required';
        } else if (phoneErr) {
            newErrors.participantPhone = phoneErr;
        }

        const streetErr = validateStreet(formData.participantAddress.street);
        if (streetErr) newErrors['address.street'] = streetErr;

        const cityErr = validateCity(formData.participantAddress.city);
        if (cityErr) newErrors['address.city'] = cityErr;

        const stateErr = validateRequired(formData.participantAddress.state, 'State');
        if (stateErr) newErrors['address.state'] = stateErr;

        const pincodeErr = validatePincode(formData.participantAddress.pincode);
        if (pincodeErr) newErrors['address.pincode'] = pincodeErr;

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});
        setLoading(true);

        try {
            const response = await fetch("/api/training-registrations", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    trainingProgramId: program.id,
                    ...formData,
                    userId: user?.id || null,
                }),
            });

            if (response.ok) {
                const registration = await response.json();
                toast.success(`Registration successful! Your registration number is ${registration.registrationNumber}`);

                // Show payment modal after successful registration
                onRegistrationComplete(registration);
            } else {
                const error = await response.json();

                // Handle duplicate registration error specifically
                if (response.status === 409 && error.existingRegistration) {
                    const { existingRegistration } = error;
                    toast.error(
                        `You are already registered for this program! Registration: ${existingRegistration.registrationNumber} (Status: ${existingRegistration.status})`,
                        {
                            duration: 6000,
                            style: {
                                maxWidth: '500px',
                            }
                        }
                    );
                } else {
                    toast.error(error.error || "Failed to register");
                }
            }
        } catch (error) {
            toast.error("Error submitting registration");
        } finally {
            setLoading(false);
        }
    };

    const isEarlyBirdValid = isEarlyBirdOfferValid(program);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold">Register for {program.name}</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 text-2xl"
                        >
                            ×
                        </button>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg mb-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="font-semibold">{program.name}</h3>
                                <p className="text-sm text-gray-600">
                                    {program.duration} days • {program.dailyHours} • ₹
                                    {getTrainingProgramPrice(program).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Full Name *
                                </label>
                                <input
                                    type="text"
                                    value={formData.participantName}
                                    onChange={(e) => handleChange('participantName', e.target.value)}
                                    className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 ${errors.participantName ? 'border-red-400 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-500'}`}
                                />
                                {errors.participantName && <p className="text-xs text-red-500 mt-1">{errors.participantName}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email Address *
                                </label>
                                <input
                                    type="email"
                                    value={formData.participantEmail}
                                    onChange={(e) => handleChange('participantEmail', e.target.value)}
                                    className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 ${errors.participantEmail ? 'border-red-400 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-500'}`}
                                />
                                {errors.participantEmail && <p className="text-xs text-red-500 mt-1">{errors.participantEmail}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Phone Number *
                                </label>
                                <input
                                    type="tel"
                                    value={formData.participantPhone}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                        handleChange('participantPhone', val);
                                    }}
                                    maxLength={10}
                                    className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 ${errors.participantPhone ? 'border-red-400 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-500'}`}
                                    placeholder="10-digit mobile number"
                                />
                                {errors.participantPhone && <p className="text-xs text-red-500 mt-1">{errors.participantPhone}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Preferred Start Date
                                </label>
                                <input
                                    type="date"
                                    value={formData.preferredStartDate}
                                    onChange={(e) => setFormData({ ...formData, preferredStartDate: e.target.value })}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Address *
                            </label>
                            <div className="space-y-3">
                                <div>
                                    <input
                                        type="text"
                                        placeholder="Street Address"
                                        value={formData.participantAddress.street}
                                        onChange={(e) => handleChange('address.street', e.target.value)}
                                        className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 ${errors['address.street'] ? 'border-red-400 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-500'}`}
                                    />
                                    {errors['address.street'] && <p className="text-xs text-red-500 mt-1">{errors['address.street']}</p>}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-3">
                                    <div>
                                        <input
                                            type="text"
                                            placeholder="City"
                                            value={formData.participantAddress.city}
                                            onChange={(e) => handleChange('address.city', e.target.value)}
                                            className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 ${errors['address.city'] ? 'border-red-400 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-500'}`}
                                        />
                                        {errors['address.city'] && <p className="text-xs text-red-500 mt-1">{errors['address.city']}</p>}
                                    </div>
                                    <div>
                                        <input
                                            type="text"
                                            placeholder="State"
                                            value={formData.participantAddress.state}
                                            onChange={(e) => handleChange('address.state', e.target.value)}
                                            className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 ${errors['address.state'] ? 'border-red-400 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-500'}`}
                                        />
                                        {errors['address.state'] && <p className="text-xs text-red-500 mt-1">{errors['address.state']}</p>}
                                    </div>
                                    <div>
                                        <input
                                            type="text"
                                            placeholder="PIN Code"
                                            value={formData.participantAddress.pincode}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                                                handleChange('address.pincode', val);
                                            }}
                                            maxLength={6}
                                            className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 ${errors['address.pincode'] ? 'border-red-400 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-500'}`}
                                        />
                                        {errors['address.pincode'] && <p className="text-xs text-red-500 mt-1">{errors['address.pincode']}</p>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Special Requirements or Questions
                            </label>
                            <textarea
                                value={formData.specialRequirements}
                                onChange={(e) => setFormData({ ...formData, specialRequirements: e.target.value })}
                                rows={3}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Any dietary restrictions, accessibility needs, or questions..."
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-3 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200 font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-blue hover:bg-blue-dark text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                            >
                                {loading ? "Registering..." : "Continue to Payment"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RegistrationModal;
