import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { purchaseMembership, MEMBERSHIP_PLANS } from '../../utils/paymentService';
import { useAuthStore } from '../../store/authStore';

export default function MembershipPlans() {
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const { token, user, refreshUser } = useAuthStore();

  const handlePurchase = async (planKey) => {
    try {
      setLoading(true);
      setSelectedPlan(planKey);
      
      const plan = MEMBERSHIP_PLANS[planKey];
      
      const result = await purchaseMembership(
        token,
        planKey,
        plan.price,
        {
          email: user?.email,
          phone: user?.phone,
          displayName: user?.displayName,
        }
      );
      
      if (result) {
        // Refresh user data to show new membership
        await refreshUser();
      }
      
    } catch (error) {
      console.error('Purchase error:', error);
    } finally {
      setLoading(false);
      setSelectedPlan(null);
    }
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-6">
        <Text className="text-3xl font-bold text-center mb-2">
          Choose Your Plan
        </Text>
        <Text className="text-gray-600 text-center mb-8">
          Unlock exclusive content and features
        </Text>

        {Object.entries(MEMBERSHIP_PLANS).map(([key, plan]) => (
          <View
            key={key}
            className="mb-6 border-2 rounded-2xl p-6"
            style={{ borderColor: plan.color }}
          >
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-2xl font-bold" style={{ color: plan.color }}>
                {plan.name}
              </Text>
              <View>
                <Text className="text-3xl font-bold">₹{plan.price}</Text>
                <Text className="text-gray-500 text-right">/year</Text>
              </View>
            </View>

            <View className="mb-6">
              {plan.features.map((feature, index) => (
                <View key={index} className="flex-row items-center mb-2">
                  <Text className="text-green-500 mr-2">✓</Text>
                  <Text className="text-gray-700">{feature}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              onPress={() => handlePurchase(key)}
              disabled={loading || user?.subscriptionPlan === key}
              className="py-4 rounded-xl items-center"
              style={{
                backgroundColor: 
                  user?.subscriptionPlan === key 
                    ? '#E5E7EB' 
                    : loading && selectedPlan === key
                    ? '#9CA3AF'
                    : plan.color
              }}
            >
              {loading && selectedPlan === key ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-bold text-lg">
                  {user?.subscriptionPlan === key 
                    ? 'Current Plan' 
                    : 'Purchase Now'
                  }
                </Text>
              )}
            </TouchableOpacity>
          </View>
        ))}

        {user?.subscriptionPlan && (
          <View className="mt-6 p-4 bg-green-50 rounded-xl">
            <Text className="text-green-800 font-semibold text-center">
              ✓ You have {MEMBERSHIP_PLANS[user.subscriptionPlan]?.name} membership
            </Text>
            <Text className="text-green-600 text-center mt-1">
              Valid until: {new Date(user.subscriptionEndDate).toLocaleDateString()}
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
