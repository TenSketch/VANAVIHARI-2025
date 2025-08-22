import { Home, ChevronRight } from "lucide-react";

interface BreadcrumbProps {
  items: string[];
  className?: string;
  showHome?: boolean;
}

const Breadcrumb = ({ items, className = "", showHome = true }: BreadcrumbProps) => {
  return (
    <nav className={`flex items-center space-x-2 text-sm ${className}`}>
      {showHome && (
        <>
          <Home className="h-4 w-4 text-black" />
          {items.length > 0 && <ChevronRight className="h-4 w-4 text-gray-400" />}
        </>
      )}
      
      {items.map((item, index) => (
        <div key={index} className="flex items-center space-x-2">
          {index > 0 && <ChevronRight className="h-4 w-4 text-gray-400" />}
          <span 
            className={
              index === items.length - 1 
                ? "text-black font-medium" 
                : "text-gray-600 hover:text-gray-800 cursor-pointer"
            }
          >
            {item}
          </span>
        </div>
      ))}
    </nav>
  );
};

export default Breadcrumb;
