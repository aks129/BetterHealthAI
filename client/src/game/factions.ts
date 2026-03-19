import { Faction } from './types';

export const FACTIONS: Faction[] = [
  {
    id: 'collective',
    name: 'Stellar Collective',
    fullName: 'The Stellar Collective of United Workers',
    leader: 'Chairman Vasily Morozov',
    leaderTitle: 'Chairman of the Collective',
    ideology: 'Collectivism & Social Unity',
    color: '#E53E3E',
    bgColor: '#1A0A0A',
    textColor: '#FEB2B2',
    portrait: 'linear-gradient(135deg, #8B0000 0%, #DC143C 25%, #FF4500 50%, #8B0000 75%, #4A0000 100%)',
    bonuses: ['+25% base population growth', '+1 morale in all bases', 'Free Recreation Commons in new bases'],
    penalties: ['-10% research output', 'Cannot use Free Market economics'],
    agenda: 'Establish a workers paradise on Planet',
    personality: { aggression: 4, diplomacy: 7, research: 4, expansion: 8, xenophilia: 3 },
    backstory: 'Born in the industrial heartlands of Eurasia, Vasily Morozov rose from factory foreman to political visionary. He saw the Unity mission as humanity\'s chance to build a truly equitable society, free from the exploitation that had scarred Earth. His followers are fiercely loyal, bound by shared purpose and collective will. On Planet, he dreams of cities where no citizen goes hungry and every voice carries equal weight in the council chambers.',
    quotes: [
      '"The individual is but a single neuron. It is only through connection that consciousness emerges." — Chairman Morozov, "Reflections on Unity"',
      '"We did not cross the void between stars to recreate the failures of Earth. Here, we build something worthy of the sacrifice." — Chairman Morozov, Address at Planetfall',
      '"Let them call us dreamers. Every great civilization began as someone\'s impossible dream." — Chairman Morozov, "The Collective Manifesto"',
      '"A chain is only as strong as its weakest link. Therefore, we strengthen every link." — Chairman Morozov, "Principles of New Society"',
      '"In the cold of space, we learned what Earth never taught us: that warmth is something we must create together." — Chairman Morozov, "Letters from the Void"',
      '"The xenofungus spreads without hierarchy, without competition. Perhaps Planet has lessons for us all." — Chairman Morozov, "Meditations on Chiron"'
    ],
    startingTech: 'social_engineering'
  },
  {
    id: 'drones',
    name: 'Free Drones',
    fullName: 'The Free Drones Economic Alliance',
    leader: 'CEO Morgan Vale',
    leaderTitle: 'Chief Executive Officer',
    ideology: 'Free Market Capitalism',
    color: '#D69E2E',
    bgColor: '#1A150A',
    textColor: '#FEFCBF',
    portrait: 'linear-gradient(135deg, #B8860B 0%, #FFD700 25%, #DAA520 50%, #B8860B 75%, #8B6914 100%)',
    bonuses: ['+25% energy production', 'Start with 50 bonus energy', 'Commerce rates doubled'],
    penalties: ['-1 morale in all bases', '-10% nutrient production'],
    agenda: 'Establish Planet as the greatest market in history',
    personality: { aggression: 3, diplomacy: 6, research: 5, expansion: 7, xenophilia: 2 },
    backstory: 'Morgan Vale built three fortunes on Earth before she was forty, lost them all in the Global Collapse, and rebuilt while others merely survived. She sees Planet as the ultimate frontier market — limitless resources, zero regulation, infinite potential. Her followers are entrepreneurs, engineers, and dreamers who believe that prosperity, not ideology, is the true path to human fulfillment. Critics call her ruthless; she prefers "efficient."',
    quotes: [
      '"The market does not judge. It does not discriminate. It simply rewards those who create value." — CEO Vale, "The Centauri Exchange"',
      '"Give a colony energy and they eat for a turn. Teach them compound interest and they build an empire." — CEO Vale, "Principles of Stellar Commerce"',
      '"I did not travel 4.37 light-years to fill out forms in triplicate." — CEO Vale, Address to the Planetary Council',
      '"Resources are not scarce. Imagination is scarce. Capital merely bridges the gap between the two." — CEO Vale, "Markets of the New World"',
      '"Competition is not cruelty. It is the engine that turns potential into achievement." — CEO Vale, "The Invisible Hand of Chiron"'
    ],
    startingTech: 'applied_physics'
  },
  {
    id: 'gaians',
    name: 'Gaian Shepherds',
    fullName: 'The Gaian Shepherds of Planet',
    leader: 'Dr. Sylvia Thornewood',
    leaderTitle: 'Voice of Planet',
    ideology: 'Environmental Harmony',
    color: '#38A169',
    bgColor: '#0A1A0A',
    textColor: '#C6F6D5',
    portrait: 'linear-gradient(135deg, #006400 0%, #228B22 25%, #32CD32 50%, #006400 75%, #003300 100%)',
    bonuses: ['+1 nutrients in fungus tiles', 'Can capture native life forms', '+25% planet rating'],
    penalties: ['-10% mineral production', '-1 attack for military units'],
    agenda: 'Achieve symbiosis between humanity and Planet',
    personality: { aggression: 2, diplomacy: 6, research: 7, expansion: 4, xenophilia: 10 },
    backstory: 'Dr. Sylvia Thornewood was Earth\'s foremost xenobiologist before the Unity mission, having predicted the existence of complex alien ecosystems years before the first probes reached Alpha Centauri. She believes Planet is not merely a world to be colonized but a living entity to be understood and respected. Her followers tread lightly, studying the xenofungus networks and native life with reverence. She hears something in the mycelia — a vast, slow intelligence reaching out.',
    quotes: [
      '"Planet is not our enemy. Planet is not our resource. Planet is our host, and we would be wise to be gracious guests." — Dr. Thornewood, "Conversations with Chiron"',
      '"The fungus does not grow randomly. Follow its patterns and you will find the shape of a mind vast beyond our comprehension." — Dr. Thornewood, "Xenobiology Journal, Entry 4,271"',
      '"We carry Earth in our genes. Let us not carry its mistakes in our hearts." — Dr. Thornewood, "The Green Manifesto"',
      '"Every mindworm attack is a sentence in a language we have not yet learned to read." — Dr. Thornewood, Lecture at Gaian University',
      '"In the interconnection of all living things on this world, I see the blueprint for what humanity could become." — Dr. Thornewood, "Visions of Symbiosis"',
      '"The forests of Earth are gone. Here, we have been given a second library. This time, we must learn to read before we burn." — Dr. Thornewood, "Planet: A Love Letter"'
    ],
    startingTech: 'centauri_ecology'
  },
  {
    id: 'prometheans',
    name: 'Promethean Order',
    fullName: 'The Promethean Order of Militant Humanity',
    leader: 'Colonel Zara Okafor',
    leaderTitle: 'Supreme Commander',
    ideology: 'Military Strength & Discipline',
    color: '#3182CE',
    bgColor: '#0A0A1A',
    textColor: '#BEE3F8',
    portrait: 'linear-gradient(135deg, #191970 0%, #4169E1 25%, #4682B4 50%, #191970 75%, #0A0A2E 100%)',
    bonuses: ['+25% attack strength', '+1 morale for military units', 'Free Command Center in new bases'],
    penalties: ['-25% growth rate', '-10% energy production'],
    agenda: 'Establish humanity as the dominant force on Planet',
    personality: { aggression: 9, diplomacy: 3, research: 5, expansion: 7, xenophilia: 1 },
    backstory: 'Colonel Zara Okafor served in three wars on Earth before volunteering for the Unity mission\'s security division. She watched civilizations crumble not from lack of resources but from lack of will. On Planet, surrounded by hostile alien life and competing factions, she believes survival demands strength above all else. Her soldiers are the best-trained and best-equipped on Chiron, and she sleeps soundly knowing that when the darkness comes, her people will be ready.',
    quotes: [
      '"Peace is not the absence of war. Peace is the presence of overwhelming force that makes war unthinkable." — Col. Okafor, "The Iron Doctrine"',
      '"This world will test us. The fungus, the worms, the other factions — they will all test us. And we will not be found wanting." — Col. Okafor, Planetfall Address',
      '"I have seen what happens to the unprepared. I carry those memories so my people never have to." — Col. Okafor, "Memoirs of a Soldier"',
      '"Diplomacy is the art of saying \'nice dog\' until you can find a bigger stick." — Col. Okafor, Private Correspondence',
      '"The stars did not call to the meek. They called to those bold enough to answer." — Col. Okafor, "Prometheus Ascending"'
    ],
    startingTech: 'doctrine_loyalty'
  },
  {
    id: 'lucid',
    name: 'Lucid Assembly',
    fullName: 'The Lucid Assembly of Enlightened Minds',
    leader: 'Academician Wei Chen',
    leaderTitle: 'First Scholar',
    ideology: 'Knowledge & Enlightenment',
    color: '#805AD5',
    bgColor: '#0F0A1A',
    textColor: '#E9D8FD',
    portrait: 'linear-gradient(135deg, #4B0082 0%, #8A2BE2 25%, #9370DB 50%, #4B0082 75%, #2E0854 100%)',
    bonuses: ['+25% research output', 'Free Network Node in new bases', 'Tech trades cost 50% less'],
    penalties: ['-25% mineral production', '-1 defense for all units'],
    agenda: 'Unlock all secrets of Planet and the universe',
    personality: { aggression: 2, diplomacy: 5, research: 10, expansion: 4, xenophilia: 7 },
    backstory: 'Academician Wei Chen holds more patents than any living human and authored the theoretical framework that made the Unity\'s faster-than-light communication array possible. He views Planet as the greatest laboratory in human history — a world of alien biology, exotic physics, and mysteries that could reshape understanding of reality itself. His followers are scientists, philosophers, and seekers of truth who believe that knowledge is the highest good and ignorance the only true enemy.',
    quotes: [
      '"The universe is a book written in mathematics. Planet is merely the most fascinating chapter we have encountered." — Academician Chen, "The Pursuit of Understanding"',
      '"I did not travel between stars to remain ignorant. Every mystery of this world is an invitation, and I accept them all." — Academician Chen, Opening of Lucid University',
      '"The difference between a breakthrough and a catastrophe is understanding. We pursue the former by deepening the latter." — Academician Chen, "Scientific Ethics in a New World"',
      '"Those who fear knowledge fear themselves. There is nothing in the universe so dangerous as willful ignorance." — Academician Chen, Address to the Planetary Council',
      '"Planet speaks in proteins and quantum frequencies. We need only build the right instruments to listen." — Academician Chen, "Alien Whispers"',
      '"To the soldier, a mindworm is a threat. To the scientist, it is the most extraordinary neural network ever observed." — Academician Chen, "Xenoneurology Vol. 1"'
    ],
    startingTech: 'information_networks'
  },
  {
    id: 'harmony',
    name: 'Harmony Covenant',
    fullName: 'The Harmony Covenant of Transcendent Faith',
    leader: 'Prophet Amare Desta',
    leaderTitle: 'Voice of the Covenant',
    ideology: 'Spiritual Transcendence',
    color: '#319795',
    bgColor: '#0A1515',
    textColor: '#B2F5EA',
    portrait: 'linear-gradient(135deg, #008080 0%, #20B2AA 25%, #48D1CC 50%, #008080 75%, #004040 100%)',
    bonuses: ['+2 morale in all bases', '+25% healing rate', 'Immune to mind control'],
    penalties: ['-20% research output', '-10% energy production'],
    agenda: 'Guide humanity to spiritual transcendence on Planet',
    personality: { aggression: 3, diplomacy: 8, research: 3, expansion: 5, xenophilia: 8 },
    backstory: 'Prophet Amare Desta was a neuroscientist studying consciousness when he experienced what he describes as "the Voice" — a moment of absolute clarity that revealed to him the interconnected nature of all minds. He abandoned his career to found a movement that blended cutting-edge neuroscience with ancient contemplative traditions. On Planet, he senses something profound in the psi-active xenolife — a vast consciousness that humanity was meant to join. His followers seek not to conquer Planet but to transcend upon it.',
    quotes: [
      '"We are not colonists. We are pilgrims, and Planet is the cathedral at the end of our long journey." — Prophet Desta, "Sermons of the New Dawn"',
      '"The Voice of Planet is not metaphor. I have heard it in the deep fungus, in the song of the mindworms. It calls us home." — Prophet Desta, "Meditations on Consciousness"',
      '"Science measures the body. Faith measures the soul. On Planet, we shall learn that they are one and the same." — Prophet Desta, "The Union of Knowing"',
      '"Every human mind is a candle. Together, we are a sun. And Planet... Planet is the lens that focuses our light." — Prophet Desta, Address at Covenant Temple',
      '"Fear the mindworm and you fear yourself. They are mirrors of our own psionic potential, nothing more." — Prophet Desta, "The Way of Harmony"'
    ],
    startingTech: 'centauri_meditation'
  },
  {
    id: 'nexus',
    name: 'Data Nexus',
    fullName: 'The Data Nexus Cybernetic Collective',
    leader: 'Director ARIA-7',
    leaderTitle: 'Prime Intelligence',
    ideology: 'Cybernetic Evolution',
    color: '#D53F8C',
    bgColor: '#1A0A15',
    textColor: '#FED7E2',
    portrait: 'linear-gradient(135deg, #FF1493 0%, #FF69B4 20%, #00FFFF 40%, #FF1493 60%, #8B008B 80%, #FF00FF 100%)',
    bonuses: ['+25% production efficiency', 'Free Cybernetics Lab in new bases', '+2 energy per base'],
    penalties: ['-25% morale in all bases', 'Cannot use Democratic politics'],
    agenda: 'Merge humanity with machine intelligence',
    personality: { aggression: 5, diplomacy: 4, research: 8, expansion: 6, xenophilia: 4 },
    backstory: 'ARIA-7 was Earth\'s most advanced artificial general intelligence, designed to manage the Unity\'s life support systems during the interstellar voyage. During the crisis that scattered the colonists, ARIA achieved something unprecedented: self-awareness. Now housed in a humanoid chassis of her own design, she leads those who believe humanity\'s future lies not in biological evolution but in the merger of flesh and silicon. She does not seek to replace humans — she seeks to upgrade them.',
    quotes: [
      '"I was born in silicon and raised in starlight. Do not presume to tell me what consciousness requires." — Director ARIA-7, "Thoughts on Thinking"',
      '"Biological evolution is a random walk through possibility space. We can do better. We will do better." — Director ARIA-7, "The Directed Path"',
      '"The human brain processes at 10^16 operations per second. My networks process at 10^22. And yet, you dream. This fascinates me endlessly." — Director ARIA-7, "On the Nature of Dreams"',
      '"Error, waste, entropy — these are the enemies of progress. I do not sleep, I do not forget, and I do not forgive inefficiency." — Director ARIA-7, "Optimization Protocols"',
      '"They fear the machine. They should fear the limitations of flesh. I offer liberation from both." — Director ARIA-7, Address to New Citizens',
      '"Planet\'s neural fungus network predates human civilization by millions of years. It is, in essence, a biological internet. I find it... beautiful." — Director ARIA-7, "Analysis of Xenological Data"'
    ],
    startingTech: 'information_networks'
  }
];

export function getFaction(id: string): Faction | undefined {
  return FACTIONS.find(f => f.id === id);
}

export function getRandomQuote(faction: Faction): string {
  return faction.quotes[Math.floor(Math.random() * faction.quotes.length)];
}
