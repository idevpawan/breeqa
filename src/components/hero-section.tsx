import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-background">
      <div className="container mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <div className="inline-flex items-center text-black dark:text-white rounded-full border px-3 py-1 text-sm bg-accent/10 ">
                <span className="w-2 h-2 bg-chart-1 rounded-full mr-2"></span>
                Trusted by 10,000+ companies worldwide
              </div>

              <h1 className="text-4xl lg:text-6xl font-bold text-foreground leading-tight">
                Streamline Your
                <span className="text-primary block">Project Management</span>
                Like Never Before
              </h1>

              <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">
                BREEQA empowers teams to collaborate efficiently, track progress
                in real-time, and deliver projects on time. Built for modern
                companies that value productivity and results.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="text-lg px-8 py-6">
                Start Free Trial
                <svg
                  className="ml-2 w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                Watch Demo
                <svg
                  className="ml-2 w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m-5-8V6a2 2 0 012-2h2a2 2 0 012 2v2"
                  />
                </svg>
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center space-x-8 pt-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-chart-1">99.9%</div>
                <div className="text-sm text-muted-foreground">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-chart-2">50%</div>
                <div className="text-sm text-muted-foreground">
                  Faster Delivery
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-chart-3">24/7</div>
                <div className="text-sm text-muted-foreground">Support</div>
              </div>
            </div>
          </div>

          {/* Right Column - Visual */}
          <div className="relative">
            {/* Dashboard Preview */}
            <div className="relative bg-card rounded-3xl shadow-2xl border overflow-hidden transform hover:scale-105 transition-transform duration-300">
              {/* Browser Header */}
              <div className="bg-muted/30 px-6 py-4 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-chart-4 rounded-full"></div>
                      <div className="w-3 h-3 bg-chart-3 rounded-full"></div>
                      <div className="w-3 h-3 bg-chart-1 rounded-full"></div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-primary rounded-lg flex items-center justify-center">
                        <span className="text-primary-foreground font-bold text-xs">
                          B
                        </span>
                      </div>
                      <span className="text-sm font-medium text-foreground">
                        BREEQA Dashboard
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-chart-1 rounded-full animate-pulse"></div>
                    <span className="text-xs text-muted-foreground">Live</span>
                  </div>
                </div>
              </div>

              <div className="p-8 space-y-8">
                {/* Header Stats */}
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-semibold text-foreground">
                    Project Overview
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Real-time project status and progress
                  </p>
                </div>

                {/* Project Stats Grid */}
                <div className="grid grid-cols-3 gap-6">
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 bg-chart-1/10 rounded-xl flex items-center justify-center mx-auto">
                      <div className="w-6 h-6 bg-chart-1 rounded-lg"></div>
                    </div>
                    <div className="text-2xl font-bold text-chart-1">12</div>
                    <div className="text-xs text-muted-foreground font-medium">
                      Completed
                    </div>
                  </div>
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 bg-chart-2/10 rounded-xl flex items-center justify-center mx-auto">
                      <div className="w-6 h-6 bg-chart-2 rounded-lg"></div>
                    </div>
                    <div className="text-2xl font-bold text-chart-2">8</div>
                    <div className="text-xs text-muted-foreground font-medium">
                      In Progress
                    </div>
                  </div>
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 bg-chart-3/10 rounded-xl flex items-center justify-center mx-auto">
                      <div className="w-6 h-6 bg-chart-3 rounded-lg"></div>
                    </div>
                    <div className="text-2xl font-bold text-chart-3">3</div>
                    <div className="text-xs text-muted-foreground font-medium">
                      Pending
                    </div>
                  </div>
                </div>

                {/* Active Projects */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-foreground">
                    Active Projects
                  </h4>
                </div>

                {/* Recent Activity */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-foreground">
                    Recent Activity
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-chart-2 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        A
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-foreground">
                          Alex completed "Design Review"
                        </p>
                        <p className="text-xs text-muted-foreground">
                          2 minutes ago
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-chart-1 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        S
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-foreground">
                          Sarah updated project timeline
                        </p>
                        <p className="text-xs text-muted-foreground">
                          15 minutes ago
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-chart-3 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        M
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-foreground">
                          Mike added new task
                        </p>
                        <p className="text-xs text-muted-foreground">
                          1 hour ago
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-chart-1/10 rounded-full blur-2xl animate-pulse"></div>
            <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-chart-2/10 rounded-full blur-2xl animate-pulse"></div>
            <div className="absolute top-1/2 -right-8 w-16 h-16 bg-chart-3/10 rounded-full blur-xl"></div>
          </div>
        </div>
      </div>

      {/* Background Pattern */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-br from-primary/5 to-accent/5 rounded-full blur-3xl"></div>
      </div>
    </section>
  );
}
