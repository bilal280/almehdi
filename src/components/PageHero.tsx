import type { LucideIcon } from "lucide-react";

interface PageHeroProps {
  badge?: string;
  title: string;
  highlight?: string;
  subtitle: string;
  icon?: LucideIcon;
}

const PageHero = ({ badge, title, highlight, subtitle, icon: Icon }: PageHeroProps) => {
  return (
    <section className="relative pt-32 pb-14 sm:pt-40 sm:pb-20 text-center overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[520px] h-[320px] bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10 fade-in-up">
        {badge && (
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-5 border border-primary/20">
            {Icon && <Icon className="w-4 h-4" />}
            {badge}
          </span>
        )}

        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
          <span className="bg-gradient-to-r from-primary via-primary-light to-primary bg-clip-text text-transparent animate-gradient">
            {title}
          </span>
          {highlight && (
            <>
              {" "}
              <span className="bg-gradient-to-r from-secondary-dark via-secondary to-secondary-dark bg-clip-text text-transparent animate-gradient">
                {highlight}
              </span>
            </>
          )}
        </h1>

        <div className="w-24 h-1 mx-auto mb-5 bg-gradient-to-r from-transparent via-primary to-transparent"></div>

        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          {subtitle}
        </p>
      </div>
    </section>
  );
};

export default PageHero;