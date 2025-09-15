import { ReactNode, useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingWrapperProps {
  isLoading: boolean;
  fallback?: ReactNode;
  children: ReactNode;
  className?: string;
  delay?: number; // Delay before showing loader
}

export const LoadingWrapper = ({
  isLoading,
  fallback,
  children,
  className,
  delay = 200,
}: LoadingWrapperProps) => {
  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isLoading) {
      timer = setTimeout(() => {
        setShowLoader(true);
      }, delay);
    } else {
      setShowLoader(false);
    }

    return () => {
      clearTimeout(timer);
    };
  }, [isLoading, delay]);

  if (isLoading && showLoader) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center min-h-[200px] space-y-4",
          className
        )}
      >
        {fallback || (
          <>
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground animate-pulse">
              Loading...
            </p>
          </>
        )}
      </div>
    );
  }

  return <>{children}</>;
};

// Specialized loading components
export const ButtonLoader = ({
  isLoading,
  children,
  loadingText = "Loading...",
  className,
}: {
  isLoading: boolean;
  children: ReactNode;
  loadingText?: string;
  className?: string;
}) => {
  if (isLoading) {
    return (
      <div className={cn("flex items-center", className)}>
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        {loadingText}
      </div>
    );
  }
  return <>{children}</>;
};

export const PageTransition = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={cn(
        "transition-all duration-500 ease-out",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
        className
      )}
    >
      {children}
    </div>
  );
};

export const FadeIn = ({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={cn(
        "transition-all duration-700 ease-out",
        isVisible ? "opacity-100" : "opacity-0",
        className
      )}
    >
      {children}
    </div>
  );
};

export const SlideIn = ({
  children,
  direction = "bottom",
  delay = 0,
  className,
}: {
  children: ReactNode;
  direction?: "top" | "bottom" | "left" | "right";
  delay?: number;
  className?: string;
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const getTransform = () => {
    if (isVisible) return "translate-x-0 translate-y-0";

    switch (direction) {
      case "top":
        return "translate-y-[-20px]";
      case "bottom":
        return "translate-y-[20px]";
      case "left":
        return "translate-x-[-20px]";
      case "right":
        return "translate-x-[20px]";
      default:
        return "translate-y-[20px]";
    }
  };

  return (
    <div
      className={cn(
        "transition-all duration-500 ease-out",
        isVisible ? "opacity-100" : "opacity-0",
        getTransform(),
        className
      )}
    >
      {children}
    </div>
  );
};

// Search loading state
export const SearchLoader = () => (
  <div className="flex items-center justify-center py-8 space-x-2">
    <Loader2 className="h-5 w-5 animate-spin text-primary" />
    <span className="text-sm text-muted-foreground">Searching vehicles...</span>
  </div>
);

// Filter loading state
export const FilterLoader = () => (
  <div className="flex items-center space-x-2 px-3 py-2 text-sm text-muted-foreground">
    <Loader2 className="h-4 w-4 animate-spin" />
    <span>Applying filters...</span>
  </div>
);
