const Badge = ({
    variant = "light",
    color = "primary",
    size = "md",
    startIcon,
    endIcon,
    children,
  }) => {
    const sizeClass = size === "sm" ? "text-xs" : "text-sm";
    
    const colorClasses = {
      light: {
        primary: "bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400",
        success: "bg-green-50 text-green-600 dark:bg-green-500/15 dark:text-green-500",
        error: "bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-500",
        warning: "bg-yellow-50 text-yellow-600 dark:bg-yellow-500/15 dark:text-orange-400",
        info: "bg-cyan-50 text-cyan-600 dark:bg-cyan-500/15 dark:text-cyan-500",
        light: "bg-gray-100 text-gray-700 dark:bg-white/5 dark:text-white/80",
        dark: "bg-gray-500 text-white dark:bg-white/5 dark:text-white",
      },
      solid: {
        primary: "bg-blue-500 text-white",
        success: "bg-green-500 text-white",
        error: "bg-red-500 text-white",
        warning: "bg-yellow-500 text-white",
        info: "bg-cyan-500 text-white",
        light: "bg-gray-400 text-white",
        dark: "bg-gray-700 text-white",
      },
    };
  
    const classes = `inline-flex items-center px-2.5 py-0.5 justify-center gap-1 rounded-full font-medium ${sizeClass} ${colorClasses[variant][color]}`;
  
    return (
      <span className={classes}>
        {startIcon && <span className="mr-1">{startIcon}</span>}
        {children}
        {endIcon && <span className="ml-1">{endIcon}</span>}
      </span>
    );
  };
  
  export default Badge;