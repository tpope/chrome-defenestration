ASSETS = background.js content.js icon128.png manifest.json

defenestration.zip: $(ASSETS)
	zip defenestration.zip $(ASSETS)

dist: defenestration.zip

default: dist
