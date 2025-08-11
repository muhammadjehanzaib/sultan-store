#!/usr/bin/env node

// Simple debug script to check notification system
console.log('🔍 Debugging SaudiSafety Notification System\n');

// Check environment variables
console.log('📧 Email Configuration:');
console.log('  RESEND_API_KEY:', process.env.RESEND_API_KEY ? '✅ Present' : '❌ Missing');
if (process.env.RESEND_API_KEY) {
  console.log('  Key starts with:', process.env.RESEND_API_KEY.substring(0, 10) + '...');
}
console.log('  SMTP_FROM_EMAIL:', process.env.SMTP_FROM_EMAIL || 'Not set');
console.log('  SMTP_FROM_NAME:', process.env.SMTP_FROM_NAME || 'Not set');

console.log('\n🗄️ Database Configuration:');
console.log('  DATABASE_URL:', process.env.DATABASE_URL ? '✅ Present' : '❌ Missing');

console.log('\n🔐 Auth Configuration:');
console.log('  NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? '✅ Present' : '❌ Missing');
console.log('  NEXTAUTH_URL:', process.env.NEXTAUTH_URL || 'Not set');

console.log('\n📋 Troubleshooting Tips:');
console.log('1. Make sure you\'re logged in when testing notifications');
console.log('2. Check your email spam/junk folder');
console.log('3. The "from" email should be onboarding@resend.dev for testing');
console.log('4. Verify your Resend API key is correct');
console.log('5. Check the browser console for notification creation logs');

console.log('\n🧪 Test URLs (when logged in):');
console.log('  Test Notification: POST http://localhost:3000/api/test-notification');
console.log('  Test Email: POST http://localhost:3000/api/test-email');

console.log('\n💡 Next Steps:');
console.log('1. Login to your app at http://localhost:3000');
console.log('2. Open browser dev tools (F12)');
console.log('3. Go to Console tab');
console.log('4. Run: fetch("/api/test-notification", {method: "POST"})');
console.log('5. Check the console for detailed logs');
console.log('6. Also try: fetch("/api/test-email", {method: "POST"})');
