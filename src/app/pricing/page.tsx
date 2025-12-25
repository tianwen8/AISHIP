"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const pricingPlans = [
  {
    id: "basic_monthly",
    name: "Basic",
    price: "$4.90",
    credits: 150,
    interval: "month",
    features: [
      "Prompt-only storyboards",
      "150 credits per month",
      "Export prompts for Sora, Kling, Veo, Runway",
      "Email support",
      "Cancel anytime",
    ],
    popular: false,
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "pro_monthly",
    name: "Pro",
    price: "$9.90",
    credits: 300,
    interval: "month",
    features: [
      "Prompt + Flux preview images",
      "300 credits per month",
      "Priority processing",
      "Priority email support",
      "Cancel anytime",
    ],
    popular: true,
    color: "from-emerald-500 to-teal-500",
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
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent font-display">
              PromptShip
            </div>
          </div>
          <Button variant="outline" onClick={() => router.push("/")}>Back to Home</Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 font-display">Choose Your Plan</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose a plan that fits your workflow. Basic gives text-only storyboards; Pro adds Flux preview images.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {pricingPlans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative overflow-hidden transition-all hover:shadow-2xl ${
                plan.popular
                  ? "border-2 border-emerald-500 shadow-xl scale-105"
                  : "border-gray-200"
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0">
                  <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-tl-none rounded-br-none px-4 py-1">
                    Most Popular
                  </Badge>
                </div>
              )}

              <div className={`bg-gradient-to-r ${plan.color} text-white px-6 py-8`}>
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-bold">{plan.price}</span>
                  <span className="text-lg opacity-90">/month</span>
                </div>
                <p className="text-sm opacity-90 mt-2">{plan.credits} credits per month</p>
              </div>

              <div className="p-6 space-y-4">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">-</span>
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleCheckout(plan.id)}
                  disabled={loading === plan.id}
                  className={`w-full mt-6 ${
                    plan.popular
                      ? "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                      : ""
                  }`}
                >
                  {loading === plan.id ? "Processing..." : "Get Started"}
                </Button>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8 font-display">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-2">How do credits work?</h3>
              <p className="text-gray-600 text-sm">
                Credits are consumed when you generate storyboards. Pro can also spend credits on Flux preview images.
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-2">Can I cancel anytime?</h3>
              <p className="text-gray-600 text-sm">
                Yes. All plans are billed monthly and you can cancel anytime. You will keep access until the end of your billing period.
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-2">What AI models are included?</h3>
              <p className="text-gray-600 text-sm">
                Prompts are generated with high-quality LLMs. Pro adds preview images via Fal/Flux.
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-2">Do credits roll over?</h3>
              <p className="text-gray-600 text-sm">
                Credits are valid for the duration of your subscription. Unused credits expire at the end of each billing period.
              </p>
            </Card>
          </div>
        </div>

        <div className="mt-20 text-center">
          <p className="text-gray-600 mb-4">Not sure which plan is right for you?</p>
          <Button variant="outline" onClick={() => router.push("/")}>Try Free Demo First</Button>
        </div>
      </div>
    </div>
  );
}
