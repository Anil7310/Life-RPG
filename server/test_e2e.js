const BASE_URL = 'http://localhost:5001/api';

async function runTests() {
  console.log('--- STARTING LIFE RPG E2E API INTEGRATION TESTS ---');

  // 1. Health check
  const healthRes = await fetch(`${BASE_URL}/health`).then(r => r.json());
  console.log('✓ Health Check:', healthRes.status === 'ok' ? 'PASS' : 'FAIL');

  // 2. Guest Login
  const guestRes = await fetch(`${BASE_URL}/auth/guest`, { method: 'POST' }).then(r => r.json());
  console.log('✓ Guest Login:', guestRes.success ? 'PASS' : 'FAIL');
  const token = guestRes.token;

  // 3. User info
  const meRes = await fetch(`${BASE_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` }
  }).then(r => r.json());
  console.log('✓ Get Me Profile:', meRes.success && meRes.user.characterName === 'Valiant Hero' ? 'PASS' : 'FAIL');

  // 4. Get Initial Quests
  const questsRes = await fetch(`${BASE_URL}/quests`, {
    headers: { Authorization: `Bearer ${token}` }
  }).then(r => r.json());
  console.log(`✓ Fetched Initial Quests: ${questsRes.quests.length} quests found`);

  // 5. Create a new Quest
  const newQuestRes = await fetch(`${BASE_URL}/quests`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      title: 'Master Data Structures & Algorithms',
      description: 'Solve 2 hard LeetCode problems',
      category: 'intellect',
      difficulty: 'epic',
      isRecurring: false
    })
  }).then(r => r.json());
  console.log('✓ Create Quest:', newQuestRes.success ? 'PASS' : 'FAIL');
  const questId = newQuestRes.quest._id;

  // 6. Complete the quest and check RPG rewards & leveling
  const completeRes = await fetch(`${BASE_URL}/quests/${questId}/complete`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` }
  }).then(r => r.json());
  console.log('✓ Quest Completion:', completeRes.success ? 'PASS' : 'FAIL');
  console.log(`  Rewards: +${completeRes.rewards.xpGained} XP, +${completeRes.rewards.coinsGained} Coins`);
  console.log(`  Level Up Triggered: ${completeRes.rewards.didLevelUp ? `YES (Level ${completeRes.rewards.newLevel})` : 'NO'}`);
  console.log(`  Intellect Stat: ${completeRes.user.stats.intellect}`);

  // 7. Get Shop
  const shopRes = await fetch(`${BASE_URL}/shop`, {
    headers: { Authorization: `Bearer ${token}` }
  }).then(r => r.json());
  console.log(`✓ Shop Catalogue: ${shopRes.shop.presets.length} presets loaded`);

  // 8. Buy a theme
  const buyRes = await fetch(`${BASE_URL}/shop/buy`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ itemId: 'theme-forest' })
  }).then(r => r.json());
  console.log('✓ Buy Shop Theme:', buyRes.success ? 'PASS' : 'FAIL');

  // 9. Create Custom Real-Life Reward
  const customRewardRes = await fetch(`${BASE_URL}/shop/custom`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      title: '1 Hour Gaming Break',
      cost: 50,
      icon: '🎮'
    })
  }).then(r => r.json());
  console.log('✓ Create Custom IRL Reward:', customRewardRes.success ? 'PASS' : 'FAIL');

  // 10. Claim Custom Reward
  const claimRes = await fetch(`${BASE_URL}/shop/custom/${customRewardRes.reward._id}/claim`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }
  }).then(r => r.json());
  console.log('✓ Claim Custom Reward:', claimRes.success ? 'PASS' : 'FAIL');

  console.log('--- ALL E2E API TESTS COMPLETED SUCCESSFULLY! ---');
}

runTests().catch(console.error);
