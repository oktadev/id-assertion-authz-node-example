/** @type {import('tailwindcss').Config} */
const flowbite = require('flowbite-react/tailwind');

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    '../node_modules/flowbite/**/*.mjs',
    '../node_modules/flowbite-react/dist/esm/**/*.mjs',
  ],
  theme: {
    extend: {},
  },
  plugins: [flowbite.plugin()],
};
