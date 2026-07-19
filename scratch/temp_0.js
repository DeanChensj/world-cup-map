
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: {
            sans: ['Geist', 'sans-serif'],
            mono: ['Geist Mono', 'monospace'],
          },
          colors: {
            console: {
              bg: 'var(--bg)',
              panel: 'var(--panel)',
              border: 'var(--border)',
              text: 'var(--text)',
              accent: 'var(--accent)',
              accentHover: '#00cc55',
              dimText: 'var(--dim-text)',
              red: '#ff5555'
            }
          }
        }
      }
    }
  