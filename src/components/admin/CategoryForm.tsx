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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Category Name</label>
          <Input 
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Music Festivals"
            required
            className="rounded-2xl border-gray-100 focus:ring-indigo-500/10 h-12 font-bold italic"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">URL Slug</label>
          <Input 
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            placeholder="e.g. music-festivals"
            required
            className="rounded-2xl border-gray-100 focus:ring-indigo-500/10 h-12 font-bold italic"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Description</label>
        <Textarea 
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="What kind of events go here?"
          className="rounded-2xl border-gray-100 focus:ring-indigo-500/10 min-h-[100px] font-bold italic"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Icon URL (SVG/PNG)</label>
          <Input 
            value={formData.icon_url}
            onChange={(e) => setFormData({ ...formData, icon_url: e.target.value })}
            placeholder="https://..."
            className="rounded-2xl border-gray-100 focus:ring-indigo-500/10 h-12 font-bold italic"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Brand Color (Hex)</label>
          <div className="flex gap-3">
             <Input 
              value={formData.color_hex}
              onChange={(e) => setFormData({ ...formData, color_hex: e.target.value })}
              placeholder="#000000"
              className="rounded-2xl border-gray-100 focus:ring-indigo-500/10 h-12 font-bold italic flex-1"
            />
            <div 
              className="w-12 h-12 rounded-2xl border border-gray-100 shadow-inner" 
              style={{ backgroundColor: formData.color_hex }}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-6 pt-4">
        <button 
          type="button"
          onClick={onCancel}
          className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-950 transition-colors"
        >
          Cancel
        </button>
        <Button 
          type="submit" 
          disabled={loading}
          className="bg-gray-950 hover:bg-indigo-600 text-white px-8 py-6 rounded-2xl font-black italic tracking-tight transition-all shadow-xl hover:shadow-indigo-100"
        >
          {loading ? 'SAVING...' : (category ? 'UPDATE CATEGORY' : 'CREATE CATEGORY')}
        </Button>
      </div>
    </form>
  )
}
