"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const pricingPlans = [
  {
    id: "starter_monthly",
    name: "Starter",
    price: "$18",
    credits: 2000,
    interval: "month",
    features: [
      "2,000 Power Units per month",
      "~5 complete 15s videos",
      "~200 AI image generations",
      "All AI models access",
      "HD quality (1080p)",
      "No watermark",
      "Commercial use",
      "Email support",
      "Cancel anytime",
    ],
    popular: false,
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "pro_monthly",
    name: "Pro",
    price: "$30",
    credits: 3330,
    interval: "month",
    features: [
      "3,330 Power Units per month",
      "~8 complete 15s videos",
      "~330 AI image generations",
      "All AI models access",
      "HD/4K quality",
      "No watermark",
      "Priority processing",
      "Priority email support",
      "Commercial use",
      "Cancel anytime",
    ],
    popular: true,
    color: "from-purple-500 to-pink-500",
  },
  {
    id: "business_monthly",
    name: "Business",
    price: "$88",
    credits: 9800,
    interval: "month",
    features: [
      "9,800 Power Units per month",
      "~24 complete 15s videos",
      "~980 AI image generations",
      "All AI models access",
      "4K quality support",
      "No watermark",
      "Fastest processing",
      "Dedicated support",
      "API access",
      "Commercial use",
      "Cancel anytime",
    ],
    popular: false,
    color: "from-orange-500 to-red-500",
  },
];

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const router = useRouter();

  const handleCheckout = async (productId: string) => {
    try {
      setLoading(productId);

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product_id: productId,
          currency: "usd",
          locale: "en",
        }),
      });

      const result = await response.json();

      if (result.code === 0 && result.data?.checkout_url) {
        // Redirect to Creem checkout
        window.location.href = result.data.checkout_url;
      } else {
        alert(result.message || "Checkout failed. Please try again.");
        setLoading(null);
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("An error occurred. Please try again.");
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              AI Video Director
            </div>
          </div>
          <Button variant="outline" onClick={() => router.push("/")}>
            ← Back to Home
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Select the perfect plan for your video creation needs. All plans
            include access to cutting-edge AI models like Sora 2, Veo 3.1, and
            more.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pricingPlans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative overflow-hidden transition-all hover:shadow-2xl ${
                plan.popular
                  ? "border-2 border-purple-500 shadow-xl scale-105"
                  : "border-gray-200"
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute top-0 right-0">
                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-tl-none rounded-br-none px-4 py-1">
                    Most Popular
                  </Badge>
                </div>
              )}

              {/* Gradient Header */}
              <div
                className={`bg-gradient-to-r ${plan.color} text-white px-6 py-8`}
              >
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-bold">{plan.price}</span>
                  <span className="text-lg opacity-90">/month</span>
                </div>
                <p className="text-sm opacity-90 mt-2">
                  {plan.credits} credits per month
                </p>
              </div>

              {/* Features */}
              <div className="p-6 space-y-4">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleCheckout(plan.id)}
                  disabled={loading === plan.id}
                  className={`w-full mt-6 ${
                    plan.popular
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                      : ""
                  }`}
                >
                  {loading === plan.id ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Processing...
                    </>
                  ) : (
                    <>Get Started →</>
                  )}
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-2">
                How do Power Units work?
              </h3>
              <p className="text-gray-600 text-sm">
                Power Units are consumed when you generate videos and images.
                A typical 15s high-quality video costs ~400 units, economy mode ~306 units.
                New users get 306 free Power Units (1 video).
                Daily login + social share earns another 306 units (with watermark).
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-2">
                Can I cancel anytime?
              </h3>
              <p className="text-gray-600 text-sm">
                Yes! All plans are billed monthly and you can cancel anytime.
                You'll continue to have access to your remaining credits until
                the end of your billing period.
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-2">
                What AI models are included?
              </h3>
              <p className="text-gray-600 text-sm">
                All plans include access to 18+ cutting-edge AI models including
                Sora 2, Veo 3.1, Wan 2.5, Seedance, and more. You can switch
                between models based on your needs.
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-2">
                Do credits roll over?
              </h3>
              <p className="text-gray-600 text-sm">
                Credits are valid for the duration of your subscription. Unused
                credits expire at the end of each billing period.
              </p>
            </Card>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="mt-20 text-center">
          <p className="text-gray-600 mb-4">
            Not sure which plan is right for you?
          </p>
          <Button variant="outline" onClick={() => router.push("/")}>
            Try Free Demo First
          </Button>
        </div>
      </div>
    </div>
  );
}
