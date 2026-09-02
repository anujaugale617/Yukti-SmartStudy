
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  CheckSquare, 
  GraduationCap, 
  UserCheck, 
  Clock, 
  Target, 
  AlertCircle,
  Plus,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { StatCard } from '../components/common/StatCard';
import { WelcomeSection } from '../components/dashboard/WelcomeSection';
import { TodaySchedule } from '../components/dashboard/TodaySchedule';
import { AIRecommendationCard } from '../components/dashboard/AIRecommendationCard';
import { AttendanceWidget } from '../components/dashboard/AttendanceWidget';
import { AIQuizModal } from '../components/quiz/AIQuizModal';
import { formatDate, getPriorityColor } from '../utils/helpers';
import toast from 'react-hot-toast';

export const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    stats: {},
    charts: {},
    todayClasses: [],
    upcomingAssignments: [],
    upcomingExams: [],
    recommendations: [],
    subjects: []
  });
  const [showQuizModal, setShowQuizModal] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [analyticsRes, todayRes, assignRes, examRes, recRes, subRes] = await Promise.all([
        api.get('/analytics/dashboard'),
        api.get('/timetable/today'),
        api.get('/assignments?status=Not Started'),
        api.get('/exams'),
        api.get('/ai/recommendations'),
        api.get('/subjects')
      ]);

      setData({
        stats: analyticsRes.stats || {},
        charts: analyticsRes.charts || {},
        todayClasses: todayRes.classes || [],
        upcomingAssignments: (assignRes.assignments || []).slice(0, 4),
        upcomingExams: (examRes.exams || []).slice(0, 3),
        recommendations: recRes.recommendations || [],
        subjects: subRes.subjects || []
      });
    } catch (err) {
      console.warn('Dashboard fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const stats = data.stats;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <WelcomeSection user={user} onQuickQuiz={() => setShowQuizModal(true)} />

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <StatCard
          title="Subjects"
          value={stats.totalSubjects ?? 0}
          icon={BookOpen}
          color="blue"
          onClick={() => navigate('/subjects')}
        />
        <StatCard
          title="Pending Tasks"
          value={stats.pendingAssignments ?? 0}
          icon={CheckSquare}
          color="amber"
          badge={stats.overdueAssignments > 0 ? stats.overdueAssignments + ' Overdue' : undefined}
          onClick={() => navigate('/assignments')}
        />
        <StatCard
          title="Exams Ahead"
          value={stats.upcomingExams ?? 0}
          icon={GraduationCap}
          color="purple"
          onClick={() => navigate('/exams')}
        />
        <StatCard
          title="Attendance"
          value={(stats.overallAttendance ?? 100) + '%'}
          icon={UserCheck}
          color={stats.overallAttendance < 75 ? 'rose' : 'emerald'}
          onClick={() => navigate('/attendance')}
        />
        <StatCard
          title="Study Hours"
          value={(stats.studyHours ?? 0) + 'h'}
          icon={Clock}
          color="indigo"
          onClick={() => navigate('/study-planner')}
        />
        <StatCard
          title="Goals Done"
          value={(stats.completedGoals ?? 0) + '/' + (stats.totalGoals ?? 0)}
          icon={Target}
          color="emerald"
          onClick={() => navigate('/goals')}
        />
      </div>

      {/* Primary 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Schedule & Progress Chart */}
        <div className="lg:col-span-2 space-y-6">
          {/* Smart AI Recommendation */}
          {data.recommendations.length > 0 && (
            <AIRecommendationCard recommendation={data.recommendations[0]} />
          )}

          {/* Today's Schedule */}
          <TodaySchedule classes={data.todayClasses} />

          {/* Study Progress Bar Chart (Recharts) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Weekly Study Hours</h3>
                <p className="text-xs text-slate-400">Actual vs Daily Target (3-4 hrs)</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400">
                Productivity Score: {stats.productivityScore ?? 85}%
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.charts.weeklyStudy || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
        </div>

        {/* Right 1 Col: Attendance Gauge, Assignments, and Exams */}
        <div className="space-y-6">
          {/* Attendance Overview Widget */}
          <AttendanceWidget 
            overall={{ percentage: stats.overallAttendance, attendedClasses: 28, totalClasses: 32 }}
            records={data.charts.attendanceBySubject || []}
          />

          {/* Upcoming Assignments Mini Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-amber-500" /> Pending Assignments
              </h4>
              <button onClick={() => navigate('/assignments')} className="text-xs text-primary-600 font-semibold hover:underline">
                All
              </button>
            </div>

            <div className="space-y-2.5">
              {data.upcomingAssignments.length === 0 ? (
                <p className="text-xs text-slate-400 py-3 text-center">No pending assignments!</p>
              ) : (
                data.upcomingAssignments.map((a) => (
                  <div key={a._id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-start justify-between gap-2">
                      <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">{a.title}</h5>
                      <span className={'text-[10px] px-1.5 py-0.5 rounded font-bold ' + getPriorityColor(a.priority)}>
                        {a.priority}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-2 text-[11px] text-slate-500">
                      <span>{a.subjectId?.name || 'Subject'}</span>
                      <span>Due {formatDate(a.dueDate)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Upcoming Exams Countdown Mini Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-purple-500" /> Exam Schedule
              </h4>
              <button onClick={() => navigate('/exams')} className="text-xs text-primary-600 font-semibold hover:underline">
                View All
              </button>
            </div>

            <div className="space-y-2.5">
              {data.upcomingExams.length === 0 ? (
                <p className="text-xs text-slate-400 py-3 text-center">No upcoming exams scheduled</p>
              ) : (
                data.upcomingExams.map((e) => {
                  const diffDays = Math.max(0, Math.ceil((new Date(e.date) - new Date()) / (1000 * 60 * 60 * 24)));
                  return (
                    <div key={e._id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                      <div className="flex items-start justify-between gap-2">
                        <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">{e.title}</h5>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 flex-shrink-0">
                          {diffDays === 0 ? 'Today' : 'In ' + diffDays + 'd'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-2 text-[11px] text-slate-500">
                        <span>{e.subjectId?.name || 'Subject'} ({e.type})</span>
                        <span>{formatDate(e.date)}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* AI Quiz Modal */}
      <AIQuizModal
        isOpen={showQuizModal}
        onClose={() => setShowQuizModal(false)}
        subjects={data.subjects}
        onQuizGenerated={() => navigate('/quizzes')}
      />
    </div>
  );
};
