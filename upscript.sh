echo '' > pscript.js
echo 'const pScript = `' >> pscript.js
echo "$(cat digest.py)" >> pscript.js
echo '`;' >> pscript.js
echo 'module.exports = pScript;' >> pscript.js
sed -i -e 's/\\/\\\\/g' pscript.js
mv pscript.js GUI/mjs/pscript.js
