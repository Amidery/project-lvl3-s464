install:
	npm install

lint:
	npx eslint .

build:
	rm -rf dist
	NODE_ENV=production npx webpack

develop:
	npx webpack-dev-server