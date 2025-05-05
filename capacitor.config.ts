import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'sn.itcreative.faydah',
  appName: 'faydah',
  webDir: 'www',
  plugins: {
    StatusBar: {
      style: "light",
      backgroundColor: "#ffffff",
      overlaysWebView: false,
    },
  },
};

export default config;
