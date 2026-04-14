import { useEffect, useState, useRef } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import DatePicker from "../../../components/form/date-picker";
import Select from "../../../components/form/Select";
import Button from "../../ui/button/Button";

interface ChartDataPoint {
  count: number;
  date: string;
}

interface ApiResponse {
  status: number;
  message: string;
  data: ChartDataPoint[];
}

export default function BarChartOne() {
  const [chartData, setChartData] = useState<{ categories: string[]; seriesData: number[] }>({ categories: [], seriesData: [] });
  const [error, setError] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [quickRange, setQuickRange] = useState("month");
  const BASE_URL = import.meta.env.VITE_POS_STORE_BASE_URL || 'http://localhost:8000/api'; // Fallback for testing

  const datePickerRef = useRef<HTMLInputElement>(null);

  const quickOptions = [
    { value: "today", label: "Today" },
    { value: "week", label: "Last Week" },
    { value: "2weeks", label: "Last 2 Weeks" },
    { value: "month", label: "Last Month" },
    { value: "3months", label: "Last 3 Months" },
    { value: "custom", label: "Custom" }
  ];

  // Format date to YYYY-MM-DD
  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Short date label e.g. "Apr 8"
  const formatLabel = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const fetchGraphData = async (start: string, end: string) => {
    try {
      setError("");
      
      const token = sessionStorage.getItem("userToken");
      if (!token) {
        throw new Error("No auth token found. Please login.");
      }

      const response = await fetch(
        `${BASE_URL}graph?start_date=${start}&end_date=${end}`,
        {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      
      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`API error: ${response.status} - ${errText.slice(0,100)}`);
      }

      const result: ApiResponse = await response.json();
      
      if (result.status !== 1) {
        throw new Error(result.message || "API returned error");
      }

      const categories = result.data.map((item) => formatLabel(item.date));
      const seriesData = result.data.map((item) => item.count);

      setChartData({ categories, seriesData });
    } catch (err: any) {
      setError(err.message);
      setChartData({ categories: [], seriesData: [] });
    } finally {
    }
  };

  const handleDateChange = (dateStrings: string[], range: string) => {
    if (dateStrings.length == 2) {
      let [start, end] = range.split(" to ");
      start = formatDate(dateStrings[0])
      end = formatDate(dateStrings[1])      
      setStartDate(start);
      setEndDate(end);
      setQuickRange("custom");
      fetchGraphData(start, end);
    }
  };

  const handleQuickRangeChange = (value: string) => {
    setQuickRange(value);
    if (value === "custom") {
      return;
    }
    // Quick range logic
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    let start = new Date(end);

    switch (value) {
      case "today":
        start.setHours(0, 0, 0, 0);
        break;
      case "week":
        start.setDate(end.getDate() - 7);
        break;
      case "2weeks":
        start.setDate(end.getDate() - 14);
        break;
      case "month":
        start.setDate(end.getDate() - 30);
        break;
      case "3months":
        start.setDate(end.getDate() - 90);
        break;
    }

    const startStr = formatDate(start);
    const endStr = formatDate(end);
    setStartDate(startStr);
    setEndDate(endStr);
    fetchGraphData(startStr, endStr);
  };

  const handleSearch = () => {
    if (startDate && endDate) {
      fetchGraphData(startDate, endDate);
    }
  };

  const handleReset = () => {
    const end = new Date();
    const start = new Date(end);
    start.setDate(end.getDate() - 30);
    const startStr = formatDate(start);
    const endStr = formatDate(end);
    setStartDate(startStr);
    setEndDate(endStr);
    setQuickRange("month");
    fetchGraphData(startStr, endStr);
  };

  useEffect(() => {
    const end = new Date();
    const start = new Date(end);
    start.setDate(end.getDate() - 30);
    const startStr = formatDate(start);
    const endStr = formatDate(end);
    setStartDate(startStr);
    setEndDate(endStr);
    setQuickRange("month");
    fetchGraphData(startStr, endStr); // Auto-fetch default 1 month
  }, []);

  useEffect(() => {
    if (datePickerRef.current) {
      const fp = (datePickerRef.current as any)._flatpickr;
      if (fp) {
        fp.set('maxDate', 'today');
      }
    }
  }, []);

  const options: ApexOptions = {
    colors: ["#465fff"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 180,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "39%",
        borderRadius: 5,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 4,
      colors: ["transparent"],
    },
    xaxis: {
      categories: chartData.categories,
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
      fontFamily: "Outfit",
    },
    yaxis: {
      title: {
        text: undefined,
      },
      tickAmount: 5,
      decimalsInFloat: 0,
      forceNiceScale: true,
    },
    grid: {
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      x: {
        show: false,
      },
      y: {
        formatter: (val: number) => `${val}`,
      },
    },
  };

  const series = [
    {
      name: "Count",
      data: chartData.seriesData,
    },
  ];


  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800">
        <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        <Button onClick={handleReset} variant="outline" className="mt-2">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Quick Range & Filters */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
        {/* Quick Range Dropdown */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">Quick Range</label>
          <Select
            options={quickOptions}
            defaultValue={quickRange}
            onChange={handleQuickRangeChange}
            placeholder="Select range"
          />
        </div>
        
        {/* Date Picker - Conditional */}
        <div className="flex-1 relative">
          {quickRange === 'custom' && (
            <DatePicker
              ref={datePickerRef}
              id="chart-date-range"
              mode="range"
              label="Date Range"
              placeholder="Select start - end date"
              onChange={handleDateChange}
            />
          )}
        </div>
        
        {/* Buttons */}
        <div className="flex gap-2">
          <Button onClick={handleSearch} disabled={!startDate || !endDate}>
            Search
          </Button>
          <Button onClick={handleReset} variant="outline">
            Reset
          </Button>
        </div>
      </div>

      {/* Chart */}
      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div id="chartOne" className="min-w-[1000px]">
          <Chart options={options} series={series} type="bar" height={180} />
        </div>
      </div>

      {chartData.seriesData.length === 0 && (
        <p className="text-sm text-gray-500 text-center italic">No data available for selected range.</p>
      )}
    </div>
  );
}

