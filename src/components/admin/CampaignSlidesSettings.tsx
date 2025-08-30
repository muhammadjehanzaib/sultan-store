"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface SlideForm {
  id?: string;
  title_en: string;
  title_ar: string;
  subtitle_en?: string;
  subtitle_ar?: string;
  description_en?: string;
  description_ar?: string;
  image: string; // base64
  ctaText_en?: string;
  ctaText_ar?: string;
  ctaHref?: string;
  background?: string; // tailwind gradient classes or hex
  textClass?: string; // tailwind text color classes or hex
  discount?: string;
  isActive: boolean;
  sortOrder: number;
}

export const CampaignSlidesSettings: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slides, setSlides] = useState<SlideForm[]>([]);
  const [editing, setEditing] = useState<SlideForm | null>(null);

  const loadSlides = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/campaign-slides?includeInactive=true');
      if (!res.ok) throw new Error('Failed to load slides');
      const data = await res.json();
      setSlides(data.slides || []);
    } catch (e: any) {
      setError(e.message || 'Failed to load slides');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSlides();
  }, []);

  const resetEditing = () => setEditing(null);

  const handleFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
    });
  };

  const handleCreate = () => {
    setEditing({
      title_en: '',
      title_ar: '',
      subtitle_en: '',
      subtitle_ar: '',
      description_en: '',
      description_ar: '',
      image: '',
      ctaText_en: '',
      ctaText_ar: '',
      ctaHref: '#featured-products',
      background: 'from-purple-600 to-pink-600',
      textClass: 'text-white',
      discount: '',
      isActive: true,
      sortOrder: 0,
    });
  };

  const handleEdit = (slide: SlideForm) => setEditing(slide);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this slide?')) return;
    try {
      setSaving(true);
      const res = await fetch(`/api/admin/campaign-slides?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      await loadSlides();
    } catch (e: any) {
      setError(e.message || 'Failed to delete');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    try {
      setSaving(true);
      setError(null);
      const method = editing.id ? 'PUT' : 'POST';
      const url = editing.id ? `/api/admin/campaign-slides?id=${encodeURIComponent(editing.id)}` : '/api/admin/campaign-slides';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editing),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to save');
      }
      resetEditing();
      await loadSlides();
    } catch (e: any) {
      setError(e.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Campaign Slides</h2>
        <Button onClick={handleCreate}>New Slide</Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">{error}</div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          {slides.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-300">No slides yet.</p>
          ) : (
            <div className="space-y-3">
              {slides.map((s) => (
                <div key={s.id} className="flex items-center justify-between border rounded p-3">
                  <div className="flex items-center gap-3">
                    {s.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={s.image} alt={s.title_en} className="w-16 h-10 object-cover rounded" />
                    )}
                    <div>
                      <div className="font-medium">{s.title_en} / {s.title_ar}</div>
                      <div className="text-xs text-gray-500">{s.ctaText_en} → {s.ctaHref}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded ${s.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {s.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <span className="text-xs text-gray-500">Order: {s.sortOrder}</span>
                    <Button variant="secondary" onClick={() => handleEdit(s)}>Edit</Button>
                    <Button variant="danger" onClick={() => handleDelete(s.id!)} disabled={saving}>Delete</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Editor Modal/Panel */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 w-full max-w-3xl rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">{editing.id ? 'Edit Slide' : 'New Slide'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1">Title (EN)</label>
                  <input className="w-full border rounded px-3 py-2" value={editing.title_en} onChange={(e) => setEditing({ ...editing!, title_en: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm mb-1">Title (AR)</label>
                  <input className="w-full border rounded px-3 py-2" value={editing.title_ar} onChange={(e) => setEditing({ ...editing!, title_ar: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm mb-1">Subtitle (EN)</label>
                  <input className="w-full border rounded px-3 py-2" value={editing.subtitle_en || ''} onChange={(e) => setEditing({ ...editing!, subtitle_en: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm mb-1">Subtitle (AR)</label>
                  <input className="w-full border rounded px-3 py-2" value={editing.subtitle_ar || ''} onChange={(e) => setEditing({ ...editing!, subtitle_ar: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm mb-1">Description (EN)</label>
                  <textarea className="w-full border rounded px-3 py-2" rows={2} value={editing.description_en || ''} onChange={(e) => setEditing({ ...editing!, description_en: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm mb-1">Description (AR)</label>
                  <textarea className="w-full border rounded px-3 py-2" rows={2} value={editing.description_ar || ''} onChange={(e) => setEditing({ ...editing!, description_ar: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm mb-1">CTA Text (EN)</label>
                  <input className="w-full border rounded px-3 py-2" value={editing.ctaText_en || ''} onChange={(e) => setEditing({ ...editing!, ctaText_en: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm mb-1">CTA Text (AR)</label>
                  <input className="w-full border rounded px-3 py-2" value={editing.ctaText_ar || ''} onChange={(e) => setEditing({ ...editing!, ctaText_ar: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm mb-1">CTA Href</label>
                  <input className="w-full border rounded px-3 py-2" value={editing.ctaHref || ''} onChange={(e) => setEditing({ ...editing!, ctaHref: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm mb-1">Background (classes/hex)</label>
                  <input className="w-full border rounded px-3 py-2" value={editing.background || ''} onChange={(e) => setEditing({ ...editing!, background: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm mb-1">Text Color (classes/hex)</label>
                  <input className="w-full border rounded px-3 py-2" value={editing.textClass || ''} onChange={(e) => setEditing({ ...editing!, textClass: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm mb-1">Discount Label</label>
                  <input className="w-full border rounded px-3 py-2" value={editing.discount || ''} onChange={(e) => setEditing({ ...editing!, discount: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm mb-1">Sort Order</label>
                  <input type="number" className="w-full border rounded px-3 py-2" value={editing.sortOrder} onChange={(e) => setEditing({ ...editing!, sortOrder: parseInt(e.target.value || '0', 10) })} />
                </div>
                <div className="flex items-center gap-2 mt-6">
                  <input id="isActive" type="checkbox" checked={editing.isActive} onChange={(e) => setEditing({ ...editing!, isActive: e.target.checked })} />
                  <label htmlFor="isActive">Active</label>
                </div>
              </div>

              {/* Image upload */}
              <div>
                <label className="block text-sm mb-1">Image (base64)</label>
                <input type="file" accept="image/*" onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const b64 = await handleFileToBase64(file);
                  setEditing({ ...editing!, image: b64 });
                }} />
                {editing.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={editing.image} alt="preview" className="mt-2 max-h-40 rounded border" />
                )}
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="secondary" onClick={resetEditing}>Cancel</Button>
                <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
