export default {
    '*.{json,md,css,scss}': ['prettier --write'],
    '*.{js,jsx,ts,tsx}': ['prettier --write', 'eslint --fix'],
};
