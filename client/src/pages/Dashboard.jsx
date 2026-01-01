import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Dashboard({ setIsAuthenticated }) {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [workorders, setWorkorders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        project: '',
        wo: '',
        po: '',
        state: '',
        status: 'Pending',
        date: '',
        pm: '',
        notes: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }
        fetchWorkOrders();
    }, []);

    const fetchWorkOrders = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch('http://localhost:5000/api/workorders', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                setWorkorders(data.workorders);
            }
        } catch (error) {
            console.error('Error fetching work orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
        navigate('/login');
    };

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        if (!formData.project || !formData.wo) {
            setMessage({ type: 'error', text: 'Project and WO# are required' });
            return;
        }

        setSubmitting(true);
        const token = localStorage.getItem('token');

        try {
            const response = await fetch('http://localhost:5000/api/workorders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                setMessage({ type: 'success', text: 'Work order created successfully!' });
                setFormData({ project: '', wo: '', po: '', state: '', status: 'Pending', date: '', pm: '', notes: '' });
                setShowForm(false);
                fetchWorkOrders();
            } else {
                setMessage({ type: 'error', text: data.error || 'Failed to create work order' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Network error. Please try again.' });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navigation */}
            <nav className="bg-white px-8 py-4 flex justify-between items-center shadow-sm">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
                    Monday.com Automation
                </h2>
                <div className="flex items-center gap-4">
                    <span className="text-gray-700 font-medium">Welcome, {user?.name || user?.email}</span>
                    <button
                        onClick={handleLogout}
                        className="px-5 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-all hover:-translate-y-0.5"
                    >
                        Logout
                    </button>
                </div>
            </nav>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-5 py-8">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900">Work Orders Dashboard</h1>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl font-semibold transition-all hover:shadow-xl hover:-translate-y-0.5"
                    >
                        {showForm ? 'Cancel' : '+ New Work Order'}
                    </button>
                </div>

                {/* Messages */}
                {message.text && (
                    <div className={`px-4 py-3 rounded-xl mb-5 text-center animate-[slideDown_0.3s_ease-out] ${message.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                        }`}>
                        {message.text}
                    </div>
                )}

                {/* Work Order Form */}
                {showForm && (
                    <div className="bg-white rounded-2xl p-8 mb-8 shadow-lg animate-[slideDown_0.3s_ease-out]">
                        <h3 className="text-xl font-semibold text-gray-900 mb-6">Create New Work Order</h3>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label htmlFor="project" className="block mb-2 font-semibold text-gray-700 text-sm">Project *</label>
                                    <input
                                        type="text"
                                        id="project"
                                        name="project"
                                        value={formData.project}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-base transition-all focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-100"
                                        placeholder="Project name/address"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="wo" className="block mb-2 font-semibold text-gray-700 text-sm">WO# *</label>
                                    <input
                                        type="text"
                                        id="wo"
                                        name="wo"
                                        value={formData.wo}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-base transition-all focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-100"
                                        placeholder="Work order number"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label htmlFor="po" className="block mb-2 font-semibold text-gray-700 text-sm">PO#</label>
                                    <input
                                        type="text"
                                        id="po"
                                        name="po"
                                        value={formData.po}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-base transition-all focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-100"
                                        placeholder="Purchase order number"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="state" className="block mb-2 font-semibold text-gray-700 text-sm">Province/Region</label>
                                    <select
                                        id="state"
                                        name="state"
                                        value={formData.state}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-base transition-all focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-100"
                                    >
                                        <option value="">Select Province</option>
                                        <option value="Punjab">Punjab</option>
                                        <option value="Sindh">Sindh</option>
                                        <option value="KPK">Khyber Pakhtunkhwa (KPK)</option>
                                        <option value="Balochistan">Balochistan</option>
                                        <option value="Gilgit-Baltistan">Gilgit-Baltistan</option>
                                        <option value="AJK">Azad Jammu & Kashmir (AJK)</option>
                                        {/* <option value="Islamabad">Islamabad Capital Territory</option> */}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label htmlFor="status" className="block mb-2 font-semibold text-gray-700 text-sm">Status</label>
                                    <select
                                        id="status"
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-base transition-all focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-100"
                                    >
                                        <option value="">Select Status</option>
                                        <option value="Pending">Pending</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="Completed">Completed</option>
                                        <option value="On Hold">On Hold</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="date" className="block mb-2 font-semibold text-gray-700 text-sm">Date</label>
                                    <input
                                        type="date"
                                        id="date"
                                        name="date"
                                        value={formData.date}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-base transition-all focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-100"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="pm" className="block mb-2 font-semibold text-gray-700 text-sm">Project Manager</label>
                                <input
                                    type="text"
                                    id="pm"
                                    name="pm"
                                    value={formData.pm}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-base transition-all focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-100"
                                    placeholder="Project manager name"
                                />
                            </div>

                            <div>
                                <label htmlFor="notes" className="block mb-2 font-semibold text-gray-700 text-sm">Notes</label>
                                <textarea
                                    id="notes"
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-base transition-all focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-100 resize-vertical"
                                    placeholder="Additional notes or instructions"
                                    rows="4"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full py-3.5 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl font-semibold transition-all hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {submitting ? 'Creating...' : 'Create Work Order'}
                            </button>
                        </form>
                    </div>
                )}

                {/* Work Orders List */}
                <div className="bg-white rounded-2xl p-8 shadow-lg">
                    <h3 className="text-xl font-semibold text-gray-900 mb-6">Recent Work Orders</h3>
                    {loading ? (
                        <p className="text-gray-600">Loading work orders...</p>
                    ) : workorders.length === 0 ? (
                        <p className="text-center text-gray-600 py-10">No work orders yet. Create your first one!</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {workorders.map((wo) => (
                                <div
                                    key={wo.id}
                                    className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border-2 border-blue-100 transition-all hover:-translate-y-1 hover:shadow-xl hover:border-primary-500 cursor-pointer"
                                >
                                    <div className="flex justify-between items-start mb-4 pb-3 border-b-2 border-blue-100">
                                        <h4 className="text-gray-900 font-semibold text-base flex-1 mr-3">{wo.project}</h4>
                                        <span className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap">
                                            WO# {wo.wo}
                                        </span>
                                    </div>
                                    <div className="space-y-2 text-sm text-gray-700">
                                        {wo.po && <p><strong className="text-gray-900 font-semibold">PO#:</strong> {wo.po}</p>}
                                        {wo.state && <p><strong className="text-gray-900 font-semibold">State:</strong> {wo.state}</p>}
                                        {wo.pm && <p><strong className="text-gray-900 font-semibold">PM:</strong> {wo.pm}</p>}
                                        {wo.notes && <p><strong className="text-gray-900 font-semibold">Notes:</strong> {wo.notes}</p>}
                                    </div>
                                    <div className="mt-4 pt-3 border-t border-blue-100">
                                        <small className="text-gray-500 text-xs">{new Date(wo.created_at).toLocaleDateString()}</small>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
