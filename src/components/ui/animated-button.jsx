import { cn } from "@/lib/utils";

export const AnimatedButton = ({ 
  children, 
  onClick, 
  className,
  href,
  animationColor = "bg-purple-600",
  baseBg = "bg-white",
  baseText = "text-black",
  hoverTextColor = "group-hover:text-white",
  ...props 
}) => {
  const Component = href ? "a" : "button";
  
  return (
    <Component
      href={href}
      onClick={onClick}
      className={cn(
        "relative inline-flex items-center justify-center px-6 py-2 overflow-hidden font-medium transition-all rounded group outline outline-1",
        baseBg,
        baseText,
        className
      )}
      {...props}
    >
      <span className={cn(
        "w-48 h-48 rounded rotate-[-40deg] absolute bottom-0 left-0 -translate-x-full ease-out duration-500 transition-all translate-y-full mb-9 ml-9 group-hover:ml-0 group-hover:mb-32 group-hover:translate-x-0",
        animationColor
      )}></span>
      <span className={cn(
        "relative w-full text-center transition-colors duration-300 ease-in-out flex items-center justify-center",
        baseText,
        hoverTextColor
      )}>
        {children}
      </span>
    </Component>
  );
};

