import React, { useState, useEffect } from 'react';
import Card from './Card';
import { getDashboardData, getFeaturedScheme, getWeatherData, getCropPrices } from '../services/firestoreService';
import { Scheme, WeatherData, CropPriceData } from '../types';
import Spinner from './Spinner';
import { useTranslation } from '../hooks/useTranslation';

const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [cropPrices, setCropPrices] = useState<CropPriceData | null>(null);
  const [featuredScheme, setFeaturedScheme] = useState<Scheme | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [weather, prices, scheme] = await Promise.all([
          getWeatherData(),
          getCropPrices(),
          getFeaturedScheme(),
        ]);
        setWeatherData(weather);
        setCropPrices(prices);
        setFeaturedScheme(scheme);
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
                <p className="text-3xl">
                  {weatherData?.forecast[0]?.icon ? (
                    <img 
                      src={`https://openweathermap.org/img/wn/${weatherData.forecast[0].icon}@2x.png`}
                      alt="weather icon"
                      className="w-16 h-16 mx-auto"
                    />
                  ) : '☀️'}
                </p>
                <h3 className="font-bold text-lg text-amber-800">{t('मौसम')}</h3>
                {weatherData?.forecast[0] ? (
                  <div className="text-gray-600">
                    <p className="font-medium">{weatherData.location}</p>
                    <p className="text-2xl font-bold mt-1">
                      {Math.round(weatherData.forecast[0].maxTemp)}°C
                    </p>
                    <p className="text-sm">{t(weatherData.forecast[0].description)}</p>
                    <p className="text-xs mt-1">
                      {t('नमी')}: {weatherData.forecast[0].humidity}% | {t('हवा')}: {weatherData.forecast[0].windSpeed} m/s
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-600">{t('मौसम की जानकारी उपलब्ध नहीं')}</p>
                )}
            </div>
        </Card>
        <Card>
            <div className="p-4 text-center">
                <p className="text-3xl">🌾</p>
                <h3 className="font-bold text-lg text-green-800">{t('मंडी भाव')}</h3>
                {cropPrices?.prices.length ? (
                  <div className="text-left mt-2 space-y-2">
                    {cropPrices.prices.slice(0, 3).map(crop => (
                      <div key={crop.crop} className="text-sm">
                        <span className="font-medium">{t(crop.crop)}</span>: 
                        <span className="text-gray-600"> ₹{crop.averagePrice}/क्विं</span>
                      </div>
                    ))}
                    <p className="text-xs text-gray-500 mt-1">
                      {t('अधिक फसलों के लिए क्लिक करें')}
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-600">{t('बाज़ार भाव उपलब्ध नहीं')}</p>
                )}
            </div>
        </Card>
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