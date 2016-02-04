
# Patterns matching JS files that should be minified. Files with a -min.js
# suffix will be ignored.
# JS_FILES = src/missttape.js src/track.js

# The main shebang
all : dist/missttape.js 

# Concatenate our .js files
dist/missttape.js : src/missttape.js src/track.js
	mkdir dist
	cat $^ > $@

# Minify our main missttape file
#dist/missttape.min.js: dist/missttape.js
#	minify $< >$@

# target: clean - Removes minified JS files.
clean:
	rm -r dist

# target: help - Displays help.
help:
	@egrep "^# target:" makefile
