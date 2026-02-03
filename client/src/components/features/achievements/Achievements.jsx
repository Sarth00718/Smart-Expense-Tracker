import React, { useState, useEffect } from 'react'
import { Trophy, Award, Star, Zap, Target } from 'lucide-react'
import { analyticsService } from '../../../services/analyticsService'
import { Card, StatCard, EmptyState } from '../../ui'
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
        return 'from-blue-500 to-blue-700'
      case 'achievement':
        return 'from-purple-500 to-purple-700'
      case 'streak':
        return 'from-orange-500 to-orange-700'
      default:
        return 'from-gray-500 to-gray-700'
    }
  }

  const getBadgeIcon = (badgeType) => {
    switch (badgeType) {
      case 'milestone':
        return <Star className="w-8 h-8" />
      case 'achievement':
        return <Trophy className="w-8 h-8" />
      case 'streak':
        return <Zap className="w-8 h-8" />
      default:
        return <Award className="w-8 h-8" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <Trophy className="w-8 h-8 text-yellow-600" />
          Achievements
        </h1>
        <p className="text-gray-600 text-lg">Track your financial milestones and earn rewards</p>
      </div>

      {/* Financial Health Score */}
      {score && (
        <Card className="bg-gradient-to-br from-primary to-purple-700 text-white border-0">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative w-40 h-40 flex-shrink-0">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="14"
                  fill="none"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="white"
                  strokeWidth="14"
                  fill="none"
                  strokeDasharray={`${(score.score / 100) * 439.82} 439.82`}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-bold">{score.score}</span>
                <span className="text-sm opacity-90">/ {score.maxScore}</span>
              </div>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-3xl font-bold mb-2 flex items-center gap-3 justify-center md:justify-start">
                <Trophy className="w-8 h-8" />
                Financial Health Score
              </h3>
              <p className="text-3xl font-bold mb-2">{score.rating}</p>
              <p className="text-white/80 text-lg">
                Keep tracking expenses to improve your score!
              </p>
            </div>
          </div>
        </Card>
      )}

      <Card title="Your Achievements" subtitle={`${achievements.length} achievements unlocked`} icon={Trophy}>
        {achievements.length === 0 ? (
          <EmptyState
            icon={Trophy}
            title="No achievements yet"
            description="Start tracking expenses to unlock achievements"
          />
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <StatCard
                title="Total Earned"
                value={achievements.length}
                icon={Trophy}
                color="orange"
              />
              <StatCard
                title="Milestones"
                value={achievements.filter(a => a.badgeType === 'milestone').length}
                icon={Star}
                color="blue"
              />
              <StatCard
                title="Streaks"
                value={achievements.filter(a => a.badgeType === 'streak').length}
                icon={Zap}
                color="purple"
              />
            </div>

            {/* Achievement Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {achievements.map((achievement, index) => (
                <div
                  key={index}
                  className="p-6 border-2 border-gray-200 rounded-2xl hover:shadow-xl hover:border-primary transition-all hover:scale-105"
                >
                  <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${getBadgeColor(achievement.badgeType)} flex items-center justify-center text-white mb-4 mx-auto shadow-lg`}>
                    <span className="text-4xl">{achievement.icon}</span>
                  </div>
                  <h3 className="text-xl font-bold text-center mb-2 text-gray-900">
                    {achievement.title}
                  </h3>
                  <p className="text-sm text-gray-600 text-center mb-4">
                    {achievement.description}
                  </p>
                  <div className="flex items-center justify-center gap-2 text-xs text-gray-500 bg-gray-50 rounded-lg py-2">
                    <Award className="w-4 h-4" />
                    <span>
                      Earned {format(new Date(achievement.earnedAt), 'MMM dd, yyyy')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Available Achievements Info */}
        <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl">
          <h4 className="font-bold text-blue-900 mb-4 text-lg flex items-center gap-2">
            <Target className="w-5 h-5" />
            Available Achievements
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-blue-700">
            <div className="flex items-center gap-2">
              <span className="text-xl">🎯</span>
              <span>First Step - Add your first expense</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl">📊</span>
              <span>Expense Master - Add 50+ expenses</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🗂️</span>
              <span>Category Explorer - Use 5+ categories</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🎖️</span>
              <span>Goal Achiever - Complete a savings goal</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl">💰</span>
              <span>Budget Master - Stay under all budgets</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🔥</span>
              <span>7-Day Streak - Track for 7 days</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl">📸</span>
              <span>Receipt Pro - Scan 5+ receipts</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🏆</span>
              <span>Super Saver - Save 20%+ of income</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default Achievements

