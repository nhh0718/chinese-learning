import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import TopicCard from '../components/common/TopicCard';
import { useTopicStore } from '../stores/topicStore';
import { useProgressStore } from '../stores/progressStore';
import './TopicCatalogPage.css';

export default function TopicCatalogPage() {
    const { topics, fetchTopics, isLoading } = useTopicStore();
    const { getTopicProgress } = useProgressStore();
    const [search, setSearch] = useState('');
    const [standard, setStandard] = useState<'THEME' | 'HSK' | 'TOCFL'>('THEME');

    useEffect(() => {
        fetchTopics(standard);
    }, [fetchTopics, standard]);

    const filteredTopics = topics.filter(
        (t) =>
            t.title.toLowerCase().includes(search.toLowerCase()) ||
            t.subtitle.toLowerCase().includes(search.toLowerCase()) ||
            t.description.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="page topic-catalog-page">
            <div className="container">
                <div className="topic-catalog-page__header">
                    <h1 className="topic-catalog-page__title">
                        Topics
                        <span className="topic-catalog-page__title-cn chinese-text">主題</span>
                    </h1>
                    <p className="topic-catalog-page__desc">
                        Choose a topic and start your learning journey
                    </p>
                </div>

                <div className="topic-catalog-page__search">
                    <Search size={18} className="topic-catalog-page__search-icon" />
                    <input
                        type="text"
                        placeholder="Search topics..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="topic-catalog-page__search-input"
                        id="topic-search"
                    />
                </div>

                <div className="topic-catalog-page__tabs" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                    <button 
                        className={`topic-catalog-page__tab ${standard === 'THEME' ? 'active' : ''}`}
                        onClick={() => setStandard('THEME')}
                        style={{ background: 'none', border: 'none', padding: '0.5rem 1rem', fontSize: '1.1rem', fontWeight: standard === 'THEME' ? '600' : '400', color: standard === 'THEME' ? 'var(--jade)' : 'var(--text-muted)', borderBottom: standard === 'THEME' ? '2px solid var(--jade)' : 'none', cursor: 'pointer' }}
                    >
                        Chủ đề (Thematic)
                    </button>
                    <button 
                        className={`topic-catalog-page__tab ${standard === 'HSK' ? 'active' : ''}`}
                        onClick={() => setStandard('HSK')}
                        style={{ background: 'none', border: 'none', padding: '0.5rem 1rem', fontSize: '1.1rem', fontWeight: standard === 'HSK' ? '600' : '400', color: standard === 'HSK' ? 'var(--jade)' : 'var(--text-muted)', borderBottom: standard === 'HSK' ? '2px solid var(--jade)' : 'none', cursor: 'pointer' }}
                    >
                        HSK (Mainland)
                    </button>
                    <button 
                        className={`topic-catalog-page__tab ${standard === 'TOCFL' ? 'active' : ''}`}
                        onClick={() => setStandard('TOCFL')}
                        style={{ background: 'none', border: 'none', padding: '0.5rem 1rem', fontSize: '1.1rem', fontWeight: standard === 'TOCFL' ? '600' : '400', color: standard === 'TOCFL' ? 'var(--jade)' : 'var(--text-muted)', borderBottom: standard === 'TOCFL' ? '2px solid var(--jade)' : 'none', cursor: 'pointer' }}
                    >
                        TOCFL (Taiwan)
                    </button>
                </div>

                {isLoading ? (
                    <div className="topic-catalog-page__loading">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="skeleton-card animate-shimmer" />
                        ))}
                    </div>
                ) : (
                    <div className="topic-catalog-page__grid">
                        {filteredTopics.map((topic, i) => (
                            <TopicCard
                                key={topic.id}
                                topic={topic}
                                progress={getTopicProgress(topic.id)}
                                index={i}
                            />
                        ))}
                    </div>
                )}

                {!isLoading && filteredTopics.length === 0 && (
                    <div className="topic-catalog-page__empty">
                        <span className="topic-catalog-page__empty-icon">🔍</span>
                        <p>No topics found for "{search}"</p>
                    </div>
                )}
            </div>
        </div>
    );
}
