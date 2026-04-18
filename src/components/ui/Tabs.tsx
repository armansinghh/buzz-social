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
  return (
    <div className="flex justify-center sticky top-0 z-10 py-4">
      <div className="flex items-center gap-1 p-1 rounded-xl border border-(--border-color) backdrop-blur-xs bg-(--bg-bd)">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all
                ${
                  isActive
                    ? "bg-(--bg-primary) text-(--text-primary) shadow-sm"
                    : "text-(--text-muted) hover:text-(--text-primary)"
                }`}
            >
              {tab.icon && (
                <span className="flex items-center">
                  {tab.icon}
                </span>
              )}

              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}