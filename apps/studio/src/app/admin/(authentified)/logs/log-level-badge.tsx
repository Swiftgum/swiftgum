import type { Log } from "@knowledgex/shared/log";
import { clsx } from "clsx";
import { AlertCircle, AlertTriangle, Info, Lock } from "lucide-react";

export const LogLevelBadge = ({ level }: { level: Log["level"] }) => {
	return (
		<span
			className={clsx(
				"inline-flex items-center gap-1",
				level === "verbose" && "",
				level === "debug" && "text-teal-600",
				level === "info" && "text-blue-600",
				level === "security" && "text-amber-600",
				level === "warning" && "text-amber-600",
				level === "error" && "text-red-600",
			)}
		>
			{level === "info" && <Info className="w-3 h-3" />}
			{level === "security" && <Lock className="w-3 h-3" />}
			{level === "warning" && <AlertTriangle className="w-3 h-3" />}
			{level === "error" && <AlertCircle className="w-3 h-3" />}
			{level}
		</span>
	);
};
