import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.blockvote.app',
  appName: 'BlockVote',
  webDir: 'out',
  server: {
    url: 'http://172.20.168.28:3001',
    cleartext: true
  }
};

export default config;
