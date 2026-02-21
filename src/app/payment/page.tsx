"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store/authStore";
import { usePaymentStore } from "@/store/paymentStore";
import {
  ArrowLeft,
  CreditCard,
  Lock,
  Check,
  Loader2,
  Shield,
} from "lucide-react";

export default function PaymentPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { setPaymentComplete, isProcessing, setProcessing, hasPaid } =
    usePaymentStore();

  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  if (hasPaid) {
    router.push("/payment/success");
    return null;
  }

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(" ");
    } else {
      return value;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      return v.substring(0, 2) + "/" + v.substring(2, 4);
    }
    return v;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (!cardNumber || !expiry || !cvc || !name) {
      setError("Please fill in all fields");
      return;
    }

    if (cardNumber.replace(/\s/g, "").length < 16) {
      setError("Please enter a valid card number");
      return;
    }

    setProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const paymentId = "pay_" + Math.random().toString(36).substring(7);
    setPaymentComplete(paymentId);
    router.push("/payment/success");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="h-16 px-6 flex items-center sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <Link
          href="/appeal"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Appeal</span>
        </Link>
      </header>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          {/* Order Summary */}
          <Card className="mb-6 border-primary/20 bg-primary/5">
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">Property Tax Appeal Letter</h3>
                  <p className="text-sm text-muted-foreground">
                    Professional appeal document
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">$19.99</p>
                  <p className="text-xs text-muted-foreground">
                    One-time payment
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-primary/20 space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Professional formatted letter</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Comparable property analysis</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Instant download</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Form */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment Details
              </CardTitle>
              <CardDescription>
                Enter your card information to complete the purchase
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                {error && (
                  <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg border border-destructive/20">
                    {error}
                  </div>
                )}

                {!isAuthenticated && (
                  <div className="bg-yellow-500/10 text-yellow-500 text-sm p-3 rounded-lg border border-yellow-500/20">
                    Please{" "}
                    <Link href="/login" className="font-medium underline">
                      sign in
                    </Link>{" "}
                    to continue with payment.
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="name">Cardholder Name</Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    placeholder="4242 4242 4242 4242"
                    value={cardNumber}
                    onChange={(e) =>
                      setCardNumber(formatCardNumber(e.target.value))
                    }
                    maxLength={19}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiry">Expiry Date</Label>
                    <Input
                      id="expiry"
                      placeholder="MM/YY"
                      value={expiry}
                      onChange={(e) =>
                        setExpiry(formatExpiry(e.target.value))
                      }
                      maxLength={5}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvc">CVC</Label>
                    <Input
                      id="cvc"
                      placeholder="123"
                      value={cvc}
                      onChange={(e) =>
                        setCvc(e.target.value.replace(/[^0-9]/g, ""))
                      }
                      maxLength={4}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isProcessing || !isAuthenticated}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      Pay $19.99
                    </>
                  )}
                </Button>
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <Shield className="w-4 h-4" />
                  <span>
                    Secured by Stripe. Your payment information is encrypted.
                  </span>
                </div>
              </CardFooter>
            </form>
          </Card>

          <p className="text-center text-xs text-muted-foreground mt-4">
            By completing this purchase, you agree to our{" "}
            <Link href="/terms" className="underline">
              Terms of Service
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
