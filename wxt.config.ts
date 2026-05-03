import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  srcDir: 'src',
  suppressWarnings: {
    firefoxDataCollection: true,
  },
  manifest: {
    name: 'Email Makinator',
    permissions: ['storage'],
    host_permissions: [
      'http://localhost/*',
      'http://127.0.0.1/*',
      'https://api.mkgpdev.xyz/*',
    ],
    browser_specific_settings: {
      gecko: {
        id: 'email-makinator@mkgpdev.xyz',
        data_collection_permissions: {
          required: ['personalCommunications'],
          optional: ['authenticationInfo'],
        },
      },
    },
  },
  modules: ['@wxt-dev/module-react'],
  vite: () => ({
    plugins: [tailwindcss()],
  }),
});
