
import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle2, XCircle, ArrowRight, ArrowLeft, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';
import api from '../../services/api';
import toast from 'react-hot-toast';

export const QuizRunner = ({ quiz, onFinish }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(quiz?.questions?.length ? quiz.questions.length * 60 : 300);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isSubmitted || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isSubmitted, timeLeft]);

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins.toString().padStart(2, '0') + ':' + secs.toString().padStart(2, '0');
  };

  const currentQuestion = quiz?.questions?.[currentIndex];

  const handleSelectOption = (option) => {
    if (isSubmitted) return;
    setSelectedAnswers(prev => ({ ...prev, [currentIndex]: option }));
  };

  const handleSubmitQuiz = async () => {
    if (submitting || isSubmitted) return;
    setSubmitting(true);
    try {
      const answersArray = quiz.questions.map((_, idx) => selectedAnswers[idx] || '');
      const res = await api.post('/quizzes/' + quiz._id + '/submit', { answers: answersArray });
      if (res.success) {
        setResult(res.result);
        setIsSubmitted(true);
        if (res.result.score >= 70) {
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        }
        toast.success('Quiz submitted! Score: ' + res.result.score + '%');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  if (isSubmitted && result) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm max-w-3xl mx-auto">
        <div className="text-center pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center text-white mx-auto shadow-md mb-3">
            <Trophy className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100">Quiz Completed!</h2>
          <p className="text-sm text-slate-500 mt-1">{quiz.title}</p>
          
          <div className="mt-6 flex items-center justify-center gap-6">
            <div className="text-center">
              <span className="text-3xl font-extrabold text-primary-600 dark:text-primary-400">{result.score}%</span>
              <p className="text-xs text-slate-400 font-semibold uppercase mt-0.5">Final Score</p>
            </div>
            <div className="w-px h-10 bg-slate-200 dark:bg-slate-800" />
            <div className="text-center">
              <span className="text-3xl font-extrabold text-slate-800 dark:text-slate-200">
                {result.correctCount} / {result.totalQuestions}
              </span>
              <p className="text-xs text-slate-400 font-semibold uppercase mt-0.5">Correct Answers</p>
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Detailed Review</h3>
          {quiz.questions.map((q, idx) => {
            const userAns = selectedAnswers[idx];
            const isCorrect = userAns && userAns.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
            return (
              <div key={idx} className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                <div className="flex items-start gap-3">
                  <span className={'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 ' + (isCorrect ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400')}>
                    {idx + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{q.question}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                      {q.options.map((opt, optIdx) => {
                        const isSelected = userAns === opt;
                        const isActualCorrect = opt.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
                        let btnStyle = 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300';
                        if (isActualCorrect) {
                          btnStyle = 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-bold';
                        } else if (isSelected && !isCorrect) {
                          btnStyle = 'bg-rose-50 dark:bg-rose-950/50 border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 line-through';
                        }
                        return (
                          <div key={optIdx} className={'p-2.5 rounded-xl border text-xs flex items-center justify-between ' + btnStyle}>
                            <span>{opt}</span>
                            {isActualCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                            {isSelected && !isActualCorrect && <XCircle className="w-4 h-4 text-rose-600" />}
                          </div>
                        );
                      })}
                    </div>
                    {q.explanation && (
                      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                        ?? <strong>Explanation:</strong> {q.explanation}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onFinish}
            className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl transition-colors shadow-md"
          >
            Back to Quizzes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm max-w-3xl mx-auto">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <span className="text-xs font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider">
            {quiz.subjectId?.name || 'General Quiz'}
          </span>
          <h2 className="text-lg font-extrabold text-slate-800 dark:text-slate-100">{quiz.title}</h2>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-xs font-bold">
          <Clock className="w-3.5 h-3.5 text-primary-600" />
          <span>{formatTimer(timeLeft)}</span>
        </div>
      </div>

      <div className="my-4">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
          <span>Question {currentIndex + 1} of {quiz.questions.length}</span>
          <span>{Math.round(((currentIndex + 1) / quiz.questions.length) * 100)}%</span>
        </div>
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary-600 rounded-full transition-all duration-300"
            style={{ width: (((currentIndex + 1) / quiz.questions.length) * 100) + '%' }}
          />
        </div>
      </div>

      {currentQuestion && (
        <div className="my-6">
          <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100">
            {currentQuestion.question}
          </h3>

          <div className="space-y-3 mt-6">
            {currentQuestion.options.map((option, idx) => {
              const isSelected = selectedAnswers[currentIndex] === option;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectOption(option)}
                  className={'w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between text-xs sm:text-sm ' + (
                    isSelected
                      ? 'bg-primary-50 dark:bg-primary-950/60 border-primary-500 text-primary-900 dark:text-primary-200 font-semibold'
                      : 'bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className={'w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ' + (
                      isSelected ? 'bg-primary-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    )}>
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{option}</span>
                  </div>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-primary-600" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          disabled={currentIndex === 0}
          onClick={() => setCurrentIndex(prev => prev - 1)}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl disabled:opacity-40"
        >
          <ArrowLeft className="w-4 h-4" /> Previous
        </button>

        {currentIndex < quiz.questions.length - 1 ? (
          <button
            type="button"
            onClick={() => setCurrentIndex(prev => prev + 1)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold rounded-xl"
          >
            Next <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            disabled={submitting}
            onClick={handleSubmitQuiz}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit Quiz'}
          </button>
        )}
      </div>
    </div>
  );
};
