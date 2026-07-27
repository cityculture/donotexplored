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
    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead className="bg-gray-50/50 text-gray-400 font-black uppercase tracking-widest text-[10px]">
            <tr>
              <th className="px-8 py-6">Timestamp</th>
              <th className="px-8 py-6">Actor</th>
              <th className="px-8 py-6">Action / Entity</th>
              <th className="px-8 py-6 text-right">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 font-body">
            {logs.map((log) => (
              <React.Fragment key={log.id}>
                <tr className={cn(
                  "hover:bg-gray-50/20 transition-colors group cursor-pointer",
                  expandedId === log.id && "bg-indigo-50/20"
                )}
                onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                >
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-gray-400 font-bold whitespace-nowrap text-[10px] uppercase tracking-tighter">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(log.created_at).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-xs shadow-sm">
                        {log.actor?.username?.substring(0, 2).toUpperCase() || 'S'}
                      </div>
                      <span className="font-black text-gray-900 italic">@{log.actor?.username || 'system'}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-1">
                       <span className="font-black text-[10px] uppercase tracking-[0.2em] text-indigo-500 italic">{log.action_type?.replace(/_/g, ' ')}</span>
                       <div className="flex items-center gap-2 text-[10px] text-gray-400 font-black uppercase tracking-widest">
                          <Database className="w-3 h-3 opacity-50" />
                          <span className="opacity-80">{log.entity_type} / {String(log.entity_id).substring(0, 8)}...</span>
                       </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button className="w-10 h-10 flex items-center justify-center bg-gray-50 hover:bg-white rounded-xl transition-all shadow-sm group-hover:shadow-md border border-transparent hover:border-gray-100">
                      {expandedId === log.id ? <ChevronUp className="w-5 h-5 text-indigo-600" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                    </button>
                  </td>
                </tr>
                {expandedId === log.id && (
                  <tr className="bg-indigo-50/5 animate-in slide-in-from-top-1 duration-200">
                    <td colSpan={4} className="px-8 py-10 border-t border-indigo-50">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        <div>
                          <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4 ml-1">Initial State</h4>
                          <pre className="p-6 bg-white rounded-3xl border border-gray-100 text-[11px] font-mono text-gray-500 overflow-x-auto shadow-inner max-h-[400px]">
                            {log.old_values ? JSON.stringify(log.old_values, null, 2) : '// No previous state recorded'}
                          </pre>
                        </div>
                        <div>
                          <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-4 ml-1">Post-Mutation State</h4>
                          <pre className="p-6 bg-white rounded-3xl border border-indigo-50 text-[11px] font-mono text-indigo-600/60 overflow-x-auto shadow-inner max-h-[400px]">
                            {log.new_values ? JSON.stringify(log.new_values, null, 2) : '// Mutation completed'}
                          </pre>
                        </div>
                      </div>
                      {log.metadata && Object.keys(log.metadata).length > 0 && (
                        <div className="mt-10">
                           <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4 ml-1">Auxiliary Context</h4>
                           <div className="flex flex-wrap gap-3">
                             {Object.entries(log.metadata).map(([key, val]) => (
                               <Badge key={key} variant="outline" className="bg-white border-gray-100 px-4 py-2 rounded-xl lowercase text-[10px] font-black tracking-widest border-dashed text-gray-500 shadow-sm">
                                 <span className="opacity-40 mr-1 italic text-gray-400">{key}:</span> {String(val)}
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
    </div>
  )
}
