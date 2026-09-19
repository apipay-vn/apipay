import type {SVGProps} from 'react';

type IconProps = SVGProps<SVGSVGElement>;

export function SunIcon(props: IconProps) {
	return (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true" {...props}>
			<circle cx="12" cy="12" r="4" />
			<path
				strokeLinecap="round"
				d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
			/>
		</svg>
	);
}

export function MoonIcon(props: IconProps) {
	return (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true" {...props}>
			<path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
		</svg>
	);
}

export function SearchIcon(props: IconProps) {
	return (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true" {...props}>
			<circle cx="11" cy="11" r="7" />
			<path strokeLinecap="round" d="M20 20l-3.5-3.5" />
		</svg>
	);
}

export function ChevronDownIcon(props: IconProps) {
	return (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true" {...props}>
			<path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
		</svg>
	);
}

export function ArrowRightIcon(props: IconProps) {
	return (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true" {...props}>
			<path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-6-6l6 6-6 6" />
		</svg>
	);
}

export function ArrowLeftIcon(props: IconProps) {
	return (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true" {...props}>
			<path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5m6-6l-6 6 6 6" />
		</svg>
	);
}

export function FileIcon(props: IconProps) {
	return (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true" {...props}>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M14 3v5h5M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8l-5-5z"
			/>
		</svg>
	);
}

export function CheckIcon(props: IconProps) {
	return (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden="true" {...props}>
			<path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
		</svg>
	);
}

export function MinusIcon(props: IconProps) {
	return (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden="true" {...props}>
			<path strokeLinecap="round" d="M6 12h12" />
		</svg>
	);
}

export function ExternalLinkIcon(props: IconProps) {
	return (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true" {...props}>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M14 5h5m0 0v5m0-5l-7 7M17 14v4a2 2 0 01-2 2H6a2 2 0 01-2-2V9a2 2 0 012-2h4"
			/>
		</svg>
	);
}

export function LockIcon(props: IconProps) {
	return (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true" {...props}>
			<rect x="4" y="10" width="16" height="10" rx="2" />
			<path strokeLinecap="round" d="M8 10V7a4 4 0 118 0v3" />
		</svg>
	);
}
