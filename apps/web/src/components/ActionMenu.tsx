import { EllipsisVertical } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export interface ActionMenuProps {
	className?: string;
	onEdit?: () => void;
	onDelete?: () => void;
	onRefresh?: () => void;
}

export default function ActionMenu({
	className,
	onEdit,
	onDelete,
	onRefresh,
}: ActionMenuProps) {
	return (
		<div
			onClick={(e) => e.stopPropagation()}
			className={`z-20   ${className}`}
		>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<button className="p-1 hover:bg-accent rounded-md">
						<EllipsisVertical className="h-5 w-5" />
					</button>
				</DropdownMenuTrigger>
				<DropdownMenuContent onClick={(e) => e.stopPropagation()}>
					<DropdownMenuItem onClick={onRefresh}>
						Refresh
					</DropdownMenuItem>
					<DropdownMenuItem onClick={onEdit}>Edit</DropdownMenuItem>
					<DropdownMenuItem onClick={onDelete}>
						Delete
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}
