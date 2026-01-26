import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95",
    {
        variants: {
            variant: {
                default: "bg-gradient-to-r from-[rgb(25,35,25)] to-[rgb(45,65,45)] text-white shadow-lg hover:shadow-xl hover:scale-105 focus-visible:ring-[rgb(45,65,45)]",
                destructive:
                    "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg hover:shadow-xl hover:scale-105 focus-visible:ring-red-500",
                outline:
                    "border-2 border-[rgb(25,35,25)] bg-transparent text-[rgb(25,35,25)] hover:bg-[rgb(25,35,25)] hover:text-white shadow-md hover:shadow-lg",
                secondary:
                    "bg-gradient-to-r from-[rgb(180,100,50)] to-[rgb(160,90,40)] text-white shadow-lg hover:shadow-xl hover:scale-105 focus-visible:ring-[rgb(180,100,50)]",
                ghost: "hover:bg-[rgb(250,248,245)] hover:text-[rgb(25,35,25)] hover:shadow-md",
                link: "text-[rgb(25,35,25)] underline-offset-4 hover:underline hover:text-[rgb(45,65,45)]",
            },
            size: {
                default: "h-11 px-6 py-2.5",
                sm: "h-9 rounded-md px-4 text-xs",
                lg: "h-12 rounded-lg px-10 text-base",
                icon: "h-11 w-11",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button"
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button, buttonVariants }
