/** @type {import('tailwindcss').Config} */
const flowbite = require('flowbite/plugin');

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    '../node_modules/flowbite/**/*.js',
    '../node_modules/flowbite-react/lib/esm/**/*.js',
  ],
  theme: {
    extend: {},
  },
  plugins: [flowbite],
};
