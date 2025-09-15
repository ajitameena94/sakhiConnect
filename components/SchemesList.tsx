import React, { useState, useEffect } from 'react';
import Card from './Card';
import { getSchemes } from '../services/firestoreService';
import { Scheme } from '../types';
import Spinner from './Spinner';
import { useTranslation } from '../hooks/useTranslation';

const SchemesList: React.FC = () => {
  const { t } = useTranslation();
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSchemes = async () => {
      try {
        setLoading(true);
        const schemesData = await getSchemes();
        setSchemes(schemesData);
        setError(null);
      } catch (err) {
        console.error("Error fetching schemes:", err);
        setError("योजनाओं को लोड करने में असमर्थ।");
      } finally {
        setLoading(false);
      }
    };
    fetchSchemes();
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-center text-green-800 mb-6">{t('सरकारी योजनाएं')}</h2>
      {loading && <div className="flex justify-center pt-10"><Spinner /></div>}
      {error && <p className="text-center text-red-600">{t(error)}</p>}
      {!loading && !error && schemes.length === 0 && (
        <p className="text-center text-gray-600">{t('कोई योजनाएँ नहीं मिलीं।')}</p>
      )}

      {!loading && !error && schemes.map((scheme) => (
        <Card key={scheme.id}>
          <div className="p-5">
            <h3 className="text-lg font-bold text-green-900">{t(scheme.title)}</h3>
            <p className="text-sm text-gray-700 mt-2">{t(scheme.description)}</p>
            <div className="mt-4 pt-3 border-t border-green-200/50">
                <p className="text-sm"><strong className="font-semibold text-gray-800">{t('पात्रता:')}</strong> {t(scheme.eligibility)}</p>
                <p className="text-sm mt-1"><strong className="font-semibold text-gray-800">{t('लाभ:')}</strong> {t(scheme.benefits)}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default SchemesList;