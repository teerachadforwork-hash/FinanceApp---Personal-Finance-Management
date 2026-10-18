import { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { transactionAPI, categoryAPI } from '../services/api';

export default function Transactions() {
    const { addToast } = useToast();
    const [transactions, setTransactions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [filters, setFilters] = useState({ category_id: '', start_date: '', end_date: '' });
    const [form, setForm] = useState({ category_id: '', amount: '', note: '', date: new Date().toISOString().split('T')[0] });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [txRes, catRes] = await Promise.all([
                transactionAPI.getAll(filters),
                categoryAPI.getAll()
            ]);
            setTransactions(txRes.data);
            setCategories(catRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = async () => {
        setLoading(true);
        try {
            const res = await transactionAPI.getAll(filters);
            setTransactions(res.data);
        } catch (err) {
            addToast('Failed to filter', 'error');
        } finally {
            setLoading(false);
        }
    };

    const openAdd = () => {
        setEditing(null);
        setForm({ category_id: '', amount: '', note: '', date: new Date().toISOString().split('T')[0] });
        setShowModal(true);
    };

    const openEdit = (tx) => {
        setEditing(tx);
        setForm({ category_id: tx.category_id || '', amount: tx.amount, note: tx.note || '', date: tx.date });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = { ...form, amount: Number(form.amount), category_id: form.category_id || null };
            if (editing) {
                await transactionAPI.update(editing.id, data);
                addToast('Transaction updated!');
            } else {
                await transactionAPI.create(data);
                addToast('Transaction added!');
            }
            setShowModal(false);
            loadData();
        } catch (err) {
            addToast(err.response?.data?.error || 'Error saving transaction', 'error');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this transaction?')) return;
        try {
            await transactionAPI.delete(id);
            addToast('Transaction deleted!');
            loadData();
        } catch (err) {
            addToast('Error deleting', 'error');
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(amount || 0);
    };

    const totalFiltered = transactions.reduce((sum, t) => sum + t.amount, 0);

    if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

    return (
        <div className="animate-fadeIn">
            <div className="page-header">
                <div>
                    <h2>Transactions</h2>
                    <p className="subtitle">Manage your income and expenses</p>
                </div>
                <button className="btn btn-primary" onClick={openAdd}>+ Add Transaction</button>
            </div>

            {/* Filters */}
            <div className="card mb-6">
                <div className="filter-bar">
                    <select className="form-control" value={filters.category_id} onChange={(e) => setFilters({ ...filters, category_id: e.target.value })}>
                        <option value="">All Categories</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                    </select>
                    <input type="date" className="form-control" value={filters.start_date} onChange={(e) => setFilters({ ...filters, start_date: e.target.value })} />
                    <input type="date" className="form-control" value={filters.end_date} onChange={(e) => setFilters({ ...filters, end_date: e.target.value })} />
                    <button className="btn btn-secondary" onClick={applyFilters}>Filter</button>
                    <button className="btn btn-secondary" onClick={() => { setFilters({ category_id: '', start_date: '', end_date: '' }); loadData(); }}>Reset</button>
                    <div style={{ marginLeft: 'auto', fontWeight: '600' }}>Total: {formatCurrency(totalFiltered)} ({transactions.length} items)</div>
                </div>
            </div>

            {/* Table */}
            {transactions.length > 0 ? (
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Category</th>
                                <th>Note</th>
                                <th style={{ textAlign: 'right' }}>Amount</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map(tx => (
                                <tr key={tx.id}>
                                    <td>{tx.date}</td>
                                    <td>
                                        <span className="badge badge-category" style={{ '--cat-color': tx.category_color ? `${tx.category_color}22` : undefined }}>
                                            {tx.category_icon || '📦'} {tx.category_name || 'Uncategorized'}
                                        </span>
                                    </td>
                                    <td style={{ color: 'var(--text-secondary)' }}>{tx.note || '—'}</td>
                                    <td style={{ textAlign: 'right', fontWeight: '600', color: 'var(--danger)' }}>
                                        -{formatCurrency(tx.amount)}
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <button className="btn btn-secondary btn-sm" onClick={() => openEdit(tx)} style={{ marginRight: '4px' }}>✏️</button>
                                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(tx.id)}>🗑️</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="card">
                    <div className="empty-state">
                        <div className="empty-icon">💸</div>
                        <p>No transactions found</p>
                        <button className="btn btn-primary" onClick={openAdd}>Add your first transaction</button>
                    </div>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{editing ? 'Edit Transaction' : 'Add Transaction'}</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Amount (THB)</label>
                                    <input type="number" step="0.01" min="0.01" className="form-control" placeholder="0.00" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
                                </div>
                                <div className="form-group">
                                    <label>Date</label>
                                    <input type="date" className="form-control" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Category</label>
                                <select className="form-control" value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
                                    <option value="">No Category</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Note</label>
                                <input type="text" className="form-control" placeholder="What was this for?" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Add'} Transaction</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
