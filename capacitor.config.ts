import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.rent.app',
  appName: 'Rent',
  webDir: 'public',
  server: {
    url: 'https://www.noyrentcos.my.id/login',
    cleartext: true,
    allowNavigation: ['10.30.1.15', 'localhost', '127.0.0.1', '10.0.2.2', '0.0.0.0'],
  },
  plugins: {
    PushNotifications: {
      // Present alerts, badges, and sounds when app is in foreground
      presentationOptions: ['alert', 'sound', 'badge'],
    },
    LocalNotifications: {
      smallIcon: 'ic_stat_notification',
      iconColor: 'var(--primary)',
      sound: 'default',
    },
  },
};

export default config;
