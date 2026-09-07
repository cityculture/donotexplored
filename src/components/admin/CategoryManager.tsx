'use client'

import { useState } from 'react'
import AdminModal from './AdminModal'
import CategoryForm from './CategoryForm'
import { Plus, Edit2, Trash2, Tag, Tags } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { deleteCategoryAction } from '@/actions/admin.actions'
import { toast } from 'sonner'

export default function CategoryManager({ categories }: { categories: any[] }) {
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<any>(null)

  const handleCreate = () => {
    setSelectedCategory(null)
    setModalOpen(true)
  }

  const handleEdit = (cat: any) => {
    setSelectedCategory(cat)
    setModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return
    
    try {
      const result = await deleteCategoryAction(id)
      if (result.success) {
        toast.success('Category deleted')
      } else {
        toast.error(result.error || 'Failed to delete')
      }
    } catch (error) {
      toast.error('An error occurred')
    }
  }

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white flex items-center gap-3">
            Category Taxonomy
            <Tags className="h-6 w-6 text-indigo-400 inline" />
          </h1>
          <p className="text-xs font-semibold text-zinc-400 mt-1">
            Organize and classify platform event inventory and discovery tags.
          </p>
        </div>
        
        <button 
          onClick={handleCreate}
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-2xl font-black text-xs tracking-wider transition-all shadow-lg shadow-indigo-600/30 cursor-pointer group"
        >
          <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
          CREATE CATEGORY
        </button>
      </div>

      <div className="rounded-3xl bg-zinc-950/70 border border-white/10 backdrop-blur-xl shadow-2xl overflow-hidden mt-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-900/80 text-zinc-400 font-black uppercase tracking-widest text-[10px] border-b border-white/10">
              <tr>
                <th className="px-6 py-4">Order</th>
                <th className="px-6 py-4">Category Identity</th>
                <th className="px-6 py-4">Theming</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-medium">
              {categories?.map((cat: any) => (
                <tr key={cat.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4">
                    <span className="text-xs font-black text-zinc-500 font-mono">#{cat.sort_order}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-400">
                        {cat.icon_url ? <img src={cat.icon_url} alt="" className="w-5 h-5 object-contain" /> : <Tag className="w-4 h-4 text-indigo-400" />}
                      </div>
                      <div>
                        <p className="font-black text-white italic">{cat.name}</p>
                        <p className="text-[10px] font-mono text-zinc-500">/{cat.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-400">
                      <div className="w-3.5 h-3.5 rounded-full border border-white/20" style={{ backgroundColor: cat.color_hex || '#6366f1' }} />
                      {cat.color_hex || 'DEFAULT'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {cat.is_active ? (
                      <Badge className="bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 font-black text-[9px] px-2.5 py-0.5 rounded-full uppercase tracking-widest">ACTIVE</Badge>
                    ) : (
                      <Badge className="bg-zinc-900 text-zinc-500 border border-white/10 font-black text-[9px] px-2.5 py-0.5 rounded-full uppercase tracking-widest">SUBMERGED</Badge>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <button 
                        onClick={() => handleEdit(cat)}
                        className="w-8 h-8 flex items-center justify-center bg-zinc-900 text-zinc-400 hover:text-white rounded-xl border border-white/10 hover:border-white/20 transition-all cursor-pointer"
                       >
                          <Edit2 className="w-3.5 h-3.5" />
                       </button>
                       <button 
                        onClick={() => handleDelete(cat.id)}
                        className="w-8 h-8 flex items-center justify-center bg-zinc-900 text-zinc-400 hover:text-red-400 rounded-xl border border-white/10 hover:border-red-500/30 transition-all cursor-pointer"
                       >
                          <Trash2 className="w-3.5 h-3.5" />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
              {(!categories || categories.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-zinc-500 font-black italic uppercase tracking-widest">
                    The taxonomy is currently empty.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AdminModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title={selectedCategory ? 'Edit Category' : 'Create New Category'}
        maxWidth="2xl"
      >
        <CategoryForm 
          category={selectedCategory} 
          onSuccess={() => setModalOpen(false)} 
          onCancel={() => setModalOpen(false)} 
        />
      </AdminModal>
    </>
  )
}
