import {useEffect, useState} from 'react';
import {getLogoUrl, type Bank} from '../data/banks';
import {cn} from '../lib/utils';

interface BankLogoProps {
	bank: Bank;
	className?: string;
}

export function BankLogo({bank, className}: BankLogoProps) {
	const [failed, setFailed] = useState(false);

	useEffect(() => {
		setFailed(false);
	}, [bank.code]);

	if (failed) {
		return (
			<div
				className={cn(
					'flex items-center justify-center rounded-md bg-muted text-[10px] font-semibold uppercase tracking-tight text-muted-foreground',
					className
				)}
				aria-hidden="true"
			>
				{bank.code.slice(0, 4)}
			</div>
		);
	}

	return (
		<img
			src={getLogoUrl(bank)}
			alt={`${bank.name} logo`}
			className={cn('rounded-md bg-white object-contain p-1', className)}
			loading="lazy"
			onError={() => setFailed(true)}
		/>
	);
}
