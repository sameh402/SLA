import { useSearchParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { CheckCircle, XCircle } from "lucide-react";

export default function PaymentResult() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [counter, setCounter] = useState(5);
  const status = (searchParams.get("status") || "").toLowerCase();


useEffect(() => {
  if (status === "success" || status === "paid") {
    toast.success("✅ Payment successful! Course enrolled.");
  } else {
    toast.error("❌ Payment failed. Try again.");
  }

  const interval = setInterval(() => {
    setCounter((prev) => prev - 1);
  }, 1000);

  const timeout = setTimeout(() => {
    navigate("/Store");
  }, 5000);

  return () => {
    clearInterval(interval);
    clearTimeout(timeout);
  };
}, [status, navigate]);

  const isSuccess = status === "success";

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
      <div
        className={`max-w-md w-full p-6 rounded-xl shadow-lg transform transition-all duration-500 ${
          isSuccess ? "bg-green-50 border border-green-300" : "bg-red-50 border border-red-300"
        }`}
      >
        <div className="flex flex-col items-center space-y-4">
          <div
            className={`rounded-full p-4 ${isSuccess ? "bg-green-100" : "bg-red-100"}`}
          >
            {isSuccess ? (
              <CheckCircle className="w-16 h-16 text-green-500 animate-bounce" />
            ) : (
              <XCircle className="w-16 h-16 text-red-500 animate-pulse" />
            )}
          </div>

          <h2 className={`text-2xl font-bold ${isSuccess ? "text-green-700" : "text-red-700"}`}>
            {isSuccess ? "Payment Successful!" : "Payment Failed"}
          </h2>

          <p className="text-center text-gray-600">
            {isSuccess
              ? "Your payment has been completed and you are now enrolled in the course."
              : "There was an issue processing your payment. Please try again."}
          </p>

          <div className="mt-4">
            <button
              onClick={() => navigate("/Store")}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors duration-300 ${
                isSuccess
                  ? "bg-green-500 hover:bg-green-600 text-white"
                  : "bg-red-500 hover:bg-red-600 text-white"
              }`}
            >
              {isSuccess ? "Go to My Courses" : "Try Again"}
            </button>
          </div>

          <p className="mt-2 text-xs text-gray-400">
            Redirecting in {counter} second{counter > 1 ? "s" : ""}...
          </p>
        </div>
      </div>
    </div>
  );
}