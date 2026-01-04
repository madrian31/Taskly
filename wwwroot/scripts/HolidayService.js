/**
 * Holiday Service
 * Fetches Philippine holidays from Nager.Date API
 * No authentication required - automatically handles any year
 */

class HolidayService {
  constructor() {
    this.apiUrl = 'https://date.nager.at/api/v3/PublicHolidays';
    this.countryCode = 'PH';
    this.cachedHolidays = {};
  }

  /**
   * Get holidays for a specific year (default: current year)
   * @param {number} [year] - The year to fetch holidays for. Defaults to current year.
   * @returns {Promise<Array>} Array of holiday objects with date and name
   */
  async getHolidays(year) {
    const targetYear = year || new Date().getFullYear();
    
    // Check cache first
    if (this.cachedHolidays[targetYear]) {
      console.log(`📅 Returning cached holidays for ${targetYear}`);
      return this.cachedHolidays[targetYear];
    }

    try {
      const response = await fetch(`${this.apiUrl}/${targetYear}/${this.countryCode}`);
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} - ${response.statusText}`);
      }

      const holidays = await response.json();
      
      // Cache the results
      this.cachedHolidays[targetYear] = holidays;
      
      console.log(`✅ Fetched ${holidays.length} holidays for Philippines in ${targetYear}`);
      return holidays;

    } catch (error) {
      console.error('❌ Error fetching holidays from API:', error);
      return [];
    }
  }

  /**
   * Get holiday dates as strings for calendar marking (YYYY-MM-DD format)
   * @param {number} [year] - The year to fetch holidays for. Defaults to current year.
   * @returns {Promise<Array<string>>} Array of date strings for calendar
   */
  async getCalendarHolidays(year) {
    const holidays = await this.getHolidays(year);
    return holidays.map(h => h.date);
  }

  /**
   * Check if a date is a holiday
   * @param {Date|string} date - The date to check (Date object or string in YYYY-MM-DD format)
   * @returns {Promise<Object|null>} Holiday object if found, null otherwise
   */
  async isHoliday(date) {
    let dateString;

    if (date instanceof Date) {
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const year = date.getFullYear();
      dateString = `${year}-${month}-${day}`;
    } else if (typeof date === 'string') {
      dateString = date; // Assume YYYY-MM-DD format
    } else {
      throw new Error('Date must be a Date object or string in YYYY-MM-DD format');
    }

    const year = dateString.split('-')[0];
    const holidays = await this.getHolidays(parseInt(year));
    
    return holidays.find(h => h.date === dateString) || null;
  }

  /**
   * Clear all cached holidays
   */
  clearCache() {
    this.cachedHolidays = {};
    console.log('🧹 Holiday cache cleared');
  }
}

// Export as singleton
export default new HolidayService();

