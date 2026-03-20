import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.blockvote.app',
  appName: 'BlockVote',
  webDir: 'out',
  server: {
    url: 'http://192.168.1.10:3000',
    cleartext: true
  }
};

export default config;
