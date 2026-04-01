'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, DollarSign, Shield } from 'lucide-react';

interface PaymentSettingsProps {
  onDirty: (dirty: boolean, data: any) => void;
  searchQuery?: string;
}

export default function PaymentSettings({ onDirty, searchQuery }: PaymentSettingsProps) {
  const [loading, setLoading] = useState(true);
  const [baseSettings, setBaseSettings] = useState<any>(null);
  const [settings, setSettings] = useState({
    stripePublicKey: '',
    stripeSecretKey: '',
    currency: 'USD',
    enableCoursePricing: true,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings?group=payment');
      const json = await res.json();
      if (json.success) {
        setBaseSettings(json.data);
        setSettings(prev => ({ ...prev, ...json.data }));
      }
    } catch (err) {
      console.error('Failed to fetch settings', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (baseSettings) {
      const isDirty = JSON.stringify(baseSettings) !== JSON.stringify(settings);
      onDirty(isDirty, settings);
    }
  }, [settings, baseSettings, onDirty]);

  const highlightText = (text: string) => {
    if (!searchQuery) return text;
    const parts = text.split(new RegExp(`(${searchQuery})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) => (
          part.toLowerCase() === searchQuery.toLowerCase() 
            ? <mark key={i} className="bg-yellow-200 text-zinc-900 rounded-px px-0.5">{part}</mark> 
            : part
        ))}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="text-zinc-500 font-medium text-sm">Loading Payment Settings...</p>
      </div>
    );
  }

  return (
    <div className="pb-20 animate-in fade-in duration-300">
      <div className="mb-8 border-b border-zinc-200 pb-4">
        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Payment Settings</h1>
        <p className="text-xs text-zinc-500 font-medium">Manage how you accept payments for your courses.</p>
      </div>

      <div className="space-y-12">
        {/* Stripe Configuration Section */}
        <section className="space-y-1 border-t border-zinc-200 pt-8">
          <h3 className="text-sm font-bold text-zinc-800 flex items-center gap-2 mb-6">
            <Shield className="w-4 h-4 text-blue-500" />
            {highlightText('Stripe Configuration')}
          </h3>
          
          <div className="space-y-0 divide-y divide-zinc-100">
            <div className="flex flex-col md:flex-row md:items-center py-4 gap-4">
              <label className="text-sm font-semibold text-zinc-700 w-full md:w-64">
                {highlightText('Stripe Public Key')}
              </label>
              <div className="flex-1">
                <input 
                  type="text"
                  className="w-full max-w-lg bg-white border border-zinc-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all font-mono"
                  value={settings.stripePublicKey}
                  onChange={e => setSettings({...settings, stripePublicKey: e.target.value})}
                  placeholder="pk_test_..."
                />
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center py-4 gap-4">
              <label className="text-sm font-semibold text-zinc-700 w-full md:w-64">
                {highlightText('Stripe Secret Key')}
              </label>
              <div className="flex-1">
                <input 
                  type="password"
                  className="w-full max-w-lg bg-white border border-zinc-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all font-mono"
                  value={settings.stripeSecretKey}
                  onChange={e => setSettings({...settings, stripeSecretKey: e.target.value})}
                  placeholder="sk_test_..."
                />
              </div>
            </div>
          </div>
        </section>

        {/* Currency Section */}
        <section className="space-y-1 border-t border-zinc-200 pt-8">
          <h3 className="text-sm font-bold text-zinc-800 flex items-center gap-2 mb-6">
            <DollarSign className="w-4 h-4 text-blue-500" />
            {highlightText('Currency & Pricing')}
          </h3>
          
          <div className="space-y-0 divide-y divide-zinc-100">
            <div className="flex flex-col md:flex-row md:items-center py-4 gap-4">
              <label className="text-sm font-semibold text-zinc-700 w-full md:w-64">
                {highlightText('Base Currency')}
              </label>
              <div className="flex-1">
                <select 
                  className="bg-white border border-zinc-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 appearance-none min-w-[300px]"
                  value={settings.currency}
                  onChange={e => setSettings({...settings, currency: e.target.value})}
                >
                  <option value="USD">United States Dollar (USD)</option>
                  <option value="EUR">Euro (EUR)</option>
                  <option value="GBP">British Pound (GBP)</option>
                  <option value="INR">Indian Rupee (INR)</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center py-4 gap-4">
              <label className="text-sm font-semibold text-zinc-700 w-full md:w-64">
                {highlightText('Enable Course Pricing')}
              </label>
              <div className="flex-1">
                <button 
                  type="button"
                  onClick={() => setSettings({...settings, enableCoursePricing: !settings.enableCoursePricing})}
                  className={`w-10 h-5 rounded-full transition-all relative ${settings.enableCoursePricing ? 'bg-blue-600' : 'bg-zinc-300'}`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${settings.enableCoursePricing ? 'right-0.5' : 'left-0.5'}`}></div>
                </button>
                <p className="text-[11px] text-zinc-400 mt-1.5 italic">
                  {highlightText('When disabled, courses will not show pricing options.')}
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
