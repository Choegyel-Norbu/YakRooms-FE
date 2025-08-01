import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, TrendingUp } from "lucide-react";
import api from "@/services/Api";
import { useAuth } from "@/services/AuthProvider";

const MonthlyPerformanceChart = () => {
  const { hotelId } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState("2025-01-01");

  // Get hotel name for dynamic title (assuming all data is for same hotel)
  const hotelName = data.length > 0 ? data[0].hotelName : "Hotel";

  // Format month-year for better display
  const formatMonthYear = (monthYear) => {
    const date = new Date(monthYear + "-01");
    return date.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  // Process data for chart
  const chartData = data.map((item) => ({
    ...item,
    displayMonth: formatMonthYear(item.monthYear),
  }));

  // Custom label component for top of bars
  const CustomLabel = (props) => {
    const { x, y, width, payload } = props;
    if (!payload) return null;

    return (
      <g>
        {/* Booking Count Label */}
        <text
          x={x + width / 2}
          y={y - 35}
          fill="#10b981"
          textAnchor="middle"
          fontSize="12"
          fontWeight="600"
        >
          {payload.bookingCount} bookings
        </text>
        {/* Average Booking Value Label */}
        <text
          x={x + width / 2}
          y={y - 20}
          fill="#f59e0b"
          textAnchor="middle"
          fontSize="12"
          fontWeight="600"
        >
          Nu. {payload.averageBookingValue?.toLocaleString()}
        </text>
      </g>
    );
  };
  
  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-sm text-gray-600">
              Total Revenue:
              <span className="font-medium text-gray-900 ml-1">
                Nu. {data.totalRevenue?.toLocaleString()}
              </span>
            </span>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-sm text-gray-600">
              Bookings:
              <span className="font-medium text-gray-900 ml-1">
                {data.bookingCount}
              </span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-sm text-gray-600">
              Avg. Booking Value:
              <span className="font-medium text-gray-900 ml-1">
                Nu. {data.averageBookingValue?.toLocaleString()}
              </span>
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  // Fetch data from API
  const fetchPerformanceData = async () => {
    if (!hotelId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await api.get(
        `/booking-statistics/revenue/monthly/${hotelId}?startDate=${selectedDate}`
      );

      console.log("Fetching performance data from:", res.config.url);

      const result = res.data;

      // Validate response structure
      if (!Array.isArray(result)) {
        throw new Error(
          "Invalid API response: Expected an array of performance data"
        );
      }

      // Process the data to add formatted month labels
      const processedData = result
        .map((item) => {
          if (!item.monthYear || typeof item.totalRevenue !== "number") {
            console.warn("Invalid data item:", item);
            return null;
          }
          return {
            ...item,
            displayMonth: formatMonthYear(item.monthYear),
          };
        })
        .filter(Boolean);

      if (processedData.length === 0) {
        throw new Error("No valid performance data received from API");
      }

      setData(processedData);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching performance data:", err);
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerformanceData();
  }, [selectedDate, hotelId]);

  // Custom legend formatter
  const formatLegendValue = (value) => {
    return "Total Revenue (Nu.)";
  };

  // Loading state
  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Monthly Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading performance data...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Monthly Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">
              Error loading performance data: {error}
            </p>
            <button
              onClick={fetchPerformanceData}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          Monthly Performance - {hotelName}
        </CardTitle>
        <p className="text-sm text-gray-500 mt-1">
          Revenue, bookings, and average booking value trends
        </p>

        {/* Date Picker */}
        <div className="flex items-center gap-2 mt-4">
          <Calendar className="h-4 w-4 text-gray-500" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            min="2025-01-01"
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <span className="text-xs text-gray-500">
            Select date to view revenue from that period
          </span>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 60,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                className="opacity-30"
                stroke="#e5e7eb"
              />
              <XAxis
                dataKey="displayMonth"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#6b7280" }}
                className="text-gray-500"
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#6b7280" }}
                tickFormatter={(value) => `Nu. ${value / 1000}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                formatter={formatLegendValue}
                wrapperStyle={{ paddingTop: "20px" }}
                iconType="rect"
              />

              {/* Total Revenue Bar with Labels */}
              <Bar
                dataKey="totalRevenue"
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
                name="totalRevenue"
              >
                <LabelList content={<CustomLabel />} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Legend for the labels */}
        <div className="mt-4 flex justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-gray-600">Total Revenue</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-gray-600">Booking Count</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-gray-600">Avg. Booking Value</span>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {chartData.length > 0 && (
            <>
              <div className="text-center p-3 rounded-lg">
                <div className="text-md font-bold text-blue-600">
                  Nu.{" "}
                  {chartData[
                    chartData.length - 1
                  ]?.totalRevenue?.toLocaleString()}
                </div>
                <div className="text-sm text-blue-600/80">Latest Revenue</div>
              </div>
              <div className="text-center p-3 rounded-lg">
                <div className="text-md font-bold text-green-600">
                  {chartData[chartData.length - 1]?.bookingCount}
                </div>
                <div className="text-sm text-green-600/80">
                  Latest Bookings
                </div>
              </div>
              <div className="text-center p-3 rounded-lg">
                <div className="text-md font-bold text-amber-600">
                  Nu.{" "}
                  {chartData[
                    chartData.length - 1
                  ]?.averageBookingValue?.toLocaleString()}
                </div>
                <div className="text-sm text-amber-600/80">
                  Avg. Booking Value
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MonthlyPerformanceChart;
