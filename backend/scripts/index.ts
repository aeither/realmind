const BASE_URL = 'http://localhost:3000';
const endpoints = [
  { method: 'GET', path: '/', name: 'Root' },
  { method: 'GET', path: '/health', name: 'Health Check' },
  { method: 'GET', path: '/random-info', name: 'Random Info' },
  { method: 'GET', path: '/quiz', name: 'Quiz Data' }
] as const;

const log = (msg: string, type: 'info' | 'success' | 'error' = 'info') => {
  const colors = { info: '\x1b[36mℹ️', success: '\x1b[32m✅', error: '\x1b[31m❌' };
  console.log(`${colors[type]} ${msg}\x1b[0m`);
};

const runTests = async () => {
  log('Starting API tests...', 'info');
  
  let allPassed = true;
  
  for (const { method, path, name } of endpoints) {
    try {
      const response = await fetch(`${BASE_URL}${path}`);
      const data = await response.json();
      
      if (response.ok) {
        log(`${name} (${path}): PASSED`, 'success');
        
        // Show sample data for AI endpoints
        if (path === '/random-info') {
          console.log(`  Content: "${data.info.substring(0, 80)}${data.info.length > 80 ? '...' : ''}"`);
        } else if (path === '/quiz') {
          console.log(`  Questions: ${data.quiz.questions.length}`);
        }
      } else {
        log(`${name} (${path}): FAILED - ${response.status}`, 'error');
        allPassed = false;
      }
    } catch (error) {
      log(`${name} (${path}): ERROR - ${(error as Error).message}`, 'error');
      allPassed = false;
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  log(allPassed ? '🎉 All tests passed!' : '❌ Some tests failed!', allPassed ? 'success' : 'error');
};

runTests().catch(console.error);