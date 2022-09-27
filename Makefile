default:
	echo "No target chosen"

publish:
	yarn build && npm version minor && npm publish
