import { type VariantProps, cva } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const inputVariants = cva(
	"flex w-full rounded-md border border-input bg-background ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
	{
		variants: {
			size: {
				default: "h-10 px-3 py-2 text-base md:text-sm",
				sm: "h-9 px-3 py-1 text-xs",
				lg: "h-12 px-4 py-3 text-lg",
			},
		},
		defaultVariants: {
			size: "default",
		},
	},
);

export interface InputProps
	extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
		VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
	({ className, type, size, ...props }, ref) => {
		return (
			<input type={type} className={cn(inputVariants({ size, className }))} ref={ref} {...props} />
		);
	},
);
Input.displayName = "Input";

export { Input };
