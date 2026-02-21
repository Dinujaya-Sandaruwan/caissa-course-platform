import { Users, BookOpen, ReceiptText, Video } from "lucide-react";

export default function ManagerDashboardPage() {
  const stats = [
    {
      title: "Pending Coach Approvals",
      value: "0",
      icon: Users,
      trend: "+0 this week",
      color: "text-amber-600",
      bgColor: "bg-amber-100",
    },
    {
      title: "Pending Course Reviews",
      value: "0",
      icon: Video,
      trend: "Requires attention",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Pending Receipt Reviews",
      value: "0",
      icon: ReceiptText,
      trend: "Recent payments",
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Total Published Courses",
      value: "0",
      icon: BookOpen,
      trend: "Active on platform",
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 font-[family-name:var(--font-outfit)]">
          Dashboard Overview
        </h1>
        <p className="text-gray-500 mt-1">
          Monitor platform activity and pending approvals.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.title}
            className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.bgColor}`}
              >
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-1">
                {stat.value}
              </h3>
              <p className="text-sm font-medium text-gray-600">{stat.title}</p>
              <p className="text-xs text-gray-500 mt-2">{stat.trend}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions / Recent Activity placeholders could go here later */}
    </div>
  );
}
