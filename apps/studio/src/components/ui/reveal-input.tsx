"use client";

import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";
import clsx from "clsx";
import { Eye, EyeOff } from "lucide-react";
import {
	Children,
	type ComponentProps,
	type HTMLAttributes,
	type InputHTMLAttributes,
	type MouseEvent,
	type MouseEventHandler,
	type ReactNode,
	cloneElement,
	createContext,
	forwardRef,
	isValidElement,
	useContext,
	useEffect,
	useId,
	useState,
} from "react";

interface RevealInputContextValue {
	revealed: boolean;
	setRevealed: (value: boolean) => void;
	generatedId: string;
	// Track the actual ID being used (either from props or generated)
	inputId: string | undefined;
	setInputId: (id: string) => void;
}

const RevealInputContext = createContext<RevealInputContextValue | undefined>(undefined);

function useRevealInputContext() {
	const context = useContext(RevealInputContext);
	if (!context) {
		throw new Error("RevealInput compound components must be used within RevealInput.Root");
	}
	return context;
}

interface RootProps {
	children: ReactNode;
	defaultRevealed?: boolean;
}

const Root = forwardRef<
	HTMLFieldSetElement,
	Omit<HTMLAttributes<HTMLFieldSetElement>, keyof RootProps> & RootProps
>(({ children, defaultRevealed = false, className, ...props }, ref) => {
	const [revealed, setRevealed] = useState(defaultRevealed);
	const generatedId = useId();
	const [inputId, setInputId] = useState<string | undefined>(undefined);

	return (
		<RevealInputContext.Provider
			value={{ revealed, setRevealed, generatedId, inputId, setInputId }}
		>
			<fieldset
				ref={ref}
				className={cn("flex items-center gap-1 border-0 m-0 p-0", className)}
				aria-label="Password input with reveal button"
				{...props}
			>
				{children}
			</fieldset>
		</RevealInputContext.Provider>
	);
});
Root.displayName = "RevealInput.Root";

interface InputProps {
	children: ReactNode;
	asChild?: boolean;
}

interface InputElementProps extends InputHTMLAttributes<HTMLInputElement> {
	required?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({ children, asChild = false }, ref) => {
	const { revealed, generatedId, setInputId } = useRevealInputContext();
	const Comp = asChild ? Slot : "input";

	const child = Children.only(children);
	const childId = isValidElement<InputElementProps>(child) ? child.props?.id : undefined;
	const finalId = childId || generatedId;

	useEffect(() => {
		setInputId(finalId);
	}, [finalId, setInputId]);

	const modifiedChild = isValidElement<InputElementProps>(child)
		? cloneElement(child, {
				type: revealed ? "text" : "password",
				ref,
				id: finalId,
				"aria-label": "Password input field",
				role: "textbox",
				"aria-multiline": "false",
				"aria-required": child.props?.required || false,
				className: cn("flex-1 min-w-0", child.props?.className),
			} as InputHTMLAttributes<HTMLInputElement>)
		: child;

	return <Comp>{modifiedChild}</Comp>;
});
Input.displayName = "RevealInput.Input";

interface RevealProps {
	children: ReactNode;
	asChild?: boolean;
}

const Reveal = forwardRef<HTMLButtonElement, RevealProps>(({ children, asChild = false }, ref) => {
	const { revealed, setRevealed, inputId } = useRevealInputContext();
	const Comp = asChild ? Slot : "button";

	const child = Children.only(children);
	const modifiedChild = isValidElement(child)
		? cloneElement(child, {
				...(child.props as ComponentProps<typeof Comp>),
				onClick: (e: MouseEvent) => {
					e.preventDefault();
					setRevealed(!revealed);
					if (
						isValidElement(child) &&
						child.props &&
						typeof child.props === "object" &&
						"onClick" in child.props
					) {
						(child.props.onClick as MouseEventHandler)(e);
					}
				},
				children: (
					<>
						<span>
							<span
								className={clsx(
									"absolute",
									revealed ? "opacity-100" : "opacity-0 select-none pointer-events-none",
								)}
								aria-hidden={!revealed}
							>
								Hide
							</span>
							<span
								className={clsx(
									revealed ? "opacity-0 select-none pointer-events-none" : "opacity-100",
								)}
								aria-hidden={revealed}
							>
								Reveal
							</span>
						</span>
						{revealed ? <EyeOff /> : <Eye />}
					</>
				),
				ref,
				type: "button",
				"aria-controls": inputId,
				"aria-pressed": revealed,
			} as ComponentProps<typeof Comp>)
		: child;

	return <Comp>{modifiedChild}</Comp>;
});
Reveal.displayName = "RevealInput.Reveal";

export { Root, Input, Reveal };
