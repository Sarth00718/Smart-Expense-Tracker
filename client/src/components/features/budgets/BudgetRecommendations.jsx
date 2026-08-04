import { useState, useEffect } from 'react'
import { budgetRecommendationService } from '../../../services/budgetRecommendationService'
import { budgetService } from '../../../services/budgetService'
import toast from 'react-hot-toast'
import { Lightbulb, TrendingUp, Calendar, Wallet, Activity, ArrowRight, ShieldCheck, Target } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription, Badge, Button, Separator } from '../../ui'

const BudgetRecommendations = () => {
  const [recommendations, setRecommendations] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecommendations()
  }, [])

  const fetchRecommendations = async () => {
    try {
      setLoading(true)
      const response = await budgetRecommendationService.getRecommendations()
      setRecommendations(response.data)
    } catch (error) {
      console.error('Failed to fetch recommendations:', error)
      toast.error('Failed to load budget recommendations')
    } finally {
      setLoading(false)
    }
  }

  const applyRecommendation = async (category, amount) => {
    try {
      await budgetService.setBudget({ category, monthlyBudget: amount })
      toast.success(`Budget set for ${category}!`)
    } catch (error) {
      toast.error('Failed to apply recommendation')
    }
  }

  const getConfidenceBadge = (confidence) => {
    switch (confidence) {
      case 'high':
        return <Badge variant="success" className="px-3 py-1 gap-1"><ShieldCheck className="w-3.5 h-3.5" /> High Confidence</Badge>
      case 'medium':
        return <Badge variant="warning" className="px-3 py-1">Medium Confidence</Badge>
      case 'low':
        return <Badge variant="outline" className="px-3 py-1 text-muted-foreground border-muted-foreground/30">Low Confidence</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  if (loading) {
    return (
      <Card className="border-border/60 shadow-sm min-h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-primary/20 rounded-full"></div>
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          </div>
          <p className="text-muted-foreground font-medium animate-pulse">Analyzing spending patterns...</p>
        </div>
      </Card>
    )
  }

  if (!recommendations || !recommendations.hasData) {
    return (
      <Card className="border-border/60 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent p-1"></div>
        <CardContent className="pt-8 pb-8 flex flex-col items-center text-center max-w-md mx-auto">
          <div className="w-16 h-16 bg-amber-500/10 text-amber-600 rounded-full flex items-center justify-center mb-4">
            <Activity className="w-8 h-8" />
          </div>
          <CardTitle className="text-xl mb-2">Insufficient Data</CardTitle>
          <CardDescription className="text-base">
            {recommendations?.message || 'We need more expense data to generate accurate budget recommendations.'}
          </CardDescription>
          <p className="text-sm text-muted-foreground mt-4 bg-muted/50 p-4 rounded-xl border border-border/50">
            Continue tracking your daily expenses across different categories. Once we have enough data, our AI will automatically suggest optimal monthly limits for you.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <Card className="bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent border-indigo-500/20 shadow-none overflow-hidden">
        <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center shrink-0">
            <Lightbulb className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-foreground mb-1 tracking-tight">
              AI-Powered Budget Insights
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Based on <strong className="text-foreground">{recommendations.monthsAnalyzed} month{recommendations.monthsAnalyzed > 1 ? 's' : ''}</strong> of your spending history, we've generated personalized budget limits to help you maximize savings without compromising your lifestyle.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Single Month Warning */}
      {recommendations.monthsAnalyzed === 1 && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3">
          <Calendar className="w-5 h-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800 dark:text-amber-300 leading-relaxed">
            <strong className="font-semibold">Note:</strong> These recommendations are based on a single month of data. As you continue tracking, our suggestions will become increasingly accurate.
          </p>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border/60 hover:border-border transition-colors shadow-sm bg-card">
          <CardContent className="p-5 flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center mb-3">
              <Target className="w-5 h-5" />
            </div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Recommended Total</p>
            <p className="text-2xl font-black text-foreground tabular-nums">₹{recommendations.totalRecommendedBudget.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card className="border-border/60 hover:border-border transition-colors shadow-sm bg-card">
          <CardContent className="p-5 flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-3">
              <Wallet className="w-5 h-5" />
            </div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Avg Monthly Income</p>
            <p className="text-2xl font-black text-foreground tabular-nums">₹{recommendations.avgMonthlyIncome.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card className="border-border/60 hover:border-border transition-colors shadow-sm bg-gradient-to-br from-primary/5 to-primary/10">
          <CardContent className="p-5 flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center mb-3">
              <TrendingUp className="w-5 h-5" />
            </div>
            <p className="text-sm font-medium text-primary/80 mb-1">Potential Monthly Savings</p>
            <p className="text-2xl font-black text-primary tabular-nums">
              ₹{Math.max(0, recommendations.avgMonthlyIncome - recommendations.totalRecommendedBudget).toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-2 mt-8 mb-4">
        <h3 className="text-xl font-bold tracking-tight text-foreground">Category Suggestions</h3>
        <Badge variant="secondary" className="ml-2 font-mono">{recommendations.recommendations.length}</Badge>
      </div>

      {/* Recommendations List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {recommendations.recommendations.map((rec, index) => (
          <Card key={index} className="border-border/60 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col">
            <CardHeader className="bg-muted/20 border-b border-border/40 pb-4">
              <div className="flex justify-between items-start gap-3">
                <div>
                  <CardTitle className="text-lg">{rec.category}</CardTitle>
                  <CardDescription className="flex items-center gap-1.5 mt-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {rec.monthsAnalyzed} month{rec.monthsAnalyzed > 1 ? 's' : ''} data • {rec.dataPoints} entry{rec.dataPoints > 1 ? 's' : ''}
                  </CardDescription>
                </div>
                {getConfidenceBadge(rec.confidence)}
              </div>
            </CardHeader>
            
            <CardContent className="pt-5 pb-5 flex-1 flex flex-col space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/40 rounded-xl p-4 border border-border/50 text-center">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Current Avg</p>
                  <p className="text-xl font-bold text-foreground tabular-nums">₹{rec.currentAverage.toLocaleString()}</p>
                </div>
                <div className="bg-primary/10 rounded-xl p-4 border border-primary/20 text-center">
                  <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">Suggested</p>
                  <p className="text-xl font-bold text-primary tabular-nums">₹{rec.recommendedAmount.toLocaleString()}</p>
                </div>
              </div>

              <div className="bg-card border border-border/60 rounded-xl p-4 shadow-sm relative overflow-hidden flex-1">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary/60 rounded-l-xl"></div>
                <div className="flex items-start gap-3 ml-2">
                  <Lightbulb className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-1">AI Reasoning</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{rec.reasoning}</p>
                  </div>
                </div>
              </div>

              {rec.recommendedAmount > rec.currentAverage && (
                <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-500 bg-amber-500/10 p-3 rounded-lg border border-amber-500/20">
                  <TrendingUp className="w-4 h-4 shrink-0" />
                  <span className="font-medium">Buffer included: ₹{(rec.recommendedAmount - rec.currentAverage).toLocaleString()}</span>
                </div>
              )}
            </CardContent>

            <div className="p-4 bg-muted/20 border-t border-border/40 mt-auto">
              <Button 
                onClick={() => applyRecommendation(rec.category, rec.recommendedAmount)}
                className="w-full gap-2 font-semibold shadow-sm"
              >
                Apply ₹{rec.recommendedAmount.toLocaleString()} Budget
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default BudgetRecommendations
