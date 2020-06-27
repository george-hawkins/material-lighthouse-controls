Lighthouse icons
================

Using Google image search, I found and downloaded various lighthouse images.

Most of the images were PNGs, which I first cleaned up in Gimp and then converted to SVGs using Inkscape:

* _Path / Trace Bitmap... / Brightness cutoff_ with the defaults.
* _File / Document Properties... / Resize page to content_.
* Saved as _Plain SVG_.

I thought `width` and `height` and `viewBox` were important for achieving a 24px icon (all the icons in the standard Angular icon font have a `viewBox` that's 24x24) but they're not - one can leave these values alone.

Even using _Plain SVG_, the resulting SVGs are fairly large and contain all kinds of extraneous information. [SVGO](https://github.com/svg/svgo) produces SVG files that are much more suitable combining into a single icons file.

    $ npm install svgo
    $ mkdir min
    $ ~/git/material-lighthouse-controls/node_modules/svgo/bin/svgo *.svg -o min

The optimized SVGs end up in `min`.

SVGO did very well on images produced by _Trace Bitmap_ but not so well on existing SVG images - one could greatly improve things by manually editing the XML and:

* Removing unnecessary `id` and `class` attributes.
* Removing unnecessary `style` tags and attributes.
* Coalescing unnecessarily repeated `style` information into a single parent tag or attribute.

Also important was reducing the colors used down to just black, in some images white objects were overlayed on black objects instead of cutting holes - this kind of thing needed to be fixed in Inkscape.

Ideally, after SVGO has done it's work, you end up with no explicit colors, i.e. things like `stroke="#000"`, in the resulting SVG. This was the case for images produced with _Trace Bitmap_.

For images where it's not possible to eliminate all references to black, you either have to modify any black references to match the color you want when you use the icon or you can control things with CSS.

For some of the images, SVGO was too aggressive, `convertPathData` turned out to be the problem plugin.

So these problem cases were converted like so:

    $ ~/git/material-lighthouse-controls/node_modules/svgo/bin/svgo --disable=convertPathData 1.svg 2.svg 6.svg 7.svg 9.svg -o min

Note: Inkscape 0.92 can save files as [_Optimized SVG_](https://wiki.inkscape.org/wiki/index.php/Release_notes/0.92#Export_Optimized_SVG) using [Scour](https://github.com/scour-project/scour) (which does something similar to SVGO). I'm still using Inkscape 0.91, so I haven't compared the results of Scour vs SVGO.

The resulting minimized SVGs were then combined into a single icon file, using the [`combine.sh`](combine.sh) script found here, like so:

    $ cd min
    $ . ../combine.sh

And copied into the Angular project's source tree:

    $ cp icons.svg ../../src/assets/svg/icons.svg

Note: I changed the single reference to the color `#000` in `icons.svg` to `#fff` as I knew I just needed white icons.
