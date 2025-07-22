import React, { useEffect, useState } from 'react';
import { AlertTriangle, Shield, Clock, CheckCircle, XCircle, Eye, AlertCircle, TrendingUp, MessageSquare, Zap, X } from 'lucide-react';
import useAlertStore from '../stores/alerts';
import { BreachAlert, AlertSeverity, AlertStatus } from '../types/alerts';

const AlertsDashboard = () => {
  const {
    alerts,
    alertsLoading,
    alertsError,
    actionStatistics,
    fetchAlerts,
    fetchActionStatistics,
    openActionModal,
    acknowledgeAlert,
    markAsResolved,
    markAsFalsePositive,
    escalateAlert
  } = useAlertStore();

  const [filter, setFilter] = useState<{
    status?: AlertStatus;
    severity?: AlertSeverity;
    search?: string;
  }>({});

  const [selectedAlert, setSelectedAlert] = useState<BreachAlert | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    fetchAlerts();
    fetchActionStatistics();
  }, [fetchAlerts, fetchActionStatistics]);

  const getSeverityColor = (severity: AlertSeverity) => {
    switch (severity) {
      case AlertSeverity.CRITICAL: return 'text-red-600 bg-red-50 border-red-200';
      case AlertSeverity.HIGH: return 'text-orange-600 bg-orange-50 border-orange-200';
      case AlertSeverity.MEDIUM: return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case AlertSeverity.LOW: return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: AlertSeverity) => {
    switch (severity) {
      case AlertSeverity.CRITICAL: return <AlertTriangle className="w-4 h-4" />;
      case AlertSeverity.HIGH: return <AlertCircle className="w-4 h-4" />;
      case AlertSeverity.MEDIUM: return <Clock className="w-4 h-4" />;
      case AlertSeverity.LOW: return <Shield className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: AlertStatus) => {
    switch (status) {
      case AlertStatus.NEW: return 'text-red-600 bg-red-50';
      case AlertStatus.VIEWED: return 'text-blue-600 bg-blue-50';
      case AlertStatus.ACKNOWLEDGED: return 'text-yellow-600 bg-yellow-50';
      case AlertStatus.RESOLVED: return 'text-green-600 bg-green-50';
      case AlertStatus.DISMISSED: return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const handleQuickAction = async (alertId: number, action: string) => {
    setActionLoading(alertId);
    try {
      switch (action) {
        case 'acknowledge':
          await acknowledgeAlert(alertId);
          break;
        case 'resolve':
          await markAsResolved(alertId, 'Resolved from dashboard');
          break;
        case 'false-positive':
          await markAsFalsePositive(alertId, 'Marked as false positive from dashboard');
          break;
        case 'escalate':
          await escalateAlert(alertId, 'Escalated from dashboard', 'HIGH');
          break;
      }
    } catch (error) {
      console.error('Action failed:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    if (filter.status && alert.status !== filter.status) return false;
    if (filter.severity && alert.severity !== filter.severity) return false;
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      return (
        alert.title.toLowerCase().includes(searchLower) ||
        alert.description.toLowerCase().includes(searchLower) ||
        alert.affectedEmail?.toLowerCase().includes(searchLower) ||
        alert.breachSource.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const stats = {
    total: alerts.length,
    new: alerts.filter(a => a.status === AlertStatus.NEW).length,
    critical: alerts.filter(a => a.severity === AlertSeverity.CRITICAL).length,
    resolved: alerts.filter(a => a.status === AlertStatus.RESOLVED).length,
  };

  if (alertsLoading && alerts.length === 0) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-24 rounded-lg"></div>
            ))}
          </div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-20 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Security Alerts</h1>
          <p className="text-gray-600 mt-1">Monitor and respond to security threats</p>
        </div>
        
        {actionStatistics?.hasPendingActions && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-blue-700">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">
                {actionStatistics.pendingActions} pending action{actionStatistics.pendingActions !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Alerts</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">New Alerts</p>
              <p className="text-2xl font-bold text-red-600">{stats.new}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Critical</p>
              <p className="text-2xl font-bold text-orange-600">{stats.critical}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Resolved</p>
              <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              className="border border-gray-300 rounded-md px-3 py-2 text-sm w-64"
              placeholder="Search alerts..."
              value={filter.search || ''}
              onChange={(e) => setFilter({ ...filter, search: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              value={filter.status || ''}
              onChange={(e) => setFilter({ ...filter, status: e.target.value as AlertStatus || undefined })}
            >
              <option value="">All Statuses</option>
              <option value={AlertStatus.NEW}>New</option>
              <option value={AlertStatus.VIEWED}>Viewed</option>
              <option value={AlertStatus.ACKNOWLEDGED}>Acknowledged</option>
              <option value={AlertStatus.RESOLVED}>Resolved</option>
              <option value={AlertStatus.DISMISSED}>Dismissed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
            <select
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              value={filter.severity || ''}
              onChange={(e) => setFilter({ ...filter, severity: e.target.value as AlertSeverity || undefined })}
            >
              <option value="">All Severities</option>
              <option value={AlertSeverity.CRITICAL}>Critical</option>
              <option value={AlertSeverity.HIGH}>High</option>
              <option value={AlertSeverity.MEDIUM}>Medium</option>
              <option value={AlertSeverity.LOW}>Low</option>
            </select>
          </div>

          {(filter.status || filter.severity || filter.search) && (
            <button
              onClick={() => setFilter({})}
              className="text-sm text-gray-600 hover:text-gray-800 px-3 py-2 border border-gray-300 rounded-md"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Error Display */}
      {alertsError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm">{alertsError}</span>
          </div>
        </div>
      )}

      {/* Alerts List */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Security Alerts ({filteredAlerts.length})
          </h2>
        </div>

        {filteredAlerts.length === 0 ? (
          <div className="p-8 text-center">
            <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No alerts found matching your criteria.</p>
            {Object.keys(filter).length > 0 && (
              <button
                onClick={() => setFilter({})}
                className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
              >
                Clear filters to see all alerts
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredAlerts.map((alert) => (
              <div key={alert.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border ${getSeverityColor(alert.severity)}`}>
                        {getSeverityIcon(alert.severity)}
                        {alert.severity}
                      </div>
                      
                      <div className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${getStatusColor(alert.status)}`}>
                        {alert.status}
                      </div>
                      
                      <span className="text-xs text-gray-500">
                        {new Date(alert.createdAt).toLocaleDateString()} • {alert.breachSource}
                      </span>
                    </div>

                    <h3 className="text-lg font-medium text-gray-900 mb-2">{alert.title}</h3>
                    
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{alert.description}</p>
                    
                    {alert.affectedEmail && (
                      <div className="text-sm text-gray-700 mb-3">
                        <span className="font-medium">Affected:</span> {alert.affectedEmail}
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      {alert.riskScore && (
                        <span>Risk Score: {alert.riskScore}/100</span>
                      )}
                      {alert.confidenceLevel && (
                        <span>Confidence: {alert.confidenceLevel}%</span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    {/* Quick Actions */}
                    <div className="flex gap-1">
                      {alert.status === AlertStatus.NEW && (
                        <button
                          onClick={() => handleQuickAction(alert.id, 'acknowledge')}
                          disabled={actionLoading === alert.id}
                          className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                          title="Acknowledge"
                        >
                          {actionLoading === alert.id ? (
                            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      )}

                      {(alert.status === AlertStatus.NEW || alert.status === AlertStatus.VIEWED || alert.status === AlertStatus.ACKNOWLEDGED) && (
                        <>
                          <button
                            onClick={() => handleQuickAction(alert.id, 'resolve')}
                            disabled={actionLoading === alert.id}
                            className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-md transition-colors"
                            title="Mark as Resolved"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleQuickAction(alert.id, 'false-positive')}
                            disabled={actionLoading === alert.id}
                            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-md transition-colors"
                            title="Mark as False Positive"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleQuickAction(alert.id, 'escalate')}
                            disabled={actionLoading === alert.id}
                            className="p-2 text-orange-600 hover:text-orange-800 hover:bg-orange-50 rounded-md transition-colors"
                            title="Escalate"
                          >
                            <Zap className="w-4 h-4" />
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => openActionModal(alert.id)}
                        className="p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-md transition-colors"
                        title="Service Request"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      onClick={() => setSelectedAlert(selectedAlert?.id === alert.id ? null : alert)}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      {selectedAlert?.id === alert.id ? 'Hide Details' : 'View Details'}
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {selectedAlert?.id === alert.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Breach Details</h4>
                        <div className="space-y-1 text-gray-600">
                          <div><span className="font-medium">Source:</span> {alert.breachSource}</div>
                          {alert.breachDate && (
                            <div><span className="font-medium">Date:</span> {new Date(alert.breachDate).toLocaleDateString()}</div>
                          )}
                          {alert.affectedDomain && (
                            <div><span className="font-medium">Domain:</span> {alert.affectedDomain}</div>
                          )}
                          {alert.affectedUsername && (
                            <div><span className="font-medium">Username:</span> {alert.affectedUsername}</div>
                          )}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Alert Status</h4>
                        <div className="space-y-1 text-gray-600">
                          <div><span className="font-medium">Created:</span> {new Date(alert.createdAt).toLocaleString()}</div>
                          {alert.viewedAt && (
                            <div><span className="font-medium">Viewed:</span> {new Date(alert.viewedAt).toLocaleString()}</div>
                          )}
                          {alert.acknowledgedAt && (
                            <div><span className="font-medium">Acknowledged:</span> {new Date(alert.acknowledgedAt).toLocaleString()}</div>
                          )}
                          {alert.resolvedAt && (
                            <div><span className="font-medium">Resolved:</span> {new Date(alert.resolvedAt).toLocaleString()}</div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <h4 className="font-medium text-gray-900 mb-2">Full Description</h4>
                      <p className="text-gray-600 text-sm whitespace-pre-wrap">{alert.description}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Loading indicator for refresh */}
      {alertsLoading && alerts.length > 0 && (
        <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm">Refreshing alerts...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertsDashboard;
