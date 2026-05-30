import FeatureCard from "@/components/FeatureCard";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Show, SignInButton, SignUpButton } from "@clerk/nextjs";
import { MessageCircle, Users, Video, Shield, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 flex flex-col items-center px-4 py-16 sm:px-6 text-center gap-24 relative overflow-hidden">
        
        {/* Cozy Ambient Background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] -z-10 opacity-70 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-200 via-purple-100 to-pink-100 dark:from-indigo-900/30 dark:via-purple-900/20 dark:to-pink-900/20 rounded-[100px] blur-3xl transform scale-[1.2] -translate-y-20"></div>
        </div>

        {/* Hero Content Wrapper */}
        <div className="flex flex-col items-center text-center max-w-4xl w-full gap-8 relative z-10">
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="inline-block mb-4 px-4 py-1.5 rounded-full border border-primary/10 bg-primary/5 text-primary text-sm font-medium tracking-wide">
              ✨ Introducing the future of communication
            </div>
            <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-violet-600 to-pink-600 dark:from-blue-400 dark:via-violet-400 dark:to-pink-400 drop-shadow-sm pb-2">
              Connect instantly.
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-orange-500 dark:from-violet-400 dark:to-orange-400">
                Chat smarter.
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-medium">
              The modern messaging platform that combines lightning-fast chat
              and crystal-clear video calls in one seamless, cozy experience.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-150 fill-mode-both">
            <Show when="signed-out">
              <SignInButton mode="modal">
                <Button size="lg" className="text-lg px-8 py-7 h-auto rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl hover:shadow-primary/25 transition-all duration-300 hover:-translate-y-1">
                  Start Chatting Free
                </Button>
              </SignInButton>
            </Show>
          </div>

          {/* Social proof */}
          <div className="w-full">
            <p className="text-sm text-muted-foreground mb-4">
              Trusted by thousands of users worldwide
            </p>
            <div className="flex justify-center items-center gap-8 text-muted-foreground">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">50K+</div>
                <div className="text-sm">Active Users</div>
              </div>

              <div className="w-px h-8 bg-border"></div>

              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">1M+</div>
                <div className="text-sm">Messages Sent</div>
              </div>

              <div className="w-px h-8 bg-border"></div>

              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">99.9%</div>
                <div className="text-sm">Uptime</div>
              </div>
            </div>
          </div>
        </div>
          {/* Enhanced features section */}
          <div className="w-full max-w-6xl">
            {/* Section divider */}
            <div className="w-full flex items-center justify-center mb-16">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
              <div className="px-6">
                <div className="w-2 h-2 rounded-full bg-primary/60"></div>
              </div>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
            </div>
            <div className="text-center mb-16 relative z-10">
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-6 tracking-tight">
              Everything you need to stay connected
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed for seamless communication, whether
              you&apos;re chatting with friends or collaborating with teams.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-8 max-w-5xl mx-auto relative z-10">
              <FeatureCard
                icon={MessageCircle}
                title="Instant Messaging"
                description="Lightning-fast messages with real-time delivery. Chat with friends and colleagues seamlessly."
              />
              <FeatureCard
                icon={Video}
                title="HD Video Calls"
                description="Crystal-clear video calls with one click. Perfect quality for personal chats and team meetings."
              />
              <FeatureCard
                icon={Shield}
                title="Privacy First"
                description="End-to-end encryption keeps your conversations private. Your data belongs to you, always."
              />
              <FeatureCard
                icon={Users}
                title="Group Chats"
                description="Create groups with friends, family, or colleagues. Manage conversations with advanced controls."
              />
              <FeatureCard
                icon={Zap}
                title="Lightning Fast"
                description="Optimized for speed and performance. Works seamlessly across all your devices with instant sync."
              />
            </div>
          </div>
        {/* Enhanced CTA section */}
        <div className="w-full max-w-4xl relative z-10 mt-12 mb-8">
          <div className="rounded-3xl border border-primary/10 bg-white/40 dark:bg-black/40 backdrop-blur-xl shadow-2xl p-12 text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 tracking-tight">
              Ready to transform your conversations?
            </h2>
            <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
              Join thousands of users who&apos;ve already discovered a better
              way to communicate. Start your journey with Gossip today -
              it&apos;s completely free.
            </p>

            <div className="flex flex-col justify-center items-center gap-8 relative z-10">
              <Show when="signed-out">
                <SignUpButton mode="modal">
                  <Button size="lg" className="text-lg px-10 py-7 h-auto rounded-full shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:-translate-y-1">
                    Get Started Free
                  </Button>
                </SignUpButton>
              </Show>
              
              <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-4 text-sm font-medium text-muted-foreground">
                <div className="flex items-center gap-2 bg-background/50 px-4 py-2 rounded-full backdrop-blur-sm border">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  No credit card required
                </div>
                <div className="flex items-center gap-2 bg-background/50 px-4 py-2 rounded-full backdrop-blur-sm border">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  Free forever plan
                </div>
                <div className="flex items-center gap-2 bg-background/50 px-4 py-2 rounded-full backdrop-blur-sm border">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  Setup in 30 seconds
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <footer className="border-t bg-background/80 backdrop-blur-xl mt-auto relative z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
            <div className="text-center sm:text-left">
              <span className="text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">Gossip</span>
              <p className="text-sm text-muted-foreground mt-2 font-medium">
                The Future of Communication
              </p>
            </div>

            <div className="flex flex-wrap justify-center sm:justify-end items-center gap-8">
              <a
                href="#"
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                Terms of Service
              </a>
              <a
                href="#"
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                Support
              </a>
            </div>
          </div>

          <div className="border-t mt-8 pt-8 text-center flex flex-col items-center">
            <p className="text-sm text-muted-foreground/80 font-medium">
              © 2026 SuperDev. All Rights Reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
