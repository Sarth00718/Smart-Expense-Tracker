import { useState, useEffect } from 'react'
import {
  Trophy,
  Award,
  Star,
  Zap,
  Target
} from 'lucide-react'

import { analyticsService } from '../../../services/analyticsService'

import {
  Card,
  StatCard,
  EmptyState,
  LoadingSpinner,
  PageHeader
} from '../../ui'

import { format } from 'date-fns'

const Achievements = () => {
  const [achievements, setAchievements] = useState([])
  const [score, setScore] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAchievements()
    loadScore()
  }, [])

  const loadAchievements = async () => {
    try {
      setLoading(true)

      const response = await analyticsService.getAchievements()

      setAchievements(response.data.earned || [])
    } catch (error) {
      console.error('Error loading achievements:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadScore = async () => {
    try {
      const response = await analyticsService.getScore()
      setScore(response.data)
    } catch (error) {
      console.error('Error loading score:', error)
    }
  }

  const getBadgeColor = (badgeType) => {
    switch (badgeType) {
      case 'milestone':
        return 'from-blue-500 to-cyan-500'

      case 'achievement':
        return 'from-purple-500 to-pink-500'

      case 'streak':
        return 'from-orange-500 to-red-500'

      default:
        return 'from-slate-500 to-slate-700'
    }
  }

  const getBadgeIcon = (badgeType) => {
    switch (badgeType) {
      case 'milestone':
        return <Star className="h-8 w-8" />

      case 'achievement':
        return <Trophy className="h-8 w-8" />

      case 'streak':
        return <Zap className="h-8 w-8" />

      default:
        return <Award className="h-8 w-8" />
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner size="lg" text="Loading achievements..." />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <PageHeader
        icon={Trophy}
        gradient="from-yellow-400 via-orange-500 to-red-500"
        title="Achievements"
        subtitle="Track your financial milestones and unlock rewards"
      />

      {/* Financial Health Score */}
      {score && (
        <Card className="overflow-hidden border-0 bg-gradient-to-br from-primary via-purple-600 to-indigo-700 text-white shadow-2xl">
          <div className="relative">
            {/* Background Blur */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute -left-10 top-0 h-40 w-40 rounded-full bg-white blur-3xl" />
              <div className="absolute bottom-0 right-0 h-52 w-52 rounded-full bg-pink-400 blur-3xl" />
            </div>

            <div className="relative flex flex-col items-center gap-10 lg:flex-row">
              {score.score !== null ? (
                <>
                  {/* Score Circle */}
                  <div className="relative flex items-center justify-center">
                    <div className="relative h-44 w-44">
                      <svg
                        className="h-full w-full -rotate-90"
                        viewBox="0 0 160 160"
                      >
                        {/* Background Circle */}
                        <circle
                          cx="80"
                          cy="80"
                          r="68"
                          fill="none"
                          stroke="rgba(255,255,255,0.15)"
                          strokeWidth="12"
                        />

                        {/* Progress Circle */}
                        <circle
                          cx="80"
                          cy="80"
                          r="68"
                          fill="none"
                          stroke="white"
                          strokeWidth="12"
                          strokeLinecap="round"
                          strokeDasharray={427}
                          strokeDashoffset={427 - (427 * score.score) / 100}
                          className="transition-all duration-1000 ease-out"
                        />
                      </svg>

                      {/* Score Content */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-5xl font-bold tracking-tight text-white">
                          {score.score}
                        </span>

                        <span className="mt-1 text-sm font-medium text-white/80">
                          / {score.maxScore}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Score Content */}
                  <div className="flex-1 text-center lg:text-left">
                    <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm">
                      <Trophy className="h-5 w-5 text-yellow-300" />

                      <span className="text-sm font-medium">
                        Financial Health
                      </span>
                    </div>

                    <h2 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
                      {score.rating}
                    </h2>

                    <p className="max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg">
                      Keep tracking expenses, managing budgets, and achieving
                      goals to improve your financial score and unlock more
                      achievements.
                    </p>
                  </div>
                </>
              ) : (
                <div className="w-full py-8 text-center">
                  <div className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm">
                    <Trophy className="h-12 w-12 text-yellow-300" />
                  </div>

                  <h2 className="mb-3 text-3xl font-bold tracking-tight">
                    Financial Health Score
                  </h2>

                  <p className="mb-2 text-xl font-semibold">
                    {score.rating}
                  </p>

                  <p className="mx-auto max-w-xl text-white/80">
                    {score.message ||
                      'Start tracking expenses to generate your financial health score.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Achievements Section */}
      <Card
        title="Your Achievements"
        subtitle={`${achievements.length} achievements unlocked`}
        icon={Trophy}
      >
        {achievements.length === 0 ? (
          <EmptyState
            icon={Trophy}
            title="No achievements yet"
            description="Start tracking your finances to unlock achievements."
          />
        ) : (
          <>
            {/* Stats */}
            <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
              <StatCard
                title="Total Earned"
                value={achievements.length}
                icon={Trophy}
                color="orange"
              />

              <StatCard
                title="Milestones"
                value={
                  achievements.filter(
                    (a) => a.badgeType === 'milestone'
                  ).length
                }
                icon={Star}
                color="blue"
              />

              <StatCard
                title="Streaks"
                value={
                  achievements.filter(
                    (a) => a.badgeType === 'streak'
                  ).length
                }
                icon={Zap}
                color="purple"
              />
            </div>

            {/* Achievement Cards */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {achievements.map((achievement, index) => (
                <div
                  key={index}
                  className="group relative overflow-hidden rounded-3xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 p-6 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-primary/40 hover:shadow-2xl"
                >
                  {/* Glow */}
                  <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-500/5" />
                  </div>

                  <div className="relative">
                    {/* Icon */}
                    <div
                      className={`mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br ${getBadgeColor(
                        achievement.badgeType
                      )} text-white shadow-xl`}
                    >
                      <span className="text-5xl">
                        {achievement.icon}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="text-center">
                      <h3 className="mb-2 text-xl font-bold tracking-tight text-gray-900 dark:text-slate-100">
                        {achievement.title}
                      </h3>

                      <p className="mb-5 text-sm leading-relaxed text-gray-600 dark:text-slate-400">
                        {achievement.description}
                      </p>

                      {/* Footer */}
                      <div className="inline-flex items-center gap-2 rounded-full bg-gray-100 dark:bg-slate-700 px-4 py-2 text-xs font-medium text-gray-600 dark:text-slate-300">
                        <Award className="h-4 w-4" />

                        <span>
                          Earned{' '}
                          {format(
                            new Date(achievement.earnedAt),
                            'MMM dd, yyyy'
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Available Achievements */}
        <div className="mt-10 overflow-hidden rounded-3xl border border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/10 dark:via-indigo-900/10 dark:to-purple-900/10">
          <div className="border-b border-blue-100 dark:border-blue-800/40 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-900/30">
                <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>

              <div>
                <h4 className="text-lg font-bold tracking-tight text-blue-900 dark:text-blue-300">
                  Available Achievements
                </h4>

                <p className="text-sm text-blue-700 dark:text-blue-400">
                  Unlock these by completing financial goals
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2">
            {[
              ['🎯', 'First Step - Add your first expense'],
              ['📊', 'Expense Master - Add 50+ expenses'],
              ['🗂️', 'Category Explorer - Use 5+ categories'],
              ['🎖️', 'Goal Achiever - Complete a savings goal'],
              ['💰', 'Budget Master - Stay under all budgets'],
              ['🔥', '7-Day Streak - Track for 7 days'],
              ['📸', 'Receipt Pro - Scan 5+ receipts'],
              ['🏆', 'Super Saver - Save 20%+ of income']
            ].map(([emoji, text], index) => (
              <div
                key={index}
                className="flex items-center gap-4 rounded-2xl border border-white/40 dark:border-slate-700/40 bg-white/70 dark:bg-slate-800/50 p-4 backdrop-blur-sm transition-all hover:scale-[1.02] hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 dark:bg-slate-700 text-2xl">
                  {emoji}
                </div>

                <span className="text-sm font-medium text-blue-900 dark:text-blue-300">
                  {text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  )
}

export default Achievements