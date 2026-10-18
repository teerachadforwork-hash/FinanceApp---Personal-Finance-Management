import { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { budgetAPI, categoryAPI } from '../services/api';

export default function Budgets() {
    const { addToast } = useToast();
    const [budgets, setBudgets] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
    const [form, setForm] = useState({ category_id: '', amount: '', month: '' });

    useEffect(() => { loadData(); }, [selectedMonth]);

    const loadData = async () => {
        try {
            const [budgetRes, catRes] = await Promise.all([
                budgetAPI.getAll({ month: selectedMonth }),
                categoryAPI.getAll()
            ]);
            setBudgets(budgetRes.data);
            setCategories(catRes.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const openAdd = () => {
        setForm({ category_id: categories[0]?.id || '', amount: '', month: selectedMonth });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await budgetAPI.createOrUpdate({ ...form, amount: Number(form.amount) });
            addToast('Budget saved!');
            setShowModal(false);
            loadData();
        } catch (err) {
            addToast(err.response?.data?.error || 'Error', 'error');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Remove this budget?')) return;
        try {
            await budgetAPI.delete(id);
            addToast('Budget removed!');
            loadData();
        } catch (err) { addToast('Error deleting', 'error'); }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(amount || 0);
    };

    const getProgressClass = (percentage) => {
        if (percentage >= 100) return 'danger';
        if (percentage >= 80) return 'warning';
        return '';
    };

    const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
    const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);

    if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

    return (
        <div className="animate-fadeIn">
            <div className="page-header">
                <div>
                    <h2>Budgets</h2>
                    <p className="subtitle">Set and track spending limits per category</p>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <input type="month" className="form-control" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} />
                    <button className="btn btn-primary" onClick={openAdd}>+ Set Budget</button>
                </div>
            </div>

            {/* Summary */}
            {budgets.length > 0 && (
                <div className="stats-grid" style={{ marginBottom: '28px' }}>
                    <div className="stat-card" style={{ '--stat-accent': 'linear-gradient(90deg, #6366f1, #818cf8)' }}>
                        <div className="stat-icon">💰</div>
                        <div className="stat-label">Total Budget</div>
                        <div className="stat-value">{formatCurrency(totalBudget)}</div>
                    </div>
                    <div className="stat-card" style={{ '--stat-accent': 'linear-gradient(90deg, #f59e0b, #fbbf24)' }}>
                        <div className="stat-icon">💸</div>
                        <div className="stat-label">Total Spent</div>
                        <div className="stat-value">{formatCurrency(totalSpent)}</div>
                    </div>
                    <div className="stat-card" style={{ '--stat-accent': totalBudget - totalSpent >= 0 ? 'linear-gradient(90deg, #10b981, #34d399)' : 'linear-gradient(90deg, #ef4444, #f87171)' }}>
                        <div className="stat-icon">{totalBudget - totalSpent >= 0 ? '✅' : '🚨'}</div>
                        <div className="stat-label">Remaining</div>
                        <div className={`stat-value ${totalBudget - totalSpent >= 0 ? 'stat-positive' : 'stat-negative'}`}>
                            {formatCurrency(totalBudget - totalSpent)}
                        </div>
                    </div>
                </div>
            )}

            {/* Budget Cards */}
            {budgets.length > 0 ? (
                <div className="category-grid">
                    {budgets.map(budget => {
                        const percentage = budget.amount > 0 ? Math.round((budget.spent / budget.amount) * 100) : 0;
                        return (
                            <div key={budget.id} className="budget-card">
                                <div className="budget-header">
                                    <span style={{ fontSize: '28px' }}>{budget.category_icon}</span>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: '600' }}>{budget.category_name}</div>
                                    </div>
                                    <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDelete(budget.id)}>🗑️</button>
                                </div>
                                <div className="budget-amounts">
                                    <span>Spent: {formatCurrency(budget.spent)}</span>
                                    <span>Budget: {formatCurrency(budget.amount)}</span>
                                </div>
                                <div className="progress-bar">
                                    <div className={`progress-fill ${getProgressClass(percentage)}`} style={{ width: `${Math.min(percentage, 100)}%` }}></div>
                                </div>
                                <div className={`budget-percentage ${percentage >= 100 ? 'text-danger' : percentage >= 80 ? 'text-warning' : 'text-success'}`}>
                                    {percentage}%
                                    {budget.over_budget && <span style={{ fontSize: '13px', marginLeft: '8px' }}>⚠️ Over budget!</span>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="card">
                    <div className="empty-state">
                        <div className="empty-icon">💰</div>
                        <p>No budgets set for {selectedMonth}</p>
                        <button className="btn btn-primary" onClick={openAdd}>Set your first budget</button>
                    </div>
                </div>
            )}

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Set Budget</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Category</label>
                                <select className="form-control" value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} required>
                                    <option value="">Select Category</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                                </select>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Budget Amount (THB)</label>
                                    <input type="number" step="0.01" min="1" className="form-control" placeholder="0.00" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
                                </div>
                                <div className="form-group">
                                    <label>Month</label>
                                    <input type="month" className="form-control" value={form.month} onChange={(e) => setForm({ ...form, month: e.target.value })} required />
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Save Budget</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
