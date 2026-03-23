import { useState, useEffect } from 'react';
import { Bookmark, BookmarkX, Loader2 } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { API_URLS } from '../config/api';
import TTSButton from '../components/common/TTSButton';
import './WordListPage.css';

interface BookmarkedWord {
  _id: string;
  vocabulary_id: {
    _id: string;
    traditional: string;
    simplified: string;
    pinyin: string;
    zhuyin: string;
    meaning_vi: string;
    han_viet: string;
  };
  state: string;
  reps: number;
}

export default function WordListPage() {
  const { token } = useAuthStore();
  const [words, setWords] = useState<BookmarkedWord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    fetchBookmarks();
  }, [token]);

  const fetchBookmarks = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URLS.review}/bookmarks`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setWords(await res.json());
      }
    } catch (err) {
      console.error('Failed to fetch bookmarks');
    }
    setIsLoading(false);
  };

  const toggleBookmark = async (vocabularyId: string) => {
    try {
      await fetch(`${API_URLS.review}/bookmark`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ vocabularyId })
      });
      // Remove from list
      setWords((prev) => prev.filter((w) => w.vocabulary_id._id !== vocabularyId));
    } catch (err) {
      console.error('Failed to toggle bookmark');
    }
  };

  if (!token) {
    return (
      <div className="page word-list-page">
        <div className="container container--narrow">
          <div className="word-list-empty">
            <h2>Đăng nhập để xem</h2>
            <p>Please log in to view your word list.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page word-list-page">
      <div className="container container--narrow">
        <div className="word-list-page__header">
          <h1 className="word-list-page__title">
            <Bookmark size={24} />
            My Word List
            <span className="word-list-page__title-cn chinese-text">生詞本</span>
          </h1>
          <p className="word-list-page__desc">
            {words.length} bookmarked {words.length === 1 ? 'word' : 'words'}
          </p>
        </div>

        {isLoading && (
          <div className="word-list-loading">
            <Loader2 className="word-list-loading__spinner" size={24} />
          </div>
        )}

        {!isLoading && words.length === 0 && (
          <div className="word-list-empty">
            <h3>No bookmarked words yet</h3>
            <p>Bookmark words during flashcard sessions to save them here.</p>
          </div>
        )}

        {!isLoading && words.length > 0 && (
          <div className="word-list">
            {words.map((w) => {
              const v = w.vocabulary_id;
              return (
                <div key={w._id} className="word-list__item">
                  <div className="word-list__character chinese-text">{v.traditional}</div>
                  <div className="word-list__details">
                    <div className="word-list__pinyin">{v.pinyin}</div>
                    <div className="word-list__meaning">{v.meaning_vi}</div>
                    {v.han_viet && <div className="word-list__hanviet">HV: {v.han_viet}</div>}
                  </div>
                  <div className="word-list__actions">
                    <TTSButton text={v.traditional} size="sm" />
                    <button
                      className="word-list__unbookmark"
                      onClick={() => toggleBookmark(v._id)}
                      title="Remove bookmark"
                    >
                      <BookmarkX size={18} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
