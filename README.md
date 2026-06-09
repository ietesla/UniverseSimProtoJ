# UniverseSimProtoJ

A real-time interactive starscape running in the browser. No installs, no build step.

## How to Run

Download all the files, keep them in the same folder, and open `index.html` in your browser. That's it.

> Note: some browsers block local file access for security reasons. If nothing shows up, run it through a simple local server instead:
> `npx serve .` or use the Live Server extension in VS Code.

## Features

### Stars
Procedurally generated stars across 6 depth layers with parallax. Stars cluster naturally using gaussian scatter around randomly placed cluster centers. Each star twinkles independently and transitions smoothly when the color theme changes.

### Color Themes
8 themes: White, Default, Aurora, Ember, Void, Rose, Toxic, and Custom. Switching themes smoothly interpolates star colors, background, mist tint, trail color, and constellation color all at once. The Custom theme lets you mix any RGB color with three sliders.

### Cosmic Mist
Soft elliptical nebula patches that drift with parallax behind the stars.

### Galaxies
12 randomly placed galaxies rendered in 4 types: spiral, barred spiral, elliptical, and irregular. Spiral and barred types have individually placed arm particles baked at startup.

### Nebula Clouds
Colored radial clouds layered between the mist and stars. Toggled separately from cosmic mist.

### Constellations
Stars from one of the mid-depth layers get connected into constellation shapes. Lines shimmer and glimmer independently. An optional Zippers mode sends a glowing particle traveling along each constellation edge.

### Events
A scheduler that fires space events over time. Three types are available and can be toggled independently:
- Comets fly across the screen with a gradient tail and glowing head
- Supernovae play through a 4-phase animation: flash, expand, ring, fade
- Satellites cross the screen as small blinking dots with a faint glow

### Drawing Mode
Hold the mouse button down to create a glowing star that emits a light trail. Release for a burst flash with radial spikes. Connect mode links new strokes to the previous one instead of starting fresh. Trail length is adjustable via slider.

### Mouse Look
The entire starfield parallaxes based on mouse position, giving a 3D depth feel.

### Scroll Mode
Auto-scrolls the starfield horizontally. Speed is adjustable and can go negative to reverse direction.

### Randomize
Regenerates stars, mist, galaxies, nebulas, and constellations all at once while keeping your current settings.
