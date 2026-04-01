'use client';

import React, { useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import SettingsLayout from '@/plugins/lms/components/settings/SettingsLayout';
import GeneralSettings from '@/plugins/lms/components/settings/GeneralSettings';
import LearningSettings from '@/plugins/lms/components/settings/LearningSettings';
import EmailSettings from '@/plugins/lms/components/settings/EmailSettings';
import PaymentSettings from '@/plugins/lms/components/settings/PaymentSettings';
import AdvancedSettings from '@/plugins/lms/components/settings/AdvancedSettings';
import StickySaveBar from '@/plugins/lms/components/settings/StickySaveBar';
import SettingsSearch from '@/plugins/lms/components/settings/SettingsSearch';
import { Loader2 } from 'lucide-react';

function SettingsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  // Track dirty state and data for all tabs
  const [tabData, setTabData] = useState<{ [key: string]: { isDirty: boolean; data: any } }>({
    general: { isDirty: false, data: null },
    learning: { isDirty: false, data: null },
    email: { isDirty: false, data: null },
    payment: { isDirty: false, data: null },
    advanced: { isDirty: false, data: null },
  });

  const activeTab = searchParams.get('tab') || 'general';

  const handleDirtyChange = useCallback((tabName: string, isDirty: boolean, data: any) => {
    setTabData(prev => ({
      ...prev,
      [tabName]: { isDirty, data }
    }));
  }, []);

  const isGlobalDirty = Object.values(tabData).some(t => t.isDirty);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const dirtyTabs = Object.entries(tabData).filter(([_, val]) => val.isDirty);
      
      for (const [group, { data }] of dirtyTabs) {
        await fetch('/api/admin/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ settings: data, group }),
        });
      }
      
      // Clear dirty states by refreshing to reset base states in children
      window.location.reload();
    } catch (err) {
      console.error('Failed to save settings', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscard = () => {
    if (confirm('Are you sure you want to discard all unsaved changes?')) {
      window.location.reload();
    }
  };

  const handleGeneralDirty = useCallback((dirty: boolean, data: any) => handleDirtyChange('general', dirty, data), [handleDirtyChange]);
  const handleLearningDirty = useCallback((dirty: boolean, data: any) => handleDirtyChange('learning', dirty, data), [handleDirtyChange]);
  const handleEmailDirty = useCallback((dirty: boolean, data: any) => handleDirtyChange('email', dirty, data), [handleDirtyChange]);
  const handlePaymentDirty = useCallback((dirty: boolean, data: any) => handleDirtyChange('payment', dirty, data), [handleDirtyChange]);
  const handleAdvancedDirty = useCallback((dirty: boolean, data: any) => handleDirtyChange('advanced', dirty, data), [handleDirtyChange]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general': 
        return <GeneralSettings searchQuery={searchQuery} onDirty={handleGeneralDirty} />;
      case 'learning': 
        return <LearningSettings searchQuery={searchQuery} onDirty={handleLearningDirty} />;
      case 'email': 
        return <EmailSettings searchQuery={searchQuery} onDirty={handleEmailDirty} />;
      case 'payment': 
        return <PaymentSettings searchQuery={searchQuery} onDirty={handlePaymentDirty} />;
      case 'advanced': 
        return <AdvancedSettings searchQuery={searchQuery} onDirty={handleAdvancedDirty} />;
      default: 
        return <GeneralSettings searchQuery={searchQuery} onDirty={handleGeneralDirty} />;
    }
  };

  return (
    <SettingsLayout>
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6 border-b border-zinc-100 pb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">Admin Settings</h1>
            <p className="text-sm text-zinc-500 mt-1 font-medium">Configure your entire LMS platform from one place.</p>
          </div>
          <SettingsSearch value={searchQuery} onChange={setSearchQuery} />
        </div>

        <div className="relative animate-in fade-in slide-in-from-bottom-2 duration-500">
          {renderTabContent()}
        </div>

        <StickySaveBar 
          isDirty={isGlobalDirty} 
          isSaving={isSaving} 
          onSave={handleSave} 
          onReset={handleDiscard}
        />
      </div>
    </SettingsLayout>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        <p className="text-zinc-500 font-semibold animate-pulse">Initializing Settings Dashboard...</p>
      </div>
    }>
      <SettingsContent />
    </Suspense>
  );
}
