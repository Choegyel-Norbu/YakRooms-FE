import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Calendar,
  TrendingUp,
  BarChart3,
  LineChart as LineChartIcon,
} from "lucide-react";
import api from "@/services/Api";
// Assuming you have these shadcn/ui components available
const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

const Button = ({
  variant = "default",
  size = "sm",
  onClick,
  children,
  className = "",
}) => {
  const baseClasses =
    "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50";
  const variants = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    outline:
      "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
    ghost: "hover:bg-accent hover:text-accent-foreground",
  };
  const sizes = {
    sm: "h-9 px-3 text-xs",
    default: "h-10 px-4 py-2",
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

const Card = ({ children}) => <div className="p-0">{children}</div>;

const CardHeader = ({ children }) => (
  <div className="flex flex-col space-y-1.5 p-6">{children}</div>
);

const CardTitle = ({ children }) => (
  <h3 className="text-lg md:text-2xl font-semibold leading-none tracking-tight">
    {children}
  </h3>
);

const CardContent = ({ children }) => (
  <div className="p-0">{children}</div>
);

const BookingsTrendChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartType, setChartType] = useState("bar"); // 'bar' or 'line'
  const [selectedDate, setSelectedDate] = useState("2025-01-01");

  // Format month for display
  const formatMonthLabel = (monthString) => {
    const date = new Date(monthString + "-01");
    return date.toLocaleDateString("en-US", {
      month: "short",
      year: "2-digit",
    });
  };

  // Fetch data from API
  const fetchBookingsData = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await api.get(
        `/booking-statistics/monthly/hotel/1?startDate=${selectedDate}`
      );

      console.log("Fetching from:", res.config.url);

      const result = res.data;

      // Validate response structure
      if (!Array.isArray(result)) {
        throw new Error(
          "Invalid API response: Expected an array of booking data"
        );
      }

      // Process the data to add formatted month labels
      const processedData = result
        .map((item) => {
          if (!item.monthYear || typeof item.bookingCount !== "number") {
            console.warn("Invalid data item:", item);
            return null;
          }
          return {
            month: item.monthYear,
            bookings: item.bookingCount,
            monthLabel: formatMonthLabel(item.monthYear),
          };
        })
        .filter(Boolean);

      if (processedData.length === 0) {
        throw new Error("No valid booking data received from API");
      }

      setData(processedData);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching bookings data:", err);

      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookingsData();
  }, [selectedDate]);

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}:{" "}
              <span className="font-semibold">{entry.value} bookings</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Loading skeleton
  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Monthly Booking Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
            </div>
            <Skeleton className="w-full aspect-[16/9]" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <TrendingUp className="h-5 w-5" />
            Monthly Booking Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">
              Error loading booking data: {error}
            </p>
            <Button onClick={fetchBookingsData}>Retry</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          Monthly Booking Trends
          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
            Real time data
          </span>
        </CardTitle>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-4 mt-4">
          {/* Chart Type Toggle */}
          <div className="flex items-center gap-2">
            <Button
              variant={chartType === "bar" ? "default" : "outline"}
              size="sm"
              onClick={() => setChartType("bar")}
              className="flex items-center gap-1"
            >
              <BarChart3 className="h-4 w-4" />
              Bar
            </Button>
            <Button
              variant={chartType === "line" ? "default" : "outline"}
              size="sm"
              onClick={() => setChartType("line")}
              className="flex items-center gap-1"
            >
              <LineChartIcon className="h-4 w-4" />
              Line
            </Button>
          </div>

          {/* Date Picker */}
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min="2025-01-01"
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="w-full h-80 md:h-96 lg:h-[500px]">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "bar" ? (
              <BarChart
                data={data}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="monthLabel"
                  tick={{ fontSize: 14, fontWeight: 500 }}
                  tickLine={{ stroke: "#e0e0e0" }}
                  axisLine={{ stroke: "#e0e0e0", strokeWidth: 1 }}
                />
                <YAxis
                  tick={{ fontSize: 14, fontWeight: 500 }}
                  tickLine={{ stroke: "#e0e0e0" }}
                  axisLine={{ stroke: "#e0e0e0", strokeWidth: 1 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar
                  dataKey="bookings"
                  name="This Year"
                  fill="#3b82f6"
                  radius={[1, 1, 0, 0]}
                />
              </BarChart>
            ) : (
              <LineChart
                data={data}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="monthLabel"
                  tick={{ fontSize: 14, fontWeight: 500 }}
                  tickLine={{ stroke: "#e0e0e0" }}
                  axisLine={{ stroke: "#e0e0e0", strokeWidth: 1 }}
                />
                <YAxis
                  tick={{ fontSize: 14, fontWeight: 500 }}
                  tickLine={{ stroke: "#e0e0e0" }}
                  axisLine={{ stroke: "#e0e0e0", strokeWidth: 1 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="bookings"
                  name="This Year"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: "#3b82f6", strokeWidth: 2 }}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 md:mt-6 pt-4 md:pt-6 border-t">
          <div className="text-center">
            <p className="text-xl md:text-2xl font-bold text-blue-600">
              {data.reduce((sum, item) => sum + item.bookings, 0)}
            </p>
            <p className="text-xs md:text-sm text-gray-600">
              Total Bookings (12 months)
            </p>
          </div>
          <div className="text-center">
            <p className="text-xl md:text-2xl font-bold text-green-600">
              {data.length > 0
                ? Math.round(
                    data.reduce((sum, item) => sum + item.bookings, 0) /
                      data.length
                  )
                : 0}
            </p>
            <p className="text-xs md:text-sm text-gray-600">
              Average per Month
            </p>
          </div>
          <div className="text-center">
            <p className="text-xl md:text-2xl font-bold text-purple-600">
              {data.length > 0
                ? Math.max(...data.map((item) => item.bookings))
                : 0}
            </p>
            <p className="text-xs md:text-sm text-gray-600">Peak Month</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BookingsTrendChart;
