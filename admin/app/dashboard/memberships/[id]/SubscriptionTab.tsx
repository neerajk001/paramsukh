"use client";

import { useState } from "react";
import { Calendar, Crown, AlertCircle, Edit2 } from "lucide-react";
import MembershipModal from "../MembershipModal";

interface User {
  _id: string;
  displayName: string;
  subscriptionPlan: string;
  subscriptionStatus: string;
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
  trialEndsAt?: string;
}

interface SubscriptionTabProps {
  user: User;
  onUpdate: () => void;
}

export default function SubscriptionTab({ user, onUpdate }: SubscriptionTabProps) {
  const [showModal, setShowModal] = useState(false);

  const getPlanDetails = (plan: string) => {
    const details: Record<string, { courses: string; features: string[] }> = {
      free: { 
        courses: 'No paid courses', 
        features: ['Free content access', '14-day trial'] 
      },
      bronze: { 
        courses: '1 course - Physical Wellness', 
        features: ['Physical Wellness course', 'Community access', '1-on-1 counseling'] 
      },
      copper: { 
        courses: '3 courses', 
        features: ['Physical Wellness', 'Spirituality & Mantra Yoga', 'Mental Wellness', 'Community groups'] 
      },
      silver: { 
        courses: '5 courses - All basic', 
        features: ['All basic courses', 'Physical, Mental, Financial, Relationship, Spirituality', 'Full community access'] 
      },
      gold2: { 
        courses: 'Unlimited', 
        features: ['All courses', 'Priority support', 'Exclusive events'] 
      },
      gold1: { 
        courses: 'Unlimited', 
        features: ['All courses', 'Priority support', 'Exclusive events'] 
      },
      diamond: { 
        courses: 'Unlimited', 
        features: ['All courses', 'VIP support', 'Private sessions'] 
      },
      patron: { 
        courses: 'Unlimited', 
        features: ['All courses', 'Patron benefits', 'Early access'] 
      },
      elite: { 
        courses: 'Unlimited', 
        features: ['All courses', 'Elite benefits', 'Premium content'] 
      },
      quantum: { 
        courses: 'Unlimited', 
        features: ['Everything included', 'Highest tier benefits', 'Exclusive perks'] 
      },
    };
    return details[plan] || details.free;
  };

  const handleModalClose = () => {
    setShowModal(false);
    onUpdate();
  };

  const planDetails = getPlanDetails(user.subscriptionPlan);
  const isActive = user.subscriptionStatus === 'active';
  const isTrial = user.subscriptionStatus === 'trial';
  const daysRemaining = user.subscriptionEndDate 
    ? Math.floor((new Date(user.subscriptionEndDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;
  const trialDaysRemaining = user.trialEndsAt
    ? Math.floor((new Date(user.trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Current Plan</h3>
            </div>
            <p className="text-3xl font-bold text-blue-600 mb-2">
              {user.subscriptionPlan.toUpperCase()}
            </p>
            <p className="text-sm text-gray-700 mb-4">{planDetails.courses}</p>
            <div className="space-y-1">
              {planDetails.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-gray-700">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                  {feature}
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors border border-blue-200 flex items-center gap-2"
          >
            <Edit2 className="w-4 h-4" />
            Edit Plan
          </button>
        </div>
      </div>

      {/* Status Alert */}
      {isActive && daysRemaining !== null && daysRemaining < 30 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-yellow-900">Subscription Expiring Soon</p>
            <p className="text-sm text-yellow-700 mt-1">
              This subscription will expire in {daysRemaining} days on{' '}
              {new Date(user.subscriptionEndDate!).toLocaleDateString()}.
            </p>
          </div>
        </div>
      )}

      {isTrial && trialDaysRemaining !== null && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-blue-900">Trial Period Active</p>
            <p className="text-sm text-blue-700 mt-1">
              Trial ends in {trialDaysRemaining} days on{' '}
              {new Date(user.trialEndsAt!).toLocaleDateString()}.
            </p>
          </div>
        </div>
      )}

      {/* Subscription Details */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <h4 className="font-medium text-gray-900">Subscription Status</h4>
          </div>
          <p className="text-2xl font-bold text-gray-900 capitalize">
            {user.subscriptionStatus}
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <h4 className="font-medium text-gray-900">Plan Type</h4>
          </div>
          <p className="text-2xl font-bold text-gray-900 uppercase">
            {user.subscriptionPlan}
          </p>
        </div>

        {user.subscriptionStartDate && (
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h4 className="font-medium text-gray-900 mb-2">Start Date</h4>
            <p className="text-lg text-gray-700">
              {new Date(user.subscriptionStartDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        )}

        {user.subscriptionEndDate && (
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h4 className="font-medium text-gray-900 mb-2">End Date</h4>
            <p className="text-lg text-gray-700">
              {new Date(user.subscriptionEndDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
            {daysRemaining !== null && (
              <p className="text-sm text-gray-500 mt-1">
                {daysRemaining > 0 ? `${daysRemaining} days remaining` : 'Expired'}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Membership Modal */}
      {showModal && (
        <MembershipModal
          user={user}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
}
