import { ordinalSuffix, padNumber, toTitleCase } from './utils.js';

export class TimeSystem {
    constructor(stateManager) {
        this.stateManager = stateManager;
        this.MONTHS = [
            { name: 'Firstlight', season: 'spring', startDay: 1 },
            { name: 'Bloomrise', season: 'spring', startDay: 31 },
            { name: 'Greenward', season: 'spring', startDay: 61 },
            { name: 'Sunsheight', season: 'summer', startDay: 91 },
            { name: 'Highflame', season: 'summer', startDay: 121 },
            { name: 'Goldfall', season: 'summer', startDay: 151 },
            { name: 'Harvestide', season: 'autumn', startDay: 181 },
            { name: 'Amberfall', season: 'autumn', startDay: 211 },
            { name: 'Duskward', season: 'autumn', startDay: 241 },
            { name: 'Frostmoon', season: 'winter', startDay: 271 },
            { name: 'Deepcold', season: 'winter', startDay: 301 },
            { name: 'Lastnight', season: 'winter', startDay: 331 }
        ];
        this.DAYS = [
            'Solday',
            'Moonday',
            'Forgeday',
            'Middleway',
            'Thunderday',
            'Freeday',
            'Starday'
        ];
        this.SEASONS = {
            spring: { name: 'spring', startDay: 1, endDay: 90 },
            summer: { name: 'summer', startDay: 91, endDay: 180 },
            autumn: { name: 'autumn', startDay: 181, endDay: 270 },
            winter: { name: 'winter', startDay: 271, endDay: 360 }
        };
        this.TIME_PERIODS = [
            { name: 'dawn', startHour: 5, endHour: 7 },
            { name: 'morning', startHour: 8, endHour: 11 },
            { name: 'midday', startHour: 12, endHour: 13 },
            { name: 'afternoon', startHour: 14, endHour: 17 },
            { name: 'dusk', startHour: 18, endHour: 20 },
            { name: 'night', startHour: 21, endHour: 23 },
            { name: 'midnight', startHour: 0, endHour: 2 },
            { name: 'predawn', startHour: 3, endHour: 4 }
        ];
        this.callbacks = {
            time: [],
            day: [],
            season: [],
            year: [],
            hour: [],
            week: []
        };
    }

    advanceTime(minutes) {
        if (!Number.isFinite(minutes)) {
            return;
        }
        const current = { ...this.stateManager.getSection('time') };
        const previousDay = current.dayOfYear;
        const previousSeason = current.season;
        const previousYear = current.year;
        const previousHour = current.hour;
        const previousWeek = Math.floor((current.dayOfYear - 1) / 7);

        let totalMinutes = current.minute + minutes;
        const hourCarry = Math.floor(totalMinutes / 60);
        current.minute = ((totalMinutes % 60) + 60) % 60;

        let totalHours = current.hour + hourCarry;
        const dayCarry = Math.floor(totalHours / 24);
        current.hour = ((totalHours % 24) + 24) % 24;

        if (dayCarry !== 0) {
            const totalDays = (current.dayOfYear - 1) + dayCarry;
            const yearCarry = Math.floor(totalDays / 360);
            current.year += yearCarry;
            current.dayOfYear = ((totalDays % 360) + 360) % 360 + 1;
        }

        this.updateComputedFields(current);
        this.stateManager.updateSection('time', current);
        this.emitCallbacks(previousDay, previousSeason, previousYear, previousHour, previousWeek);
    }

    advanceHours(hours) {
        this.advanceTime(hours * 60);
    }

    advanceDays(days) {
        const current = { ...this.stateManager.getSection('time') };
        const previousDay = current.dayOfYear;
        const previousSeason = current.season;
        const previousYear = current.year;
        const previousHour = current.hour;
        const previousWeek = Math.floor((current.dayOfYear - 1) / 7);

        const totalDays = (current.dayOfYear - 1) + days;
        const yearCarry = Math.floor(totalDays / 360);
        current.year += yearCarry;
        current.dayOfYear = ((totalDays % 360) + 360) % 360 + 1;

        this.updateComputedFields(current);
        this.stateManager.updateSection('time', current);
        this.emitCallbacks(previousDay, previousSeason, previousYear, previousHour, previousWeek);
    }

    setTime(year, dayOfYear, hour, minute) {
        const current = { ...this.stateManager.getSection('time') };
        const previousDay = current.dayOfYear;
        const previousSeason = current.season;
        const previousYear = current.year;
        const previousHour = current.hour;
        const previousWeek = Math.floor((current.dayOfYear - 1) / 7);

        if (year !== null && year !== undefined) {
            current.year = year;
        }
        if (dayOfYear !== null && dayOfYear !== undefined) {
            current.dayOfYear = dayOfYear;
        }
        if (hour !== null && hour !== undefined) {
            current.hour = hour;
        }
        if (minute !== null && minute !== undefined) {
            current.minute = minute;
        }

        this.updateComputedFields(current);
        this.stateManager.updateSection('time', current);
        this.emitCallbacks(previousDay, previousSeason, previousYear, previousHour, previousWeek);
    }

    getCurrentMonth() {
        const time = this.stateManager.getSection('time');
        return this.MONTHS[time.month - 1];
    }

    getCurrentDayOfWeek() {
        const time = this.stateManager.getSection('time');
        return this.DAYS[time.dayOfWeek - 1];
    }

    getCurrentSeason() {
        const time = this.stateManager.getSection('time');
        return time.season;
    }

    getTimeOfDay() {
        const time = this.stateManager.getSection('time');
        return time.timeOfDay;
    }

    getFormattedDate() {
        const time = this.stateManager.getSection('time');
        return `${ordinalSuffix(time.dayOfMonth)} of ${time.monthName}, ${time.year} AV`;
    }

    getFormattedTime() {
        const time = this.stateManager.getSection('time');
        return `${padNumber(time.hour)}:${padNumber(time.minute)}`;
    }

    getFullTimestamp() {
        const time = this.stateManager.getSection('time');
        return `${time.dayName}, ${this.getFormattedDate()} - ${toTitleCase(time.timeOfDay)}`;
    }

    getDayOfMonth() {
        const time = this.stateManager.getSection('time');
        return time.dayOfMonth;
    }

    getDaysUntilSeason(season) {
        const normalized = season?.toLowerCase();
        const target = this.SEASONS[normalized];
        if (!target) {
            return null;
        }
        const time = this.stateManager.getSection('time');
        if (time.dayOfYear <= target.startDay) {
            return target.startDay - time.dayOfYear;
        }
        return (360 - time.dayOfYear) + target.startDay;
    }

    isNighttime() {
        const timeOfDay = this.getTimeOfDay();
        return ['night', 'midnight', 'predawn'].includes(timeOfDay);
    }

    isDaytime() {
        return !this.isNighttime();
    }

    onTimeAdvanced(callback) {
        this.callbacks.time.push(callback);
    }

    onDayChanged(callback) {
        this.callbacks.day.push(callback);
    }

    onSeasonChanged(callback) {
        this.callbacks.season.push(callback);
    }

    onYearChanged(callback) {
        this.callbacks.year.push(callback);
    }

    onHourChanged(callback) {
        this.callbacks.hour.push(callback);
    }

    onWeekChanged(callback) {
        this.callbacks.week.push(callback);
    }

    updateComputedFields(time) {
        const monthIndex = Math.floor((time.dayOfYear - 1) / 30);
        const month = this.MONTHS[monthIndex];

        time.month = monthIndex + 1;
        time.dayOfMonth = ((time.dayOfYear - 1) % 30) + 1;
        time.dayOfWeek = ((time.dayOfYear - 1) % 7) + 1;
        time.monthName = month.name;
        time.season = month.season;
        time.dayName = this.DAYS[time.dayOfWeek - 1];
        time.timeOfDay = this.resolveTimePeriod(time.hour);
    }

    resolveTimePeriod(hour) {
        const match = this.TIME_PERIODS.find(
            (period) => hour >= period.startHour && hour <= period.endHour
        );
        return match ? match.name : 'night';
    }

    emitCallbacks(previousDay, previousSeason, previousYear, previousHour, previousWeek) {
        const time = this.stateManager.getSection('time');
        this.callbacks.time.forEach((callback) => callback(time));
        if (previousHour !== time.hour) {
            this.callbacks.hour.forEach((callback) => callback(time));
        }
        const currentWeek = Math.floor((time.dayOfYear - 1) / 7);
        if (previousWeek !== currentWeek) {
            this.callbacks.week.forEach((callback) => callback(time));
        }
        if (previousDay !== time.dayOfYear) {
            this.callbacks.day.forEach((callback) => callback(time));
        }
        if (previousSeason !== time.season) {
            this.callbacks.season.forEach((callback) => callback(time));
        }
        if (previousYear !== time.year) {
            this.callbacks.year.forEach((callback) => callback(time));
        }
    }
}
