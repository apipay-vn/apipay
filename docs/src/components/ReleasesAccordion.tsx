import {useEffect, useState} from "react";
import {useLocation} from "react-router-dom";
import {
	formatReleaseMonthLabel,
	getReleaseMonthGroups,
	type ReleaseLocale,
	type ReleaseMonthGroup,
	type ReleaseNote,
} from "@/data/releases";

interface ReleasesAccordionProps {
	releases: ReleaseNote[];
	locale: ReleaseLocale;
	labels: {
		features: string;
		fixes: string;
		improvements: string;
		empty: string;
	};
}

function ReleaseItem({
	release,
	labels,
}: {
	release: ReleaseNote;
	labels: ReleasesAccordionProps["labels"];
}) {
	const [open, setOpen] = useState(false);

	return (
		<div
			style={{
				border: "1px solid var(--color-border)",
				borderRadius: "10px",
				overflow: "hidden",
			}}
		>
			<button
				id={`${release.anchor}-v${release.version}`}
				onClick={() => setOpen(!open)}
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					width: "100%",
					padding: "1rem 1.25rem",
					background: "var(--color-bg-secondary)",
					border: "none",
					cursor: "pointer",
					textAlign: "left",
					gap: "0.75rem",
				}}
			>
				<div style={{display: "flex", alignItems: "center", gap: "0.75rem"}}>
					<span
						style={{
							fontWeight: 600,
							fontSize: "0.9rem",
							color: "var(--color-text)",
						}}
					>
						v{release.version}
					</span>
					<span
						style={{
							fontSize: "0.8rem",
							color: "var(--color-text-tertiary)",
							fontWeight: 400,
						}}
					>
						{release.date}
					</span>
				</div>
				<svg
					width="16"
					height="16"
					viewBox="0 0 16 16"
					fill="none"
					style={{
						flexShrink: 0,
						transform: open ? "rotate(180deg)" : "rotate(0deg)",
						transition: "transform 0.2s ease",
						color: "var(--color-text-tertiary)",
					}}
				>
					<path
						d="M4 6L8 10L12 6"
						stroke="currentColor"
						strokeWidth="1.5"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</svg>
			</button>

			{open && (
				<div
					style={{
						padding: "1rem 1.25rem 1.25rem",
						borderTop: "1px solid var(--color-border-light)",
						background: "var(--color-bg)",
					}}
				>
					{release.features.length > 0 && (
						<div style={{marginBottom: "1.25rem"}}>
							<h4
								style={{
									fontWeight: 600,
									fontSize: "0.875rem",
									color: "var(--color-text)",
									marginBottom: "0.5rem",
								}}
							>
								{labels.features}
							</h4>
							<ul style={{listStyle: "none", padding: 0, margin: 0}}>
								{release.features.map((feature, index) => (
									<li
										key={`${release.version}-feature-${index}`}
										style={{
											display: "flex",
											fontSize: "0.875rem",
											color: "var(--color-text-secondary)",
											paddingLeft: "1rem",
											position: "relative",
											marginBottom: "0.35rem",
										}}
									>
										<span
											style={{
												position: "absolute",
												left: 0,
												top: "0.6em",
												width: "4px",
												height: "4px",
												borderRadius: "50%",
												background: "var(--color-text-tertiary)",
												opacity: 0.5,
											}}
										/>
										{feature}
									</li>
								))}
							</ul>
						</div>
					)}

					{release.improvements.length > 0 && (
						<div style={{marginBottom: "1.25rem"}}>
							<h4
								style={{
									fontWeight: 600,
									fontSize: "0.875rem",
									color: "var(--color-text)",
									marginBottom: "0.5rem",
								}}
							>
								{labels.improvements}
							</h4>
							<ul style={{listStyle: "none", padding: 0, margin: 0}}>
								{release.improvements.map((improvement, index) => (
									<li
										key={`${release.version}-improvement-${index}`}
										style={{
											display: "flex",
											fontSize: "0.875rem",
											color: "var(--color-text-secondary)",
											paddingLeft: "1rem",
											position: "relative",
											marginBottom: "0.35rem",
										}}
									>
										<span
											style={{
												position: "absolute",
												left: 0,
												top: "0.6em",
												width: "4px",
												height: "4px",
												borderRadius: "50%",
												background: "var(--color-text-tertiary)",
												opacity: 0.5,
											}}
										/>
										{improvement}
									</li>
								))}
							</ul>
						</div>
					)}

					{release.fixes.length > 0 && (
						<div>
							<h4
								style={{
									fontWeight: 600,
									fontSize: "0.875rem",
									color: "var(--color-text)",
									marginBottom: "0.5rem",
								}}
							>
								{labels.fixes}
							</h4>
							<ul style={{listStyle: "none", padding: 0, margin: 0}}>
								{release.fixes.map((fix, index) => (
									<li
										key={`${release.version}-fix-${index}`}
										style={{
											display: "flex",
											fontSize: "0.875rem",
											color: "var(--color-text-secondary)",
											paddingLeft: "1rem",
											position: "relative",
											marginBottom: "0.35rem",
										}}
									>
										<span
											style={{
												position: "absolute",
												left: 0,
												top: "0.6em",
												width: "4px",
												height: "4px",
												borderRadius: "50%",
												background: "var(--color-text-tertiary)",
												opacity: 0.5,
											}}
										/>
										{fix}
									</li>
								))}
							</ul>
						</div>
					)}
				</div>
			)}
		</div>
	);
}

function MonthSection({
	group,
	locale,
	labels,
	open,
	onToggle,
}: {
	group: ReleaseMonthGroup;
	locale: ReleaseLocale;
	labels: ReleasesAccordionProps["labels"];
	open: boolean;
	onToggle: () => void;
}) {
	return (
		<section
			id={group.anchor}
			style={{
				border: "1px solid var(--color-border)",
				borderRadius: "14px",
				overflow: "hidden",
				background: "var(--color-bg)",
				scrollMarginTop: "5rem",
			}}
		>
			<button
				onClick={onToggle}
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					width: "100%",
					padding: "1rem 1.25rem",
					background: "var(--color-bg-secondary)",
					border: "none",
					cursor: "pointer",
					textAlign: "left",
					gap: "1rem",
				}}
			>
				<span
					style={{
						fontWeight: 650,
						fontSize: "1rem",
						color: "var(--color-text)",
					}}
				>
					{formatReleaseMonthLabel(group.anchor, locale)}
				</span>
				<svg
					width="18"
					height="18"
					viewBox="0 0 16 16"
					fill="none"
					style={{
						flexShrink: 0,
						transform: open ? "rotate(180deg)" : "rotate(0deg)",
						transition: "transform 0.2s ease",
						color: "var(--color-text-tertiary)",
					}}
				>
					<path
						d="M4 6L8 10L12 6"
						stroke="currentColor"
						strokeWidth="1.5"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</svg>
			</button>

			{open && (
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						gap: "0.75rem",
						padding: "1rem",
						borderTop: "1px solid var(--color-border-light)",
					}}
				>
					{group.releases.map((release) => (
						<ReleaseItem
							key={`${release.anchor}-${release.version}`}
							release={release}
							labels={labels}
						/>
					))}
				</div>
			)}
		</section>
	);
}

export function ReleasesAccordion({releases, locale, labels}: ReleasesAccordionProps) {
	const location = useLocation();
	const groups = getReleaseMonthGroups(releases);
	const [openAnchor, setOpenAnchor] = useState<string | null>(() =>
		location.hash ? location.hash.slice(1) : null,
	);

	useEffect(() => {
		setOpenAnchor(location.hash ? location.hash.slice(1) : null);
	}, [location.hash]);

	if (groups.length === 0) {
		return (
			<p
				style={{
					textAlign: "center",
					padding: "3rem 0",
					color: "var(--color-text-tertiary)",
					fontSize: "0.9rem",
				}}
			>
				{labels.empty}
			</p>
		);
	}

	return (
		<div style={{display: "flex", flexDirection: "column", gap: "1rem"}}>
			{groups.map((group) => (
				<MonthSection
					key={group.anchor}
					group={group}
					locale={locale}
					labels={labels}
					open={openAnchor === group.anchor}
					onToggle={() =>
						setOpenAnchor((currentAnchor) =>
							currentAnchor === group.anchor ? null : group.anchor,
						)
					}
				/>
			))}
		</div>
	);
}
