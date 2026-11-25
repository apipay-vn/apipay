import {Fragment, useState} from 'react';
import {cn} from '../../lib/utils';
import type {TlvNode} from '../../lib/vietqr';
import {CopyButton} from './CopyButton';

const TONES = [
  {text: 'text-sky-700', bg: 'bg-sky-500/10', ring: 'ring-sky-500/60', dot: 'bg-sky-500'},
  {text: 'text-violet-700', bg: 'bg-violet-500/10', ring: 'ring-violet-500/60', dot: 'bg-violet-500'},
  {text: 'text-emerald-700', bg: 'bg-emerald-500/10', ring: 'ring-emerald-500/60', dot: 'bg-emerald-500'},
  {text: 'text-amber-700', bg: 'bg-amber-500/15', ring: 'ring-amber-500/60', dot: 'bg-amber-500'},
  {text: 'text-rose-700', bg: 'bg-rose-500/10', ring: 'ring-rose-500/60', dot: 'bg-rose-500'},
  {text: 'text-cyan-700', bg: 'bg-cyan-500/10', ring: 'ring-cyan-500/60', dot: 'bg-cyan-500'},
  {text: 'text-fuchsia-700', bg: 'bg-fuchsia-500/10', ring: 'ring-fuchsia-500/60', dot: 'bg-fuchsia-500'},
  {text: 'text-indigo-700', bg: 'bg-indigo-500/10', ring: 'ring-indigo-500/60', dot: 'bg-indigo-500'},
];
type Tone = (typeof TONES)[number];

interface Shared {
  active: string | null;
  setActive: (path: string | null) => void;
  errorPaths: Set<string>;
}

function Segment({node, tone, active, setActive, errorPaths}: {node: TlvNode; tone: Tone} & Shared) {
  return (
    <span
      onMouseOver={e => {
        e.stopPropagation();
        setActive(node.path);
      }}
      className={cn(
        'rounded-[4px] transition-shadow',
        !node.path.includes('.') && tone.bg,
        active === node.path && cn('ring-2', tone.ring),
        errorPaths.has(node.path) && 'underline decoration-red-500 decoration-wavy decoration-2 underline-offset-4'
      )}
    >
      <span className={cn('font-bold', tone.text)}>{node.tag}</span>
      <span className="text-muted-foreground/70">{String(node.length).padStart(2, '0')}</span>
      {node.children ? (
        node.children.map(c => <Segment key={c.path} node={c} tone={tone} active={active} setActive={setActive} errorPaths={errorPaths} />)
      ) : (
        <span className="text-foreground">{node.value}</span>
      )}
    </span>
  );
}

function TreeRows({nodes, depth, tone, active, setActive, errorPaths}: {nodes: TlvNode[]; depth: number; tone?: Tone} & Shared) {
  return (
    <>
      {nodes.map((node, i) => {
        const t = tone ?? TONES[i % TONES.length];
        return (
          <Fragment key={node.path}>
            <tr
              onMouseEnter={() => setActive(node.path)}
              className={cn('border-t border-border/60 align-top transition-colors', active === node.path && 'bg-foreground/[0.04]')}
            >
              <td className="py-2 pr-3 font-mono text-xs whitespace-nowrap" style={{paddingLeft: `${depth * 1.1 + 0.5}rem`}}>
                <span className="inline-flex items-center gap-2">
                  <span className={cn('h-2 w-2 rounded-full', t.dot, depth > 0 && 'opacity-50')} />
                  <span className={cn('font-bold', t.text)}>{node.path}</span>
                </span>
              </td>
              <td className="py-2 pr-3 text-sm">
                {node.name}
                {errorPaths.has(node.path) && <span className="ml-1.5 text-xs font-medium text-red-600">lỗi</span>}
              </td>
              <td className="hidden py-2 pr-3 text-right font-mono text-xs text-muted-foreground tabular-nums sm:table-cell">{node.length}</td>
              <td className="py-2 pr-1 font-mono text-xs break-all">
                {node.children ? <span className="text-muted-foreground">{node.children.length} trường con</span> : node.value || <span className="text-muted-foreground">(trống)</span>}
              </td>
              <td className="w-8 py-1">{!node.children && node.value && <CopyButton value={node.value} />}</td>
            </tr>
            {node.children && <TreeRows nodes={node.children} depth={depth + 1} tone={t} active={active} setActive={setActive} errorPaths={errorPaths} />}
          </Fragment>
        );
      })}
    </>
  );
}

export function PayloadView({raw, nodes, json, errorPaths}: {raw: string; nodes: TlvNode[]; json: string; errorPaths: Set<string>}) {
  const [active, setActive] = useState<string | null>(null);
  const [view, setView] = useState<'tree' | 'json'>('tree');
  const shared = {active, setActive, errorPaths};
  const consumed = nodes.length ? nodes[nodes.length - 1].end : 0;

  return (
    <div data-slot="card" className="rounded-lg border border-border bg-card p-4 md:p-6" onMouseLeave={() => setActive(null)}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="font-semibold">Chuỗi dữ liệu gốc</h3>
          <p className="text-xs text-muted-foreground">
            {raw.length} ký tự · {nodes.length} trường · rê chuột để xem từng trường
          </p>
        </div>
        <CopyButton value={raw} label="Sao chép chuỗi" variant="outline" />
      </div>

      <div className="rounded-xl bg-muted/50 p-3 font-mono text-[13px] leading-7 break-all md:p-4">
        {nodes.length ? (
          <>
            {nodes.map((n, i) => (
              <Segment key={n.path} node={n} tone={TONES[i % TONES.length]} {...shared} />
            ))}
            {consumed < raw.length && <span className="bg-red-500/15 text-red-700">{raw.slice(consumed)}</span>}
          </>
        ) : (
          raw
        )}
      </div>

      {nodes.length > 0 && (
        <>
          <div className="mt-5 mb-2 flex items-center justify-between gap-2">
            <div data-slot="tabs-list" role="tablist" className="inline-flex rounded-lg bg-muted p-1">
              {(['tree', 'json'] as const).map(v => (
                <button
                  key={v}
                  type="button"
                  role="tab"
                  aria-selected={view === v}
                  data-slot="tabs-trigger"
                  data-state={view === v ? 'active' : 'inactive'}
                  onClick={() => setView(v)}
                  className={cn('rounded-md px-3 py-1 text-xs font-medium', view === v ? 'bg-card shadow-sm' : 'text-muted-foreground')}
                >
                  {v === 'tree' ? 'Cây TLV' : 'JSON'}
                </button>
              ))}
            </div>
            {view === 'json' && (
              <div className="flex gap-2">
                <CopyButton value={json} label="Chép JSON" variant="outline" />
                <button
                  type="button"
                  data-slot="button"
                  data-variant="outline"
                  className="h-9 rounded-lg border border-border px-3.5 text-sm font-medium text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    const url = URL.createObjectURL(new Blob([json], {type: 'application/json'}));
                    const a = Object.assign(document.createElement('a'), {href: url, download: 'vietqr-decoded.json'});
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                >
                  Tải .json
                </button>
              </div>
            )}
          </div>
          {view === 'tree' ? (
            <div className="-mx-1 overflow-x-auto">
              <table className="w-full min-w-[520px] border-collapse text-left">
                <thead>
                  <tr className="text-xs text-muted-foreground">
                    <th className="py-2 pr-3 pl-2 font-medium">Thẻ</th>
                    <th className="py-2 pr-3 font-medium">Tên trường</th>
                    <th className="hidden py-2 pr-3 text-right font-medium sm:table-cell">Độ dài</th>
                    <th className="py-2 pr-3 font-medium">Giá trị</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  <TreeRows nodes={nodes} depth={0} {...shared} />
                </tbody>
              </table>
            </div>
          ) : (
            <pre className="max-h-96 overflow-auto rounded-xl bg-muted/50 p-4 font-mono text-xs leading-relaxed">{json}</pre>
          )}
        </>
      )}
    </div>
  );
}
