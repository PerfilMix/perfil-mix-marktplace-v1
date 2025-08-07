import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				'inter': ['Inter', 'system-ui', 'sans-serif'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
					button: 'hsl(var(--button-primary))',
					link: 'hsl(var(--link-primary))',
					highlight: 'hsl(var(--highlight-primary))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				filter: {
					background: 'hsl(var(--filter-background))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				// Enhanced Header Color
				header: {
					'bg': '#0f172a'  // Sophisticated slate dark
				},
				// Sophisticated Tech Colors - More Modern Palette
				tech: {
					'darker': '#0a0a0a',      // Deep black
					'card': '#1D1D1D',       // Dark gray updated
					'accent': '#2563eb',      // Royal blue
					'highlight': '#3b82f6',   // Bright blue
					'light': '#cbd5e1',       // Light gray
					'border': '#334155',      // Medium gray
					'success': '#10b981',     // Emerald green
					'warning': '#6366f1',     // Indigo (replacing amber/yellow)
					'danger': '#ef4444',      // Red
					'info': '#06b6d4'         // Cyan
				},
				// Keep existing TikTok colors for compatibility
				tiktok: {
					'primary': '#FE2C55',
					'secondary': '#25F4EE',
					'dark': '#121212',
					'card': '#1E1E1E',
					'accent': '#2D2D2D'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'fade-in': {
					'0%': {
						opacity: '0',
						transform: 'translateY(10px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'slide-up': {
					'0%': {
						opacity: '0',
						transform: 'translateY(20px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'glow': {
					'0%, 100%': {
						boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)'
					},
					'50%': {
						boxShadow: '0 0 40px rgba(59, 130, 246, 0.6)'
					}
				},
				'float': {
					'0%, 100%': {
						transform: 'translateY(0px)'
					},
					'50%': {
						transform: 'translateY(-10px)'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.5s ease-out',
				'slide-up': 'slide-up 0.3s ease-out',
				'glow': 'glow 2s ease-in-out infinite alternate',
				'float': 'float 6s ease-in-out infinite'
			},
			backdropBlur: {
				xs: '2px',
			},
			boxShadow: {
				'glow': '0 0 20px rgba(59, 130, 246, 0.3)',
				'glow-lg': '0 0 40px rgba(59, 130, 246, 0.4)',
				'glow-success': '0 0 20px rgba(16, 185, 129, 0.3)',
				'glow-info': '0 0 20px rgba(6, 182, 212, 0.3)',
				'glow-indigo': '0 0 20px rgba(99, 102, 241, 0.3)',
				'tech': '0 8px 32px rgba(59, 130, 246, 0.1)',
				'tech-lg': '0 20px 60px rgba(59, 130, 246, 0.2)',
				'elegant': '0 10px 30px -10px rgba(59, 130, 246, 0.3)',
				'sophisticated': '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(59, 130, 246, 0.05)',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
