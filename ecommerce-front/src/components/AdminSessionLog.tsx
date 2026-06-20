import { useCarouselAdmin } from '../contexts/CarouselAdminContext';

export function AdminSessionLog() {
  const { changeLog } = useCarouselAdmin();

  return (
    <div className="bg-neutral-50 dark:bg-neutral-900/40 p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 max-h-[600px] overflow-y-auto flex flex-col gap-3">
      <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 border-b border-neutral-200 dark:border-neutral-800 pb-2">
        Histórico da Sessão
      </h3>
      {changeLog.length === 0 ? (
        <p className="text-xs text-neutral-400 italic py-4 text-center">Nenhuma alteração pendente.</p>
      ) : (
        <div className="space-y-3">
          {changeLog.map((log) => (
            <div key={log.id} className="text-xs border-b border-neutral-100 dark:border-neutral-900 pb-2 last:border-0">
              <div className="flex items-center justify-between mb-1">
                <span className={`px-1.5 py-0.5 rounded-[4px] font-mono text-[10px] font-bold tracking-wide
                  ${log.type === 'SAVE' ? 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400' : ''}
                  ${log.type === 'MOVE' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400' : ''}
                  ${log.type === 'CREATE' ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400' : ''}
                  ${log.type === 'ROLLBACK' ? 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400' : ''}
                  ${log.type === 'RESTORE' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400' : ''}
                `}>
                  {log.type}
                </span>
                <span className="text-neutral-400 font-mono text-[10px]">{log.timestamp}</span>
              </div>
              <p className="text-neutral-600 dark:text-neutral-300">{log.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}