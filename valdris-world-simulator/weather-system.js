import { ordinalSuffix, padNumber } from './utils.js';

export class WeatherSystem {
    constructor(stateManager, timeSystem) {
        this.stateManager = stateManager;
        this.timeSystem = timeSystem;
        this.WEATHER_TYPES = {
            clear: {
                name: 'Clear',
                icon: '☀️',
                description: 'Clear skies',
                travelModifier: 1.0,
                visibilityModifier: 1.0,
                moodModifier: 'pleasant'
            },
            partlyCloudy: {
                name: 'Partly Cloudy',
                icon: '⛅',
                description: 'Scattered clouds',
                travelModifier: 1.0,
                visibilityModifier: 0.95,
                moodModifier: 'neutral'
            },
            cloudy: {
                name: 'Cloudy',
                icon: '☁️',
                description: 'Overcast skies',
                travelModifier: 1.0,
                visibilityModifier: 0.85,
                moodModifier: 'gloomy'
            },
            lightRain: {
                name: 'Light Rain',
                icon: '🌦️',
                description: 'Light rainfall',
                travelModifier: 0.9,
                visibilityModifier: 0.75,
                moodModifier: 'dreary'
            },
            rain: {
                name: 'Rain',
                icon: '🌧️',
                description: 'Steady rain',
                travelModifier: 0.75,
                visibilityModifier: 0.6,
                moodModifier: 'wet'
            },
            heavyRain: {
                name: 'Heavy Rain',
                icon: '⛈️',
                description: 'Heavy downpour',
                travelModifier: 0.5,
                visibilityModifier: 0.4,
                moodModifier: 'miserable'
            },
            thunderstorm: {
                name: 'Thunderstorm',
                icon: '🌩️',
                description: 'Thunder and lightning',
                travelModifier: 0.3,
                visibilityModifier: 0.3,
                moodModifier: 'dangerous'
            },
            fog: {
                name: 'Fog',
                icon: '🌫️',
                description: 'Dense fog',
                travelModifier: 0.6,
                visibilityModifier: 0.2,
                moodModifier: 'eerie'
            },
            snow: {
                name: 'Snow',
                icon: '🌨️',
                description: 'Snowfall',
                travelModifier: 0.6,
                visibilityModifier: 0.5,
                moodModifier: 'cold'
            },
            heavySnow: {
                name: 'Heavy Snow',
                icon: '❄️',
                description: 'Blizzard conditions',
                travelModifier: 0.25,
                visibilityModifier: 0.2,
                moodModifier: 'treacherous'
            },
            hail: {
                name: 'Hail',
                icon: '🧊',
                description: 'Hailstorm',
                travelModifier: 0.4,
                visibilityModifier: 0.5,
                moodModifier: 'dangerous'
            },
            wind: {
                name: 'Windy',
                icon: '💨',
                description: 'Strong winds',
                travelModifier: 0.8,
                visibilityModifier: 0.9,
                moodModifier: 'blustery'
            },
            hot: {
                name: 'Scorching',
                icon: '🔥',
                description: 'Extreme heat',
                travelModifier: 0.7,
                visibilityModifier: 0.9,
                moodModifier: 'oppressive'
            },
            cold: {
                name: 'Bitter Cold',
                icon: '🥶',
                description: 'Freezing temperatures',
                travelModifier: 0.7,
                visibilityModifier: 1.0,
                moodModifier: 'harsh'
            }
        };
        this.SEASON_WEATHER_WEIGHTS = {
            spring: {
                clear: 25,
                partlyCloudy: 25,
                cloudy: 15,
                lightRain: 15,
                rain: 10,
                thunderstorm: 5,
                fog: 5
            },
            summer: {
                clear: 40,
                partlyCloudy: 20,
                cloudy: 10,
                lightRain: 5,
                rain: 5,
                thunderstorm: 10,
                hot: 10
            },
            autumn: {
                clear: 20,
                partlyCloudy: 20,
                cloudy: 20,
                lightRain: 15,
                rain: 10,
                fog: 10,
                wind: 5
            },
            winter: {
                clear: 15,
                partlyCloudy: 15,
                cloudy: 20,
                snow: 20,
                heavySnow: 10,
                cold: 10,
                fog: 5,
                wind: 5
            }
        };
        this.SEASON_TEMPS = {
            spring: { min: 45, max: 70, avg: 58 },
            summer: { min: 65, max: 95, avg: 80 },
            autumn: { min: 40, max: 65, avg: 52 },
            winter: { min: 15, max: 40, avg: 28 }
        };
        this.TIME_TEMP_MODIFIERS = {
            dawn: -5,
            morning: 0,
            midday: 10,
            afternoon: 8,
            dusk: 2,
            night: -8,
            midnight: -12,
            predawn: -10
        };
        this.WEATHER_TEMP_MODIFIERS = {
            clear: 5,
            partlyCloudy: 2,
            cloudy: -3,
            lightRain: -5,
            rain: -8,
            heavyRain: -10,
            thunderstorm: -12,
            fog: -5,
            snow: -15,
            heavySnow: -25,
            hail: -10,
            wind: -5,
            hot: 20,
            cold: -20
        };
        this.EXTREME_EVENTS = {
            hurricane: {
                name: 'Hurricane',
                icon: '🌀',
                description: 'A massive storm system batters the region',
                duration: { min: 12, max: 48 },
                effects: {
                    travelModifier: 0.1,
                    visibilityModifier: 0.1,
                    dangerLevel: 'extreme'
                },
                seasonChance: { summer: 0.5, autumn: 0.3 }
            },
            blizzard: {
                name: 'Blizzard',
                icon: '🌨️',
                description: 'A severe snowstorm with whiteout conditions',
                duration: { min: 6, max: 24 },
                effects: {
                    travelModifier: 0.05,
                    visibilityModifier: 0.05,
                    dangerLevel: 'extreme'
                },
                seasonChance: { winter: 1.0 }
            },
            heatWave: {
                name: 'Heat Wave',
                icon: '🥵',
                description: 'Dangerously high temperatures',
                duration: { min: 24, max: 72 },
                effects: {
                    travelModifier: 0.5,
                    tempModifier: 25,
                    dangerLevel: 'high'
                },
                seasonChance: { summer: 0.8 }
            },
            coldSnap: {
                name: 'Cold Snap',
                icon: '🥶',
                description: 'Dangerously low temperatures',
                duration: { min: 24, max: 72 },
                effects: {
                    travelModifier: 0.5,
                    tempModifier: -30,
                    dangerLevel: 'high'
                },
                seasonChance: { winter: 0.8 }
            },
            superstorm: {
                name: 'Magical Storm',
                icon: '⚡',
                description: 'A storm crackling with wild magical energy',
                duration: { min: 3, max: 12 },
                effects: {
                    travelModifier: 0.2,
                    visibilityModifier: 0.3,
                    dangerLevel: 'extreme',
                    magicModifier: 'unstable'
                },
                seasonChance: { spring: 0.1, summer: 0.2, autumn: 0.1 }
            },
            eclipse: {
                name: 'Eclipse',
                icon: '🌑',
                description: 'The sun is blocked, darkness falls at midday',
                duration: { min: 1, max: 3 },
                effects: {
                    visibilityModifier: 0.4,
                    moodModifier: 'ominous',
                    dangerLevel: 'moderate'
                },
                seasonChance: { spring: 0.05, summer: 0.05, autumn: 0.05, winter: 0.05 }
            },
            bloodMoon: {
                name: 'Blood Moon',
                icon: '🌑',
                description: 'The moon glows an ominous red',
                duration: { min: 8, max: 12 },
                effects: {
                    moodModifier: 'sinister',
                    dangerLevel: 'high',
                    undeadModifier: 'empowered'
                },
                seasonChance: { autumn: 0.1, winter: 0.05 }
            },
            ashfall: {
                name: 'Ashfall',
                icon: '🌋',
                description: 'Volcanic ash rains from distant eruption',
                duration: { min: 12, max: 48 },
                effects: {
                    travelModifier: 0.6,
                    visibilityModifier: 0.4,
                    dangerLevel: 'moderate'
                },
                seasonChance: { spring: 0.02, summer: 0.02, autumn: 0.02, winter: 0.02 }
            }
        };
        this.listeners = [];
        this.lastObservedHours = null;
        this.initialized = false;
    }

    initialize() {
        this.lastObservedHours = this.getCurrentWorldHours();
        const weather = this.stateManager.getSection('weather');
        if (!weather?.current?.lastUpdated) {
            this.forceWeatherUpdate();
        }
        if (!this.initialized) {
            this.timeSystem.onTimeAdvanced(() => this.checkWeatherUpdate());
            this.timeSystem.onSeasonChanged(() => this.forceWeatherUpdate());
            this.timeSystem.onHourChanged(() => this.checkWeatherUpdate());
            this.initialized = true;
        }
    }

    refreshState() {
        this.lastObservedHours = this.getCurrentWorldHours();
        const weather = this.stateManager.getSection('weather');
        if (!weather?.current?.lastUpdated) {
            this.forceWeatherUpdate();
        }
    }

    generateWeather(season) {
        const weights = this.SEASON_WEATHER_WEIGHTS[season] || this.SEASON_WEATHER_WEIGHTS.spring;
        const type = this.pickWeighted(weights);
        return type;
    }

    calculateTemperature(season, timeOfDay, weatherType, activeEvent) {
        const base = this.SEASON_TEMPS[season] || this.SEASON_TEMPS.spring;
        const baseTemp = this.randomRange(base.min, base.max);
        const timeModifier = this.TIME_TEMP_MODIFIERS[timeOfDay] ?? 0;
        const weatherModifier = this.WEATHER_TEMP_MODIFIERS[weatherType] ?? 0;
        const eventModifier = activeEvent?.effects?.tempModifier ?? 0;
        const variance = this.randomRange(-4, 4);
        return Math.round(baseTemp + timeModifier + weatherModifier + eventModifier + variance);
    }

    checkWeatherUpdate() {
        const weatherState = this.stateManager.getSection('weather');
        if (!weatherState?.weatherEnabled) {
            this.lastObservedHours = this.getCurrentWorldHours();
            return;
        }
        const currentHours = this.getCurrentWorldHours();
        if (this.lastObservedHours === null) {
            this.lastObservedHours = currentHours;
            return;
        }
        const elapsedHours = Math.max(0, currentHours - this.lastObservedHours);
        if (elapsedHours === 0) {
            return;
        }
        this.lastObservedHours = currentHours;

        if (weatherState.activeEvent) {
            weatherState.eventDuration = Math.max(0, weatherState.eventDuration - elapsedHours);
            if (weatherState.eventDuration <= 0) {
                weatherState.activeEvent = null;
            }
        }

        weatherState.weatherDuration = Math.max(0, weatherState.weatherDuration - elapsedHours);
        if (weatherState.weatherDuration <= 0) {
            this.applyNewWeather(weatherState);
        } else if (elapsedHours >= 4) {
            this.checkRandomExtremeEvent(weatherState);
            this.stateManager.updateSection('weather', { ...weatherState });
            this.emitChange();
        }
    }

    forceWeatherUpdate() {
        const weatherState = this.stateManager.getSection('weather');
        if (!weatherState?.weatherEnabled) {
            return;
        }
        this.applyNewWeather({ ...weatherState });
    }

    setWeather(weatherType, duration = null) {
        const weatherState = this.stateManager.getSection('weather');
        const timeState = this.stateManager.getSection('time');
        const season = timeState.season;
        const timeOfDay = timeState.timeOfDay;
        const current = weatherState.current;
        const nextWeatherType = this.WEATHER_TYPES[weatherType] ? weatherType : 'clear';
        const newDuration = duration ?? this.randomRange(4, 12);
        const activeEvent = weatherState.activeEvent;
        const temperature = this.calculateTemperature(season, timeOfDay, nextWeatherType, activeEvent);
        const updated = {
            ...weatherState,
            current: {
                ...current,
                type: nextWeatherType,
                temperature,
                humidity: this.getHumidity(nextWeatherType),
                windSpeed: this.getWindSpeed(nextWeatherType),
                windDirection: this.getWindDirection(),
                precipitation: this.getPrecipitation(nextWeatherType),
                visibility: this.getVisibility(nextWeatherType),
                lastUpdated: new Date().toISOString()
            },
            weatherDuration: newDuration,
            nextWeatherChange: this.getForecastTimestamp(newDuration)
        };
        this.stateManager.updateSection('weather', updated);
        this.emitChange();
    }

    getCurrentWeather() {
        return this.stateManager.getSection('weather');
    }

    getWeatherDescription() {
        const weatherState = this.stateManager.getSection('weather');
        const weatherType = this.WEATHER_TYPES[weatherState.current.type];
        const temp = this.getDisplayTemperature();
        const humidity = weatherState.current.humidity;
        const wind = weatherState.current.windSpeed;
        const visibility = weatherState.current.visibility;
        const humidityText = humidity > 70 ? 'humid' : humidity < 35 ? 'dry' : 'mild';
        const visibilityText = visibility < 40 ? 'low visibility' : visibility < 70 ? 'hazy' : 'clear visibility';
        let description = `${weatherType.description}. The temperature is ${temp} with ${humidityText} air and ${visibilityText}.`;
        if (weatherState.activeEvent) {
            description += ` ${weatherState.activeEvent.description}.`;
        }
        if (wind >= 20) {
            description += ' Strong winds buffet the area.';
        }
        return description;
    }

    getWeatherForPrompt() {
        const weatherState = this.stateManager.getSection('weather');
        const weatherType = this.WEATHER_TYPES[weatherState.current.type];
        const temp = this.getDisplayTemperature();
        let context = `${weatherType.name}, ${temp}`;
        if (weatherState.activeEvent) {
            context += ` | EXTREME: ${weatherState.activeEvent.name}`;
        }
        return context;
    }

    fahrenheitToCelsius(value) {
        return Math.round((value - 32) * 5 / 9);
    }

    getDisplayTemperature() {
        const weatherState = this.stateManager.getSection('weather');
        if (weatherState.showTemperatureInCelsius) {
            return `${this.fahrenheitToCelsius(weatherState.current.temperature)}°C`;
        }
        return `${weatherState.current.temperature}°F`;
    }

    getTravelModifier() {
        const weatherState = this.stateManager.getSection('weather');
        const base = this.WEATHER_TYPES[weatherState.current.type]?.travelModifier ?? 1.0;
        const eventMod = weatherState.activeEvent?.effects?.travelModifier ?? 1.0;
        return base * eventMod;
    }

    getVisibilityModifier() {
        const weatherState = this.stateManager.getSection('weather');
        const base = this.WEATHER_TYPES[weatherState.current.type]?.visibilityModifier ?? 1.0;
        const eventMod = weatherState.activeEvent?.effects?.visibilityModifier ?? 1.0;
        return base * eventMod;
    }

    triggerExtremeEvent(eventType) {
        const weatherState = this.stateManager.getSection('weather');
        const event = this.EXTREME_EVENTS[eventType];
        if (!event) {
            return;
        }
        const duration = this.randomRange(event.duration.min, event.duration.max);
        weatherState.activeEvent = event;
        weatherState.eventDuration = duration;
        weatherState.current.temperature = this.calculateTemperature(
            this.stateManager.getSection('time').season,
            this.stateManager.getSection('time').timeOfDay,
            weatherState.current.type,
            event
        );
        this.stateManager.updateSection('weather', { ...weatherState });
        this.emitChange();
    }

    checkRandomExtremeEvent(weatherState) {
        if (!weatherState.extremeEventsEnabled || weatherState.activeEvent) {
            return;
        }
        const season = this.stateManager.getSection('time').season;
        for (const [eventKey, event] of Object.entries(this.EXTREME_EVENTS)) {
            const chance = event.seasonChance?.[season] ?? 0;
            if (chance <= 0) {
                continue;
            }
            const perHourChance = (chance / 100) / 24;
            if (Math.random() < perHourChance) {
                this.triggerExtremeEvent(eventKey);
                break;
            }
        }
    }

    onWeatherChanged(callback) {
        this.listeners.push(callback);
    }

    applyNewWeather(weatherState) {
        const season = this.stateManager.getSection('time').season;
        const timeOfDay = this.stateManager.getSection('time').timeOfDay;
        const nextWeatherType = this.generateWeather(season);
        weatherState.current.type = nextWeatherType;
        weatherState.current.temperature = this.calculateTemperature(
            season,
            timeOfDay,
            nextWeatherType,
            weatherState.activeEvent
        );
        weatherState.current.humidity = this.getHumidity(nextWeatherType);
        weatherState.current.windSpeed = this.getWindSpeed(nextWeatherType);
        weatherState.current.windDirection = this.getWindDirection();
        weatherState.current.precipitation = this.getPrecipitation(nextWeatherType);
        weatherState.current.visibility = this.getVisibility(nextWeatherType);
        weatherState.current.lastUpdated = new Date().toISOString();
        weatherState.weatherDuration = this.randomRange(4, 12);
        weatherState.nextWeatherChange = this.getForecastTimestamp(weatherState.weatherDuration);
        this.checkRandomExtremeEvent(weatherState);
        this.stateManager.updateSection('weather', { ...weatherState });
        this.emitChange();
    }

    emitChange() {
        const state = this.stateManager.getSection('weather');
        this.listeners.forEach((callback) => callback(state));
    }

    pickWeighted(weights) {
        const entries = Object.entries(weights);
        const total = entries.reduce((sum, [, weight]) => sum + weight, 0);
        let roll = Math.random() * total;
        for (const [key, weight] of entries) {
            if (roll < weight) {
                return key;
            }
            roll -= weight;
        }
        return entries[0][0];
    }

    randomRange(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    getHumidity(type) {
        if (['lightRain', 'rain', 'heavyRain', 'thunderstorm', 'fog', 'snow', 'heavySnow'].includes(type)) {
            return this.randomRange(70, 95);
        }
        if (type === 'hot') {
            return this.randomRange(35, 60);
        }
        return this.randomRange(40, 70);
    }

    getWindSpeed(type) {
        if (['heavyRain', 'thunderstorm', 'wind'].includes(type)) {
            return this.randomRange(15, 35);
        }
        if (['heavySnow', 'snow'].includes(type)) {
            return this.randomRange(10, 25);
        }
        return this.randomRange(4, 18);
    }

    getWindDirection() {
        const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
        return directions[this.randomRange(0, directions.length - 1)];
    }

    getPrecipitation(type) {
        const precipitationMap = {
            lightRain: [20, 45],
            rain: [45, 70],
            heavyRain: [70, 95],
            thunderstorm: [80, 100],
            snow: [30, 60],
            heavySnow: [60, 90],
            hail: [50, 85]
        };
        const range = precipitationMap[type];
        if (!range) {
            return 0;
        }
        return this.randomRange(range[0], range[1]);
    }

    getVisibility(type) {
        const visibilityMap = {
            fog: [10, 30],
            heavyRain: [30, 50],
            thunderstorm: [20, 40],
            heavySnow: [20, 40],
            snow: [40, 70],
            rain: [50, 70],
            lightRain: [60, 80],
            hail: [40, 60]
        };
        const range = visibilityMap[type];
        if (!range) {
            return this.randomRange(80, 100);
        }
        return this.randomRange(range[0], range[1]);
    }

    getCurrentWorldHours() {
        const time = this.stateManager.getSection('time');
        if (!time) {
            return 0;
        }
        return ((time.year * 360) + (time.dayOfYear - 1)) * 24 + time.hour;
    }

    getForecastTimestamp(hoursAhead) {
        const time = this.stateManager.getSection('time');
        let futureYear = time.year;
        let futureDay = time.dayOfYear;
        let futureHour = time.hour + hoursAhead;
        if (futureHour >= 24) {
            const dayAdvance = Math.floor(futureHour / 24);
            futureHour %= 24;
            futureDay += dayAdvance;
            if (futureDay > 360) {
                const yearAdvance = Math.floor((futureDay - 1) / 360);
                futureYear += yearAdvance;
                futureDay = ((futureDay - 1) % 360) + 1;
            }
        }
        const tempTime = {
            year: futureYear,
            dayOfYear: futureDay,
            hour: futureHour,
            minute: 0,
            month: 1,
            dayOfMonth: 1,
            dayOfWeek: 1,
            season: 'spring',
            timeOfDay: 'morning',
            monthName: '',
            dayName: ''
        };
        this.timeSystem.updateComputedFields(tempTime);
        return `${tempTime.dayName}, ${ordinalSuffix(tempTime.dayOfMonth)} of ${tempTime.monthName}, ${tempTime.year} AV - ${padNumber(tempTime.hour)}:00`;
    }
}
