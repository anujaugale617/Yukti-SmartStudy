
import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Award, CheckCircle2, UserCheck, Clock, Target } from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line,
  Legend
} from 'recharts';
import api from '../services/api';
import { StatCard } from '../components/common/StatCard';
import { LoadingState } from '../components/common/LoadingState';
import toast from 'react-hot-toast';

export const AnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await api.get('/analytics/detailed');
        if (res.success) {
          setData(res);
        }
      } catch (err) {
        toast.error('Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading || !data) {
    return <LoadingState count={4} message="Computing student productivity metrics..." />;
  }

  const { stats, charts } = data;
  const PIE_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Academic Analytics & Insights</h1>
        <p className="text-xs text-slate-500 mt-1">Holistic performance tracking across study hours, quiz velocity, attendance criteria, and milestone completion</p>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          title="Productivity Score"
          value={(stats.productivityScore ?? 85) + '%'}
          icon={Award}
          color="indigo"
          subtitle="Attendance, Goals & Quiz composite"
        />
        <StatCard
          title="Total Study Hours"
          value={(stats.studyHours ?? 0) + ' hrs'}
          icon={Clock}
          color="blue"
          subtitle="Logged study tasks"
        />
        <StatCard
          title="Attendance"
          value={(stats.overallAttendance ?? 100) + '%'}
          icon={UserCheck}
          color={stats.overallAttendance < 75 ? 'rose' : 'emerald'}
          subtitle={stats.overallAttendance < 75 ? 'Criteria Alert' : 'Good standing'}
        />
        <StatCard
          title="Goal Completion"
          value={(stats.completedGoals ?? 0) + '/' + (stats.totalGoals ?? 0)}
          icon={Target}
          color="emerald"
          subtitle="Milestones reached"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Study Hours */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-1">Study Hours Velocity</h3>
          <p className="text-xs text-slate-400 mb-4">Daily dedicated focus time vs 3-hour benchmark</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.weeklyStudy || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} unit="h" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                  formatter={(val) => [val + ' hrs', '']}
                />
                <Bar dataKey="hours" name="Study Hours" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                <Bar dataKey="target" name="Target" fill="#94a3b8" opacity={0.3} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Assignment Status Breakdown */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-1">Assignment Distribution</h3>
          <p className="text-xs text-slate-400 mb-4">Completed, in progress, pending, and overdue tasks</p>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.assignmentBreakdown || []}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                >
                  {(charts.assignmentBreakdown || []).map((entry, index) => (
                    <Cell key={'cell-' + index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Subject Wise Attendance Comparison */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-1">Subject Attendance vs 75% Benchmark</h3>
          <p className="text-xs text-slate-400 mb-4">University eligibility criteria tracking</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.attendanceBySubject || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="code" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} unit="%" domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                  formatter={(val) => [val + '%', 'Attendance']}
                />
                <Bar dataKey="percentage" name="Attendance %" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quiz Scores Trend */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-1">Quiz Diagnostic Trend</h3>
          <p className="text-xs text-slate-400 mb-4">Scores over time from practice tests</p>
          <div className="h-64 w-full">
            {charts.quizScoreTrends && charts.quizScoreTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={charts.quizScoreTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} unit="%" domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                    formatter={(val) => [val + '%', 'Score']}
                  />
                  <Line type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: '#8b5cf6', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Take a practice quiz to generate score trends.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
