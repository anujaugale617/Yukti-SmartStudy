
import React, { useState, useEffect } from 'react';
import { UserCheck, AlertTriangle, Plus, Minus, Edit2, ShieldAlert } from 'lucide-react';
import api from '../services/api';
import { Modal } from '../components/common/Modal';
import { LoadingState } from '../components/common/LoadingState';
import toast from 'react-hot-toast';

export const AttendancePage = () => {
  const [data, setData] = useState({ overall: {}, records: [] });
  const [loading, setLoading] = useState(true);
  const [editingRecord, setEditingRecord] = useState(null);
  const [editFormData, setEditFormData] = useState({ totalClasses: 0, attendedClasses: 0 });

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const res = await api.get('/attendance');
      if (res.success) {
        setData({ overall: res.overall || {}, records: res.records || [] });
      }
    } catch (err) {
      toast.error('Failed to load attendance');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const handleQuickMark = async (id, action) => {
    try {
      const res = await api.patch('/attendance/' + id + '/mark', { action });
      if (res.success) {
        toast.success(action === 'present' ? '+1 Present marked! ??' : '+1 Absent logged');
        fetchAttendance();
      }
    } catch (err) {
      toast.error('Failed to update attendance');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (Number(editFormData.attendedClasses) > Number(editFormData.totalClasses)) {
      toast.error('Attended classes cannot exceed total classes');
      return;
    }
    try {
      const res = await api.put('/attendance/' + editingRecord._id, editFormData);
      if (res.success) {
        toast.success('Attendance updated');
        fetchAttendance();
        setEditingRecord(null);
      }
    } catch (err) {
      toast.error(err.message || 'Update failed');
    }
  };

  const overall = data.overall;
  const isOverallLow = overall.percentage < 75;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Attendance Tracker</h1>
        <p className="text-xs text-slate-500 mt-1">Real-time attendance percentage calculator with 75% university benchmark criteria alerts</p>
      </div>

      <div className={'p-6 sm:p-8 rounded-3xl border shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 ' + (
        isOverallLow 
          ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900' 
          : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800'
      )}>
        <div className="flex items-center gap-6">
          <div className="relative w-20 h-20 flex items-center justify-center flex-shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-200 dark:text-slate-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={(isOverallLow ? 'text-rose-500' : 'text-emerald-500') + ' transition-all duration-1000'}
                strokeDasharray={(overall.percentage || 0) + ', 100'}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-base font-black text-slate-800 dark:text-slate-100">
              {overall.percentage ?? 100}%
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-slate-800 dark:text-slate-100">Overall Semester Attendance</h2>
              {isOverallLow ? (
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400 flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3" /> Below 75% Criteria
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                  Safe Status ?
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              You have attended <strong>{overall.attendedClasses || 0}</strong> out of <strong>{overall.totalClasses || 0}</strong> lectures and labs.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-center">
          <div className="p-3 px-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-xs">
            <span className="text-xl font-bold text-emerald-600">{overall.attendedClasses || 0}</span>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Attended</p>
          </div>
          <div className="p-3 px-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-xs">
            <span className="text-xl font-bold text-rose-600">{overall.absentClasses || 0}</span>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Absent</p>
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingState count={3} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {data.records.map((r) => {
            const isCritical = r.percentage < 75;
            const neededTo75 = isCritical 
              ? Math.max(1, Math.ceil((0.75 * r.totalClasses - r.attendedClasses) / 0.25))
              : 0;
            const canBunk = !isCritical && r.totalClasses > 0 
              ? Math.floor((r.attendedClasses - 0.75 * r.totalClasses) / 0.75) 
              : 0;

            return (
              <div
                key={r._id}
                className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden"
              >
                <div 
                  className="absolute top-0 left-0 right-0 h-1.5"
                  style={{ backgroundColor: r.subject?.color || '#3b82f6' }}
                />

                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {r.subject?.code}
                      </span>
                      <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mt-2">{r.subject?.name}</h3>
                    </div>

                    <div className="text-right">
                      <span className={'text-xl font-black ' + (isCritical ? 'text-rose-600' : 'text-emerald-600')}>
                        {r.percentage}%
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingRecord(r);
                          setEditFormData({ totalClasses: r.totalClasses, attendedClasses: r.attendedClasses });
                        }}
                        className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 block ml-auto mt-1"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden my-4">
                    <div 
                      className={'h-full rounded-full transition-all duration-500 ' + (isCritical ? 'bg-rose-500' : 'bg-emerald-500')}
                      style={{ width: Math.min(100, r.percentage) + '%' }}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs py-2 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{r.totalClasses}</span>
                      <p className="text-[10px] text-slate-400">Total</p>
                    </div>
                    <div>
                      <span className="font-bold text-emerald-600">{r.attendedClasses}</span>
                      <p className="text-[10px] text-slate-400">Attended</p>
                    </div>
                    <div>
                      <span className="font-bold text-rose-600">{r.absentClasses}</span>
                      <p className="text-[10px] text-slate-400">Absent</p>
                    </div>
                  </div>

                  <div className="mt-3">
                    {isCritical ? (
                      <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Must attend next {neededTo75} classes to reach 75%
                      </p>
                    ) : (
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                        ? Safe: You can miss {canBunk} {canBunk === 1 ? 'class' : 'classes'} and stay above 75%
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-500">Quick Log:</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleQuickMark(r._id, 'present')}
                      className="px-3.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900 rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Present
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickMark(r._id, 'absent')}
                      className="px-3.5 py-1.5 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
                    >
                      <Minus className="w-3.5 h-3.5" /> Absent
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal isOpen={!!editingRecord} onClose={() => setEditingRecord(null)} title={'Edit Attendance: ' + (editingRecord?.subject?.name || '')}>
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Total Classes Held</label>
              <input
                type="number"
                min="0"
                required
                value={editFormData.totalClasses}
                onChange={(e) => setEditFormData({ ...editFormData, totalClasses: Number(e.target.value) })}
                className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Attended Classes</label>
              <input
                type="number"
                min="0"
                required
                value={editFormData.attendedClasses}
                onChange={(e) => setEditFormData({ ...editFormData, attendedClasses: Number(e.target.value) })}
                className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setEditingRecord(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl shadow-md"
            >
              Save Attendance
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
