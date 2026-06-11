import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface TabItem<T extends string> {
  id: T;
  label: string;
  icon?: React.ReactNode;
}

interface TabsProps<T extends string> {
  tabs: TabItem<T>[];
  activeTab: T;
  onChange: (id: T) => void;
}

export default function Tabs<T extends string>({
  tabs,
  activeTab,
  onChange,
}: TabsProps<T>) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  return (
    <div className="flex justify-center sticky top-0 z-10 py-4">
      <div className="flex items-center gap-1 p-1 rounded-xl border border-(--border-color) backdrop-blur-2xl bg-(--bg-bd)">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className="relative flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg"
            >
              {/* Animated background INSIDE button */}
              {isActive && (
                <motion.div
                  {...(mounted ? { layoutId: "activeTab" } : {})}
                  className="absolute inset-0 rounded-lg bg-(--bg-primary) shadow-sm"
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 35,
                  }}
                />
              )}

              {/* Content */}
              <span
                className={`relative z-10 flex items-center gap-2 ${
                  isActive
                    ? "text-(--text-primary)"
                    : "text-(--text-secondary) hover:text-(--text-primary)"
                }`}
              >
                {tab.icon}
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
