"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRightIcon,
  CheckCircle2Icon,
  ClipboardListIcon,
  FileTextIcon,
  LogInIcon,
  SearchIcon,
  ShieldCheckIcon,
  UserPlusIcon,
} from "lucide-react";
import { VacancyList } from "@/components/vacancies/vacancy-list";
import { HomeSearch } from "@/components/shared/home-search";
import { Logo } from "@/components/shared/logo";
import { Footer } from "@/components/layout/footer";
import { ShortlistNoticeBoard } from "@/components/shared/shortlist-notice-board";
import { useTranslations } from "next-intl";

export default function Home() {
  const t = useTranslations("Home");

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary via-primary to-secondary text-primary-foreground py-20 md:py-32 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-8">
            {/* Left Side: Content & Search */}
            <div className="w-full lg:w-1/2 text-center lg:text-left space-y-8">
              {/* Government Badge */}
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium">
                <ShieldCheckIcon className="h-4 w-4" />
                {t("badge")}
              </div>

              <div className="flex flex-col items-center lg:items-start gap-6">
                <Logo
                  size="xl"
                  variant="icon"
                  className="drop-shadow-2xl"
                />
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]">
                  {t("title", {
                    highlight: t("publicService")
                  })}
                </h1>
              </div>

              <p className="text-lg md:text-xl text-primary-foreground/90 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                {t("subtitle")}
              </p>

              {/* Search Bar */}
              <div className="pt-4 flex justify-center lg:justify-start">
                <HomeSearch />
              </div>

              {/* Quick Links */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-4 pt-4">
                <Button size="lg" variant="secondary" className="shadow-lg" asChild>
                  <Link href="/vacancies">
                    {t("browseAll")} <ArrowRightIcon className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-transparent border-2 border-white/30 text-white hover:bg-white hover:text-primary shadow-lg"
                  asChild
                >
                  <Link href="/login">
                    {t("loginToApply")} <LogInIcon className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Right Side: Informative Notices */}
            <div className="w-full lg:w-1/2 flex justify-center lg:justify-end">
              <div className="w-full max-w-xl animate-in fade-in slide-in-from-right-8 duration-700">
                <ShortlistNoticeBoard />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("howItWorks.title")}</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {t("howItWorks.subtitle")}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Step 1 */}
            <div className="relative flex flex-col items-center text-center p-8 bg-background rounded-xl shadow-sm border">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm">
                1
              </div>
              <div className="p-4 bg-primary/10 rounded-full mb-4 mt-2">
                <UserPlusIcon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{t("howItWorks.step1.title")}</h3>
              <p className="text-muted-foreground">
                {t("howItWorks.step1.description")}
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative flex flex-col items-center text-center p-8 bg-background rounded-xl shadow-sm border">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm">
                2
              </div>
              <div className="p-4 bg-primary/10 rounded-full mb-4 mt-2">
                <SearchIcon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{t("howItWorks.step2.title")}</h3>
              <p className="text-muted-foreground">
                {t("howItWorks.step2.description")}
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative flex flex-col items-center text-center p-8 bg-background rounded-xl shadow-sm border">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm">
                3
              </div>
              <div className="p-4 bg-primary/10 rounded-full mb-4 mt-2">
                <ClipboardListIcon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{t("howItWorks.step3.title")}</h3>
              <p className="text-muted-foreground">
                {t("howItWorks.step3.description")}
              </p>
            </div>
          </div>
        </div>
      </section>



      {/* Featured Opportunities */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold">{t("featured.title")}</h2>
              <p className="text-muted-foreground mt-2">{t("featured.subtitle")}</p>
            </div>
            <Button variant="outline" size="lg" asChild>
              <Link href="/vacancies">
                {t("featured.viewAll")} <ArrowRightIcon className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <VacancyList filters={{ search: '', status: 'open' }} limit={9} />
        </div>
      </section>

      {/* Trust & Compliance Section */}
      <section className="py-12 md:py-16 border-t">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-primary/5 rounded-xl p-6 md:p-8 border border-primary/10">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 p-3 bg-primary/10 rounded-full">
                  <CheckCircle2Icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">{t("equalOpportunity.title")}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {t("equalOpportunity.description")}
                    <strong className="text-foreground"> {t("equalOpportunity.noFees")}</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
