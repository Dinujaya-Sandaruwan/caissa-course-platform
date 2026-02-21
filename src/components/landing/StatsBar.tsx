import {
  BookOpen,
  Users,
  GraduationCap,
  Layers,
  TrendingUp,
} from "lucide-react";

const stats = [
  {
    icon: BookOpen,
    value: "50+",
    label: "Courses",
    description: "Expert-crafted lessons",
    color: "text-primary-red",
    bgColor: "bg-primary-red/10",
    borderColor: "border-primary-red/20",
  },
  {
    icon: GraduationCap,
    value: "20+",
    label: "Expert Coaches",
    description: "Titled players & GMs",
    color: "text-purple",
    bgColor: "bg-purple/10",
    borderColor: "border-purple/20",
  },
  {
    icon: Users,
    value: "1,000+",
    label: "Students",
    description: "Across Sri Lanka",
    color: "text-info-blue",
    bgColor: "bg-info-blue/10",
    borderColor: "border-info-blue/20",
  },
  {
    icon: TrendingUp,
    value: "All",
    label: "Skill Levels",
    description: "Beginner to advanced",
    color: "text-success-green",
    bgColor: "bg-success-green/10",
    borderColor: "border-success-green/20",
  },
];

export default function StatsBar() {
  return (
    <section className="relative bg-gray-900 py-14 lg:py-20 overflow-hidden">
      {/* Animated grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none"></div>
      {/* Subtle glow accents */}
      <div className="absolute top-0 left-1/4 w-[300px] h-[300px] bg-primary-red/5 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-purple/5 rounded-full blur-[100px]"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="relative group p-6 lg:p-8 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-500 backdrop-blur-sm"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              {/* Icon */}
              <div
                className={`w-12 h-12 rounded-xl ${stat.bgColor} ${stat.borderColor} border flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}
              >
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>

              {/* Value */}
              <span className="font-heading text-3xl lg:text-4xl font-extrabold text-white block mb-1 tracking-tight">
                {stat.value}
              </span>

              {/* Label */}
              <span className="font-sans text-sm text-gray-300 font-semibold block mb-1">
                {stat.label}
              </span>

              {/* Description */}
              <span className="font-sans text-xs text-gray-500">
                {stat.description}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
