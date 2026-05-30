import { LucideIcon } from "lucide-react";

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="group relative p-8 rounded-[2rem] border border-primary/10 bg-white/50 dark:bg-black/40 backdrop-blur-md hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 hover:-translate-y-2 w-full max-w-sm text-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <div className="relative z-10 w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-500 mx-auto shadow-sm group-hover:shadow-primary/20">
        <Icon className="w-8 h-8 text-primary drop-shadow-sm group-hover:drop-shadow-md transition-all duration-500" />
      </div>
      
      <h3 className="relative z-10 text-2xl font-bold mb-3 tracking-tight group-hover:text-primary transition-colors duration-500">{title}</h3>
      
      <p className="relative z-10 text-muted-foreground leading-relaxed font-medium">
        {description}
      </p>
    </div>
  );
}

export default FeatureCard;
