// import React, { useMemo, useState, useEffect } from "react";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Badge } from "@/components/ui/badge";
// import { adminSummary } from "@/api/admin";

// // Sample income data for BI-like dashboard (USD)
// // Organized by year -> months; daily data is generated from monthly totals
// const incomeData: Record<number, { month: string; value: number }[]> = {
//   2022: [
//     { month: "Jan", value: 4800 },
//     { month: "Feb", value: 5100 },
//     { month: "Mar", value: 5300 },
//     { month: "Apr", value: 5400 },
//     { month: "May", value: 5600 },
//     { month: "Jun", value: 5800 },
//     { month: "Jul", value: 5700 },
//     { month: "Aug", value: 5800 },
//     { month: "Sep", value: 5700 },
//     { month: "Oct", value: 6000 },
//     { month: "Nov", value: 6100 },
//     { month: "Dec", value: 6200 },
//   ],
//   2023: [
//     { month: "Jan", value: 5800 },
//     { month: "Feb", value: 6100 },
//     { month: "Mar", value: 6300 },
//     { month: "Apr", value: 7200 },
//     { month: "May", value: 7500 },
//     { month: "Jun", value: 7800 },
//     { month: "Jul", value: 8100 },
//     { month: "Aug", value: 8300 },
//     { month: "Sep", value: 8400 },
//     { month: "Oct", value: 7800 },
//     { month: "Nov", value: 7900 },
//     { month: "Dec", value: 8000 },
//   ],
//   2024: [
//     { month: "Jan", value: 8900 },
//     { month: "Feb", value: 9800 },
//     { month: "Mar", value: 10200 },
//     { month: "Apr", value: 10800 },
//     { month: "May", value: 10500 },
//     { month: "Jun", value: 10800 },
//     { month: "Jul", value: 11400 },
//     { month: "Aug", value: 11200 },
//     { month: "Sep", value: 11600 },
//     { month: "Oct", value: 10100 },
//     { month: "Nov", value: 9800 },
//     { month: "Dec", value: 9400 },
//   ],
// };

// const years = Object.keys(incomeData).map(Number).sort();

// type Period = "yearly" | "quarterly" | "monthly" | "daily";

// function formatUSD(n: number) {
//   return ` ${n.toLocaleString()} EGP`;
// }

// function toQuarters(months: { month: string; value: number }[]) {
//   const map = [
//     { label: "Q1", sum: months[0].value + months[1].value + months[2].value },
//     { label: "Q2", sum: months[3].value + months[4].value + months[5].value },
//     { label: "Q3", sum: months[6].value + months[7].value + months[8].value },
//     { label: "Q4", sum: months[9].value + months[10].value + months[11].value },
//   ];
//   return map;
// }

// // Generate simple evenly distributed daily values for the selected month data
// function genDaily(monthTotal: number, days = 30) {
//   const avg = monthTotal / days;
//   return Array.from({ length: days }, (_, i) => ({ day: i + 1, value: Math.round(avg) }));
// }

// export default function Finance() {
//   const [year, setYear] = useState<number>(years[years.length - 1] ?? 2024);
//   const [period, setPeriod] = useState<Period>("monthly");
//   const [summaryData, setSummaryData] = useState<any>(null);
//   const [loading, setLoading] = useState(true);

//   // Fetch summary data
//   useEffect(() => {
//     const fetchSummaryData = async () => {
//       try {
//         const response = await adminSummary();
//         setSummaryData(response.data);
//         setLoading(false);
//       } catch (error) {
//         console.error('Error fetching summary data:', error);
//         setLoading(false);
//       }
//     };

//     fetchSummaryData();
//   }, []);
  

//   const months = incomeData[year] ?? [];

//   const rows = useMemo(() => {
//     if (period === "yearly") {
//       const totals = years.map(y => ({
//         label: `${y}`,
//         amount: (incomeData[y] ?? []).reduce((s, m) => s + m.value, 0),
//       }));
//       return totals;
//     }

//     if (period === "quarterly") {
//       return toQuarters(months).map(q => ({ label: q.label, amount: q.sum }));
//     }

//     if (period === "monthly") {
//       return months.map(m => ({ label: m.month, amount: m.value }));
//     }

//     const thisMonth = months[new Date().getMonth() % months.length] ?? { value: 9000 } as any;
//     return genDaily(thisMonth.value, 30).map(d => ({ label: `Day ${d.day}`, amount: d.value }));
//   }, [period, months]);

//   const total = useMemo(() => (period === "yearly"
//     ? rows.reduce((s, r) => s + r.amount, 0)
//     : months.reduce((s, m) => s + m.value, 0)
//   ), [rows, months, period]);

//   const avg = Math.round(rows.reduce((s, r) => s + r.amount, 0) / Math.max(rows.length, 1));
//   const top = rows.reduce((p, c) => (c.amount > p.amount ? c : p), rows[0] || { label: "-", amount: 0 });

//   const totalSubtitle = useMemo(() => {
//     if (period === "yearly") return "Sum across all years";
//     if (period === "quarterly") return `Sum for ${year}`;
//     if (period === "monthly") return `Sum for ${year}`;
//     const mIdx = new Date().getMonth() % Math.max(months.length, 1);
//     const mLabel = months[mIdx]?.month ?? "Current Month";
//     return `Approx. for ${mLabel} ${year}`;
//   }, [period, year, months]);

//   return (

//   <div className="relative space-y-6">
//     <div className="flex items-center justify-between">
//       <div>
//         <h1 className="text-3xl font-bold text-foreground">Finance</h1>
//         <p className="text-muted-foreground">Income analytics for your platform</p>
//       </div>
//       <div className="flex gap-2">
//         <Select value={String(year)} onValueChange={(v) => setYear(parseInt(v))}>
//           <SelectTrigger className="w-28">
//             <SelectValue />
//           </SelectTrigger>
//           <SelectContent>
//             {years.map((y) => (
//               <SelectItem key={y} value={String(y)}>
//                 {y}
//               </SelectItem>
//             ))}
//           </SelectContent>
//         </Select>
//         <Select value={period} onValueChange={(v: Period) => setPeriod(v)}>
//           <SelectTrigger className="w-32">
//             <SelectValue />
//           </SelectTrigger>
//           <SelectContent>
//             <SelectItem value="yearly">Yearly</SelectItem>
//             <SelectItem value="quarterly">Quarterly</SelectItem>
//             <SelectItem value="monthly">Monthly</SelectItem>
//             <SelectItem value="daily">Daily</SelectItem>
//           </SelectContent>
//         </Select>
//       </div>
//     </div>

//     {/* Cards Section */}
//     <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
//       {/* ✅ Keep this card visible */}
//       <Card className="z-20 relative backdrop-blur-0">
//         <CardHeader className="pb-2">
//           <CardTitle className="text-sm text-muted-foreground">Total Income</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="text-2xl font-bold text-foreground">
//             {loading ? (
//               <span className="text-muted-foreground">Loading...</span>
//             ) : summaryData?.revenue?.total ? (
//               formatUSD(summaryData.revenue.total)
//             ) : (
//               "EGP 0"
//             )}
//           </div>
//           <CardDescription>
//             {loading
//               ? "Fetching data..."
//               : summaryData?.revenue?.total
//               ? "From API Revenue Data"
//               : totalSubtitle}
//           </CardDescription>
//         </CardContent>
//       </Card>

//       {/* 🔹 Blur overlay for the rest */}
//       <div className="absolute inset-0 z-10 backdrop-blur-[6px] bg-white/40 pointer-events-none rounded-lg"></div>

//       {/* Other cards still in layout but blurred */}
//       <Card className="opacity-50">
//         <CardHeader className="pb-2">
//           <CardTitle className="text-sm text-muted-foreground">Average ({period})</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="text-2xl font-bold text-foreground">{formatUSD(avg)}</div>
//           <CardDescription>Across {rows.length} {period}</CardDescription>
//         </CardContent>
//       </Card>
//       <Card className="opacity-50">
//         <CardHeader className="pb-2">
//           <CardTitle className="text-sm text-muted-foreground">Top Period</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="text-2xl font-bold text-foreground">{top ? formatUSD(top.amount) : '-'}</div>
//           <CardDescription>{top?.label || '-'}</CardDescription>
//         </CardContent>
//       </Card>
//     </div>

//     {/* 🔹 Blur the table section too */}
//     <div className="relative">
//       <div className="absolute inset-0 backdrop-blur-[6px] bg-white/40 z-10 pointer-events-none rounded-lg"></div>
//       <Card className="opacity-50">
//         <CardHeader>
//           <CardTitle>Income Details</CardTitle>
//           <CardDescription>Scrollable table with {period} breakdown</CardDescription>
//         </CardHeader>
//         <CardContent>
//           <div className="max-h-[420px] overflow-y-auto border rounded-md">
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead>Period</TableHead>
//                   <TableHead>Amount</TableHead>
//                   <TableHead>Status</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {rows.map((r, idx) => (
//                   <TableRow key={idx}>
//                     <TableCell className="font-medium">{r.label}</TableCell>
//                     <TableCell>{formatUSD(r.amount)}</TableCell>
//                     <TableCell>
//                       <Badge variant={r.amount >= avg ? "default" : "secondary"}>
//                         {r.amount >= avg ? "Above Avg" : "Below Avg"}
//                       </Badge>
//                     </TableCell>
//                   </TableRow>
//                 ))}
//               </TableBody>
//             </Table>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   </div>
// );

// }

import React, { useMemo, useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { adminRevenueAnalytics } from "@/api/admin"; // ✅ use the new API

// 💰 Helper to format currency
function formatEGP(n: number | undefined | null) {
  if (typeof n !== "number") return "0 EGP";
  return `${n.toLocaleString()} EGP`;
}

type Period = "yearly" | "quarterly" | "monthly" | "daily";

export default function Finance() {
  const [period, setPeriod] = useState<Period>("monthly");
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [summaryData, setSummaryData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 🧠 Limit to latest 3 years
  const availableYears = useMemo(() => {
    const current = new Date().getFullYear();
    return [current - 2, current - 1, current];
  }, []);

  // 🧭 Fetch revenue analytics from API
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const response = await adminRevenueAnalytics(period); // e.g., ?period=monthly
        setSummaryData(response.data);
      } catch (err) {
        console.error("❌ Failed to fetch revenue analytics:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [period]);

  // 🧾 Adapt data for table
  const rows = useMemo(() => {
    if (!summaryData?.points) return [];
    return summaryData.points.map((p: any) => ({
      label: p.period,
      amount: p.total,
    }));
  }, [summaryData]);

  // 🧮 Aggregate stats
  const total = summaryData?.total_revenue ?? 0;
  const avg = rows.length
    ? Math.round(rows.reduce((sum, r) => sum + r.amount, 0) / rows.length)
    : 0;
  const top = rows.length
    ? rows.reduce((max, cur) => (cur.amount > max.amount ? cur : max), rows[0])
    : { label: "-", amount: 0 };

  return (
    <div className="relative space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Finance Dashboard</h1>
          <p className="text-muted-foreground">Income analytics & revenue summary</p>
        </div>

        <div className="flex gap-2">
          <Select value={String(year)} onValueChange={(v) => setYear(parseInt(v))}>
            <SelectTrigger className="w-28">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {availableYears.map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={period} onValueChange={(v: Period) => setPeriod(v)}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="yearly">Yearly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="daily">Daily</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
        {/* 🟩 Total Income */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {loading ? "Loading..." : formatEGP(total)}
            </div>
            <CardDescription>Total revenue from successful payments</CardDescription>
          </CardContent>
        </Card>

        {/* 🟦 Average Income */}
        <Card className="opacity-40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Average ({period})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{formatEGP(avg)}</div>
            <CardDescription>Average income per {period}</CardDescription>
          </CardContent>
        </Card>

        {/* 🟧 Top Period */}
        <Card className="opacity-40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Top Period</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{formatEGP(top.amount)}</div>
            <CardDescription>{top.label}</CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* 🧾 Table Section */}
      <Card className="opacity-40">
        <CardHeader>
          <CardTitle>Income Breakdown</CardTitle>
          <CardDescription>
            Showing {period} revenue distribution (latest 3 years)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-h-[420px] overflow-y-auto border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Period</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length > 0 ? (
                  rows.map((r, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{r.label}</TableCell>
                      <TableCell>{formatEGP(r.amount)}</TableCell>
                      <TableCell>
                        <Badge variant={r.amount >= avg ? "default" : "secondary"}>
                          {r.amount >= avg ? "Above Avg" : "Below Avg"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      No data available for this period
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
