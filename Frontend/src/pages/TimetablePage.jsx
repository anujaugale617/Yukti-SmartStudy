
import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Clock, MapPin, Trash2, Edit2 } from 'lucide-react';
import api from '../services/api';
import { Modal } from '../components/common/Modal';
import { LoadingState } from '../components/common/LoadingState';
import toast from 'react-hot-toast';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const TimetablePage = () => {
  const [timetable, setTimetable] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState('Monday');
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    subjectId: '',
    day: 'Monday',
    startTime: '09:00',
    endTime: '10:00',
    room: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [timeRes, subRes] = await Promise.all([
        api.get('/timetable'),
        api.get('/subjects')
      ]);
      if (timeRes.success) setTimetable(timeRes.timetable || []);
      if (subRes.success) {
        setSubjects(subRes.subjects || []);
        if (subRes.subjects.length > 0) {
          setFormData(prev => ({ ...prev, subjectId: subRes.subjects[0]._id }));
        }
      }
    } catch (err) {
      toast.error('Failed to load timetable');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddClass = async (e) => {
    e.preventDefault();
    if (!formData.subjectId) {
      toast.error('Please create at least one subject first');
      return;
    }
    try {
      const res = await api.post('/timetable', formData);
      if (res.success) {
        toast.success('Class added to timetable');
        fetchData();
        setModalOpen(false);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to add class');
    }
  };

  const handleDeleteClass = async (id) => {
    try {
      const res = await api.delete('/timetable/' + id);
      if (res.success) {
        toast.success('Class removed');
        fetchData();
      }
    } catch (err) {
      toast.error('Failed to remove class');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Weekly Timetable</h1>
          <p className="text-xs text-slate-500 mt-1">Schedule Monday through Saturday lectures, practical labs, and seminar slots</p>
        </div>
        <button
          type="button"
          onClick={() => { setFormData(prev => ({ ...prev, day: activeDay })); setModalOpen(true); }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl shadow-md transition-all self-start"
        >
          <Plus className="w-4 h-4" /> Add Class
        </button>
      </div>

      {/* Day Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {DAYS.map((d) => {
          const count = timetable.filter(t => t.day === d).length;
          return (
            <button
              key={d}
              onClick={() => setActiveDay(d)}
              className={'px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ' + (
                activeDay === d
                  ? 'bg-primary-600 text-white shadow-md shadow-primary-500/20'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
              )}
            >
              <span>{d}</span>
              <span className={'text-[10px] px-1.5 py-0.2 rounded-full ' + (activeDay === d ? 'bg-primary-700 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400')}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Day Timetable List */}
      {loading ? (
        <LoadingState count={3} />
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4">{activeDay}'s Schedule</h3>
          
          {timetable.filter(t => t.day === activeDay).length === 0 ? (
            <div className="p-12 text-center bg-slate-50 dark:bg-slate-800/30 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
              <Calendar className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No classes scheduled for {activeDay}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Click "Add Class" above to add a lecture or lab slot.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {timetable.filter(t => t.day === activeDay).map((slot) => (
                <div
                  key={slot._id}
                  className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-3 h-12 rounded-full flex-shrink-0"
                      style={{ backgroundColor: slot.subjectId?.color || '#3b82f6' }}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">{slot.subjectId?.name}</h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                          {slot.subjectId?.code}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-1.5 text-xs text-slate-500">
                        <span className="flex items-center gap-1 font-medium text-slate-600 dark:text-slate-400">
                          <Clock className="w-3.5 h-3.5 text-primary-500" /> {slot.startTime} - {slot.endTime}
                        </span>
                        {slot.room && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" /> {slot.room}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteClass(slot._id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Class Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add Timetable Slot">
        <form onSubmit={handleAddClass} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Subject</label>
            <select
              value={formData.subjectId}
              onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
              className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500"
            >
              {subjects.map(s => (
                <option key={s._id} value={s._id}>{s.name} ({s.code})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Day of Week</label>
            <select
              value={formData.day}
              onChange={(e) => setFormData({ ...formData, day: e.target.value })}
              className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500"
            >
              {DAYS.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Start Time</label>
              <input
                type="time"
                required
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">End Time</label>
              <input
                type="time"
                required
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Classroom / Laboratory</label>
            <input
              type="text"
              value={formData.room}
              onChange={(e) => setFormData({ ...formData, room: e.target.value })}
              placeholder="e.g. LH-101 or Network Lab"
              className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
            />
          </div>

          <div className="mt-6 flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl shadow-md"
            >
              Add to Timetable
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
