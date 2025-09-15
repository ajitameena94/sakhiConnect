import React, { useState } from 'react';
import { signInWithPopup, signInWithRedirect } from 'firebase/auth';
import { auth, googleProvider } from '../firebase/config';
import Logo from './Logo';
import { useTranslation } from '../hooks/useTranslation';

const Login: React.FC = () => {
    const { t } = useTranslation();
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        setError(null);
        try {
            await signInWithPopup(auth, googleProvider);
            // If popup succeeds, reset loading. onAuthStateChanged will update global auth state.
            setIsLoading(false);
        } catch (err: any) {
            console.error("Google Sign-In Error (popup):", err);
            // Popup can fail in some browsers due to blockers. Fallback to redirect.
            try {
                await signInWithRedirect(auth, googleProvider);
                // redirect will navigate away; no need to set loading here.
                } catch (redirectErr: any) {
                    console.error("Google Sign-In Error (redirect fallback):", redirectErr);
                    const code = redirectErr?.code || redirectErr?.message || '';
                    const friendly = mapFirebaseErrorToMessage(code);
                    setError(friendly);
                    setIsLoading(false);
                }
        }
    };

        function mapFirebaseErrorToMessage(code: string) {
            if (!code) return 'साइन इन करने में विफल। कृपया पुन: प्रयास करें।';
        if (code.includes('popup-blocked')) return 'पॉपअप अवरुद्ध है — कृपया पॉपअप अनुमति दें और पुन: प्रयास करें।';
            if (code.includes('popup-closed-by-user')) return 'पॉपअप बंद कर दिया गया — कृपया पुन: प्रयास करें।';
            if (code.includes('unauthorized-domain')) return 'यह डोमेन Firebase में अधिकृत नहीं है। कृपया localhost:5173 को Firebase Authentication के Authorized domains में जोड़ें।';
        if (code.includes('invalid-continue-uri') || code.includes('invalid-continue-uri')) return 'Redirect URL गलत/अमान्य है — कृपया सुनिश्चित करें कि Firebase Authorized domains में यह डोमेन जुड़ा हुआ है।';
        if (code.includes('invalid-action-code')) return 'साइन-इन कोड अमान्य है — दोबारा प्रयास करें।';
        if (code.includes('invalid-api-key')) return 'Firebase API key अमान्य है — .env.local की FIREBASE_API_KEY जाँचें।';
            if (code.includes('network-request-failed')) return 'नेटवर्क त्रुटि — इंटरनेट कनेक्शन जाँचें और पुन: प्रयास करें।';
            if (code.includes('operation-not-allowed')) return 'Google साइन-इन सक्षम नहीं है। Firebase Console में Sign-in method से Google सक्षम करें।';
            return 'साइन इन करने में विफल: ' + code;
        }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 via-amber-50 to-stone-100 p-4">
            <div className="max-w-sm w-full text-center">
                <Logo className="h-12 mx-auto mb-8" />
                <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg p-8 border border-white/80">
                    <h1 className="text-2xl font-bold text-green-800 mb-2">{t('सखी कनेक्ट में आपका स्वागत है')}</h1>
                    <p className="text-gray-600 mb-8">{t('आगे बढ़ने के लिए कृपया साइन इन करें।')}</p>
                    
                    <button
                        onClick={handleGoogleSignIn}
                        disabled={isLoading}
                        className="w-full bg-white border border-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-lg flex items-center justify-center space-x-2 hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 48 48">
                            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                            <path fill="none" d="M0 0h48v48H0z"></path>
                        </svg>
                        <span>{t('Google के साथ साइन इन करें')}</span>
                    </button>

                    {isLoading && <p className="mt-4 text-sm text-gray-600">{t('प्रतीक्षा करें...')}</p>}
                    {error && <p className="mt-4 text-sm text-red-600">{t(error)}</p>}
                </div>
            </div>
        </div>
    );
};

export default Login;