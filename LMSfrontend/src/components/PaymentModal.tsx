

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CheckCircle,
  Award,
  Shield,
  Star,
  Lock,
  RotateCcw,
} from "lucide-react";
import { createPayment, startTapPayment } from "@/components/services/paymentService";
import { useLocationStore } from "@/lib/locationStore";
import { Course } from "@/hooks/useEnrollments";

export default function PaymentModal({
  course,
  isOpen,
  onClose,
}: {
  course: Course | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  const { t, language } = useI18n();
  const { toast } = useToast();
  const { isEgyptUser } = useLocationStore();
  const [loading, setLoading] = useState(false);
  const [exchangeRate, setExchangeRate] = useState<number>(50); // fallback
  const [displayPrice, setDisplayPrice] = useState<number>(0);
  const [savings, setSavings] = useState<number>(0);

  // Fetch USD → EGP rate
  useEffect(() => {
    const fetchRate = async () => {
      try {
        const res = await fetch("https://open.er-api.com/v6/latest/USD");
        const data = await res.json();
        if (data?.rates?.EGP) setExchangeRate(data.rates.EGP);
      } catch (err) {
        console.warn("Failed to fetch exchange rate, using fallback 50");
      }
    };
    fetchRate();
  }, []);

  // Compute display price and savings once
  useEffect(() => {
    if (!course) return;
    const usdPrice = course.price;
    const usdOriginal = course.originalPrice ?? course.price;

    const price = isEgyptUser ? Math.round(usdPrice * exchangeRate) : Math.round(usdPrice);
    const original = isEgyptUser ? Math.round(usdOriginal * exchangeRate) : Math.round(usdOriginal);

    setDisplayPrice(price);
    setSavings(original - price);
  }, [course, exchangeRate, isEgyptUser]);

  if (!course) return null;

  const currency = isEgyptUser ? "E£" : "$";

  const handlePayment = async () => {
    if (loading) return;
    try {
      setLoading(true);
      const payment = await createPayment(course.id, displayPrice, currency);
      const res = await startTapPayment(payment.id);
      if (res.redirect_url) window.location.href = res.redirect_url;
      else throw new Error("Redirect URL missing from Tap response");
    } catch (err: any) {
      console.error(err);
      toast({
        title: language === "ar" ? "خطأ" : "Error",
        description:
          err.message || (language === "ar" ? "حدث خطأ أثناء بدء عملية الدفع" : "An error occurred while starting payment"),
        variant: "destructive",
        action: (
          <Button variant="outline" size="sm" onClick={handlePayment} className="mt-2">
            <RotateCcw className="w-3 h-3 mr-1" />
            {language === "ar" ? "إعادة المحاولة" : "Try Again"}
          </Button>
        ),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {language === "ar" ? "إتمام عملية الشراء" : "Complete Your Purchase"}
          </DialogTitle>
          <DialogDescription>
            {language === "ar"
              ? "ادفع بأمان عبر Tap واحصل على وصول فوري للدورة"
              : "Pay securely via Tap and get instant access to the course"}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Course Summary */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">{language === "ar" ? "ملخص الطلب" : "Order Summary"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <img src={course.image} alt={course.title} className="w-20 h-16 object-cover rounded-lg" />
                <div className="flex-1">
                  <h3 className="font-semibold text-sm line-clamp-2">{course.title}</h3>
                  <p className="text-xs text-muted-foreground">
                    {language === "ar" ? "بواسطة" : "by"} {course.instructor}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs">{course.rating}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {course.level}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="space-y-2 pt-4 border-t">
                <div className="flex justify-between">
                  <span>{language === "ar" ? "السعر الأصلي" : "Original Price"}</span>
                  <span className={savings > 0 ? "line-through text-muted-foreground" : ""}>
                    {currency}{displayPrice + (savings > 0 ? savings : 0)}
                  </span>
                </div>

                {savings > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>{language === "ar" ? "الخصم" : "Discount"}</span>
                    <span>-{currency}{savings}</span>
                  </div>
                )}

                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>{language === "ar" ? "المجموع" : "Total"}</span>
                  <span>{currency}{displayPrice}</span>
                </div>
              </div>

              {/* Benefits */}
              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>{language === "ar" ? "وصول مدى الحياة" : "Lifetime access"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-blue-500" />
                  <span>{language === "ar" ? "شهادة إتمام" : "Certificate of completion"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-purple-500" />
                  <span>{language === "ar" ? "ضمان استرداد 30 يوم" : "30-day money-back guarantee"}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Section */}
          <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Lock className="w-5 h-5 text-gray-700" />
                {language === "ar" ? "الدفع عبر Tap" : "Pay with Tap"}
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                {language === "ar" ? "نظام دفع آمن معتمد من PCI DSS" : "Secure payment system certified by PCI DSS"}
              </p>
            </CardHeader>

            <CardContent className="space-y-4">
              <Button
                onClick={handlePayment}
                disabled={loading}
                className={`w-full h-12 font-semibold transition-all duration-300 ${
                  loading ? "opacity-75 cursor-not-allowed bg-gray-500" : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{language === "ar" ? "جاري المعالجة..." : "Processing..."}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <img src="/assets/payments/tap-logo.svg" alt="Tap" className="w-6 h-6" />
                    <span>
                      {language === "ar"
                        ? `ادفع ${currency}${displayPrice} الآن`
                        : `Pay ${currency}${displayPrice} now`}
                    </span>
                  </div>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                {language === "ar"
                  ? "🔒 سيتم تحويلك إلى بوابة Tap لإتمام الدفع بأمان"
                  : "🔒 You will be redirected to Tap to complete payment securely"}
              </p>

              <div className="flex justify-center gap-3 pt-2 opacity-80">
                <img src="/assets/payments/visa.svg" alt="Visa" className="h-6" />
                <img src="/assets/payments/mastercard.svg" alt="MasterCard" className="h-6" />
                <img src="/assets/payments/mada.svg" alt="Mada" className="h-6" />
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
