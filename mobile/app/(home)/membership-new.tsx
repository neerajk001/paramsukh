import React, { useState, useEffect } from 'react';
import { ScrollView, Text, TouchableOpacity, View, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../components/Header';
import { useMembershipStore } from '../../store/membershipStore';
import { useRouter } from 'expo-router';

export default function MembershipScreen() {
  const router = useRouter();
  const { currentSubscription, isLoading, isPurchasing, fetchCurrentSubscription, purchaseMembership, error } = useMembershipStore();

  const [selectedPlan, setSelectedPlan] = useState('silver');
  const [pricingType, setPricingType] = useState<'regular' | 'offer'>('offer');

  useEffect(() => {
    fetchCurrentSubscription();
  }, []);

  // Only show 3 plans as per backend support

  const plans = [
    {
      id: 'bronze',
      name: 'Bronze',
      regularPrice: 5000,
      offerPrice: 2999,
      emoji: '🥉',
      color: '#CD7F32',
      gradient: ['#FEF3C7', '#FDE68A'],
      tagline: 'Begin Your Journey',
      features: [
        { text: '1 basic course: Physical Wellness', included: true },
        { text: 'Group follow-up for enrolled course', included: true },
        { text: 'Community access', included: true },
        { text: 'Event attendance', included: true },
        { text: 'Free membership counseling', included: true },
        { text: '3 courses access', included: false },
        { text: 'All 5 courses', included: false },
      ],
      popular: false,
      courseAccess: ['Physical Wellness']
    },
    {
      id: 'copper',
      name: 'Copper',
      regularPrice: 10000,
      offerPrice: 5999,
      emoji: '🔶',
      color: '#B87333',
      gradient: ['#FED7AA', '#FDBA74'],
      tagline: 'Expand Your Path',
      features: [
        { text: '3 basic courses: Physical, Spirituality & Mantra Yoga, Mental Wellness', included: true },
        { text: 'Group follow-up for all courses', included: true },
        { text: 'Community premium access', included: true },
        { text: 'Priority event booking', included: true },
        { text: 'Free membership counseling', included: true },
        { text: 'Bonus points on achievements', included: true },
        { text: 'All 5 courses', included: false },
      ],
      popular: false,
      courseAccess: ['Physical Wellness', 'Spirituality & Mantra Yoga', 'Mental Wellness']
    },
    {
      id: 'silver',
      name: 'Silver',
      regularPrice: 30000,
      offerPrice: 16999,
      emoji: '🥈',
      color: '#C0C0C0',
      gradient: ['#F3F4F6', '#E5E7EB'],
      tagline: 'Most Popular - All Courses Included',
      features: [
        { text: 'All 5 basic courses included', included: true },
        { text: 'Group follow-up for all courses', included: true },
        { text: 'Community premium access', included: true },
        { text: 'Priority event booking', included: true },
        { text: 'Free membership counseling', included: true },
        { text: 'Bonus points on achievements', included: true },
        { text: 'Advanced course access', included: true },
      ],
      popular: true,
      courseAccess: ['All 5 Courses']
    }
  ];

  const getDisplayPrice = (plan: typeof plans[0]) => {
    const price = pricingType === 'regular' ? plan.regularPrice : plan.offerPrice;
    return `₹${price.toLocaleString('en-IN')}`;
  };

  const getSavings = (plan: typeof plans[0]) => {
    if (!plan.regularPrice || !plan.offerPrice) return 0;
    return Math.round(((plan.regularPrice - plan.offerPrice) / plan.regularPrice) * 100);
  };

  const handlePurchase = async (plan: typeof plans[0]) => {
    // Check if user already has this plan or higher
    if (currentSubscription?.plan === plan.id && currentSubscription?.status === 'active') {
      Alert.alert('Already Subscribed', `You already have the ${plan.name} plan!`);
      return;
    }

    // Mock Razorpay payment for testing
    Alert.alert(
      'Confirm Purchase',
      `Purchase ${plan.name} plan for ${getDisplayPrice(plan)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Pay Now (Test)',
          onPress: async () => {
            // Mock payment ID (in production, this would come from Razorpay)
            const mockPaymentId = `pay_test_${Date.now()}`;

            const success = await purchaseMembership(plan.id, mockPaymentId);

            if (success) {
              Alert.alert(
                'Success! 🎉',
                `You've successfully purchased the ${plan.name} plan!\n\n` +
                `✅ Enrolled in courses\n` +
                `✅ Added to community groups\n` +
                `✅ Full access activated`,
                [
                  {
                    text: 'View Courses',
                    onPress: () => router.push('/(home)/courses')
                  },
                  {
                    text: 'OK',
                    style: 'cancel'
                  }
                ]
              );
            } else {
              Alert.alert('Error', error || 'Failed to complete purchase. Please try again.');
            }
          }
        }
      ]
    );
  };

  const isPlanActive = (planId: string) => {
    return currentSubscription?.plan === planId && currentSubscription?.status === 'active';
  };

  return (
    <View className="flex-1 bg-gray-50">
      <Header />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="p-4">
          {/* Header */}
          <View className="items-center mb-6 py-4">
            <Text className="text-5xl mb-3">🙏</Text>
            <Text className="text-[28px] font-extrabold text-gray-900 mb-2">Namo Jinanam</Text>
            <Text className="text-[15px] text-gray-500 text-center leading-[22px] px-5">
              Choose your membership tier and unlock your spiritual potential
            </Text>

            {/* Current Subscription Badge */}
            {isLoading ? (
              <ActivityIndicator size="small" color="#3B82F6" style={{ marginTop: 12 }} />
            ) : currentSubscription?.status === 'active' && (
              <View className="mt-3 bg-green-100 px-4 py-2 rounded-full flex-row items-center gap-2">
                <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                <Text className="text-green-700 font-semibold text-sm">
                  Active: {currentSubscription.plan.charAt(0).toUpperCase() + currentSubscription.plan.slice(1)} Plan
                </Text>
              </View>
            )}
          </View>

          {/* Pricing Toggle */}
          <View className="flex-row bg-white rounded-xl p-1 mb-5 shadow-sm">
            <TouchableOpacity
              className={`flex-1 py-3 px-4 rounded-lg items-center ${pricingType === 'offer' ? 'bg-green-500' : ''
                }`}
              onPress={() => setPricingType('offer')}
            >
              <Text className={`text-[15px] font-semibold ${pricingType === 'offer' ? 'text-white' : 'text-gray-500'
                }`}>
                Offer Price
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 py-3 px-4 rounded-lg items-center ${pricingType === 'regular' ? 'bg-gray-800' : ''
                }`}
              onPress={() => setPricingType('regular')}
            >
              <Text className={`text-[15px] font-semibold ${pricingType === 'regular' ? 'text-white' : 'text-gray-500'
                }`}>
                Regular Price
              </Text>
            </TouchableOpacity>
          </View>

          {/* Special Features Banner */}
          <View className="bg-gradient-to-r from-purple-500 to-pink-500 bg-purple-100 rounded-2xl p-4 mb-5 border-2 border-purple-300">
            <View className="flex-row items-center gap-2 mb-2">
              <Ionicons name="gift" size={20} color="#8B5CF6" />
              <Text className="text-base font-bold text-purple-900">Membership Benefits</Text>
            </View>
            <Text className="text-sm text-purple-700 leading-5">
              • Group follow-up for all courses{'\n'}
              • Free membership counseling by support team{'\n'}
              • 1-on-1 counseling with Gurudev (₹999/-){'\n'}
              • 10 bonus points per achievement{'\n'}
              • Rewards & gifts for bonus points
            </Text>
          </View>

          {/* Plan Cards */}
          {plans.map((plan) => {
            const isSelected = selectedPlan === plan.id;
            const displayPrice = getDisplayPrice(plan);

            return (
              <TouchableOpacity
                key={plan.id}
                activeOpacity={0.9}
                onPress={() => setSelectedPlan(plan.id)}
                className={`rounded-[20px] p-5 mb-4 shadow-lg relative ${isSelected ? 'border-[3px] scale-[1.02]' : ''
                  }`}
                style={{
                  backgroundColor: plan.gradient[0],
                  borderColor: isSelected ? plan.color : undefined,
                }}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <View
                    className="absolute top-4 right-4 flex-row items-center gap-1 px-2.5 py-1.5 rounded-[20px]"
                    style={{ backgroundColor: plan.color }}
                  >
                    <Ionicons name="star" size={12} color="#FFFFFF" />
                    <Text className="text-white text-[10px] font-extrabold tracking-wider">RECOMMENDED</Text>
                  </View>
                )}

                {/* Plan Header */}
                <View className="flex-row justify-between items-center mb-4">
                  <View className="flex-row items-center gap-3">
                    <Text className="text-4xl">{plan.emoji}</Text>
                    <View>
                      <Text className="text-[22px] font-extrabold text-gray-900">{plan.name}</Text>
                      <Text className="text-xs text-gray-500 mt-0.5">{plan.tagline}</Text>
                    </View>
                  </View>
                  {isSelected && (
                    <View
                      className="w-8 h-8 rounded-full items-center justify-center"
                      style={{ backgroundColor: plan.color }}
                    >
                      <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                    </View>
                  )}
                </View>

                {/* Price */}
                <View className="mb-5">
                  <View className="flex-row items-baseline flex-wrap">
                    <Text className="text-3xl font-black" style={{ color: plan.color }}>{displayPrice}</Text>
                    {plan.regularPrice && plan.offerPrice && pricingType === 'regular' && (
                      <View className="ml-2 bg-red-100 px-2 py-1 rounded-lg">
                        <Text className="text-xs font-bold text-red-600">
                          Save {getSavings(plan)}%
                        </Text>
                      </View>
                    )}
                  </View>
                  {plan.regularPrice && plan.offerPrice && (
                    <Text className="text-xs text-gray-500 mt-1">
                      {pricingType === 'offer'
                        ? `Regular: ₹${plan.regularPrice.toLocaleString('en-IN')}`
                        : `Offer: ₹${plan.offerPrice.toLocaleString('en-IN')}`
                      }
                    </Text>
                  )}
                </View>

                {/* Features */}
                <View className="gap-2.5 mb-5">
                  {plan.features.map((feature, idx) => (
                    <View key={idx} className="flex-row items-center gap-2.5">
                      <View
                        className="w-5 h-5 rounded-full items-center justify-center"
                        style={{ backgroundColor: feature.included ? plan.color : '#E5E7EB' }}
                      >
                        <Ionicons
                          name={feature.included ? "checkmark" : "close"}
                          size={12}
                          color="#FFFFFF"
                        />
                      </View>
                      <Text className={`text-sm flex-1 ${!feature.included ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                        {feature.text}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Action Button */}
                <TouchableOpacity
                  className={`flex-row items-center justify-center gap-2 py-4 rounded-xl ${isPlanActive(plan.id) ? 'bg-green-500' : isSelected ? '' : 'bg-white border-2'
                    }`}
                  style={isPlanActive(plan.id) ? {} : isSelected ? { backgroundColor: plan.color } : { borderColor: plan.color }}
                  onPress={() => isPlanActive(plan.id) ? null : handlePurchase(plan)}
                  disabled={isPurchasing || isPlanActive(plan.id)}
                >
                  {isPurchasing && isSelected ? (
                    <ActivityIndicator color={isSelected ? '#FFFFFF' : plan.color} />
                  ) : (
                    <>
                      <Text
                        className="text-base font-bold"
                        style={{ color: isPlanActive(plan.id) ? '#FFFFFF' : isSelected ? '#FFFFFF' : plan.color }}
                      >
                        {isPlanActive(plan.id)
                          ? '✓ Active Plan'
                          : isSelected
                            ? 'Purchase Now'
                            : 'Select Plan'}
                      </Text>
                      {isSelected && !isPlanActive(plan.id) && (
                        <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                      )}
                    </>
                  )}
                </TouchableOpacity>
              </TouchableOpacity>
            );
          })}

          {/* Counseling Info */}
          <View className="bg-white rounded-2xl p-5 mt-3 mb-4">
            <View className="flex-row items-center gap-2 mb-3">
              <Ionicons name="people" size={22} color="#3B82F6" />
              <Text className="text-lg font-bold text-gray-900">One-to-One Counseling</Text>
            </View>
            <View className="gap-2">
              <View className="flex-row items-start gap-2">
                <Text className="text-green-600 font-bold">✓</Text>
                <Text className="text-sm text-gray-700 flex-1">
                  <Text className="font-semibold">Membership Counseling</Text> - Free by support team
                </Text>
              </View>
              <View className="flex-row items-start gap-2">
                <Text className="text-green-600 font-bold">✓</Text>
                <Text className="text-sm text-gray-700 flex-1">
                  <Text className="font-semibold">Physical/Financial/Relationship Wellness</Text> - As required
                </Text>
              </View>
              <View className="flex-row items-start gap-2">
                <Text className="text-purple-600 font-bold">⭐</Text>
                <Text className="text-sm text-gray-700 flex-1">
                  <Text className="font-semibold">Counseling with Gurudev</Text> - ₹999/-
                </Text>
              </View>
            </View>
          </View>

          {/* Benefits Section */}
          <View className="bg-white rounded-2xl p-5 mt-3">
            <Text className="text-lg font-bold text-gray-900 mb-4 text-center">All Memberships Include</Text>
            <View className="flex-row flex-wrap gap-4">
              <View className="w-[47%] items-center gap-2 p-3 bg-gray-50 rounded-xl">
                <Ionicons name="trophy" size={24} color="#F59E0B" />
                <Text className="text-xs font-semibold text-gray-500 text-center">Bonus Points System</Text>
              </View>
              <View className="w-[47%] items-center gap-2 p-3 bg-gray-50 rounded-xl">
                <Ionicons name="gift" size={24} color="#EC4899" />
                <Text className="text-xs font-semibold text-gray-500 text-center">Rewards & Gifts</Text>
              </View>
              <View className="w-[47%] items-center gap-2 p-3 bg-gray-50 rounded-xl">
                <Ionicons name="people" size={24} color="#3B82F6" />
                <Text className="text-xs font-semibold text-gray-500 text-center">Group Follow-up</Text>
              </View>
              <View className="w-[47%] items-center gap-2 p-3 bg-gray-50 rounded-xl">
                <Ionicons name="chatbubbles" size={24} color="#10B981" />
                <Text className="text-xs font-semibold text-gray-500 text-center">Free Counseling</Text>
              </View>
            </View>
          </View>

          <View className="h-10" />
        </View>
      </ScrollView>
    </View>
  );
}
