"use client";

import { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRightIcon,
  ClipboardListIcon,
  LayoutDashboardIcon,
  LogInIcon,
  SearchIcon,
  ShieldCheckIcon,
  UserPlusIcon,
} from "lucide-react";
import { VacancyList } from "@/components/vacancies/vacancy-list";
import { HomeSearch } from "@/components/shared/home-search";
import { Logo } from "@/components/shared/logo";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { useTranslations } from "next-intl";
import { useAuthContext } from "@/providers";

export default function Home() {
  const t = useTranslations("Home");
  const { isAuthenticated, user } = useAuthContext();

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      
      {/* Hero Section - Modern & Fully Light/Dark Compatible */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden border-b bg-background">
        {/* Layered Background */}
        <div className="absolute inset-0 z-0">
          {/* Main Gradient */}
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-background to-secondary/5 dark:from-primary/20 dark:via-background dark:to-secondary/20" />
          
          {/* Pattern Overlay */}
          <div 
            className="absolute inset-0 opacity-[0.03] dark:opacity-[0.1] mix-blend-multiply dark:mix-blend-overlay"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} 
          />
          <div 
            className="absolute inset-0 opacity-[0.03] dark:opacity-[0.1] mix-blend-screen dark:mix-blend-overlay dark:invert"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} 
          />

          {/* Glowing Blobs */}
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 dark:bg-primary/20 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 dark:bg-secondary/20 rounded-full blur-[120px] animate-pulse delay-700" />
        </div>

        <div className="container mx-auto px-4 relative z-10 py-12">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto space-y-12">
            {/* Government Badge */}
            <div className="inline-flex items-center gap-2 bg-background/50 backdrop-blur-md rounded-full px-4 py-1.5 text-xs font-semibold border border-border shadow-sm">
              <ShieldCheckIcon className="h-3.5 w-3.5 text-primary" />
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {t("badge")}
              </span>
            </div>

            <div className="flex flex-col items-center gap-8 animate-in fade-in zoom-in-95 duration-1000 delay-200">
              <Logo
                size="xl"
                variant="icon"
                className="drop-shadow-2xl scale-110"
              />
              <div className="space-y-4">
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05] text-foreground">
                  {t("title", {
                    highlight: ""
                  })}
                  <span className="block bg-gradient-to-r from-primary via-primary to-secondary bg-clip-text text-transparent pb-2">
                    {t("publicService")}
                  </span>
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-medium">
                  {t("subtitle")}
                </p>
              </div>
            </div>

            {/* Search Bar & CTAs */}
            <div className="flex flex-col items-center gap-8 w-full animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
              <div className="w-full max-w-2xl group">
                <div className="relative p-1 bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/10 dark:from-primary/20 dark:via-primary/10 dark:to-secondary/20 rounded-2xl transition-all duration-300 group-hover:from-primary/30 group-hover:to-secondary/30">
                  <div className="bg-background rounded-[14px] shadow-lg">
                    <HomeSearch />
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-4">
                <Button size="lg" className="h-14 px-8 text-base font-semibold shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-95" asChild>
                  <Link href="/vacancies">
                    {t("browseAll")} <ArrowRightIcon className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                
                {isAuthenticated ? (
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-14 px-8 text-base font-semibold backdrop-blur-sm bg-background/50 hover:bg-background/80 transition-all active:scale-95 border-2"
                    asChild
                  >
                    <Link href={user?.role === 'admin' ? "/admin" : "/dashboard"}>
                      {t("goToDashboard")} <LayoutDashboardIcon className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-14 px-8 text-base font-semibold backdrop-blur-sm bg-background/50 hover:bg-background/80 transition-all active:scale-95 border-2"
                    asChild
                  >
                    <Link href="/login">
                      {t("loginToApply")} <LogInIcon className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section - Refined Cards */}
      <section className="py-24 md:py-32 relative overflow-hidden bg-muted/20 dark:bg-slate-900/10">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">{t("howItWorks.title")}</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-medium">
              {t("howItWorks.subtitle")}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Step 1 */}
            <div className="group relative p-8 bg-background dark:bg-slate-900/50 rounded-[2rem] shadow-sm border border-border/50 hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1">
              <div className="absolute top-6 right-8 text-5xl font-black text-primary/5 group-hover:text-primary/10 transition-colors">01</div>
              <div className="inline-flex p-4 bg-primary/10 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-500">
                <UserPlusIcon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">{t("howItWorks.step1.title")}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {t("howItWorks.step1.description")}
              </p>
            </div>

            {/* Step 2 */}
            <div className="group relative p-8 bg-background dark:bg-slate-900/50 rounded-[2rem] shadow-sm border border-border/50 hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1">
              <div className="absolute top-6 right-8 text-5xl font-black text-primary/5 group-hover:text-primary/10 transition-colors">02</div>
              <div className="inline-flex p-4 bg-primary/10 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-500">
                <SearchIcon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">{t("howItWorks.step2.title")}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {t("howItWorks.step2.description")}
              </p>
            </div>

            {/* Step 3 */}
            <div className="group relative p-8 bg-background dark:bg-slate-900/50 rounded-[2rem] shadow-sm border border-border/50 hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1">
              <div className="absolute top-6 right-8 text-5xl font-black text-primary/5 group-hover:text-primary/10 transition-colors">03</div>
              <div className="inline-flex p-4 bg-primary/10 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-500">
                <ClipboardListIcon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">{t("howItWorks.step3.title")}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {t("howItWorks.step3.description")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Opportunities - Grouped & Clean */}
      <section className="py-24 md:py-32 bg-background border-y border-border/40">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16">
            <div className="space-y-4">
              <div className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-wider">
                Opportunities
              </div>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight">{t("featured.title")}</h2>
              <p className="text-muted-foreground text-lg max-w-xl font-medium">{t("featured.subtitle")}</p>
            </div>
            <Button variant="outline" size="lg" className="rounded-full px-8 border-2" asChild>
              <Link href="/vacancies">
                {t("featured.viewAll")} <ArrowRightIcon className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <Suspense fallback={
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-72 w-full animate-pulse bg-muted rounded-[2.5rem]" />
              ))}
            </div>
          }>
            <div className="bg-slate-50/50 dark:bg-slate-900/20 p-8 rounded-[3rem] border border-border/50">
              <VacancyList filters={{ search: '', status: 'open' }} limit={9} />
            </div>
          </Suspense>
        </div>
      </section>

      <Footer />
    </div>
  );
}
