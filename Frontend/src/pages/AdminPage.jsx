import { motion } from "framer-motion";
import { PlusCircle, Pencil, Trash2 } from "lucide-react";
import { Link, Navigate } from "react-router";

export default function AdminPage() {
  const actions = [
    {
      title: "Create Problem",
      description: "Add new coding problems",
      icon: <PlusCircle size={34} />,
      glow: "from-green-400 via-emerald-500 to-transparent",
      route: "/create"
    },
    
    {
      title: "Delete Problem",
      description: "Remove problems",
      icon: <Trash2 size={34} />,
      glow: "from-red-400 via-pink-500 to-transparent",
      route:"/delete"
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-6xl">

        {/* Heading */}
        <div className="mb-14 text-center">
          <h1 className="text-5xl font-semibold tracking-tight">
            Admin Panel
          </h1>
          <p className="text-gray-500 mt-3 text-base">
            Manage your coding problems
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {actions.map((action, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -10, scale: 1.03 }}
              transition={{ duration: 0.25 }}
              className="group cursor-pointer"
            >

              {/* OUTER NEON BORDER */}
              <div className="relative rounded-3xl p-[2px]">

                {/* strong animated neon border */}
                <div
                  className={`absolute inset-0 rounded-3xl opacity-70 group-hover:opacity-100 blur-md transition duration-500 bg-gradient-to-r ${action.glow}`}
                />

                {/* sharper edge line */}
                <div
                  className={`absolute inset-0 rounded-3xl bg-gradient-to-r ${action.glow} opacity-40 group-hover:opacity-80`}
                />

                {/* card */}
                <Link to={action.route}>
                <div className="relative bg-[#050505] rounded-3xl p-8 h-full flex flex-col justify-between border border-gray-900">

                  {/* Icon */}
                  <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-white/5 border border-gray-800 group-hover:border-gray-500 transition">
                    {action.icon}
                  </div>

                  {/* Content */}
                  <div className="mt-8">
                    <h2 className="text-2xl font-medium tracking-tight">
                      {action.title}
                    </h2>
                    <p className="text-gray-500 text-base mt-2">
                      {action.description}
                    </p>
                  </div>

                  {/* Bottom */}
                  <div className="mt-10 flex items-center justify-between">
                    <span className="text-sm text-gray-600">Action</span>
                    <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition text-lg">
                      →
                    </div>
                  </div>

                </div>
                </Link>
              </div>

            </motion.div>
          ))}
        </div>

      </div>
    </div>
  );
}
