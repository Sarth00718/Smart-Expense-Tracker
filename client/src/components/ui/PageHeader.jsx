/**
 * PageHeader — shared consistent header for all dashboard pages.
 *
 * Props:
 *   icon       – Lucide icon component
 *   gradient   – Tailwind gradient string, e.g. 'from-violet-500 to-purple-600'
 *   title      – Page title string
 *   subtitle   – Short description below title
 *   actions    – ReactNode: button(s) for the right side (optional)
 */
export default function PageHeader({ icon: Icon, gradient, title, subtitle, actions }) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Left: icon badge + title + subtitle */}
            <div className="flex items-center gap-4">
                {Icon && (
                    <div
                        className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient || 'from-indigo-500 to-violet-600'} flex items-center justify-center shadow-lg shrink-0`}
                    >
                        <Icon className="w-6 h-6 text-white" />
                    </div>
                )}
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-slate-100 tracking-tight leading-tight">
                        {title}
                    </h1>
                    {subtitle && (
                        <p className="text-sm sm:text-base text-gray-500 dark:text-slate-400 mt-0.5 leading-snug">
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>

            {/* Right: action buttons */}
            {actions && (
                <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
                    {actions}
                </div>
            )}
        </div>
    )
}
