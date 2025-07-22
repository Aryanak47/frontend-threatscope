import React, { useState, useEffect } from 'react';
import { X, Shield, Bug, AlertTriangle, Phone, FileCheck, GraduationCap, DollarSign, Clock, Send } from 'lucide-react';
import useAlertStore from '../stores/alerts';
import { AlertActionType, CreateAlertActionRequest } from '../types/alerts';

const AlertActionModal = () => {
  const {
    showActionModal,
    actionModalAlertId,
    actionTypes,
    actionsLoading,
    actionsError,
    closeActionModal,
    fetchActionTypes,
    createAlertAction
  } = useAlertStore();

  const [selectedActionType, setSelectedActionType] = useState<AlertActionType | null>(null);
  const [formData, setFormData] = useState<CreateAlertActionRequest>({
    actionType: AlertActionType.SECURITY_ASSESSMENT,
    userMessage: '',
    contactEmail: '',
    contactPhone: '',
    companyName: '',
    urgencyLevel: 'MEDIUM',
    estimatedBudget: '',
    preferredTimeline: '',
    additionalContext: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (showActionModal && actionTypes.length === 0) {
      fetchActionTypes();
    }
  }, [showActionModal, actionTypes.length, fetchActionTypes]);

  useEffect(() => {
    if (selectedActionType) {
      setFormData(prev => ({ ...prev, actionType: selectedActionType }));
    }
  }, [selectedActionType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionModalAlertId || !selectedActionType) return;

    setIsSubmitting(true);
    try {
      await createAlertAction(actionModalAlertId, formData);
      closeActionModal();
      // Reset form
      setSelectedActionType(null);
      setFormData({
        actionType: AlertActionType.SECURITY_ASSESSMENT,
        userMessage: '',
        contactEmail: '',
        contactPhone: '',
        companyName: '',
        urgencyLevel: 'MEDIUM',
        estimatedBudget: '',
        preferredTimeline: '',
        additionalContext: ''
      });
    } catch (error) {
      console.error('Failed to create action:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getActionIcon = (actionType: AlertActionType) => {
    switch (actionType) {
      case AlertActionType.SECURITY_ASSESSMENT: return <Shield className="w-5 h-5" />;
      case AlertActionType.CODE_INVESTIGATION: return <Bug className="w-5 h-5" />;
      case AlertActionType.INCIDENT_RESPONSE: return <AlertTriangle className="w-5 h-5" />;
      case AlertActionType.EXPERT_CONSULTATION: return <Phone className="w-5 h-5" />;
      case AlertActionType.COMPLIANCE_CHECK: return <FileCheck className="w-5 h-5" />;
      case AlertActionType.SECURITY_TRAINING: return <GraduationCap className="w-5 h-5" />;
      default: return <Shield className="w-5 h-5" />;
    }
  };

  const serviceRequestTypes = actionTypes.filter(type => type.isServiceRequest);

  if (!showActionModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Request Cybersecurity Services</h2>
          <button
            onClick={closeActionModal}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {!selectedActionType ? (
            /* Service Selection */
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  What type of cybersecurity assistance do you need?
                </h3>
                <p className="text-gray-600">
                  Our expert team is ready to help secure your organization
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {serviceRequestTypes.map((actionType) => (
                  <button
                    key={actionType.type}
                    type="button"
                    onClick={() => setSelectedActionType(actionType.type)}
                    className="p-4 border-2 border-gray-200 rounded-lg text-left hover:border-blue-500 hover:bg-blue-50 transition-all group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-blue-600 group-hover:text-blue-700">
                        {getActionIcon(actionType.type)}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">
                          {actionType.displayName}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {actionType.description}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Service Request Form */
            <div className="space-y-6">
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                <div className="text-blue-600">
                  {getActionIcon(selectedActionType)}
                </div>
                <div>
                  <h3 className="font-medium text-blue-900">
                    {actionTypes.find(t => t.type === selectedActionType)?.displayName}
                  </h3>
                  <p className="text-sm text-blue-700">
                    {actionTypes.find(t => t.type === selectedActionType)?.description}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedActionType(null)}
                  className="ml-auto text-blue-600 hover:text-blue-800"
                >
                  Change
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Contact Information */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Contact Information</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.contactEmail}
                      onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                      placeholder="your@company.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.contactPhone}
                      onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company Name
                    </label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      placeholder="Your Company Inc."
                    />
                  </div>
                </div>

                {/* Project Details */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Project Details</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Urgency Level
                    </label>
                    <select
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.urgencyLevel}
                      onChange={(e) => setFormData({ ...formData, urgencyLevel: e.target.value })}
                    >
                      <option value="LOW">Low - Within 30 days</option>
                      <option value="MEDIUM">Medium - Within 14 days</option>
                      <option value="HIGH">High - Within 7 days</option>
                      <option value="CRITICAL">Critical - ASAP</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <DollarSign className="w-4 h-4 inline mr-1" />
                      Estimated Budget
                    </label>
                    <select
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.estimatedBudget}
                      onChange={(e) => setFormData({ ...formData, estimatedBudget: e.target.value })}
                    >
                      <option value="">Select budget range</option>
                      <option value="$1,000 - $5,000">$1,000 - $5,000</option>
                      <option value="$5,000 - $15,000">$5,000 - $15,000</option>
                      <option value="$15,000 - $50,000">$15,000 - $50,000</option>
                      <option value="$50,000+">$50,000+</option>
                      <option value="Custom">Custom - Will discuss</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Clock className="w-4 h-4 inline mr-1" />
                      Preferred Timeline
                    </label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.preferredTimeline}
                      onChange={(e) => setFormData({ ...formData, preferredTimeline: e.target.value })}
                      placeholder="e.g., 2-3 weeks, End of Q2, ASAP"
                    />
                  </div>
                </div>
              </div>

              {/* Message and Context */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Describe Your Needs *
                  </label>
                  <textarea
                    required
                    rows={4}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.userMessage}
                    onChange={(e) => setFormData({ ...formData, userMessage: e.target.value })}
                    placeholder="Please describe what you need help with, your current situation, and any specific requirements..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Context
                  </label>
                  <textarea
                    rows={3}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.additionalContext}
                    onChange={(e) => setFormData({ ...formData, additionalContext: e.target.value })}
                    placeholder="Any additional information, existing security measures, compliance requirements, etc..."
                  />
                </div>
              </div>

              {/* Service Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">What happens next?</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Our cybersecurity experts will review your request within 24 hours</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <span>We'll schedule a consultation call to understand your specific needs</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <span>You'll receive a detailed proposal with timeline and pricing</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Our team begins work immediately after approval</span>
                  </div>
                </div>
              </div>

              {/* Error Display */}
              {actionsError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-red-700">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-sm">{actionsError}</span>
                  </div>
                </div>
              )}

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeActionModal}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !formData.userMessage || !formData.contactEmail}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Submit Request
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default AlertActionModal;
