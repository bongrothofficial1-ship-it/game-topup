import Link from 'next/link';

interface Game {
  id: string;
  name: string;
  slug: string;
  description: string;
  logoUrl: string;
  publisher: string;
}

async function getGames(): Promise<Game[]> {
  try {
    const res = await fetch('http://localhost:4000/games', { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const games = await getGames();

  return (
    <main className="min-h-screen bg-slate-950 text-white selection:bg-rose-500 selection:text-white">
      {/* Header / Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-black text-xl tracking-wider text-rose-500">
            ⚡ GAMETOPUP
          </div>
          <nav className="flex items-center gap-4 text-sm text-slate-300">
            <Link href="/" className="hover:text-white transition">ទំព័រដើម</Link>
            <Link href="/orders" className="hover:text-white transition text-rose-400 font-medium">ប្រវត្តិបញ្ជាទិញ</Link>
            <Link href="#" className="hover:text-white transition">ជំនួយ</Link>
          </nav>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="py-12 px-4 max-w-6xl mx-auto text-center">
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
          បញ្ចូលពេជ្រហ្គេម <span className="text-rose-500">រហ័ស & សុវត្ថិភាព</span>
        </h1>
        <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
          ទទួលស្គាល់ការទូទាត់ភ្លាមៗតាមរយៈ Bakong KHQR និង ABA PayWay គ្រប់ពេលវេលា ២៤/៧។
        </p>
      </section>

      {/* Game Cards Grid */}
      <section className="max-w-6xl mx-auto px-4 pb-20">
        <h2 className="text-xl font-bold mb-6 text-slate-200 flex items-center gap-2">
          🎮 ហ្គេមពេញនិយម
        </h2>

        {games.length === 0 ? (
          <div className="text-center py-12 text-slate-500">មិនទាន់មានទិន្នន័យហ្គេមនៅឡើយទេ...</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
            {games.map((game) => (
              <Link
                key={game.id}
                href={`/games/${game.slug}`}
                className="group bg-slate-900 border border-slate-800 hover:border-rose-500/50 rounded-2xl p-4 transition duration-300 flex flex-col items-center text-center shadow-lg hover:shadow-rose-500/10"
              >
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden mb-3 bg-slate-800 shadow-inner group-hover:scale-105 transition duration-300">
                  <img
                    src={game.logoUrl}
                    alt={game.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-semibold text-base text-slate-100 group-hover:text-rose-400 transition">
                  {game.name}
                </h3>
                <span className="text-xs text-slate-400 mt-1">{game.publisher}</span>
                <span className="mt-3 text-xs bg-rose-500/10 text-rose-400 border border-rose-500/20 px-3 py-1 rounded-full group-hover:bg-rose-500 group-hover:text-white transition">
                  បញ្ចូលឥឡូវនេះ
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}