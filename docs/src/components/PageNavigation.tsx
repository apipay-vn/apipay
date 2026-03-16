import {viSidebarConfig, enSidebarConfig, type SidebarItem} from "@/sidebar.config";
import {useLocale} from "@/lib/i18n";
import {Link, useLocation} from "react-router-dom";

function flattenSidebar(items: SidebarItem[]): {label: string; href: string}[] {
	const result: {label: string; href: string}[] = [];
	for (const item of items) {
		if (item.href) result.push({label: item.label, href: item.href});
		if (item.children) result.push(...flattenSidebar(item.children));
	}
	return result;
}

export function PageNavigation() {
	const location = useLocation();
	const locale = useLocale();
	const sidebarConfig = locale === "en" ? enSidebarConfig : viSidebarConfig;
	const pages = flattenSidebar(sidebarConfig);
	const currentIndex = pages.findIndex((p) => p.href === location.pathname);

	const prev = currentIndex > 0 ? pages[currentIndex - 1] : null;
	const next = currentIndex < pages.length - 1 ? pages[currentIndex + 1] : null;

	const labels = locale === "en"
		? { prev: "← Previous", next: "Next →" }
		: { prev: "← Trước", next: "Tiếp →" };

	if (!prev && !next) return null;

	return (
		<div className="page-nav">
			{prev ? (
				<Link to={prev.href} className="prev">
					<span className="nav-label">{labels.prev}</span>
					<span className="nav-title">{prev.label}</span>
				</Link>
			) : (
				<div />
			)}
			{next ? (
				<Link to={next.href} className="next">
					<span className="nav-label">{labels.next}</span>
					<span className="nav-title">{next.label}</span>
				</Link>
			) : (
				<div />
			)}
		</div>
	);
}
