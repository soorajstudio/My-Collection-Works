import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { BookWithReadingState, ReadingStatus } from '../../types/book.types';
import { CheckCircle2, Bookmark, Flame } from 'lucide-react';
import { calculateProgressPercentage } from '../../utils/formatters';

interface ReadingProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: BookWithReadingState | null;
  onSaveProgress: (updates: {
    currentChapter?: number | null;
    currentPage?: number | null;
    status?: ReadingStatus;
  }) => Promise<void>;
}

export const ReadingProgressModal: React.FC<ReadingProgressModalProps> = ({
  isOpen,
  onClose,
  book,
  onSaveProgress,
}) => {
  if (!book) return null;

  const isChapterBased = ['Manga', 'Manhwa', 'Comics'].includes(book.category);
  const total = isChapterBased ? book.totalChapters : book.totalPages;

  const initialVal = isChapterBased
    ? book.readingState?.currentChapter || 0
    : book.readingState?.currentPage || 0;

  const [currentVal, setCurrentVal] = useState<number>(initialVal);
  const [status, setStatus] = useState<ReadingStatus>(book.readingState?.status || 'Reading');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Recalculate preview percentage
  const previewPct = calculateProgressPercentage(book.category, currentVal, total);

  const handleIncrement = (amount: number) => {
    const next = currentVal + amount;
    const bounded = total ? Math.min(next, total) : Math.max(0, next);
    setCurrentVal(bounded);
    if (total && bounded >= total) {
      setStatus('Completed');
    } else if (bounded > 0) {
      setStatus('Reading');
    }
  };

  const handleCompleteAll = () => {
    if (total) setCurrentVal(total);
    setStatus('Completed');
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const updates = {
        currentChapter: isChapterBased ? currentVal : null,
        currentPage: !isChapterBased ? currentVal : null,
        status,
      };

      await onSaveProgress(updates);

      if (status === 'Completed' || (previewPct !== null && previewPct >= 100)) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      }

      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Update Reading Progress"
      description={`Tracking progress for "${book.title}"`}
      maxWidth="md"
    >
      <div className="space-y-5">
        {/* Book summary pill */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/5">
          <img
            src={book.coverFileUrl || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=120&auto=format&fit=crop&q=80'}
            alt=""
            className="w-10 h-14 object-cover rounded-lg shrink-0"
          />
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">{book.title}</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 truncate">by {book.author}</p>
            <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium mt-0.5">
              {isChapterBased ? `Total Chapters: ${total ?? 'Unknown'}` : `Total Pages: ${total ?? 'Unknown'}`}
            </p>
          </div>
        </div>

        {/* Current position input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              {isChapterBased ? 'Current Chapter' : 'Current Page'}
            </label>
            {previewPct !== null && (
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{previewPct}% Complete</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Input
              type="number"
              min="0"
              max={total || undefined}
              value={currentVal}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10) || 0;
                setCurrentVal(val);
                if (total && val >= total) setStatus('Completed');
                else if (val > 0) setStatus('Reading');
              }}
            />
            {total && (
              <div className="text-xs text-slate-500 dark:text-slate-400 shrink-0 font-medium">/ {total}</div>
            )}
          </div>

          {/* Progress bar preview */}
          {previewPct !== null && (
            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-2">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${previewPct}%` }}
              />
            </div>
          )}
        </div>

        {/* Quick Stepper Buttons */}
        <div className="space-y-1.5">
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Quick Stepper:</p>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="secondary" size="sm" type="button" onClick={() => handleIncrement(1)}>
              +1 {isChapterBased ? 'Ch' : 'Pg'}
            </Button>
            <Button variant="secondary" size="sm" type="button" onClick={() => handleIncrement(5)}>
              +5
            </Button>
            <Button variant="secondary" size="sm" type="button" onClick={() => handleIncrement(10)}>
              +10
            </Button>
            {total && (
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={handleCompleteAll}
                leftIcon={<CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />}
              >
                Mark Finished
              </Button>
            )}
          </div>
        </div>

        {/* Reading Status Selector */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Status
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['Not Started', 'Reading', 'Completed'] as ReadingStatus[]).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatus(st)}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                  status === st
                    ? 'bg-indigo-50 dark:bg-indigo-600/20 border-indigo-500 text-indigo-700 dark:text-indigo-300 shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-black/[0.06] dark:border-white/5">
          <Button variant="outline" size="sm" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="button" onClick={handleSave} isLoading={isSubmitting}>
            Save Progress
          </Button>
        </div>
      </div>
    </Modal>
  );
};
