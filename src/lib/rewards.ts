import { supabase } from '@/integrations/supabase/client';

type RewardActivity =
  | 'food_log'
  | 'poop_log'
  | 'supplement_log'
  | 'measurement_log'
  | 'photo_upload';

export async function awardActivityCredit(
  activity: RewardActivity,
  metadata?: Record<string, unknown>,
) {
  try {
    await supabase.rpc('reward_for_activity', {
      activity_name: activity,
      event_metadata: metadata ?? {},
    });
  } catch (error) {
    console.error('Failed to award credits', error);
  }
}

export async function spendCredits(amount: number, reason: string, metadata?: Record<string, unknown>) {
  try {
    await supabase.rpc('spend_credits', {
      spend_amount: amount,
      spend_reason: reason,
      event_metadata: metadata ?? {},
    });
  } catch (error) {
    console.error('Failed to spend credits', error);
    throw error;
  }
}
