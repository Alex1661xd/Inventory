import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> { }

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, ...props }, ref) => {
        return (
            <input
                type={type}
                className={cn(
                    "flex h-11 w-full rounded-lg border-2 border-[rgb(230,225,220)] bg-white/90 px-4 py-2.5 text-sm font-medium shadow-sm transition-all duration-300 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[rgb(160,155,150)] focus-visible:outline-none focus-visible:border-[rgb(25,35,25)] focus-visible:ring-2 focus-visible:ring-[rgb(45,65,45)]/20 focus-visible:ring-offset-0 focus-visible:shadow-md hover:border-[rgb(200,195,190)] disabled:cursor-not-allowed disabled:opacity-50",
                    className
                )}
                ref={ref}
                {...props}
            />
        )
    }
)
Input.displayName = "Input"

export { Input }
