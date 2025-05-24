import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.xjobs.admin',
  appName: 'XJobs Admin',
  webDir: 'dist/app/browser',
  plugins: {
    SplashScreen: {
      backgroundColor: '#ffffff',
    }
  }
};

export default config;
