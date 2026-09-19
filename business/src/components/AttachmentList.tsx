import type {AttachmentInfo} from '../data/banks';
import type {Content} from '../content/vi';
import {FileIcon, LockIcon} from './Icons';

interface AttachmentListProps {
	attachments: AttachmentInfo[];
	t: Content['banks'];
}

export function AttachmentList({attachments, t}: AttachmentListProps) {
	return (
		<ul className="space-y-2">
			{attachments.map(attachment => (
				<li key={attachment.title}>
					<button
						type="button"
						disabled
						className="flex w-full items-center gap-3 rounded-lg border border-dashed border-border bg-card px-3.5 py-3 text-left"
					>
						<FileIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
						<span className="min-w-0 flex-1">
							<span className="block truncate text-sm font-medium">{attachment.title}</span>
							<span className="block text-xs font-medium uppercase text-muted-foreground">
								{attachment.kind}
							</span>
						</span>
						<span
							className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-muted-foreground"
							title={t.detail.attachmentsDisabled}
						>
							<LockIcon className="h-3.5 w-3.5" />
							{t.detail.attachmentsDisabled}
						</span>
					</button>
				</li>
			))}
		</ul>
	);
}
