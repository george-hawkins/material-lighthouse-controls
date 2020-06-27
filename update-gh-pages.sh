rm -rf dist
ng build --prod --base-href https://george-hawkins.github.io/material-lighthouse-controls/
git checkout gh-pages
git reset --hard HEAD~1
cp -r dist/lighthouse-controls/* .
git add .
git commit -m 'Added production build.'
git push --force-with-lease
git checkout master
