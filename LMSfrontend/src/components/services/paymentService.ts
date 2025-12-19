// import api from "./api";

// export async function createPayment(courseId: number, amount: number) {
//   const res = await api.post("/payments/", {
//     course: courseId,
//     amount: amount,
//     currency: "USD",
//   });
//   return res.data;
// }

// export async function startTapPayment(paymentId: number) {
//   const res = await api.post(`/payments/${paymentId}/pay/`);
//   return res.data;
// }


import api from "./api";

// 🧠 Detect currency based on user's IP address
async function detectCurrency(): Promise<string> {
  try {
    const res = await fetch("https://ipapi.co/json/");
    const data = await res.json();
    return data.currency || "USD";
  } catch (error) {
    console.warn("Failed to detect currency, defaulting to USD");
    return "USD";
  }
}

// 🧾 Create Payment (auto currency)
export async function createPayment(courseId: number, amount: number) {
  const currency = await detectCurrency();
  const res = await api.post("/api/payments/", {
    course: courseId,
    amount: amount,
    currency: currency, // ✅ auto detected currency
  });
  return res.data;
}

// 💳 Start Tap Payment
export async function startTapPayment(paymentId: number) {
  const res = await api.post(`/api/payments/${paymentId}/pay/`);
  return res.data;
}
