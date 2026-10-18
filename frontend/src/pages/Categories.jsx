import { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { categoryAPI } from '../services/api';

const ICONS = ['🍔', '🚗', '🛒', '💡', '🎮', '💊', '📚', '📦', '🏠', '✈️', '👕', '💼', '🎬', '🏋️', '🎵', '💇', '🐾', '☕', '🎁', '💻'];
const COLORS = ['#f97316', '#3b82f6', '#ec4899', '#eab308', '#8b5cf6', '#10b981', '#06b6d4', '#6b7280', '#ef4444', '#14b8a6', '#f43f5e', '#84cc16', '#a855f7', '#0ea5e9', '#d946ef'];

export default function Categories() {
    const { addToast } = useToast();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ name: '', color: '#6366f1', icon: '📁' });

    useEffect(() => { loadCategories(); }, []);

    const loadCategories = async () => {
        try {
            const res = await categoryAPI.getAll();
            setCategories(res.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const openAdd = () => {
        setEditing(null);
        setForm({ name: '', color: '#6366f1', icon: '📁' });
        setShowModal(true);
    };

    const openEdit = (cat) => {
        setEditing(cat);
        setForm({ name: cat.name, color: cat.color, icon: cat.icon });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editing) {
                await categoryAPI.update(editing.id, form);
                addToast('Category updated!');
            } else {
                await categoryAPI.create(form);
                addToast('Category created!');
            }
            setShowModal(false);
            loadCategories();
        } catch (err) {
            addToast(err.response?.data?.error || 'Error', 'error');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this category? Transactions will keep their data.')) return;
        try {
            await categoryAPI.delete(id);
            addToast('Category deleted!');
            loadCategories();
        } catch (err) { addToast('Error deleting', 'error'); }
    };

    if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

    return (
        <div className="animate-fadeIn">
            <div className="page-header">
                <div>
                    <h2>Categories</h2>
                    <p className="subtitle">Organize your expenses into categories</p>
                </div>
                <button className="btn btn-primary" onClick={openAdd}>+ Add Category</button>
            </div>

            {categories.length > 0 ? (
                <div className="category-grid">
                    {categories.map(cat => (
                        <div key={cat.id} className="category-card" style={{ '--cat-color': cat.color }}>
                            <div className="cat-actions">
                                <button className="btn btn-secondary btn-sm" onClick={() => openEdit(cat)}>✏️</button>
                                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(cat.id)}>🗑️</button>
                            </div>
                            <div className="cat-icon">{cat.icon}</div>
                            <div className="cat-name">{cat.name}</div>
                            <div style={{ width: '24px', height: '4px', borderRadius: '2px', background: cat.color, marginTop: '8px' }}></div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="card">
                    <div className="empty-state">
                        <div className="empty-icon">📁</div>
                        <p>No categories yet</p>
                        <button className="btn btn-primary" onClick={openAdd}>Create your first category</button>
                    </div>
                </div>
            )}

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{editing ? 'Edit Category' : 'Add Category'}</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Category Name</label>
                                <input type="text" className="form-control" placeholder="e.g., Food & Drinks" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                            </div>

                            <div className="form-group">
                                <label>Icon</label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {ICONS.map(icon => (
                                        <button type="button" key={icon} onClick={() => setForm({ ...form, icon })}
                                            style={{
                                                fontSize: '22px', padding: '8px', borderRadius: '8px', cursor: 'pointer',
                                                background: form.icon === icon ? 'var(--accent-primary)' : 'var(--bg-glass)',
                                                border: form.icon === icon ? '2px solid var(--accent-primary-hover)' : '1px solid var(--border-color)',
                                                transition: 'all 0.15s'
                                            }}>
                                            {icon}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Color</label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {COLORS.map(color => (
                                        <button type="button" key={color} onClick={() => setForm({ ...form, color })}
                                            style={{
                                                width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer',
                                                background: color, border: form.color === color ? '3px solid white' : '2px solid transparent',
                                                transition: 'all 0.15s', boxShadow: form.color === color ? `0 0 12px ${color}` : 'none'
                                            }}>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div style={{ textAlign: 'center', padding: '16px', background: 'var(--bg-glass)', borderRadius: '12px', margin: '8px 0' }}>
                                <span style={{ fontSize: '40px' }}>{form.icon}</span>
                                <div style={{ fontWeight: '600', marginTop: '8px' }}>{form.name || 'Category Name'}</div>
                                <div style={{ width: '32px', height: '4px', borderRadius: '2px', background: form.color, margin: '8px auto 0' }}></div>
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Create'} Category</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
