import { cn } from "@/lib/utils";
import Link from "next/link";
import ActionMenu from "./ActionMenu";

interface CardContainerProps {
	children: React.ReactNode;
	className?: string;
}

export function CardContainer({ children, className }: CardContainerProps) {
	return (
		<div
			className={cn(
				"relative rounded-xl border bg-card p-4 shadow-sm transition-all hover:shadow-md",
				className
			)}
		>
			{children}
		</div>
	);
}

interface ClickableCardProps {
	title: string;
	description?: string;
	status?: string;
	href: string;
	onEdit?: () => void;
	onDelete?: () => void;
	onRefresh?: () => void;
}


export function ClickableCard({
	title,
	description,
	status,
	href,
	onDelete,
	onEdit,
	onRefresh,
}: ClickableCardProps) {
	return (
		<CardContainer>
			{/* Action menu (does NOT trigger navigation) */}
			<div className="absolute top-3 right-3">
				<ActionMenu
					onDelete={onDelete}
					onEdit={onEdit}
					onRefresh={onRefresh}
				/>
			</div>

			{/* Main clickable area */}
			<Link href={href} className="block cursor-pointer">
				<div className="space-y-2">
					<p className="font-semibold text-xl">{title}</p>
					{status && (
						<p className="text-muted-foreground text-sm">
							{status}
						</p>
					)}
					{description && (
						<p className="text-sm text-muted-foreground">
							{description}
						</p>
					)}
				</div>
			</Link>
		</CardContainer>
	);
}

