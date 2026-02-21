import { BookOpen, Users, GraduationCap, Layers } from "lucide-react";

const stats = [
  {
    icon: BookOpen,
    value: "50+",
    label: "Courses",
  },
  {
    icon: GraduationCap,
    value: "20+",
    label: "Expert Coaches",
  },
  {
    icon: Users,
    value: "1,000+",
    label: "Students",
  },
  {
    icon: Layers,
    value: "All",
    label: "Skill Levels",
  },
];

export default function StatsBar() {
  return (
    <section className="relative bg-gray-900 py-12 lg:py-16">
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center text-center group"
            >
              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 group-hover:bg-primary-red/20 group-hover:border-primary-red/30 transition-all duration-300">
                <stat.icon className="w-6 h-6 text-primary-red" />
              </div>
              <span className="font-heading text-3xl lg:text-4xl font-extrabold text-white mb-1 tracking-tight">
                {stat.value}
              </span>
              <span className="font-sans text-sm text-gray-400 font-medium tracking-wide uppercase">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
