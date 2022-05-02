debug := DEBUG=axios,page-loader,nock.common

install:
	npm ci

run:
	$(debug) bin/page-loader.js $(url) $(output)

publish:
	npm publish --dry-run

lint:
	npx eslint .

lint-fix:
	npx eslint . --fix

test:
	npm test

test-debug:
	$(debug) npm test

test-watch:
	npm test -- --watch

test-coverage:
	npm test -- --coverage --coverageProvider=v8
