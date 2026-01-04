export class RumorSystem {
    constructor(stateManager, timeSystem, eventSystem, factionSystem) {
        this.stateManager = stateManager;
        this.timeSystem = timeSystem;
        this.eventSystem = eventSystem;
        this.factionSystem = factionSystem;
        this.NEWS_TYPES = {
            official: {
                name: 'Official News',
                icon: '📜',
                accuracy: 1.0,
                spreadSpeed: 'fast',
                channels: ['herald', 'notice_board', 'official'],
                expiresAfterDays: 30
            },
            major: {
                name: 'Major News',
                icon: '📰',
                accuracy: 0.9,
                spreadSpeed: 'medium',
                channels: ['tavern', 'market', 'herald', 'traveler'],
                expiresAfterDays: 60
            },
            local: {
                name: 'Local News',
                icon: '🗣️',
                accuracy: 0.95,
                spreadSpeed: 'slow',
                channels: ['tavern', 'market', 'neighbor'],
                expiresAfterDays: 14,
                localOnly: true
            },
            rumor: {
                name: 'Rumor',
                icon: '👂',
                accuracy: 0.6,
                spreadSpeed: 'fast',
                channels: ['tavern', 'gossip', 'traveler'],
                expiresAfterDays: 21,
                canMutate: true
            },
            gossip: {
                name: 'Gossip',
                icon: '💬',
                accuracy: 0.5,
                spreadSpeed: 'medium',
                channels: ['tavern', 'gossip', 'noble_court'],
                expiresAfterDays: 14,
                canMutate: true
            },
            secret: {
                name: 'Secret',
                icon: '🤫',
                accuracy: 0.8,
                spreadSpeed: 'very_slow',
                channels: ['spy', 'underground', 'whisper'],
                expiresAfterDays: 90,
                restricted: true
            },
            propaganda: {
                name: 'Propaganda',
                icon: '📢',
                accuracy: 0.3,
                spreadSpeed: 'fast',
                channels: ['herald', 'notice_board', 'official'],
                expiresAfterDays: 30,
                source_biased: true
            }
        };
        this.NEWS_TEMPLATES = {
            war_declared: {
                type: 'official',
                templates: [
                    'War has been declared between {{faction1}} and {{faction2}}!',
                    '{{faction1}} marches to war against {{faction2}}!',
                    'Tensions erupt into open warfare: {{faction1}} vs {{faction2}}'
                ],
                importance: 'critical',
                spreadRadius: 'global'
            },
            war_ended: {
                type: 'official',
                templates: [
                    'Peace declared! The war between {{faction1}} and {{faction2}} has ended.',
                    '{{winner}} emerges victorious in the war against {{loser}}.',
                    'Treaty signed: {{faction1}} and {{faction2}} cease hostilities.'
                ],
                importance: 'critical',
                spreadRadius: 'global'
            },
            battle: {
                type: 'major',
                templates: [
                    'Battle at {{location}}! {{winner}} defeats {{loser}}.',
                    'Fierce fighting reported near {{location}}.',
                    '{{faction1}} and {{faction2}} clash at {{location}} — casualties mounting.'
                ],
                importance: 'major',
                spreadRadius: 'regional'
            },
            leader_death: {
                type: 'official',
                templates: [
                    '{{leader}} of {{faction}} has died!',
                    'Mourning in {{faction}}: {{leader}} passes away.',
                    'The realm grieves: {{leader}} is dead.'
                ],
                importance: 'critical',
                spreadRadius: 'global'
            },
            succession: {
                type: 'official',
                templates: [
                    '{{newLeader}} ascends to power in {{faction}}.',
                    'New ruler: {{newLeader}} takes control of {{faction}}.',
                    '{{faction}} crowns {{newLeader}} as their new leader.'
                ],
                importance: 'major',
                spreadRadius: 'global'
            },
            coup: {
                type: 'major',
                templates: [
                    'Coup attempt in {{faction}}! {{outcome}}',
                    'Power struggle rocks {{faction}} — {{details}}',
                    'Treachery in {{faction}}: {{details}}'
                ],
                importance: 'major',
                spreadRadius: 'regional'
            },
            marriage: {
                type: 'major',
                templates: [
                    'Royal wedding! {{person1}} marries {{person2}}.',
                    'Alliance through marriage: {{person1}} weds {{person2}}.',
                    '{{faction1}} and {{faction2}} united by marriage.'
                ],
                importance: 'moderate',
                spreadRadius: 'regional'
            },
            trade_disruption: {
                type: 'major',
                templates: [
                    'Trade routes disrupted! Merchants warn of shortages.',
                    '{{route}} trade route blocked — prices rising.',
                    'Commerce halted: {{cause}} affecting trade.'
                ],
                importance: 'moderate',
                spreadRadius: 'regional'
            },
            resource_discovery: {
                type: 'major',
                templates: [
                    '{{resource}} discovered in {{location}}! Fortune seekers flock to the area.',
                    'Rich {{resource}} deposits found near {{location}}.',
                    '{{faction}} celebrates discovery of {{resource}}.'
                ],
                importance: 'moderate',
                spreadRadius: 'regional'
            },
            plague: {
                type: 'official',
                templates: [
                    'Plague outbreak in {{location}}! Travelers warned to avoid the area.',
                    'Sickness spreads through {{location}} — death toll rising.',
                    '{{location}} quarantined due to deadly plague.'
                ],
                importance: 'critical',
                spreadRadius: 'regional'
            },
            earthquake: {
                type: 'major',
                templates: [
                    'Earthquake strikes {{location}}! Buildings collapsed.',
                    'The ground shook in {{location}} — damage extensive.',
                    'Disaster in {{location}}: earthquake leaves devastation.'
                ],
                importance: 'major',
                spreadRadius: 'regional'
            },
            dungeon_break: {
                type: 'major',
                templates: [
                    'Monsters pour from {{dungeon}}! Adventurers needed!',
                    'Dungeon break at {{dungeon}} — nearby villages evacuating.',
                    '{{location}} under siege by creatures from {{dungeon}}!'
                ],
                importance: 'critical',
                spreadRadius: 'regional'
            },
            monster_sighting: {
                type: 'rumor',
                templates: [
                    'Strange creature spotted near {{location}}...',
                    'Travelers report seeing {{monster}} on the road to {{location}}.',
                    "Something's hunting in the forests near {{location}}..."
                ],
                importance: 'minor',
                spreadRadius: 'local'
            },
            magical_anomaly: {
                type: 'rumor',
                templates: [
                    'Strange lights seen over {{location}}...',
                    'Magic gone wild near {{location}} — mages investigating.',
                    'Unnatural phenomena reported at {{location}}.'
                ],
                importance: 'moderate',
                spreadRadius: 'local'
            },
            festival: {
                type: 'local',
                templates: [
                    'Grand festival in {{location}}! All welcome.',
                    '{{faction}} celebrates with festivities in {{location}}.',
                    'Merriment and feasting in {{location}} this week.'
                ],
                importance: 'minor',
                spreadRadius: 'local'
            },
            npc_death: {
                type: 'gossip',
                templates: [
                    'Did you hear? {{npc}} died!',
                    'Sad news about {{npc}} — passed away recently.',
                    '{{npc}} is dead. {{cause}}.'
                ],
                importance: 'minor',
                spreadRadius: 'local'
            },
            npc_marriage: {
                type: 'gossip',
                templates: [
                    '{{npc1}} and {{npc2}} got married!',
                    'Wedding bells for {{npc1}} and {{npc2}}.',
                    "Did you hear about {{npc1}} and {{npc2}}? They're married now!"
                ],
                importance: 'minor',
                spreadRadius: 'local'
            }
        };
        this.RUMOR_MUTATIONS = {
            exaggerate: {
                probability: 0.3,
                transforms: [
                    { from: 'some', to: 'many' },
                    { from: 'injured', to: 'killed' },
                    { from: 'damaged', to: 'destroyed' },
                    { from: 'a few', to: 'dozens of' },
                    { from: 'soldiers', to: 'an army' },
                    { from: 'creature', to: 'monster' },
                    { from: 'monster', to: 'demon' }
                ],
                numberMultiplier: { min: 1.5, max: 3 }
            },
            minimize: {
                probability: 0.1,
                transforms: [
                    { from: 'many', to: 'some' },
                    { from: 'destroyed', to: 'damaged' },
                    { from: 'army', to: 'soldiers' }
                ],
                numberMultiplier: { min: 0.3, max: 0.7 }
            },
            vague: {
                probability: 0.2,
                transforms: [
                    { pattern: /\b\d+\b/g, to: 'several' },
                    { pattern: /in [\w\s]+,/g, to: 'somewhere,' },
                    { pattern: /named \w+/g, to: 'whose name I forget' }
                ]
            },
            fabricate: {
                probability: 0.05,
                additions: [
                    'And they say {{randomNPC}} was involved somehow.',
                    'The {{randomFaction}} are behind it, mark my words.',
                    "There's treasure involved, or so I've heard."
                ]
            }
        };
        this.SPREAD_CHANNELS = {
            herald: {
                name: 'Town Crier/Herald',
                speed: 'very_fast',
                accuracy: 1.0,
                locations: ['city', 'town', 'capital'],
                newsTypes: ['official', 'major']
            },
            notice_board: {
                name: 'Notice Board',
                speed: 'fast',
                accuracy: 0.95,
                locations: ['city', 'town', 'village', 'guild'],
                newsTypes: ['official', 'major', 'local']
            },
            tavern: {
                name: 'Tavern Talk',
                speed: 'medium',
                accuracy: 0.7,
                locations: ['tavern', 'inn'],
                newsTypes: ['major', 'local', 'rumor', 'gossip'],
                mutationChance: 0.3
            },
            market: {
                name: 'Market Gossip',
                speed: 'medium',
                accuracy: 0.75,
                locations: ['market', 'shop', 'city'],
                newsTypes: ['local', 'rumor', 'gossip'],
                mutationChance: 0.2
            },
            traveler: {
                name: 'Traveling Merchants/Adventurers',
                speed: 'slow',
                accuracy: 0.6,
                locations: ['road', 'inn', 'city'],
                newsTypes: ['major', 'rumor'],
                mutationChance: 0.4
            },
            noble_court: {
                name: 'Noble Courts',
                speed: 'fast',
                accuracy: 0.85,
                locations: ['palace', 'castle', 'manor'],
                newsTypes: ['official', 'gossip', 'secret'],
                restricted: true
            },
            underground: {
                name: 'Criminal Underground',
                speed: 'medium',
                accuracy: 0.8,
                locations: ['thieves_guild', 'black_market', 'slum'],
                newsTypes: ['secret', 'rumor'],
                restricted: true
            },
            spy: {
                name: 'Spy Networks',
                speed: 'fast',
                accuracy: 0.9,
                locations: ['any'],
                newsTypes: ['secret'],
                restricted: true
            }
        };
        this.eventSystem.onEventStarted((event) => this.generateNewsFromEvent(event));
        this.eventSystem.onEventResolved((event) => this.generateNewsFromEvent(event, 'resolved'));
        this.timeSystem.onDayChanged(() => this.simulateSpread());
        this.timeSystem.onWeekChanged(() => this.expireOldNews());
    }

    getSettings() {
        return this.stateManager.getSection('rumors').settings;
    }

    generateNewsFromEvent(event, phase = 'started') {
        const settings = this.getSettings();
        if (!settings.enabled || !settings.autoGenerateFromEvents) {
            return null;
        }
        const templateKey = event.templateId || event.subtype;
        const template = this.NEWS_TEMPLATES[templateKey] || this.NEWS_TEMPLATES[this.getTemplateAlias(templateKey)];
        if (!template) {
            return null;
        }
        const context = { ...(event.context || {}), phase };
        const text = this.generateNewsText(template, context);
        const news = this.createNewsItem({
            originalText: text,
            type: template.type,
            category: event.templateId || event.subtype,
            importance: template.importance,
            sourceEvent: event.id,
            originLocation: context?.location || 'unknown',
            originFaction: context?.factionId,
            spreadRadius: template.spreadRadius,
            relatedEntities: this.extractEntities(context)
        });
        this.addNews(news);
        if (settings.showNewsNotifications && news.importance !== 'minor') {
            this.emitNotification(news);
        }
        return news;
    }

    generateNewsText(template, context) {
        const variants = template.templates;
        let text = variants[Math.floor(Math.random() * variants.length)];
        text = this.fillPlaceholders(text, context);
        return text;
    }

    fillPlaceholders(text, context) {
        let output = text;
        Object.entries(context || {}).forEach(([key, value]) => {
            const placeholder = new RegExp(`{{${key}}}`, 'g');
            output = output.replace(placeholder, this.formatValue(key, value));
        });
        return output;
    }

    formatValue(key, value) {
        if (key.includes('faction')) {
            const faction = this.factionSystem.getFaction(value);
            return faction?.shortName || faction?.name || value;
        }
        return value;
    }

    createNewsItem(data) {
        const newsType = this.NEWS_TYPES[data.type];
        const gameDate = this.timeSystem.getCurrentDateString();
        return {
            id: this.generateId('news'),
            originalText: data.originalText,
            currentText: data.originalText,
            type: data.type,
            category: data.category,
            importance: data.importance,
            sourceEvent: data.sourceEvent,
            originLocation: data.originLocation,
            originFaction: data.originFaction,
            spreadRadius: data.spreadRadius,
            spreadSpeed: newsType.spreadSpeed,
            currentSpread: [data.originLocation],
            originalAccuracy: newsType.accuracy,
            currentAccuracy: newsType.accuracy,
            mutationCount: 0,
            isFalse: false,
            createdAt: Date.now(),
            gameDate,
            expiresAt: this.calculateExpiration(newsType.expiresAfterDays),
            relatedEntities: data.relatedEntities || {},
            playerHasHeard: false,
            playerHeardAt: null,
            playerHeardFrom: null
        };
    }

    addNews(news) {
        const state = this.stateManager.getSection('rumors');
        state.news.push(news);
        state.stats.totalGenerated += 1;
        state.spread[news.id] = {
            [news.originLocation]: {
                arrived: Date.now(),
                channel: 'origin',
                mutated: false
            }
        };
        this.stateManager.updateSection('rumors', state);
        return news;
    }

    getNews(newsId) {
        return this.stateManager.getSection('rumors').news.find((item) => item.id === newsId);
    }

    getAllNews() {
        return this.stateManager.getSection('rumors').news;
    }

    getNewsAtLocation(locationId) {
        const state = this.stateManager.getSection('rumors');
        return this.getAllNews().filter((news) => state.spread[news.id]?.[locationId]);
    }

    getPlayerKnownNews() {
        return this.getAllNews().filter((news) => news.playerHasHeard);
    }

    simulateSpread() {
        const settings = this.getSettings();
        if (!settings.enabled || !settings.spreadSimulation) {
            return;
        }
        const state = this.stateManager.getSection('rumors');
        this.getAllNews().forEach((news) => this.spreadNewsItem(news, state));
        this.stateManager.updateSection('rumors', state);
    }

    spreadNewsItem(news, state) {
        const spreadData = state.spread[news.id];
        const currentLocations = Object.keys(spreadData);
        currentLocations.forEach((locationId) => {
            const neighbors = this.getNeighborLocations(locationId);
            neighbors.forEach((neighbor) => {
                if (spreadData[neighbor]) {
                    return;
                }
                const daysSinceOrigin = this.getDaysSince(news.createdAt);
                const daysToSpread = this.getSpreadDays(news.spreadSpeed);
                const distance = this.getLocationDistance(news.originLocation, neighbor);
                if (daysSinceOrigin >= daysToSpread * distance) {
                    this.spreadToLocation(news, neighbor, state);
                }
            });
        });
    }

    spreadToLocation(news, locationId, state) {
        const settings = this.getSettings();
        const channel = this.determineChannel(news.type);
        let mutated = false;
        if (settings.rumorMutation && this.NEWS_TYPES[news.type].canMutate) {
            if (Math.random() < (this.SPREAD_CHANNELS[channel]?.mutationChance || 0)) {
                this.mutateNews(news);
                mutated = true;
            }
        }
        state.spread[news.id][locationId] = {
            arrived: Date.now(),
            channel,
            mutated
        };
        news.currentSpread.push(locationId);
    }

    determineChannel(newsType) {
        const channels = this.NEWS_TYPES[newsType].channels;
        return channels[Math.floor(Math.random() * channels.length)];
    }

    getNeighborLocations(locationId) {
        const locationGraph = {
            valdris_prime: ['ironforge_district', 'merchant_quarter', 'noble_district'],
            aelindra: ['sylvan_woods', 'moonlight_grove'],
            khaz_morath: ['deep_mines', 'forge_district']
        };
        return locationGraph[locationId] || [];
    }

    getLocationDistance() {
        return 1;
    }

    getSpreadDays(speed) {
        const SPREAD_SPEEDS = {
            instant: 0,
            very_fast: 1,
            fast: 3,
            medium: 7,
            slow: 14,
            very_slow: 30
        };
        return SPREAD_SPEEDS[speed] || 7;
    }

    mutateNews(news) {
        const settings = this.getSettings();
        if (!settings.rumorMutation) {
            return;
        }
        const mutations = Object.entries(this.RUMOR_MUTATIONS);
        for (const [mutationType, mutation] of mutations) {
            if (Math.random() < mutation.probability) {
                this.applyMutation(news, mutationType, mutation);
                break;
            }
        }
    }

    applyMutation(news, mutationType, mutation) {
        let text = news.currentText;
        switch (mutationType) {
            case 'exaggerate':
            case 'minimize':
                mutation.transforms.forEach((transform) => {
                    text = text.replace(new RegExp(transform.from, 'gi'), transform.to);
                });
                if (mutation.numberMultiplier) {
                    text = text.replace(/\b(\d+)\b/g, (match, num) => {
                        const multiplier = mutation.numberMultiplier.min +
                            Math.random() * (mutation.numberMultiplier.max - mutation.numberMultiplier.min);
                        return Math.round(parseInt(num, 10) * multiplier).toString();
                    });
                }
                break;
            case 'vague':
                mutation.transforms.forEach((transform) => {
                    text = text.replace(transform.pattern, transform.to);
                });
                break;
            case 'fabricate': {
                const addition = mutation.additions[Math.floor(Math.random() * mutation.additions.length)];
                text += ` ${this.fillPlaceholders(addition, {
                    randomNPC: this.getRandomNPCName(),
                    randomFaction: this.getRandomFactionName()
                })}`;
                break;
            }
            default:
                break;
        }
        news.currentText = text;
        news.mutationCount += 1;
        news.currentAccuracy *= 0.9;
        const state = this.stateManager.getSection('rumors');
        state.stats.mutations += 1;
        this.stateManager.updateSection('rumors', state);
    }

    playerHearsNews(newsId, channel = 'tavern') {
        const news = this.getNews(newsId);
        if (!news) {
            return null;
        }
        news.playerHasHeard = true;
        news.playerHeardAt = this.timeSystem.getCurrentDateString();
        news.playerHeardFrom = channel;
        const state = this.stateManager.getSection('rumors');
        state.playerKnowledge.push(newsId);
        this.stateManager.updateSection('rumors', state);
        return news;
    }

    getNewsForPlayer(location = null, channel = 'tavern') {
        const locationNews = location ? this.getNewsAtLocation(location) : this.getAllNews();
        return locationNews.filter((news) => this.NEWS_TYPES[news.type].channels.includes(channel));
    }

    generateTavernRumors(count = 3) {
        const available = this.getNewsForPlayer(null, 'tavern').filter((news) => !news.playerHasHeard);
        available.sort((a, b) => b.createdAt - a.createdAt);
        const selected = available.slice(0, count);
        selected.forEach((news) => this.playerHearsNews(news.id, 'tavern'));
        return selected;
    }

    expireOldNews() {
        const state = this.stateManager.getSection('rumors');
        const now = Date.now();
        const expired = state.news.filter((news) => news.expiresAt && news.expiresAt < now);
        state.news = state.news.filter((news) => !news.expiresAt || news.expiresAt >= now);
        expired.forEach((news) => delete state.spread[news.id]);
        state.stats.totalExpired += expired.length;
        this.stateManager.updateSection('rumors', state);
        return expired.length;
    }

    calculateExpiration(days) {
        return Date.now() + (days * 24 * 60 * 60 * 1000);
    }

    getNewsForPrompt() {
        const settings = this.getSettings();
        if (!settings.injectNewsIntoPrompt) {
            return '';
        }
        const knownNews = this.getPlayerKnownNews()
            .filter((news) => news.importance !== 'minor')
            .slice(0, 5);
        if (!knownNews.length) {
            return 'No recent news';
        }
        return knownNews.map((news) => news.currentText).join('; ');
    }

    generateRumorDialogue() {
        const rumors = this.generateTavernRumors(1);
        if (!rumors.length) {
            return null;
        }
        const rumor = rumors[0];
        const intros = [
            'Did you hear?',
            'Word is that',
            'I heard from a traveler that',
            "They're saying",
            'Have you heard the news?',
            'Listen to this:'
        ];
        const intro = intros[Math.floor(Math.random() * intros.length)];
        return `${intro} ${rumor.currentText}`;
    }

    createRumor(text, type = 'rumor', origin = null) {
        return this.addNews(this.createNewsItem({
            originalText: text,
            type,
            category: 'custom',
            importance: 'minor',
            originLocation: origin || 'unknown',
            spreadRadius: 'local'
        }));
    }

    createFalseRumor(text, origin = null) {
        const news = this.createRumor(text, 'rumor', origin);
        news.isFalse = true;
        news.originalAccuracy = 0;
        news.currentAccuracy = 0;
        return news;
    }

    getDaysSince(timestamp) {
        return Math.floor((Date.now() - timestamp) / (24 * 60 * 60 * 1000));
    }

    getRandomNPCName() {
        const names = ['someone important', 'a mysterious figure', 'a noble'];
        return names[Math.floor(Math.random() * names.length)];
    }

    getRandomFactionName() {
        const factions = Object.values(this.factionSystem.getAllFactions());
        if (!factions.length) {
            return 'unknown forces';
        }
        return factions[Math.floor(Math.random() * factions.length)].shortName;
    }

    getTemplateAlias(key) {
        const aliases = {
            famous_death: 'npc_death',
            war_declared: 'war_declared',
            war_ended: 'war_ended',
            battle: 'battle'
        };
        return aliases[key];
    }

    extractEntities(context) {
        return {
            factions: [context?.factionId, context?.faction1Id, context?.faction2Id].filter(Boolean),
            npcs: [context?.npc, context?.leader, context?.person1, context?.person2].filter(Boolean),
            locations: [context?.location, context?.city, context?.region].filter(Boolean)
        };
    }

    emitNotification(news) {
        const event = new CustomEvent('vws-news', { detail: news });
        window.dispatchEvent(event);
    }

    generateId(prefix) {
        return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
    }
}
