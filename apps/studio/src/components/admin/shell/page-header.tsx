interface PageHeaderProps {
	title: string;
	description?: string;
}

export function PageHeader({ title, description }: PageHeaderProps) {
	return (
		<div className="mb-8">
			<h1 className="text-2xl font-bold text-zinc-700">{title}</h1>
			{description && <p className="text-gray-600">{description}</p>}
		</div>
	);
}
