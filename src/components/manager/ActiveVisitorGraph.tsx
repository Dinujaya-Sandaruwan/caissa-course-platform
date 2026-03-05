"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Users, Activity } from "lucide-react";

// Track 60 data points (e.g. 60 seconds of history)
const MAX_DATA_POINTS = 60;

interface DataPoint {
  time: string;
  count: number;
}

export default function ActiveVisitorGraph() {
  const [data, setData] = useState<DataPoint[]>([]);
  const [currentUsers, setCurrentUsers] = useState<number>(0);

  useEffect(() => {
    // Fill initial empty data array
    const now = new Date();
    const initialData = Array.from({ length: MAX_DATA_POINTS }).map((_, i) => {
      const t = new Date(now.getTime() - (MAX_DATA_POINTS - i) * 1000);
      return {
        time: t.toLocaleTimeString([], {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
        count: 0,
      };
    });

    setData(initialData);

    // Ensure we are in client
    if (typeof window === "undefined") return;

    // Connect to the Socket.io WebSocket
    const socket = io({
      path: "/api/socket_io",
      addTrailingSlash: false,
    });

    socket.on("active_users_count", (count: number) => {
      setCurrentUsers(count);

      setData((prevData) => {
        const newData = [...prevData];
        if (newData.length >= MAX_DATA_POINTS) {
          newData.shift(); // Remove oldest point
        }

        newData.push({
          time: new Date().toLocaleTimeString([], {
            hour12: false,
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }),
          count: count,
        });

        return newData;
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Custom generic tooltip for Recharts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 border-none rounded-xl p-3 shadow-xl">
          <p className="text-gray-400 text-xs font-semibold mb-1">{label}</p>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-red-500" />
            <p className="text-red-500 font-bold text-lg leading-none">
              {payload[0].value}{" "}
              <span className="text-sm font-normal text-red-400/80">
                Active
              </span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-[2rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.04)] ring-1 ring-gray-900/5 transition-all duration-300 hover:shadow-[0_30px_60px_rgba(220,38,38,0.05)] col-span-1 md:col-span-2 lg:col-span-4 relative overflow-hidden group">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 transition-all duration-500 group-hover:bg-red-500/10" />

      {/* Header */}
      <div className="flex items-start justify-between mb-8 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-red-50 p-2 rounded-xl">
              <Activity className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 tracking-tight">
              Active Visitors Real-time
            </h3>
          </div>
          <p className="text-sm text-gray-500 font-medium">
            Live monitoring across the platform
          </p>
        </div>

        {/* Live Indicator */}
        <div className="flex items-center gap-3 bg-red-50 px-4 py-2 rounded-full border border-red-100/50">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </div>
          <p className="text-red-700 font-bold text-2xl leading-none">
            {currentUsers}{" "}
            <span className="text-sm font-semibold opacity-70">Live</span>
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[180px] w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{
              top: 10,
              right: 10,
              left: -20, // Pull closer to axis line
              bottom: 0,
            }}
          >
            <defs>
              <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#dc2626" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#f1f5f9"
            />
            <XAxis
              dataKey="time"
              tick={{ fill: "#94a3b8", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              minTickGap={30} // Prevent overcrowding
            />
            <YAxis
              tick={{ fill: "#94a3b8", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{
                stroke: "#cbd5e1",
                strokeWidth: 1,
                strokeDasharray: "4 4",
              }}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#dc2626"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorCount)"
              isAnimationActive={false}
              activeDot={{
                r: 6,
                fill: "#dc2626",
                stroke: "#fff",
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
