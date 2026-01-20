// styles.js
export const inputClass = `
  rounded-xl
  px-4 py-3
  text-sm font-mono
  text-[var(--text-primary)]
  placeholder:text-[var(--text-muted)]
  bg-gradient-to-b from-black/60 via-black/40 to-transparent
  backdrop-blur-md
  border border-[var(--border-default)]
  shadow-[inset_0_0_12px_rgba(0,0,0,0.6)]
  focus:outline-none focus:border-[var(--accent-terminal)]
  focus:ring-2 focus:ring-[var(--accent-terminal)]/30
  transition-all duration-200
`;

export const buttonClass = `
  px-6 py-3 rounded-xl font-medium font-jakarta
  bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-terminal)]
  text-[var(--text-primary)]
  shadow-[0_0_15px_rgba(31,194,16,0.45)]
  hover:brightness-110
  transition-all disabled:opacity-50
`;

export const labelClass = `text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider`;

export const cardClass = `
  w-full max-w-xl relative
  rounded-2xl p-8 flex flex-col
  bg-gradient-to-b from-[var(--bg-panel)] via-[var(--bg-panel)]/70 to-transparent
  backdrop-blur-xl
  border border-[var(--border-default)]
  shadow-[0_8px_30px_rgba(0,0,0,0.45)]
  transition-all duration-300
`;

export const leaderboardClass = `relative rounded-2xl p-4
    bg-gradient-to-b
    from-[var(--bg-panel)]
    via-[var(--bg-panel)]/70
    to-transparent
    backdrop-blur-xl
    border border-[var(--border-default)]
    shadow-[0_8px_30px_rgba(0,0,0,0.45)]`


export const attachmentClass = `backdrop-blur-md
    bg-white/5
    border border-white/15
    px-4 py-2
    rounded-lg
    text-sm text-[var(--text-primary)]
    font-inter
    hover:bg-white/10
    transition
    flex items-center gap-2`