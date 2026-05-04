import { FileTextIcon, DownloadIcon, BellIcon, ClockIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const SHORTLISTS = [
  {
    title: "General Shortlist & Interview Schedule",
    subtitle: "Notice for various open positions",
    filename: "shortlist-general.pdf",
    color: "bg-blue-500",
    isNew: true,
  },
  {
    title: "Promotion Interview Schedule",
    subtitle: "Results for internal promotion ads",
    filename: "shortlist-promotion.pdf",
    color: "bg-amber-500",
    isNew: true,
  },
  {
    title: "Internal Advert-1: Shortlist",
    subtitle: "Internal advertisement recruitment results",
    filename: "shortlist-internal-advertisement.pdf",
    color: "bg-emerald-500",
    isNew: true,
  },
];

export function ShortlistNoticeBoard() {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {/* Informative Header */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <BellIcon className="h-4 w-4 text-white/60" />
          <h2 className="text-sm font-medium text-white/80 uppercase tracking-wider">Latest Recruitment Notices</h2>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-white/40">
          <ClockIcon className="h-3 w-3" />
          <span>Updated Mar 20, 2026</span>
        </div>
      </div>

      {/* List Layout - More Informative but sleek */}
      <div className="grid grid-cols-1 gap-3">
        {SHORTLISTS.map((item) => (
          <a
            key={item.filename}
            href={`/downloads/${item.filename}`}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "group relative flex items-center gap-4 p-4 rounded-2xl transition-all duration-300",
              "bg-white/5 backdrop-blur-md border border-white/10 hover:border-white/30 hover:bg-white/10",
              "shadow-lg hover:shadow-primary/5"
            )}
          >
            {/* Visual Indicator */}
            <div className={cn("flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center", "bg-white/10 group-hover:bg-white transition-colors duration-300")}>
              <FileTextIcon className={cn("h-6 w-6 text-white group-hover:text-primary transition-colors")} />
            </div>

            {/* Content */}
            <div className="flex-grow min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-white truncate text-base md:text-lg">
                  {item.title}
                </h3>
                {item.isNew && (
                  <Badge variant="secondary" className="bg-primary/20 text-primary-foreground text-[10px] h-4 px-1.5 border-none animate-pulse">
                    NEW
                  </Badge>
                )}
              </div>
              <p className="text-primary-foreground/60 text-sm truncate">
                {item.subtitle}
              </p>
            </div>

            {/* Download Action */}
            <div className="flex-shrink-0 flex flex-col items-end gap-2 px-2">
              <div className="p-2 rounded-full bg-white/5 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                <DownloadIcon className="h-5 w-5" />
              </div>
              <span className="text-[10px] text-white/30 group-hover:text-white/60 transition-colors hidden sm:block">PDF Document</span>
            </div>

            {/* Subtle Progress-like accent */}
            <div className={cn("absolute bottom-0 left-4 right-4 h-[1px] rounded-full opacity-30 group-hover:opacity-100 transition-opacity", item.color)} />
          </a>
        ))}
      </div>
      
      <div className="px-2 pt-2 text-center">
        <p className="text-xs text-white/40 leading-relaxed">
          Candidates appearing for interviews should carry original documents and certificates. 
          For any inquiries, please visit the County Public Service Board offices.
        </p>
      </div>
    </div>
  );
}
