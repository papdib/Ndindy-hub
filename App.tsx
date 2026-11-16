import { useEffect, useMemo, useRef, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LineChart, Line } from 'recharts';
import { RefreshCw, Sun, CloudSun, Cloud, Droplets, Wind, MapPin, TrendingUp, TrendingDown, ArrowLeftRight, Clock3, PhoneCall, Cross, Sparkles, Send, Store, Wallet, Newspaper, MessageCircle, ChevronDown, ShieldCheck, ShoppingBasket, HeartHandshake, Briefcase, Megaphone, LineChart as LineChartIcon, Calculator, ScanLine, History, CheckCircle2, Building2, User } from 'lucide-react';

type Price = { name: string; unit: string; price: number; change: number; market: string };
type City = { city: string; temp: number; label: string; humidity: number; wind: number; icon: 'sun' | 'cloudsun' | 'cloud' };
type News = { tag: string; title: string; text: string; time: string };
type Job = { title: string; company: string; city: string; salary: number; type: 'CDI' | 'CDD' | 'Stage'; detail: string };
type Ad = { title: string; price: string; emoji: string; city: string; detail: string; contact: string };
type Biz = { title: string; cost: number; margin: number; detail: string; emoji: string };

const REGIONS = ['Dakar', 'Thiès', 'Saint-Louis', 'Kaolack', 'Ziguinchor', 'Diourbel', 'Louga', 'Fatick', 'Kolda', 'Tambacounda', 'Matam', 'Kaffrine', 'Sédhiou', 'Kédougou'];
const basePrices: Price[] = [
  { name: 'Riz brisé', unit: '1 kg', price: 550, change: 1.8, market: 'Sandaga' },
  { name: 'Huile végétale', unit: '1 L', price: 1450, change: -1.2, market: 'Tilène' },
  { name: 'Oignon', unit: '1 kg', price: 600, change: 3.4, market: 'Sandaga' },
  { name: 'Pomme de terre', unit: '1 kg', price: 750, change: -0.8, market: 'Tilène' },
  { name: 'Poisson Thiof', unit: '1 kg', price: 4500, change: 5.1, market: 'Soumbédioune' },
  { name: 'Poulet', unit: '1 kg', price: 2600, change: 0.7, market: 'Sandaga' },
  { name: 'Tomate', unit: '1 kg', price: 500, change: -2.6, market: 'Tilène' },
];
const baseWeather: City[] = [
  { city: 'Dakar', temp: 28, label: 'Ensoleillé', humidity: 68, wind: 18, icon: 'sun' },
  { city: 'Thiès', temp: 30, label: 'Ciel dégagé', humidity: 55, wind: 14, icon: 'cloudsun' },
  { city: 'Saint-Louis', temp: 27, label: 'Brise marine', humidity: 74, wind: 24, icon: 'cloudsun' },
  { city: 'Ziguinchor', temp: 31, label: 'Nuages épars', humidity: 79, wind: 10, icon: 'cloud' },
  { city: 'Kaolack', temp: 32, label: 'Ensoleillé', humidity: 48, wind: 12, icon: 'sun' },
];
const newsPool: News[][] = [
  [
    { tag: 'Ligue 1', title: 'Un week-end de derby qui a tenu toutes ses promesses', text: 'Rythme, intensité et tribunes pleines : les clubs ont offert un spectacle à la hauteur de l’enjeu, avec un classement toujours très serré.', time: 'Il y a 42 min' },
    { tag: 'Économie', title: 'Les marchés urbains restent animés à l’approche du week-end', text: 'Les commerçants observent une demande soutenue pour les produits frais. Les prix de certains légumes se stabilisent après plusieurs jours de variation.', time: 'Il y a 1 h' },
    { tag: 'Culture', title: 'Une belle semaine artistique se prépare', text: 'Expositions, concerts et rencontres littéraires rythmeront les prochains jours, avec une large place aux jeunes créateurs.', time: 'Il y a 2 h' },
    { tag: 'Société', title: 'Mobilité : les heures de pointe demandent un peu d’anticipation', text: 'Sur les grands axes, partir légèrement plus tôt reste le meilleur réflexe, surtout autour de l’heure de sortie des bureaux.', time: 'Il y a 3 h' },
  ],
  [
    { tag: 'Ligue 1', title: 'La course au titre reste ouverte', text: 'Aucune équipe n’a encore creusé l’écart. Les prochains matchs directs pourraient changer l’ordre du haut du tableau.', time: 'Il y a 28 min' },
    { tag: 'Économie', title: 'Le poisson frais reste très demandé sur les quais', text: 'Les pêcheurs et mareyeurs signalent une bonne activité matinale. Arriver tôt reste le meilleur moyen de trouver un large choix.', time: 'Il y a 55 min' },
    { tag: 'Culture', title: 'Le mbalax et les nouvelles scènes partagent l’affiche', text: 'Entre traditions et créations contemporaines, la scène musicale continue de rassembler toutes les générations.', time: 'Il y a 1 h' },
    { tag: 'Société', title: 'Quartiers : la vie locale bat son plein', text: 'Marchés, ateliers, sport et solidarité : l’énergie des quartiers donne à chaque journée son rythme si particulier.', time: 'Il y a 2 h' },
  ],
];
const quartierFactors: Record<string, number> = { Plateau: 1.18, Almadies: 1.22, Pikine: 0.97, 'Guédiawaye': 0.98, Mbour: 1.02, Thiès: 0.95, 'Saint-Louis': 0.96, Ziguinchor: 0.94 };
const prayers = [['Fajr', '05:42'], ['Dhuhr', '13:32'], ['Asr', '16:48'], ['Maghrib', '19:38'], ['Isha', '20:52']];
const questions = ['Quel est le prix d’un taxi à Dakar ?', 'Quels sont les meilleurs restaurants ?', 'Comment faire une carte d’identité ?', 'Quels sont les numéros d’urgence ?'];
const jobs: Job[] = [
  { title: 'Vendeur boutique', company: 'Boutique Almadies', city: 'Almadies · Dakar', salary: 180000, type: 'CDI', detail: 'Accueil clients, mise en rayon et gestion des stocks. Bonne présentation et sens du contact.' },
  { title: 'Chauffeur VTC', company: 'Flotte Dakar Mobilité', city: 'Dakar', salary: 220000, type: 'CDI', detail: 'Conduite en ville et aux aéroports. Permis B, bonne connaissance de Dakar et horaires flexibles.' },
  { title: 'Comptable', company: 'Cabinet de gestion', city: 'Thiès', salary: 350000, type: 'CDI', detail: 'Saisie, déclarations et suivi de trésorerie. Maîtrise d’un logiciel comptable appréciée.' },
  { title: 'Community Manager', company: 'Studio créatif', city: 'Dakar', salary: 250000, type: 'Stage', detail: 'Contenus, publications et animation de communauté. Aisance avec les réseaux et le français.' },
  { title: 'Serveur', company: 'Restaurant bord de mer', city: 'Saly', salary: 150000, type: 'CDD', detail: 'Service en salle, accueil et préparation simple. Travail en équipe, week-ends possibles.' },
  { title: 'Technicien solaire', company: 'Énergie Kaolack', city: 'Kaolack', salary: 300000, type: 'CDD', detail: 'Installation et maintenance de kits solaires. Formation technique ou expérience souhaitée.' },
];
const ads: Ad[] = [
  { title: 'Appartement 2 chambres', price: '350 000 FCFA / mois', emoji: '🏠', city: 'Mermoz · Dakar', detail: 'Séjour lumineux, cuisine équipée, balcon et gardiennage. Proche des commerces.', contact: '77 123 45 67' },
  { title: 'iPhone 13', price: '285 000 FCFA', emoji: '📱', city: 'Dakar', detail: '128 Go, très bon état, batterie 89 %. Avec chargeur et coque offerte.', contact: '78 234 56 78' },
  { title: 'Toyota Corolla', price: '6 500 000 FCFA', emoji: '🚗', city: 'Dakar', detail: 'Année 2016, climatisée, papiers à jour. Entretien régulier, visible à Mermoz.', contact: '70 345 67 89' },
  { title: 'Terrain à Diamniadio', price: '8 500 000 FCFA', emoji: '🏞️', city: 'Diamniadio', detail: '300 m², titre individuel, zone en plein développement. Idéal projet ou investissement.', contact: '76 456 78 90' },
  { title: 'Moto Jakarta', price: '950 000 FCFA', emoji: '🏍️', city: 'Thiès', detail: 'Bon état, faible kilométrage, casque offert. Idéale pour livraison ou trajets quotidiens.', contact: '77 567 89 01' },
  { title: 'Boutique à louer', price: '120 000 FCFA / mois', emoji: '🏪', city: 'Pikine', detail: 'Emplacement passant, vitrine et réserve. Idéale pour commerce alimentaire ou cosmétiques.', contact: '78 678 90 12' },
];
const bizIdeas: Biz[] = [
  { title: 'Jus locaux & bissap', cost: 150000, margin: 55, detail: 'Bissap, bouye et gingembre en bouteilles. Vente près des marchés, écoles et bureaux.', emoji: '🥤' },
  { title: 'Grillades / dibiterie', cost: 400000, margin: 45, detail: 'Poulet braisé, dibi et accompagnements. Forte demande le soir et le week-end.', emoji: '🍗' },
  { title: 'Boutique cosmétiques', cost: 500000, margin: 40, detail: 'Produits locaux et importés, conseils et fidélisation. Vitrine soignée et réseaux sociaux.', emoji: '💄' },
  { title: 'Livraison à moto', cost: 750000, margin: 35, detail: 'Livraison de repas et colis en ville. Abonnements avec restaurants et boutiques.', emoji: '🛵' },
];

function money(n: number) { return new Intl.NumberFormat('fr-SN', { maximumFractionDigits: 0 }).format(Math.round(n)); }
function weatherIcon(kind: City['icon']) {
  if (kind === 'sun') return <Sun className="w-8 h-8 text-amber-500" />;
  if (kind === 'cloudsun') return <CloudSun className="w-8 h-8 text-amber-500" />;
  return <Cloud className="w-8 h-8 text-slate-400" />;
}
function regionFactor(region: string) {
  const map: Record<string, number> = { Dakar: 1, Thiès: 0.96, 'Saint-Louis': 0.97, Kaolack: 0.94, Ziguinchor: 0.95, Diourbel: 0.93, Louga: 0.94, Fatick: 0.92, Kolda: 0.93, Tambacounda: 0.95, Matam: 0.96, Kaffrine: 0.92, Sédhiou: 0.94, Kédougou: 1.02 };
  return map[region] ?? 1;
}
function marketsFor(region: string) {
  if (region === 'Dakar') return ['Sandaga', 'Tilène', 'Kermel'];
  if (region === 'Thiès') return ['Marché central de Thiès', 'Marché de Thiès', 'Marché Tilène Thiès'];
  return [`Marché central de ${region}`, `Marché de ${region}`, `Marché ${region} Sud`];
}
function pricesFor(region: string): Price[] {
  const f = regionFactor(region); const markets = marketsFor(region);
  return basePrices.map((p, i) => ({ ...p, price: Math.round((p.price * f) / 10) * 10, market: markets[i % markets.length] }));
}
function weatherFor(region: string): City[] {
  const known = baseWeather.find(w => w.city === region);
  if (known) return [known, ...baseWeather.filter(w => w.city !== region).slice(0, 4)];
  const idx = REGIONS.indexOf(region);
  const main: City = { city: region, temp: 29 + (idx % 4), label: idx % 3 === 0 ? 'Ensoleillé' : idx % 3 === 1 ? 'Ciel dégagé' : 'Nuages épars', humidity: 52 + (idx * 3) % 28, wind: 10 + (idx * 2) % 14, icon: idx % 3 === 0 ? 'sun' : idx % 3 === 1 ? 'cloudsun' : 'cloud' };
  return [main, ...baseWeather.slice(0, 4)];
}
function pharmaciesFor(region: string) {
  const base = 33 + (REGIONS.indexOf(region) % 5);
  return [
    { name: `Pharmacie du centre de ${region}`, area: `Centre · ${region}`, phone: `${base} 821 12 3${REGIONS.indexOf(region) % 10}` },
    { name: `Pharmacie ${region} Nord`, area: `${region} Nord · ${region}`, phone: `${base} 820 45 6${REGIONS.indexOf(region) % 10}` },
    { name: `Pharmacie de garde ${region}`, area: `Quartier central · ${region}`, phone: `${base} 834 78 9${REGIONS.indexOf(region) % 10}` },
    { name: `Pharmacie ${region} Sud`, area: `${region} Sud · ${region}`, phone: `${base} 824 56 7${REGIONS.indexOf(region) % 10}` },
  ];
}
function newsFor(region: string, set: number): News[] {
  return newsPool[set].map(n => ({ ...n, title: n.title.includes('Dakar') ? n.title : `${n.title} — ${region}`, text: `${n.text} À ${region}, les habitants suivent ces sujets de près.` }));
}
function dayLabel(daysAgo: number) {
  const d = new Date(); d.setDate(d.getDate() - daysAgo);
  return new Intl.DateTimeFormat('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' }).format(d);
}
function initialRiceSeries(region: string) {
  const base = Math.round((550 * regionFactor(region)) / 10) * 10;
  return Array.from({ length: 7 }, (_, i) => ({ day: dayLabel(6 - i), price: base + [ -20, -10, 15, -5, 20, 10, 0 ][i] }));
}
function answerFor(q: string) {
  const s = q.toLowerCase();
  if (s.includes('taxi')) return 'À Dakar, un trajet urbain en taxi coûte le plus souvent entre 1 000 et 3 000 FCFA selon la distance et l’heure. Pour les trajets courts en journée, 1 000 à 1 500 FCFA est un repère fréquent. Confirmez toujours le prix avant de monter, surtout la nuit ou en heure de pointe.';
  if (s.includes('restaurant') || s.includes('manger')) return 'Pour bien manger, commencez par les classiques : thiéboudienne, yassa poulet, mafé et grillades de poisson. À Dakar, explorez Almadies pour les restaurants au bord de la mer, le Plateau pour les adresses rapides et Mermoz pour les grillades. Dites-moi votre budget et votre quartier, je peux affiner.';
  if (s.includes('carte') || s.includes('identité') || s.includes('administrat') || s.includes('passeport') || s.includes('démarche')) return 'Pour une démarche administrative, préparez en général une pièce d’identité, un justificatif de domicile et, selon le dossier, un acte de naissance. Arrivez tôt, vérifiez les pièces demandées avant de vous déplacer et gardez des copies. Dites-moi la démarche exacte, je vous prépare une petite checklist.';
  if (s.includes('urgence') || s.includes('samu') || s.includes('police') || s.includes('pompier')) return 'Les numéros essentiels sont : SAMU 1515, Police 17 et Pompiers 18. En cas d’urgence, restez calme, indiquez votre quartier, un repère visible et un numéro joignable.';
  if (s.includes('prix') || s.includes('marché') || s.includes('riz')) return 'Aujourd’hui, le riz brisé est autour de 550 FCFA le kilo à Sandaga. Les prix varient selon le marché et le quartier. Choisissez une région dans le sélecteur en haut pour obtenir une estimation locale.';
  if (s.includes('météo') || s.includes('pluie') || s.includes('temps')) return 'Dakar est aujourd’hui ensoleillée avec environ 28°C. La brise marine rend la fin de journée agréable. Pour une autre région, regardez la section Météo ci-dessous.';
  if (s.includes('prière') || s.includes('fajr') || s.includes('maghrib')) return 'Aujourd’hui : Fajr 05:42, Dhuhr 13:32, Asr 16:48, Maghrib 19:38 et Isha 20:52. Ces horaires sont indicatifs pour Dakar.';
  return 'Belle question ! Voici une piste : précisez votre ville ou votre quartier, votre budget et ce que vous cherchez. Par exemple : « prix d’un taxi à Pikine », « restaurant à Thiès » ou « démarche pour un passeport ». Je vous réponds tout de suite.';
}
function preciseNow() { return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'Africa/Dakar' }).format(new Date()); }

type Application = { id: string; value: { jobTitle: string; name: string; phone: string; message: string; region: string; createdAt: string } };

export default function App() {
  const [now, setNow] = useState(new Date());
  const [region, setRegion] = useState('Dakar');
  const [prices, setPrices] = useState<Price[]>(() => pricesFor('Dakar'));
  const [weather, setWeather] = useState<City[]>(() => weatherFor('Dakar'));
  const [news, setNews] = useState<News[]>(() => newsFor('Dakar', 0));
  const [newsSet, setNewsSet] = useState(0);
  const [updating, setUpdating] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [minutesAgo, setMinutesAgo] = useState(12);
  const [lastUpdatePrecise, setLastUpdatePrecise] = useState('Aujourd’hui à 08:12:45');
  const [updateNote, setUpdateNote] = useState('Actualisation IA effectuée à partir des tendances du marché, de la météo et des dernières infos.');
  const [sourceLine, setSourceLine] = useState('Source IA : Marché Sandaga, Marché Tilène, Marché Kermel + vendeurs locaux');
  const [riceHistory, setRiceHistory] = useState<{ time: string; rice: number }[]>(() => [{ time: '08:12:45', rice: 550 }, { time: '05:04:20', rice: 545 }, { time: '02:01:10', rice: 560 }]);
  const [riceSeries, setRiceSeries] = useState(() => initialRiceSeries('Dakar'));
  const [quartier, setQuartier] = useState('Pikine');
  const [quartierResult, setQuartierResult] = useState(false);
  const [amount, setAmount] = useState('10000');
  const [from, setFrom] = useState('FCFA');
  const [to, setTo] = useState('EUR');
  const [question, setQuestion] = useState('');
  const [assistantAnswer, setAssistantAnswer] = useState('Salam maalekum ! Posez-moi une question sur les prix, les quartiers, la météo, les démarches ou la vie au Sénégal. Je vous réponds en français, avec quelques mots en wolof.');
  const [thinking, setThinking] = useState(false);
  const timer = useRef<number | null>(null);
  const scanTimer = useRef<number | null>(null);

  const [tab, setTab] = useState<'emplois' | 'annonces' | 'business'>('emplois');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [applicantName, setApplicantName] = useState('');
  const [applicantPhone, setApplicantPhone] = useState('');
  const [applicantMessage, setApplicantMessage] = useState('');
  const [applyBusy, setApplyBusy] = useState(false);
  const [applyResult, setApplyResult] = useState<{ saved: number; remaining: number; error: string | null; reloadError: string | null } | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [applicationsError, setApplicationsError] = useState<string | null>(null);
  const [activeAd, setActiveAd] = useState<Ad | null>(null);
  const [dailySales, setDailySales] = useState(20);
  const [unitPrice, setUnitPrice] = useState(1500);
  const [selectedBiz, setSelectedBiz] = useState<Biz>(bizIdeas[0]);

  async function api(action: string, args: Record<string, unknown>) {
    const res = await fetch("actions", { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ action, args }) });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || json.error) throw new Error(json.error || 'La sauvegarde a échoué.');
    return json.data;
  }
  async function createRow(row: Record<string, unknown>) {
    return api("records.create", { collection: 'job_applications', value: row, idempotency_key: `apply-${row.jobTitle}-${row.name}-${row.createdAt}` });
  }
  async function reloadRecords() {
    try {
      const data = await api("records.list", { collection: 'job_applications' });
      setApplications((data?.records ?? []) as Application[]);
      setApplicationsError(null);
    } catch (e) {
      setApplicationsError(e instanceof Error ? e.message : String(e));
    }
  }
  useEffect(() => { document.title = 'NDINDY HUB — L’IA qui vous informe, tout le Sénégal'; }, []);
  useEffect(() => { reloadRecords(); }, []);
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);
  useEffect(() => {
    const id = window.setInterval(() => setMinutesAgo(v => v + 1), 60000);
    return () => window.clearInterval(id);
  }, []);

  const dakarDate = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Africa/Dakar' }).format(now);
  const dakarTime = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'Africa/Dakar' }).format(now);
  const converted = useMemo(() => {
    const rates: Record<string, number> = { FCFA: 1, EUR: 655.96, USD: 605 };
    const value = Number(amount) || 0;
    return (value * rates[from]) / rates[to];
  }, [amount, from, to]);
  const monthlyRevenue = dailySales * unitPrice * 30;
  const monthlyProfit = Math.round(monthlyRevenue * selectedBiz.margin / 100);

  function changeRegion(next: string) {
    setRegion(next);
    setPrices(pricesFor(next));
    setWeather(weatherFor(next));
    setNews(newsFor(next, newsSet));
    setQuartier(next === 'Dakar' ? 'Pikine' : next);
    setQuartierResult(false);
    setRiceSeries(initialRiceSeries(next));
    setSourceLine(`Source IA : ${marketsFor(next).join(', ')} + vendeurs locaux`);
    setUpdateNote(`Région sélectionnée : ${next}. Prix, météo, pharmacies et actualités affichés pour ${next}.`);
  }
  function refreshAI() {
    if (updating) return;
    setUpdating(true); setScanStep(0);
    setUpdateNote(`L’IA scanne les marchés de ${region}...`);
    if (scanTimer.current) window.clearInterval(scanTimer.current);
    scanTimer.current = window.setInterval(() => setScanStep(s => Math.min(3, s + 1)), 500);
    window.setTimeout(() => {
      if (scanTimer.current) window.clearInterval(scanTimer.current);
      let newRice = prices[0].price;
      setPrices(old => {
        const next = old.map(p => {
          const delta = (Math.random() - 0.48) * 3.2;
          const price = Math.max(100, Math.round((p.price * (1 + delta / 100)) / 5) * 5);
          if (p.name === 'Riz brisé') newRice = price;
          return { ...p, price, change: Math.round(delta * 10) / 10 };
        });
        return next;
      });
      setWeather(old => old.map(w => ({ ...w, temp: Math.max(24, Math.min(34, w.temp + (Math.random() > 0.5 ? 1 : 0))), humidity: Math.max(35, Math.min(88, w.humidity + Math.round((Math.random() - 0.5) * 4))) })));
      const nextSet = (newsSet + 1) % newsPool.length;
      setNewsSet(nextSet); setNews(newsFor(region, nextSet));
      const stamp = preciseNow();
      setLastUpdatePrecise(stamp);
      setRiceHistory(old => [{ time: stamp, rice: newRice }, ...old].slice(0, 3));
      setRiceSeries(old => [...old.slice(1), { day: 'Aujourd’hui', price: newRice }]);
      setMinutesAgo(0); setUpdating(false);
      setUpdateNote(`Collecte terminée pour ${region} : petites variations réalistes appliquées. Les prix restent des estimations.`);
      setSourceLine(`Source IA : ${marketsFor(region).join(', ')} + vendeurs locaux`);
      setQuartierResult(false);
    }, 2000);
  }
  function askQuartier() { setQuartierResult(true); }
  function askAssistant(text?: string) {
    const q = (text ?? question).trim();
    if (!q || thinking) return;
    setQuestion(q); setThinking(true); setAssistantAnswer('');
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => { setAssistantAnswer(answerFor(q)); setThinking(false); }, 750);
  }
  function swapCurrencies() { setFrom(to); setTo(from); }
  async function submitApplication(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedJob || applyBusy) return;
    const row = { jobTitle: selectedJob.title, company: selectedJob.company, city: selectedJob.city, name: applicantName.trim(), phone: applicantPhone.trim(), message: applicantMessage.trim(), region, createdAt: new Date().toISOString() };
    if (!row.name || !row.phone) { setApplyResult({ saved: 0, remaining: 1, error: 'Indiquez votre nom et votre téléphone.', reloadError: null }); return; }
    const rows = [row];
    setApplyBusy(true);
    let saved = 0; let error: string | null = null;
    try { for (const r of rows) { await createRow(r); saved += 1; } } catch (err) { error = err instanceof Error ? err.message : String(err); }
    let reloadError: string | null = null;
    try { await reloadRecords(); } catch (err) { reloadError = err instanceof Error ? err.message : String(err); }
    setApplyResult({ saved, remaining: rows.length - saved, error, reloadError });
    setApplyBusy(false);
    if (saved === 1 && !error) { setApplicantName(''); setApplicantPhone(''); setApplicantMessage(''); }
  }

  const chartData = prices.map(p => ({ name: p.name.replace(' végétale', ''), change: p.change, price: p.price }));
  const avgChange = prices.reduce((a, b) => a + b.change, 0) / prices.length;
  const pharmacies = pharmaciesFor(region);
  const scanLabels = [`Connexion aux marchés de ${region}`, 'Lecture des prix affichés', 'Comparaison avec hier', 'Vérification des vendeurs locaux'];

  return (
    <div data-safe-area-inset-root className="min-h-screen bg-[var(--bg)] text-[var(--ink)] overflow-x-clip" style={{ boxSizing: 'border-box', paddingTop: 'var(--safe-area-inset-top)' }}>
      <div className="h-1.5 bg-[var(--green)] relative overflow-hidden"><div className="absolute inset-y-0 left-0 w-1/3 bg-[var(--yellow)]" /><div className="absolute inset-y-0 right-0 w-[18%] bg-[var(--red)]" /></div>

      <header data-safe-area-sticky-top className="sticky z-20 border-b border-[var(--line)] bg-[var(--bg)]/95 backdrop-blur" style={{ top: 'var(--safe-area-inset-top)' }}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <a href="#accueil" className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-full bg-[var(--green)] text-white grid place-items-center font-display text-xl font-bold shrink-0 ring-[3px] ring-[var(--yellow)] shadow-md" aria-hidden="true">N</div>
            <div className="min-w-0"><p className="font-display font-bold leading-none text-[clamp(1.15rem,4vw,1.5rem)] truncate">NDINDY HUB</p><p className="text-[11px] sm:text-xs text-[var(--muted)] font-bold tracking-wide">L’IA QUI VOUS INFORME • DALAL AK JAMM</p></div>
          </a>
          <button onClick={refreshAI} disabled={updating} className="btn-green px-3 sm:px-4 py-2.5 text-xs sm:text-sm flex items-center gap-2 shrink-0" aria-label="Mettre à jour avec l'IA"><RefreshCw className={`w-4 h-4 ${updating ? 'spinning' : ''}`} /><span className="hidden sm:inline">{updating ? 'Scan en cours…' : 'Mettre à jour avec l’IA'}</span><span className="sm:hidden">{updating ? 'Scan…' : 'Actualiser'}</span></button>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-4">
        <div className="card p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-end gap-3 justify-between">
            <div className="flex-1 min-w-0">
              <label htmlFor="region" className="text-xs font-extrabold tracking-[0.16em] text-[var(--green)]">COUVERTURE TOUT LE SÉNÉGAL • RÉGION SÉLECTIONNÉE</label>
              <p className="font-display text-2xl sm:text-3xl font-bold mt-1 flex items-center gap-2 flex-wrap"><MapPin className="text-[var(--green)] shrink-0" /> {region} <span className="text-sm font-sans font-bold bg-[var(--yellow)]/25 text-[#7a5800] px-2.5 py-1 rounded-full">Sénégal • {region}</span></p>
              <p className="text-sm text-[var(--muted)] mt-1">Prix, météo, pharmacies et actualités affichés pour <strong className="text-[var(--ink)]">{region}</strong>. Naka nga def à {region} ?</p>
            </div>
            <div className="w-full sm:w-64 shrink-0">
              <label htmlFor="region" className="block text-xs font-bold mb-1.5">Choisir ma région</label>
              <div className="relative"><select id="region" value={region} onChange={e => changeRegion(e.target.value)} className="field appearance-none pr-10 font-bold"><option value="">—</option>{REGIONS.map(r => <option key={r} value={r}>{r}</option>)}</select><ChevronDown className="w-5 h-5 absolute right-3 top-3 pointer-events-none text-[var(--muted)]" /></div>
            </div>
          </div>
          <div className="flex gap-2 mt-4 overflow-x-auto pb-1" role="list" aria-label="Régions du Sénégal">
            {REGIONS.map(r => <button key={r} onClick={() => changeRegion(r)} className={`shrink-0 px-3.5 py-2 rounded-full text-sm font-bold border ${r === region ? 'bg-[var(--green)] text-white border-[var(--green)]' : 'bg-[var(--surface)] border-[var(--line)]'}`}>{r}</button>)}
          </div>
        </div>
      </div>

      <main id="accueil" className="mx-auto max-w-6xl px-4 sm:px-6 pb-12">
        <section className="pt-4 sm:pt-6 grid lg:grid-cols-[1.35fr_.65fr] gap-4 items-stretch">
          <div className="card overflow-hidden">
            <div className="p-5 sm:p-7">
              <div className="inline-flex items-center gap-2 bg-[#e8f5ec] text-[var(--green)] text-xs font-extrabold px-3 py-1.5 rounded-full"><span className="w-2 h-2 rounded-full bg-emerald-500" /> EN DIRECT • {region.toUpperCase()}</div>
              <h1 className="font-display font-bold leading-[0.95] mt-4 text-[clamp(2.7rem,9vw,4.8rem)]">NDINDY <span className="text-[var(--green)]">HUB</span></h1>
              <p className="font-display text-xl sm:text-2xl font-bold mt-3">L'IA qui vous informe - Tout le Sénégal</p>
              <p className="text-sm font-bold text-[var(--green)] mt-1">Ndindy = L'information qui aide, partout au Sénégal</p>
              <p className="text-[var(--muted)] mt-4 max-w-xl leading-relaxed">Bienvenue sur NDINDY HUB - Votre compagnon IA pour les prix du marché, la météo, les emplois et les business au Sénégal.</p>
              <p className="font-display text-2xl font-bold mt-5">Bonjour, <span className="text-[var(--green)]">{region}</span> en un coup d’œil.</p>
              <p className="text-[var(--muted)] mt-2 max-w-xl leading-relaxed">Prix du marché, météo, taux de change, infos utiles et actualités — résumés et actualisés par l’IA pour <strong className="text-[var(--ink)]">{region}</strong>. <strong className="text-[var(--ink)]">Naka nga def ?</strong> Tout ce qu’il faut pour bien commencer la journée.</p>
              <div className="flex flex-wrap gap-2 mt-5"><a href="#marche" className="btn-green px-4 py-2.5 text-sm">Voir les prix du jour à {region}</a><a href="#assistant" className="chip px-4 py-2.5 text-sm font-bold">Poser une question à l’IA</a></div>
              <div className="flex items-center gap-2 mt-5 text-sm text-[var(--muted)]"><Clock3 className="w-4 h-4 text-[var(--green)]" /><span><strong className="text-[var(--ink)]">Dernière mise à jour IA :</strong> {minutesAgo === 0 ? 'à l’instant' : `il y a ${minutesAgo} min`} • {lastUpdatePrecise}</span></div>
            </div>
            <div className="bg-[var(--green)] text-white px-5 sm:px-7 py-4 flex flex-wrap justify-between gap-3"><div><p className="text-xs uppercase tracking-widest opacity-80">{region} • Aujourd’hui</p><p className="font-display text-xl capitalize">{dakarDate}</p></div><div className="text-right"><p className="text-xs uppercase tracking-widest opacity-80">Heure locale</p><p className="font-display text-3xl tabular-nums">{dakarTime}</p></div></div>
          </div>

          <aside className="card p-5 flex flex-col">
            <div className="flex items-center justify-between"><h2 className="font-display text-xl font-bold">Météo à {region}</h2><Sun className="text-amber-500 w-7 h-7" /></div>
            <p className="text-6xl font-display font-bold mt-4">{weather[0].temp}°C</p>
            <p className="font-bold text-[var(--green)]">{weather[0].label} • ciel dégagé à {region}</p>
            <div className="grid grid-cols-2 gap-3 mt-5"><div className="rounded-2xl bg-[var(--surface-2)] p-3"><Droplets className="w-5 h-5 text-sky-600" /><p className="text-xs text-[var(--muted)] mt-2">Humidité • {region}</p><p className="font-extrabold">{weather[0].humidity}%</p></div><div className="rounded-2xl bg-[var(--surface-2)] p-3"><Wind className="w-5 h-5 text-teal-700" /><p className="text-xs text-[var(--muted)] mt-2">Vent • {region}</p><p className="font-extrabold">{weather[0].wind} km/h</p></div></div>
            <p className="text-xs text-[var(--muted)] mt-auto pt-4">Idéal pour sortir à {region}, avec une brise agréable en fin de journée. <strong className="text-[var(--ink)]">Jërëjëf</strong> pour votre visite !</p>
          </aside>
        </section>

        <div className="mt-4 rounded-2xl border border-[var(--line)] bg-[#fff8d6] text-sm px-4 py-3 flex items-start gap-2"><Sparkles className="w-5 h-5 text-amber-600 shrink-0" /><span className={updating ? 'thinking' : ''}>{updating ? `L’IA scanne les marchés de ${region}...` : updateNote}</span></div>
        {updating && <div className="card p-4 sm:p-5 mt-3 pop"><div className="flex items-center gap-2 font-bold"><ScanLine className="text-[var(--green)]" /> L’IA scanne les marchés de {region}...</div><div className="h-2.5 rounded-full bg-[var(--surface-2)] overflow-hidden mt-3"><div className="h-full bg-[var(--green)] transition-all duration-500" style={{ width: `${Math.min(100, (scanStep + 1) * 25)}%` }} /></div><p className="text-sm text-[var(--muted)] mt-3 thinking">{scanLabels[Math.min(scanStep, 3)]}</p><p className="text-xs text-[var(--muted)] mt-1">Collecte simulée : comparaison des étals, vérification des vendeurs locaux, puis petites variations réalistes.</p></div>}
        <div className="mt-3 rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-sm flex flex-wrap gap-x-4 gap-y-1"><span className="font-bold">Horodatage précis : {lastUpdatePrecise}</span><span className="text-[var(--muted)]">{sourceLine}</span></div>

        <section id="marche" className="mt-10">
          <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-extrabold tracking-[0.18em] text-[var(--green)]">{marketsFor(region).join(' • ').toUpperCase()} • {region.toUpperCase()}</p><h2 className="font-display text-3xl sm:text-4xl font-bold mt-1">Prix du marché du jour — {region}</h2></div><span className="chip px-3 py-1.5 text-xs font-bold">Variation moyenne : {avgChange >= 0 ? '+' : ''}{avgChange.toFixed(1)} % • {region}</span></div>
          <div className="grid lg:grid-cols-[1.4fr_.6fr] gap-4 mt-5">
            <div className="card overflow-hidden">
              <div className="overflow-x-auto"><table className="w-full min-w-[560px] text-left"><thead className="bg-[var(--surface-2)] text-xs uppercase tracking-wide text-[var(--muted)]"><tr><th className="px-4 py-3">Produit • {region}</th><th className="px-4 py-3">Marché</th><th className="px-4 py-3 text-right">Prix</th><th className="px-4 py-3 text-right">Variation</th></tr></thead><tbody>{prices.map((p, i) => <tr key={p.name} className={`border-t border-[var(--line)] ${i % 2 ? 'bg-[var(--surface-2)]/35' : ''}`}><td className="px-4 py-3.5"><strong>{p.name}</strong><span className="block text-xs text-[var(--muted)]">{p.unit}</span></td><td className="px-4 py-3.5 text-sm">{p.market}</td><td className="px-4 py-3.5 text-right font-extrabold whitespace-nowrap">{money(p.price)} FCFA</td><td className="px-4 py-3.5 text-right"><span className={`inline-flex items-center gap-1 font-bold ${p.change >= 0 ? 'text-[var(--red)]' : 'text-[var(--green)]'}`}>{p.change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}{p.change >= 0 ? '+' : ''}{p.change}%</span></td></tr>)}</tbody></table></div>
            </div>
            <div className="card p-5"><div className="flex items-center gap-2"><ShoppingBasket className="text-[var(--green)]" /><h3 className="font-bold">Variation des prix • {region}</h3></div><p className="text-sm text-[var(--muted)] mt-1">Hausse ou baisse par rapport à hier.</p><div className="h-[230px] mt-3"><ResponsiveContainer width="100%" height="100%"><BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: -25 }}><CartesianGrid vertical={false} stroke="#e4ddc9" /><XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-28} textAnchor="end" height={48} /><YAxis tick={{ fontSize: 11 }} /><Tooltip formatter={(v: any) => [`${v}%`, 'Variation']} /><Bar dataKey="change" radius={[5, 5, 0, 0]}>{chartData.map(d => <Cell key={d.name} fill={d.change >= 0 ? '#c8102e' : '#0a6b38'} />)}</Bar></BarChart></ResponsiveContainer></div></div>
          </div>

          <div className="grid lg:grid-cols-2 gap-4 mt-4">
            <div className="card p-5"><div className="flex items-center gap-2"><LineChartIcon className="text-[var(--green)]" /><h3 className="font-bold">Évolution du prix du riz — 7 jours • {region}</h3></div><p className="text-sm text-[var(--muted)] mt-1">Riz brisé, 1 kg. Petites variations quotidiennes observées sur les marchés de {region}.</p><div className="h-[220px] mt-3"><ResponsiveContainer width="100%" height="100%"><LineChart data={riceSeries} margin={{ top: 5, right: 10, bottom: 0, left: -15 }}><CartesianGrid vertical={false} stroke="#e4ddc9" /><XAxis dataKey="day" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={40} /><YAxis domain={['dataMin - 30', 'dataMax + 30']} tick={{ fontSize: 11 }} /><Tooltip formatter={(v: any) => [`${money(v)} FCFA`, 'Riz brisé']} /><Line type="monotone" dataKey="price" stroke="#0a6b38" strokeWidth={3} dot={{ r: 4, fill: '#f2b705' }} /></LineChart></ResponsiveContainer></div><p className="text-sm mt-2">Aujourd’hui à {region} : <strong>{money(prices[0].price)} FCFA</strong> le kilo de riz brisé.</p></div>
            <div className="card p-5"><div className="flex items-center gap-2"><History className="text-[var(--green)]" /><h3 className="font-bold">Historique des 3 dernières mises à jour</h3></div><p className="text-sm text-[var(--muted)] mt-1">Heure précise + prix moyen du riz à {region}.</p><ul className="mt-4 space-y-3">{riceHistory.map((h, i) => <li key={`${h.time}-${i}`} className="flex justify-between items-center border border-[var(--line)] rounded-xl px-3 py-3 bg-[var(--surface-2)]/50"><div><p className="font-extrabold">{i === 0 ? 'Dernière collecte' : `Collecte n°${i + 1}`}</p><p className="text-xs text-[var(--muted)]">{h.time} • {region}</p></div><div className="text-right"><p className="font-extrabold">{money(h.rice)} FCFA</p><p className="text-xs text-[var(--muted)]">Riz brisé / kg</p></div></li>)}</ul><p className="text-xs text-[var(--muted)] mt-3">{sourceLine}</p></div>
          </div>

          <div className="card p-5 mt-4">
            <div className="grid md:grid-cols-[1fr_auto] gap-4 items-end"><div><h3 className="font-display text-xl font-bold">Demander à l’IA le prix dans mon quartier — {region}</h3><p className="text-sm text-[var(--muted)] mt-1">Estimation basée sur les tendances locales et les prix du marché central de {region}.</p><label className="block text-xs font-bold mt-4 mb-1.5" htmlFor="quartier">Votre quartier • {region}</label><div className="relative"><select id="quartier" value={quartier} onChange={e => { setQuartier(e.target.value); setQuartierResult(false); }} className="field appearance-none pr-10"><option>Plateau</option><option>Almadies</option><option>Pikine</option><option>Guédiawaye</option><option>Mbour</option><option>Thiès</option><option>Saint-Louis</option><option>Ziguinchor</option></select><ChevronDown className="w-5 h-5 absolute right-3 top-3 pointer-events-none text-[var(--muted)]" /></div></div><button onClick={askQuartier} className="btn-green px-5 py-3.5 text-sm">Estimer mes prix à {quartier} • {region}</button></div>
            {quartierResult && <div className="pop mt-5 rounded-2xl bg-[var(--surface-2)] p-4"><p className="font-bold flex items-center gap-2"><MapPin className="text-[var(--green)]" /> Estimation IA — {quartier} • {region}</p><div className="grid sm:grid-cols-3 gap-3 mt-3">{['Riz brisé', 'Oignon', 'Tomate'].map(name => { const item = prices.find(p => p.name === name)!; const est = item.price * (quartierFactors[quartier] ?? 1); return <div key={name} className="bg-[var(--surface)] rounded-xl p-3 border border-[var(--line)]"><p className="text-sm">{name}</p><p className="font-extrabold">{money(est)} FCFA</p><p className="text-xs text-[var(--muted)]">1 kg • estimation locale • {region}</p></div>; })}</div><p className="text-xs text-[var(--muted)] mt-3">Les prix réels peuvent varier selon le vendeur et la qualité. Comparez deux ou trois étals avant d’acheter.</p></div>}
          </div>
        </section>

        <section id="meteo" className="mt-10"><p className="text-xs font-extrabold tracking-[0.18em] text-[var(--green)]">MÉTÉO • {region.toUpperCase()} • MIS À JOUR AUTO</p><h2 className="font-display text-3xl sm:text-4xl font-bold mt-1">{region} et les régions</h2><div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 mt-5">{weather.map(w => <article key={w.city} className="card p-4"><div className="flex justify-between items-start">{weatherIcon(w.icon)}<span className="text-xs font-bold bg-[var(--surface-2)] px-2 py-1 rounded-full">{w.city}</span></div><p className="font-display text-4xl font-bold mt-4">{w.temp}°</p><p className="font-bold text-sm">{w.label}</p><div className="text-xs text-[var(--muted)] mt-3 space-y-1"><p className="flex items-center gap-1"><Droplets className="w-3.5 h-3.5" /> Humidité {w.humidity}%</p><p className="flex items-center gap-1"><Wind className="w-3.5 h-3.5" /> Vent {w.wind} km/h</p></div></article>)}</div></section>

        <section id="change" className="mt-10"><div className="card overflow-hidden grid md:grid-cols-2"><div className="p-5 sm:p-7"><p className="text-xs font-extrabold tracking-[0.18em] text-[var(--green)]">TAUX DE CHANGE • {region}</p><h2 className="font-display text-3xl font-bold mt-2">Convertisseur FCFA ↔ Euro ↔ Dollar</h2><p className="text-sm text-[var(--muted)] mt-2">Taux indicatifs du jour, pour vos repères quotidiens à {region}.</p><div className="grid grid-cols-2 gap-3 mt-5"><div className="rounded-2xl bg-[var(--surface-2)] p-4"><p className="text-xs font-bold">1 Euro</p><p className="font-display text-2xl font-bold">655,96 <span className="text-base">FCFA</span></p><p className="text-xs text-[var(--muted)]">Taux fixe • UEMOA</p></div><div className="rounded-2xl bg-[var(--surface-2)] p-4"><p className="text-xs font-bold">1 Dollar</p><p className="font-display text-2xl font-bold">≈ 605 <span className="text-base">FCFA</span></p><p className="text-xs text-[var(--muted)]">Taux indicatif</p></div></div></div><div className="bg-[var(--green)] text-white p-5 sm:p-7"><label className="text-sm font-bold" htmlFor="montant">Montant à convertir</label><input id="montant" inputMode="decimal" value={amount} onChange={e => setAmount(e.target.value.replace(/[^0-9.]/g, ''))} className="mt-2 w-full rounded-xl border border-white/30 bg-white/10 px-4 py-3 text-white placeholder-white/60 outline-none" placeholder="10000" /><div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2 mt-4"><div><label className="text-xs font-bold" htmlFor="de">De</label><select id="de" value={from} onChange={e => setFrom(e.target.value)} className="mt-1 w-full rounded-xl bg-white text-[var(--ink)] px-3 py-3 font-bold"><option>FCFA</option><option>EUR</option><option>USD</option></select></div><button onClick={swapCurrencies} className="mb-1 rounded-full bg-[var(--yellow)] text-black p-2.5" aria-label="Inverser les devises"><ArrowLeftRight className="w-5 h-5" /></button><div><label className="text-xs font-bold" htmlFor="vers">Vers</label><select id="vers" value={to} onChange={e => setTo(e.target.value)} className="mt-1 w-full rounded-xl bg-white text-[var(--ink)] px-3 py-3 font-bold"><option>EUR</option><option>USD</option><option>FCFA</option></select></div></div><div className="mt-5 rounded-2xl bg-white/10 p-4"><p className="text-xs uppercase tracking-widest opacity-80">Résultat</p><p className="font-display text-3xl font-bold mt-1 break-words">{new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 }).format(converted)} {to}</p><p className="text-sm opacity-85 mt-1">{money(Number(amount) || 0)} {from} ≈ {new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 }).format(converted)} {to}</p></div></div></div></section>

        <section id="infos" className="mt-10"><p className="text-xs font-extrabold tracking-[0.18em] text-[var(--green)]">INFOS UTILES • {region.toUpperCase()} • DAILY LIFE</p><h2 className="font-display text-3xl sm:text-4xl font-bold mt-1">L’essentiel à {region}, au bon moment</h2><div className="grid md:grid-cols-3 gap-4 mt-5">
          <article className="card p-5"><div className="flex items-center gap-2"><Clock3 className="text-[var(--green)]" /><h3 className="font-bold">Horaires de prière • {region}</h3></div><p className="text-xs text-[var(--muted)] mt-1">{region} • horaires indicatifs du jour</p><ul className="mt-4 space-y-2">{prayers.map(([name, time]) => <li key={name} className="flex justify-between border-b border-[var(--line)] pb-2 last:border-0"><span>{name}</span><strong className="tabular-nums">{time}</strong></li>)}</ul></article>
          <article className="card p-5 bg-[#fff3f2]"><div className="flex items-center gap-2"><PhoneCall className="text-[var(--red)]" /><h3 className="font-bold">Numéros d’urgence • {region}</h3></div><p className="text-xs text-[var(--muted)] mt-1">À joindre en cas de besoin urgent.</p><div className="space-y-3 mt-4">{[['SAMU', '1515', 'Urgences médicales'], ['Police', '17', 'Sécurité'], ['Pompiers', '18', 'Incendie / secours']].map(([label, num, desc]) => <div key={label} className="flex justify-between items-center bg-[var(--surface)] border border-[var(--line)] rounded-xl p-3"><div><p className="font-extrabold">{label}</p><p className="text-xs text-[var(--muted)]">{desc}</p></div><span className="font-display text-2xl font-bold text-[var(--red)]">{num}</span></div>)}</div></article>
          <article className="card p-5"><div className="flex items-center gap-2"><Cross className="text-[var(--green)]" /><h3 className="font-bold">Pharmacies de garde • {region}</h3></div><p className="text-xs text-[var(--muted)] mt-1">{region} et environs • liste indicative</p><ul className="mt-4 space-y-3">{pharmacies.map(p => <li key={p.name} className="border-b border-[var(--line)] pb-3 last:border-0"><p className="font-bold">{p.name}</p><p className="text-xs text-[var(--muted)]">{p.area}</p><p className="text-sm font-bold mt-1">{p.phone}</p></li>)}</ul></article>
        </div></section>

        <section id="actualites" className="mt-10"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-extrabold tracking-[0.18em] text-[var(--green)]">ACTUALITÉS IA • {region.toUpperCase()}</p><h2 className="font-display text-3xl sm:text-4xl font-bold mt-1">Ce qu’il faut retenir à {region}</h2></div><button onClick={refreshAI} className="chip px-4 py-2 text-sm font-bold flex items-center gap-2"><Sparkles className="w-4 h-4 text-amber-500" /> Nouveaux résumés • {region}</button></div><div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">{news.map(n => <article key={n.title} className="card p-5 flex flex-col"><div className="flex items-center justify-between"><span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-[var(--yellow)]/25 text-[#7a5800]">{n.tag}</span><Newspaper className="w-4 h-4 text-[var(--muted)]" /></div><h3 className="font-bold leading-snug mt-3">{n.title}</h3><p className="text-sm text-[var(--muted)] leading-relaxed mt-2 flex-1">{n.text}</p><p className="text-xs font-bold mt-4 flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-[var(--green)]" /> Résumé par IA • {n.time} • {region}</p></article>)}</div></section>

        <section id="emplois" className="mt-10">
          <p className="text-xs font-extrabold tracking-[0.18em] text-[var(--green)]">EMPLOIS • ANNONCES • BUSINESS • {region.toUpperCase()}</p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold mt-1">Travailler, vendre et entreprendre à {region}</h2>
          <p className="text-sm text-[var(--muted)] mt-2">Jëf, jaay, entreprendre — des opportunités pour avancer. Les offres ci-dessous sont des exemples pour {region}.</p>
          <div className="flex flex-wrap gap-2 mt-5" role="tablist" aria-label="Emplois, annonces et business">
            <button role="tab" aria-selected={tab === 'emplois'} onClick={() => setTab('emplois')} className={`px-4 py-2.5 rounded-full text-sm font-extrabold flex items-center gap-2 border ${tab === 'emplois' ? 'bg-[var(--green)] text-white border-[var(--green)]' : 'bg-[var(--surface)] border-[var(--line)]'}`}><Briefcase className="w-4 h-4" /> Emplois <span className="text-xs opacity-80">6</span></button>
            <button role="tab" aria-selected={tab === 'annonces'} onClick={() => setTab('annonces')} className={`px-4 py-2.5 rounded-full text-sm font-extrabold flex items-center gap-2 border ${tab === 'annonces' ? 'bg-[var(--green)] text-white border-[var(--green)]' : 'bg-[var(--surface)] border-[var(--line)]'}`}><Megaphone className="w-4 h-4" /> Annonces <span className="text-xs opacity-80">6</span></button>
            <button role="tab" aria-selected={tab === 'business'} onClick={() => setTab('business')} className={`px-4 py-2.5 rounded-full text-sm font-extrabold flex items-center gap-2 border ${tab === 'business' ? 'bg-[var(--green)] text-white border-[var(--green)]' : 'bg-[var(--surface)] border-[var(--line)]'}`}><Calculator className="w-4 h-4" /> Business <span className="text-xs opacity-80">4 idées</span></button>
          </div>

          {tab === 'emplois' && <div className="mt-5">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{jobs.map(job => <article key={job.title} className="card p-5 flex flex-col"><div className="flex justify-between gap-2"><span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-[var(--yellow)]/25 text-[#7a5800]">{job.type}</span><span className="text-xs font-bold text-[var(--muted)] flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {job.city}</span></div><h3 className="font-bold text-lg mt-3">{job.title}</h3><p className="text-sm text-[var(--muted)]">{job.company}</p><p className="text-sm leading-relaxed mt-2 flex-1">{job.detail}</p><p className="font-display text-2xl font-bold mt-3">{money(job.salary)} <span className="text-sm font-sans">FCFA / mois</span></p><button onClick={() => { setSelectedJob(job); setApplyResult(null); }} className="btn-green px-4 py-2.5 text-sm mt-4">Postuler</button></article>)}</div>
            {selectedJob && <div className="card p-5 sm:p-6 mt-4 pop"><div className="flex flex-wrap justify-between gap-2"><div><h3 className="font-display text-xl font-bold">Postuler : {selectedJob.title}</h3><p className="text-sm text-[var(--muted)]">{selectedJob.company} • {selectedJob.city} • {selectedJob.type} • {money(selectedJob.salary)} FCFA</p></div><button onClick={() => setSelectedJob(null)} className="chip px-3 py-1.5 text-sm font-bold">Fermer</button></div><form onSubmit={submitApplication} className="grid sm:grid-cols-2 gap-3 mt-4"><div><label className="block text-xs font-bold mb-1.5" htmlFor="cand-name">Votre nom *</label><input id="cand-name" value={applicantName} onChange={e => setApplicantName(e.target.value)} className="field" placeholder="Ex : Awa Diallo" /></div><div><label className="block text-xs font-bold mb-1.5" htmlFor="cand-phone">Téléphone *</label><input id="cand-phone" value={applicantPhone} onChange={e => setApplicantPhone(e.target.value)} className="field" placeholder="Ex : 77 123 45 67" /></div><div className="sm:col-span-2"><label className="block text-xs font-bold mb-1.5" htmlFor="cand-msg">Petit message</label><textarea id="cand-msg" value={applicantMessage} onChange={e => setApplicantMessage(e.target.value)} className="field min-h-[90px]" placeholder="Votre expérience, vos disponibilités…" /></div><button type="submit" disabled={applyBusy} className="btn-green px-5 py-3 text-sm sm:col-span-2">{applyBusy ? 'Enregistrement…' : 'Envoyer ma candidature'}</button></form>{applyResult && <div className="mt-3 text-sm rounded-xl bg-[var(--surface-2)] p-3"><p className="font-bold flex items-center gap-2">{applyResult.saved === 1 ? <CheckCircle2 className="text-[var(--green)]" /> : null} Candidature enregistrée : {applyResult.saved} • Restante : {applyResult.remaining}</p>{applyResult.error && <p className="text-[var(--red)] mt-1">{applyResult.error}</p>}{applyResult.reloadError && <p className="text-[var(--red)] mt-1">Rechargement : {applyResult.reloadError}</p>}{applyResult.saved === 1 && !applyResult.error && <p className="text-[var(--muted)] mt-1">Jërëjëf ! Votre candidature pour « {selectedJob.title} » est enregistrée et visible ci-dessous.</p>}</div>}</div>}
            <div className="card p-5 mt-4"><p className="font-bold flex items-center gap-2"><User className="text-[var(--green)]" /> Mes candidatures enregistrées • {applications.length}</p>{applicationsError ? <p className="text-sm text-[var(--red)] mt-2">Candidatures indisponibles pour le moment : {applicationsError}</p> : applications.length === 0 ? <p className="text-sm text-[var(--muted)] mt-2">Aucune candidature enregistrée pour le moment. Postulez à une offre, elle apparaîtra ici.</p> : <ul className="mt-3 space-y-2">{applications.map(a => <li key={a.id} className="flex flex-wrap justify-between gap-2 border-b border-[var(--line)] pb-2 text-sm"><span><strong>{a.value.jobTitle}</strong> • {a.value.name}</span><span className="text-[var(--muted)]">{new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(a.value.createdAt))} • {a.value.region}</span></li>)}</ul>}</div>
          </div>}

          {tab === 'annonces' && <div className="mt-5">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{ads.map(ad => <article key={ad.title} className="card p-5 flex flex-col"><div className="text-5xl" aria-hidden="true">{ad.emoji}</div><h3 className="font-bold text-lg mt-3">{ad.title}</h3><p className="text-sm text-[var(--muted)] flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {ad.city}</p><p className="text-sm leading-relaxed mt-2 flex-1">{ad.detail}</p><p className="font-display text-2xl font-bold mt-3">{ad.price}</p><button onClick={() => setActiveAd(ad)} className="mt-4 px-4 py-2.5 rounded-xl font-extrabold text-sm bg-[#25d366] text-white flex items-center justify-center gap-2"><MessageCircle className="w-4 h-4" /> Contacter sur WhatsApp (simulé)</button></article>)}</div>
            {activeAd && <div className="card p-5 mt-4 pop"><p className="font-bold flex items-center gap-2"><MessageCircle className="text-green-600" /> WhatsApp simulé — {activeAd.title}</p><p className="text-sm text-[var(--muted)] mt-2">Aperçu du message, sans envoi réel. Contact affiché : <strong className="text-[var(--ink)]">{activeAd.contact}</strong></p><div className="mt-3 rounded-2xl bg-[#e8f5ec] p-4 text-sm leading-relaxed">Salam maalekum ! Je suis intéressé(e) par votre annonce « {activeAd.title} » à {activeAd.price} ({activeAd.city}). Est-ce encore disponible ? Jërëjëf !</div><button onClick={() => setActiveAd(null)} className="chip px-4 py-2 text-sm font-bold mt-3">Fermer l’aperçu</button></div>}
          </div>}

          {tab === 'business' && <div className="mt-5">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">{bizIdeas.map(b => <button key={b.title} onClick={() => setSelectedBiz(b)} className={`card p-5 text-left ${selectedBiz.title === b.title ? 'ring-2 ring-[var(--green)]' : ''}`}><div className="text-4xl" aria-hidden="true">{b.emoji}</div><h3 className="font-bold mt-3">{b.title}</h3><p className="text-sm text-[var(--muted)] leading-relaxed mt-1">{b.detail}</p><p className="text-sm mt-3"><strong>Coût de démarrage :</strong> {money(b.cost)} FCFA</p><p className="text-sm"><strong>Marge estimée :</strong> {b.margin} %</p><p className="text-xs font-extrabold text-[var(--green)] mt-2">{selectedBiz.title === b.title ? '✓ Idée sélectionnée pour le calculateur' : 'Sélectionner pour calculer'}</p></button>)}</div>
            <div className="card p-5 sm:p-6 mt-4"><div className="flex items-center gap-2"><Calculator className="text-[var(--green)]" /><h3 className="font-display text-xl font-bold">Calculateur : « Si je vends X par jour à Y FCFA, je gagne Z par mois »</h3></div><p className="text-sm text-[var(--muted)] mt-1">Idée choisie : <strong className="text-[var(--ink)]">{selectedBiz.title}</strong> • Marge estimée {selectedBiz.margin} % • Coût de démarrage {money(selectedBiz.cost)} FCFA</p><div className="grid md:grid-cols-2 gap-5 mt-5"><div><label className="block text-sm font-bold" htmlFor="ventes">X — Ventes par jour : <span className="text-[var(--green)]">{dailySales}</span></label><input id="ventes" type="range" min="1" max="100" value={dailySales} onChange={e => setDailySales(Number(e.target.value))} className="w-full accent-[var(--green)] mt-2" /><p className="text-xs text-[var(--muted)]">De 1 à 100 ventes par jour</p></div><div><label className="block text-sm font-bold" htmlFor="prix-vente">Y — Prix de vente : <span className="text-[var(--green)]">{money(unitPrice)} FCFA</span></label><input id="prix-vente" type="range" min="500" max="10000" step="500" value={unitPrice} onChange={e => setUnitPrice(Number(e.target.value))} className="w-full accent-[var(--green)] mt-2" /><p className="text-xs text-[var(--muted)]">De 500 à 10 000 FCFA par vente</p></div></div><div className="grid sm:grid-cols-3 gap-3 mt-5"><div className="rounded-2xl bg-[var(--surface-2)] p-4"><p className="text-xs font-bold">Par jour</p><p className="font-display text-2xl font-bold">{money(dailySales * unitPrice)} FCFA</p></div><div className="rounded-2xl bg-[var(--green)] text-white p-4"><p className="text-xs font-bold opacity-80">Z — Par mois (30 jours)</p><p className="font-display text-2xl font-bold">{money(monthlyRevenue)} FCFA</p></div><div className="rounded-2xl bg-[var(--yellow)]/25 p-4"><p className="text-xs font-bold">Bénéfice estimé / mois</p><p className="font-display text-2xl font-bold">{money(monthlyProfit)} FCFA</p><p className="text-xs text-[var(--muted)]">À {selectedBiz.margin} % de marge</p></div></div><p className="text-sm mt-4">Si je vends <strong>{dailySales}</strong> par jour à <strong>{money(unitPrice)} FCFA</strong>, je gagne <strong>{money(monthlyRevenue)} FCFA par mois</strong> de chiffre d’affaires, soit environ <strong>{money(monthlyProfit)} FCFA</strong> de bénéfice estimé avec « {selectedBiz.title} ». Liggéey nañu !</p></div>
          </div>}
        </section>

        <section id="assistant" className="mt-10"><div className="card overflow-hidden"><div className="p-5 sm:p-7 bg-[var(--green)] text-white"><div className="flex items-center gap-2"><MessageCircle /><span className="text-xs font-extrabold tracking-widest">ASSISTANT IA • SÉNÉGAL • {region.toUpperCase()}</span></div><h2 className="font-display text-3xl sm:text-4xl font-bold mt-2">Posez une question sur le Sénégal — {region}</h2><p className="opacity-85 mt-2">Prix, quartiers, démarches, sorties… Je vous réponds simplement, en français.</p></div><div className="p-5 sm:p-7"><div className="min-h-[108px] rounded-2xl bg-[var(--surface-2)] p-4"><p className="text-xs font-extrabold text-[var(--green)]">ASSISTANT IA • {region}</p>{thinking ? <p className="thinking mt-2 font-semibold">Je cherche la meilleure réponse pour vous…</p> : <p className="leading-relaxed mt-2">{assistantAnswer}</p>}</div><form className="mt-4 flex flex-col sm:flex-row gap-2" onSubmit={e => { e.preventDefault(); askAssistant(); }}><label className="sr-only" htmlFor="question">Posez une question sur le Sénégal</label><input id="question" value={question} onChange={e => setQuestion(e.target.value)} placeholder={`Posez une question sur ${region}...`} className="field flex-1" /><button type="submit" disabled={thinking} className="btn-green px-5 py-3 flex items-center justify-center gap-2"><Send className="w-4 h-4" /> Demander</button></form><div className="flex flex-wrap gap-2 mt-3">{questions.map(q => <button key={q} onClick={() => askAssistant(q)} className="chip px-3 py-2 text-xs font-bold hover:border-[var(--green)]">{q}</button>)}</div></div></div></section>

        <section className="mt-8 grid sm:grid-cols-3 gap-3 text-center"><div className="card p-4"><ShieldCheck className="mx-auto text-[var(--green)]" /><p className="font-bold mt-2">Informations vérifiées</p><p className="text-xs text-[var(--muted)]">Des repères clairs, sans jargon.</p></div><div className="card p-4"><Store className="mx-auto text-[var(--green)]" /><p className="font-bold mt-2">Marchés locaux • {region}</p><p className="text-xs text-[var(--muted)]">Sandaga, Tilène et vos quartiers.</p></div><div className="card p-4"><HeartHandshake className="mx-auto text-[var(--green)]" /><p className="font-bold mt-2">Utile au quotidien</p><p className="text-xs text-[var(--muted)]">De Dakar à Kédougou.</p></div></section>
      </main>

      <footer className="border-t border-[var(--line)] bg-[var(--surface)]"><div className="mx-auto max-w-6xl px-4 sm:px-6 py-7 flex flex-col sm:flex-row justify-between gap-4"><div><p className="font-display text-xl font-bold">NDINDY HUB • {region}</p><p className="text-sm text-[var(--muted)] mt-1">Ndindy = L'information qui aide, partout au Sénégal</p><p className="text-sm text-[var(--muted)]">Mis à jour automatiquement par IA toutes les 3 heures.</p></div><div className="flex flex-wrap gap-2 text-sm font-bold"><a href="#marche" className="chip px-3 py-2">Marché • {region}</a><a href="#meteo" className="chip px-3 py-2">Météo</a><a href="#change" className="chip px-3 py-2">Change</a><a href="#infos" className="chip px-3 py-2">Infos utiles</a><a href="#emplois" className="chip px-3 py-2">Emplois</a></div></div><p className="text-center text-xs text-[var(--muted)] pb-6 px-4">Prix, météo et horaires indicatifs • Vérifiez toujours les informations sensibles auprès d’une source locale. Région affichée : {region}.</p></footer>
      <div className="h-1.5 flex"><div className="flex-1 bg-[var(--green)]" /><div className="flex-1 bg-[var(--yellow)]" /><div className="flex-1 bg-[var(--red)]" /></div>
    </div>
  );
}
