import React, { useState, useEffect } from 'react';
import Card from './Card';
import { getKnowledgeArticles } from '../services/firestoreService';
import { Article } from '../types';
import Spinner from './Spinner';
import { useTranslation } from '../hooks/useTranslation';

const KnowledgeCenter: React.FC = () => {
  const { t } = useTranslation();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const articlesData = await getKnowledgeArticles();
        setArticles(articlesData);
        setError(null);
      } catch (err) {
        console.error("Error fetching articles:", err);
        setError("लेख लोड करने में असमर्थ।");
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-center text-green-800 mb-6">{t('ज्ञान केंद्र')}</h2>
      {loading && <div className="flex justify-center pt-10"><Spinner /></div>}
      {error && <p className="text-center text-red-600">{t(error)}</p>}
      {!loading && !error && articles.map((article) => (
        <Card key={article.id} padding={false}>
          <img src={article.imageUrl} alt={article.title} className="rounded-t-lg w-full h-32 object-cover" />
          <div className="p-4">
            <h3 className="text-lg font-bold text-green-900">{t(article.title)}</h3>
            <p className="text-sm text-gray-700 mt-2">{t(article.summary)}</p>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default KnowledgeCenter;