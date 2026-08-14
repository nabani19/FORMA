import { runOmniLockTests } from './omniLockEngine.test';
import { runBergmanTests } from './bergman.test';

export function runMasterTestSuite() {
  console.log('=======================================================');
  console.log('🧪 STARTING MASTER AUTOMATED SUITE FOR TRACKER AI');
  console.log('=======================================================');

  try {
    runOmniLockTests();
    runBergmanTests();
    console.log('=======================================================');
    console.log('🎉 MASTER AUTOMATED SUITE VERIFIED: 100% PASSING!');
    console.log('=======================================================');
  } catch (err: any) {
    console.error('❌ AUTOMATED SUITE FAILURE:', err.message);
    throw err;
  }
}

// Auto-run if executed directly via tsx/node
if (typeof process !== 'undefined' && process.argv && process.argv[1]?.includes('runAllTests')) {
  runMasterTestSuite();
}
