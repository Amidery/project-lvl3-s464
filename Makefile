install:
		npm install

start:
		npx babel-node -- src/bin/rssreader.js

publish: 
		npm publish

lint:
		npx eslint .

test:
		npm test