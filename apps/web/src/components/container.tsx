const Container = ({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) => {
	return (
		<div className={`mx-auto max-w-5xl px-5 ${className}`}>{children}</div>
	);
};

export default Container;
