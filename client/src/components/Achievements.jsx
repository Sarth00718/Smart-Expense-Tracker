import React, { useState, useEffect } from 'react'
import { Trophy, Award, Star, Zap } from 'lucide-react'
import axios from 'axios'
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
      const token = localStorage.getItem('token')
      const response = await axios.get('http://localhost:5000/api/achievements', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setAchievements(response.data.earned || [])
    } catch (error) {
      console.error('Error loading achievements:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadScore = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('http://localhost:5000/api/analytics/score', {
        headers: { Authorization: `Bearer ${token}` }
      })
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
    <div className="space-y-6">
      {/* Financial Health Score */}
      {score && (
        <div className="card bg-gradient-to-br from-primary to-primary-dark text-white">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Trophy className="w-6 h-6" />
            Financial Health Score
          </h3>
          <div className="flex items-center gap-6">
            <div className="relative w-32 h-32">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="12"
                  fill="none"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="white"
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${(score.score / 100) * 351.86} 351.86`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl font-bold">{score.score}</span>
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold mb-1">{score.rating}</p>
              <p className="text-white/80">out of {score.maxScore}</p>
              <p className="text-sm text-white/70 mt-2">
                Keep tracking expenses to improve your score!
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Trophy className="w-6 h-6 text-primary" />
          Your Achievements
        </h2>

        {achievements.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">No achievements yet!</p>
            <p className="text-sm text-gray-400">
              Start tracking expenses to unlock achievements
            </p>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <Trophy className="w-8 h-8 text-yellow-700" />
                  <div>
                    <p className="text-2xl font-bold text-yellow-900">{achievements.length}</p>
                    <p className="text-sm text-yellow-700">Total Earned</p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <Star className="w-8 h-8 text-blue-700" />
                  <div>
                    <p className="text-2xl font-bold text-blue-900">
                      {achievements.filter(a => a.badgeType === 'milestone').length}
                    </p>
                    <p className="text-sm text-blue-700">Milestones</p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <Zap className="w-8 h-8 text-purple-700" />
                  <div>
                    <p className="text-2xl font-bold text-purple-900">
                      {achievements.filter(a => a.badgeType === 'streak').length}
                    </p>
                    <p className="text-sm text-purple-700">Streaks</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Achievement Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievements.map((achievement, index) => (
                <div
                  key={index}
                  className="p-5 border-2 border-gray-200 rounded-xl hover:shadow-lg transition-all hover:scale-105"
                >
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${getBadgeColor(achievement.badgeType)} flex items-center justify-center text-white mb-4 mx-auto`}>
                    <span className="text-3xl">{achievement.icon}</span>
                  </div>
                  <h3 className="text-lg font-bold text-center mb-2">
                    {achievement.title}
                  </h3>
                  <p className="text-sm text-gray-600 text-center mb-3">
                    {achievement.description}
                  </p>
                  <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
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
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-3">🎯 Available Achievements</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-blue-700">
            <div>• 🎯 First Step - Add your first expense</div>
            <div>• 📊 Expense Master - Add 50+ expenses</div>
            <div>• 🗂️ Category Explorer - Use 5+ categories</div>
            <div>• 🎖️ Goal Achiever - Complete a savings goal</div>
            <div>• 💰 Budget Master - Stay under all budgets</div>
            <div>• 🔥 7-Day Streak - Track for 7 days</div>
            <div>• 📸 Receipt Pro - Scan 5+ receipts</div>
            <div>• 🏆 Super Saver - Save 20%+ of income</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Achievements

