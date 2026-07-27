import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Trophy, Award, Star, CheckCircle2, Medal, Crown, Flame, Lock, TrendingUp
} from 'lucide-react'
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, Tabs, TabsList, TabsTrigger, TabsContent, Separator, PageHeader, LoadingSpinner, CommonPageContainer, EmptyState } from '../../ui'
import { analyticsService } from '../../../services/analyticsService'
import { format } from 'date-fns'

/* ─── Palette ──────────────────────────────────────────────────
   Pulled directly from the dashboard's Quick Actions + stat-card
   icon badges, so every accent here already exists somewhere else
   in the product: blue (Expense/Analytics), emerald (Income/Goals),
   violet (Voice/Budgets), amber (Income tile), rose (Scan/Heatmap).
------------------------------------------------------------------ */
const ACCENT = {
  blue:   { solid: '#3b82f6', soft: 'rgba(59,130,246,0.12)',  text: 'text-blue-400' },
  emerald:{ solid: '#10b981', soft: 'rgba(16,185,129,0.12)',  text: 'text-emerald-400' },
  violet: { solid: '#8b5cf6', soft: 'rgba(139,92,246,0.12)',  text: 'text-violet-400' },
  amber:  { solid: '#f59e0b', soft: 'rgba(245,158,11,0.12)',  text: 'text-amber-400' },
  rose:   { solid: '#ec4899', soft: 'rgba(236,72,153,0.12)',  text: 'text-rose-400' },
  slate:  { solid: '#64748b', soft: 'rgba(100,116,139,0.12)', text: 'text-slate-400' },
}

const TIER = {
  gold:     { label: 'Gold',     accent: ACCENT.amber,  icon: Crown },
  silver:   { label: 'Silver',   accent: ACCENT.slate,  icon: Medal },
  bronze:   { label: 'Bronze',   accent: ACCENT.rose,   icon: Award },
  platinum: { label: 'Platinum', accent: ACCENT.blue,   icon: Star  },
}

const TYPE = {
  milestone:   { accent: ACCENT.blue,    icon: Star   },
  achievement: { accent: ACCENT.violet,  icon: Trophy },
  streak:      { accent: ACCENT.amber,   icon: Flame  },
  default:     { accent: ACCENT.emerald, icon: Award  },
}

/* ─── Small icon-badge helper — matches the dashboard's rounded-lg
   solid-color squares used on the Total Income / Expenses cards ──── */
function IconBadge({ accent, icon: Icon, size = 'md' }) {
  const dims = size === 'sm' ? 'w-9 h-9' : size === 'lg' ? 'w-12 h-12' : 'w-10 h-10'
  const iconDims = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'
  return (
    <div
      className={`${dims} rounded-lg flex items-center justify-center flex-shrink-0`}
      style={{ background: accent.solid }}
    >
      <Icon className={`${iconDims} text-white`} />
    </div>
  )
}

/* ─── Score Ring Component ────────────────────────────────────── */
const RADIUS = 50
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

function ScoreRing({ score = 0 }) {
  const pct = Math.min(100, Math.max(0, score))
  const dash = (pct / 100) * CIRCUMFERENCE

  const ringColor = pct >= 80 ? ACCENT.emerald.solid : pct >= 60 ? ACCENT.blue.solid : pct >= 40 ? ACCENT.amber.solid : '#ef4444'
  const label = pct >= 80 ? 'Excellent!' : pct >= 60 ? 'Good!' : pct >= 40 ? 'Fair' : 'Needs Work'
  const labelClass = pct >= 80 ? ACCENT.emerald.text : pct >= 60 ? ACCENT.blue.text : pct >= 40 ? ACCENT.amber.text : 'text-red-400'

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={RADIUS} fill="none" strokeWidth="7" className="stroke-white/10" />
          <motion.circle
            cx="60"
            cy="60"
            r={RADIUS}
            fill="none"
            strokeWidth="7"
            stroke={ringColor}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            initial={{ strokeDashoffset: CIRCUMFERENCE }}
            animate={{ strokeDashoffset: CIRCUMFERENCE - dash }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span className="text-3xl font-bold text-foreground"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
          >
            {score}
          </motion.span>
          <span className="text-xs text-muted-foreground font-medium">/ 100</span>
        </div>
      </div>
      <p className={`text-sm font-medium text-center ${labelClass}`}>{label}</p>
    </div>
  )
}

/* ─── Stat Tile ────────────────────────────────────────────────
   Mirrors the dashboard's Total Income / Expenses / Net Balance
   cards: label top-left, icon badge top-right, big number below.
------------------------------------------------------------------ */
function StatTile({ label, value, accent, icon, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="rounded-2xl border border-border bg-card p-4"
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs text-muted-foreground">{label}</p>
        <IconBadge accent={accent} icon={icon} size="sm" />
      </div>
      <p className="text-2xl font-bold text-foreground tabular-nums">{value}</p>
    </motion.div>
  )
}

/* ─── Achievement Card ────────────────────────────────────────── */
function AchievementCard({ achievement, index }) {
  const typeData = TYPE[achievement.badgeType || achievement.type] || TYPE.default
  const tierData = TIER[achievement.tier] || TIER.bronze
  const TierIcon = tierData.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      whileHover={{ y: -4 }}
      className="group rounded-2xl border border-border bg-card p-4 sm:p-6 hover:border-white/20 transition-all"
    >
      {/* header */}
      <div className="flex items-start gap-4 mb-4">
        <div className="group-hover:scale-110 transition-transform">
          <IconBadge accent={typeData.accent} icon={typeData.icon} size="lg" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-foreground text-sm leading-tight">
            {achievement.title || achievement.name}
          </h4>
          <div className="flex items-center gap-2 mt-1.5">
            <span
              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border border-white/10"
              style={{ background: tierData.accent.soft, color: tierData.accent.solid }}
            >
              <TierIcon className="w-3 h-3" />
              {tierData.label}
            </span>
          </div>
        </div>
      </div>

      {/* description */}
      <p className="text-xs text-muted-foreground leading-relaxed mb-3">
        {achievement.description}
      </p>

      {/* footer */}
      {achievement.date && (
        <div className="text-xs text-muted-foreground/70 flex items-center gap-1.5 pt-2 border-t border-border/50">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
          <span>Unlocked {format(new Date(achievement.date), 'MMM d, yyyy')}</span>
        </div>
      )}
    </motion.div>
  )
}

/* ─── Locked Card ────────────────────────────────────────────── */
function LockedCard({ index }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.03 }}
      className="rounded-2xl border border-dashed border-border bg-card/40 p-4 sm:p-6 opacity-50"
    >
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
          <Lock className="w-6 h-6 text-muted-foreground/40" />
        </div>
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-white/10 rounded-full w-2/3" />
          <div className="h-2 bg-white/5 rounded-full w-full" />
        </div>
      </div>
      <div className="h-2 bg-white/5 rounded-full w-1/3" />
    </motion.div>
  )
}

/* ─── Main Component ────────────────────────────────────────── */
const Achievements = () => {
  const [achievements, setAchievements] = useState([])
  const [score, setScore] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    Promise.all([
      analyticsService.getAchievements(),
      analyticsService.getScore(),
    ])
      .then(([achRes, scoreRes]) => {
        setAchievements(achRes.data.earned || [])
        setScore(scoreRes.data)
      })
      .catch(err => console.error('Error loading achievements:', err))
      .finally(() => setLoading(false))
  }, [])

  const filtered = filter === 'all'
    ? achievements
    : achievements.filter(a => (a.badgeType || a.type) === filter)

  const tierCounts = { gold: 0, silver: 0, bronze: 0, platinum: 0 }
  achievements.forEach(a => {
    if (a.tier && tierCounts[a.tier] !== undefined) tierCounts[a.tier]++
  })

  const lockedCount = Math.max(0, 4 - (achievements.length % 4 === 0 ? 0 : 4 - (achievements.length % 4)))

  const FILTERS = [
    { key: 'all', label: `All (${achievements.length})` },
    { key: 'milestone', label: `Milestone (${achievements.filter(a => (a.badgeType || a.type) === 'milestone').length})` },
    { key: 'achievement', label: `Achievement (${achievements.filter(a => (a.badgeType || a.type) === 'achievement').length})` },
    { key: 'streak', label: `Streak (${achievements.filter(a => (a.badgeType || a.type) === 'streak').length})` },
  ]

  return (
    <CommonPageContainer>

      {/* Header — same blue → violet identity as the sidebar's active
          nav pill and the "Quick Actions" lightning-bolt accent */}
      <PageHeader
        icon={Trophy}
        gradient="from-blue-500 via-indigo-500 to-violet-500"
        title="Achievements"
        subtitle="Your milestones and financial health score"
      />

      {loading && achievements.length === 0 && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <LoadingSpinner size="sm" text="" />
          <span>Loading achievements…</span>
        </div>
      )}

      {/* Score Card */}
      {score && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="relative overflow-hidden bg-gradient-to-br from-blue-500/[0.06] via-indigo-500/[0.05] to-violet-500/[0.06] border-border">
            <CardContent className="p-6 sm:p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

                {/* Score Ring */}
                <div className="flex justify-center sm:col-span-1">
                  <ScoreRing score={score.score || 0} />
                </div>

                {/* Stat Tiles — same shape as the dashboard's
                    Total Income / Expenses / Net Balance cards */}
                <div className="sm:col-span-1 lg:col-span-3">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">

                    <StatTile
                      label="Total Earned"
                      value={achievements.length}
                      accent={ACCENT.violet}
                      icon={Trophy}
                      delay={0.15}
                    />

                    {[
                      { key: 'gold',   icon: Crown },
                      { key: 'silver', icon: Medal },
                      { key: 'bronze', icon: Award },
                    ].map(({ key, icon }, i) => (
                      <StatTile
                        key={key}
                        label={TIER[key].label}
                        value={tierCounts[key]}
                        accent={TIER[key].accent}
                        icon={icon}
                        delay={0.2 + i * 0.05}
                      />
                    ))}

                    {score.breakdown?.slice(0, 3).map((item, i) => (
                      <StatTile
                        key={`breakdown-${i}`}
                        label={item.label}
                        value={item.value || 0}
                        accent={ACCENT.blue}
                        icon={TrendingUp}
                        delay={0.35 + i * 0.05}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Filters — same rounded-full pill treatment as the sidebar's
          active nav item: solid blue → violet when active */}
      {achievements.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center gap-2 flex-wrap"
        >
          {FILTERS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                filter === key
                  ? 'bg-gradient-to-r from-blue-500 to-violet-500 text-white shadow-sm'
                  : 'bg-card text-muted-foreground hover:bg-white/5 border border-border'
              }`}
            >
              {label}
            </button>
          ))}
        </motion.div>
      )}

      {/* Grid */}
      {achievements.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="py-12"
        >
          <EmptyState
            icon={Trophy}
            title="No achievements yet"
            description="Start tracking your expenses to unlock badges and milestones!"
          />
        </motion.div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="py-12"
        >
          <EmptyState
            icon={Trophy}
            title={`No ${filter} achievements`}
            description="Keep improving to unlock more badges!"
          />
        </motion.div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((achievement, i) => (
              <AchievementCard
                key={achievement._id || i}
                achievement={achievement}
                index={i}
              />
            ))}
            {filter === 'all' && Array.from({ length: lockedCount }).map((_, i) => (
              <LockedCard key={`locked-${i}`} index={filtered.length + i} />
            ))}
          </div>
        </AnimatePresence>
      )}
    </CommonPageContainer>
  )
}

export default Achievements