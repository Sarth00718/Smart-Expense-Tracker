import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Trophy, Award, Star, CheckCircle2, Medal, Crown, Flame, Lock
} from 'lucide-react'
import { analyticsService } from '../../../services/analyticsService'
import { Card, CardContent, PageHeader, LoadingSpinner, EmptyState } from '../../ui'
import { format } from 'date-fns'

/* ─── Constants ────────────────────────────────────────────────── */
const TIER = {
  gold:     { label: 'Gold',     gradient: 'from-yellow-400 to-amber-500',   icon: Crown },
  silver:   { label: 'Silver',   gradient: 'from-slate-400 to-slate-500',    icon: Medal },
  bronze:   { label: 'Bronze',   gradient: 'from-orange-400 to-amber-600',   icon: Award },
  platinum: { label: 'Platinum', gradient: 'from-cyan-400 to-indigo-500',    icon: Star  },
}

const TYPE = {
  milestone:   { gradient: 'from-blue-500 to-cyan-500',   icon: Star    },
  achievement: { gradient: 'from-purple-500 to-pink-500', icon: Trophy  },
  streak:      { gradient: 'from-orange-500 to-red-500',  icon: Flame   },
  default:     { gradient: 'from-slate-500 to-slate-600', icon: Award   },
}

/* ─── Score Ring Component ────────────────────────────────────── */
const RADIUS = 50
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

function ScoreRing({ score = 0 }) {
  const pct = Math.min(100, Math.max(0, score))
  const dash = (pct / 100) * CIRCUMFERENCE
  
  const ringColor = pct >= 80 ? '#10b981' : pct >= 60 ? '#3b82f6' : pct >= 40 ? '#f59e0b' : '#ef4444'
  const label = pct >= 80 ? 'Excellent!' : pct >= 60 ? 'Good!' : pct >= 40 ? 'Fair' : 'Needs Work'
  const labelColor = pct >= 80 ? 'text-emerald-500' : pct >= 60 ? 'text-blue-500' : pct >= 40 ? 'text-yellow-500' : 'text-red-500'

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={RADIUS} fill="none" strokeWidth="7" className="stroke-muted/30" />
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
      <p className={`text-sm font-medium text-center ${labelColor}`}>{label}</p>
    </div>
  )
}

/* ─── Achievement Card ────────────────────────────────────────── */
function AchievementCard({ achievement, index }) {
  const typeData = TYPE[achievement.badgeType || achievement.type] || TYPE.default
  const tierData = TIER[achievement.tier] || TIER.bronze
  const Icon = typeData.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      whileHover={{ y: -4 }}
      className="group rounded-xl border border-border bg-card p-4 sm:p-6 shadow-sm hover:shadow-md transition-all"
    >
      {/* header */}
      <div className="flex items-start gap-4 mb-4">
        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${typeData.gradient} flex items-center justify-center shadow-md flex-shrink-0 group-hover:scale-110 transition-transform`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-foreground text-sm leading-tight">
            {achievement.title || achievement.name}
          </h4>
          <div className="flex items-center gap-2 mt-1">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-muted text-xs font-medium">
              <tierData.icon className="w-3 h-3" />
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
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
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
      className="rounded-xl border border-dashed border-border bg-muted/30 p-4 sm:p-6 opacity-50"
    >
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 rounded-lg bg-muted/50 flex items-center justify-center flex-shrink-0">
          <Lock className="w-6 h-6 text-muted-foreground/40" />
        </div>
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-muted/40 rounded-full w-2/3" />
          <div className="h-2 bg-muted/40 rounded-full w-full" />
        </div>
      </div>
      <div className="h-2 bg-muted/40 rounded-full w-1/3" />
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

  if (loading) return <LoadingSpinner size="lg" text="Loading achievements..." />

  const filtered = filter === 'all'
    ? achievements
    : achievements.filter(a => (a.badgeType || a.type) === filter)

  const tierCounts = { gold: 0, silver: 0, bronze: 0, platinum: 0 }
  achievements.forEach(a => {
    if (a.tier && tierCounts[a.tier] !== undefined) tierCounts[a.tier]++
  })

  const lockedCount = Math.max(0, 4 - (achievements.length % 4 === 0 ? 0 : 4 - (achievements.length % 4)))

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">

      {/* Header */}
      <PageHeader
        icon={Trophy}
        gradient="from-yellow-400 via-orange-500 to-red-500"
        title="Achievements"
        subtitle="Your milestones and financial health score"
      />

      {/* Score Card */}
      {score && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-purple-600/5 to-pink-500/5">
            <CardContent className="p-6 sm:p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                
                {/* Score Ring */}
                <div className="flex justify-center sm:col-span-1">
                  <ScoreRing score={score.score || 0} />
                </div>

                {/* Stats Grid */}
                <div className="sm:col-span-1 lg:col-span-3">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    
                    {/* Total Earned */}
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 }}
                      className="rounded-lg border border-border bg-card/50 p-4"
                    >
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mb-3">
                        <Trophy className="w-5 h-5 text-white" />
                      </div>
                      <p className="text-2xl font-bold text-foreground tabular-nums">{achievements.length}</p>
                      <p className="text-xs text-muted-foreground mt-1">Total Earned</p>
                    </motion.div>

                    {/* Tier Pills */}
                    {[
                      { key: 'gold',   icon: Crown },
                      { key: 'silver', icon: Medal },
                      { key: 'bronze', icon: Award },
                    ].map(({ key, icon: Icon }, i) => (
                      <motion.div
                        key={key}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + i * 0.05 }}
                        className="rounded-lg border border-border bg-card/50 p-4"
                      >
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${TIER[key].gradient} flex items-center justify-center mb-3`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-2xl font-bold text-foreground tabular-nums">{tierCounts[key]}</p>
                        <p className="text-xs text-muted-foreground mt-1">{TIER[key].label}</p>
                      </motion.div>
                    ))}

                    {/* Score Breakdown */}
                    {score.breakdown?.slice(0, 3).map((item, i) => (
                      <motion.div
                        key={`breakdown-${i}`}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35 + i * 0.05 }}
                        className="rounded-lg border border-border bg-card/50 p-4"
                      >
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-3">
                          <Star className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-2xl font-bold text-foreground tabular-nums">{item.value || 0}</p>
                        <p className="text-xs text-muted-foreground mt-1">{item.label}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Filters */}
      {achievements.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center gap-2 flex-wrap"
        >
          {[
            { key: 'all', label: `All (${achievements.length})` },
            { key: 'milestone', label: `Milestone (${achievements.filter(a => (a.badgeType || a.type) === 'milestone').length})` },
            { key: 'achievement', label: `Achievement (${achievements.filter(a => (a.badgeType || a.type) === 'achievement').length})` },
            { key: 'streak', label: `Streak (${achievements.filter(a => (a.badgeType || a.type) === 'streak').length})` },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                filter === key
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted/60 text-muted-foreground hover:bg-muted border border-border/50'
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
    </div>
  )
}

export default Achievements
