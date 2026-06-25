import { motion } from 'framer-motion'
import {
  Activity,
  BookOpen,
  Briefcase,
  ChevronRight,
  Circle,
  Sparkles,
} from 'lucide-react'

const panelVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: (index) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      delay: index * 0.12,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
}

const SCHEDULE = [
  {
    id: 'quest-1',
    time: '08:00',
    title: 'Morning sync — review overnight alerts',
    tag: 'MAIN',
  },
  {
    id: 'quest-2',
    time: '12:30',
    title: 'Log water intake checkpoint',
    tag: 'SIDE',
  },
  {
    id: 'quest-3',
    time: '18:00',
    title: 'Watch new anime episode drop',
    tag: 'EVENT',
  },
  {
    id: 'quest-4',
    time: '21:00',
    title: 'Journal debrief before shutdown',
    tag: 'SIDE',
  },
]

const QUICK_LINKS = [
  {
    id: 'tracker',
    label: 'Tracker',
    description: 'Water & habits',
    icon: Activity,
    page: 'tracker',
  },
  {
    id: 'journal',
    label: 'Journal',
    description: 'Notes & stickers',
    icon: BookOpen,
    page: 'journal',
  },
  {
    id: 'pro',
    label: 'Pro Dashboard',
    description: 'LinkedIn & LeetCode',
    icon: Briefcase,
    page: 'pro',
  },
]

function Dashboard({ onNavigate }) {
  return (
    <section className="min-h-[calc(100dvh-4.5rem)] overflow-y-auto bg-black text-left text-zinc-100">
      <div className="mx-auto w-full max-w-2xl px-4 py-8 pb-16 sm:px-6">
        {/* Header strip */}
        <motion.header
          custom={0}
          initial="hidden"
          animate="visible"
          variants={panelVariants}
          className="mb-8 border-b border-white/10 pb-6"
        >
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.45em] text-red-400/80">
            Episode 01 · System Online
          </p>
          <h1 className="text-3xl font-black uppercase tracking-tight text-white sm:text-4xl">
            Command Center
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Scroll the panels. Complete the day&apos;s arc.
          </p>
        </motion.header>

        <div className="flex flex-col gap-5">
          {/* Daily Reminders — character + dialogue bubble */}
          <motion.article
            custom={1}
            initial="hidden"
            animate="visible"
            variants={panelVariants}
            className="overflow-hidden border border-white/10 bg-white/[0.04] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md"
          >
            <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
              <Sparkles className="size-4 text-purple-400" strokeWidth={2.5} />
              <h2 className="text-xs font-black uppercase tracking-[0.35em] text-zinc-300">
                Daily Reminders
              </h2>
            </div>

            <div className="flex flex-col items-stretch gap-6 p-5 sm:flex-row sm:items-center">
              {/* Anime character silhouette */}
              <div className="flex shrink-0 justify-center sm:w-36">
                <div
                  aria-hidden
                  className="relative flex h-40 w-32 items-end justify-center overflow-hidden border border-purple-500/30 bg-gradient-to-b from-purple-950/60 via-black to-black shadow-[0_0_40px_rgba(147,51,234,0.15)]"
                >
                  <div className="absolute inset-x-4 top-5 h-16 rounded-full bg-gradient-to-b from-zinc-600 to-zinc-800 shadow-inner" />
                  <div className="absolute inset-x-2 bottom-0 h-24 rounded-t-[40%] bg-gradient-to-b from-zinc-700 to-zinc-900" />
                  <div className="absolute left-1/2 top-[4.5rem] h-2 w-8 -translate-x-1/2 rounded-full bg-red-500/80 blur-[1px]" />
                  <div className="absolute bottom-3 left-1/2 h-1 w-10 -translate-x-1/2 bg-purple-500/50" />
                </div>
              </div>

              {/* Speech bubble */}
              <div className="relative min-w-0 flex-1">
                <div className="relative rounded-xl border border-white/15 bg-white/[0.06] px-5 py-4 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-sm sm:ml-2">
                  <div
                    aria-hidden
                    className="absolute -left-2 top-1/2 hidden h-0 w-0 -translate-y-1/2 border-y-[10px] border-r-[12px] border-y-transparent border-r-white/[0.06] sm:block"
                  />
                  <div
                    aria-hidden
                    className="absolute -left-[9px] top-1/2 hidden h-0 w-0 -translate-y-1/2 border-y-[10px] border-r-[12px] border-y-transparent border-r-white/15 sm:block"
                    style={{ marginLeft: '-1px' }}
                  />
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.3em] text-red-400/90">
                    Operator
                  </p>
                  <p className="text-sm font-medium leading-relaxed text-zinc-200 sm:text-base">
                    System initialized. Clear your daily objectives, or face the
                    penalty.
                  </p>
                  <p className="mt-3 text-xs leading-relaxed text-zinc-500">
                    Three quests remain on today&apos;s board. Hydration log is
                    overdue — don&apos;t make me repeat myself.
                  </p>
                </div>
              </div>
            </div>
          </motion.article>

          {/* Today's Schedule — quest log */}
          <motion.article
            custom={2}
            initial="hidden"
            animate="visible"
            variants={panelVariants}
            className="overflow-hidden border border-white/10 bg-white/[0.04] backdrop-blur-md"
          >
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <h2 className="text-xs font-black uppercase tracking-[0.35em] text-zinc-300">
                Today&apos;s Schedule
              </h2>
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">
                Quest Log
              </span>
            </div>

            <ul className="divide-y divide-white/[0.06]">
              {SCHEDULE.map((item, index) => (
                <motion.li
                  key={item.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: 0.35 + index * 0.08,
                    duration: 0.4,
                    ease: 'easeOut',
                  }}
                  className="group flex items-start gap-4 px-4 py-4 transition-colors hover:bg-white/[0.03]"
                >
                  <div className="flex shrink-0 flex-col items-center pt-0.5">
                    <Circle
                      className="size-3 fill-red-500/20 text-red-500/60"
                      strokeWidth={2}
                    />
                    {index < SCHEDULE.length - 1 && (
                      <div className="mt-1 h-full min-h-6 w-px bg-gradient-to-b from-white/20 to-transparent" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[11px] font-bold text-purple-400/90">
                        {item.time}
                      </span>
                      <span className="rounded border border-white/10 bg-black/40 px-1.5 py-0.5 text-[9px] font-black tracking-widest text-zinc-500">
                        {item.tag}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-zinc-200 group-hover:text-white">
                      {item.title}
                    </p>
                  </div>

                  <ChevronRight className="mt-1 size-4 shrink-0 text-zinc-700 transition-colors group-hover:text-zinc-400" />
                </motion.li>
              ))}
            </ul>
          </motion.article>

          {/* Quick Access */}
          <motion.section
            custom={3}
            initial="hidden"
            animate="visible"
            variants={panelVariants}
            className="overflow-hidden border border-white/10 bg-white/[0.04] backdrop-blur-md"
          >
            <div className="border-b border-white/10 px-4 py-3">
              <h2 className="text-xs font-black uppercase tracking-[0.35em] text-zinc-300">
                Quick Access
              </h2>
            </div>

            <div className="grid gap-3 p-4 sm:grid-cols-3">
              {QUICK_LINKS.map((link, index) => {
                const Icon = link.icon

                return (
                  <motion.button
                    key={link.id}
                    type="button"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.1, duration: 0.4 }}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onNavigate?.(link.page)}
                    className="group flex flex-col items-start gap-3 border border-white/10 bg-black/50 px-4 py-4 text-left transition-all hover:border-purple-500/40 hover:bg-white/[0.04] hover:shadow-[0_0_24px_rgba(147,51,234,0.12)]"
                  >
                    <div className="flex w-full items-center justify-between">
                      <Icon
                        className="size-5 text-red-400/90 transition-colors group-hover:text-purple-400"
                        strokeWidth={2}
                      />
                      <ChevronRight className="size-4 text-zinc-700 group-hover:text-zinc-400" />
                    </div>
                    <div>
                      <p className="text-sm font-bold uppercase tracking-wide text-zinc-200">
                        {link.label}
                      </p>
                      <p className="mt-0.5 text-[11px] text-zinc-600">
                        {link.description}
                      </p>
                    </div>
                  </motion.button>
                )
              })}
            </div>
          </motion.section>
        </div>
      </div>
    </section>
  )
}

export default Dashboard
