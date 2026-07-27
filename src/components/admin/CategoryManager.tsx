'use client'

import { useState } from 'react'
import AdminModal from './AdminModal'
import CategoryForm from './CategoryForm'
import { Plus, Edit2, Trash2, Tag } from 'lucide-react'
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-gray-900 italic underline decoration-indigo-500 underline-offset-8">Category Taxonomy</h1>
          <p className="text-gray-500 font-bold mt-2 uppercase tracking-widest text-xs">Organize and classify platform event inventory</p>
        </div>
        
        <button 
          onClick={handleCreate}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-gray-950 text-white px-8 py-4 rounded-2xl font-black italic tracking-tight transition-all shadow-xl shadow-indigo-100 hover:shadow-gray-200 group"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
          CREATE CATEGORY
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-gray-100 overflow-hidden mt-12">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/50 text-gray-400 font-black uppercase tracking-widest text-[10px]">
              <tr>
                <th className="px-8 py-6">Order</th>
                <th className="px-8 py-6">Category Identity</th>
                <th className="px-8 py-6">Theming</th>
                <th className="px-8 py-6">Status</th>
                <th className="px-8 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 font-medium">
              {categories?.map((cat: any) => (
                <tr key={cat.id} className="hover:bg-gray-50/20 transition-colors group">
                  <td className="px-8 py-6">
                    <span className="text-xs font-black text-gray-300 italic">#{cat.sort_order}</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400">
                        {cat.icon_url ? <img src={cat.icon_url} alt="" className="w-6 h-6 object-contain" /> : <Tag className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="font-black text-gray-950 italic">{cat.name}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">/{cat.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                      <div className="w-4 h-4 rounded-full shadow-inner" style={{ backgroundColor: cat.color_hex || '#e2e8f0' }} />
                      {cat.color_hex || 'DEFAULT'}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    {cat.is_active ? (
                      <Badge className="bg-green-50 text-green-600 border border-green-100 font-black text-[9px] px-3 py-1 rounded-full uppercase tracking-widest">ACTIVE</Badge>
                    ) : (
                      <Badge className="bg-gray-50 text-gray-400 border border-gray-200 font-black text-[9px] px-3 py-1 rounded-full uppercase tracking-widest">SUBMERGED</Badge>
                    )}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button 
                        onClick={() => handleEdit(cat)}
                        className="w-10 h-10 flex items-center justify-center bg-gray-50 hover:bg-white text-gray-400 hover:text-indigo-600 rounded-xl border border-transparent hover:border-gray-100 transition-all shadow-sm"
                       >
                          <Edit2 className="w-4 h-4" />
                       </button>
                       <button 
                        onClick={() => handleDelete(cat.id)}
                        className="w-10 h-10 flex items-center justify-center bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-xl border border-transparent hover:border-red-100 transition-all shadow-sm"
                       >
                          <Trash2 className="w-4 h-4" />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
              {(!categories || categories.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-8 py-32 text-center text-gray-400 font-black italic uppercase tracking-widest opacity-30">
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
