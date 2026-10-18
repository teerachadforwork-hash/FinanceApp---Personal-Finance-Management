import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { summaryAPI, authAPI } from '../services/api';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function Dashboard() {
    const { user, updateUser } = useAuth();
    const { addToast } = useToast();
    const [overview, setOverview] = useState(null);
    const [dailyAmount, setDailyAmount] = useState(user?.daily_amount || 0);
    const [editingAmount, setEditingAmount] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadOverview();
    }, []);

    const loadOverview = async () => {
        try {
            const res = await summaryAPI.getOverview();
            setOverview(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const saveDailyAmount = async () => {
        try {
            await authAPI.updateDailyAmount(Number(dailyAmount));
            updateUser({ daily_amount: Number(dailyAmount) });
            setEditingAmount(false);
            addToast('Daily amount updated!');
            loadOverview();
        } catch (err) {
            addToast('Failed to update', 'error');
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(amount || 0);
    };

    if (loading) {
        return <div className="loading-spinner"><div className="spinner"></div></div>;
    }

    const categoryChartData = overview?.top_categories?.length > 0 ? {
        labels: overview.top_categories.map(c => c.name),
        datasets: [{
            data: overview.top_categories.map(c => c.total),
            backgroundColor: overview.top_categories.map(c => c.color),
            borderWidth: 0,
            hoverOffset: 8,
        }],
    } : null;

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: { color: '#a0a0b8', padding: 16, font: { family: 'Inter', size: 12 } },
            },
        },
    };

    return (
        <div className="animate-fadeIn">
            <div className="page-header">
                <div>
                    <h2>Dashboard</h2>
                    <p className="subtitle">Welcome back, {user?.username}! Here's your financial overview.</p>
                </div>
            </div>

            {/* Daily Amount Setting */}
            <div className="daily-amount-card">
                <span style={{ fontSize: '24px' }}>💵</span>
                <div>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Daily Starting Amount</div>
                    {editingAmount ? (
                        <div className="daily-amount-input">
                            <input
                                type="number"
                                value={dailyAmount}
                                onChange={(e) => setDailyAmount(e.target.value)}
                                autoFocus
                            />
                            <button className="btn btn-primary btn-sm" onClick={saveDailyAmount}>Save</button>
                            <button className="btn btn-secondary btn-sm" onClick={() => setEditingAmount(false)}>Cancel</button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ fontSize: '22px', fontWeight: '700' }}>{formatCurrency(user?.daily_amount)}</span>
                            <button className="btn btn-secondary btn-sm" onClick={() => { setDailyAmount(user?.daily_amount || 0); setEditingAmount(true); }}>Edit</button>
                        </div>
                    )}
                </div>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card" style={{ '--stat-accent': 'linear-gradient(90deg, #10b981, #34d399)' }}>
                    <div className="stat-icon">📅</div>
                    <div className="stat-label">Today's Remaining</div>
                    <div className={`stat-value ${(overview?.today?.remaining || 0) >= 0 ? 'stat-positive' : 'stat-negative'}`}>
                        {formatCurrency(overview?.today?.remaining)}
                    </div>
                    <div className="stat-sub">Spent: {formatCurrency(overview?.today?.spent)} today</div>
                </div>

                <div className="stat-card" style={{ '--stat-accent': 'linear-gradient(90deg, #6366f1, #818cf8)' }}>
                    <div className="stat-icon">💸</div>
                    <div className="stat-label">Today's Spending</div>
                    <div className="stat-value">{formatCurrency(overview?.today?.spent)}</div>
                    <div className="stat-sub">Budget: {formatCurrency(overview?.today?.daily_amount)}</div>
                </div>

                <div className="stat-card" style={{ '--stat-accent': 'linear-gradient(90deg, #f59e0b, #fbbf24)' }}>
                    <div className="stat-icon">📆</div>
                    <div className="stat-label">This Month</div>
                    <div className="stat-value">{formatCurrency(overview?.month?.spent)}</div>
                    <div className="stat-sub">{overview?.month?.month}</div>
                </div>

                <div className="stat-card" style={{ '--stat-accent': 'linear-gradient(90deg, #ec4899, #f472b6)' }}>
                    <div className="stat-icon">⚠️</div>
                    <div className="stat-label">Budget Alerts</div>
                    <div className={`stat-value ${(overview?.budget_alerts?.length || 0) > 0 ? 'stat-warning' : 'stat-positive'}`}>
                        {overview?.budget_alerts?.length || 0}
                    </div>
                    <div className="stat-sub">Categories near/over budget</div>
                </div>
            </div>

            <div className="grid-2">
                {/* Category Breakdown Chart */}
                <div className="card">
                    <div className="card-header">
                        <span className="card-title">Spending by Category</span>
                    </div>
                    {categoryChartData ? (
                        <div className="chart-container chart-container-sm">
                            <Doughnut data={categoryChartData} options={chartOptions} />
                        </div>
                    ) : (
                        <div className="empty-state">
                            <div className="empty-icon">📊</div>
                            <p>No transactions this month yet</p>
                        </div>
                    )}
                </div>

                {/* Recent Transactions */}
                <div className="card">
                    <div className="card-header">
                        <span className="card-title">Recent Transactions</span>
                    </div>
                    {overview?.recent_transactions?.length > 0 ? (
                        <div>
                            {overview.recent_transactions.map(t => (
                                <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: '1px solid var(--border-color)' }}>
                                    <span style={{ fontSize: '20px' }}>{t.category_icon || '📦'}</span>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: '500', fontSize: '14px' }}>{t.category_name || 'Uncategorized'}</div>
                                        <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{t.note || t.date}</div>
                                    </div>
                                    <div style={{ fontWeight: '600', color: 'var(--danger)' }}>-{formatCurrency(t.amount)}</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <div className="empty-icon">💸</div>
                            <p>No transactions yet</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Budget Alerts */}
            {overview?.budget_alerts?.length > 0 && (
                <div style={{ marginTop: '28px' }}>
                    <h3 style={{ marginBottom: '16px', fontSize: '16px' }}>⚠️ Budget Alerts</h3>
                    {overview.budget_alerts.map((alert, i) => (
                        <div key={i} className={`alert ${alert.over_budget ? 'alert-danger' : 'alert-warning'}`}>
                            <span className="alert-icon">{alert.category_icon}</span>
                            <div>
                                <strong>{alert.category_name}</strong>: {alert.percentage}% used
                                ({formatCurrency(alert.spent)} of {formatCurrency(alert.budget)})
                                {alert.over_budget && ' — Over budget!'}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
