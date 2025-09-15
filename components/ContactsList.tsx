import React, { useState, useEffect } from 'react';
import Card from './Card';
import { getContacts } from '../services/firestoreService';
import { Contact } from '../types';
import Spinner from './Spinner';
import { useTranslation } from '../hooks/useTranslation';

const ContactsList: React.FC = () => {
  const { t } = useTranslation();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        setLoading(true);
        const contactsData = await getContacts();
        setContacts(contactsData);
        setError(null);
      } catch (err) {
        console.error("Error fetching contacts:", err);
        setError("संपर्क लोड करने में असमर्थ।");
      } finally {
        setLoading(false);
      }
    };
    fetchContacts();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold text-center text-green-800 mb-6">{t('ज़रूरी संपर्क')}</h2>
      <Card>
        {loading && <div className="flex justify-center p-10"><Spinner /></div>}
        {error && <p className="text-center text-red-600 p-4">{t(error)}</p>}
        {!loading && !error && (
          <div className="divide-y divide-green-200/50">
            {contacts.map((contact) => (
              <div key={contact.id} className="p-4">
                <h3 className="font-bold text-green-900">{t(contact.name)}</h3>
                <p className="text-sm text-gray-600">{t(contact.role)}</p>
                <a href={`tel:${contact.phone}`} className="text-sm text-amber-700 font-semibold mt-1 inline-block">{contact.phone}</a>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default ContactsList;