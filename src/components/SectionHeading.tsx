interface SectionHeadingProps {
  title: string;
  subtitle?: string;
}

const SectionHeading = ({ title, subtitle }: SectionHeadingProps) => (
  <div className="text-center mb-8 sm:mb-12">
    <h3 className="text-2xl sm:text-3xl font-bold text-primary inline-block relative pb-3">
      {title}
      <div className="absolute -bottom-1.5 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-transparent via-primary to-transparent"></div>
    </h3>
    {subtitle && (
      <p className="text-muted-foreground max-w-2xl mx-auto mt-4 leading-relaxed">{subtitle}</p>
    )}
  </div>
);

export default SectionHeading;