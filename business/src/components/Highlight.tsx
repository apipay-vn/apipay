import type {ReactNode} from 'react';
import {cn} from '../lib/utils';

interface HighlightProps {
	text: string;
	query: string;
	className?: string;
}

function normalizeWithMap(value: string): {normalized: string; map: number[]} {
	const chars: string[] = [];
	const map: number[] = [];
	for (let index = 0; index < value.length; index += 1) {
		const original = value[index];
		const replaced = original === 'đ' ? 'd' : original === 'Đ' ? 'D' : original;
		const decomposed = replaced
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '')
			.toLowerCase();
		for (const char of decomposed) {
			chars.push(char);
			map.push(index);
		}
	}
	return {normalized: chars.join(''), map};
}

function normalizeQuery(value: string): string {
	return value
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/[Đđ]/g, d => (d === 'Đ' ? 'D' : 'd'))
		.toLowerCase();
}

export function Highlight({text, query, className}: HighlightProps) {
	const trimmed = query.trim();
	if (!trimmed) return <span className={className}>{text}</span>;

	const needle = normalizeQuery(trimmed);
	if (!needle) return <span className={className}>{text}</span>;

	const {normalized, map} = normalizeWithMap(text);
	const ranges: Array<[number, number]> = [];
	let cursor = 0;
	while (cursor <= normalized.length - needle.length) {
		const found = normalized.indexOf(needle, cursor);
		if (found === -1) break;
		const start = map[found];
		const end = map[Math.min(found + needle.length - 1, map.length - 1)];
		ranges.push([start, end + 1]);
		cursor = found + needle.length;
	}

	if (ranges.length === 0) return <span className={className}>{text}</span>;

	const parts: ReactNode[] = [];
	let position = 0;
	ranges.forEach(([start, end], index) => {
		if (start > position) parts.push(text.slice(position, start));
		parts.push(
			<mark key={index} className="rounded bg-primary/20 text-foreground">
				{text.slice(start, end)}
			</mark>
		);
		position = end;
	});
	if (position < text.length) parts.push(text.slice(position));

	return <span className={cn(className)}>{parts}</span>;
}
