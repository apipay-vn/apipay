import {SVGProps} from "react";

export function QrIcon(props: SVGProps<SVGSVGElement>) {
	return (
		<svg
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<rect x="2" y="2" width="7" height="7" rx="1" fill="currentColor" />
			<rect x="15" y="2" width="7" height="7" rx="1" fill="currentColor" />
			<rect x="2" y="15" width="7" height="7" rx="1" fill="currentColor" />
		</svg>
	);
}
