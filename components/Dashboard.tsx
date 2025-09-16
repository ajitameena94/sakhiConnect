import React, { useState, useEffect } from 'react';
import Card from './Card';
import { getDashboardData, getFeaturedScheme, getWeatherData, getCropPrices } from '../services/firestoreService';
import { Scheme, WeatherData, CropPriceData } from '../types';
import Spinner from './Spinner';
import { useTranslation } from '../hooks/useTranslation';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';

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

  const hourlyWeatherData = weatherData?.forecast.slice(0, 6).map((hour, index) => ({
    time: `${index + 1} ${t('घंटे')}`,
    temp: hour.maxTemp,
    rainfall: hour.rainfall,
    wind: hour.windSpeed,
    humidity: hour.humidity,
  }));

  const cropPriceTrends = cropPrices?.prices.map(crop => ({
    label: t(crop.crop),
    data: crop.trend,
  }));

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <div className="animate-pulse">
          <Spinner />
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-red-50 to-orange-50">
        <div className="text-center text-red-600 p-8 bg-white rounded-lg shadow-lg animate-fade-in">
          {t(error)}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-100 via-purple-100 to-sky-100 p-4 md:p-6 space-y-4 md:space-y-6">
      <Card className="transform hover:scale-102 transition-all duration-300 bg-gradient-to-r from-rose-500/10 via-purple-500/10 to-sky-500/10 shadow-xl hover:shadow-2xl">
        <div className="p-4 md:p-6">
          <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-rose-600 via-purple-600 to-sky-600 bg-clip-text text-transparent animate-gradient">
            {t('नमस्ते!')}
          </h2>
          <p className="text-gray-700 mt-3 text-base md:text-lg leading-relaxed">
            {t('आपकी सखी आपकी सहायता के लिए यहाँ है। आज आप क्या जानना चाहेंगी?')}
          </p>
        </div>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <Card className="transform hover:scale-102 transition-all duration-300 bg-gradient-to-br from-orange-500/20 via-amber-500/20 to-yellow-500/20 shadow-lg hover:shadow-2xl">
            <div className="p-4 md:p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-xl md:text-2xl bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">{t('मौसम')}</h3>
                    {weatherData?.forecast[0]?.icon ? (
                        <img 
                            src={`https://openweathermap.org/img/wn/${weatherData.forecast[0].icon}@2x.png`}
                            alt="weather icon"
                            className="w-16 h-16 md:w-20 md:h-20 drop-shadow-lg animate-float"
                        />
                    ) : <span className="text-4xl md:text-5xl animate-float">☀️</span>}
                </div>
                {weatherData?.forecast[0] ? (
                  <div className="space-y-4">
                    <p className="font-medium text-lg text-gray-700">{weatherData.location}</p>
                    <div className="relative">
                      <p className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                        {Math.round(weatherData.forecast[0].maxTemp)}°C
                      </p>
                      <p className="text-lg md:text-xl text-gray-600 mt-2">{t(weatherData.forecast[0].description)}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-4">
                      <div className="bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
                        <p className="text-sm font-medium text-gray-500">{t('नमी')}</p>
                        <p className="text-xl font-bold text-gray-800">{weatherData.forecast[0].humidity}%</p>
                      </div>
                      <div className="bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
                        <p className="text-sm font-medium text-gray-500">{t('हवा')}</p>
                        <p className="text-xl font-bold text-gray-800">{weatherData.forecast[0].windSpeed} m/s</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-600">{t('मौसम की जानकारी उपलब्ध नहीं')}</p>
                )}
            </div>
        </Card>
        <Card className="transform hover:scale-102 transition-all duration-300 bg-gradient-to-br from-emerald-500/20 via-green-500/20 to-lime-500/20 shadow-lg hover:shadow-2xl">
            <div className="p-4 md:p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-xl md:text-2xl bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">{t('मंडी भाव')}</h3>
                    <span className="text-4xl md:text-5xl animate-float">🌾</span>
                </div>
                {cropPrices?.prices.length ? (
                  <div className="space-y-3">
                    {cropPrices.prices.slice(0, 3).map(crop => (
                      <div key={crop.crop} 
                           className="bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-sm rounded-2xl p-4 shadow-lg transform transition-all duration-300 hover:translate-x-1">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-base md:text-lg text-gray-700">{t(crop.crop)}</span>
                          <span className="text-lg md:text-xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                            ₹{crop.averagePrice}/क्विं
                          </span>
                        </div>
                      </div>
                    ))}
                    <button className="w-full mt-6 py-3 px-6 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-xl shadow-lg transform transition-all duration-300 hover:shadow-xl hover:translate-y-[-2px] active:translate-y-[0px] font-medium text-sm md:text-base">
                      {t('अधिक फसलों के लिए क्लिक करें')}
                    </button>
                  </div>
                ) : (
                  <p className="text-gray-600">{t('बाज़ार भाव उपलब्ध नहीं')}</p>
                )}
            </div>
        </Card>
      </div>


      {featuredScheme && (
        <Card className="transform hover:scale-102 transition-all duration-300 bg-gradient-to-r from-purple-400/10 to-pink-400/10">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">📜</span>
              <h3 className="text-xl font-bold text-purple-800">{t('मुख्य योजना')}</h3>
            </div>
            <h4 className="text-lg font-semibold text-gray-800">{t(featuredScheme.title)}</h4>
            <p className="mt-2 text-gray-600 leading-relaxed">{t(featuredScheme.description)}</p>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="transform hover:scale-102 transition-all duration-300 bg-gradient-to-br from-blue-400/10 to-cyan-400/10">
          <div className="p-6">
            <h3 className="text-xl font-bold text-blue-800 mb-4">{t('घंटेवार मौसम')}</h3>
            {hourlyWeatherData ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {hourlyWeatherData.map((hour, index) => (
                  <div key={index} className="bg-white/50 rounded-lg p-4 text-center">
                    <p className="font-medium text-gray-700">{hour.time}</p>
                    <p className="text-2xl font-bold text-blue-900 my-2">{hour.temp}°C</p>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>{t('वर्षा')}: {hour.rainfall}mm</p>
                      <p>{t('हवा')}: {hour.wind} m/s</p>
                      <p>{t('नमी')}: {hour.humidity}%</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">{t('घंटेवार मौसम डेटा उपलब्ध नहीं')}</p>
            )}
          </div>
        </Card>

        <Card className="transform hover:scale-102 transition-all duration-300 bg-gradient-to-br from-violet-500/20 via-purple-500/20 to-fuchsia-500/20 shadow-lg hover:shadow-2xl">
          <div className="p-4 md:p-6">
            <div className="flex items-center gap-3 mb-6">
              <h3 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                {t('फसल मूल्य रुझान')}
              </h3>
              <span className="text-2xl animate-pulse">📈</span>
            </div>
            {cropPriceTrends && cropPriceTrends.length > 0 && cropPriceTrends[0].data ? (
              <div className="bg-gradient-to-br from-white/90 to-white/50 backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-lg">
                <Line
                  data={{
                    labels: cropPriceTrends[0].data.map((_, index) => `${index + 1} ${t('दिन')}`),
                    datasets: cropPriceTrends.map((trend, index) => ({
                      label: trend.label,
                      data: trend.data,
                      borderColor: [
                        'rgba(124, 58, 237, 1)',  // violet-600
                        'rgba(219, 39, 119, 1)',  // pink-600
                        'rgba(236, 72, 153, 1)',  // rose-500
                      ][index % 3],
                      backgroundColor: [
                        'rgba(124, 58, 237, 0.1)',
                        'rgba(219, 39, 119, 0.1)',
                        'rgba(236, 72, 153, 0.1)',
                      ][index % 3],
                      borderWidth: 3,
                      tension: 0.4,
                      pointBackgroundColor: 'white',
                      pointBorderColor: [
                        'rgba(124, 58, 237, 1)',
                        'rgba(219, 39, 119, 1)',
                        'rgba(236, 72, 153, 1)',
                      ][index % 3],
                      pointRadius: 4,
                      pointHoverRadius: 6,
                    })),
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                      legend: {
                        position: 'top',
                        labels: {
                          font: {
                            size: 13,
                            weight: 'bold',
                            family: 'system-ui',
                          },
                          padding: 15,
                          usePointStyle: true,
                          pointStyle: 'circle',
                        },
                      },
                      tooltip: {
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        titleColor: '#1f2937',
                        bodyColor: '#4b5563',
                        borderColor: 'rgba(124, 58, 237, 0.2)',
                        borderWidth: 1,
                        padding: 12,
                        cornerRadius: 8,
                        titleFont: {
                          size: 14,
                          weight: 'bold',
                        },
                        bodyFont: {
                          size: 13,
                        },
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: false,
                        grid: {
                          color: 'rgba(0, 0, 0, 0.05)',
                        },
                        ticks: {
                          font: {
                            size: 12,
                          },
                          padding: 8,
                        },
                      },
                      x: {
                        grid: {
                          display: false,
                        },
                        ticks: {
                          font: {
                            size: 12,
                          },
                          padding: 8,
                        },
                      },
                    },
                    animation: {
                      duration: 1500,
                      easing: 'easeInOutQuart',
                    },
                  }}
                />
              </div>
            ) : (
              <p className="text-gray-600 text-center py-8">{t('फसल मूल्य रुझान उपलब्ध नहीं')}</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;