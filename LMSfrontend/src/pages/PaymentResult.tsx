import { useSearchParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { CheckCircle, XCircle, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n";

export default function PaymentResult() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { language } = useI18n();
  const [counter, setCounter] = useState(10);

  const status = (searchParams.get("status") || "").toLowerCase();
  const courseId = searchParams.get("courseId");
  const isSuccess = status === "success" || status === "paid";

  useEffect(() => {
    const interval = setInterval(() => {
      setCounter((prev) => prev - 1);
    }, 1000);

    const timeout = setTimeout(() => {
      if (isSuccess) {
        navigate("/dashboard");
      } else {
        navigate("/courses");
      }
    }, 10000);

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

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <Card
        className={`max-w-lg w-full shadow-2xl transform transition-all duration-500 ${isSuccess
            ? "border-green-300 bg-gradient-to-br from-green-50 to-white"
            : "border-red-300 bg-gradient-to-br from-red-50 to-white"
          }`}
      >
        <CardContent className="p-8">
          <div className="flex flex-col items-center space-y-6">
            {/* Icon */}
            <div
              className={`rounded-full p-6 ${isSuccess ? "bg-green-100" : "bg-red-100"
                }`}
            >
              {isSuccess ? (
                <CheckCircle className="w-20 h-20 text-green-500 animate-bounce" />
              ) : (
                <XCircle className="w-20 h-20 text-red-500 animate-pulse" />
              )}
            </div>

            {/* Title */}
            <h2
              className={`text-3xl font-bold text-center ${isSuccess ? "text-green-700" : "text-red-700"
                }`}
            >
              {isSuccess
                ? language === "ar"
                  ? "تم الدفع بنجاح!"
                  : "Payment Successful!"
                : language === "ar"
                  ? "فشل الدفع"
                  : "Payment Failed"}
            </h2>

            {/* Description */}
            <p className="text-center text-gray-600 text-lg">
              {isSuccess
                ? language === "ar"
                  ? "تم إتمام الدفع بنجاح وتم تسجيلك في الدورة."
                  : "Your payment has been completed successfully and you are now enrolled in the course."
                : language === "ar"
                  ? "حدثت مشكلة أثناء معالجة الدفع. يرجى المحاولة مرة أخرى."
                  : "There was an issue processing your payment. Please try again."}
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 w-full mt-6">
              <Button
                onClick={handleDashboard}
                className={`flex-1 h-12 text-base font-semibold ${isSuccess
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-gray-600 hover:bg-gray-700"
                  }`}
              >
                <Home className="w-5 h-5 mr-2" />
                {language === "ar" ? "لوحة التحكم" : "Dashboard"}
              </Button>

              <Button
                onClick={handleReturnToCourse}
                variant="outline"
                className={`flex-1 h-12 text-base font-semibold ${isSuccess
                    ? "border-green-600 text-green-600 hover:bg-green-50"
                    : "border-red-600 text-red-600 hover:bg-red-50"
                  }`}
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                {isSuccess
                  ? language === "ar"
                    ? "الذهاب إلى الدورة"
                    : "Go to Course"
                  : language === "ar"
                    ? "العودة إلى الدورة"
                    : "Return to Course"}
              </Button>
            </div>

            {/* Auto-redirect message */}
            <p className="mt-4 text-sm text-gray-500 text-center">
              {language === "ar"
                ? `سيتم التوجيه تلقائياً خلال ${counter} ثانية...`
                : `Auto-redirecting in ${counter} second${counter > 1 ? "s" : ""}...`}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}