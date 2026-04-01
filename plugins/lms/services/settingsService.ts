import Setting from '../models/Setting';

export const settingsService = {
  /**
   * Fetch all settings or settings by group
   */
  async getSettings(group?: string) {
    const query = group ? { group } : {};
    const settingsArray = await Setting.find(query);
    
    // Transform array to key-value object
    return settingsArray.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {} as Record<string, any>);
  },

  /**
   * Bulk update settings
   */
  async updateSettings(settings: Record<string, any>, group: string) {
    const entries = Object.entries(settings);
    
    await Promise.all(
      entries.map(([key, value]) => 
        Setting.findOneAndUpdate(
          { key },
          { key, value, group },
          { upsert: true, new: true }
        )
      )
    );

    return { success: true };
  },

  /**
   * Get a single setting by key
   */
  async getSetting(key: string, defaultValue: any = null) {
    const setting = await Setting.findOne({ key });
    return setting ? setting.value : defaultValue;
  }
};
