'use client'

import { useState } from 'react'
import { upsertCategoryAction } from '@/actions/admin.actions'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

interface CategoryFormProps {
  category?: any
  onSuccess: () => void
  onCancel: () => void
}

export default function CategoryForm({ category, onSuccess, onCancel }: CategoryFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: category?.name || '',
    slug: category?.slug || '',
    description: category?.description || '',
    icon_url: category?.icon_url || '',
    color_hex: category?.color_hex || '#6366f1',
    sort_order: category?.sort_order || 0,
    is_active: category?.is_active ?? true
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const result = await upsertCategoryAction({
        id: category?.id,
        ...formData
      })
      
      if (result.success) {
        toast.success(category ? 'Category updated' : 'Category created')
        onSuccess()
      } else {
        toast.error(result.error || 'Failed to save category')
      }
    } catch (error) {
      toast.error('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-0.5">Category Name</label>
          <Input 
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Music Festivals"
            required
            className="rounded-xl border-white/10 bg-zinc-900 focus:border-indigo-400 h-11 text-xs text-white font-mono"
          />
        </div>
        
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-0.5">URL Slug</label>
          <Input 
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            placeholder="e.g. music-festivals"
            required
            className="rounded-xl border-white/10 bg-zinc-900 focus:border-indigo-400 h-11 text-xs text-white font-mono"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-0.5">Description</label>
        <Textarea 
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="What kind of events go here?"
          className="rounded-xl border-white/10 bg-zinc-900 focus:border-indigo-400 min-h-[90px] text-xs text-white font-mono"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-0.5">Icon URL (SVG/PNG)</label>
          <Input 
            value={formData.icon_url}
            onChange={(e) => setFormData({ ...formData, icon_url: e.target.value })}
            placeholder="https://..."
            className="rounded-xl border-white/10 bg-zinc-900 focus:border-indigo-400 h-11 text-xs text-white font-mono"
          />
        </div>
        
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-0.5">Brand Color (Hex)</label>
          <div className="flex gap-2.5">
             <Input 
              value={formData.color_hex}
              onChange={(e) => setFormData({ ...formData, color_hex: e.target.value })}
              placeholder="#6366f1"
              className="rounded-xl border-white/10 bg-zinc-900 focus:border-indigo-400 h-11 text-xs text-white font-mono flex-1"
            />
            <div 
              className="w-11 h-11 rounded-xl border border-white/20 shadow-md shrink-0" 
              style={{ backgroundColor: formData.color_hex || '#6366f1' }}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 pt-4 border-t border-white/10">
        <button 
          type="button"
          onClick={onCancel}
          className="text-xs font-bold text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <Button 
          type="submit" 
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl font-black text-xs tracking-wider transition-all shadow-lg shadow-indigo-600/30 cursor-pointer"
        >
          {loading ? 'SAVING...' : (category ? 'UPDATE CATEGORY' : 'CREATE CATEGORY')}
        </Button>
      </div>
    </form>
  )
}
