import type {GlossaryTerm} from '../content/types';

interface GlossaryProps {
	terms: GlossaryTerm[];
	variant: 'chips' | 'table';
}

export function Glossary({terms, variant}: GlossaryProps) {
	if (variant === 'table') {
		return (
			<div className="overflow-hidden rounded-lg border border-border bg-card">
				<table className="w-full text-sm">
					<thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
						<tr>
							<th className="w-24 px-4 py-2.5 font-semibold">Term</th>
							<th className="px-4 py-2.5 font-semibold"> </th>
						</tr>
					</thead>
					<tbody className="divide-y divide-border">
						{terms.map(term => (
							<tr key={term.term}>
								<td className="px-4 py-3 align-top font-semibold">{term.term}</td>
								<td className="px-4 py-3 align-top">
									<span className="font-medium">{term.label}</span>
									<span className="text-muted-foreground"> — {term.description}</span>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		);
	}

	return (
		<div className="flex flex-wrap gap-2">
			{terms.map(term => (
				<div
					key={term.term}
					className="rounded-lg border border-border bg-card px-3 py-2"
					title={term.description}
				>
					<div className="flex items-center gap-2">
						<span className="rounded bg-muted px-1.5 py-0.5 text-xs font-semibold">{term.term}</span>
						<span className="text-xs text-muted-foreground">{term.label}</span>
					</div>
				</div>
			))}
		</div>
	);
}
