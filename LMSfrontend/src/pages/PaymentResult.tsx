import { useSearchParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { CheckCircle, XCircle, Home, ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n";
import { motion, AnimatePresence } from "framer-motion";

export default function PaymentResult() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { language } = useI18n();
  const [counter, setCounter] = useState(15);
  const [isReady, setIsReady] = useState(false);

  // Store values in refs to keep them after URL cleanup
  const statusRef = useRef((searchParams.get("status") || "").toLowerCase());
  const courseIdRef = useRef(searchParams.get("courseId"));

  const status = statusRef.current;
  const courseId = courseIdRef.current;
  const isSuccess = status === "success" || status === "paid";

  useEffect(() => {
    // 🧹 Clean URL: Remove parameters from address bar after reading them
    if (window.location.search) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    setIsReady(true);

    const interval = setInterval(() => {
      setCounter((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const timeout = setTimeout(() => {
      if (isSuccess) {
        navigate("/dashboard");
      } else {
        navigate("/courses");
      }
    }, 15000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [isSuccess, navigate]);

  const handleDashboard = () => {
    navigate("/dashboard");
  };

  const handleReturnToCourse = () => {
    if (courseId) {
      navigate(`/courses/${courseId}`);
    } else {
      navigate("/courses");
    }
  };

  if (!isReady) return null;

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#0a0a0a] p-4 overflow-hidden relative">
      {/* Dynamic Background Elements */}
      <div className={`absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-20 ${isSuccess ? 'bg-green-500' : 'bg-red-500'}`} />
      <div className={`absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-20 ${isSuccess ? 'bg-emerald-500' : 'bg-rose-500'}`} />

      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-lg z-10"
        >
          <Card className="border-none bg-white/5 backdrop-blur-xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden">
            <CardContent className="p-0">
              {/* Top Banner */}
              <div className={`h-2 w-full ${isSuccess ? 'bg-green-500' : 'bg-red-500'}`} />

              <div className="p-8 sm:p-12 flex flex-col items-center space-y-8">
                {/* Animated Icon Container */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
                  className={`rounded-full p-8 relative ${isSuccess ? 'bg-green-500/10' : 'bg-red-500/10'}`}
                >
                  {isSuccess ? (
                    <CheckCircle className="w-24 h-24 text-green-500" />
                  ) : (
                    <XCircle className="w-24 h-24 text-red-500" />
                  )}

                  {/* Pulse Effect */}
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className={`absolute inset-0 rounded-full ${isSuccess ? 'bg-green-500/20' : 'bg-red-500/20'}`}
                  />
                </motion.div>

                {/* Text Content */}
                <div className="text-center space-y-3">
                  <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className={`text-4xl font-black tracking-tight ${isSuccess ? 'text-white' : 'text-white'}`}
                  >
                    {isSuccess
                      ? language === "ar" ? "تم الدفع بنجاح!" : "Payment Successful!"
                      : language === "ar" ? "فشل الدفع" : "Payment Failed"}
                  </motion.h2>

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-gray-400 text-lg leading-relaxed max-w-xs mx-auto"
                  >
                    {isSuccess
                      ? language === "ar"
                        ? "تم إتمام الدفع بنجاح وتم تسجيلك في الدورة."
                        : "Your payment has been completed successfully and you are now enrolled."
                      : language === "ar"
                        ? "حدثت مشكلة أثناء معالجة الدفع. يرجى المحاولة مرة أخرى."
                        : "There was an issue processing your payment. Please try again."}
                  </motion.p>
                </div>

                {/* Action Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex flex-col sm:flex-row gap-4 w-full"
                >
                  <Button
                    onClick={handleDashboard}
                    className={`flex-1 h-14 text-lg font-bold rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] ${isSuccess
                        ? "bg-green-600 hover:bg-green-500 text-white shadow-[0_10px_20px_rgba(22,163,74,0.3)]"
                        : "bg-white/10 hover:bg-white/20 text-white backdrop-blur-md"
                      }`}
                  >
                    <Home className="w-6 h-6 mr-2" />
                    {language === "ar" ? "لوحة التحكم" : "Dashboard"}
                  </Button>

                  <Button
                    onClick={handleReturnToCourse}
                    variant="outline"
                    className={`flex-1 h-14 text-lg font-bold rounded-2xl border-2 transition-all hover:scale-[1.02] active:scale-[0.98] ${isSuccess
                        ? "border-green-600/50 text-green-500 hover:bg-green-500/10"
                        : "border-red-600/50 text-red-500 hover:bg-red-500/10 shadow-[0_10px_20px_rgba(220,38,38,0.2)]"
                      }`}
                  >
                    {isSuccess ? (
                      <ArrowLeft className="w-6 h-6 mr-2" />
                    ) : (
                      <RefreshCw className="w-6 h-6 mr-2 animate-spin-slow" />
                    )}
                    {isSuccess
                      ? language === "ar" ? "الذهاب إلى الدورة" : "Go to Course"
                      : language === "ar" ? "المحاولة مرة أخرى" : "Try Again"}
                  </Button>
                </motion.div>

                {/* Footer Info */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="pt-4 flex items-center space-x-2 text-gray-500"
                >
                  <div className="w-2 h-2 rounded-full bg-gray-600 animate-pulse" />
                  <p className="text-sm font-medium">
                    {language === "ar"
                      ? `سيتم التوجيه تلقائياً خلال ${counter} ثانية...`
                      : `Auto-redirecting in ${counter} seconds...`}
                  </p>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}