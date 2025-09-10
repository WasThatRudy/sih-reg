"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/lib/context/AuthContext";

interface QuickLinksProps {
  className?: string;
}

export default function QuickLinks({ className = "" }: QuickLinksProps) {
  const { hasTeam } = useAuth();

  const baseLinks = [
    {
      title: "Problem Statements",
      description: "Browse available challenges",
      href: "/problem-statements",
      icon: "📋",
      color: "from-blue-500 to-blue-600",
    },
    {
      title: hasTeam ? "Team Dashboard" : "Team Registration",
      description: hasTeam ? "Manage your team" : "Register your team now",
      href: hasTeam ? "/team-info" : "/registration",
      icon: hasTeam ? "🏠" : "👥",
      color: hasTeam
        ? "from-orange-500 to-orange-600"
        : "from-purple-500 to-purple-600",
    },
    {
      title: "Login / Signup",
      description: "Access your account",
      href: "/login",
      icon: "🔑",
      color: "from-green-500 to-green-600",
    },
  ];

  const teamTasksLink = {
    title: "My Tasks",
    description: "View and submit tasks",
    href: "/team-tasks",
    icon: "📝",
    color: "from-indigo-500 to-indigo-600",
  };

  const links = hasTeam
    ? [...baseLinks.slice(0, 2), teamTasksLink, baseLinks[2]]
    : baseLinks;

  return (
    <section className={`py-16 px-6 bg-background/50 ${className}`}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-display text-2xl md:text-3xl font-light text-heading mb-4 tracking-tight">
            Quick Access
          </h2>
          <p className="text-gray-400 font-body text-sm max-w-2xl mx-auto">
            Navigate quickly to the most important sections
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {links.map((link, index) => (
            <motion.div
              key={link.href}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Link href={link.href} className="group block">
                <motion.div
                  className={`bg-gradient-to-br ${link.color} p-6 rounded-xl text-white hover:shadow-lg transition-all duration-300 h-full`}
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="text-3xl mb-3">{link.icon}</div>
                  <h3 className="font-semibold text-lg mb-2 font-display">
                    {link.title}
                  </h3>
                  <p className="text-white/80 text-sm font-body leading-relaxed">
                    {link.description}
                  </p>
                  <motion.div
                    className="flex items-center mt-4 text-sm font-medium"
                    initial={{ x: 0 }}
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <span>Learn more</span>
                    <svg
                      className="w-4 h-4 ml-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </motion.div>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
