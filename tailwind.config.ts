import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      animation: {
        "gradient-x": "gradient-x 15s ease infinite",
        float: "float 6s ease-in-out infinite",
        glow: "glow 2s ease-in-out infinite",
        shimmer: "shimmer 2s infinite",
        "bounce-in": "bounce-in 0.6s ease-out",
        "slide-in-up": "slide-in-up 0.8s ease-out",
        "slide-in-down": "slide-in-down 0.8s ease-out",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        ripple: "ripple 0.6s ease-out",
        "text-shimmer": "text-shimmer 3s linear infinite",
        "confetti-fall": "confetti-fall 3s linear infinite",
      },
      keyframes: {
        "gradient-x": {
          "0%, 100%": {
            "background-position": "0% 50%",
          },
          "50%": {
            "background-position": "100% 50%",
          },
        },
        float: {
          "0%, 100%": {
            transform: "translateY(0px)",
          },
          "50%": {
            transform: "translateY(-20px)",
          },
        },
        glow: {
          "0%, 100%": {
            "box-shadow": "0 0 20px rgba(139, 92, 246, 0.3)",
          },
          "50%": {
            "box-shadow": "0 0 40px rgba(139, 92, 246, 0.6)",
          },
        },
        shimmer: {
          "0%": {
            "background-position": "-200% 0",
          },
          "100%": {
            "background-position": "200% 0",
          },
        },
        "bounce-in": {
          "0%": {
            transform: "scale(0.3)",
            opacity: "0",
          },
          "50%": {
            transform: "scale(1.05)",
          },
          "70%": {
            transform: "scale(0.9)",
          },
          "100%": {
            transform: "scale(1)",
            opacity: "1",
          },
        },
        "slide-in-up": {
          "0%": {
            transform: "translateY(100px)",
            opacity: "0",
          },
          "100%": {
            transform: "translateY(0)",
            opacity: "1",
          },
        },
        "slide-in-down": {
          "0%": {
            transform: "translateY(-100px)",
            opacity: "0",
          },
          "100%": {
            transform: "translateY(0)",
            opacity: "1",
          },
        },
        "pulse-glow": {
          "0%, 100%": {
            "box-shadow": "0 0 20px rgba(139, 92, 246, 0.4)",
          },
          "50%": {
            "box-shadow": "0 0 60px rgba(139, 92, 246, 0.8)",
          },
        },
        ripple: {
          "0%": {
            transform: "scale(0)",
            opacity: "1",
          },
          "100%": {
            transform: "scale(4)",
            opacity: "0",
          },
        },
        "text-shimmer": {
          "0%": {
            "background-position": "-200% center",
          },
          "100%": {
            "background-position": "200% center",
          },
        },
        "confetti-fall": {
          "0%": {
            transform: "translateY(-100vh) rotate(0deg)",
            opacity: "1",
          },
          "100%": {
            transform: "translateY(100vh) rotate(360deg)",
            opacity: "0",
          },
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      backdropBlur: {
        xs: "2px",
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
};

export default config;
