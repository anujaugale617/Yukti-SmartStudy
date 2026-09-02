
import React, { useState } from 'react';
import { RotateCw, ArrowLeft, ArrowRight, Shuffle, CheckCircle, HelpCircle } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export const FlashcardDeck = ({ cards = [], onCardUpdated }) => {
  const [deck, setDeck] = useState(cards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  React.useEffect(() => {
    setDeck(cards);
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [cards]);

  if (deck.length === 0) {
    return (
      <div className="p-12 text-center bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
        <HelpCircle className="w-10 h-10 text-slate-400 mx-auto mb-3" />
        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">No flashcards found</p>
        <p className="text-xs text-slate-400 mt-1">Generate AI flashcards or create new cards above.</p>
      </div>
    );
  }

  const currentCard = deck[currentIndex];

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex(prev => (prev + 1) % deck.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex(prev => (prev - 1 + deck.length) % deck.length);
  };

  const handleShuffle = () => {
    setIsFlipped(false);
    const shuffled = [...deck].sort(() => Math.random() - 0.5);
    setDeck(shuffled);
    setCurrentIndex(0);
    toast.success('Deck shuffled!');
  };

  const handleToggleMastered = async () => {
    if (!currentCard) return;
    try {
      const res = await api.patch('/flashcards/' + currentCard._id + '/master');
      if (res.success) {
        setDeck(prev => prev.map(c => c._id === currentCard._id ? res.flashcard : c));
        if (onCardUpdated) onCardUpdated(res.flashcard);
        toast.success(res.flashcard.mastered ? 'Marked as Mastered! ??' : 'Marked for Revision');
      }
    } catch (err) {
      toast.error('Failed to update card');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div 
        onClick={() => setIsFlipped(!isFlipped)}
        className="w-full h-80 sm:h-96 perspective-1000 cursor-pointer select-none group"
      >
        <div className={'relative w-full h-full duration-500 transform-style-3d rounded-3xl transition-transform ' + (isFlipped ? 'rotate-y-180' : '')}>
          {/* Front */}
          <div className="absolute inset-0 backface-hidden bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-8 flex flex-col justify-between shadow-lg shadow-slate-200/50 dark:shadow-none hover:border-primary-400 transition-colors">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold uppercase tracking-wider text-primary-600 dark:text-primary-400">
                {currentCard.topic || currentCard.subjectId?.name || 'Flashcard'}
              </span>
              <span className="text-slate-400 font-medium">Card {currentIndex + 1} of {deck.length}</span>
            </div>

            <div className="my-auto text-center px-4">
              <h3 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100 leading-snug">
                {currentCard.question}
              </h3>
              <p className="text-xs text-slate-400 mt-4 flex items-center justify-center gap-1.5 font-medium">
                <RotateCw className="w-3.5 h-3.5" /> Click anywhere to reveal answer
              </p>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className={'px-2.5 py-0.5 rounded-full font-semibold ' + (currentCard.mastered ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400')}>
                {currentCard.mastered ? '? Mastered' : 'Needs Review'}
              </span>
              <span className="text-[11px] text-slate-400">{currentCard.subjectId?.code}</span>
            </div>
          </div>

          {/* Back */}
          <div className="absolute inset-0 backface-hidden rotate-y-180 bg-gradient-to-br from-primary-900 to-indigo-950 text-white rounded-3xl p-8 flex flex-col justify-between shadow-xl">
            <div className="flex items-center justify-between text-xs text-primary-300">
              <span className="font-extrabold uppercase tracking-wider">Answer / Core Concept</span>
              <span>Card {currentIndex + 1} of {deck.length}</span>
            </div>

            <div className="my-auto text-center px-4 overflow-y-auto max-h-52">
              <p className="text-sm sm:text-base text-blue-50 font-medium leading-relaxed whitespace-pre-line">
                {currentCard.answer}
              </p>
            </div>

            <div className="text-center text-xs text-primary-300 flex items-center justify-center gap-1">
              <RotateCw className="w-3.5 h-3.5" /> Click to flip back
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={handlePrev}
          className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleShuffle}
            title="Shuffle Deck"
            className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs"
          >
            <Shuffle className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={handleToggleMastered}
            className={'px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 ' + (
              currentCard.mastered 
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
            )}
          >
            <CheckCircle className="w-4 h-4" />
            {currentCard.mastered ? 'Mastered' : 'Mark Mastered'}
          </button>
        </div>

        <button
          type="button"
          onClick={handleNext}
          className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs"
        >
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
