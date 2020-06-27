for svg in *.svg
do
    id=lighthouse_${svg/.svg}
    sed -s \
        -e 's/\(<svg\>[^>]*\)\<xmlns="[^"]*"/\1/' \
        -e 's/\(<svg\>[^>]*\)\<width="[^"]*"/\1/' \
        -e 's/\(<svg\>[^>]*\)\<height="[^"]*"/\1/' \
        -e 's/\(<svg\>[^>]*\)\<id="[^"]*"/\1/' \
        -e "s/<svg\>/& id=\"$id\"/" \
        < $svg
done > tmp
echo "<svg><defs>$(< tmp)</defs></svg>" | xmllint --format - > icons.svg
rm tmp
