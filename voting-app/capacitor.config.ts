import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.blockvote.app',
  appName: 'BlockVote',
  webDir: 'out',
  server: {
    url: 'https://blockchain-voting-fingerprint.vercel.app',
    cleartext: true
  }
};

export default config;
