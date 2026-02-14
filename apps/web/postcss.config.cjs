module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
},
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@crypto/*": ["../../packages/crypto/*"]
    }
  }
};