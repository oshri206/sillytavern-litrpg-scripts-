import { clamp } from './utils.js';

const NPC_TEMPLATE = {
    id: 'uuid',
    name: 'Unknown',
    title: 'Unknown',
    race: 'human',
    age: 30,
    gender: 'unknown',
    faction: null,
    factionRank: 'citizen',
    organization: null,
    currentLocation: 'unknown',
    homeLocation: 'unknown',
    workplace: null,
    isAlive: true,
    health: 100,
    wealth: 50,
    influence: 50,
    happiness: 50,
    personality: {
        ambition: 50,
        loyalty: 50,
        aggression: 50,
        greed: 50,
        honor: 50,
        caution: 50
    },
    relationships: {},
    playerRelationship: {
        disposition: 0,
        interactions: 0,
        lastInteraction: null,
        notes: []
    },
    goals: [],
    schedule: {
        default: {
            '06:00': { location: 'home', activity: 'sleeping' },
            '07:00': { location: 'home', activity: 'breakfast' },
            '08:00': { location: 'workplace', activity: 'working' },
            '12:00': { location: 'tavern', activity: 'lunch' },
            '13:00': { location: 'workplace', activity: 'working' },
            '18:00': { location: 'tavern', activity: 'socializing' },
            '21:00': { location: 'home', activity: 'relaxing' },
            '23:00': { location: 'home', activity: 'sleeping' }
        }
    },
    currentActivity: 'working',
    currentMood: 'content',
    history: [],
    isImportant: false,
    isPlayer: false,
    lastSimulated: null,
    traits: []
};

export const DEFAULT_AUTONOMOUS_NPCS = {
    aldric_valdren: {
        name: 'High King Aldric Valdren IV',
        title: 'High King of the Valdric Empire',
        race: 'human',
        age: 52,
        gender: 'male',
        faction: 'valdric_empire',
        factionRank: 'leader',
        currentLocation: 'valdris_prime_palace',
        homeLocation: 'valdris_prime_palace',
        health: 75,
        wealth: 100,
        influence: 100,
        personality: {
            ambition: 70,
            loyalty: 60,
            aggression: 40,
            greed: 30,
            honor: 65,
            caution: 70
        },
        goals: [
            { type: 'expand_territory', priority: 'high' },
            { type: 'secure_succession', priority: 'high' },
            { type: 'defeat_enemy', target: 'orcish_dominion', priority: 'medium' }
        ],
        traits: ['diplomatic', 'cunning', 'aging'],
        isImportant: true
    },
    selenara_moonweave: {
        name: 'Queen Selenara Moonweave',
        title: 'Eternal Queen of the Sylvan Dominion',
        race: 'elf',
        age: 847,
        gender: 'female',
        faction: 'sylvan_dominion',
        factionRank: 'leader',
        currentLocation: 'aelindra_palace',
        homeLocation: 'aelindra_palace',
        health: 95,
        wealth: 90,
        influence: 95,
        personality: {
            ambition: 30,
            loyalty: 85,
            aggression: 20,
            greed: 10,
            honor: 90,
            caution: 80
        },
        goals: [
            { type: 'protect_forests', priority: 'high' },
            { type: 'maintain_isolation', priority: 'medium' },
            { type: 'preserve_magic', priority: 'high' }
        ],
        traits: ['ancient_wisdom', 'patient', 'nature_bond'],
        isImportant: true
    },
    borin_ironforge: {
        name: 'High Thane Borin Ironforge',
        title: 'High Thane of the Dwarven Holds',
        race: 'dwarf',
        age: 203,
        gender: 'male',
        faction: 'dwarven_holds',
        factionRank: 'leader',
        currentLocation: 'khaz_morath_throne',
        homeLocation: 'khaz_morath_throne',
        health: 80,
        wealth: 95,
        influence: 90,
        personality: {
            ambition: 50,
            loyalty: 95,
            aggression: 45,
            greed: 60,
            honor: 85,
            caution: 55
        },
        goals: [
            { type: 'expand_mines', priority: 'high' },
            { type: 'defeat_enemy', target: 'orcish_dominion', priority: 'medium' },
            { type: 'trade_alliance', target: 'merchant_republic', priority: 'medium' }
        ],
        traits: ['master_craftsman', 'stubborn', 'honorable'],
        isImportant: true
    },
    thrakan_bloodfist: {
        name: 'Warchief Thrakan Bloodfist',
        title: 'Warchief of the Orcish Dominion',
        race: 'orc',
        age: 45,
        gender: 'male',
        faction: 'orcish_dominion',
        factionRank: 'leader',
        currentLocation: 'grakhan_war_tent',
        homeLocation: 'grakhan_war_tent',
        health: 95,
        wealth: 50,
        influence: 85,
        personality: {
            ambition: 90,
            loyalty: 70,
            aggression: 85,
            greed: 40,
            honor: 60,
            caution: 25
        },
        goals: [
            { type: 'prove_strength', priority: 'high' },
            { type: 'unite_clans', priority: 'high' },
            { type: 'raid', target: 'valdric_empire', priority: 'medium' }
        ],
        traits: ['fearsome_warrior', 'proud', 'tactical'],
        isImportant: true
    },
    helena_stormblade: {
        name: 'Helena Stormblade',
        title: "Guildmaster of the Adventurer's Guild",
        race: 'human',
        age: 38,
        gender: 'female',
        faction: 'adventurers_guild',
        factionRank: 'leader',
        currentLocation: 'adventurers_guild_hq',
        homeLocation: 'valdris_prime',
        health: 90,
        wealth: 70,
        influence: 75,
        personality: {
            ambition: 60,
            loyalty: 75,
            aggression: 55,
            greed: 35,
            honor: 80,
            caution: 40
        },
        goals: [
            { type: 'expand_guild', priority: 'high' },
            { type: 'reputation', priority: 'medium' },
            { type: 'wealth', target: 85, priority: 'low' }
        ],
        traits: ['veteran_adventurer', 'charismatic', 'fair'],
        isImportant: true
    },
    archmage_vexaria: {
        name: 'Archmage Vexaria',
        title: 'Archmage of the College of Arcana',
        race: 'half-elf',
        age: 312,
        gender: 'female',
        faction: 'mages_college',
        factionRank: 'leader',
        currentLocation: 'spire_of_arcana',
        homeLocation: 'spire_of_arcana',
        health: 70,
        wealth: 80,
        influence: 85,
        personality: {
            ambition: 75,
            loyalty: 50,
            aggression: 30,
            greed: 45,
            honor: 55,
            caution: 85
        },
        goals: [
            { type: 'magical_research', priority: 'high' },
            { type: 'political_influence', priority: 'medium' },
            { type: 'acquire_artifact', priority: 'medium' }
        ],
        traits: ['brilliant', 'secretive', 'calculating'],
        isImportant: true
    },
    the_veiled_one: {
        name: 'The Veiled One',
        title: 'Master of the Shadow Syndicate',
        race: 'unknown',
        age: null,
        gender: 'unknown',
        faction: 'shadow_syndicate',
        factionRank: 'leader',
        currentLocation: 'unknown',
        homeLocation: 'unknown',
        health: null,
        wealth: 90,
        influence: 70,
        personality: {
            ambition: 95,
            loyalty: 20,
            aggression: 60,
            greed: 80,
            honor: 10,
            caution: 95
        },
        goals: [
            { type: 'control_underworld', priority: 'high' },
            { type: 'wealth', target: 100, priority: 'high' },
            { type: 'revenge', target: 'unknown', priority: 'medium' }
        ],
        traits: ['mysterious', 'ruthless', 'genius'],
        isImportant: true
    },
    prince_aldric_valdren: {
        name: 'Prince Aldric Valdren V',
        title: 'Crown Prince of the Valdric Empire',
        race: 'human',
        age: 24,
        gender: 'male',
        faction: 'valdric_empire',
        factionRank: 'officer',
        currentLocation: 'valdris_prime_palace',
        homeLocation: 'valdris_prime_palace',
        health: 100,
        wealth: 90,
        influence: 70,
        personality: {
            ambition: 80,
            loyalty: 55,
            aggression: 50,
            greed: 45,
            honor: 50,
            caution: 35
        },
        relationships: {
            aldric_valdren: { type: 'family', subtype: 'father', strength: 60 }
        },
        goals: [
            { type: 'become_king', priority: 'high' },
            { type: 'prove_worth', priority: 'high' },
            { type: 'military_glory', priority: 'medium' }
        ],
        traits: ['ambitious', 'impatient', 'skilled_swordsman'],
        isImportant: true
    },
    lady_seraphina: {
        name: 'Lady Seraphina Duskwood',
        title: 'Spymaster of the Valdric Empire',
        race: 'human',
        age: 34,
        gender: 'female',
        faction: 'valdric_empire',
        factionRank: 'officer',
        currentLocation: 'valdris_prime',
        homeLocation: 'valdris_prime',
        health: 85,
        wealth: 75,
        influence: 80,
        personality: {
            ambition: 85,
            loyalty: 65,
            aggression: 45,
            greed: 55,
            honor: 30,
            caution: 90
        },
        goals: [
            { type: 'gather_secrets', priority: 'high' },
            { type: 'political_influence', priority: 'high' },
            { type: 'protect_empire', priority: 'medium' }
        ],
        traits: ['cunning', 'beautiful', 'dangerous'],
        isImportant: true
    }
};

export class NPCAutonomySystem {
    constructor(stateManager, timeSystem, factionSystem, eventSystem) {
        this.stateManager = stateManager;
        this.timeSystem = timeSystem;
        this.factionSystem = factionSystem;
        this.eventSystem = eventSystem;
        this.listeners = [];
        this.timeSystem.onHourChanged(() => this.updateNPCLocations());
        this.timeSystem.onDayChanged(() => this.simulateDailyActions());
        this.timeSystem.onWeekChanged(() => this.simulateWeeklyActions());
        this.timeSystem.onMonthChanged(() => this.simulateLifeEvents());
        this.eventSystem.onEventStarted((event) => this.npcReactToEvent(event));
    }

    initialize() {
        const state = this.stateManager.getSection('npcAutonomy');
        if (!Object.keys(state.npcs || {}).length) {
            this.stateManager.updateSection('npcAutonomy', {
                ...state,
                npcs: this.buildDefaultNPCs()
            });
        }
    }

    buildDefaultNPCs() {
        const mapped = {};
        Object.entries(DEFAULT_AUTONOMOUS_NPCS).forEach(([id, npc]) => {
            mapped[id] = { ...NPC_TEMPLATE, ...npc, id };
        });
        return mapped;
    }

    getNPC(npcId) {
        const state = this.stateManager.getSection('npcAutonomy');
        return state.npcs[npcId];
    }

    getAllNPCs() {
        const state = this.stateManager.getSection('npcAutonomy');
        return Object.values(state.npcs);
    }

    getImportantNPCs() {
        return this.getAllNPCs().filter((npc) => npc.isImportant);
    }

    getNPCsByFaction(factionId) {
        return this.getAllNPCs().filter((npc) => npc.faction === factionId);
    }

    getNPCsByLocation(locationId) {
        return this.getAllNPCs().filter((npc) => npc.currentLocation === locationId);
    }

    addNPC(npcData) {
        const state = this.stateManager.getSection('npcAutonomy');
        const id = npcData.id || this.generateId('npc');
        state.npcs[id] = { ...NPC_TEMPLATE, ...npcData, id };
        this.stateManager.updateSection('npcAutonomy', state);
        return state.npcs[id];
    }

    updateNPC(npcId, updates) {
        const state = this.stateManager.getSection('npcAutonomy');
        if (!state.npcs[npcId]) {
            return null;
        }
        state.npcs[npcId] = { ...state.npcs[npcId], ...updates };
        this.stateManager.updateSection('npcAutonomy', state);
        return state.npcs[npcId];
    }

    updateNPCLocations() {
        const settings = this.getSettings();
        if (!settings.enabled) {
            return;
        }
        const currentTime = this.timeSystem.getCurrentTime();
        const currentDay = this.timeSystem.getCurrentDayName();
        const npcs = settings.importantNPCsOnly ? this.getImportantNPCs() : this.getAllNPCs();
        npcs.forEach((npc) => {
            if (!npc.isAlive) {
                return;
            }
            const schedule = this.getNPCSchedule(npc, currentDay);
            const activity = this.getScheduledActivity(schedule, currentTime);
            if (activity) {
                this.updateNPC(npc.id, {
                    currentLocation: this.resolveLocation(npc, activity.location),
                    currentActivity: activity.activity
                });
            }
        });
    }

    getNPCSchedule(npc, day) {
        const schedule = npc.schedule || {};
        if (schedule[day.toLowerCase()]) {
            return { ...schedule.default, ...schedule[day.toLowerCase()] };
        }
        return schedule.default || {};
    }

    getScheduledActivity(schedule, time) {
        const timeHour = parseInt(time.split(':')[0], 10);
        let currentActivity = null;
        Object.entries(schedule).forEach(([scheduleTime, activity]) => {
            const scheduleHour = parseInt(scheduleTime.split(':')[0], 10);
            if (scheduleHour <= timeHour) {
                currentActivity = activity;
            }
        });
        return currentActivity;
    }

    resolveLocation(npc, locationKey) {
        switch (locationKey) {
            case 'home':
                return npc.homeLocation;
            case 'workplace':
                return npc.workplace || npc.homeLocation;
            default:
                return locationKey;
        }
    }

    simulateDailyActions() {
        const settings = this.getSettings();
        if (!settings.enabled || !settings.simulateOnTimeChange) {
            return;
        }
        const npcs = settings.importantNPCsOnly ? this.getImportantNPCs() : this.getAllNPCs();
        npcs.forEach((npc) => {
            if (!npc.isAlive) {
                return;
            }
            this.simulateNPCDay(npc);
        });
        this.updateSimulationTimestamp();
    }

    simulateNPCDay(npc) {
        let wealthChange = 0;
        let happinessChange = 0;
        let healthChange = 0;

        if (npc.workplace) {
            wealthChange += 1;
        }
        if (npc.personality.ambition > 70 && npc.influence < 50) {
            happinessChange -= 1;
        }
        if (Math.random() < 0.1) {
            const event = this.generateMinorEvent();
            wealthChange += event.wealthChange || 0;
            happinessChange += event.happinessChange || 0;
            healthChange += event.healthChange || 0;
            this.logNPCEvent(npc.id, 'daily_event', event);
        }

        this.updateNPC(npc.id, {
            wealth: clamp(npc.wealth + wealthChange, 0, 100),
            happiness: clamp(npc.happiness + happinessChange, 0, 100),
            health: clamp(npc.health + healthChange, 0, 100),
            lastSimulated: Date.now()
        });
    }

    generateMinorEvent() {
        const events = [
            { name: 'Good business day', wealthChange: 2, happinessChange: 1 },
            { name: 'Bad business day', wealthChange: -2, happinessChange: -1 },
            { name: 'Pleasant encounter', happinessChange: 2 },
            { name: 'Annoying encounter', happinessChange: -1 },
            { name: 'Minor illness', healthChange: -5, happinessChange: -2 },
            { name: 'Restful day', healthChange: 3, happinessChange: 1 }
        ];
        return events[Math.floor(Math.random() * events.length)];
    }

    simulateWeeklyActions() {
        const settings = this.getSettings();
        if (!settings.enabled) {
            return;
        }
        const npcs = this.getImportantNPCs();
        npcs.forEach((npc) => {
            if (!npc.isAlive) {
                return;
            }
            this.simulateNPCGoalProgress(npc);
            this.simulateNPCRelationships(npc);
        });
    }

    simulateNPCGoalProgress(npc) {
        if (!npc.goals) {
            return;
        }
        npc.goals.forEach((goal) => {
            const progress = this.calculateGoalProgress(npc, goal);
            goal.progress = (goal.progress || 0) + progress;
            if (goal.progress >= 100) {
                this.handleGoalAchieved(npc, goal);
            }
        });
        this.updateNPC(npc.id, { goals: npc.goals });
    }

    calculateGoalProgress(npc, goal) {
        let baseProgress = 5;
        if (goal.type === 'wealth' && npc.personality.greed > 50) {
            baseProgress += 2;
        }
        if (goal.type === 'power' && npc.personality.ambition > 50) {
            baseProgress += 2;
        }
        if (npc.influence > 70) baseProgress += 1;
        if (npc.wealth > 70) baseProgress += 1;
        baseProgress += Math.floor(Math.random() * 5) - 2;
        return Math.max(0, baseProgress);
    }

    handleGoalAchieved(npc, goal) {
        this.logNPCEvent(npc.id, 'goal_achieved', goal);
        const goals = npc.goals.filter((entry) => entry !== goal);
        if (Math.random() < 0.5) {
            const newGoal = this.generateNewGoal(npc);
            if (newGoal) {
                goals.push(newGoal);
            }
        }
        this.updateNPC(npc.id, { goals });
        if (npc.isImportant) {
            this.emitEvent('npc_goal_achieved', { npc, goal });
        }
    }

    generateNewGoal(npc) {
        const possibleGoals = [];
        if (npc.personality.greed > 50) {
            possibleGoals.push({ type: 'wealth', target: npc.wealth + 20, priority: 'medium' });
        }
        if (npc.personality.ambition > 50) {
            possibleGoals.push({ type: 'power', priority: 'high' });
        }
        if (npc.personality.aggression > 60) {
            possibleGoals.push({ type: 'revenge', priority: 'medium' });
        }
        if (!possibleGoals.length) {
            return null;
        }
        return possibleGoals[Math.floor(Math.random() * possibleGoals.length)];
    }

    simulateNPCRelationships(npc) {
        const otherNPCs = this.getAllNPCs().filter((other) => other.id !== npc.id && other.isAlive);
        otherNPCs.forEach((other) => {
            const existingRel = this.getRelationship(npc.id, other.id);
            const sameLocation = npc.currentLocation === other.currentLocation;
            const sameFaction = npc.faction === other.faction;
            if (existingRel || sameLocation || sameFaction) {
                this.updateRelationship(npc.id, other.id, { sameLocation, sameFaction });
            }
        });
    }

    simulateLifeEvents() {
        const settings = this.getSettings();
        if (!settings.enabled || !settings.enableLifeEvents) {
            return;
        }
        const npcs = this.getAllNPCs();
        npcs.forEach((npc) => {
            if (!npc.isAlive) {
                return;
            }
            this.checkForMarriage(npc);
            this.checkForChildren(npc);
            this.checkForDeath(npc);
            this.checkForPromotion(npc);
            this.checkForIllness(npc);
        });
    }

    checkForMarriage(npc) {
        if (npc.relationships?.spouse) {
            return;
        }
        if (npc.age !== null && npc.age < 16) {
            return;
        }
        if (Math.random() > 0.02) {
            return;
        }
        const eligiblePartners = this.getAllNPCs().filter((candidate) =>
            candidate.id !== npc.id &&
            candidate.isAlive &&
            !candidate.relationships?.spouse &&
            (candidate.age === null || candidate.age >= 16) &&
            (candidate.faction === npc.faction || Math.random() < 0.3)
        );
        if (!eligiblePartners.length) {
            return;
        }
        const partner = eligiblePartners[Math.floor(Math.random() * eligiblePartners.length)];
        this.setRelationship(npc.id, partner.id, { type: 'spouse', strength: 80 });
        npc.relationships = { ...npc.relationships, spouse: partner.id };
        partner.relationships = { ...partner.relationships, spouse: npc.id };
        this.updateNPC(npc.id, { relationships: npc.relationships, happiness: clamp(npc.happiness + 15, 0, 100) });
        this.updateNPC(partner.id, { relationships: partner.relationships, happiness: clamp(partner.happiness + 15, 0, 100) });
        this.logNPCEvent(npc.id, 'married', { partner: partner.id });
        this.logNPCEvent(partner.id, 'married', { partner: npc.id });
        if (npc.isImportant || partner.isImportant) {
            this.emitEvent('npc_married', { npc1: npc, npc2: partner });
        }
    }

    checkForChildren(npc) {
        const settings = this.getSettings();
        if (!settings.enableNPCBirths) {
            return;
        }
        const spouse = this.getSpouse(npc);
        if (!spouse) {
            return;
        }
        if (npc.age !== null && (npc.age < 18 || npc.age > 50)) {
            return;
        }
        if (Math.random() > 0.03) {
            return;
        }
        const child = this.createChildNPC(npc, spouse);
        this.addNPC(child);
        this.logNPCEvent(npc.id, 'had_child', { child: child.id });
        this.logNPCEvent(spouse.id, 'had_child', { child: child.id });
        if (npc.isImportant) {
            this.emitEvent('npc_had_child', { parent1: npc, parent2: spouse, child });
        }
    }

    createChildNPC(parent1, parent2) {
        return {
            name: this.generateChildName(parent1),
            race: parent1.race,
            age: 0,
            faction: parent1.faction,
            factionRank: 'citizen',
            currentLocation: parent1.currentLocation,
            homeLocation: parent1.homeLocation,
            health: 100,
            wealth: Math.floor((parent1.wealth + parent2.wealth) / 4),
            influence: 0,
            happiness: 80,
            personality: this.inheritPersonality(parent1, parent2),
            relationships: {
                [parent1.id]: { type: 'family', subtype: 'parent', strength: 90 },
                [parent2.id]: { type: 'family', subtype: 'parent', strength: 90 }
            },
            goals: [],
            isImportant: parent1.isImportant || parent2.isImportant,
            traits: []
        };
    }

    generateChildName(parent1) {
        const firstNames = ['Aldric', 'Elena', 'Marcus', 'Sera', 'Theron', 'Lyra', 'Kael', 'Iris'];
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = parent1.name.split(' ').pop();
        return `${firstName} ${lastName}`;
    }

    inheritPersonality(parent1, parent2) {
        const personality = {};
        Object.keys(parent1.personality).forEach((trait) => {
            const avg = (parent1.personality[trait] + parent2.personality[trait]) / 2;
            const variation = (Math.random() * 20) - 10;
            personality[trait] = clamp(Math.floor(avg + variation), 0, 100);
        });
        return personality;
    }

    checkForDeath(npc) {
        const settings = this.getSettings();
        if (!settings.enableNPCDeaths) {
            return;
        }
        let deathProbability = 0;
        if (npc.race === 'human') {
            if (npc.age > 60) deathProbability = 0.005 * (npc.age - 60);
            if (npc.age > 80) deathProbability = 0.02 * (npc.age - 80);
        } else if (npc.race === 'elf') {
            if (npc.age > 800) deathProbability = 0.001 * (npc.age - 800);
        } else if (npc.race === 'dwarf') {
            if (npc.age > 250) deathProbability = 0.003 * (npc.age - 250);
        } else if (npc.race === 'orc') {
            if (npc.age > 40) deathProbability = 0.01 * (npc.age - 40);
        }
        if (npc.health < 30) deathProbability *= 3;
        if (npc.health < 10) deathProbability *= 5;
        if (Math.random() > deathProbability) {
            return;
        }
        this.handleNPCDeath(npc, 'natural_causes');
    }

    handleNPCDeath(npc, cause) {
        this.updateNPC(npc.id, { isAlive: false });
        this.logNPCEvent(npc.id, 'died', { cause });
        if (npc.factionRank === 'leader') {
            this.handleLeaderDeath(npc);
        }
        if (npc.isImportant) {
            this.emitEvent('important_npc_died', { npc, cause });
            this.eventSystem.triggerEvent('famous_death', {
                npc: npc.name,
                faction: npc.faction,
                cause
            });
        }
    }

    handleLeaderDeath(npc) {
        const successors = this.getAllNPCs().filter((candidate) =>
            candidate.faction === npc.faction &&
            candidate.isAlive &&
            candidate.id !== npc.id &&
            candidate.factionRank === 'officer'
        );
        if (successors.length) {
            successors.sort((a, b) => b.influence - a.influence);
            const newLeader = successors[0];
            this.updateNPC(newLeader.id, { factionRank: 'leader' });
            this.logNPCEvent(newLeader.id, 'became_leader', { faction: npc.faction });
        } else {
            this.eventSystem.triggerEvent('succession_crisis', {
                faction: npc.faction,
                leader: npc.name
            });
        }
    }

    checkForPromotion(npc) {
        if (npc.factionRank === 'leader') {
            return;
        }
        let modifiedProb = 0.01;
        if (npc.personality.ambition > 70) modifiedProb *= 2;
        if (npc.influence > 60) modifiedProb *= 1.5;
        if (Math.random() > modifiedProb) {
            return;
        }
        const newRank = npc.factionRank === 'citizen' ? 'member' : 'officer';
        this.updateNPC(npc.id, {
            factionRank: newRank,
            influence: clamp(npc.influence + 10, 0, 100),
            happiness: clamp(npc.happiness + 10, 0, 100)
        });
        this.logNPCEvent(npc.id, 'promoted', { newRank });
        if (npc.isImportant) {
            this.emitEvent('npc_promoted', { npc, newRank });
        }
    }

    checkForIllness(npc) {
        if (Math.random() > 0.01) {
            return;
        }
        const severity = Math.floor(Math.random() * 30) + 10;
        this.updateNPC(npc.id, {
            health: clamp(npc.health - severity, 0, 100),
            happiness: clamp(npc.happiness - 10, 0, 100)
        });
        this.logNPCEvent(npc.id, 'illness', { severity });
        if (npc.health <= 0) {
            this.handleNPCDeath(npc, 'illness');
        }
    }

    npcReactToEvent(event) {
        const relevantNPCs = this.getRelevantNPCsForEvent(event);
        relevantNPCs.forEach((npc) => {
            const reaction = this.determineReaction(npc, event);
            if (reaction) {
                this.applyReaction(npc, event, reaction);
            }
        });
    }

    getRelevantNPCsForEvent(event) {
        const npcs = this.getAllNPCs().filter((npc) => npc.isAlive);
        return npcs.filter((npc) => {
            if (event.context?.factionId && event.context.factionId === npc.faction) return true;
            if (event.context?.location && event.context.location === npc.currentLocation) return true;
            if (event.context?.factionId) {
                const rel = this.factionSystem.getRelationship(npc.faction, event.context.factionId);
                if (rel < -30 || rel > 30) return true;
            }
            return false;
        });
    }

    determineReaction(npc, event) {
        const reactions = [];
        if (event.type === 'military' && event.severity === 'critical') {
            if (npc.personality.caution > 70) {
                reactions.push({ type: 'flee', priority: 80 });
            }
            if (npc.personality.aggression > 60) {
                reactions.push({ type: 'fight', priority: 70 });
            }
        }
        if (event.type === 'economic' && npc.personality.greed > 60) {
            reactions.push({ type: 'exploit', priority: 60 });
        }
        if (event.type === 'political' && npc.personality.ambition > 70) {
            reactions.push({ type: 'scheme', priority: 70 });
        }
        if (!reactions.length) {
            return null;
        }
        reactions.sort((a, b) => b.priority - a.priority);
        return reactions[0];
    }

    applyReaction(npc, event, reaction) {
        this.logNPCEvent(npc.id, 'reacted_to_event', { event: event.id, reaction: reaction.type });
        switch (reaction.type) {
            case 'flee':
                this.updateNPC(npc.id, { currentLocation: npc.homeLocation });
                break;
            case 'exploit':
                this.updateNPC(npc.id, { wealth: clamp(npc.wealth + 5, 0, 100) });
                break;
            case 'scheme':
                this.updateNPC(npc.id, { influence: clamp(npc.influence + 2, 0, 100) });
                break;
            default:
                break;
        }
    }

    getRelationship(npc1Id, npc2Id) {
        const state = this.stateManager.getSection('npcAutonomy');
        const key1 = `${npc1Id}_${npc2Id}`;
        const key2 = `${npc2Id}_${npc1Id}`;
        return state.relationships[key1] || state.relationships[key2];
    }

    setRelationship(npc1Id, npc2Id, relationshipData) {
        const state = this.stateManager.getSection('npcAutonomy');
        const key = `${npc1Id}_${npc2Id}`;
        state.relationships[key] = { ...relationshipData, established: Date.now() };
        this.stateManager.updateSection('npcAutonomy', state);
    }

    updateRelationship(npc1Id, npc2Id, context) {
        let rel = this.getRelationship(npc1Id, npc2Id);
        if (!rel) {
            if (context.sameLocation && Math.random() < 0.1) {
                rel = { type: 'acquaintance', strength: 10 };
                this.setRelationship(npc1Id, npc2Id, rel);
            }
            return;
        }
        if (context.sameLocation) {
            rel.strength = clamp(rel.strength + 1, 0, 100);
        }
        if (context.sameFaction) {
            rel.strength = clamp(rel.strength + 0.5, 0, 100);
        }
        this.setRelationship(npc1Id, npc2Id, rel);
    }

    getSpouse(npc) {
        if (npc.relationships?.spouse) {
            return this.getNPC(npc.relationships.spouse);
        }
        return null;
    }

    getNPCsForPrompt() {
        const settings = this.getSettings();
        if (!settings.injectNPCsIntoPrompt) return '';
        const npcs = this.getImportantNPCs()
            .filter((npc) => npc.isAlive)
            .slice(0, settings.maxNPCsInPrompt);
        if (!npcs.length) {
            return 'No notable NPCs nearby';
        }
        return npcs
            .map((npc) => `${npc.name} (${npc.title}) - ${npc.currentActivity} at ${npc.currentLocation}`)
            .join('; ');
    }

    getNearbyNPCs(locationId) {
        return this.getNPCsByLocation(locationId).filter((npc) => npc.isAlive);
    }

    logNPCEvent(npcId, eventType, details) {
        const npc = this.getNPC(npcId);
        if (!npc) {
            return;
        }
        const event = {
            date: this.timeSystem.getCurrentDateString(),
            type: eventType,
            details
        };
        npc.history = npc.history || [];
        npc.history.push(event);
        if (npc.history.length > 50) {
            npc.history = npc.history.slice(-50);
        }
        this.updateNPC(npcId, { history: npc.history });

        const state = this.stateManager.getSection('npcAutonomy');
        state.simulationHistory = state.simulationHistory || [];
        state.simulationHistory.push({ npcId, npcName: npc.name, ...event });
        if (state.simulationHistory.length > 100) {
            state.simulationHistory = state.simulationHistory.slice(-100);
        }
        this.stateManager.updateSection('npcAutonomy', state);
    }

    getSettings() {
        return this.stateManager.getSection('npcAutonomy').settings;
    }

    updateSimulationTimestamp() {
        const state = this.stateManager.getSection('npcAutonomy');
        state.lastSimulation = Date.now();
        this.stateManager.updateSection('npcAutonomy', state);
    }

    emitEvent(eventType, data) {
        this.listeners.forEach((callback) => callback(eventType, data));
    }

    onNPCEvent(callback) {
        this.listeners.push(callback);
    }

    generateId(prefix) {
        return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
    }
}
