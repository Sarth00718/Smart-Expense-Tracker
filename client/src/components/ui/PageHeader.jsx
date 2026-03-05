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
                        className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${gradient || 'from-indigo-500 to-violet-600'} flex items-center justify-center shadow-md shrink-0`}
                    >
                        <Icon className="w-5 h-5 text-white" />
                    </div>
                )}
                <div>
                    <h1 className="type-page-title">
                        {title}
                    </h1>
                    {subtitle && (
                        <p className="type-page-subtitle mt-0.5">
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
