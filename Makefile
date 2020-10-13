install:
		npm install

lint:
		npx eslint .

test:
		npm test

build:
		rm -rf dist
		NODE_ENV=production npx webpack

develop:
		npx webpack serve