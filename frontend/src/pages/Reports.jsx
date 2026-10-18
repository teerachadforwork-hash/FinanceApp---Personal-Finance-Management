import { useState, useEffect } from 'react';
import { summaryAPI } from '../services/api';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement);

export default function Reports() {
    const [monthly, setMonthly] = useState(null);
    const [daily, setDaily] = useState(null);
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [tab, setTab] = useState('monthly');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (tab === 'monthly') loadMonthly();
        else loadDaily();
    }, [tab, selectedMonth, selectedDate]);

    const loadMonthly = async () => {
        setLoading(true);
        try {
            const res = await summaryAPI.getMonthly(selectedMonth);
            setMonthly(res.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const loadDaily = async () => {
        setLoading(true);
        try {
            const res = await summaryAPI.getDaily(selectedDate);
            setDaily(res.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(amount || 0);
    };

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

    const barOptions = {
        ...chartOptions,
        scales: {
            x: { ticks: { color: '#6b6b80', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.05)' } },
            y: { ticks: { color: '#6b6b80' }, grid: { color: 'rgba(255,255,255,0.05)' } },
        },
    };

    return (
        <div className="animate-fadeIn">
            <div className="page-header">
                <div>
                    <h2>Reports</h2>
                    <p className="subtitle">Analyze your spending patterns</p>
                </div>
            </div>

            {/* Tab Selector */}
            <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-glass)', borderRadius: '12px', padding: '4px', width: 'fit-content', marginBottom: '24px' }}>
                <button
                    className={tab === 'monthly' ? 'btn btn-primary btn-sm' : 'btn btn-sm'}
                    style={tab !== 'monthly' ? { background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' } : {}}
                    onClick={() => setTab('monthly')}
                >📆 Monthly</button>
                <button
                    className={tab === 'daily' ? 'btn btn-primary btn-sm' : 'btn btn-sm'}
                    style={tab !== 'daily' ? { background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' } : {}}
                    onClick={() => setTab('daily')}
                >📅 Daily</button>
            </div>

            {loading ? (
                <div className="loading-spinner"><div className="spinner"></div></div>
            ) : tab === 'monthly' && monthly ? (
                <div>
                    {/* Month Selector */}
                    <div style={{ marginBottom: '24px' }}>
                        <input type="month" className="form-control" style={{ width: 'auto' }} value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} />
                    </div>

                    {/* Stats */}
                    <div className="stats-grid">
                        <div className="stat-card" style={{ '--stat-accent': 'linear-gradient(90deg, #6366f1, #818cf8)' }}>
                            <div className="stat-icon">💸</div>
                            <div className="stat-label">Total Spent</div>
                            <div className="stat-value">{formatCurrency(monthly.total_spent)}</div>
                            <div className="stat-sub">{monthly.transaction_count} transactions</div>
                        </div>
                        <div className="stat-card" style={{ '--stat-accent': 'linear-gradient(90deg, #10b981, #34d399)' }}>
                            <div className="stat-icon">📊</div>
                            <div className="stat-label">Daily Average</div>
                            <div className="stat-value">{formatCurrency(monthly.daily_average)}</div>
                        </div>
                        <div className="stat-card" style={{ '--stat-accent': monthly.remaining >= 0 ? 'linear-gradient(90deg, #10b981, #34d399)' : 'linear-gradient(90deg, #ef4444, #f87171)' }}>
                            <div className="stat-icon">{monthly.remaining >= 0 ? '✅' : '🚨'}</div>
                            <div className="stat-label">Monthly Remaining</div>
                            <div className={`stat-value ${monthly.remaining >= 0 ? 'stat-positive' : 'stat-negative'}`}>
                                {formatCurrency(monthly.remaining)}
                            </div>
                            <div className="stat-sub">Budget: {formatCurrency(monthly.monthly_budget)}</div>
                        </div>
                    </div>

                    <div className="grid-2">
                        {/* Category Breakdown */}
                        <div className="card">
                            <div className="card-header"><span className="card-title">By Category</span></div>
                            {monthly.by_category?.length > 0 ? (
                                <div className="chart-container">
                                    <Doughnut data={{
                                        labels: monthly.by_category.map(c => c.name),
                                        datasets: [{
                                            data: monthly.by_category.map(c => c.total),
                                            backgroundColor: monthly.by_category.map(c => c.color),
                                            borderWidth: 0, hoverOffset: 8,
                                        }],
                                    }} options={chartOptions} />
                                </div>
                            ) : <div className="empty-state"><p>No data</p></div>}
                        </div>

                        {/* Daily Spending Bar Chart */}
                        <div className="card">
                            <div className="card-header"><span className="card-title">Daily Spending</span></div>
                            {monthly.daily_breakdown?.length > 0 ? (
                                <div className="chart-container">
                                    <Bar data={{
                                        labels: monthly.daily_breakdown.map(d => d.date.slice(-2)),
                                        datasets: [{
                                            label: 'Spent',
                                            data: monthly.daily_breakdown.map(d => d.total),
                                            backgroundColor: 'rgba(99, 102, 241, 0.6)',
                                            borderRadius: 4,
                                        }],
                                    }} options={barOptions} />
                                </div>
                            ) : <div className="empty-state"><p>No data</p></div>}
                        </div>
                    </div>

                    {/* Category Table */}
                    {monthly.by_category?.length > 0 && (
                        <div className="card mt-4">
                            <div className="card-header"><span className="card-title">Category Details</span></div>
                            <div className="table-container" style={{ border: 'none' }}>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Category</th>
                                            <th style={{ textAlign: 'right' }}>Transactions</th>
                                            <th style={{ textAlign: 'right' }}>Total</th>
                                            <th style={{ textAlign: 'right' }}>% of Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {monthly.by_category.map((cat, i) => (
                                            <tr key={i}>
                                                <td>
                                                    <span className="badge badge-category" style={{ '--cat-color': `${cat.color}22` }}>
                                                        {cat.icon} {cat.name}
                                                    </span>
                                                </td>
                                                <td style={{ textAlign: 'right' }}>{cat.count}</td>
                                                <td style={{ textAlign: 'right', fontWeight: '600' }}>{formatCurrency(cat.total)}</td>
                                                <td style={{ textAlign: 'right', color: 'var(--text-muted)' }}>
                                                    {monthly.total_spent > 0 ? Math.round((cat.total / monthly.total_spent) * 100) : 0}%
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            ) : tab === 'daily' && daily ? (
                <div>
                    <div style={{ marginBottom: '24px' }}>
                        <input type="date" className="form-control" style={{ width: 'auto' }} value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
                    </div>

                    <div className="stats-grid">
                        <div className="stat-card" style={{ '--stat-accent': 'linear-gradient(90deg, #6366f1, #818cf8)' }}>
                            <div className="stat-icon">💵</div>
                            <div className="stat-label">Daily Budget</div>
                            <div className="stat-value">{formatCurrency(daily.daily_amount)}</div>
                        </div>
                        <div className="stat-card" style={{ '--stat-accent': 'linear-gradient(90deg, #f97316, #fb923c)' }}>
                            <div className="stat-icon">💸</div>
                            <div className="stat-label">Total Spent</div>
                            <div className="stat-value">{formatCurrency(daily.total_spent)}</div>
                        </div>
                        <div className="stat-card" style={{ '--stat-accent': daily.remaining >= 0 ? 'linear-gradient(90deg, #10b981, #34d399)' : 'linear-gradient(90deg, #ef4444, #f87171)' }}>
                            <div className="stat-icon">{daily.remaining >= 0 ? '✅' : '🚨'}</div>
                            <div className="stat-label">Remaining</div>
                            <div className={`stat-value ${daily.remaining >= 0 ? 'stat-positive' : 'stat-negative'}`}>
                                {formatCurrency(daily.remaining)}
                            </div>
                        </div>
                    </div>

                    {daily.by_category?.length > 0 ? (
                        <div className="grid-2">
                            <div className="card">
                                <div className="card-header"><span className="card-title">Spending by Category</span></div>
                                <div className="chart-container chart-container-sm">
                                    <Doughnut data={{
                                        labels: daily.by_category.map(c => c.name),
                                        datasets: [{
                                            data: daily.by_category.map(c => c.total),
                                            backgroundColor: daily.by_category.map(c => c.color),
                                            borderWidth: 0, hoverOffset: 8
                                        }],
                                    }} options={chartOptions} />
                                </div>
                            </div>
                            <div className="card">
                                <div className="card-header"><span className="card-title">Breakdown</span></div>
                                {daily.by_category.map((cat, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: '1px solid var(--border-color)' }}>
                                        <span>{cat.icon}</span>
                                        <div style={{ flex: 1, fontWeight: '500' }}>{cat.name}</div>
                                        <div style={{ fontWeight: '600' }}>{formatCurrency(cat.total)}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="card">
                            <div className="empty-state">
                                <div className="empty-icon">📅</div>
                                <p>No spending recorded for {selectedDate}</p>
                            </div>
                        </div>
                    )}
                </div>
            ) : null}
        </div>
    );
}
