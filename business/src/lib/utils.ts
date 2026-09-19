import {type ClassValue, clsx} from 'clsx';
import {twMerge} from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function removeVietnameseTones(str: string): string {
	return str
		.normalize('NFD')
		.replace(/[Đđ]/g, d => (d === 'Đ' ? 'D' : 'd'))
		.replace(/[\u0300-\u036f]/g, '');
}

export function escapeRegExp(str: string): string {
	return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
