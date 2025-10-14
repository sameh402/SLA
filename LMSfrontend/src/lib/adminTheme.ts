// Admin Theme Utilities for consistent dark mode support
export const adminTheme = {
  // Card backgrounds
  card: "bg-card/50 backdrop-blur-sm border border-border shadow-sm",
  cardSolid: "bg-card border border-border shadow-sm",
  
  // Input styling
  input: "bg-background border-border text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary",
  
  // Select styling  
  select: "bg-background border-border text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary",
  
  // Checkbox styling
  checkbox: "text-primary bg-background border-border rounded focus:ring-primary focus:ring-2",
  
  // Button variants
  button: {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    outline: "border-border bg-background hover:bg-accent hover:text-accent-foreground",
    ghost: "hover:bg-accent hover:text-accent-foreground",
  },
  
  // Text colors
  text: {
    primary: "text-foreground",
    secondary: "text-muted-foreground", 
    label: "text-foreground",
    muted: "text-muted-foreground",
  },
  
  // Table styling
  table: {
    header: "bg-muted/50",
    row: "border-b border-border hover:bg-muted/50",
    cell: "text-foreground",
  },
  
  // Status colors (these work well in both themes)
  status: {
    success: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    warning: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400", 
    error: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    info: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  }
};

// Utility function to combine classes
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
