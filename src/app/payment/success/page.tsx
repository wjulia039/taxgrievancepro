"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { usePaymentStore } from "@/store/paymentStore";
import { useAuthStore } from "@/store/authStore";
import { CheckCircle2, Download, FileText, ArrowRight } from "lucide-react";

export default function PaymentSuccessPage() {
  const { hasPaid, paymentId } = usePaymentStore();
  const { user } = useAuthStore();

  if (!hasPaid) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-border">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-bold mb-4">No Payment Found</h2>
            <p className="text-muted-foreground mb-6">
              You haven&apos;t completed a payment yet.
            </p>
            <Button asChild>
              <Link href="/payment">Go to Payment</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-lg w-full border-border">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto bg-green-500/10 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold text-green-500 mb-2">
              Payment Successful!
            </h1>
            <p className="text-muted-foreground">
              Thank you for your purchase, {user?.name || "Customer"}!
            </p>
          </div>

          <div className="bg-muted/50 rounded-xl p-6 mb-6 border border-border">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Order Details
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order ID</span>
                <span className="font-mono">{paymentId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Product</span>
                <span>Property Tax Appeal Letter</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount Paid</span>
                <span className="font-semibold">$19.99</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email</span>
                <span>{user?.email || "N/A"}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Button className="w-full" size="lg">
              <Download className="mr-2 h-5 w-5" />
              Download Your Appeal Letter
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/">
                Return to Home
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-6">
            A confirmation email has been sent to your email address.
            <br />
            If you have any questions, please contact support.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
