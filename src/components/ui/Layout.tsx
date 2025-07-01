import React, { useState, useEffect } from "react";
import ParticleBackground from "./ParticleBackground";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 animate-gradient-x"></div>

      {/* Secondary gradient overlay */}
      <div className="fixed inset-0 bg-gradient-to-tr from-pink-500/20 via-purple-500/20 to-cyan-500/20 animate-pulse"></div>

      {/* Particle background */}
      <ParticleBackground />

      {/* Mouse follower effect */}
      <div
        className="fixed w-96 h-96 rounded-full pointer-events-none z-10 transition-all duration-1000 ease-out"
        style={{
          background: `radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, rgba(139, 92, 246, 0.05) 50%, transparent 70%)`,
          left: mousePosition.x - 192,
          top: mousePosition.y - 192,
        }}
      />

      {/* Main content */}
      <main className="relative z-20 min-h-screen flex flex-col">
        <div className="flex-1 flex items-center justify-center p-4 w-full">
          <div className="w-full max-w-6xl mx-auto">{children}</div>
        </div>

        {/* Enhanced footer */}
        <footer className="relative z-30 text-white/80 text-center py-6 px-4">
          <div className="backdrop-blur-md bg-black/20 rounded-full py-3 px-6 inline-block border border-white/10">
            <div className="flex items-center justify-center space-x-2">
              <span className="text-pink-400">Made with</span>
              <div className="relative">
                <span className="text-red-500 animate-pulse">❤️</span>
                <div className="absolute inset-0 animate-ping">
                  <span className="text-red-500/50">❤️</span>
                </div>
              </div>
              <span className="text-pink-400">by</span>
              <a
                href="https://github.com/Abhigyan-GG"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-300 hover:text-purple-100 transition-colors duration-300 font-semibold hover:scale-105 transform inline-block"
              >
                Abhigyan
              </a>
            </div>
          </div>
        </footer>
      </main>

      {/* Additional animated elements */}
      <div className="fixed top-10 left-10 w-2 h-2 bg-purple-400 rounded-full animate-ping"></div>
      <div className="fixed top-20 right-20 w-1 h-1 bg-cyan-400 rounded-full animate-pulse"></div>
      <div className="fixed bottom-32 left-1/4 w-1.5 h-1.5 bg-pink-400 rounded-full animate-bounce"></div>
      <div className="fixed bottom-40 right-1/3 w-1 h-1 bg-yellow-400 rounded-full animate-ping"></div>
    </div>
  );
};

export default Layout;
