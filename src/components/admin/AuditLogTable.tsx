'use client'

import React, { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  Database
} from 'lucide-react'
import { cn } from '@/lib/utils'

export function AuditLogTable({ logs }: { logs: any[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm border-collapse">
        <thead className="bg-zinc-900/80 text-zinc-400 font-black uppercase tracking-widest text-[10px] border-b border-white/10">
          <tr>
            <th className="px-6 py-4">Timestamp</th>
            <th className="px-6 py-4">Actor</th>
            <th className="px-6 py-4">Action / Entity</th>
            <th className="px-6 py-4 text-right">Details</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5 font-medium">
          {logs.map((log) => (
            <React.Fragment key={log.id}>
              <tr 
                className={cn(
                  "hover:bg-white/[0.02] transition-colors group cursor-pointer",
                  expandedId === log.id && "bg-indigo-600/10"
                )}
                onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-zinc-400 font-mono text-[10px]">
                    <Clock className="w-3.5 h-3.5 text-zinc-500" />
                    {new Date(log.created_at).toLocaleString()}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center text-indigo-400 font-black text-xs font-mono">
                      {log.actor?.username?.substring(0, 2).toUpperCase() || 'SYS'}
                    </div>
                    <span className="font-black text-white italic">@{log.actor?.username || 'system'}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-0.5">
                     <span className="font-black text-[10px] uppercase tracking-wider text-indigo-400 italic">{log.action_type?.replace(/_/g, ' ')}</span>
                     <div className="flex items-center gap-1 text-[10px] text-zinc-500 font-mono">
                        <Database className="w-3 h-3 opacity-50" />
                        <span>{log.entity_type} / {String(log.entity_id).substring(0, 8)}...</span>
                     </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="w-8 h-8 flex items-center justify-center bg-zinc-900 text-zinc-400 rounded-xl border border-white/10 hover:text-white transition-all cursor-pointer">
                    {expandedId === log.id ? <ChevronUp className="w-4 h-4 text-indigo-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
                  </button>
                </td>
              </tr>
              {expandedId === log.id && (
                <tr className="bg-zinc-900/60 animate-in slide-in-from-top-1 duration-200">
                  <td colSpan={4} className="px-6 py-6 border-t border-white/5">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2">Initial State</h4>
                        <pre className="p-4 bg-zinc-950 rounded-2xl border border-white/10 text-[11px] font-mono text-zinc-400 overflow-x-auto max-h-[300px]">
                          {log.old_values ? JSON.stringify(log.old_values, null, 2) : '// No previous state recorded'}
                        </pre>
                      </div>
                      <div>
                        <h4 className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest mb-2">Post-Mutation State</h4>
                        <pre className="p-4 bg-zinc-950 rounded-2xl border border-indigo-500/20 text-[11px] font-mono text-indigo-300 overflow-x-auto max-h-[300px]">
                          {log.new_values ? JSON.stringify(log.new_values, null, 2) : '// Mutation completed'}
                        </pre>
                      </div>
                    </div>
                    {log.metadata && Object.keys(log.metadata).length > 0 && (
                      <div className="mt-6">
                         <h4 className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2">Auxiliary Context</h4>
                         <div className="flex flex-wrap gap-2">
                           {Object.entries(log.metadata).map(([key, val]) => (
                             <Badge key={key} variant="outline" className="bg-zinc-900 border-white/10 px-3 py-1 rounded-xl text-[10px] font-mono text-zinc-400">
                               <span className="opacity-50 mr-1">{key}:</span> {String(val)}
                             </Badge>
                           ))}
                         </div>
                      </div>
                    )}
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  )
}
