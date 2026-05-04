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

export default function Home() {
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
                Official County Government Portal
              </div>

              <div className="flex flex-col items-center lg:items-start gap-6">
                <Logo
                  size="xl"
                  variant="icon"
                  className="drop-shadow-2xl"
                />
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]">
                  Build Your Career in <span className="text-white/80">Public Service</span>
                </h1>
              </div>

              <p className="text-lg md:text-xl text-primary-foreground/90 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Join Meru County Government and make a meaningful impact in your community.
                Discover opportunities across health, education, agriculture, and more.
              </p>

              {/* Search Bar */}
              <div className="pt-4 flex justify-center lg:justify-start">
                <HomeSearch />
              </div>

              {/* Quick Links */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-4 pt-4">
                <Button size="lg" variant="secondary" className="shadow-lg" asChild>
                  <Link href="/vacancies">
                    Browse All Positions <ArrowRightIcon className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-transparent border-2 border-white/30 text-white hover:bg-white hover:text-primary shadow-lg"
                  asChild
                >
                  <Link href="/login">
                    Login to Apply <LogInIcon className="ml-2 h-4 w-4" />
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
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Getting started is easy. Follow these simple steps to apply for positions.
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
              <h3 className="text-xl font-semibold mb-2">Create Your Profile</h3>
              <p className="text-muted-foreground">
                Register for an account and complete your profile with your qualifications, experience, and documents.
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
              <h3 className="text-xl font-semibold mb-2">Browse Opportunities</h3>
              <p className="text-muted-foreground">
                Explore available positions across various departments and find roles that match your skills.
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
              <h3 className="text-xl font-semibold mb-2">Apply & Track</h3>
              <p className="text-muted-foreground">
                Submit your application online and track its status through your dashboard in real-time.
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
              <h2 className="text-3xl md:text-4xl font-bold">Featured Opportunities</h2>
              <p className="text-muted-foreground mt-2">Recently posted positions open for application</p>
            </div>
            <Button variant="outline" size="lg" asChild>
              <Link href="/vacancies">
                View All Positions <ArrowRightIcon className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <VacancyList filters={{ search: '' }} limit={9} />
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
                  <h3 className="text-lg font-semibold mb-2">Equal Opportunity Employer</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Meru County Public Service Board is an equal opportunity employer. We do not discriminate
                    on the basis of gender, disability, ethnicity, or religion. Qualified candidates, including
                    persons with disabilities and those from marginalized communities, are encouraged to apply.
                    <strong className="text-foreground"> No fees are charged for job applications.</strong>
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
