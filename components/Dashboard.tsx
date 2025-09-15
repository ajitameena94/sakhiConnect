import React, { useState, useEffect } from 'react';
import Card from './Card';
import { getDashboardData, getFeaturedScheme } from '../services/firestoreService';
import { Scheme } from '../types';
import Spinner from './Spinner';
import { useTranslation } from '../hooks/useTranslation';

const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const [dashboardInfo, setDashboardInfo] = useState<{ weather: string; marketPrice: string } | null>(null);
  const [featuredScheme, setFeaturedScheme] = useState<Scheme | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [dashData, schemeData] = await Promise.all([
          getDashboardData(),
          getFeaturedScheme(),
        ]);
        setDashboardInfo(dashData);
        setFeaturedScheme(schemeData);
        setError(null);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("डेटा लोड करने में असमर्थ।");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Spinner /></div>;
  }
  
  if (error) {
    return <div className="text-center text-red-600 p-4">{t(error)}</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="p-4">
          <h2 className="text-xl font-bold text-green-800">{t('नमस्ते!')}</h2>
          <p className="text-gray-700 mt-2">{t('आपकी सखी आपकी सहायता के लिए यहाँ है। आज आप क्या जानना चाहेंगी?')}</p>
        </div>
      </Card>
      
      <div className="grid grid-cols-2 gap-4">
        <Card>
            <div className="p-4 text-center">
                <p className="text-3xl">☀️</p>
                <h3 className="font-bold text-lg text-amber-800">{t('मौसम')}</h3>
                <p className="text-gray-600">{t(dashboardInfo?.weather || 'N/A')}</p>
            </div>
        </Card>
        <Card>
            <div className="p-4 text-center">
                <p className="text-3xl">🌾</p>
                <h3 className="font-bold text-lg text-green-800">{t('मंडी भाव')}</h3>
                <p className="text-gray-600">{t(dashboardInfo?.marketPrice || 'N/A')}</p>
            </div>
        </Card>
      </div>

      {/* Debug: raw data (visible only in dev) */}
      <div className="mt-4 text-xs text-gray-500">
        <pre className="whitespace-pre-wrap">{JSON.stringify(dashboardInfo, null, 2)}</pre>
      </div>

      {featuredScheme && (
        <Card>
          <div className="p-4">
            <h3 className="text-lg font-bold text-green-800 mb-2">{t('मुख्य योजना')}</h3>
            <h4 className="font-semibold text-gray-800">{t(featuredScheme.title)}</h4>
            <p className="text-sm text-gray-600 mt-1">{t(featuredScheme.description)}</p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;