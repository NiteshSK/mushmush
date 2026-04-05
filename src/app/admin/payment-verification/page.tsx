"use client";
import AdminAuthWrapper from "@/components/Admin/AdminAuthWrapper";
import PaymentVerification from "@/components/Admin/PaymentVerification";

export default function PaymentVerificationPage() {
  return (
    <AdminAuthWrapper>
      <PaymentVerification />
    </AdminAuthWrapper>
  );
}
