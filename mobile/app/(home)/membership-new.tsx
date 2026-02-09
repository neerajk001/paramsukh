import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../components/Header';

export default function MembershipScreen() {
  const [selectedPlan, setSelectedPlan] = useState('silver');
  const [pricingType, setPricingType] = useState<'regular' | 'offer'>('offer');

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
    },
    {
      id: 'silver',
      name: 'Silver',
      regularPrice: 30000,
      offerPrice: 16999,
      emoji: '🥈',
      color: '#C0C0C0',
      gradient: ['#F3F4F6', '#E5E7EB'],
      tagline: 'Most Popular',
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
    },
    {
      id: 'gold_2',
      name: 'Gold Grade 2',
      regularPrice: 50000,
      offerPrice: 27999,
      emoji: '🥇',
      color: '#FFD700',
      gradient: ['#FEF3C7', '#FCD34D'],
      tagline: 'Complete Learning',
      features: [
        { text: 'All 5 courses free', included: true },
        { text: 'Group follow-up for all courses', included: true },
        { text: 'Premium community features', included: true },
        { text: 'VIP event access', included: true },
        { text: 'Free membership counseling', included: true },
        { text: 'Enhanced bonus points (15 per achievement)', included: true },
        { text: 'Priority support', included: true },
      ],
      popular: false,
    },
    {
      id: 'gold_1',
      name: 'Gold Grade 1',
      regularPrice: null,
      offerPrice: null,
      emoji: '👑',
      color: '#F59E0B',
      gradient: ['#FEF3C7', '#FDE68A'],
      tagline: 'Premium Experience',
      features: [
        { text: 'All 5 courses free', included: true },
        { text: 'Bhagwan & Sidhha Chakra Maha Yantra', included: true },
        { text: 'Group follow-up for all courses', included: true },
        { text: 'Exclusive spiritual items', included: true },
        { text: 'Free 1-on-1 counseling with Gurudev', included: true },
        { text: 'Maximum bonus points (20 per achievement)', included: true },
        { text: 'Lifetime priority support', included: true },
      ],
      popular: false,
      specialPrice: 'Contact for pricing',
    },
    {
      id: 'diamond',
      name: 'Diamond',
      regularPrice: null,
      offerPrice: null,
      emoji: '💎',
      color: '#3B82F6',
      gradient: ['#EFF6FF', '#DBEAFE'],
      tagline: 'By Certification',
      levels: ['Contributor', 'Captain', 'Counselor', 'Commander'],
      features: [
        { text: 'All Gold Grade 1 benefits', included: true },
        { text: 'Selection by certification', included: true },
        { text: '4 progressive levels', included: true },
        { text: 'Leadership opportunities', included: true },
        { text: 'Advanced training programs', included: true },
        { text: 'Gurudev personal mentorship', included: true },
        { text: 'Exclusive Diamond events', included: true },
      ],
      popular: false,
      specialPrice: 'Certification required',
    },
    {
      id: 'patron',
      name: 'Patron',
      regularPrice: null,
      offerPrice: null,
      emoji: '🌟',
      color: '#8B5CF6',
      gradient: ['#F5F3FF', '#EDE9FE'],
      tagline: 'Generous Donors',
      donationRange: '₹3L - ₹25L',
      features: [
        { text: 'All Diamond benefits', included: true },
        { text: 'Donation: ₹3 Lakhs to ₹25 Lakhs', included: true },
        { text: 'Special recognition', included: true },
        { text: 'Annual patron gathering', included: true },
        { text: 'Custom spiritual programs', included: true },
        { text: 'Legacy documentation', included: true },
        { text: 'Exclusive patron privileges', included: true },
      ],
      popular: false,
      specialPrice: 'Donor tier',
    },
    {
      id: 'elite',
      name: 'Elite',
      regularPrice: null,
      offerPrice: null,
      emoji: '⭐',
      color: '#EC4899',
      gradient: ['#FDF2F8', '#FCE7F3'],
      tagline: 'Elite Donors',
      donationRange: 'Above ₹25L',
      features: [
        { text: 'All Patron benefits', included: true },
        { text: 'Donation: Above ₹25 Lakhs', included: true },
        { text: 'Highest recognition status', included: true },
        { text: 'Private events with Gurudev', included: true },
        { text: 'Personalized spiritual journey', included: true },
        { text: 'Elite council membership', included: true },
        { text: 'Legacy impact programs', included: true },
      ],
      popular: false,
      specialPrice: 'Elite donor tier',
    },
    {
      id: 'quantum',
      name: 'Quantum',
      regularPrice: null,
      offerPrice: null,
      emoji: '🔮',
      color: '#10B981',
      gradient: ['#ECFDF5', '#D1FAE5'],
      tagline: 'System Management',
      features: [
        { text: 'Policy & system management', included: true },
        { text: 'Organizational leadership', included: true },
        { text: 'Strategic planning involvement', included: true },
        { text: 'All Elite benefits', included: true },
        { text: 'Direct collaboration with leadership', included: true },
        { text: 'System-level decision making', included: true },
        { text: 'Lifetime honorary status', included: true },
      ],
      popular: false,
      specialPrice: 'By invitation only',
    },
  ];

  const getDisplayPrice = (plan: typeof plans[0]) => {
    if (plan.specialPrice) return plan.specialPrice;
    if (plan.donationRange) return plan.donationRange;
    const price = pricingType === 'regular' ? plan.regularPrice : plan.offerPrice;
    return price ? `₹${price.toLocaleString('en-IN')}` : 'Contact us';
  };

  const getSavings = (plan: typeof plans[0]) => {
    if (!plan.regularPrice || !plan.offerPrice) return 0;
    return Math.round(((plan.regularPrice - plan.offerPrice) / plan.regularPrice) * 100);
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
          </View>

          {/* Pricing Toggle */}
          <View className="flex-row bg-white rounded-xl p-1 mb-5 shadow-sm">
            <TouchableOpacity
              className={`flex-1 py-3 px-4 rounded-lg items-center ${
                pricingType === 'offer' ? 'bg-green-500' : ''
              }`}
              onPress={() => setPricingType('offer')}
            >
              <Text className={`text-[15px] font-semibold ${
                pricingType === 'offer' ? 'text-white' : 'text-gray-500'
              }`}>
                Offer Price
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 py-3 px-4 rounded-lg items-center ${
                pricingType === 'regular' ? 'bg-gray-800' : ''
              }`}
              onPress={() => setPricingType('regular')}
            >
              <Text className={`text-[15px] font-semibold ${
                pricingType === 'regular' ? 'text-white' : 'text-gray-500'
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
                className={`rounded-[20px] p-5 mb-4 shadow-lg relative ${
                  isSelected ? 'border-[3px] scale-[1.02]' : ''
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
                  {plan.levels && (
                    <Text className="text-xs text-purple-600 mt-1 font-semibold">
                      Levels: {plan.levels.join(', ')}
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
                      <Text className={`text-sm flex-1 ${
                        !feature.included ? 'text-gray-400 line-through' : 'text-gray-700'
                      }`}>
                        {feature.text}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Action Button */}
                <TouchableOpacity
                  className={`flex-row items-center justify-center gap-2 py-4 rounded-xl ${
                    isSelected ? '' : 'bg-white border-2'
                  }`}
                  style={isSelected ? { backgroundColor: plan.color } : { borderColor: plan.color }}
                >
                  <Text 
                    className="text-base font-bold"
                    style={{ color: isSelected ? '#FFFFFF' : plan.color }}
                  >
                    {plan.specialPrice 
                      ? 'Contact Us'
                      : isSelected 
                        ? 'Continue to Payment'
                        : 'Select Plan'}
                  </Text>
                  {isSelected && !plan.specialPrice && (
                    <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
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
