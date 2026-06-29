import Image from "next/image";
import Link from "next/link";

type BrandMarkProps = {
	className?: string;
	href?: string;
	priority?: boolean;
};

function joinClasses(...classes: Array<string | undefined>): string {
	return classes.filter(Boolean).join(" ");
}

export function BrandMark({ className, href, priority = false }: BrandMarkProps) {
	const content = (
		<>
			<Image src="/icons/icon-192.png" alt="" width={36} height={36} priority={priority} className="h-9 w-9 rounded-md border border-ivory/15" />
			<span>Fort Curieux</span>
		</>
	);

	const baseClassName = joinClasses("inline-flex min-h-9 items-center gap-3 text-lg font-semibold", className);

	if (href) {
		return (
			<Link href={href} className={joinClasses(baseClassName, "underline-offset-4 hover:underline")}>
				{content}
			</Link>
		);
	}

	return <div className={baseClassName}>{content}</div>;
}
