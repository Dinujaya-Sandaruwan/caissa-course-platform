import {
  Clock,
  Users,
  Star,
  ChevronRight,
  Sparkles,
  Crown,
  Target,
  Zap,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const courses = [
  {
    title: "Opening Principles for Beginners",
    coach: "GM Arjun Sharma",
    level: "Beginner",
    levelColor:
      "bg-success-green/10 text-success-green border-success-green/20",
    price: "Rs. 5,900",
    students: 142,
    rating: 4.9,
    lessons: 24,
    duration: "6h 30m",
    icon: Target,
    thumbnail: "/images/course-opening-principles.png",
    gradient: "from-emerald-500/20 to-teal-500/10",
    accentColor: "group-hover:shadow-success-green/20",
    description:
      "Master the fundamentals of chess openings with solid principles that will transform your early game.",
  },
  {
    title: "Sicilian Defense Masterclass",
    coach: "IM Kavitha Perera",
    level: "Intermediate",
    levelColor: "bg-info-blue/10 text-info-blue border-info-blue/20",
    price: "Rs. 9,900",
    students: 89,
    rating: 4.8,
    lessons: 32,
    duration: "9h 15m",
    icon: Zap,
    thumbnail: "/images/course-sicilian-defense.png",
    gradient: "from-blue-500/20 to-indigo-500/10",
    accentColor: "group-hover:shadow-info-blue/20",
    description:
      "Deep dive into the most popular and aggressive response to 1.e4. Learn all major variations.",
  },
  {
    title: "Endgame Essentials",
    coach: "GM Rajesh Kumar",
    level: "Intermediate",
    levelColor: "bg-info-blue/10 text-info-blue border-info-blue/20",
    price: "Rs. 7,500",
    students: 210,
    rating: 4.9,
    lessons: 28,
    duration: "7h 45m",
    icon: Crown,
    thumbnail: "/images/course-endgame.png",
    gradient: "from-purple-500/20 to-pink-500/10",
    accentColor: "group-hover:shadow-purple/20",
    description:
      "Convert winning positions into victories. King & pawn endings, rook endings, and key techniques.",
  },
  {
    title: "Advanced Tactical Patterns",
    coach: "GM Nimal Fernando",
    level: "Advanced",
    levelColor:
      "bg-warning-orange/10 text-warning-orange border-warning-orange/20",
    price: "Rs. 12,500",
    students: 64,
    rating: 5.0,
    lessons: 40,
    duration: "12h 00m",
    icon: Sparkles,
    thumbnail: "/images/course-tactics.png",
    gradient: "from-orange-500/20 to-red-500/10",
    accentColor: "group-hover:shadow-warning-orange/20",
    description:
      "Sharpen your tactical vision with complex combinations, sacrifices, and attacking motifs.",
  },
];

export default function FeaturedCourses() {
  return (
    <section className="relative bg-gray-50 py-20 lg:py-28 overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 -left-20 w-[400px] h-[400px] bg-primary-red/[0.03] rounded-full blur-[80px]"></div>
        <div className="absolute bottom-20 -right-20 w-[400px] h-[400px] bg-purple/[0.03] rounded-full blur-[80px]"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 lg:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-red/5 border border-primary-red/10 text-primary-red text-sm font-semibold mb-6">
            <Sparkles className="w-4 h-4" />
            Curated for Excellence
          </div>
          <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight mb-6">
            Featured{" "}
            <span className="text-transparent bg-clip-text bg-[image:var(--gradient-primary)]">
              Courses
            </span>
          </h2>
          <p className="font-sans text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Hand-picked courses designed by titled players to accelerate your
            chess journey — from your very first game to tournament-level
            mastery.
          </p>
        </div>

        {/* Course Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 lg:gap-8">
          {courses.map((course, index) => (
            <div
              key={course.title}
              className={`group relative bg-white rounded-3xl border border-gray-200/80 shadow-sm hover:shadow-2xl ${course.accentColor} transition-all duration-500 hover:-translate-y-2 flex flex-col`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Thumbnail Area */}
              <div className="relative h-48 rounded-t-3xl overflow-hidden">
                <Image
                  src={course.thumbnail}
                  alt={course.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />

                {/* Gradient overlay for readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>

                {/* Level Badge */}
                <div
                  className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold border ${course.levelColor} backdrop-blur-sm bg-white/80`}
                >
                  {course.level}
                </div>

                {/* Price Badge */}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm">
                  <span className="font-heading font-extrabold text-gray-900 text-xs">
                    {course.price}
                  </span>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-6 flex flex-col flex-1">
                {/* Coach Info */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600 border border-gray-200">
                    {course.coach
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <span className="text-sm text-gray-500 font-medium">
                    {course.coach}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-heading font-bold text-lg text-gray-900 mb-2 leading-snug group-hover:text-primary-red transition-colors duration-300">
                  {course.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-gray-500 leading-relaxed mb-5 flex-1">
                  {course.description}
                </p>

                {/* Meta Info Row */}
                <div className="flex items-center gap-4 text-xs text-gray-400 mb-5 font-medium">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {course.duration}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    {course.students}
                  </div>
                  <div className="flex items-center gap-1 text-warning-yellow">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    {course.rating}
                  </div>
                </div>

                {/* CTA Button */}
                <Link
                  href="#"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gray-50 hover:bg-primary-red hover:text-white text-gray-700 font-semibold text-sm border border-gray-200 hover:border-primary-red transition-all duration-300 group/btn"
                >
                  View Course
                  <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* View All CTA */}
        <div className="text-center mt-14">
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gray-900 hover:bg-gray-800 text-white font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1"
          >
            Browse All Courses
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
